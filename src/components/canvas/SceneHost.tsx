"use client";

import dynamic from "next/dynamic";

const PersistentCanvasInner = dynamic(
  () => import("./PersistentCanvas").then((m) => m.PersistentCanvasInner),
  { ssr: false }
);

export function SceneHost() {
  return <PersistentCanvasInner />;
}
