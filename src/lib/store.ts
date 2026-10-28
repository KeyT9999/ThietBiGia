import { create } from "zustand";
import { CREW_MEMBERS } from "@/data/crew";
import { WORKS_DATA } from "@/data/works";
import { soundEngine } from "./sound";

/**
 * High-frequency mutable motion state shared between DOM scrubbers, wheel/drag
 * gestures, and R3F `useFrame` — ZERO React re-renders at 60-120fps!
 */
export const timelineMotion = {
  targetIndex: 0,
  currentIndex: 0,
  velocity: 0,
  isDragging: false,
};

export type CursorVariant = "default" | "project" | "crew" | "drag";
export type TimelineMode = "crew" | "works";

interface AppStoreState {
  timelineMode: TimelineMode;
  activeWorkIndex: number;
  totalWorks: number;
  isOverlayOpen: boolean;
  commandPaletteOpen: boolean;
  preloaderDone: boolean;
  soundMuted: boolean;
  cursorVariant: CursorVariant;
  cursorLabel: string;

  setTimelineMode: (mode: TimelineMode, initialIndex?: number) => void;
  setActiveWorkIndex: (index: number, snapMotion?: boolean) => void;
  stepWorkIndex: (delta: number) => void;
  setOverlayOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setPreloaderDone: (done: boolean) => void;
  toggleSound: () => void;
  setCursor: (variant: CursorVariant, label?: string) => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  timelineMode: "crew",
  activeWorkIndex: 0,
  totalWorks: CREW_MEMBERS.length,
  isOverlayOpen: false,
  commandPaletteOpen: false,
  preloaderDone: false,
  soundMuted: false,
  cursorVariant: "default",
  cursorLabel: "",

  setTimelineMode: (mode, initialIndex = 0) => {
    const nextTotal = mode === "crew" ? CREW_MEMBERS.length : WORKS_DATA.length;
    const clamped = Math.max(0, Math.min(nextTotal - 1, initialIndex));
    timelineMotion.targetIndex = clamped;
    soundEngine.playShutter();
    set({
      timelineMode: mode,
      totalWorks: nextTotal,
      activeWorkIndex: clamped,
    });
  },

  setActiveWorkIndex: (index, snapMotion = false) => {
    const total = get().totalWorks;
    const clamped = Math.max(0, Math.min(total - 1, index));
    if (snapMotion) {
      timelineMotion.targetIndex = clamped;
    }
    if (clamped !== get().activeWorkIndex) {
      soundEngine.playTick(0.8);
      set({ activeWorkIndex: clamped });
    }
  },

  stepWorkIndex: (delta) => {
    const { activeWorkIndex, totalWorks } = get();
    const next = Math.max(0, Math.min(totalWorks - 1, activeWorkIndex + delta));
    timelineMotion.targetIndex = next;
    if (next !== activeWorkIndex) {
      soundEngine.playTick(0.9);
      set({ activeWorkIndex: next });
    }
  },

  setOverlayOpen: (open) => set({ isOverlayOpen: open }),

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  setPreloaderDone: (done) => set({ preloaderDone: done }),

  toggleSound: () => {
    const nextMuted = !get().soundMuted;
    soundEngine.setMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playTick(0.9);
    }
    set({ soundMuted: nextMuted });
  },

  setCursor: (variant, label = "") => {
    const cur = get();
    if (cur.cursorVariant === variant && cur.cursorLabel === label) return;
    set({ cursorVariant: variant, cursorLabel: label });
  },
}));
