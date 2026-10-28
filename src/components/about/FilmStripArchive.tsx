"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Film, Maximize2, X } from "lucide-react";
import { GROUP_MOMENTS } from "@/data/moments";
import { soundEngine } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

export function FilmStripArchive() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // GSAP ScrollTrigger horizontal parallax scrub (Skill: GSAP ScrollTrigger + Single Ticker)
  useGSAP(
    () => {
      if (!stripRef.current || !sectionRef.current) return;

      gsap.fromTo(
        stripRef.current,
        { x: 40 },
        {
          x: -140,
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
          i === null ? null : (i + 1) % GROUP_MOMENTS.length
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIdx((i) =>
          i === null
            ? null
            : (i - 1 + GROUP_MOMENTS.length) % GROUP_MOMENTS.length
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx]);

  const activeMoment = lightboxIdx !== null ? GROUP_MOMENTS[lightboxIdx] : null;

  return (
    <section ref={sectionRef} className="space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-rec uppercase tracking-widest">
            <Film className="w-3.5 h-3.5" />
            <span>35MM CONTACT SHEET // NHẬT KÝ HÀNH TRÌNH</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory">
            CUỘN PHIM KỶ NIỆM ANH EM THIẾT BỊ GIA
          </h2>
          <p className="text-sm text-ivory-muted max-w-2xl">
            Cuộn trang để lướt qua dải phim nhựa 35mm — nhấn vào từng frame để phóng lớn ảnh kỷ niệm chuyến đi và hậu trường của nhóm.
          </p>
        </div>

        <div className="text-xs font-mono text-ivory-subtle shrink-0">
          KODAK PORTRA 400 • {GROUP_MOMENTS.length} FRAMES ARCHIVED
        </div>
      </div>

      {/* Physical 35mm Film Strip Container */}
      <div className="relative rounded-2xl border border-obsidian-border bg-[#07080B] py-4 overflow-x-auto">
        <div
          ref={stripRef}
          className="inline-flex flex-col min-w-full px-4 select-none"
        >
          {/* Top Film Rebate + Sprocket Holes */}
          <div className="flex items-center justify-between gap-3 px-2 pb-2.5">
            {Array.from({ length: 34 }).map((_, i) => (
              <span
                key={`top-${i}`}
                className="w-3.5 h-2.5 rounded-[2px] bg-obsidian-surface border border-white/10 shrink-0"
              />
            ))}
          </div>

          {/* Edge Film Markings Top */}
          <div className="flex items-center justify-between px-4 pb-2 text-xs font-mono text-amber-400/80 tracking-widest">
            <span>KODAK PORTRA 400</span>
            <span>THIẾT BỊ GIA ARCHIVE</span>
            <span>SAFETY FILM 5052</span>
            <span>PORTRA 400</span>
          </div>

          {/* Film Frames Row */}
          <div className="flex items-stretch gap-5 px-2">
            {GROUP_MOMENTS.map((moment, idx) => (
              <button
                key={moment.id}
                type="button"
                onClick={() => {
                  soundEngine.playShutter();
                  setLightboxIdx(idx);
                }}
                className="group relative w-[330px] sm:w-[410px] shrink-0 text-left rounded-md overflow-hidden border-2 border-white/10 hover:border-rec transition-colors bg-obsidian"
              >
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img
                    src={moment.src}
                    alt={moment.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-transparent to-transparent opacity-90" />

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
            {GROUP_MOMENTS.map((m) => (
              <span key={m.id}>{m.frameCode}</span>
            ))}
          </div>

          {/* Bottom Sprocket Holes */}
          <div className="flex items-center justify-between gap-3 px-2 pt-2.5">
            {Array.from({ length: 34 }).map((_, i) => (
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
                  className="p-1.5 rounded-lg border border-obsidian-border hover:border-rec text-ivory-muted hover:text-ivory"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Image */}
              <div className="relative bg-obsidian flex items-center justify-center max-h-[70dvh] overflow-hidden">
                <img
                  src={activeMoment.src}
                  alt={activeMoment.title}
                  className="max-h-[70dvh] w-auto object-contain"
                />

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(0.85);
                    setLightboxIdx(
                      (lightboxIdx - 1 + GROUP_MOMENTS.length) %
                        GROUP_MOMENTS.length
                    );
                  }}
                  className="absolute left-3 p-2.5 rounded-full bg-obsidian/80 border border-white/15 hover:border-rec text-ivory"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(0.85);
                    setLightboxIdx((lightboxIdx + 1) % GROUP_MOMENTS.length);
                  }}
                  className="absolute right-3 p-2.5 rounded-full bg-obsidian/80 border border-white/15 hover:border-rec text-ivory"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Caption Footer */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

