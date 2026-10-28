import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type RoleCategory = "chup-anh" | "quay-phim" | "it-tech";

export interface RoleStyleMeta {
  id: RoleCategory;
  label: string;
  shortLabel: string;
  color: string;
  bgSoft: string;
  borderSoft: string;
}

export const ROLE_STYLES: Record<RoleCategory, RoleStyleMeta> = {
  "chup-anh": {
    id: "chup-anh",
    label: "Chụp ảnh",
    shortLabel: "CHỤP ẢNH",
    color: "#00E5FF",
    bgSoft: "rgba(0, 229, 255, 0.12)",
    borderSoft: "rgba(0, 229, 255, 0.40)",
  },
  "quay-phim": {
    id: "quay-phim",
    label: "Quay phim",
    shortLabel: "QUAY PHIM",
    color: "#FF4D00",
    bgSoft: "rgba(255, 77, 0, 0.14)",
    borderSoft: "rgba(255, 77, 0, 0.42)",
  },
  "it-tech": {
    id: "it-tech",
    label: "IT & Kỹ thuật",
    shortLabel: "IT / TECH",
    color: "#10B981",
    bgSoft: "rgba(16, 185, 129, 0.14)",
    borderSoft: "rgba(16, 185, 129, 0.42)",
  },
};

export function getRoleMeta(category: string): RoleStyleMeta {
  if (category in ROLE_STYLES) {
    return ROLE_STYLES[category as RoleCategory];
  }
  return ROLE_STYLES["chup-anh"];
}

export function getCombinedRoleBadge(roles: RoleCategory[]): string {
  if (roles.includes("quay-phim") && roles.includes("chup-anh")) {
    return "QUAY • CHỤP";
  }
  if (roles.includes("chup-anh") && roles.includes("it-tech")) {
    return "CHỤP • IT";
  }
  if (roles.includes("quay-phim") && roles.includes("it-tech")) {
    return "QUAY • IT";
  }
  return getRoleMeta(roles[0] ?? "chup-anh").shortLabel;
}

export function formatTimecodeFromProgress(progress: number, totalProjects: number): string {
  const clamped = Math.max(0, Math.min(1, progress));
  const totalFrames = Math.max(1, totalProjects * 24 * 6);
  const currentFrame = Math.floor(clamped * totalFrames);

  const frames = currentFrame % 24;
  const totalSeconds = Math.floor(currentFrame / 24);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}
