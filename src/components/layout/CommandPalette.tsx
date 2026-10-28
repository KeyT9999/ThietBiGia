"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarPlus,
  Camera,
  CornerDownLeft,
  Film,
  Search,
  Users,
  X,
} from "lucide-react";
import { CREW_MEMBERS } from "@/data/crew";
import { GEAR_ARSENAL } from "@/data/gear";
import { WORKS_DATA } from "@/data/works";
import { soundEngine } from "@/lib/sound";
import { useAppStore } from "@/lib/store";
import { getCombinedRoleBadge } from "@/lib/utils";

function normalizeVi(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

interface PaletteItem {
  id: string;
  group: "THÀNH VIÊN EKIP" | "DỰ ÁN & BỘ ẢNH" | "THIẾT BỊ & GEAR" | "THAO TÁC NHANH";
  title: string;
  subtitle: string;
  badge: string;
  avatar?: string;
  href: string;
  searchBlob: string;
  onSelectCustom?: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const open = useAppStore((s) => s.commandPaletteOpen);
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen);

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const next = !useAppStore.getState().commandPaletteOpen;
        soundEngine.playTick(0.9);
        setOpen(next);
      } else if (e.key === "Escape" && useAppStore.getState().commandPaletteOpen) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const allItems = useMemo<PaletteItem[]>(() => {
    const quickItems: PaletteItem[] = [
      {
        id: "act-booking",
        group: "THAO TÁC NHANH",
        title: "Lên Lịch Bấm Máy & Lắp Ráp Squad",
        subtitle: "Mở Call Sheet đặt lịch trực tuyến cùng các thành viên",
        badge: "BOOKING",
        href: "/contact",
        searchBlob: normalizeVi("dat lich booking call sheet squad lien he contact"),
      },
      {
        id: "act-works-3d",
        group: "THAO TÁC NHANH",
        title: "Mở Timeline 3D — Chế Độ Dự Án Nhóm (Cinema Slate)",
        subtitle: `Xoay trục 3D ${WORKS_DATA.length} dự án tiêu biểu của Thiết Bị Gia`,
        badge: "3D STAGE",
        href: "/?mode=works",
        searchBlob: normalizeVi("timeline 3d du an nhom works cinema slate"),
        onSelectCustom: () => {
          useAppStore.getState().setTimelineMode("works", 0);
        },
      },
      {
        id: "act-crew-roster",
        group: "THAO TÁC NHANH",
        title: `Xem Toàn Bộ Roster ${CREW_MEMBERS.length} Thành Viên`,
        subtitle: "Lọc theo Chụp ảnh, Quay phim, IT & Hậu kỳ",
        badge: "ROSTER",
        href: "/crew",
        searchBlob: normalizeVi("danh sach thanh vien crew roster ekip"),
      },
    ];

    const crewItems: PaletteItem[] = CREW_MEMBERS.map((m) => ({
      id: `crew-${m.slug}`,
      group: "THÀNH VIÊN EKIP",
      title: m.nickname ? `${m.name} (${m.nickname})` : m.name,
      subtitle: `${m.roleTitle} • ${m.favoriteGear.slice(0, 2).join(" • ")}`,
      badge: `#${m.badgeNumber} • ${getCombinedRoleBadge(m.roles)}`,
      avatar: m.avatar,
      href: `/crew/${m.slug}`,
      searchBlob: normalizeVi(
        [
          m.name,
          m.nickname ?? "",
          m.badgeNumber,
          m.roleTitle,
          ...m.secondaryRoles,
          ...m.favoriteGear,
          getCombinedRoleBadge(m.roles),
        ].join(" ")
      ),
    }));

    const workItems: PaletteItem[] = WORKS_DATA.map((w) => ({
      id: `work-${w.slug}`,
      group: "DỰ ÁN & BỘ ẢNH",
      title: w.title,
      subtitle: `${w.clientOrSeries} • ${w.exifSpec ?? w.cameraSpec}`,
      badge: `${w.category.toUpperCase()} • ${w.year}`,
      avatar: w.coverImage,
      href: `/works/${w.slug}`,
      searchBlob: normalizeVi(
        [
          w.title,
          w.category,
          w.clientOrSeries,
          w.cameraSpec,
          w.exifSpec ?? "",
          ...w.gearUsed,
        ].join(" ")
      ),
    }));

    const gearItems: PaletteItem[] = GEAR_ARSENAL.flatMap((cat) =>
      cat.items.map((g, idx) => ({
        id: `gear-${cat.id}-${idx}`,
        group: "THIẾT BỊ & GEAR",
        title: g.name,
        subtitle: `${cat.title} • ${g.spec}`,
        badge: g.tag,
        href: "/about",
        searchBlob: normalizeVi(`${g.name} ${g.spec} ${g.tag} ${cat.title} gear thiet bi`),
      }))
    );

    return [...crewItems, ...workItems, ...quickItems, ...gearItems];
  }, []);

  const filteredItems = useMemo(() => {
    const q = normalizeVi(query.trim());
    if (!q) {
      // Curated default view: top 5 crew + top 4 works + 3 quick actions
      return [
        ...allItems.filter((i) => i.group === "THAO TÁC NHANH"),
        ...allItems.filter((i) => i.group === "THÀNH VIÊN EKIP").slice(0, 6),
        ...allItems.filter((i) => i.group === "DỰ ÁN & BỘ ẢNH").slice(0, 4),
      ];
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    return allItems
      .filter((item) => tokens.every((tok) => item.searchBlob.includes(tok)))
      .slice(0, 18);
  }, [allItems, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const executeItem = (item: PaletteItem) => {
    soundEngine.playShutter();
    setOpen(false);
    item.onSelectCustom?.();
    router.push(item.href);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      soundEngine.playTick(0.7);
      setActiveIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      soundEngine.playTick(0.7);
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = filteredItems[activeIndex];
      if (chosen) executeItem(chosen);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={() => setOpen(false)}
          data-lenis-prevent
          className="fixed inset-0 z-[98] bg-obsidian/85 backdrop-blur-xl flex items-start justify-center pt-[10dvh] px-4 pb-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-obsidian-border bg-obsidian-surface shadow-[0_24px_80px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col max-h-[78dvh]"
          >
            {/* Search Input Header */}
            <div className="px-4 py-3.5 border-b border-obsidian-border flex items-center gap-3">
              <Search className="w-4 h-4 text-rec shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Tìm nhanh thành viên (KeyT, Trường Hải...), dự án (DANAFF, Concert...), ống kính/body (FX6, A6400)..."
                className="flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory-subtle focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs font-mono text-ivory-subtle hover:text-ivory"
                >
                  XÓA
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg border border-obsidian-border text-ivory-muted hover:text-ivory"
                aria-label="Đóng tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="text-sm font-medium text-ivory">
                    Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
                  </div>
                  <div className="text-xs font-mono text-ivory-subtle">
                    Thử gõ tên thành viên (không dấu hoặc có dấu), dòng máy Sony/Canon/RED hoặc tên dự án
                  </div>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  const showGroupHeader =
                    idx === 0 || filteredItems[idx - 1]?.group !== item.group;

                  return (
                    <div key={item.id}>
                      {showGroupHeader && (
                        <div className="px-3 pt-2.5 pb-1 text-[10px] font-mono font-bold text-rec uppercase tracking-widest flex items-center gap-1.5">
                          {item.group === "THÀNH VIÊN EKIP" && <Users className="w-3 h-3" />}
                          {item.group === "DỰ ÁN & BỘ ẢNH" && <Film className="w-3 h-3" />}
                          {item.group === "THIẾT BỊ & GEAR" && <Camera className="w-3 h-3" />}
                          {item.group === "THAO TÁC NHANH" && (
                            <CalendarPlus className="w-3 h-3" />
                          )}
                          <span>{item.group}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => executeItem(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          isActive
                            ? "bg-rec/18 border border-rec/50"
                            : "border border-transparent hover:bg-white/[0.04]"
                        }`}
                      >
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover object-[50%_20%] border border-obsidian-border shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-obsidian border border-obsidian-border flex items-center justify-center text-rec shrink-0">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-semibold text-ivory truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] font-mono text-ivory-muted truncate">
                            {item.subtitle}
                          </div>
                        </div>

                        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-obsidian border border-obsidian-border text-[10px] font-mono text-ivory-muted shrink-0">
                          {item.badge}
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Keyboard Hints */}
            <div className="px-4 py-2.5 border-t border-obsidian-border bg-obsidian/70 flex items-center justify-between text-[11px] font-mono text-ivory-subtle">
              <div className="flex items-center gap-3">
                <span>↑↓ DI CHUYỂN</span>
                <span className="inline-flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3 text-rec" /> MỞ NGAY
                </span>
                <span>ESC ĐÓNG</span>
              </div>
              <span className="text-rec font-semibold">TBG COMMAND // CTRL+K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
