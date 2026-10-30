import { create } from "zustand";
import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CREW_MEMBERS } from "@/data/crew";
import { WORKS_DATA } from "@/data/works";
import { GEAR_ARSENAL } from "@/data/gear";
import { FILM_STRIP_MOMENTS, GROUP_MOMENTS } from "@/data/moments";
import type { SiteContent } from "@/lib/content-schema";
import { normalizeCrewOrder } from "@/lib/crew-order";
import { getHome3DWorks } from "@/lib/home-3d-works";
import { soundEngine } from "./sound";

export const timelineMotion = {
  targetIndex: 0,
  currentIndex: 0,
  velocity: 0,
  isDragging: false,
  isCardHovered: false,
  autoplayResumeAt: 0,
};

const TIMELINE_AUTOPLAY_DELAY_MS = 3000;

export function deferTimelineAutoplay() {
  timelineMotion.autoplayResumeAt = Date.now() + TIMELINE_AUTOPLAY_DELAY_MS;
}

export type CursorVariant = "default" | "project" | "crew" | "drag";
export type TimelineMode = "crew" | "works";

const initialSiteContent: SiteContent = {
  crew: normalizeCrewOrder(CREW_MEMBERS),
  works: WORKS_DATA,
  gear: GEAR_ARSENAL,
  moments: GROUP_MOMENTS,
  homepage: {
    eyebrow: "CREATIVE MEDIA COLLECTIVE",
    title: "Chúng tôi là Thiết Bị Gia",
    description:
      "Một tập thể sáng tạo đồng hành trong nhiếp ảnh, quay phim và công nghệ. Cùng kể những câu chuyện bằng hình ảnh, âm thanh và góc nhìn riêng.",
    ctaLabel: "KHÁM PHÁ ĐỘI NGŨ",
    heroMediaType: "image",
    heroMediaUrl: "/anhchungtbg.jpg",
    heroMediaAlt: "Đại gia đình Thiết Bị Gia",
  },
  about: {
    title: "Một đội ngũ, nhiều góc nhìn",
    introduction:
      "Thiết Bị Gia kết nối những người yêu hình ảnh, phim ảnh và công nghệ để cùng tạo nên các sản phẩm sáng tạo.",
    storyTitle: "Cùng nhau tạo nên câu chuyện",
    storyBody:
      "Từ ý tưởng, ghi hình đến hậu kỳ, mỗi thành viên góp một góc nhìn và một kỹ năng để hoàn thiện dự án.",
  },
  settings: {
    brandName: "THIẾT BỊ GIA",
    brandSubtitle: "Creative Media & Design Collective",
    siteDescription:
      "Portfolio tập thể Thiết Bị Gia: nhiếp ảnh, quay phim, hậu kỳ và thiết kế sáng tạo.",
    contactEmail: "booking@thietbigia.vn",
    phone: "(+84) 909 • TBG • CREW",
    location: "Đà Nẵng & TP. Hồ Chí Minh • Sẵn sàng di chuyển toàn quốc",
    instagramUrl: "",
    facebookUrl: "",
    navTimelineLabel: "TIMELINE 3D",
    navProjectsLabel: "PROJECTS",
    navCrewLabel: "CREW",
    navAboutLabel: "ABOUT & GEAR",
    navContactLabel: "CONTACT",
  },
};

function replaceArray<T>(target: T[], source: readonly T[]) {
  target.splice(0, target.length, ...source);
}

function wrapIndex(index: number, total: number) {
  return total > 0 ? ((index % total) + total) % total : 0;
}

function getCircularOffset(index: number, currentIndex: number, total: number) {
  if (total <= 0) return 0;
  let offset = (index - currentIndex) % total;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

interface AppStoreState {
  siteContent: SiteContent;
  totalWorks: number;
  timelineMode: TimelineMode;
  activeWorkIndex: number;
  isOverlayOpen: boolean;
  commandPaletteOpen: boolean;
  preloaderDone: boolean;
  soundMuted: boolean;
  cursorVariant: CursorVariant;
  cursorLabel: string;

  setSiteContent: (content: SiteContent) => void;
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
  siteContent: initialSiteContent,
  timelineMode: "crew",
  activeWorkIndex: 0,
  totalWorks: CREW_MEMBERS.length,
  isOverlayOpen: false,
  commandPaletteOpen: false,
  preloaderDone: false,
  soundMuted: false,
  cursorVariant: "default",
  cursorLabel: "",

  setSiteContent: (content) => {
    replaceArray(CREW_MEMBERS, normalizeCrewOrder(content.crew));
    replaceArray(WORKS_DATA, content.works);
    replaceArray(GEAR_ARSENAL, content.gear);
    replaceArray(GROUP_MOMENTS, content.moments);
    replaceArray(
      FILM_STRIP_MOMENTS,
      content.moments.filter((moment) => moment.onFilmStrip)
    );

    const current = get();
    const home3DWorks = getHome3DWorks(content.works);
    const timelineMode = current.timelineMode === "works" && home3DWorks.length === 0
      ? "crew"
      : current.timelineMode;
    const totalWorks = timelineMode === "crew" ? content.crew.length : home3DWorks.length;
    const activeWorkIndex = Math.min(
      Math.max(0, current.activeWorkIndex),
      Math.max(0, totalWorks - 1)
    );
    timelineMotion.targetIndex = activeWorkIndex;
    timelineMotion.currentIndex = activeWorkIndex;
    deferTimelineAutoplay();
    set({
      siteContent: {
        ...content,
        crew: CREW_MEMBERS,
        works: WORKS_DATA,
        gear: GEAR_ARSENAL,
        moments: GROUP_MOMENTS,
      },
      timelineMode,
      totalWorks,
      activeWorkIndex,
    });
  },

  setTimelineMode: (mode, initialIndex = 0) => {
    const content = get().siteContent;
    const home3DCount = getHome3DWorks(content.works).length;
    const nextMode = mode === "works" && home3DCount === 0 ? "crew" : mode;
    const nextTotal = nextMode === "crew" ? content.crew.length : home3DCount;
    const clamped = Math.max(0, Math.min(Math.max(0, nextTotal - 1), initialIndex));
    timelineMotion.targetIndex = clamped;
    timelineMotion.currentIndex = clamped;
    deferTimelineAutoplay();
    soundEngine.playShutter();
    set({
      timelineMode: nextMode,
      totalWorks: nextTotal,
      activeWorkIndex: clamped,
    });
  },

  setActiveWorkIndex: (index, snapMotion = false) => {
    const state = get();
    const total = state.totalWorks;
    const next = wrapIndex(index, total);
    if (snapMotion) {
      deferTimelineAutoplay();
      timelineMotion.targetIndex = timelineMotion.currentIndex +
        getCircularOffset(next, timelineMotion.currentIndex, total);
    }
    if (next !== state.activeWorkIndex) {
      soundEngine.playTick(0.8);
      set({ activeWorkIndex: next });
    }
  },

  stepWorkIndex: (delta) => {
    const state = get();
    const next = wrapIndex(state.activeWorkIndex + delta, state.totalWorks);
    deferTimelineAutoplay();
    timelineMotion.targetIndex = timelineMotion.currentIndex + delta;
    if (next !== state.activeWorkIndex) {
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
    if (!nextMuted) soundEngine.playTick(0.9);
    set({ soundMuted: nextMuted });
  },

  setCursor: (variant, label = "") => {
    const current = get();
    if (current.cursorVariant === variant && current.cursorLabel === label) return;
    set({ cursorVariant: variant, cursorLabel: label });
  },
}));

const SiteContentContext = createContext<SiteContent>(initialSiteContent);
const SetSiteContentContext = createContext<(content: SiteContent) => void>(() => {});

export function SiteContentProvider({
  initialContent,
  children,
}: {
  initialContent: SiteContent;
  children: ReactNode;
}) {
  const [content, setContent] = useState(initialContent);
  useEffect(() => setContent(initialContent), [initialContent]);
  useEffect(() => {
    useAppStore.getState().setSiteContent(content);
  }, [content]);

  const updateContent = useCallback((next: SiteContent) => {
    setContent(next);
    useAppStore.getState().setSiteContent(next);
  }, []);

  return createElement(
    SetSiteContentContext.Provider,
    { value: updateContent },
    createElement(SiteContentContext.Provider, { value: content }, children)
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}

export function useSetSiteContent() {
  return useContext(SetSiteContentContext);
}
