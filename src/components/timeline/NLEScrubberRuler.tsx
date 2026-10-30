"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { deferTimelineAutoplay, timelineMotion, useAppStore, useSiteContent } from "@/lib/store";
import { formatTimecodeFromProgress } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

const TOTAL_TICKS = 84;

export function NLEScrubberRuler() {
  const siteContent = useSiteContent();
  const crewMembers = siteContent.crew;
  const workProjects = siteContent.works;
  const timelineMode = useAppStore((s) => s.timelineMode);
  const activeWorkIndex = useAppStore((s) => s.activeWorkIndex);
  const setActiveWorkIndex = useAppStore((s) => s.setActiveWorkIndex);
  const setCursor = useAppStore((s) => s.setCursor);

  const trackRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const timecodeRef = useRef<HTMLDivElement>(null);
  const ticksRef = useRef<(HTMLSpanElement | null)[]>([]);
  const draggingRef = useRef(false);

  const isCrewMode = timelineMode === "crew";
  const totalItems = isCrewMode ? crewMembers.length : workProjects.length;

  useEffect(() => {
    const updateScrubberUI = () => {
      let progress = 0;
      if (totalItems > 1) {
        const wrappedIndex =
          ((timelineMotion.currentIndex % totalItems) + totalItems) % totalItems;
        progress = wrappedIndex / totalItems;
      }

      if (playheadRef.current) {
        playheadRef.current.style.left = `${progress * 100}%`;
      }

      if (timecodeRef.current) {
        timecodeRef.current.textContent = formatTimecodeFromProgress(
          progress,
          totalItems
        );
      }

      // Sine-wave tick height modulation (Skill: horizontal-tiles Minimap)
      for (let i = 0; i < TOTAL_TICKS; i++) {
        const el = ticksRef.current[i];
        if (!el) continue;
        const tickPos = i / (TOTAL_TICKS - 1);
        const dist = Math.abs(tickPos - progress);
        const wave = Math.max(0, 1 - dist * 12);
        const isMajor = i % 7 === 0;
        const baseH = isMajor ? 18 : 10;
        const h = baseH + wave * 18;
        el.style.height = `${h.toFixed(1)}px`;
        el.style.opacity = (0.28 + wave * 0.72).toFixed(2);
      }
    };

    gsap.ticker.add(updateScrubberUI);
    return () => {
      gsap.ticker.remove(updateScrubberUI);
    };
  }, [isCrewMode, totalItems]);

  const scrubFromClientX = (clientX: number) => {
    if (!trackRef.current) return;
    deferTimelineAutoplay();
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const exactIndex = ratio * (totalItems - 1);
    if (totalItems > 1) {
      const rawOffset = exactIndex - timelineMotion.currentIndex;
      const wrappedOffset =
        ((rawOffset + totalItems / 2) % totalItems + totalItems) % totalItems -
        totalItems / 2;
      timelineMotion.targetIndex = timelineMotion.currentIndex + wrappedOffset;
    } else timelineMotion.targetIndex = exactIndex;
    setActiveWorkIndex(Math.round(exactIndex), false);
  };

  const activeName = isCrewMode
    ? crewMembers[activeWorkIndex]?.name ?? ""
    : workProjects[activeWorkIndex]?.title ?? "";

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 pointer-events-auto select-none">
      <div className="rounded-2xl border border-obsidian-border/90 bg-obsidian-surface/80 backdrop-blur-xl px-4 sm:px-8 pt-3.5 pb-3 shadow-[0_16px_48px_rgba(0,0,0,0.65)]">
        {/* Top Timecode & Active Name Row */}
        <div className="flex items-center justify-between text-xs font-mono mb-2.5 gap-2">
          <div className="flex items-center gap-2 text-ivory-muted min-w-0">
            <span className="w-2 h-2 rounded-full bg-rec animate-pulse shrink-0" />
            <span className="hidden sm:inline shrink-0">
              {isCrewMode ? "CREW TIMELINE" : "WORKS TIMELINE"}
            </span>
            <span className="text-rec font-semibold truncate">
              • {activeName}
            </span>
          </div>

          <div
            ref={timecodeRef}
            className="text-base sm:text-lg font-bold tracking-[0.14em] text-ivory shrink-0"
          >
            00:00:00:00
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => useAppStore.getState().stepWorkIndex(-1)}
              className="px-2.5 py-1 rounded border border-obsidian-border bg-obsidian/70 hover:border-rec/60 text-ivory-muted hover:text-ivory transition-colors"
            >
              ←
            </button>
            <span className="text-ivory-muted px-1">
              {String(activeWorkIndex + 1).padStart(2, "0")} /{" "}
              {String(totalItems).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => useAppStore.getState().stepWorkIndex(1)}
              className="px-2.5 py-1 rounded border border-obsidian-border bg-obsidian/70 hover:border-rec/60 text-ivory-muted hover:text-ivory transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* Interactive Ruler Track */}
        <div
          ref={trackRef}
          onMouseEnter={() => setCursor("drag", "KÉO TUA")}
          onMouseLeave={() => setCursor("default", "")}
          onPointerDown={(e) => {
            draggingRef.current = true;
            timelineMotion.isDragging = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            scrubFromClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!draggingRef.current) return;
            scrubFromClientX(e.clientX);
          }}
          onPointerUp={(e) => {
            draggingRef.current = false;
            timelineMotion.isDragging = false;
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            timelineMotion.targetIndex = Math.round(timelineMotion.targetIndex);
            deferTimelineAutoplay();
          }}
          className="relative h-11 flex items-center cursor-ew-resize touch-none"
        >
          {/* Tick marks across width */}
          <div className="w-full flex items-center justify-between pointer-events-none">
            {Array.from({ length: TOTAL_TICKS }).map((_, i) => (
              <span
                key={i}
                ref={(el) => {
                  ticksRef.current[i] = el;
                }}
                className={`w-[1.5px] rounded-full transition-colors ${
                  i % 7 === 0 ? "bg-ivory" : "bg-ivory-muted"
                }`}
                style={{ height: i % 7 === 0 ? "18px" : "10px", opacity: 0.35 }}
              />
            ))}
          </div>

          {/* Glowing REC Orange Playhead Needle */}
          <div
            ref={playheadRef}
            className="pointer-events-none absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center"
            style={{ left: "0%" }}
          >
            <span className="w-2.5 h-2.5 rotate-45 bg-rec -mt-1 shadow-[0_0_12px_#FF4D00]" />
            <span className="w-[2px] flex-1 bg-rec shadow-[0_0_16px_#FF4D00,0_0_30px_rgba(255,77,0,0.8)]" />
          </div>
        </div>

        {/* Numbered Markers (01..16 Members or 01..12 Works) */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06] overflow-x-auto">
          {isCrewMode
            ? crewMembers.map((m, idx) => {
                const isActive = idx === activeWorkIndex;
                return (
                  <button
                    key={m.id}
                    type="button"
                    title={`#${m.badgeNumber} — ${m.name} (${m.roleTitle})`}
                    onClick={() => {
                      soundEngine.playTick(0.95);
                      setActiveWorkIndex(idx, true);
                    }}
                    className={`min-w-7 min-h-8 flex items-center justify-center px-1 sm:px-1.5 py-0.5 rounded font-mono text-xs transition-all shrink-0 ${
                      isActive
                        ? "text-rec font-bold scale-110 bg-rec/10"
                        : "text-ivory-subtle hover:text-ivory"
                    }`}
                  >
                    {m.badgeNumber}
                  </button>
                );
              })
            : workProjects.map((w, idx) => {
                const isActive = idx === activeWorkIndex;
                return (
                  <button
                    key={w.id}
                    type="button"
                    title={`Scene ${w.indexLabel} — ${w.title}`}
                    onClick={() => {
                      soundEngine.playTick(0.95);
                      setActiveWorkIndex(idx, true);
                    }}
                    className={`min-w-7 min-h-8 flex items-center justify-center px-1.5 py-0.5 rounded font-mono text-xs transition-all shrink-0 ${
                      isActive
                        ? "text-rec font-bold scale-110 bg-rec/10"
                        : "text-ivory-subtle hover:text-ivory"
                    }`}
                  >
                    {w.indexLabel}
                  </button>
                );
              })}
        </div>
      </div>
    </div>
  );
}
