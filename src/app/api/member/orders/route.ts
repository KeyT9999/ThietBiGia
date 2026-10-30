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
    const siteResult = await client.from("site_content").select("content").eq("id", "primary").maybeSingle();
    if (siteResult.error) throw siteResult.error;
    const parsed = parseSiteContent(siteResult.data?.content ?? DEFAULT_SITE_CONTENT);
    if (!parsed.success) throw new Error("Site content is invalid.");
    const currentMember = parsed.data.crew.find((member) => member.id === session.memberId);
    if (!currentMember) return NextResponse.json({ ok: false, error: "Không tìm thấy hồ sơ thành viên." }, { status: 404 });

    const [assignedResult, selectedResult] = await Promise.all([
      client.from("booking_orders").select("*").eq("assigned_member_id", session.memberId),
      client.from("booking_orders").select("*").contains("selected_crew_slugs", [currentMember.slug]),
    ]);
    if (assignedResult.error) throw assignedResult.error;
    if (selectedResult.error) throw selectedResult.error;
    const memberBySlug = new Map(parsed.data.crew.map((member) => [member.slug, member]));
    const orderById = new Map([...(assignedResult.data ?? []), ...(selectedResult.data ?? [])].map((order) => [order.id, order]));
    const orders = Array.from(orderById.values()).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).map((order) => ({
      ...order,
      is_assigned_to_me: order.assigned_member_id === session.memberId,
      is_selected_member: (order.selected_crew_slugs ?? []).includes(currentMember.slug),
      selected_crew: (order.selected_crew_slugs ?? [])
        .flatMap((slug: string) => {
          const member = memberBySlug.get(slug);
          return member
            ? [{ slug: member.slug, name: member.name, nickname: member.nickname ?? "", badgeNumber: member.badgeNumber, avatar: member.avatar }]
            : [];
        }),
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

  let body: { orderId?: unknown; acceptanceStatus?: unknown; contactStatus?: unknown; progressStatus?: unknown; progressNote?: unknown };
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
  const updatesProgress = body.progressStatus !== undefined || body.progressNote !== undefined;
  if (Number(updatesAcceptance) + Number(updatesContact) + Number(updatesProgress) !== 1) {
    return NextResponse.json({ ok: false, error: "Trạng thái cập nhật không hợp lệ." }, { status: 400 });
  }
  if (updatesProgress && (!(body.progressStatus === "new" || body.progressStatus === "in_progress" || body.progressStatus === "completed") || typeof body.progressNote !== "string" || body.progressNote.length > 3000)) {
    return NextResponse.json({ ok: false, error: "Thông tin tiến độ không hợp lệ." }, { status: 400 });
  }

  try {
    const client = createSupabaseServiceClient();
    const [orderResult, siteResult] = await Promise.all([
      client.from("booking_orders").select("id, assigned_member_id, selected_crew_slugs, acceptance_status, admin_progress_updated_at").eq("id", body.orderId).maybeSingle(),
      client.from("site_content").select("content").eq("id", "primary").maybeSingle(),
    ]);
    const { data: current, error: readError } = orderResult;
    if (readError) throw readError;
    if (siteResult.error) throw siteResult.error;
    if (!current) return NextResponse.json({ ok: false, error: "Không tìm thấy đơn hàng." }, { status: 404 });
    const parsed = parseSiteContent(siteResult.data?.content ?? DEFAULT_SITE_CONTENT);
    if (!parsed.success) throw new Error("Site content is invalid.");
    const currentMember = parsed.data.crew.find((member) => member.id === session.memberId);
    if (!currentMember) return NextResponse.json({ ok: false, error: "Không tìm thấy hồ sơ thành viên." }, { status: 404 });
    const isAssigned = current.assigned_member_id === session.memberId;
    const isCustomerSelected = (current.selected_crew_slugs ?? []).includes(currentMember.slug);
    if (!isAssigned && !isCustomerSelected) {
      return NextResponse.json({ ok: false, error: "Đơn này không được phân công hoặc khách không chọn bạn." }, { status: 404 });
    }

    const values: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updatesAcceptance) {
      if (!isAssigned) return NextResponse.json({ ok: false, error: "Chỉ người nhận đơn do admin phân công mới xác nhận hoặc từ chối nhận đơn." }, { status: 403 });
      if (current.acceptance_status !== "pending" && current.acceptance_status !== body.acceptanceStatus) {
        return NextResponse.json({ ok: false, error: "Trạng thái nhận đơn đã được xác nhận. Hãy liên hệ admin nếu cần đổi." }, { status: 409 });
      }
      values.acceptance_status = body.acceptanceStatus;
    } else if (updatesContact) {
      values.contact_status = "contacted";
      values.contacted_at = new Date().toISOString();
      values.contacted_by_member_id = session.memberId;
    } else {
      if (current.admin_progress_updated_at) {
        return NextResponse.json({ ok: false, error: "Admin đã cập nhật tiến độ đơn này. Liên hệ admin nếu cần thay đổi." }, { status: 409 });
      }
      values.progress_status = body.progressStatus;
      values.progress_note = (body.progressNote as string).trim();
      values.progress_updated_at = new Date().toISOString();
      values.progress_updated_by_member_id = session.memberId;
    }

    const updateQuery = client.from("booking_orders").update(values).eq("id", body.orderId);
    const updateResult = isAssigned
      ? await (updatesProgress
        ? updateQuery.eq("assigned_member_id", session.memberId).is("admin_progress_updated_at", null).select("*").maybeSingle()
        : updateQuery.eq("assigned_member_id", session.memberId).select("*").maybeSingle())
      : await (updatesProgress
        ? updateQuery.contains("selected_crew_slugs", [currentMember.slug]).is("admin_progress_updated_at", null).select("*").maybeSingle()
        : updateQuery.contains("selected_crew_slugs", [currentMember.slug]).select("*").maybeSingle());
    const { data, error } = updateResult;
    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { ok: false, error: updatesProgress ? "Admin vừa cập nhật tiến độ hoặc quyền truy cập đơn đã thay đổi. Hãy tải lại đơn." : "Đơn vừa được cập nhật. Hãy tải lại trước khi thay đổi tiếp." },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: true, order: data });
  } catch (error) {
    console.error("Member order update failed:", error);
    return NextResponse.json({ ok: false, error: "Không thể cập nhật trạng thái đơn." }, { status: 503 });
  }
}
