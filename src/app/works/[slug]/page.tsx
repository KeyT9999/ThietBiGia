import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/works/ProjectDetailView";
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
  const work = content.works.find((item) => item.slug === slug);
  if (!work) return { title: "Không tìm thấy dự án" };

  return {
    title: work.title + " (" + work.year + ")",
    description: work.summary,
    openGraph: {
      title: work.title + " // " + work.category.toUpperCase() + " — " + content.settings.brandName,
      description: work.clientOrSeries + " • " + (work.exifSpec ?? work.cameraSpec),
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
  const content = await getPublicSiteContent();
  const work = content.works.find((item) => item.slug === slug);
  if (!work) notFound();
  return <ProjectDetailView work={work} isModal={false} />;
}
