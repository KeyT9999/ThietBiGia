import { notFound } from "next/navigation";
import { WORKS_DATA, getWorkBySlug } from "@/data/works";
import { ProjectDetailView } from "@/components/works/ProjectDetailView";

export function generateStaticParams() {
  return WORKS_DATA.map((w) => ({ slug: w.slug }));
}

export default async function WorkStandalonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) notFound();

  return <ProjectDetailView work={work} isModal={false} />;
}
