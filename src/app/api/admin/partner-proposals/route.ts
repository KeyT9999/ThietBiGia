import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PartnerOrganizationSchema } from "@/data/schema";
import { DEFAULT_SITE_CONTENT, parseSiteContent } from "@/lib/site-content";
import { createSupabaseServiceClient, getAdminUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ReviewInputSchema = z.object({
  proposalId: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
  reviewNote: z.string().trim().max(1000).optional().default(""),
}).strict();

function normalizeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ ok: false, error: "Bạn cần đăng nhập admin." }, { status: 401 });

  try {
    const { data, error } = await createSupabaseServiceClient()
      .from("partner_organization_proposals")
      .select("id, member_id, member_name, name, logo, website, description, status, review_note, approved_organization_id, reviewed_by, created_at, reviewed_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw error;
    return NextResponse.json({ ok: true, proposals: data ?? [] });
  } catch (error) {
    console.error("Admin partner proposal read failed:", error);
    return NextResponse.json({ ok: false, error: "Chưa tải được hàng chờ đề xuất đơn vị." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ ok: false, error: "Bạn cần đăng nhập admin." }, { status: 401 });

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Thông tin duyệt chưa hợp lệ." }, { status: 400 }); }
  const input = ReviewInputSchema.safeParse(raw);
  if (!input.success) return NextResponse.json({ ok: false, error: "Thiếu mã đề xuất hoặc lựa chọn duyệt hợp lệ." }, { status: 400 });

  try {
    const client = createSupabaseServiceClient();
    const { data: proposal, error: proposalError } = await client
      .from("partner_organization_proposals")
      .select("id, member_id, member_name, name, logo, website, description, status, review_note, approved_organization_id, reviewed_by, created_at, reviewed_at")
      .eq("id", input.data.proposalId)
      .maybeSingle();
    if (proposalError) throw proposalError;
    if (!proposal) return NextResponse.json({ ok: false, error: "Đề xuất không còn tồn tại." }, { status: 404 });
    if (proposal.status !== "pending") return NextResponse.json({ ok: false, error: "Đề xuất này đã được xử lý." }, { status: 409 });

    const reviewedAt = new Date().toISOString();
    if (input.data.decision === "reject") {
      const { data: updated, error } = await client
        .from("partner_organization_proposals")
        .update({ status: "rejected", review_note: input.data.reviewNote, reviewed_by: user.id, reviewed_at: reviewedAt })
        .eq("id", proposal.id)
        .eq("status", "pending")
        .select("id, member_id, member_name, name, logo, website, description, status, review_note, approved_organization_id, reviewed_by, created_at, reviewed_at")
        .maybeSingle();
      if (error) throw error;
      if (!updated) return NextResponse.json({ ok: false, error: "Đề xuất vừa được xử lý ở nơi khác. Hãy tải lại danh sách." }, { status: 409 });
      return NextResponse.json({ ok: true, proposal: updated, organization: null });
    }

    const { data: siteRow, error: siteError } = await client
      .from("site_content")
      .select("content, updated_at")
      .eq("id", "primary")
      .maybeSingle();
    if (siteError) throw siteError;
    const parsed = parseSiteContent(siteRow?.content ?? DEFAULT_SITE_CONTENT);
    if (!parsed.success) throw new Error("Site content is invalid.");

    let organization = parsed.data.partnerOrganizations.find((item) => normalizeName(item.name) === normalizeName(proposal.name));
    if (!organization) {
      if (parsed.data.partnerOrganizations.length >= 300) {
        return NextResponse.json({ ok: false, error: "Danh mục đã đạt giới hạn 300 đơn vị. Hãy gỡ một đơn vị cũ rồi duyệt đề xuất này." }, { status: 409 });
      }
      const candidate = PartnerOrganizationSchema.parse({
        id: `partner-${randomUUID()}`,
        name: proposal.name,
        logo: proposal.logo,
        website: proposal.website,
        description: proposal.description,
      });
      const nextContent = { ...parsed.data, partnerOrganizations: [...parsed.data.partnerOrganizations, candidate] };
      const updatedAt = new Date().toISOString();
      const write = siteRow
        ? client.from("site_content").update({ content: nextContent, updated_at: updatedAt }).eq("id", "primary").eq("updated_at", siteRow.updated_at)
        : client.from("site_content").insert({ id: "primary", content: nextContent, updated_at: updatedAt });
      const { data: saved, error } = await write.select("updated_at").maybeSingle();
      if (error) throw error;
      if (!saved) return NextResponse.json({ ok: false, error: "Nội dung website vừa thay đổi. Hãy tải lại rồi duyệt lại đề xuất." }, { status: 409 });
      organization = candidate;
    }

    const { data: updated, error } = await client
      .from("partner_organization_proposals")
      .update({ status: "approved", approved_organization_id: organization.id, review_note: input.data.reviewNote, reviewed_by: user.id, reviewed_at: reviewedAt })
      .eq("id", proposal.id)
      .eq("status", "pending")
      .select("id, member_id, member_name, name, logo, website, description, status, review_note, approved_organization_id, reviewed_by, created_at, reviewed_at")
      .maybeSingle();
    if (error) throw error;
    if (!updated) return NextResponse.json({ ok: false, error: "Đơn vị đã được thêm, nhưng đề xuất vừa được xử lý ở nơi khác. Hãy tải lại danh sách." }, { status: 409 });
    return NextResponse.json({ ok: true, proposal: updated, organization });
  } catch (error) {
    console.error("Admin partner proposal review failed:", error);
    return NextResponse.json({ ok: false, error: "Chưa xử lý được đề xuất. Hãy thử lại sau." }, { status: 503 });
  }
}
