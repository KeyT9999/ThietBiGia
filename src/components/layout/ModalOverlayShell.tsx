"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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

  const isActiveRoute = pathname.startsWith(expectedPrefix);

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
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      data-lenis-prevent
      className="fixed inset-0 z-30 overflow-y-auto bg-obsidian/[0.97] backdrop-blur-2xl"
    >
      {children}
    </motion.div>
  );
}
