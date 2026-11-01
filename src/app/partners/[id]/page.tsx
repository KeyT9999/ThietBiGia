import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnerDetailView } from "@/components/partners/PartnerDetailView";
import { getPartnerEntries } from "@/lib/partners";
import { getPublicSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type PartnerPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PartnerPageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getPublicSiteContent();
  const entry = getPartnerEntries(content).find(({ organization }) => organization.id === id);
  if (!entry) return { title: "Không tìm thấy đơn vị đồng hành" };
  return {
    title: `${entry.organization.name} — Đơn vị đồng hành`,
    description: entry.organization.description || `Các dự án đồng hành cùng ${entry.organization.name} và ${content.settings.brandName}.`,
  };
}

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { id } = await params;
  const content = await getPublicSiteContent();
  const entry = getPartnerEntries(content).find(({ organization }) => organization.id === id);
  if (!entry) notFound();
  return <PartnerDetailView entry={entry} />;
}
