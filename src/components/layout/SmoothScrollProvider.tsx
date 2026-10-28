"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppStore } from "@/lib/store";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();
  const isOverlayOpen = useAppStore((s) => s.isOverlayOpen);
  const wasOverlayOpenRef = useRef(false);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  // Pause root window Lenis while an intercepting modal is open
  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;
    if (isOverlayOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isOverlayOpen]);

  // Reset window scroll cleanly on standalone route transitions (while preserving background scroll on modal close)
  useEffect(() => {
    if (!isOverlayOpen && !wasOverlayOpenRef.current) {
      lenisRef.current?.lenis?.scrollTo(0, { immediate: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    wasOverlayOpenRef.current = isOverlayOpen;
  }, [pathname, isOverlayOpen]);

  return (
    <ReactLenis
      root
      options={{ autoRaf: false, lerp: 0.085, smoothWheel: true }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
}
