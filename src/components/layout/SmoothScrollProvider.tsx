"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteContentProvider, useAppStore } from "@/lib/store";
import type { SiteContent } from "@/lib/content-schema";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({
  children,
  initialContent,
}: {
  children: React.ReactNode;
  initialContent: SiteContent;
}) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();
  const isOverlayOpen = useAppStore((state) => state.isOverlayOpen);
  const wasOverlayOpenRef = useRef(false);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;
    if (isOverlayOpen) lenis.stop();
    else lenis.start();
  }, [isOverlayOpen]);

  useEffect(() => {
    if (!isOverlayOpen && !wasOverlayOpenRef.current) {
      lenisRef.current?.lenis?.scrollTo(0, { immediate: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    wasOverlayOpenRef.current = isOverlayOpen;
  }, [pathname, isOverlayOpen]);

  return (
    <SiteContentProvider initialContent={initialContent}>
      <ReactLenis
        root
        options={{ autoRaf: false, lerp: 0.085, smoothWheel: true }}
        ref={lenisRef}
      >
        {children}
      </ReactLenis>
    </SiteContentProvider>
  );
}
