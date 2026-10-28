import type { MetadataRoute } from "next";
import { CREW_MEMBERS } from "@/data/crew";
import { WORKS_DATA } from "@/data/works";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://thietbigia.vn").replace(
    /\/+$/,
    ""
  );
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/works`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/crew`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
  ];

  const crewRoutes: MetadataRoute.Sitemap = CREW_MEMBERS.map((member) => ({
    url: `${baseUrl}/crew/${member.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const workRoutes: MetadataRoute.Sitemap = WORKS_DATA.map((work) => ({
    url: `${baseUrl}/works/${work.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  return [...staticRoutes, ...crewRoutes, ...workRoutes];
}
