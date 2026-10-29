import { NextResponse } from "next/server";
import { setMemberSessionCookie, verifyMemberPassword } from "@/lib/member-auth";
import { DEFAULT_SITE_CONTENT, parseSiteContent } from "@/lib/site-content";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const attempts = new Map<string, { startedAt: number; count: number; blockedUntil: number }>();
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const DUMMY_HASH = `scrypt$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(64).toString("base64url")}`;

function requestKey(request: Request, username: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return `${ip}:${username}`;
}

function isBlocked(key: string) {
  const record = attempts.get(key);
  if (!record) return false;
  const now = Date.now();
  if (record.blockedUntil > now) return true;
  if (now - record.startedAt > FAILURE_WINDOW_MS) attempts.delete(key);
  return false;
}

function registerFailure(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  const record = !current || now - current.startedAt > FAILURE_WINDOW_MS
    ? { startedAt: now, count: 1, blockedUntil: 0 }
    : { ...current, count: current.count + 1 };
  if (record.count >= MAX_FAILURES) record.blockedUntil = now + FAILURE_WINDOW_MS;
  attempts.set(key, record);
  if (attempts.size > 3000) {
    for (const [entry, value] of attempts) if (value.blockedUntil < now && now - value.startedAt > FAILURE_WINDOW_MS) attempts.delete(entry);
  }
}

export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Vui lòng nhập tên đăng nhập và mật khẩu." }, { status: 400 }); }
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password || password.length > 256) return NextResponse.json({ ok: false, error: "Vui lòng nhập tên đăng nhập và mật khẩu." }, { status: 400 });
  const key = requestKey(request, username);
  if (isBlocked(key)) return NextResponse.json({ ok: false, error: "Bạn đã thử quá nhiều lần. Hãy đợi 15 phút rồi đăng nhập lại." }, { status: 429 });

  try {
    const client = createSupabaseServiceClient();
    const { data: account, error } = await client.from("member_accounts").select("member_id, username, password_hash, is_enabled, session_version").eq("username", username).maybeSingle();
    if (error) throw error;
    const matches = await verifyMemberPassword(password, account?.password_hash ?? DUMMY_HASH);
    if (!account || !account.is_enabled || !matches) {
      registerFailure(key);
      return NextResponse.json({ ok: false, error: "Tên đăng nhập hoặc mật khẩu chưa đúng." }, { status: 401 });
    }

    const { data: row, error: contentError } = await client.from("site_content").select("content").eq("id", "primary").maybeSingle();
    if (contentError) throw contentError;
    const content = parseSiteContent(row?.content ?? DEFAULT_SITE_CONTENT);
    if (!content.success || !content.data.crew.some((member) => member.id === account.member_id)) {
      registerFailure(key);
      return NextResponse.json({ ok: false, error: "Tên đăng nhập hoặc mật khẩu chưa đúng." }, { status: 401 });
    }

    attempts.delete(key);
    const member = content.data.crew.find((item) => item.id === account.member_id)!;
    const response = NextResponse.json({ ok: true, member: { name: member.name, slug: member.slug } });
    return setMemberSessionCookie(response, account.member_id, Number(account.session_version));
  } catch (error) {
    console.error("Member login failed:", error);
    return NextResponse.json({ ok: false, error: "Chưa thể đăng nhập. Quản trị viên cần chạy migration tài khoản member trong Supabase." }, { status: 503 });
  }
}
