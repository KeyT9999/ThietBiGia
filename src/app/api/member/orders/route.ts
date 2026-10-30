import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/member-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_CONTENT, parseSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ ok: false, error: "Phiên đăng nhập đã hết hạn." }, { status: 401 });

  try {
    const client = createSupabaseServiceClient();
    const [ordersResult, siteResult] = await Promise.all([
      client.from("booking_orders").select("*").eq("assigned_member_id", session.memberId).order("created_at", { ascending: false }),
      client.from("site_content").select("content").eq("id", "primary").maybeSingle(),
    ]);
    if (ordersResult.error) throw ordersResult.error;
    if (siteResult.error) throw siteResult.error;
    const parsed = parseSiteContent(siteResult.data?.content ?? DEFAULT_SITE_CONTENT);
    if (!parsed.success) throw new Error("Site content is invalid.");
    const memberBySlug = new Map(parsed.data.crew.map((member) => [member.slug, member]));
    const orders = (ordersResult.data ?? []).map((order) => ({
      ...order,
      selected_crew: (order.selected_crew_slugs ?? [])
        .map((slug: string) => memberBySlug.get(slug))
        .filter(Boolean)
        .map((member) => ({ slug: member!.slug, name: member!.name, nickname: member!.nickname ?? "", badgeNumber: member!.badgeNumber, avatar: member!.avatar })),
    }));
    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    console.error("Member orders read failed:", error);
    return NextResponse.json(
      { ok: false, error: "Không đọc được đơn được phân công. Hãy báo quản trị viên kiểm tra Supabase." },
      { status: 503 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ ok: false, error: "Phiên đăng nhập đã hết hạn." }, { status: 401 });

  let body: { orderId?: unknown; acceptanceStatus?: unknown; contactStatus?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dữ liệu yêu cầu không hợp lệ." }, { status: 400 });
  }
  if (typeof body.orderId !== "string" || !body.orderId) {
    return NextResponse.json({ ok: false, error: "Thiếu mã đơn hàng." }, { status: 400 });
  }
  const updatesAcceptance = body.acceptanceStatus === "accepted" || body.acceptanceStatus === "declined";
  const updatesContact = body.contactStatus === "contacted";
  if (updatesAcceptance === updatesContact) {
    return NextResponse.json({ ok: false, error: "Trạng thái cập nhật không hợp lệ." }, { status: 400 });
  }

  try {
    const client = createSupabaseServiceClient();
    const { data: current, error: readError } = await client
      .from("booking_orders")
      .select("id, acceptance_status")
      .eq("id", body.orderId)
      .eq("assigned_member_id", session.memberId)
      .maybeSingle();
    if (readError) throw readError;
    if (!current) return NextResponse.json({ ok: false, error: "Đơn này không được phân công cho bạn." }, { status: 404 });

    const values: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updatesAcceptance) {
      if (current.acceptance_status !== "pending" && current.acceptance_status !== body.acceptanceStatus) {
        return NextResponse.json({ ok: false, error: "Trạng thái nhận đơn đã được xác nhận. Hãy liên hệ admin nếu cần đổi." }, { status: 409 });
      }
      values.acceptance_status = body.acceptanceStatus;
    } else {
      if (current.acceptance_status !== "accepted") {
        return NextResponse.json({ ok: false, error: "Bạn cần đồng ý nhận đơn trước khi đánh dấu đã liên hệ khách." }, { status: 409 });
      }
      values.contact_status = "contacted";
      values.contacted_at = new Date().toISOString();
      values.contacted_by_member_id = session.memberId;
    }

    const { data, error } = await client
      .from("booking_orders")
      .update(values)
      .eq("id", body.orderId)
      .eq("assigned_member_id", session.memberId)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, order: data });
  } catch (error) {
    console.error("Member order update failed:", error);
    return NextResponse.json({ ok: false, error: "Không thể cập nhật trạng thái đơn." }, { status: 503 });
  }
}
