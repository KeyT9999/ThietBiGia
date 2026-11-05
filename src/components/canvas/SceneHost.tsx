"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const PersistentCanvasInner = dynamic(
  () => import("./PersistentCanvas").then((m) => m.PersistentCanvasInner),
  { ssr: false }
);

export function SceneHost() {
  const pathname = usePathname();
  const needsCanvas = pathname === "/" || pathname.startsWith("/crew/");

  if (!needsCanvas) return null;

  return <PersistentCanvasInner />;
}
