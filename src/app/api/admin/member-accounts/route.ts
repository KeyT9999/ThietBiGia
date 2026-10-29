import { NextResponse } from "next/server";
import { DEFAULT_SITE_CONTENT, parseSiteContent } from "@/lib/site-content";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  hashMemberPassword,
  isValidMemberUsername,
  normalizeMemberUsername,
} from "@/lib/member-auth";
import { getAdminUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function canManageMembers(memberId: string) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("site_content").select("content").eq("id", "primary").maybeSingle();
  if (error) throw error;
  const parsed = parseSiteContent(data?.content ?? DEFAULT_SITE_CONTENT);
  return parsed.success && parsed.data.crew.some((member) => member.id === memberId);
}

export async function GET(request: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ ok: false, error: "Bạn cần đăng nhập admin." }, { status: 401 });
  const memberId = new URL(request.url).searchParams.get("memberId") ?? "";
  if (!memberId) return NextResponse.json({ ok: false, error: "Thiếu thành viên." }, { status: 400 });
  try {
    if (!(await canManageMembers(memberId))) return NextResponse.json({ ok: false, error: "Không tìm thấy thành viên đã lưu." }, { status: 404 });
    const { data, error } = await createSupabaseServiceClient()
      .from("member_accounts")
      .select("member_id, username, is_enabled, created_at, updated_at")
      .eq("member_id", memberId)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ ok: true, account: data ?? null });
  } catch (error) {
    console.error("Member account read failed:", error);
    return NextResponse.json({ ok: false, error: "Chưa sẵn sàng quản lý tài khoản. Hãy chạy migration member_accounts trong Supabase." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ ok: false, error: "Bạn cần đăng nhập admin." }, { status: 401 });
  let body: { memberId?: unknown; username?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }
  const memberId = typeof body.memberId === "string" ? body.memberId : "";
  const action = body.action === "reset" ? "reset" : body.action === "create" ? "create" : null;
  if (!memberId || !action) return NextResponse.json({ ok: false, error: "Thiếu thông tin tài khoản." }, { status: 400 });

  try {
    if (!(await canManageMembers(memberId))) return NextResponse.json({ ok: false, error: "Hãy lưu hồ sơ thành viên trước khi tạo tài khoản." }, { status: 404 });
    const client = createSupabaseServiceClient();
    const { data: memberRow } = await client.from("site_content").select("content").eq("id", "primary").maybeSingle();
    const parsed = parseSiteContent(memberRow?.content ?? DEFAULT_SITE_CONTENT);
    const member = parsed.success ? parsed.data.crew.find((item) => item.id === memberId) : undefined;
    if (!member) return NextResponse.json({ ok: false, error: "Không tìm thấy hồ sơ thành viên." }, { status: 404 });

    const { data: current, error: readError } = await client.from("member_accounts").select("member_id, username, is_enabled, session_version").eq("member_id", memberId).maybeSingle();
    if (readError) throw readError;
    if (action === "create" && current) return NextResponse.json({ ok: false, error: "Tài khoản này đã tồn tại. Hãy dùng nút đặt lại mật khẩu." }, { status: 409 });
    if (action === "reset" && !current) return NextResponse.json({ ok: false, error: "Thành viên chưa có tài khoản để đặt lại." }, { status: 404 });

    const username = action === "create"
      ? normalizeMemberUsername(typeof body.username === "string" && body.username.trim() ? body.username : member.slug)
      : current!.username;
    if (!isValidMemberUsername(username)) return NextResponse.json({ ok: false, error: "Tên đăng nhập cần dài 3–32 ký tự, chỉ gồm chữ thường, số, dấu chấm, gạch dưới hoặc gạch ngang." }, { status: 400 });

    const temporaryPassword = "123";
    const passwordHash = await hashMemberPassword(temporaryPassword);
    const nextVersion = Number(current?.session_version ?? 0) + 1;
    const values = {
      member_id: memberId,
      username,
      password_hash: passwordHash,
      is_enabled: true,
      session_version: nextVersion,
      updated_at: new Date().toISOString(),
    };
    const query = action === "create"
      ? client.from("member_accounts").insert({ ...values, created_at: new Date().toISOString() })
      : client.from("member_accounts").update(values).eq("member_id", memberId);
    const { data, error } = await query.select("member_id, username, is_enabled, created_at, updated_at").single();
    if (error) throw error;
    return NextResponse.json({ ok: true, account: data, temporaryPassword });
  } catch (error) {
    console.error("Member account update failed:", error);
    const message = error && typeof error === "object" && "code" in error && error.code === "23505"
      ? "Tên đăng nhập này đã được dùng. Hãy chọn tên khác."
      : "Không tạo được tài khoản. Kiểm tra migration member_accounts và thử lại.";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ ok: false, error: "Bạn cần đăng nhập admin." }, { status: 401 });
  let body: { memberId?: unknown; enabled?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }
  const memberId = typeof body.memberId === "string" ? body.memberId : "";
  if (!memberId || typeof body.enabled !== "boolean") return NextResponse.json({ ok: false, error: "Thiếu trạng thái tài khoản." }, { status: 400 });
  try {
    const client = createSupabaseServiceClient();
    const { data: current, error: readError } = await client.from("member_accounts").select("session_version").eq("member_id", memberId).maybeSingle();
    if (readError) throw readError;
    if (!current) return NextResponse.json({ ok: false, error: "Không tìm thấy tài khoản." }, { status: 404 });
    const { data, error } = await client.from("member_accounts").update({
      is_enabled: body.enabled,
      session_version: Number(current.session_version) + 1,
      updated_at: new Date().toISOString(),
    }).eq("member_id", memberId).select("member_id, username, is_enabled, created_at, updated_at").single();
    if (error) throw error;
    return NextResponse.json({ ok: true, account: data });
  } catch (error) {
    console.error("Member account status update failed:", error);
    return NextResponse.json({ ok: false, error: "Không cập nhật được trạng thái tài khoản. Kiểm tra migration member_accounts." }, { status: 503 });
  }
}
