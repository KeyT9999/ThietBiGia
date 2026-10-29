import { NextResponse } from "next/server";
import { getMemberSession, hashMemberPassword, setMemberSessionCookie, verifyMemberPassword } from "@/lib/member-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ ok: false, error: "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại." }, { status: 401 });
  let body: { currentPassword?: unknown; newPassword?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Thông tin đổi mật khẩu không hợp lệ." }, { status: 400 }); }
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  if (newPassword.length < 6 || newPassword.length > 256) return NextResponse.json({ ok: false, error: "Mật khẩu mới cần có ít nhất 6 ký tự." }, { status: 400 });

  try {
    const client = createSupabaseServiceClient();
    const { data: account, error: readError } = await client.from("member_accounts").select("password_hash, session_version, is_enabled").eq("member_id", session.memberId).maybeSingle();
    if (readError) throw readError;
    if (!account || !account.is_enabled || !(await verifyMemberPassword(currentPassword, account.password_hash))) {
      return NextResponse.json({ ok: false, error: "Mật khẩu hiện tại chưa đúng." }, { status: 400 });
    }

    const nextVersion = Number(account.session_version) + 1;
    const { error } = await client.from("member_accounts").update({
      password_hash: await hashMemberPassword(newPassword),
      session_version: nextVersion,
      updated_at: new Date().toISOString(),
    }).eq("member_id", session.memberId);
    if (error) throw error;
    return setMemberSessionCookie(NextResponse.json({ ok: true, message: "Mật khẩu đã được đổi." }), session.memberId, nextVersion);
  } catch (error) {
    console.error("Member password change failed:", error);
    return NextResponse.json({ ok: false, error: "Không lưu được mật khẩu. Hãy kiểm tra migration tài khoản và thử lại." }, { status: 503 });
  }
}
