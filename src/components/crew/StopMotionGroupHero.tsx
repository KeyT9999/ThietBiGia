"use client";

import { useEffect, useState } from "react";
import { Aperture, Play, Pause, Sparkles } from "lucide-react";
import { soundEngine } from "@/lib/sound";
import { useAppStore } from "@/lib/store";

export function StopMotionGroupHero() {
  const [frameIdx, setFrameIdx] = useState<0 | 1>(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [flash, setFlash] = useState(false);
  const setCursor = useAppStore((s) => s.setCursor);

  const triggerShutter = (nextFrame?: 0 | 1, withSound = false) => {
    if (withSound) {
      soundEngine.playShutter();
    }
    setFlash(true);
    setFrameIdx((prev) => (nextFrame !== undefined ? nextFrame : prev === 0 ? 1 : 0));
    setTimeout(() => setFlash(false), 110);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setFrameIdx((prev) => (prev === 0 ? 1 : 0));
    }, 1550);
    return () => clearInterval(id);
  }, [autoPlay]);

  return (
    <div className="rounded-3xl border border-obsidian-border bg-obsidian-surface overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
      {/* Top 35mm Viewfinder Metadata Bar */}
      <div className="px-4 sm:px-6 py-3 bg-obsidian/90 border-b border-obsidian-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 text-rec font-bold">
            <span className="w-2 h-2 rounded-full bg-rec animate-pulse" />
            STOP-MOTION 2-FRAME
          </span>
          <span className="text-ivory-subtle hidden sm:inline">|</span>
          <span className="text-ivory-muted hidden sm:inline">
            TRIPOD LOCKED • KODAK PORTRA 400
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTick(0.8);
              setAutoPlay((v) => !v);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-colors ${
              autoPlay
                ? "border-rec/50 bg-rec/15 text-rec font-semibold"
                : "border-obsidian-border bg-obsidian text-ivory-muted hover:text-ivory"
            }`}
          >
            {autoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{autoPlay ? "AUTO LOOP: ON" : "AUTO LOOP: OFF"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAutoPlay(false);
              triggerShutter(undefined, true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors"
          >
            <Aperture className="w-3.5 h-3.5" />
            <span>BẤM CHỤP [{frameIdx === 0 ? "01A → 02A" : "02A → 01A"}]</span>
          </button>
        </div>
      </div>

      {/* Interactive Locked-Off 2-Frame Viewport */}
      <div
        onClick={() => {
          setAutoPlay(false);
          triggerShutter(undefined, true);
        }}
        onMouseEnter={() => {
          setCursor("project", "BẤM ĐỔI DÁNG");
          if (!autoPlay) triggerShutter(1, true);
        }}
        onMouseLeave={() => {
          setCursor("default", "");
          if (!autoPlay) triggerShutter(0, false);
        }}
        className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/10] w-full overflow-hidden cursor-pointer select-none bg-obsidian group"
      >
        {/* Frame 01A: Giơ máy ngắm thẳng */}
        <img
          src="/anhchungtbg.jpg"
          alt="Anh em Thiết Bị Gia — Frame 01A"
          className={`absolute inset-0 w-full h-full object-cover object-[50%_62%] transition-opacity duration-150 ${
            frameIdx === 0 ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Frame 02A: Cùng chỉ tay lên bầu trời */}
        <img
          src="/anhchungtbg2.jpg"
          alt="Anh em Thiết Bị Gia — Frame 02A"
          className={`absolute inset-0 w-full h-full object-cover object-[50%_62%] transition-opacity duration-150 ${
            frameIdx === 1 ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Subtle Shutter Curtain Flash */}
        <div
          className={`pointer-events-none absolute inset-0 bg-ivory mix-blend-overlay transition-opacity duration-100 ${
            flash ? "opacity-45" : "opacity-0"
          }`}
        />

        {/* Bottom & Top Vignette for crisp HUD legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/10 to-obsidian/35" />

        {/* Camera Viewfinder Corner Brackets & Focus Box over Crew */}
        <div className="pointer-events-none absolute inset-4 sm:inset-6 border border-white/15 rounded-xl">
          <span className="absolute -top-[1px] -left-[1px] w-5 h-5 border-t-2 border-l-2 border-rec rounded-tl-xl" />
          <span className="absolute -top-[1px] -right-[1px] w-5 h-5 border-t-2 border-r-2 border-rec rounded-tr-xl" />
          <span className="absolute -bottom-[1px] -left-[1px] w-5 h-5 border-b-2 border-l-2 border-rec rounded-bl-xl" />
          <span className="absolute -bottom-[1px] -right-[1px] w-5 h-5 border-b-2 border-r-2 border-rec rounded-br-xl" />

          {/* Subtle AF Tracking Box framing the brothers on the log */}
          <div className="hidden md:flex absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[38%] h-[44%] border border-rec/55 rounded-md items-start justify-between p-1.5">
            <span className="px-1.5 py-0.5 rounded bg-rec text-obsidian font-mono font-bold text-xs">
              AF-C • CREW LOCKED
            </span>
            <span className="px-1.5 py-0.5 rounded bg-obsidian/75 text-ivory font-mono text-xs">
              {frameIdx === 0 ? "POSE 01: AIM LENS" : "POSE 02: SKYWARD"}
            </span>
          </div>
        </div>

        {/* Bottom Caption & Frame Switcher */}
        <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-rec uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                FRAME {frameIdx === 0 ? "► 01A / GIƠ MÁY NGẮM" : "► 02A / HƯỚNG BẦU TRỜI"}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ivory drop-shadow">
              ĐẠI GIA ĐÌNH THIẾT BỊ GIA — PHÍA SAU ỐNG KÍNH
            </h2>
            <p className="text-xs sm:text-sm text-ivory/80 max-w-xl">
              Nhấn trực tiếp vào bức ảnh để bấm màn trập chuyển khoảnh khắc của anh em bên bờ suối đá.
            </p>
          </div>

          {/* 2-Frame Thumbnail Pills */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 bg-obsidian/80 backdrop-blur-md p-1.5 rounded-xl border border-white/15 self-start sm:self-auto"
          >
            <button
              type="button"
              onClick={() => {
                setAutoPlay(false);
                triggerShutter(0, true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                frameIdx === 0
                  ? "bg-rec text-obsidian font-bold"
                  : "text-ivory-muted hover:text-ivory"
              }`}
            >
              FRAME 01A
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoPlay(false);
                triggerShutter(1, true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                frameIdx === 1
                  ? "bg-rec text-obsidian font-bold"
                  : "text-ivory-muted hover:text-ivory"
              }`}
            >
              FRAME 02A
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

