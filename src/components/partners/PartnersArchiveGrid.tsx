"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, Clapperboard, ExternalLink, Search, Users, X } from "lucide-react";
import type { PartnerOrganization } from "@/data/schema";
import { useSiteContent } from "@/lib/store";

type RelatedProject = {
  id: string;
  title: string;
  image: string;
  year: string;
  href: string;
  owner?: string;
};

type PartnerEntry = {
  organization: PartnerOrganization;
  owner?: string;
  relatedProjects: RelatedProject[];
};

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
}

function PartnerCard({ entry }: { entry: PartnerEntry }) {
  const { organization, owner, relatedProjects } = entry;
  const safeWebsite = /^https?:\/\//i.test(organization.website ?? "") ? organization.website : "";

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-obsidian-border bg-obsidian-surface shadow-[0_12px_36px_rgba(0,0,0,0.28)] transition-colors hover:border-rec/60">
      <div className="relative flex min-h-48 items-center justify-center overflow-hidden border-b border-obsidian-border bg-[radial-gradient(ellipse_at_50%_55%,rgba(255,77,0,0.16),transparent_58%),linear-gradient(145deg,#151820,#0c0d11)] p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)", backgroundSize: "36px 36px" }} />
        {organization.logo ? (
          <img src={organization.logo} alt={`Logo ${organization.name}`} className="relative z-10 max-h-28 max-w-[80%] object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,.3)] transition-transform duration-500 group-hover:scale-[1.04] sm:max-w-[320px]" />
        ) : (
          <span className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-black/25 font-display text-3xl font-bold text-ivory/80">{initials(organization.name) || <Building2 className="h-9 w-9" />}</span>
        )}
        <span className="absolute left-4 top-4 rounded-md border border-white/10 bg-obsidian/80 px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] text-ivory-muted">ĐƠN VỊ ĐỒNG HÀNH</span>
        {owner ? <span className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-obsidian/80 px-2.5 py-1 text-[10px] text-ivory-muted">Cùng {owner}</span> : null}
        {safeWebsite ? <a href={safeWebsite} target="_blank" rel="noreferrer" aria-label={`Mở website ${organization.name}`} className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-obsidian/80 text-ivory-muted transition hover:border-rec hover:text-rec"><ExternalLink className="h-4 w-4" /></a> : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="min-w-0">
          <h2 className="break-words font-display text-xl font-bold text-ivory">{organization.name}</h2>
          {organization.description ? <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-ivory-muted">{organization.description}</p> : <p className="mt-2 text-sm text-ivory-subtle">Đơn vị đồng hành cùng các dự án của Thiết Bị Gia.</p>}
          {safeWebsite ? <a href={safeWebsite} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-1.5 text-xs text-rec hover:text-orange-300"><span className="truncate">{safeWebsite.replace(/^https?:\/\//i, "").replace(/\/$/, "")}</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0" /></a> : null}
        </div>

        {relatedProjects.length ? (
          <div className="mt-auto border-t border-obsidian-border/80 pt-3">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-ivory-subtle"><Clapperboard className="h-3.5 w-3.5 text-rec" />DỰ ÁN ĐỒNG HÀNH</p>
              <span className="font-mono text-[10px] text-rec">{relatedProjects.length}</span>
            </div>
            <div className="space-y-2">
              {relatedProjects.slice(0, 4).map((project) => <Link key={project.id} href={project.href} className="group/project flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-obsidian/55 p-2 transition hover:border-rec/40">
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-obsidian">
                  {project.image ? <img src={project.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover/project:scale-105" /> : <div className="grid h-full w-full place-items-center"><Clapperboard className="h-4 w-4 text-ivory-subtle" /></div>}
                </div>
                <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-ivory group-hover/project:text-rec">{project.title}</span><span className="mt-1 block truncate font-mono text-[9px] text-ivory-subtle">{project.owner ? `${project.owner} · ` : ""}{project.year}</span></span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ivory-subtle group-hover/project:text-rec" />
              </Link>)}
              {relatedProjects.length > 4 ? <p className="pl-1 font-mono text-[9px] text-ivory-subtle">VÀ {relatedProjects.length - 4} DỰ ÁN KHÁC</p> : null}
            </div>
          </div>
        ) : <div className="mt-auto flex items-center gap-2 border-t border-obsidian-border/80 pt-3 text-xs text-ivory-subtle"><Users className="h-3.5 w-3.5" />Đang đồng hành cùng Thiết Bị Gia</div>}
      </div>
    </article>
  );
}

export function PartnersArchiveGrid() {
  const siteContent = useSiteContent();
  const [query, setQuery] = useState("");
  const [projectsOnly, setProjectsOnly] = useState(false);

  const entries = useMemo<PartnerEntry[]>(() => {
    const partners = new Map<string, { organization: PartnerOrganization; owner?: string }>();
    for (const organization of siteContent.partnerOrganizations) partners.set(organization.id, { organization });
    for (const member of siteContent.crew) {
      for (const organization of member.partnerOrganizations ?? []) {
        if (!partners.has(organization.id)) partners.set(organization.id, { organization, owner: member.nickname || member.name });
      }
    }

    const relatedById = new Map<string, RelatedProject[]>();
    const addRelated = (partnerIds: string[] | undefined, project: RelatedProject) => {
      for (const id of partnerIds ?? []) relatedById.set(id, [...(relatedById.get(id) ?? []), project]);
    };
    for (const work of siteContent.works) {
      addRelated(work.partnerIds, { id: `team-${work.id}`, title: work.title, image: work.coverImage, year: work.year, href: `/works/${work.slug}` });
    }
    for (const member of siteContent.crew) {
      for (const project of member.showcase) {
        addRelated(project.partnerIds, {
          id: `member-${member.id}-${project.id}`,
          title: project.title,
          image: project.image || member.avatar,
          year: project.year || "",
          href: `/crew/${member.slug}`,
          owner: member.nickname || member.name,
        });
      }
    }

    return Array.from(partners.values()).map(({ organization, owner }) => ({
      organization,
      owner,
      relatedProjects: relatedById.get(organization.id) ?? [],
    }));
  }, [siteContent.partnerOrganizations, siteContent.crew, siteContent.works]);

  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const visibleEntries = entries.filter(({ organization, owner, relatedProjects }) => {
    const matchesQuery = !normalizedQuery || [organization.name, organization.description, owner, ...relatedProjects.map((project) => project.title)]
      .some((value) => value?.toLocaleLowerCase("vi").includes(normalizedQuery));
    return matchesQuery && (!projectsOnly || relatedProjects.length > 0);
  });

  return (
    <div className="min-h-screen bg-obsidian px-4 pb-20 pt-24 text-ivory sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 overflow-hidden rounded-3xl border border-obsidian-border bg-[radial-gradient(ellipse_at_88%_8%,rgba(255,77,0,.17),transparent_45%),linear-gradient(145deg,#15161c,#0e0f13)] p-5 sm:mb-9 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="font-mono text-[10px] tracking-[0.22em] text-rec sm:text-xs">CREATIVE COLLABORATORS / PARTNER DIRECTORY</p>
              <h1 className="mt-3 font-display text-3xl font-black leading-tight sm:text-5xl">Đơn vị đồng hành</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-muted sm:text-base">Những đối tác và thương hiệu đã cùng Thiết Bị Gia tạo nên các sản phẩm hình ảnh, phim và trải nghiệm sáng tạo.</p>
            </div>
            <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rec px-4 py-3 text-xs font-mono font-bold text-obsidian transition hover:bg-orange-400"><Users className="h-4 w-4" />LIÊN HỆ HỢP TÁC</Link>
          </div>
          <div className="mt-7 grid max-w-xl grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-obsidian/50 p-3.5"><p className="font-mono text-[9px] tracking-wider text-ivory-subtle">ĐƠN VỊ ĐỒNG HÀNH</p><p className="mt-1 font-display text-2xl font-bold">{entries.length}</p></div>
            <div className="rounded-xl border border-white/10 bg-obsidian/50 p-3.5"><p className="font-mono text-[9px] tracking-wider text-ivory-subtle">DỰ ÁN ĐƯỢC GẮN</p><p className="mt-1 font-display text-2xl font-bold">{entries.reduce((count, entry) => count + entry.relatedProjects.length, 0)}</p></div>
          </div>
        </header>

        <section aria-label="Danh sách đơn vị đồng hành">
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-obsidian-border bg-obsidian-surface p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-obsidian px-3.5">
              <Search className="h-4 w-4 shrink-0 text-rec" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm đơn vị hoặc dự án..." className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ivory outline-none placeholder:text-ivory-subtle" />
              {query ? <button type="button" onClick={() => setQuery("")} aria-label="Xóa tìm kiếm" className="rounded-md p-1 text-ivory-subtle hover:text-ivory"><X className="h-4 w-4" /></button> : null}
            </label>
            <button type="button" aria-pressed={projectsOnly} onClick={() => setProjectsOnly((current) => !current)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-mono transition ${projectsOnly ? "border-rec/50 bg-rec text-obsidian" : "border-white/10 text-ivory-muted hover:border-white/20 hover:text-ivory"}`}><Clapperboard className="h-4 w-4" />{projectsOnly ? "CÓ DỰ ÁN" : "TẤT CẢ ĐƠN VỊ"}</button>
          </div>

          {visibleEntries.length ? <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-5">{visibleEntries.map((entry) => <PartnerCard key={entry.organization.id} entry={entry} />)}</div> : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-surface px-5 py-16 text-center">
              <Building2 className="mx-auto h-8 w-8 text-ivory-subtle" />
              <p className="mt-3 font-display text-lg font-bold">{entries.length ? "Không tìm thấy đơn vị phù hợp" : "Danh sách đang được cập nhật"}</p>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ivory-muted">{entries.length ? "Thử đổi từ khóa hoặc tắt bộ lọc dự án." : "Các đơn vị đồng hành sẽ xuất hiện tại đây khi được thêm trong công cụ quản trị hoặc hồ sơ member."}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
