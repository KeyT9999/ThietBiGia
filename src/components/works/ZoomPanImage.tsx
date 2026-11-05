"use client";

import { useEffect, useRef, useState } from "react";

type PanPosition = { x: number; y: number };

type PanGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  startPan: PanPosition;
  moved: boolean;
};

const ZOOM_SCALE = 1.85;

export function ZoomPanImage({
  src,
  alt,
  zoomed,
  onToggleZoom,
  className,
}: {
  src: string;
  alt: string;
  zoomed: boolean;
  onToggleZoom: () => void;
  className: string;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const gestureRef = useRef<PanGesture | null>(null);
  const ignoreClickRef = useRef(false);
  const [pan, setPan] = useState<PanPosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    gestureRef.current = null;
    ignoreClickRef.current = false;
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, [src, zoomed]);

  const finishPan = (pointerId: number) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== pointerId) return;

    if (gesture.moved) {
      ignoreClickRef.current = true;
      window.setTimeout(() => {
        ignoreClickRef.current = false;
      }, 300);
    }

    const image = imageRef.current;
    if (image?.hasPointerCapture(pointerId)) image.releasePointerCapture(pointerId);
    gestureRef.current = null;
    setIsDragging(false);
  };

  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      draggable={false}
      onPointerDown={(event) => {
        if (!zoomed || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        gestureRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startPan: pan,
          moved: false,
        };
        setIsDragging(true);
      }}
      onPointerMove={(event) => {
        const gesture = gestureRef.current;
        const image = imageRef.current;
        const stage = image?.parentElement;
        if (!zoomed || !gesture || !image || !stage) return;

        const deltaX = event.clientX - gesture.startX;
        const deltaY = event.clientY - gesture.startY;
        if (Math.hypot(deltaX, deltaY) > 3) gesture.moved = true;

        const maxX = Math.max(0, (image.offsetWidth * ZOOM_SCALE - stage.clientWidth) / 2);
        const maxY = Math.max(0, (image.offsetHeight * ZOOM_SCALE - stage.clientHeight) / 2);
        setPan({
          x: Math.max(-maxX, Math.min(maxX, gesture.startPan.x + deltaX)),
          y: Math.max(-maxY, Math.min(maxY, gesture.startPan.y + deltaY)),
        });
      }}
      onPointerUp={(event) => finishPan(event.pointerId)}
      onPointerCancel={(event) => finishPan(event.pointerId)}
      onClick={(event) => {
        event.stopPropagation();
        if (ignoreClickRef.current) {
          ignoreClickRef.current = false;
          event.preventDefault();
          return;
        }
        onToggleZoom();
      }}
      className={`${className} ${zoomed ? "touch-none" : ""} ${isDragging ? "cursor-grabbing" : zoomed ? "cursor-grab" : "cursor-zoom-in"}`}
      style={{
        transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomed ? ZOOM_SCALE : 1})`,
        transformOrigin: "center center",
        transition: isDragging ? "none" : "transform 300ms ease",
        touchAction: zoomed ? "none" : "auto",
      }}
    />
  );
}
