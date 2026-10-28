import { notFound } from "next/navigation";
import { CREW_MEMBERS, getCrewBySlug } from "@/data/crew";
import { MemberSpotlightView } from "@/components/crew/MemberSpotlightView";

export function generateStaticParams() {
  return CREW_MEMBERS.map((m) => ({ slug: m.slug }));
}

export default async function CrewMemberStandalonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = getCrewBySlug(slug);
  if (!member) notFound();

  return <MemberSpotlightView member={member} isModal={false} />;
}
