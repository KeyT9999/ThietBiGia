"use client";

import { useRef, useState } from "react";
import { MoveHorizontal, SlidersHorizontal } from "lucide-react";
import { soundEngine } from "@/lib/sound";

export function BeforeAfterGradeSlider({
  afterSrc,
  beforeSrc,
  title,
  isPortrait = false,
}: {
  afterSrc: string;
  beforeSrc?: string;
  title: string;
  isPortrait?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPct, setSplitPct] = useState(50);
  const draggingRef = useRef(false);
  const lastStepRef = useRef(50);

  const updateFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100));
    setSplitPct(pct);
    if (Math.abs(pct - lastStepRef.current) >= 6) {
      lastStepRef.current = pct;
      soundEngine.playTick(0.45);
    }
  };

  const imgFitClass = isPortrait
    ? "h-full w-auto max-w-full object-contain select-none pointer-events-none"
    : "w-full h-full object-cover select-none pointer-events-none";

  return (
    <div
      ref={containerRef}
      onPointerDown={(e) => {
        draggingRef.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!draggingRef.current) return;
        updateFromClientX(e.clientX);
      }}
      onPointerUp={(e) => {
        draggingRef.current = false;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }}
      className="relative h-full w-full bg-obsidian overflow-hidden cursor-ew-resize touch-none select-none flex items-center justify-center"
    >
      {/* Ambient studio backdrop */}
      <img
        src={afterSrc}
        alt=""
        className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110"
      />

      {/* BASE LAYER (RIGHT SIDE): Final Color Graded / Retouched Master */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <img src={afterSrc} alt={`${title} — Final Grade`} className={imgFitClass} />
      </div>

      {/* CLIPPED TOP LAYER (LEFT SIDE): Camera RAW / S-Log3 Flat Profile */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - splitPct}% 0 0)` }}
      >
        <img
          src={beforeSrc ?? afterSrc}
          alt={`${title} — Camera RAW / S-Log3`}
          style={
            beforeSrc
              ? undefined
              : {
                  filter:
                    "contrast(0.68) saturate(0.42) brightness(1.08) sepia(0.08)",
                }
          }
          className={imgFitClass}
        />
      </div>

      {/* Vertical Split Wipe Line & Tactile Handle */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 z-30 -translate-x-1/2 flex flex-col items-center"
        style={{ left: `${splitPct}%` }}
      >
        <div className="w-[2px] flex-1 bg-rec shadow-[0_0_16px_#FF4D00]" />
        <div className="w-10 h-10 rounded-full bg-rec text-obsidian border-2 border-ivory shadow-[0_0_24px_rgba(255,77,0,0.65)] flex items-center justify-center shrink-0">
          <MoveHorizontal className="w-4 h-4" />
        </div>
        <div className="w-[2px] flex-1 bg-rec shadow-[0_0_16px_#FF4D00]" />
      </div>

      {/* Top Left / Right Grading Scope Labels */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-30">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian/85 border border-white/15 backdrop-blur-md text-xs font-mono text-ivory-muted">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span>BEFORE // RAW • S-LOG3 SENSOR</span>
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 z-30">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian/85 border border-rec/50 backdrop-blur-md text-xs font-mono font-bold text-rec">
          <span>AFTER // FINAL COLOR GRADE</span>
        </span>
      </div>
    </div>
  );
}
