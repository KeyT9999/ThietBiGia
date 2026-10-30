import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { getPublicSiteContent } from "@/lib/site-content";

const BookingPayloadSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên hoặc thương hiệu").max(120),
  phone: z.string().trim().max(80).optional().default(""),
  zalo: z.string().trim().max(120).optional().default(""),
  email: z
    .union([
      z.string().trim().max(160).email("Email không hợp lệ"),
      z.literal(""),
    ])
    .optional()
    .default(""),
  dateInfo: z.string().trim().max(240).optional().default(""),
  services: z.array(z.string().trim().min(1)).min(1, "Vui lòng chọn ít nhất 1 hạng mục"),
  crewSlugs: z.array(z.string().trim()).max(16).optional().default([]),
  projectRef: z.string().trim().max(140).optional().default(""),
  brief: z.string().trim().max(3000).optional().default(""),
}).refine((data) => Boolean(data.phone || data.zalo || data.email), {
  message: "Vui lòng nhập ít nhất một phương thức liên hệ: SĐT, Zalo hoặc email.",
  path: ["phone"],
});

export async function POST(req: Request) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 }
    );
  }

  const parsed = BookingPayloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Thiếu thông tin bắt buộc.";
    return NextResponse.json({ ok: false, error: firstIssue }, { status: 400 });
  }

  const data = parsed.data;
  const siteContent = await getPublicSiteContent();
  const uniqueSlugs = Array.from(new Set(data.crewSlugs));
  const selectedCrew = uniqueSlugs
    .map((slug) => siteContent.crew.find((member) => member.slug === slug))
    .filter((member): member is NonNullable<typeof member> => Boolean(member));

  const refWork = data.projectRef
    ? siteContent.works.find((work) => work.slug === data.projectRef)
    : undefined;

  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const referenceCode = `TBG-${year}-${suffix}`;
  const createdAt = new Date().toISOString();

  const squadSummary =
    selectedCrew.length > 0
      ? selectedCrew.map((m) => `#${m.badgeNumber} ${m.name}`).join(", ")
      : "Producer Thiết Bị Gia đề xuất đội hình tối ưu";

  const record = {
    referenceCode,
    createdAt,
    name: data.name,
    phone: data.phone || null,
    zalo: data.zalo || null,
    email: data.email || null,
    contact: [
      data.phone ? `SĐT: ${data.phone}` : null,
      data.zalo ? `Zalo: ${data.zalo}` : null,
      data.email ? `Email: ${data.email}` : null,
    ]
      .filter(Boolean)
      .join(" • "),
    dateInfo: data.dateInfo || "Chưa ấn định",
    services: data.services,
    crewSlugs: selectedCrew.map((m) => m.slug),
    squadNames: selectedCrew.map((m) => m.name),
    projectRef: refWork ? refWork.title : data.projectRef || null,
    brief: data.brief,
  };

  const channelsNotified: string[] = [];

  // 1. Best-effort local Call Sheet audit log (safe no-op on read-only serverless FS)
  try {
    const logDir = path.join(process.cwd(), "data-templates");
    const logPath = path.join(logDir, "bookings-log.json");
    await fs.mkdir(logDir, { recursive: true });
    let existing: unknown[] = [];
    try {
      const prev = await fs.readFile(logPath, "utf8");
      const json = JSON.parse(prev);
      if (Array.isArray(json)) existing = json;
    } catch {
      existing = [];
    }
    existing.unshift(record);
    await fs.writeFile(logPath, JSON.stringify(existing.slice(0, 200), null, 2), "utf8");
    channelsNotified.push("local-callsheet-log");
  } catch {
    // Ignore write failure on ephemeral serverless environments
  }

  // 2. Optional Telegram Bot instant dispatch
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;
  const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
  const resendApiKey = process.env.RESEND_API_KEY;
  const bookingFromEmail = process.env.BOOKING_FROM_EMAIL;
  const bookingNotificationEmail = process.env.BOOKING_NOTIFICATION_EMAIL;

  const summaryText = [
    `🎬 CALL SHEET MỚI // ${referenceCode}`,
    `• Khách hàng: ${record.name}`,
    `• Số điện thoại: ${record.phone || "Chưa cung cấp"}`,
    `• Zalo: ${record.zalo || "Chưa cung cấp"}`,
    `• Email khách: ${record.email || "Chưa cung cấp"}`,
    `• Lịch & Địa điểm: ${record.dateInfo}`,
    `• Hạng mục: ${record.services.join(" | ")}`,
    `• Squad chỉ định (${selectedCrew.length}): ${squadSummary}`,
    record.projectRef ? `• Dự án tham chiếu: ${record.projectRef}` : null,
    record.brief ? `• Brief: ${record.brief}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const dispatches: Promise<void>[] = [];

  if (tgToken && tgChatId) {
    dispatches.push(
      fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: summaryText,
        }),
      })
        .then((r) => {
          if (r.ok) channelsNotified.push("telegram");
        })
        .catch(() => {})
    );
  }

  if (webhookUrl) {
    dispatches.push(
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: summaryText,
          text: summaryText,
          booking: record,
        }),
      })
        .then((r) => {
          if (r.ok) channelsNotified.push("webhook");
        })
        .catch(() => {})
    );
  }

  if (resendApiKey && bookingFromEmail && bookingNotificationEmail) {
    dispatches.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: bookingFromEmail,
          to: [bookingNotificationEmail],
          subject: `Đặt lịch mới ${referenceCode} — ${record.name}`,
          text: summaryText,
        }),
      })
        .then(async (response) => {
          if (response.ok) {
            channelsNotified.push("email");
            return;
          }

          const errorText = await response.text();
          console.error(
            `[booking] Resend notification failed (${response.status}):`,
            errorText.slice(0, 1000)
          );
        })
        .catch((error: unknown) => {
          console.error("[booking] Resend notification request failed:", error);
        })
    );
  }

  if (dispatches.length > 0) {
    await Promise.allSettled(dispatches);
  }

  return NextResponse.json({
    ok: true,
    referenceCode,
    createdAt,
    squadNames: selectedCrew.map((m) => m.name),
    channelsNotified,
  });
}
