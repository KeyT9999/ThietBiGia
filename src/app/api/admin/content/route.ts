import { NextResponse } from "next/server";
import { DEFAULT_SITE_CONTENT, parseSiteContent } from "@/lib/site-content";
import {
  createSupabaseServiceClient,
  getAdminUser,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { toYoutubeEmbedUrl } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Bạn cần đăng nhập admin." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Thiếu cấu hình Supabase trong biến môi trường server." },
      { status: 503 }
    );
  }

  try {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("site_content")
      .select("content, updated_at")
      .eq("id", "primary")
      .maybeSingle();
    if (error) throw error;
    const parsed = parseSiteContent(data?.content ?? DEFAULT_SITE_CONTENT);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Dữ liệu nội dung trong Supabase không đúng schema." },
        { status: 500 }
      );
    }
    return NextResponse.json({
      ok: true,
      content: parsed.data,
      updatedAt: data?.updated_at ?? null,
      source: data ? "supabase" : "defaults",
    });
  } catch (error) {
    console.error("Admin content read failed:", error);
    return NextResponse.json(
      { ok: false, error: "Không đọc được nội dung từ Supabase. Hãy kiểm tra migration và credentials." },
      { status: 503 }
    );
  }
}

export async function PUT(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Bạn cần đăng nhập admin." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Thiếu cấu hình Supabase trong biến môi trường server." },
      { status: 503 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON không hợp lệ." }, { status: 400 });
  }

  if (raw && typeof raw === "object" && Array.isArray((raw as { works?: unknown }).works)) {
    const input = raw as { [key: string]: unknown; works: unknown[] };
    const normalizedWorks: unknown[] = [];
    for (const work of input.works) {
      if (!work || typeof work !== "object") {
        normalizedWorks.push(work);
        continue;
      }
      const record = work as Record<string, unknown>;
      if (typeof record.videoEmbedUrl === "string" && record.videoEmbedUrl.trim()) {
        const embedUrl = toYoutubeEmbedUrl(record.videoEmbedUrl);
        if (!embedUrl) {
          return NextResponse.json(
            { ok: false, error: "Một dự án có link YouTube không hợp lệ." },
            { status: 400 }
          );
        }
        normalizedWorks.push({ ...record, videoEmbedUrl: embedUrl });
      } else {
        normalizedWorks.push(work);
      }
    }
    raw = { ...input, works: normalizedWorks };
  }

  const parsed = parseSiteContent(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Dữ liệu không hợp lệ.",
        issues: parsed.error.issues.slice(0, 12).map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  const crewSlugs = parsed.data.crew.map((member) => member.slug);
  const workSlugs = parsed.data.works.map((work) => work.slug);
  const serviceIds = parsed.data.contactServices.map((service) => service.id);
  const partnerIds = parsed.data.partnerOrganizations.map((organization) => organization.id);
  const memberPartnerIds = parsed.data.crew.flatMap((member) => (member.partnerOrganizations ?? []).map((organization) => organization.id));
  const allPartnerIds = [...partnerIds, ...memberPartnerIds];
  const workById = new Map(parsed.data.works.map((work) => [work.id, work]));
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (
    new Set(crewSlugs).size !== crewSlugs.length ||
    new Set(workSlugs).size !== workSlugs.length ||
    [...crewSlugs, ...workSlugs].some((slug) => !slugPattern.test(slug))
  ) {
    return NextResponse.json(
      { ok: false, error: "Slug phải là chữ thường/số, phân tách bằng dấu gạch ngang và không trùng." },
      { status: 400 }
    );
  }

  const hasInvalidPersonalProjectParticipants = parsed.data.crew.some((member) =>
    member.showcase.some((item) => {
      const participantSlugs = item.participantSlugs ?? [];
      return new Set(participantSlugs).size !== participantSlugs.length ||
        participantSlugs.some((slug) => slug === member.slug || !crewSlugs.includes(slug));
    })
  );
  if (hasInvalidPersonalProjectParticipants) {
    return NextResponse.json(
      { ok: false, error: "Thành viên được gắn trong dự án cá nhân phải tồn tại, không trùng và khác chủ dự án." },
      { status: 400 }
    );
  }

  if (
    new Set(serviceIds).size !== serviceIds.length ||
    new Set(allPartnerIds).size !== allPartnerIds.length ||
    parsed.data.works.some((work) => (work.partnerIds ?? []).some((id) => !partnerIds.includes(id))) ||
    parsed.data.crew.some((member) => {
      const availableForMember = new Set([...partnerIds, ...(member.partnerOrganizations ?? []).map((organization) => organization.id)]);
      return member.showcase.some((item) => (item.partnerIds ?? []).some((id) => !availableForMember.has(id)));
    })
  ) {
    return NextResponse.json(
      { ok: false, error: "Mã dịch vụ hoặc đơn vị đồng hành bị trùng, hoặc dự án đang gắn với đơn vị không tồn tại." },
      { status: 400 }
    );
  }

  const hasInvalidSharedSelection = parsed.data.crew.some((member) =>
    member.profileSharedWorkIds?.some((workId) =>
      !workById.get(workId)?.credits.some((credit) => credit.memberSlug === member.slug)
    )
  );
  if (hasInvalidSharedSelection) {
    return NextResponse.json(
      { ok: false, error: "Dự án chung trên profile phải là dự án đã gắn với thành viên." },
      { status: 400 }
    );
  }

  try {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("site_content")
      .upsert(
        { id: "primary", content: parsed.data, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      )
      .select("updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, content: parsed.data, updatedAt: data.updated_at });
  } catch (error) {
    console.error("Admin content write failed:", error);
    return NextResponse.json(
      { ok: false, error: "Không lưu được nội dung vào Supabase." },
      { status: 503 }
    );
  }
}
