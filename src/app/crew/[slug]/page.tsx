import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemberSpotlightView } from "@/components/crew/MemberSpotlightView";
import { getPublicSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublicSiteContent();
  const member = content.crew.find((item) => item.slug === slug);
  if (!member) return { title: "Không tìm thấy thành viên" };

  const displayName = member.nickname
    ? member.name + " (" + member.nickname + ")"
    : member.name;

  return {
    title: displayName + " — #" + member.badgeNumber + " " + member.roleTitle,
    description: member.bio,
    openGraph: {
      title: displayName + " // CREW #" + member.badgeNumber + " — " + content.settings.brandName,
      description: member.roleTitle + " • Gear: " + member.favoriteGear.slice(0, 2).join(" • "),
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
  const content = await getPublicSiteContent();
  const member = content.crew.find((item) => item.slug === slug);
  if (!member) notFound();
  return <MemberSpotlightView member={member} isModal={false} />;
}
