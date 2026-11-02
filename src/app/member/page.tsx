import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export default async function MemberIndexPage() {
  const session = await getMemberSession();
  redirect(session ? "/member/profile" : "/member/login");
}
