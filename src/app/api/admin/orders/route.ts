import { NextResponse } from "next/server";
import { DEFAULT_SITE_CONTENT, parseSiteContent } from "@/lib/site-content";
import { createSupabaseServiceClient, getAdminUser, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ ok: false, error: "Bạn cần đăng nhập admin." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Thiếu cấu hình Supabase server." }, { status: 503 });
  }
  return null;
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const client = createSupabaseServiceClient();
    const [siteResult, orderResult, accountResult] = await Promise.all([
      client.from("site_content").select("content").eq("id", "primary").maybeSingle(),
      client.from("booking_orders").select("*").order("created_at", { ascending: false }),
      client.from("member_accounts").select("member_id, username, is_enabled"),
    ]);
    if (siteResult.error) throw siteResult.error;
    if (orderResult.error) throw orderResult.error;
    if (accountResult.error) throw accountResult.error;

    const parsed = parseSiteContent(siteResult.data?.content ?? DEFAULT_SITE_CONTENT);
    if (!parsed.success) throw new Error("Site content is invalid.");

    const accounts = new Map((accountResult.data ?? []).map((account) => [account.member_id, account]));
    const members = parsed.data.crew.map((member) => {
      const account = accounts.get(member.id);
      return {
        id: member.id,
        slug: member.slug,
        name: member.name,
        nickname: member.nickname ?? "",
        badgeNumber: member.badgeNumber,
        avatar: member.avatar,
        username: account?.username ?? null,
        enabled: Boolean(account?.is_enabled),
      };
    });
    const memberById = new Map(members.map((member) => [member.id, member]));
    const memberBySlug = new Map(members.map((member) => [member.slug, member]));
    const orders = (orderResult.data ?? []).map((order) => ({
      ...order,
      selected_crew: (order.selected_crew_slugs ?? [])
        .map((slug: string) => memberBySlug.get(slug))
        .filter(Boolean),
      assigned_member: order.assigned_member_id
        ? memberById.get(order.assigned_member_id) ?? null
        : null,
    }));

    return NextResponse.json({ ok: true, orders, members });
  } catch (error) {
    console.error("Admin orders read failed:", error);
    return NextResponse.json(
      { ok: false, error: "Không đọc được đơn hàng. Hãy kiểm tra migration booking_orders trong Supabase." },
      { status: 503 }
    );
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: { orderId?: unknown; assignedMemberId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dữ liệu yêu cầu không hợp lệ." }, { status: 400 });
  }
  if (typeof body.orderId !== "string" || !body.orderId ||
      !(body.assignedMemberId === null || typeof body.assignedMemberId === "string")) {
    return NextResponse.json({ ok: false, error: "Thiếu đơn hàng hoặc người nhận." }, { status: 400 });
  }

  try {
    const client = createSupabaseServiceClient();
    const [{ data: current, error: readError }, { data: siteRow, error: siteError }] = await Promise.all([
      client.from("booking_orders").select("id, assigned_member_id").eq("id", body.orderId).maybeSingle(),
      client.from("site_content").select("content").eq("id", "primary").maybeSingle(),
    ]);
    if (readError) throw readError;
    if (siteError) throw siteError;
    if (!current) return NextResponse.json({ ok: false, error: "Không tìm thấy đơn hàng." }, { status: 404 });

    const assignedMemberId = body.assignedMemberId as string | null;
    if (assignedMemberId) {
      const parsed = parseSiteContent(siteRow?.content ?? DEFAULT_SITE_CONTENT);
      if (!parsed.success || !parsed.data.crew.some((member) => member.id === assignedMemberId)) {
        return NextResponse.json({ ok: false, error: "Không tìm thấy thành viên được chọn." }, { status: 404 });
      }
      const { data: account, error: accountError } = await client
        .from("member_accounts")
        .select("is_enabled")
        .eq("member_id", assignedMemberId)
        .maybeSingle();
      if (accountError) throw accountError;
      if (!account?.is_enabled) {
        return NextResponse.json({ ok: false, error: "Thành viên cần có tài khoản đang hoạt động để nhận đơn." }, { status: 400 });
      }
    }

    const changed = current.assigned_member_id !== assignedMemberId;
    const values: Record<string, unknown> = {
      assigned_member_id: assignedMemberId,
      updated_at: new Date().toISOString(),
    };
    if (changed) {
      values.acceptance_status = "pending";
      values.contact_status = "not_contacted";
      values.contacted_at = null;
      values.contacted_by_member_id = null;
    }

    const { error } = await client.from("booking_orders").update(values).eq("id", body.orderId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin order assignment update failed:", error);
    return NextResponse.json({ ok: false, error: "Không thể cập nhật người nhận đơn." }, { status: 503 });
  }
}
