"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { motion } from "motion/react";
import { useAppStore } from "@/lib/store";

export function ModalOverlayShell({
  expectedPrefix,
  children,
}: {
  expectedPrefix: "/crew/" | "/works/";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const setOverlayOpen = useAppStore((s) => s.setOverlayOpen);
  const modalLenisRef = useRef<LenisRef>(null);

  const isActiveRoute = pathname.startsWith(expectedPrefix);

  // Sync modal smooth scroll onto the exact same single GSAP RAF ticker as root Lenis + R3F
  useEffect(() => {
    if (!isActiveRoute) return;

    function update(time: number) {
      modalLenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    return () => {
      gsap.ticker.remove(update);
    };
  }, [isActiveRoute]);

  // Reset modal scroll position to top when navigating between members or works inside the modal
  useEffect(() => {
    if (!isActiveRoute) return;
    modalLenisRef.current?.lenis?.scrollTo(0, { immediate: true });
    if (modalLenisRef.current?.wrapper) {
      modalLenisRef.current.wrapper.scrollTop = 0;
    }
  }, [pathname, isActiveRoute]);

  useEffect(() => {
    if (!isActiveRoute) {
      setOverlayOpen(false);
      return;
    }

    setOverlayOpen(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.back();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      setOverlayOpen(false);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isActiveRoute, router, setOverlayOpen]);

  if (!isActiveRoute) return null;

  return (
    <>
      {/* Layer 1 (z-30): Solid Obsidian Studio Backdrop strictly BELOW PersistentCanvas (z-40) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        aria-hidden="true"
        className="fixed inset-0 z-30 bg-obsidian pointer-events-none"
      />

      {/* Layer 2 (z-50): Smooth-Scrolling Modal Viewport ABOVE PersistentCanvas (z-40) with ZERO CSS transform/filter */}
      <ReactLenis
        ref={modalLenisRef}
        root={false}
        options={{ autoRaf: false, lerp: 0.095, smoothWheel: true }}
        data-lenis-prevent
        data-modal-scroll
        className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain bg-transparent"
      >
        {children}
      </ReactLenis>
    </>
  );
}
