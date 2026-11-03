"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { deferTimelineAutoplay, timelineMotion, useAppStore, useSiteContent } from "@/lib/store";
import { soundEngine } from "@/lib/sound";
import { getHome3DWorks } from "@/lib/home-3d-works";

const TOTAL_TICKS = 48;

export function NLEScrubberRuler() {
  const siteContent = useSiteContent();
  const crewMembers = siteContent.crew;
  const workProjects = getHome3DWorks(siteContent.works);
  const timelineMode = useAppStore((s) => s.timelineMode);
  const activeWorkIndex = useAppStore((s) => s.activeWorkIndex);
  const setActiveWorkIndex = useAppStore((s) => s.setActiveWorkIndex);
  const setCursor = useAppStore((s) => s.setCursor);

  const trackRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const ticksRef = useRef<(HTMLSpanElement | null)[]>([]);
  const draggingRef = useRef(false);

  const isCrewMode = timelineMode === "crew";
  const totalItems = isCrewMode ? crewMembers.length : workProjects.length;
  const activeName = isCrewMode
    ? crewMembers[activeWorkIndex]?.name ?? ""
    : workProjects[activeWorkIndex]?.title ?? "";

  useEffect(() => {
    const updateScrubberUI = () => {
      const index = totalItems > 1
        ? ((timelineMotion.currentIndex % totalItems) + totalItems) % totalItems
        : 0;
      const progress = totalItems > 1 ? index / (totalItems - 1) : 0;

      if (playheadRef.current) playheadRef.current.style.left = `${progress * 100}%`;

      for (let i = 0; i < TOTAL_TICKS; i++) {
        const tick = ticksRef.current[i];
        if (!tick) continue;
        const distance = Math.abs(i / (TOTAL_TICKS - 1) - progress);
        const focus = Math.max(0, 1 - distance * 14);
        const major = i % 6 === 0;
        tick.style.height = `${(major ? 12 : 6) + focus * 7}px`;
        tick.style.opacity = `${0.24 + focus * 0.7}`;
      }
    };

    gsap.ticker.add(updateScrubberUI);
    return () => gsap.ticker.remove(updateScrubberUI);
  }, [totalItems]);

  const scrubFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track || totalItems <= 0) return;

    deferTimelineAutoplay();
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const exactIndex = ratio * Math.max(0, totalItems - 1);
    const rawOffset = exactIndex - timelineMotion.currentIndex;
    const wrappedOffset = totalItems > 1
      ? ((rawOffset + totalItems / 2) % totalItems + totalItems) % totalItems - totalItems / 2
      : 0;

    timelineMotion.targetIndex = timelineMotion.currentIndex + wrappedOffset;
    setActiveWorkIndex(Math.round(exactIndex), false);
  };

  const finishDrag = (pointerId: number) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    timelineMotion.isDragging = false;
    const track = trackRef.current;
    if (track?.hasPointerCapture(pointerId)) track.releasePointerCapture(pointerId);
    timelineMotion.targetIndex = Math.round(timelineMotion.targetIndex);
    deferTimelineAutoplay();
  };

  const step = (direction: -1 | 1) => {
    soundEngine.playTick(0.9);
    useAppStore.getState().stepWorkIndex(direction);
  };

  return (
    <div className="pointer-events-auto mx-auto w-full max-w-[1120px] select-none px-3 sm:px-6">
      <div className="rounded-xl border border-obsidian-border/80 bg-obsidian-surface/85 px-3 py-2 shadow-[0_10px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-4 sm:py-2.5">
        <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2 sm:mb-2">
          <div className="flex min-w-0 items-center gap-2 font-mono text-[9px] sm:text-[10px]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rec" />
            <span className="hidden shrink-0 text-ivory-subtle sm:inline">
              {isCrewMode ? "CREW" : "PROJECTS"}
            </span>
            <span className="truncate text-ivory-muted">{activeName}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Mục trước"
                onClick={() => step(-1)}
                className="grid h-6 w-6 place-items-center rounded-md border border-obsidian-border text-ivory-muted transition-colors hover:border-rec/60 hover:text-ivory sm:h-7 sm:w-7"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[38px] text-center font-mono text-[9px] text-ivory-subtle sm:min-w-[44px] sm:text-[10px]">
                {String(activeWorkIndex + 1).padStart(2, "0")}/{String(totalItems).padStart(2, "0")}
              </span>
              <button
                type="button"
                aria-label="Mục tiếp theo"
                onClick={() => step(1)}
                className="grid h-6 w-6 place-items-center rounded-md border border-obsidian-border text-ivory-muted transition-colors hover:border-rec/60 hover:text-ivory sm:h-7 sm:w-7"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={trackRef}
          role="slider"
          aria-label={isCrewMode ? "Timeline thành viên" : "Timeline dự án"}
          aria-valuemin={1}
          aria-valuemax={Math.max(1, totalItems)}
          aria-valuenow={Math.min(Math.max(1, activeWorkIndex + 1), Math.max(1, totalItems))}
          onMouseEnter={() => setCursor("drag", "KÉO TIMELINE")}
          onMouseLeave={() => setCursor("default", "")}
          onPointerDown={(event) => {
            draggingRef.current = true;
            timelineMotion.isDragging = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            scrubFromClientX(event.clientX);
          }}
          onPointerMove={(event) => {
            if (draggingRef.current) scrubFromClientX(event.clientX);
          }}
          onPointerUp={(event) => finishDrag(event.pointerId)}
          onPointerCancel={(event) => finishDrag(event.pointerId)}
          className="relative flex h-7 cursor-ew-resize touch-none items-center sm:h-8"
        >
          <div className="pointer-events-none flex w-full items-center justify-between">
            {Array.from({ length: TOTAL_TICKS }, (_, index) => (
              <span
                key={index}
                ref={(element) => { ticksRef.current[index] = element; }}
                className={`w-px rounded-full ${index % 6 === 0 ? "bg-ivory/80" : "bg-ivory-muted"}`}
                style={{ height: index % 6 === 0 ? "12px" : "6px", opacity: 0.3 }}
              />
            ))}
          </div>
          <div
            ref={playheadRef}
            className="pointer-events-none absolute inset-y-0 flex -translate-x-1/2 flex-col items-center"
            style={{ left: "0%" }}
          >
            <span className="h-2 w-2 rotate-45 rounded-[1px] bg-rec shadow-[0_0_9px_#FF4D00]" />
            <span className="w-0.5 flex-1 bg-rec shadow-[0_0_12px_rgba(255,77,0,0.75)]" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-0.5 border-t border-white/[0.06] pt-1">
          {isCrewMode
            ? crewMembers.map((member, index) => (
                <button
                  key={member.id}
                  type="button"
                  title={`#${member.badgeNumber} — ${member.name}`}
                  aria-label={`Chọn thành viên ${member.name}`}
                  aria-current={index === activeWorkIndex ? "true" : undefined}
                  onClick={() => {
                    soundEngine.playTick(0.95);
                    setActiveWorkIndex(index, true);
                  }}
                  className={`min-w-0 flex-1 rounded py-0.5 font-mono text-[8px] leading-none transition-colors sm:text-[9px] ${
                    index === activeWorkIndex
                      ? "bg-rec/10 font-bold text-rec"
                      : "text-ivory-subtle hover:text-ivory"
                  }`}
                >
                  {member.badgeNumber}
                </button>
              ))
            : workProjects.map((work, index) => (
                <button
                  key={work.id}
                  type="button"
                  title={`Scene ${work.indexLabel} — ${work.title}`}
                  aria-label={`Chọn dự án ${work.title}`}
                  aria-current={index === activeWorkIndex ? "true" : undefined}
                  onClick={() => {
                    soundEngine.playTick(0.95);
                    setActiveWorkIndex(index, true);
                  }}
                  className={`min-w-0 flex-1 rounded py-0.5 font-mono text-[8px] leading-none transition-colors sm:text-[9px] ${
                    index === activeWorkIndex
                      ? "bg-rec/10 font-bold text-rec"
                      : "text-ivory-subtle hover:text-ivory"
                  }`}
                >
                  {work.indexLabel}
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}
