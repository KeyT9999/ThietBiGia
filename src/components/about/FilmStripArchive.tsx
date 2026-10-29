"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Film, Maximize2, Users, X } from "lucide-react";
import { FILM_STRIP_MOMENTS } from "@/data/moments";
import { getCrewBySlug } from "@/data/crew";
import { soundEngine } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

export function FilmStripArchive() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const sprocketCount = Math.max(40, FILM_STRIP_MOMENTS.length * 8);

  useGSAP(
    () => {
      if (!stripRef.current || !sectionRef.current) return;

      gsap.fromTo(
        stripRef.current,
        { x: 32 },
        {
          x: -120,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") {
        setLightboxIdx((i) =>
          i === null ? null : (i + 1) % FILM_STRIP_MOMENTS.length
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIdx((i) =>
          i === null
            ? null
            : (i - 1 + FILM_STRIP_MOMENTS.length) % FILM_STRIP_MOMENTS.length
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx]);

  const scrollStrip = (dir: -1 | 1) => {
    soundEngine.playTick(0.85);
    scrollerRef.current?.scrollBy({
      left: dir * 460,
      behavior: "smooth",
    });
  };

  const activeMoment =
    lightboxIdx !== null ? FILM_STRIP_MOMENTS[lightboxIdx] : null;

  return (
    <section ref={sectionRef} className="space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-rec uppercase tracking-widest">
            <Film className="w-3.5 h-3.5" />
            <span>35MM CONTACT SHEET // CUỘN PHIM TẬP THỂ TIÊU BIỂU</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory">
            CUỘN PHIM KỶ NIỆM ANH EM THIẾT BỊ GIA
          </h2>
          <p className="text-sm text-ivory-muted max-w-2xl">
            Lướt ngang qua dải phim nhựa 35mm gồm {FILM_STRIP_MOMENTS.length} khoảnh khắc tập thể tiêu biểu nhất — nhấn vào từng frame để phóng lớn toàn màn hình.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono text-ivory-subtle hidden md:inline">
            KODAK PORTRA 400 • {FILM_STRIP_MOMENTS.length} KEY FRAMES
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollStrip(-1)}
              aria-label="Cuộn trái cuộn phim"
              className="p-2 rounded-lg border border-obsidian-border bg-obsidian-surface hover:border-rec text-ivory-muted hover:text-ivory transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollStrip(1)}
              aria-label="Cuộn phải cuộn phim"
              className="p-2 rounded-lg border border-obsidian-border bg-obsidian-surface hover:border-rec text-ivory-muted hover:text-ivory transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Physical 35mm Film Strip Container */}
      <div
        ref={scrollerRef}
        className="relative rounded-2xl border border-obsidian-border bg-[#07080B] py-4 overflow-x-auto"
      >
        <div
          ref={stripRef}
          className="inline-flex flex-col min-w-full px-4 select-none"
        >
          {/* Top Film Rebate + Sprocket Holes */}
          <div className="flex items-center justify-between gap-3 px-2 pb-2.5">
            {Array.from({ length: sprocketCount }).map((_, i) => (
              <span
                key={`top-${i}`}
                className="w-3.5 h-2.5 rounded-[2px] bg-obsidian-surface border border-white/10 shrink-0"
              />
            ))}
          </div>

          {/* Edge Film Markings Top */}
          <div className="flex items-center justify-between px-4 pb-2 text-xs font-mono text-amber-400/80 tracking-widest">
            <span>KODAK PORTRA 400</span>
            <span>THIẾT BỊ GIA COLLECTIVE ARCHIVE</span>
            <span>SAFETY FILM 5052</span>
            <span>FUDA MASTERALBUM</span>
            <span>PORTRA 400</span>
          </div>

          {/* Film Frames Row */}
          <div className="flex items-stretch gap-5 px-2">
            {FILM_STRIP_MOMENTS.map((moment, idx) => (
              <button
                key={moment.id}
                type="button"
                onClick={() => {
                  soundEngine.playShutter();
                  setLightboxIdx(idx);
                }}
                className="group relative w-[330px] sm:w-[410px] shrink-0 text-left rounded-md overflow-hidden border-2 border-white/10 hover:border-rec transition-colors bg-obsidian cursor-pointer"
              >
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img
                    src={moment.src}
                    alt={moment.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent opacity-90" />

                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-obsidian/80 border border-white/15 text-[11px] font-mono text-ivory">
                    <Users className="w-3 h-3 text-rec" />
                    <span>{moment.detectedFaceCount ?? 8}+ anh em</span>
                  </span>

                  <span className="absolute top-3 right-3 p-1.5 rounded-md bg-obsidian/75 border border-white/15 text-ivory opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5 text-rec" />
                  </span>

                  <div className="absolute bottom-3 left-3.5 right-3.5 space-y-0.5">
                    <div className="text-xs font-mono text-amber-400 font-bold">
                      {moment.frameCode} • {moment.dateLabel}
                    </div>
                    <div className="font-display font-bold text-sm sm:text-base text-ivory truncate">
                      {moment.title}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Edge Film Numbers Bottom */}
          <div className="flex items-center justify-around px-4 pt-2 text-xs font-mono text-amber-400/80 tracking-widest">
            {FILM_STRIP_MOMENTS.map((m) => (
              <span key={m.id}>{m.frameCode}</span>
            ))}
          </div>

          {/* Bottom Sprocket Holes */}
          <div className="flex items-center justify-between gap-3 px-2 pt-2.5">
            {Array.from({ length: sprocketCount }).map((_, i) => (
              <span
                key={`bot-${i}`}
                className="w-3.5 h-2.5 rounded-[2px] bg-obsidian-surface border border-white/10 shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Full-Screen Analog Lightbox */}
      <AnimatePresence>
        {activeMoment && lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}
            data-lenis-prevent
            className="fixed inset-0 z-[95] bg-obsidian/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full rounded-2xl border border-obsidian-border bg-obsidian-surface overflow-hidden shadow-2xl"
            >
              {/* Lightbox Header */}
              <div className="px-5 py-3.5 border-b border-obsidian-border flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-amber-400 font-bold">
                    {activeMoment.frameCode}
                  </span>
                  <span className="text-ivory-muted">{activeMoment.filmStock}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxIdx(null)}
                  className="p-1.5 rounded-lg border border-obsidian-border hover:border-rec text-ivory-muted hover:text-ivory cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Image */}
              <div className="relative bg-obsidian flex items-center justify-center max-h-[68dvh] overflow-hidden">
                <img
                  src={activeMoment.src}
                  alt={activeMoment.title}
                  className="max-h-[68dvh] w-auto object-contain"
                />

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(0.85);
                    setLightboxIdx(
                      (lightboxIdx - 1 + FILM_STRIP_MOMENTS.length) %
                        FILM_STRIP_MOMENTS.length
                    );
                  }}
                  className="absolute left-3 p-2.5 rounded-full bg-obsidian/80 border border-white/15 hover:border-rec text-ivory cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(0.85);
                    setLightboxIdx(
                      (lightboxIdx + 1) % FILM_STRIP_MOMENTS.length
                    );
                  }}
                  className="absolute right-3 p-2.5 rounded-full bg-obsidian/80 border border-white/15 hover:border-rec text-ivory cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Caption Footer */}
              <div className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-ivory">
                      {activeMoment.title}
                    </h3>
                    <p className="text-sm text-ivory-muted mt-0.5">
                      {activeMoment.caption}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-rec shrink-0">
                    {activeMoment.location}
                  </span>
                </div>

                {activeMoment.memberSlugs && activeMoment.memberSlugs.length > 0 && (
                  <div className="pt-2.5 border-t border-obsidian-border flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-ivory-subtle uppercase">
                      Nhận diện thành viên:
                    </span>
                    {activeMoment.memberSlugs.map((slug) => {
                      const member = getCrewBySlug(slug);
                      if (!member) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/crew/${slug}`}
                          onClick={() => setLightboxIdx(null)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-obsidian-border bg-obsidian hover:border-rec text-xs text-ivory transition-colors"
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>{member.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
