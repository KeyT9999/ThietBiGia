import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CREW_MEMBERS, getCrewBySlug } from "@/data/crew";
import { MemberSpotlightView } from "@/components/crew/MemberSpotlightView";

export function generateStaticParams() {
  return CREW_MEMBERS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getCrewBySlug(slug);
  if (!member) {
    return { title: "Không tìm thấy thành viên" };
  }

  const displayName = member.nickname
    ? `${member.name} (${member.nickname})`
    : member.name;

  return {
    title: `${displayName} — #${member.badgeNumber} ${member.roleTitle}`,
    description: member.bio,
    openGraph: {
      title: `${displayName} // CREW #${member.badgeNumber} — THIẾT BỊ GIA`,
      description: `${member.roleTitle} • Gear: ${member.favoriteGear.slice(0, 2).join(" • ")}`,
      type: "profile",
    },
  };
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
