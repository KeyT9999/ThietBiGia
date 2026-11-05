import type { PartnerOrganization, WorkProject } from "@/data/schema";
import type { SiteContent } from "@/lib/content-schema";
import { toYoutubeEmbedUrl } from "@/lib/youtube";

export type PartnerProject = {
  id: string;
  title: string;
  image: string;
  videoUrl?: string;
  year: string;
  href: string;
  summary: string;
  category: string;
  scope: "team" | "personal";
  owner?: string;
};

export type PartnerEntry = {
  organization: PartnerOrganization;
  owner?: string;
  relatedProjects: PartnerProject[];
};

export function getPartnerHref(id: string) {
  return `/partners/${encodeURIComponent(id)}`;
}

function teamProject(work: WorkProject): PartnerProject {
  return {
    id: `team-${work.id}`,
    title: work.title,
    image: work.coverImage,
    videoUrl: [work.videoEmbedUrl, work.videoUrl].find((url) => url && toYoutubeEmbedUrl(url)),
    year: work.year,
    href: `/works/${work.slug}`,
    summary: work.summary,
    category: work.category,
    scope: "team",
  };
}

export function getPartnerEntries(content: Pick<SiteContent, "partnerOrganizations" | "crew" | "works">): PartnerEntry[] {
  const partners = new Map<string, { organization: PartnerOrganization; owner?: string }>();
  for (const organization of content.partnerOrganizations) partners.set(organization.id, { organization });

  const relatedById = new Map<string, Map<string, PartnerProject>>();
  const addRelated = (partnerIds: string[] | undefined, project: PartnerProject) => {
    for (const id of partnerIds ?? []) {
      const projects = relatedById.get(id) ?? new Map<string, PartnerProject>();
      if (!projects.has(project.id)) projects.set(project.id, project);
      relatedById.set(id, projects);
    }
  };

  for (const work of content.works) {
    addRelated(work.partnerIds, teamProject(work));
  }
  for (const member of content.crew) {
    for (const project of member.showcase) {
      const linkedWork = project.projectSlug ? content.works.find((work) => work.slug === project.projectSlug) : undefined;
      if (linkedWork) {
        addRelated(project.partnerIds, teamProject(linkedWork));
        continue;
      }
      addRelated(project.partnerIds, {
        id: `member-${member.id}-${project.id}`,
        title: project.title,
        image: project.image,
        videoUrl: project.videoUrl,
        year: project.year || "",
        href: `/crew/${member.slug}`,
        summary: project.description || project.subtitle,
        category: project.subtitle || "Dự án cá nhân",
        scope: "personal",
        owner: member.nickname || member.name,
      });
    }
  }

  return Array.from(partners.values()).map(({ organization, owner }) => ({
    organization,
    owner,
    relatedProjects: Array.from(relatedById.get(organization.id)?.values() ?? []),
  }));
}
