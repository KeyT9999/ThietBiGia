import { NextResponse } from "next/server";
import { clearMemberSessionCookie } from "@/lib/member-auth";

export async function POST() {
  return clearMemberSessionCookie(NextResponse.json({ ok: true }));
}
