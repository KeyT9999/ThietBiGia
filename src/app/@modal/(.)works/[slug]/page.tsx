import { notFound } from "next/navigation";
import { getWorkBySlug } from "@/data/works";
import { ModalOverlayShell } from "@/components/layout/ModalOverlayShell";
import { ProjectDetailView } from "@/components/works/ProjectDetailView";

export default async function InterceptedWorkModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) notFound();

  return (
    <ModalOverlayShell expectedPrefix="/works/">
      <ProjectDetailView work={work} isModal={true} />
    </ModalOverlayShell>
  );
}
