"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAppStore } from "@/lib/store";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorVariant = useAppStore((s) => s.cursorVariant);
  const cursorLabel = useAppStore((s) => s.cursorLabel);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    setFinePointer(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFinePointer(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!finePointer || !cursorRef.current) return;
    const el = cursorRef.current;

    const xTo = gsap.quickTo(el, "x", { duration: 0.16, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.16, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [finePointer]);

  if (!finePointer) return null;

  const isExpanded = cursorVariant !== "default" && Boolean(cursorLabel);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[90] pointer-events-none -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className={`transition-all duration-200 flex items-center justify-center font-mono text-xs tracking-wider ${
          isExpanded
            ? "px-3 py-1.5 rounded-full bg-rec text-obsidian font-bold shadow-[0_0_24px_rgba(255,77,0,0.45)] scale-100"
            : "w-6 h-6 rounded-full border border-ivory/35 bg-obsidian/30 backdrop-blur-xs"
        }`}
      >
        {isExpanded ? (
          <span>[ {cursorLabel} ]</span>
        ) : (
          <span className="w-1 h-1 rounded-full bg-rec" />
        )}
      </div>
    </div>
  );
}
