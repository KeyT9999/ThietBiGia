import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Building2, Clapperboard, ExternalLink } from "lucide-react";
import type { PartnerEntry } from "@/lib/partners";
import { PartnerProjectPreview } from "./PartnerProjectPreview";

export function PartnerDetailView({ entry }: { entry: PartnerEntry }) {
  const { organization, owner, relatedProjects } = entry;
  const safeWebsite = /^https?:\/\//i.test(organization.website ?? "") ? organization.website : "";

  return (
    <div className="min-h-screen bg-obsidian px-4 pb-20 pt-24 text-ivory sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-7xl">
        <Link href="/partners" className="mb-5 inline-flex min-h-10 items-center gap-2 font-mono text-xs text-ivory-muted transition hover:text-rec"><ArrowLeft className="h-4 w-4" />TẤT CẢ ĐƠN VỊ ĐỒNG HÀNH</Link>

        <header className="grid overflow-hidden rounded-3xl border border-obsidian-border bg-obsidian-surface md:grid-cols-[minmax(220px,0.75fr)_minmax(0,1.5fr)]">
          <div className="flex min-h-56 items-center justify-center border-b border-obsidian-border bg-[radial-gradient(ellipse_at_center,rgba(255,77,0,.15),transparent_68%)] p-8 sm:min-h-72 md:border-b-0 md:border-r md:p-10">
            {organization.logo ? <img src={organization.logo} alt={`Logo ${organization.name}`} className="max-h-48 w-full max-w-xs object-contain" /> : <Building2 className="h-20 w-20 text-ivory-subtle" />}
          </div>
          <div className="min-w-0 p-5 sm:p-8 lg:p-10">
            <p className="font-mono text-[10px] tracking-[0.2em] text-rec">ĐƠN VỊ ĐỒNG HÀNH / PARTNER PROFILE</p>
            <h1 className="mt-3 break-words font-display text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{organization.name}</h1>
            {owner ? <p className="mt-3 text-xs text-ivory-subtle">Đồng hành cùng {owner}</p> : null}
            <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-ivory-muted sm:text-base">{organization.description || "Đơn vị đồng hành cùng các dự án của Thiết Bị Gia."}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-obsidian/60 px-3.5 py-2 font-mono text-xs text-ivory-muted"><Clapperboard className="h-4 w-4 text-rec" />{relatedProjects.length} DỰ ÁN ĐỒNG HÀNH</span>
              {safeWebsite ? <a href={safeWebsite} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rec px-4 py-2 font-mono text-xs font-bold text-obsidian transition hover:bg-orange-400"><ExternalLink className="h-4 w-4" />WEBSITE ĐƠN VỊ</a> : null}
            </div>
          </div>
        </header>

        <section aria-labelledby="partner-projects-heading" className="mt-8 sm:mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><p className="font-mono text-[10px] tracking-[0.18em] text-rec">SELECTED COLLABORATIONS</p><h2 id="partner-projects-heading" className="mt-1 font-display text-2xl font-bold">Các dự án đã đồng hành</h2></div>
            <span className="font-mono text-xs text-ivory-subtle">{relatedProjects.length} DỰ ÁN</span>
          </div>

          {relatedProjects.length ? <div className="grid items-stretch gap-5 lg:grid-cols-2">
            {relatedProjects.map((project) => <article key={project.id} className="group min-w-0 overflow-hidden rounded-2xl border border-obsidian-border bg-obsidian-surface transition hover:border-rec/60">
              <Link href={project.href} scroll={false} className="flex h-full min-w-0 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rec">
                <div className="aspect-video w-full overflow-hidden border-b border-obsidian-border bg-black">
                  <PartnerProjectPreview image={project.image} videoUrl={project.videoUrl} title={project.title} className="h-full w-full" />
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] text-ivory-subtle"><span className="truncate text-rec">{project.category}</span><span className="shrink-0">{project.year}</span></div>
                  <h3 className="break-words font-display text-lg font-bold leading-snug text-ivory transition group-hover:text-rec sm:text-xl">{project.title}</h3>
                  {project.summary ? <p className="mt-3 line-clamp-3 whitespace-pre-line break-words text-sm leading-relaxed text-ivory-muted">{project.summary}</p> : null}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5 font-mono text-[10px]"><span className="min-w-0 truncate text-ivory-subtle">{project.scope === "team" ? "DỰ ÁN CÙNG TEAM" : `DỰ ÁN CÙNG ${project.owner || "MEMBER"}`}</span><span className="inline-flex shrink-0 items-center gap-1.5 text-rec">XEM DỰ ÁN<ArrowUpRight className="h-3.5 w-3.5" /></span></div>
                </div>
              </Link>
            </article>)}
          </div> : <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-surface px-5 py-14 text-center"><Clapperboard className="mx-auto h-8 w-8 text-ivory-subtle" /><p className="mt-3 text-sm text-ivory-muted">Các dự án đồng hành cùng {organization.name} đang được cập nhật.</p></div>}
        </section>
      </div>
    </div>
  );
}
