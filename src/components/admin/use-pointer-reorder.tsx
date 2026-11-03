"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import { GripVertical } from "lucide-react";

type Reorder = (draggedId: string, targetId: string) => void;

/** Pointer based reordering works with mouse and touch while keeping the rest of the row scrollable. */
export function usePointerReorder(onReorder: Reorder, options: { followDraggedPosition?: boolean } = {}) {
  const group = useId();
  const reorderRef = useRef(onReorder);
  const activeRef = useRef<{ id: string; pointerId: number; lastTarget: string } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  reorderRef.current = onReorder;

  useEffect(() => {
    function move(event: globalThis.PointerEvent) {
      const active = activeRef.current;
      if (!active || active.pointerId !== event.pointerId) return;
      const hovered = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-admin-sortable-id]");
      if (!hovered || hovered.dataset.adminSortableGroup !== group) {
        active.lastTarget = "";
        return;
      }

      const targetId = hovered.dataset.adminSortableId;
      if (!targetId || targetId === active.id) {
        active.lastTarget = "";
        return;
      }
      if (targetId === active.lastTarget) return;

      active.lastTarget = targetId;
      reorderRef.current(active.id, targetId);
      if (options.followDraggedPosition) active.id = targetId;
    }

    function finish(event: globalThis.PointerEvent) {
      if (activeRef.current?.pointerId !== event.pointerId) return;
      activeRef.current = null;
      setDraggingId(null);
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", finish);
    document.addEventListener("pointercancel", finish);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", finish);
      document.removeEventListener("pointercancel", finish);
    };
  }, [group, options.followDraggedPosition]);

  function itemProps(id: string) {
    return {
      "data-admin-sortable-id": id,
      "data-admin-sortable-group": group,
      "data-admin-sortable-dragging": draggingId === id ? "true" : undefined,
    } as const;
  }

  function handleProps(id: string, label: string, onKeyboardMove?: (direction: -1 | 1) => void) {
    function start(event: PointerEvent<HTMLButtonElement>) {
      if (event.button !== 0 || activeRef.current) return;
      event.preventDefault();
      activeRef.current = { id, pointerId: event.pointerId, lastTarget: "" };
      setDraggingId(id);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
      if (!onKeyboardMove) return;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        onKeyboardMove(-1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        onKeyboardMove(1);
      }
    }

    function click(event: MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
      event.stopPropagation();
    }

    return {
      type: "button" as const,
      title: `Kéo để sắp xếp ${label}`,
      "aria-label": `Kéo để sắp xếp ${label}; dùng mũi tên lên xuống để di chuyển`,
      "aria-pressed": draggingId === id,
      onPointerDown: start,
      onKeyDown: keyDown,
      onClick: click,
      className: "touch-none cursor-grab rounded-lg border border-white/10 p-2 text-ivory-muted transition hover:border-rec hover:text-rec active:cursor-grabbing aria-pressed:border-rec aria-pressed:text-rec",
      children: <GripVertical className="h-4 w-4" aria-hidden="true" />,
    };
  }

  return { group, draggingId, itemProps, handleProps };
}
