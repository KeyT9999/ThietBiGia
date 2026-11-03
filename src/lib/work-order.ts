import type { WorkProject } from "@/data/schema";

function parsePositiveInteger(value: number | string): number | null {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const number = Number(trimmed);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

/** Keeps project `indexLabel` values aligned sequentially as 01, 02, 03, ... */
export function resequenceWorks(works: readonly WorkProject[]): WorkProject[] {
  return works.map((work, index) => {
    const indexLabel = String(index + 1).padStart(2, "0");
    return work.indexLabel === indexLabel ? work : { ...work, indexLabel };
  });
}

/** Moves an array item from `fromIndex` to a 1-based target position (clamped to bounds). */
export function moveItemToPosition<T>(
  items: readonly T[],
  fromIndex: number,
  requestedPosition: number | string
): T[] {
  const parsed = parsePositiveInteger(requestedPosition);
  if (fromIndex < 0 || fromIndex >= items.length || parsed === null || items.length === 0) {
    return [...items];
  }

  const toIndex = Math.max(0, Math.min(parsed - 1, items.length - 1));
  if (toIndex === fromIndex) return [...items];

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/** Reorders an array when an item at `fromIndex` is dropped `"before"` or `"after"` `targetIndex`. */
export function reorderArrayByDrop<T>(
  items: readonly T[],
  fromIndex: number,
  targetIndex: number,
  placement: "before" | "after"
): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    targetIndex < 0 ||
    targetIndex >= items.length
  ) {
    return [...items];
  }

  const rawInsertIndex = placement === "after" ? targetIndex + 1 : targetIndex;
  const insertIndex = fromIndex < rawInsertIndex ? rawInsertIndex - 1 : rawInsertIndex;
  if (insertIndex === fromIndex) return [...items];

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(insertIndex, 0, moved);
  return next;
}

/** Moves a `WorkProject` to the requested 1-based position and re-sequences `indexLabel`. */
export function moveWorkToPosition(
  works: readonly WorkProject[],
  workId: string,
  requestedPosition: number | string
): WorkProject[] {
  const fromIndex = works.findIndex((work) => work.id === workId);
  if (fromIndex < 0) return resequenceWorks(works);
  return resequenceWorks(moveItemToPosition(works, fromIndex, requestedPosition));
}
