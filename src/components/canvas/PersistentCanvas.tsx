"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor, Preload, View } from "@react-three/drei";

export function PersistentCanvasInner() {
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
    setDpr(isSmallScreen ? 1.25 : Math.min(2, window.devicePixelRatio || 1.5));
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <Canvas
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <PerformanceMonitor
          flipflops={3}
          onIncline={() => setDpr(Math.min(2, window.devicePixelRatio || 2))}
          onDecline={() => setDpr(1)}
          onFallback={() => setDpr(1.2)}
        >
          <Suspense fallback={null}>
            <View.Port />
            <Preload all />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
