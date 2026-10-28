"use client";

import { useCallback, useEffect, useState } from "react";
import gsap from "gsap";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/lib/store";
import { soundEngine } from "@/lib/sound";

const SESSION_KEY = "tbg_preloader_seen_v2";

export function TimecodePreloader() {
  const preloaderDone = useAppStore((s) => s.preloaderDone);
  const setPreloaderDone = useAppStore((s) => s.setPreloaderDone);
  const [frame, setFrame] = useState(0);
  const [visible, setVisible] = useState(true);

  const finishPreloader = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setVisible(false);
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  useEffect(() => {
    if (preloaderDone) {
      setVisible(false);
      return;
    }

    // Skip blocking animation if visitor already watched preloader in this browser session
    // or if reduced motion is preferred
    try {
      const alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (alreadySeen || reducedMotion) {
        setVisible(false);
        setPreloaderDone(true);
        return;
      }
    } catch {}

    const start = performance.now();
    const duration = 1450;

    // Driven by the single shared GSAP ticker (Skill Rule #1)
    const tick = () => {
      const now = performance.now();
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const nextFrame = Math.floor(eased * 24);
      setFrame((prev) => (prev === nextFrame ? prev : nextFrame));
      if (p >= 1) {
        gsap.ticker.remove(tick);
        finishPreloader();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        gsap.ticker.remove(tick);
        finishPreloader();
      }
    };

    gsap.ticker.add(tick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [preloaderDone, setPreloaderDone, finishPreloader]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const isSecondPose = frame >= 14;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="tbg-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => {
            soundEngine.playShutter();
            finishPreloader();
          }}
          className="fixed inset-0 z-[100] bg-obsidian flex flex-col items-center justify-center select-none px-6 overflow-hidden cursor-pointer"
        >
          {/* Warm Analog Group Photo Developing in Background (B&W -> Warm Film + 2-Frame Cut) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src="/anhchungtbg.jpg"
              alt=""
              style={{
                filter: `grayscale(${Math.max(0, 100 - frame * 5)}%)`,
                transform: `scale(${1.08 - (frame / 24) * 0.06})`,
              }}
              className={`absolute inset-0 w-full h-full object-cover object-[50%_60%] transition-opacity duration-200 ${
                isSecondPose ? "opacity-0" : "opacity-35"
              }`}
            />
            <img
              src="/anhchungtbg2.jpg"
              alt=""
              className={`absolute inset-0 w-full h-full object-cover object-[50%_60%] transition-opacity duration-200 ${
                isSecondPose ? "opacity-45" : "opacity-0"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/65 to-obsidian/80" />
          </div>

          <div className="relative z-10 w-full max-w-xl border border-white/15 rounded-2xl p-8 bg-obsidian/70 backdrop-blur-xl shadow-2xl">
            <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-rec" />
            <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-rec" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-rec" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-rec" />

            <div className="flex items-center justify-between text-xs font-mono text-ivory-muted mb-6">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rec animate-pulse" />
                REC • {isSecondPose ? "FRAME 02A" : "FRAME 01A"}
              </span>
              <span>35MM FILM • 24FPS</span>
            </div>

            <div className="text-center space-y-2 py-2">
              <div className="text-xs font-mono tracking-[0.28em] text-ivory-muted uppercase">
                Creative Media &amp; Design Collective
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ivory">
                THIẾT BỊ GIA
              </h1>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-rec pt-2">
                00:00:01:{pad(frame)}
              </div>
            </div>

            <div className="mt-6 h-1 w-full bg-obsidian-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-rec"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="mt-4 flex justify-center">
              <span className="text-[11px] font-mono text-ivory-subtle hover:text-ivory transition-colors">
                NHẤN BẤT KỲ HOẶC [SPACE] ĐỂ VÀO NGAY →
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
