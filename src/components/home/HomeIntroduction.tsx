"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/store";
import { toYoutubeEmbedUrl } from "@/lib/youtube";

export function HomeIntroduction() {
  const homepage = useSiteContent().homepage;
  const embedUrl =
    homepage.heroMediaType === "youtube"
      ? toYoutubeEmbedUrl(homepage.heroMediaUrl)
      : null;

  return (
    <section className="relative isolate overflow-hidden bg-obsidian px-3 pb-8 pt-20 min-[390px]:px-3.5 sm:px-6 sm:pb-12 sm:pt-24 lg:px-8 lg:pb-24 lg:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_20%,rgba(255,77,0,0.13),transparent_45%),linear-gradient(180deg,#0a0b0e_0%,#101116_100%)]" />
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-3 min-[390px]:gap-4 min-[640px]:grid-cols-[1.1fr_0.9fr] sm:gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="min-w-0 space-y-2 sm:space-y-5 lg:space-y-6">
          <p className="font-mono text-[9px] font-bold tracking-[0.18em] text-rec min-[480px]:text-[10px] min-[640px]:text-xs min-[640px]:tracking-[0.24em]">
            {homepage.eyebrow}
          </p>
          <h1 className="max-w-3xl font-display text-[clamp(1.1rem,4.2vw,2.25rem)] font-bold leading-[1.05] tracking-tight text-ivory min-[640px]:text-3xl md:text-4xl lg:text-6xl xl:text-7xl">
            {homepage.title}
          </h1>
          <p className="max-w-2xl whitespace-pre-line text-[11px] leading-[1.4] text-ivory-muted min-[480px]:text-xs min-[640px]:text-base lg:text-lg">
            {homepage.description}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 min-[390px]:gap-2 sm:gap-2.5 pt-0.5 sm:pt-1">
            <Link
              href="/crew"
              className="inline-flex items-center gap-1 rounded-lg bg-rec px-2 py-2 text-[9px] font-mono font-bold text-obsidian transition hover:bg-rec-glow min-[390px]:px-2.5 min-[390px]:py-2.5 min-[480px]:gap-1.5 min-[480px]:text-[10px] min-[640px]:gap-2 min-[640px]:rounded-xl min-[640px]:px-3 min-[640px]:py-3 min-[640px]:text-xs lg:px-5"
            >
              {homepage.ctaLabel}
              <ArrowRight className="h-3 w-3 min-[640px]:h-4 min-[640px]:w-4" />
            </Link>
            <a
              href="#living-timeline"
              className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-2 text-[9px] font-mono text-ivory-muted transition hover:border-rec/60 hover:text-ivory min-[390px]:px-2.5 min-[390px]:py-2.5 min-[480px]:gap-1.5 min-[480px]:text-[10px] min-[640px]:gap-2 min-[640px]:rounded-xl min-[640px]:px-3 min-[640px]:py-3 min-[640px]:text-xs lg:px-5"
            >
              XEM TIMELINE
              <ArrowDown className="h-3 w-3 min-[640px]:h-4 min-[640px]:w-4" />
            </a>
          </div>
        </div>

        <div className="relative min-w-0 w-full overflow-hidden rounded-xl border border-white/10 bg-obsidian-surface shadow-[0_24px_64px_rgba(0,0,0,0.5)] min-[640px]:rounded-3xl lg:shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
          <div className="absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)] truncate whitespace-nowrap rounded-full border border-white/15 bg-obsidian/70 px-2 py-1 font-mono text-[7px] tracking-wide text-ivory backdrop-blur min-[480px]:left-2.5 min-[480px]:top-2.5 min-[480px]:text-[8px] min-[640px]:left-4 min-[640px]:top-4 min-[640px]:px-3 min-[640px]:py-1.5 min-[640px]:text-[10px] min-[640px]:tracking-wider">
            THIẾT BỊ GIA / TEAM STORY
          </div>
          <div className="aspect-video w-full min-[640px]:aspect-[16/10] lg:aspect-[4/3]">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={homepage.heroMediaAlt || homepage.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <img
                src={homepage.heroMediaUrl || "/anhchungtbg.jpg"}
                alt={homepage.heroMediaAlt || homepage.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
