import { redirect } from "next/navigation";
import { MemberLoginForm } from "@/components/member/MemberLoginForm";
import { getMemberSession } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export default async function MemberLoginPage() {
  const session = await getMemberSession();
  if (session) redirect("/member/profile");
  return <MemberLoginForm />;
}
