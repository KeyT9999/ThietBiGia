import { redirect } from "next/navigation";
import { MemberWorkspace } from "@/components/member/MemberWorkspace";
import { getMemberSession } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage() {
  const session = await getMemberSession();
  if (!session) redirect("/member/login");
  return <MemberWorkspace />;
}
