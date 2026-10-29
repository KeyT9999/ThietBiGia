import { notFound } from "next/navigation";
import { getPublicSiteContent } from "@/lib/site-content";
import { ModalOverlayShell } from "@/components/layout/ModalOverlayShell";
import { ProjectDetailView } from "@/components/works/ProjectDetailView";

export const dynamic = "force-dynamic";

export default async function InterceptedWorkModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getPublicSiteContent();
  const work = content.works.find((item) => item.slug === slug);
  if (!work) notFound();

  return (
    <ModalOverlayShell expectedPrefix="/works/">
      <ProjectDetailView work={work} isModal={true} />
    </ModalOverlayShell>
  );
}
