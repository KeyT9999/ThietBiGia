"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Maximize2,
  Pause,
  Play,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { GROUP_CATEGORY_META } from "@/data/moments";
import { useSiteContent } from "@/lib/store";
import { soundEngine } from "@/lib/sound";
import { ZoomPanImage } from "@/components/works/ZoomPanImage";

const EDGE_MARKINGS = [
  "KODAK PORTRA 400",
  "THIẾT BỊ GIA COLLECTIVE",
  "SAFETY FILM 5052",
  "FUDA MASTERALBUM",
] as const;

const SPROCKET_SLOTS = Array.from({ length: 9 });

function FilmFrameImage({ src, alt }: { src: string; alt: string }) {
  const [needsContain, setNeedsContain] = useState(false);

  const checkRatio = useCallback((img: HTMLImageElement | null) => {
    if (!img || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
      return;
    }
    const ratio = img.naturalWidth / img.naturalHeight;
    setNeedsContain(Math.abs(ratio - 1.5) > 0.08);
  }, []);

  return (
    <>
      {needsContain && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-40"
        />
      )}
      <img
        ref={checkRatio}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={(e) => checkRatio(e.currentTarget)}
        className={`relative z-10 h-full w-full transition-transform duration-500 group-hover:scale-[1.03] ${
          needsContain ? "object-contain" : "object-cover"
        }`}
      />
    </>
  );
}

export function FilmStripArchive() {
  const siteContent = useSiteContent();
  const about = siteContent.about;
  // Display the entire collective group photo archive on the 35mm contact roll
  const moments = siteContent.moments.filter((moment) =>
    Boolean(moment.src?.trim())
  );
  const crewMembers = siteContent.crew;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    isDown: false,
    moved: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [autoReel, setAutoReel] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentVisibleFrame, setCurrentVisibleFrame] = useState(1);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const syncScrollMetrics = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || moments.length === 0) return;
    const maxScroll = Math.max(1, el.scrollWidth - el.clientWidth);
    const ratio = Math.min(1, Math.max(0, el.scrollLeft / maxScroll));
    setScrollProgress(ratio);
    const approxIdx = Math.min(
      moments.length,
      Math.max(1, Math.round(ratio * (moments.length - 1)) + 1)
    );
    setCurrentVisibleFrame(approxIdx);
  }, [moments.length]);

  useEffect(() => {
    syncScrollMetrics();
    window.addEventListener("resize", syncScrollMetrics);
    return () => window.removeEventListener("resize", syncScrollMetrics);
  }, [syncScrollMetrics]);

  // Smooth optional Auto-Reel motor (pauses on hover, drag, or open lightbox)
  useEffect(() => {
    if (!autoReel || isHovered || isDragging || lightboxIdx !== null) return;
    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min(50, now - lastTs);
      lastTs = now;
      const el = scrollerRef.current;
      if (el) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          if (el.scrollLeft >= maxScroll - 2) {
            el.scrollLeft = 0;
          } else {
            el.scrollLeft += dt * 0.075;
          }
        }
      }
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [autoReel, isHovered, isDragging, lightboxIdx]);

  useEffect(() => {
    if (lightboxIdx === null || moments.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setLightboxIdx(null);
        setLightboxZoomed(false);
      }
      if (e.key === "ArrowRight") {
        setLightboxIdx((i) => (i === null ? null : (i + 1) % moments.length));
      }
      if (e.key === "ArrowLeft") {
        setLightboxIdx((i) =>
          i === null ? null : (i - 1 + moments.length) % moments.length
        );
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [lightboxIdx, moments.length]);

  const scrollStrip = (dir: -1 | 1) => {
    soundEngine.playTick(0.85);
    scrollerRef.current?.scrollBy({
      left: dir * 860,
      behavior: "smooth",
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    dragStateRef.current = {
      isDown: true,
      moved: false,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    const el = scrollerRef.current;
    if (!state.isDown || !el) return;
    const dx = e.clientX - state.startX;
    if (!state.moved && Math.abs(dx) > 6) {
      state.moved = true;
      setIsDragging(true);
    }
    if (state.moved) {
      el.scrollLeft = state.startScrollLeft - dx;
    }
  };

  const endPointerDrag = () => {
    if (!dragStateRef.current.isDown) return;
    dragStateRef.current.isDown = false;
    window.setTimeout(() => {
      dragStateRef.current.moved = false;
      setIsDragging(false);
    }, 0);
  };

  const activeMoment =
    lightboxIdx !== null ? moments[lightboxIdx] ?? null : null;

  if (moments.length === 0) return null;

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-rec uppercase tracking-widest">
            <Film className="w-3.5 h-3.5" />
            <span>
              {about.filmStripEyebrow.replaceAll("{count}", String(moments.length))}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory">
            {about.filmStripTitle}
          </h2>
          <p className="text-sm text-ivory-muted max-w-2xl">
            {about.filmStripDescription.replaceAll("{count}", String(moments.length))}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <span className="text-xs font-mono text-ivory-subtle hidden sm:inline">
            KODAK PORTRA 400 • FRAME{" "}
            <span className="text-amber-400 font-bold">
              {String(currentVisibleFrame).padStart(2, "0")}
            </span>{" "}
            / {String(moments.length).padStart(2, "0")}
          </span>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTick(0.8);
              setAutoReel((v) => !v);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
              autoReel
                ? "border-rec bg-rec/15 text-rec font-bold"
                : "border-obsidian-border bg-obsidian-surface text-ivory-muted hover:text-ivory hover:border-rec/60"
            }`}
          >
            {autoReel ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>TẠM DỪNG TRÔI</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-rec" />
                <span>TỰ TRÔI PHIM</span>
              </>
            )}
          </button>

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

      {/* Physical 35mm Film Strip Container (starts cleanly at 0px with zero left clipping) */}
      <div
        ref={scrollerRef}
        onScroll={syncScrollMetrics}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
          setIsHovered(false);
          endPointerDrag();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        className={`relative rounded-2xl border border-obsidian-border bg-[#07080B] py-4 overflow-x-auto select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div className="inline-flex items-stretch px-4 sm:px-5">
          {moments.map((moment, idx) => {
            const catMeta = GROUP_CATEGORY_META[moment.category];
            const displayCode =
              moment.frameCode || `► ${String(idx + 1).padStart(2, "0")}A`;
            const topMarking = EDGE_MARKINGS[idx % EDGE_MARKINGS.length];

            return (
              <div
                key={moment.id}
                className="flex flex-col shrink-0 w-[338px] sm:w-[424px] px-2 sm:px-2.5"
              >
                {/* Top Sprocket Holes */}
                <div className="flex items-center justify-between px-1 pb-2">
                  {SPROCKET_SLOTS.map((_, sIdx) => (
                    <span
                      key={`t-${moment.id}-${sIdx}`}
                      className="w-3.5 h-2.5 rounded-[2px] bg-obsidian-surface border border-white/10 shrink-0"
                    />
                  ))}
                </div>

                {/* Top Edge Film Marking */}
                <div className="flex items-center justify-between px-1 pb-1.5 text-[10px] sm:text-[11px] font-mono text-amber-400/80 tracking-widest uppercase">
                  <span>{topMarking}</span>
                  <span className="text-amber-400/55">
                    {String(idx + 1).padStart(2, "0")}/{String(moments.length).padStart(2, "0")}
                  </span>
                </div>

                {/* Exposure Frame */}
                <button
                  type="button"
                  onClick={() => {
                    if (dragStateRef.current.moved) return;
                    soundEngine.playShutter();
                    setLightboxIdx(idx);
                    setLightboxZoomed(false);
                  }}
                  className="group relative w-full text-left rounded-md overflow-hidden border-2 border-white/12 hover:border-rec transition-colors bg-obsidian cursor-pointer"
                >
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-obsidian">
                    <FilmFrameImage src={moment.src} alt={moment.title} />

                    <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-obsidian/92 via-obsidian/10 to-transparent" />

                    <span className="pointer-events-none absolute top-3 left-3 z-30 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-obsidian/85 border border-white/15 text-[11px] font-mono text-ivory">
                      <Users className="w-3 h-3 text-rec shrink-0" />
                      <span>{moment.detectedFaceCount ?? 12}+ anh em</span>
                    </span>

                    <span className="pointer-events-none absolute top-3 right-3 z-30 p-1.5 rounded-md bg-obsidian/80 border border-white/15 text-ivory opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-rec" />
                    </span>

                    <div className="pointer-events-none absolute bottom-3 left-3.5 right-3.5 z-30 space-y-0.5">
                      <div className="text-xs font-mono text-amber-400 font-bold truncate">
                        {displayCode}
                        {moment.dateLabel ? ` • ${moment.dateLabel}` : ""}
                      </div>
                      <div className="font-display font-bold text-sm sm:text-base text-ivory truncate">
                        {moment.title}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Bottom Edge Frame Number & Category */}
                <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] sm:text-[11px] font-mono text-amber-400/85 tracking-wider">
                  <span className="font-bold">{displayCode}</span>
                  <span className="text-ivory-subtle truncate max-w-[65%]">
                    {catMeta?.shortLabel ?? "TẬP THỂ TBG"}
                  </span>
                </div>

                {/* Bottom Sprocket Holes */}
                <div className="flex items-center justify-between px-1 pt-2">
                  {SPROCKET_SLOTS.map((_, sIdx) => (
                    <span
                      key={`b-${moment.id}-${sIdx}`}
                      className="w-3.5 h-2.5 rounded-[2px] bg-obsidian-surface border border-white/10 shrink-0"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Film Roll Scrubber Bar (Jump instantly anywhere from Frame 01 to Frame 36) */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-[11px] font-mono text-amber-400 font-bold shrink-0">
          ► 01A
        </span>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(scrollProgress * 1000)}
          aria-label="Thanh tua nhanh cuộn phim kỷ niệm"
          onChange={(e) => {
            const el = scrollerRef.current;
            if (!el) return;
            const nextRatio = Number(e.target.value) / 1000;
            const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
            el.scrollLeft = nextRatio * maxScroll;
          }}
          className="w-full h-1.5 rounded-full appearance-none bg-obsidian-surface accent-[#FF4D00] cursor-pointer"
        />
        <span className="text-[11px] font-mono text-amber-400 font-bold shrink-0">
          ► {String(moments.length).padStart(2, "0")}A
        </span>
      </div>

      {/* Portaled Full-Screen Analog Lightbox */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {activeMoment && lightboxIdx !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setLightboxIdx(null);
                    setLightboxZoomed(false);
                  }}
                  data-lenis-prevent
                  className="fixed inset-0 z-[95] bg-obsidian/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
                >
                  <motion.div
                    initial={{ scale: 0.94, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.94, opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-5xl w-full max-h-[92dvh] rounded-2xl border border-obsidian-border bg-obsidian-surface overflow-hidden shadow-2xl flex flex-col"
                  >
                    {/* Lightbox Header */}
                    <div className="px-5 py-3.5 border-b border-obsidian-border flex flex-wrap items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-amber-400 font-bold">
                          {activeMoment.frameCode ||
                            `► ${String(lightboxIdx + 1).padStart(2, "0")}A`}
                        </span>
                        <span className="text-rec font-bold">
                          FRAME {lightboxIdx + 1} / {moments.length}
                        </span>
                        <span className="text-ivory-muted hidden sm:inline">
                          {activeMoment.filmStock || "KODAK PORTRA 400 • 35MM"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playTick(0.8);
                            setLightboxZoomed((z) => !z);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                            lightboxZoomed
                              ? "border-cyan-400 bg-cyan-400/15 text-cyan-300 font-bold"
                              : "border-obsidian-border text-ivory-muted hover:text-ivory"
                          }`}
                        >
                          {lightboxZoomed ? (
                            <>
                              <ZoomOut className="w-3.5 h-3.5" />
                              <span>THU NHỎ (1X)</span>
                            </>
                          ) : (
                            <>
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>SOI NÉT (2X)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          aria-label="Đóng ảnh phóng lớn"
                          onClick={() => {
                            setLightboxIdx(null);
                            setLightboxZoomed(false);
                          }}
                          className="p-1.5 rounded-lg border border-obsidian-border hover:border-rec text-ivory-muted hover:text-ivory cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Main Full-Resolution Uncropped Image */}
                    <div
                      className="relative bg-obsidian flex-1 min-h-0 flex items-center justify-center overflow-hidden p-3"
                    >
                      <img
                        src={activeMoment.src}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-110"
                      />
                      <ZoomPanImage
                        src={activeMoment.src}
                        alt={activeMoment.title}
                        zoomed={lightboxZoomed}
                        onToggleZoom={() => setLightboxZoomed((z) => !z)}
                        className="relative z-10 max-h-[62dvh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
                      />

                      <button
                        type="button"
                        aria-label="Ảnh trước"
                        onClick={() => {
                          soundEngine.playTick(0.85);
                          setLightboxIdx(
                            (lightboxIdx - 1 + moments.length) % moments.length
                          );
                        }}
                        className="absolute z-20 left-3 p-2.5 rounded-full bg-obsidian/85 border border-white/15 hover:border-rec text-ivory cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        aria-label="Ảnh tiếp theo"
                        onClick={() => {
                          soundEngine.playTick(0.85);
                          setLightboxIdx((lightboxIdx + 1) % moments.length);
                        }}
                        className="absolute z-20 right-3 p-2.5 rounded-full bg-obsidian/85 border border-white/15 hover:border-rec text-ivory cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Caption & Crew Tags Footer */}
                    <div className="p-4 sm:p-5 border-t border-obsidian-border space-y-3 shrink-0 max-h-[28dvh] overflow-y-auto">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-bold text-ivory">
                            {activeMoment.title}
                          </h3>
                          {activeMoment.caption && (
                            <p className="text-xs sm:text-sm text-ivory-muted mt-0.5">
                              {activeMoment.caption}
                            </p>
                          )}
                        </div>
                        {activeMoment.location && (
                          <span className="text-xs font-mono text-rec shrink-0">
                            {activeMoment.location}
                          </span>
                        )}
                      </div>

                      {activeMoment.memberSlugs &&
                        activeMoment.memberSlugs.length > 0 && (
                          <div className="pt-2.5 border-t border-obsidian-border flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono text-ivory-subtle uppercase">
                              Nhận diện thành viên:
                            </span>
                            {activeMoment.memberSlugs.map((slug) => {
                              const member = crewMembers.find(
                                (item) => item.slug === slug
                              );
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
            </AnimatePresence>,
            document.body
          )
        : null}
    </section>
  );
}
