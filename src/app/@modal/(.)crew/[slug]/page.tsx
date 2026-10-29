import { notFound } from "next/navigation";
import { getPublicSiteContent } from "@/lib/site-content";
import { ModalOverlayShell } from "@/components/layout/ModalOverlayShell";
import { MemberSpotlightView } from "@/components/crew/MemberSpotlightView";

export const dynamic = "force-dynamic";

export default async function InterceptedCrewModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getPublicSiteContent();
  const member = content.crew.find((item) => item.slug === slug);
  if (!member) notFound();

  return (
    <ModalOverlayShell expectedPrefix="/crew/">
      <MemberSpotlightView member={member} isModal={true} />
    </ModalOverlayShell>
  );
}
