import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORKS_DATA, getWorkBySlug } from "@/data/works";
import { ProjectDetailView } from "@/components/works/ProjectDetailView";

export function generateStaticParams() {
  return WORKS_DATA.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) {
    return { title: "Không tìm thấy dự án" };
  }

  return {
    title: `${work.title} (${work.year})`,
    description: work.summary,
    openGraph: {
      title: `${work.title} // ${work.category.toUpperCase()} — THIẾT BỊ GIA`,
      description: `${work.clientOrSeries} • ${work.exifSpec ?? work.cameraSpec}`,
      type: "article",
    },
  };
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
