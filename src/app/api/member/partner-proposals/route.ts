import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_SITE_CONTENT, parseSiteContent } from "@/lib/site-content";
import { getMemberSession } from "@/lib/member-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ProposalInputSchema = z.object({
  name: z.string().trim().min(1).max(180),
  logo: z.string().trim().max(2000).optional().default(""),
  website: z.string().trim().max(2000).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
}).strict();

function normalizeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSafeLink(value: string) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return value.startsWith("/") && !value.startsWith("//");
  }
}

export async function GET() {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ ok: false, error: "Phiên đăng nhập đã hết hạn." }, { status: 401 });

  try {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("partner_organization_proposals")
      .select("id, member_id, member_name, name, logo, website, description, status, review_note, approved_organization_id, reviewed_by, created_at, reviewed_at")
      .eq("member_id", session.memberId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw error;
    return NextResponse.json({ ok: true, proposals: data ?? [] });
  } catch (error) {
    console.error("Member partner proposal read failed:", error);
    return NextResponse.json({ ok: false, error: "Chưa tải được các đề xuất đơn vị đồng hành." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ ok: false, error: "Phiên đăng nhập đã hết hạn." }, { status: 401 });

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Thông tin đơn vị chưa hợp lệ." }, { status: 400 }); }
  const input = ProposalInputSchema.safeParse(raw);
  if (!input.success) return NextResponse.json({ ok: false, error: "Tên đơn vị bắt buộc; các trường khác không được vượt quá giới hạn cho phép." }, { status: 400 });
  if (!isSafeLink(input.data.logo) || !isSafeLink(input.data.website)) {
    return NextResponse.json({ ok: false, error: "Website và logo cần là đường dẫn http/https hợp lệ." }, { status: 400 });
  }

  try {
    const client = createSupabaseServiceClient();
    const [{ data: contentRow, error: contentError }, { data: pendingRows, error: pendingError }] = await Promise.all([
      client.from("site_content").select("content").eq("id", "primary").maybeSingle(),
      client.from("partner_organization_proposals").select("name, member_id").eq("status", "pending").limit(1000),
    ]);
    if (contentError) throw contentError;
    if (pendingError) throw pendingError;

    const parsed = parseSiteContent(contentRow?.content ?? DEFAULT_SITE_CONTENT);
    if (!parsed.success) throw new Error("Site content is invalid.");
    const member = parsed.data.crew.find((item) => item.id === session.memberId);
    if (!member) return NextResponse.json({ ok: false, error: "Hồ sơ thành viên không còn tồn tại." }, { status: 404 });

    const requestedName = normalizeName(input.data.name);
    if (parsed.data.partnerOrganizations.some((organization) => normalizeName(organization.name) === requestedName)) {
      return NextResponse.json({ ok: false, error: "Đơn vị này đã có trong danh sách chung. Bạn có thể chọn ngay trong dự án." }, { status: 409 });
    }
    const existingPending = pendingRows?.find((row) => normalizeName(row.name) === requestedName);
    if (existingPending) {
      return NextResponse.json({ ok: false, error: "Đơn vị này đang được gửi duyệt. Admin sẽ xem xét trước khi thêm vào danh sách chung." }, { status: 409 });
    }
    if ((pendingRows ?? []).filter((row) => row.member_id === session.memberId).length >= 10) {
      return NextResponse.json({ ok: false, error: "Bạn đang có 10 đề xuất chờ duyệt. Hãy đợi admin xử lý trước khi gửi thêm." }, { status: 429 });
    }

    const { data, error } = await client
      .from("partner_organization_proposals")
      .insert({
        member_id: session.memberId,
        member_name: member.nickname || member.name,
        name: input.data.name,
        logo: input.data.logo,
        website: input.data.website,
        description: input.data.description,
      })
      .select("id, member_id, member_name, name, logo, website, description, status, review_note, approved_organization_id, reviewed_by, created_at, reviewed_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, proposal: data }, { status: 201 });
  } catch (error) {
    console.error("Member partner proposal write failed:", error);
    return NextResponse.json({ ok: false, error: "Chưa gửi được đề xuất. Hãy thử lại sau." }, { status: 503 });
  }
}
