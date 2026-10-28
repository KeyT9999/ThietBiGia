import { notFound } from "next/navigation";
import { getCrewBySlug } from "@/data/crew";
import { ModalOverlayShell } from "@/components/layout/ModalOverlayShell";
import { MemberSpotlightView } from "@/components/crew/MemberSpotlightView";

export default async function InterceptedCrewModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = getCrewBySlug(slug);
  if (!member) notFound();

  return (
    <ModalOverlayShell expectedPrefix="/crew/">
      <MemberSpotlightView member={member} isModal={true} />
    </ModalOverlayShell>
  );
}
