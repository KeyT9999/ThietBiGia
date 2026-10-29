import "server-only";

import { createHmac, randomBytes, timingSafeEqual, scrypt } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const MEMBER_SESSION_COOKIE = "tbg_member_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_HASH_BYTES = 64;

type SessionPayload = {
  memberId: string;
  version: number;
  expiresAt: number;
};

function sessionSecret() {
  return process.env.MEMBER_SESSION_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function hmac(value: string) {
  const secret = sessionSecret();
  if (!secret) throw new Error("Member session signing secret is missing.");
  return createHmac("sha256", secret).update(value).digest();
}

function derivePassword(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, PASSWORD_HASH_BYTES, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

export async function hashMemberPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await derivePassword(password, salt);
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyMemberPassword(password: string, encoded: string) {
  const [algorithm, saltText, hashText, extra] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltText || !hashText || extra !== undefined) return false;
  try {
    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(hashText, "base64url");
    if (salt.length < 16 || expected.length !== PASSWORD_HASH_BYTES) return false;
    const actual = await derivePassword(password, salt);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function generateTemporaryPassword() {
  return randomBytes(18).toString("base64url");
}

export function normalizeMemberUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidMemberUsername(value: string) {
  return /^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])$/.test(value);
}

export function createMemberSessionToken(memberId: string, version: number) {
  const payload: SessionPayload = {
    memberId,
    version,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = hmac(encoded).toString("base64url");
  return `${encoded}.${signature}`;
}

export function setMemberSessionCookie(response: NextResponse, memberId: string, version: number) {
  response.cookies.set(MEMBER_SESSION_COOKIE, createMemberSessionToken(memberId, version), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_LIFETIME_SECONDS,
  });
  return response;
}

export function clearMemberSessionCookie(response: NextResponse) {
  response.cookies.set(MEMBER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function getMemberSession() {
  try {
    const token = (await cookies()).get(MEMBER_SESSION_COOKIE)?.value;
    if (!token || !sessionSecret()) return null;
    const [encoded, signature, extra] = token.split(".");
    if (!encoded || !signature || extra !== undefined) return null;
    const provided = Buffer.from(signature, "base64url");
    const expected = hmac(encoded);
    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.memberId || !Number.isInteger(payload.version) || payload.expiresAt <= Math.floor(Date.now() / 1000)) return null;

    const { data, error } = await createSupabaseServiceClient()
      .from("member_accounts")
      .select("username, is_enabled, session_version")
      .eq("member_id", payload.memberId)
      .maybeSingle();
    if (error || !data || !data.is_enabled || Number(data.session_version) !== payload.version) return null;
    return { memberId: payload.memberId, username: data.username as string, version: payload.version };
  } catch {
    return null;
  }
}
