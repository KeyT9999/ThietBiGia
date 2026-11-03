"use client";

import { useEffect, useState, type DragEvent } from "react";

export type DropPlacement = "before" | "after";

export function OrderBadgeInput({
  position,
  total,
  ariaLabel,
  onMoveToPosition,
  onFocusChange,
  size = "sm",
}: {
  position: number;
  total: number;
  ariaLabel: string;
  onMoveToPosition: (targetOneBased: number) => void;
  onFocusChange?: (focused: boolean) => void;
  size?: "sm" | "md";
}) {
  const formatted = String(Math.max(1, position)).padStart(2, "0");
  const [draft, setDraft] = useState(formatted);

  useEffect(() => {
    setDraft(formatted);
  }, [formatted]);

  function commit(rawValue: string) {
    const trimmed = rawValue.trim();
    if (!/^\d+$/.test(trimmed)) {
      setDraft(formatted);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || total < 1) {
      setDraft(formatted);
      return;
    }
    const clamped = Math.min(Math.max(1, parsed), total);
    setDraft(String(clamped).padStart(2, "0"));
    if (clamped !== position) {
      onMoveToPosition(clamped);
    }
  }

  const isMedium = size === "md";

  return (
    <label
      title={`Nhập số thứ tự (1–${total}) rồi nhấn Enter`}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      className={
        "inline-flex shrink-0 items-center rounded-lg border border-white/15 bg-obsidian font-mono text-rec transition focus-within:border-rec focus-within:bg-rec/10 hover:border-rec/50 " +
        (isMedium ? "h-11 px-2.5 text-xs" : "h-7 px-1.5 text-[11px]")
      }
    >
      <span className="select-none text-rec/70">#</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        draggable={false}
        aria-label={ariaLabel}
        value={draft}
        onDragStart={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onFocus={(event) => {
          onFocusChange?.(true);
          event.currentTarget.select();
        }}
        onChange={(event) => {
          const digitsOnly = event.target.value.replace(/\D+/g, "").slice(0, 3);
          setDraft(digitsOnly);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit(draft);
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            event.preventDefault();
            setDraft(formatted);
            event.currentTarget.blur();
          }
        }}
        onBlur={() => {
          onFocusChange?.(false);
          commit(draft);
        }}
        className={
          "bg-transparent text-center font-mono font-bold text-rec outline-none " +
          (isMedium ? "w-7 text-xs" : "w-6 text-[11px]")
        }
      />
    </label>
  );
}

export function useListDragReorder(
  onDropItem: (draggedId: string, targetId: string, placement: DropPlacement) => void
) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    targetId: string;
    placement: DropPlacement;
  } | null>(null);
  const [focusedInputId, setFocusedInputId] = useState<string | null>(null);

  function clearDragState() {
    setDraggedId(null);
    setDropIndicator(null);
  }

  function getRowDragProps(itemId: string, orientation: "vertical" | "horizontal" = "vertical") {
    const isDragging = draggedId === itemId;
    const activeDropPlacement =
      dropIndicator?.targetId === itemId && draggedId && draggedId !== itemId
        ? dropIndicator.placement
        : null;

    return {
      isDragging,
      activeDropPlacement,
      isInputFocused: focusedInputId === itemId,
      setInputFocused: (focused: boolean) =>
        setFocusedInputId((current) => (focused ? itemId : current === itemId ? null : current)),
      rowProps: {
        draggable: focusedInputId !== itemId,
        onDragStart: (event: DragEvent<HTMLElement>) => {
          if (focusedInputId === itemId) {
            event.preventDefault();
            return;
          }
          setDraggedId(itemId);
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", itemId);
        },
        onDragOver: (event: DragEvent<HTMLElement>) => {
          const sourceId = draggedId || event.dataTransfer.getData("text/plain");
          if (!sourceId || sourceId === itemId) {
            if (dropIndicator?.targetId === itemId) setDropIndicator(null);
            return;
          }
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          const rect = event.currentTarget.getBoundingClientRect();
          const placement: DropPlacement =
            orientation === "horizontal"
              ? event.clientX < rect.left + rect.width / 2
                ? "before"
                : "after"
              : event.clientY < rect.top + rect.height / 2
                ? "before"
                : "after";

          if (
            dropIndicator?.targetId !== itemId ||
            dropIndicator.placement !== placement
          ) {
            setDropIndicator({ targetId: itemId, placement });
          }
        },
        onDrop: (event: DragEvent<HTMLElement>) => {
          event.preventDefault();
          const sourceId = draggedId || event.dataTransfer.getData("text/plain");
          const rect = event.currentTarget.getBoundingClientRect();
          const placement: DropPlacement =
            dropIndicator?.targetId === itemId
              ? dropIndicator.placement
              : orientation === "horizontal"
                ? event.clientX < rect.left + rect.width / 2
                  ? "before"
                  : "after"
                : event.clientY < rect.top + rect.height / 2
                  ? "before"
                  : "after";
          clearDragState();
          if (sourceId && sourceId !== itemId) {
            onDropItem(sourceId, itemId, placement);
          }
        },
        onDragEnd: () => {
          clearDragState();
        },
      },
    };
  }

  return {
    draggedId,
    getRowDragProps,
  };
}
