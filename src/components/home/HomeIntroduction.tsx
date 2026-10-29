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
    <section className="relative isolate overflow-hidden bg-obsidian px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-24 lg:px-8 lg:pb-24 lg:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_20%,rgba(255,77,0,0.13),transparent_45%),linear-gradient(180deg,#0a0b0e_0%,#101116_100%)]" />
      <div className="mx-auto grid max-w-[1440px] items-center gap-6 sm:grid-cols-[1.1fr_0.9fr] sm:gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          <p className="font-mono text-xs font-bold tracking-[0.24em] text-rec">
            {homepage.eyebrow}
          </p>
          <h1 className="max-w-3xl font-display text-[clamp(1.75rem,7.5vw,2.25rem)] font-bold leading-[1.08] tracking-tight text-ivory sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl">
            {homepage.title}
          </h1>
          <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-ivory-muted sm:text-base lg:text-lg">
            {homepage.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
            <Link
              href="/crew"
              className="inline-flex items-center gap-2 rounded-xl bg-rec px-3 py-3 text-xs font-mono font-bold text-obsidian transition hover:bg-rec-glow lg:px-5"
            >
              {homepage.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#living-timeline"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-3 text-xs font-mono text-ivory-muted transition hover:border-rec/60 hover:text-ivory lg:px-5"
            >
              XEM TIMELINE
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-obsidian-surface shadow-[0_24px_64px_rgba(0,0,0,0.5)] lg:shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
          <div className="absolute left-3 top-3 sm:left-4 sm:top-4 z-10 rounded-full border border-white/15 bg-obsidian/70 px-3 py-1.5 font-mono text-[10px] tracking-wider text-ivory backdrop-blur">
            THIẾT BỊ GIA / TEAM STORY
          </div>
          <div className="aspect-[16/10] w-full lg:aspect-[4/3]">
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
