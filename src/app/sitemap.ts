import type { MetadataRoute } from "next";
import { getPublicSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getPublicSiteContent();
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://thietbigia.vn"
  ).replace(/\/$/, "");
  const staticRoutes = ["", "/works", "/crew", "/about", "/contact"].map((path) => ({
    url: base + path,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const crewRoutes = content.crew.map((member) => ({
    url: base + "/crew/" + member.slug,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const workRoutes = content.works.map((work) => ({
    url: base + "/works/" + work.slug,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...staticRoutes, ...crewRoutes, ...workRoutes];
}
