import { NextResponse } from "next/server";
import { CrewMemberSchema, type CrewMember } from "@/data/schema";
import { DEFAULT_SITE_CONTENT, parseSiteContent } from "@/lib/site-content";
import { getMemberSession } from "@/lib/member-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MEMBER_EDITABLE_FIELDS = [
  "slug", "name", "nickname", "roleCategory", "roles", "roleTitle", "secondaryRoles", "bio",
  "avatar", "avatarAlt", "favoriteGear", "yearsActive", "location", "socials", "showcase",
  "profileSharedWorkIds", "profileProjectOrder",
] as const;

export async function GET() {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ ok: false, error: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
  try {
    const client = createSupabaseServiceClient();
    const { data, error } = await client.from("site_content").select("content, updated_at").eq("id", "primary").maybeSingle();
    if (error) throw error;
    const parsed = parseSiteContent(data?.content ?? DEFAULT_SITE_CONTENT);
    if (!parsed.success) throw new Error("Site content is invalid.");
    const profile = parsed.data.crew.find((member) => member.id === session.memberId);
    if (!profile) return NextResponse.json({ ok: false, error: "Hồ sơ này đã được quản trị viên gỡ khỏi website." }, { status: 404 });
    return NextResponse.json({
      ok: true,
      profile,
      works: parsed.data.works,
      crew: parsed.data.crew,
      updatedAt: data?.updated_at ?? null,
    });
  } catch (error) {
    console.error("Member profile read failed:", error);
    return NextResponse.json({ ok: false, error: "Không tải được profile từ Supabase." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ ok: false, error: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
  let body: { profile?: unknown; updatedAt?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Dữ liệu profile không hợp lệ." }, { status: 400 }); }
  if (!body.profile || typeof body.profile !== "object" || Array.isArray(body.profile)) {
    return NextResponse.json({ ok: false, error: "Thiếu thông tin profile." }, { status: 400 });
  }
  if (body.updatedAt !== null && typeof body.updatedAt !== "string") {
    return NextResponse.json({ ok: false, error: "Phiên bản nội dung không hợp lệ. Tải lại trang rồi thử lại." }, { status: 400 });
  }

  try {
    const client = createSupabaseServiceClient();
    const { data, error: readError } = await client.from("site_content").select("content, updated_at").eq("id", "primary").maybeSingle();
    if (readError) throw readError;
    const currentUpdatedAt = (data?.updated_at as string | undefined) ?? null;
    if (currentUpdatedAt !== body.updatedAt) {
      return NextResponse.json({ ok: false, error: "Nội dung website vừa được thay đổi bởi người khác. Hãy tải lại profile trước khi lưu để tránh ghi đè." }, { status: 409 });
    }
    const parsed = parseSiteContent(data?.content ?? DEFAULT_SITE_CONTENT);
    if (!parsed.success) throw new Error("Site content is invalid.");
    const currentProfile = parsed.data.crew.find((member) => member.id === session.memberId);
    if (!currentProfile) return NextResponse.json({ ok: false, error: "Hồ sơ này không còn tồn tại." }, { status: 404 });

    const incoming = body.profile as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    for (const field of MEMBER_EDITABLE_FIELDS) if (field in incoming) patch[field] = incoming[field];
    const profileResult = CrewMemberSchema.safeParse({ ...currentProfile, ...patch });
    if (!profileResult.success) {
      return NextResponse.json({ ok: false, error: "Một số trường profile chưa đúng định dạng. Hãy kiểm tra thông tin và thử lại." }, { status: 400 });
    }
    const nextProfile: CrewMember = profileResult.data;
    if (!nextProfile.name.trim() || nextProfile.name.length > 120 || nextProfile.roleTitle.length > 160 || nextProfile.bio.length > 5000) {
      return NextResponse.json({ ok: false, error: "Tên, chức danh hoặc phần giới thiệu đang quá dài hoặc bị bỏ trống." }, { status: 400 });
    }
    if (!nextProfile.roles.length || !nextProfile.roles.includes(nextProfile.roleCategory)) {
      return NextResponse.json({ ok: false, error: "Hãy chọn ít nhất một nhóm chuyên môn." }, { status: 400 });
    }
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(nextProfile.slug) || parsed.data.crew.some((member) => member.id !== currentProfile.id && member.slug === nextProfile.slug)) {
      return NextResponse.json({ ok: false, error: "Đường dẫn profile chỉ dùng chữ thường, số và dấu gạch ngang; cần khác các thành viên khác." }, { status: 400 });
    }
    if (nextProfile.showcase.length > 50 || nextProfile.showcase.some((item) => item.gallery && item.gallery.length > 80)) {
      return NextResponse.json({ ok: false, error: "Profile có quá nhiều dự án hoặc ảnh trong album." }, { status: 400 });
    }

    const eligible = parsed.data.works.filter((work) => work.credits.some((credit) => credit.memberSlug === currentProfile.slug));
    const selectedIds = nextProfile.profileSharedWorkIds ?? eligible.map((work) => work.id);
    if (selectedIds.some((id) => !eligible.some((work) => work.id === id))) {
      return NextResponse.json({ ok: false, error: "Chỉ có thể chọn dự án chung đã gắn với profile này." }, { status: 400 });
    }
    const allowedOrderIds = new Set([
      ...nextProfile.showcase.map((item) => item.id),
      ...eligible.filter((work) => selectedIds.includes(work.id)).map((work) => `work-${work.id}`),
    ]);
    if (nextProfile.profileProjectOrder?.some((id) => !allowedOrderIds.has(id))) {
      return NextResponse.json({ ok: false, error: "Thứ tự dự án có chứa bài không còn trên profile. Hãy tải lại rồi sắp xếp lại." }, { status: 400 });
    }

    const slugChanged = currentProfile.slug !== nextProfile.slug;
    const nameChanged = currentProfile.name !== nextProfile.name;
    const nextContent = {
      ...parsed.data,
      crew: parsed.data.crew.map((member) => member.id === session.memberId ? nextProfile : member),
      works: slugChanged ? parsed.data.works.map((work) => ({
        ...work,
        credits: work.credits.map((credit) => credit.memberSlug === currentProfile.slug ? { ...credit, memberSlug: nextProfile.slug } : credit),
      })) : parsed.data.works,
      moments: slugChanged || nameChanged ? parsed.data.moments.map((moment) => {
        const isTagged = moment.memberSlugs?.includes(currentProfile.slug) ?? false;
        return {
          ...moment,
          memberSlugs: slugChanged ? moment.memberSlugs?.map((slug) => slug === currentProfile.slug ? nextProfile.slug : slug) : moment.memberSlugs,
          memberNames: isTagged && nameChanged ? moment.memberNames?.map((name) => name === currentProfile.name ? nextProfile.name : name) : moment.memberNames,
        };
      }) : parsed.data.moments,
    };
    const validated = parseSiteContent(nextContent);
    if (!validated.success) return NextResponse.json({ ok: false, error: "Một số nội dung profile không hợp lệ." }, { status: 400 });
    const updatedAt = new Date().toISOString();
    const write = data
      ? client.from("site_content").update({ content: validated.data, updated_at: updatedAt }).eq("id", "primary").eq("updated_at", currentUpdatedAt)
      : client.from("site_content").insert({ id: "primary", content: validated.data, updated_at: updatedAt });
    const { data: saved, error } = await write.select("updated_at").maybeSingle();
    if (error && (error as { code?: string }).code === "23505") return NextResponse.json({ ok: false, error: "Nội dung website vừa được tạo ở nơi khác. Tải lại profile rồi thử lại." }, { status: 409 });
    if (error) throw error;
    if (!saved) return NextResponse.json({ ok: false, error: "Nội dung website vừa được lưu ở nơi khác. Tải lại profile rồi thử lại." }, { status: 409 });
    return NextResponse.json({ ok: true, profile: nextProfile, content: validated.data, updatedAt: saved.updated_at });
  } catch (error) {
    console.error("Member profile write failed:", error);
    return NextResponse.json({ ok: false, error: "Không lưu được profile. Hãy thử lại sau." }, { status: 503 });
  }
}
