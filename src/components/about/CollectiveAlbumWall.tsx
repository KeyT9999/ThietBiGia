"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Expand,
  Filter,
  MapPin,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { GROUP_CATEGORY_META, type GroupMomentCategory } from "@/data/moments";
import { soundEngine } from "@/lib/sound";
import { useSiteContent } from "@/lib/store";

const INITIAL_VISIBLE_COUNT = 18;

export function CollectiveAlbumWall() {
  const siteContent = useSiteContent();
  const moments = siteContent.moments;
  const crewMembers = siteContent.crew;
  const [activeCategory, setActiveCategory] = useState<
    "all" | GroupMomentCategory
  >("all");
  const [activeMemberSlug, setActiveMemberSlug] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Build frequency-sorted member filter chips from recognized faces across the 36 group photos
  const memberFilterChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of moments) {
      for (const slug of m.memberSlugs ?? []) {
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([slug, count]) => ({
        slug,
        count,
        member: crewMembers.find((member) => member.slug === slug),
      }))
      .filter((x): x is { slug: string; count: number; member: (typeof crewMembers)[number] } => Boolean(x.member))
      .sort((a, b) => b.count - a.count);
  }, [moments, crewMembers]);

  const categoryCounts = useMemo(() => {
    return {
      all: moments.length,
      "dai-gia-dinh": moments.filter((m) => m.category === "dai-gia-dinh")
        .length,
      "hau-truong": moments.filter((m) => m.category === "hau-truong")
        .length,
      "doi-thuong": moments.filter((m) => m.category === "doi-thuong")
        .length,
    };
  }, [moments]);

  const filteredMoments = useMemo(() => {
    return moments.filter((m) => {
      if (activeCategory !== "all" && m.category !== activeCategory) {
        return false;
      }
      if (
        activeMemberSlug &&
        !(m.memberSlugs ?? []).includes(activeMemberSlug)
      ) {
        return false;
      }
      return true;
    });
  }, [moments, activeCategory, activeMemberSlug]);

  const isFiltered = activeCategory !== "all" || activeMemberSlug !== null;
  const visibleMoments =
    isFiltered || showAll
      ? filteredMoments
      : filteredMoments.slice(0, INITIAL_VISIBLE_COUNT);

  const hiddenCount = filteredMoments.length - visibleMoments.length;

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") {
        setLightboxIdx((i) =>
          i === null ? null : (i + 1) % filteredMoments.length
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIdx((i) =>
          i === null
            ? null
            : (i - 1 + filteredMoments.length) % filteredMoments.length
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, filteredMoments.length]);

  const activeMoment =
    lightboxIdx !== null ? filteredMoments[lightboxIdx] ?? null : null;

  return (
    <section id="anh-chung" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-obsidian-border pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-rec uppercase tracking-widest">
            <Camera className="w-3.5 h-3.5" />
            <span>COLLECTIVE PHOTO ARCHIVE // TỪ THƯ MỤC ẢNH NHÓM TBG</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-ivory tracking-tight">
            KHO ẢNH CHUNG ĐẠI GIA ĐÌNH THIẾT BỊ GIA
          </h2>
          <p className="text-sm sm:text-base text-ivory-muted max-w-3xl leading-relaxed">
            Tuyển chọn {moments.length} khung hình tập thể giàu cảm xúc nhất từ hơn 310 bức ảnh chung của Thiết Bị Gia — từ những buổi hội quân đông đủ 30+ anh chị em, hậu trường set đèn, sân khấu lớn cho đến những đêm lửa trại và dã ngoại bên nhau.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(
            [
              { id: "all", label: `TẤT CẢ (${categoryCounts.all})` },
              {
                id: "dai-gia-dinh",
                label: `ĐẠI GIA ĐÌNH (${categoryCounts["dai-gia-dinh"]})`,
              },
              {
                id: "hau-truong",
                label: `HẬU TRƯỜNG SET (${categoryCounts["hau-truong"]})`,
              },
              {
                id: "doi-thuong",
                label: `DÃ NGOẠI & ĐỜI THƯỜNG (${categoryCounts["doi-thuong"]})`,
              },
            ] as const
          ).map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundEngine.playTick(0.85);
                  setActiveCategory(tab.id);
                  setLightboxIdx(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-rec text-obsidian shadow-[0_0_20px_rgba(255,77,0,0.35)]"
                    : "border border-obsidian-border bg-obsidian-surface text-ivory-muted hover:text-ivory hover:border-white/25"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Face-Tagged Member Filter Strip */}
      <div className="rounded-2xl border border-obsidian-border bg-obsidian-surface/70 p-3 space-y-2 sm:p-4 sm:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex min-w-0 items-center gap-2 text-[10px] font-mono text-ivory-muted sm:text-xs">
            <Filter className="w-3.5 h-3.5 text-rec" />
            <span className="truncate">LỌC ẢNH CHUNG CÓ MẶT THÀNH VIÊN:</span>
          </div>
          {activeMemberSlug && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playTick(0.8);
                setActiveMemberSlug(null);
              }}
              className="shrink-0 text-[10px] font-mono text-rec hover:underline cursor-pointer sm:text-xs"
            >
              <span className="hidden sm:inline">XÓA LỌC THÀNH VIÊN ×</span>
              <span className="sm:hidden">XÓA LỌC ×</span>
            </button>
          )}
        </div>

        <label className="relative block sm:hidden">
          <span className="sr-only">Lọc ảnh chung theo thành viên</span>
          <select
            value={activeMemberSlug ?? ""}
            onChange={(event) => {
              soundEngine.playTick(0.85);
              setActiveMemberSlug(event.target.value || null);
              setLightboxIdx(null);
            }}
            className="w-full appearance-none rounded-xl border border-obsidian-border bg-obsidian py-2.5 pl-3 pr-9 text-xs font-mono text-ivory outline-none focus:border-rec"
          >
            <option value="">Tất cả thành viên</option>
            {memberFilterChips.map(({ slug, count, member }) => (
              <option key={slug} value={slug}>{member.name} ({count} ảnh)</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-muted" />
        </label>

        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          {memberFilterChips.map(({ slug, count, member }) => {
            const selected = activeMemberSlug === slug;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => {
                  soundEngine.playTick(0.85);
                  setActiveMemberSlug((prev) => (prev === slug ? null : slug));
                  setLightboxIdx(null);
                }}
                className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border text-xs transition-all cursor-pointer ${
                  selected
                    ? "border-rec bg-rec text-obsidian font-bold"
                    : "border-obsidian-border bg-obsidian hover:border-rec/50 text-ivory-muted hover:text-ivory"
                }`}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>{member.name}</span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                    selected
                      ? "bg-obsidian/20 text-obsidian"
                      : "bg-white/[0.06] text-ivory-subtle"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry / Bento Collective Photo Grid (Zero Face Cropping!) */}
      <div className="columns-1 md:columns-2 xl:columns-3 gap-5 space-y-5">
        {visibleMoments.map((moment, idx) => {
          const catMeta = GROUP_CATEGORY_META[moment.category];
          const recognizedCrew = (moment.memberSlugs ?? [])
            .map((slug) => crewMembers.find((member) => member.slug === slug))
            .filter(Boolean);

          return (
            <div
              key={moment.id}
              onClick={() => {
                soundEngine.playShutter();
                setLightboxIdx(idx);
              }}
              className="break-inside-avoid group relative rounded-2xl border border-obsidian-border bg-obsidian-surface overflow-hidden hover:border-rec/70 transition-all duration-300 cursor-pointer shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
            >
              {/* Natural Aspect Ratio Image Container */}
              <div className="relative overflow-hidden bg-obsidian">
                <img
                  src={moment.src}
                  alt={moment.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto block group-hover:scale-[1.03] transition-transform duration-500"
                />

                {/* Subtle top badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-obsidian shadow"
                    style={{ backgroundColor: catMeta.accent }}
                  >
                    {catMeta.shortLabel}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-obsidian/85 backdrop-blur-md border border-white/15 text-[11px] font-mono text-ivory">
                    <Users className="w-3 h-3 text-rec" />
                    <span>{moment.detectedFaceCount ?? 6}+</span>
                  </span>
                </div>

                {/* Hover Expand Pill */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-lg bg-obsidian/85 backdrop-blur-md border border-rec/50 text-xs font-mono text-ivory opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5">
                  <Expand className="w-3.5 h-3.5 text-rec" />
                  <span>PHÓNG LỚN</span>
                </div>
              </div>

              {/* Card Metadata Footer */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-ivory-subtle">
                  <span className="text-amber-400 font-bold">
                    {moment.frameCode} • {moment.dateLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-rec shrink-0" />
                    <span className="truncate">{moment.location}</span>
                  </span>
                </div>

                <h3 className="font-display text-base sm:text-lg font-bold text-ivory leading-snug group-hover:text-rec transition-colors">
                  {moment.title}
                </h3>

                <p className="text-xs text-ivory-muted line-clamp-2 leading-relaxed">
                  {moment.caption}
                </p>

                {/* Mini Avatar Stack of Recognized Brothers */}
                {recognizedCrew.length > 0 && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="pt-2 border-t border-obsidian-border/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center -space-x-2">
                      {recognizedCrew.slice(0, 6).map((c) =>
                        c ? (
                          <Link
                            key={c.slug}
                            href={`/crew/${c.slug}`}
                            title={c.name}
                            className="relative inline-block w-6 h-6 rounded-full ring-2 ring-obsidian-surface overflow-hidden hover:scale-110 hover:z-10 transition-transform"
                          >
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                        ) : null
                      )}
                      {recognizedCrew.length > 6 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-obsidian border border-obsidian-border text-[10px] font-mono text-ivory-muted">
                          +{recognizedCrew.length - 6}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-ivory-subtle truncate">
                      {recognizedCrew
                        .slice(0, 2)
                        .map((c) => c?.name.split(" ").slice(-2).join(" "))
                        .join(", ")}
                      {recognizedCrew.length > 2
                        ? ` +${recognizedCrew.length - 2}`
                        : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand / Collapse All 36 Photos Button */}
      {!isFiltered && moments.length > INITIAL_VISIBLE_COUNT && (
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              setShowAll((v) => !v);
            }}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl border border-rec/60 bg-rec/12 hover:bg-rec hover:text-obsidian text-ivory font-mono font-bold text-xs tracking-wider transition-all cursor-pointer shadow-[0_8px_28px_rgba(255,77,0,0.2)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {showAll
                ? "THU GỌN BỚT DANH SÁCH ẢNH CHUNG"
                : `XEM ĐẦY ĐỦ CẢ ${moments.length} ẢNH CHUNG (+${hiddenCount} KHUNG HÌNH NỮA)`}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showAll ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}

      {/* Full-Screen Cinema Lightbox */}
      <AnimatePresence>
        {activeMoment && lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}
            data-lenis-prevent
            className="fixed inset-0 z-[95] bg-obsidian/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl w-full rounded-2xl border border-obsidian-border bg-obsidian-surface overflow-hidden shadow-2xl"
            >
              {/* Top Bar */}
              <div className="px-5 py-3 border-b border-obsidian-border flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span className="text-amber-400 font-bold">
                    {activeMoment.frameCode}
                  </span>
                  <span className="text-ivory-muted">
                    {lightboxIdx + 1} / {filteredMoments.length}
                  </span>
                  <span className="hidden sm:inline text-ivory-subtle">•</span>
                  <span className="hidden sm:inline text-ivory-muted">
                    {activeMoment.filmStock}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxIdx(null)}
                  className="p-1.5 rounded-lg border border-obsidian-border hover:border-rec text-ivory-muted hover:text-ivory cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Stage */}
              <div className="relative bg-obsidian flex items-center justify-center max-h-[68dvh] overflow-hidden">
                <img
                  src={activeMoment.src}
                  alt={activeMoment.title}
                  className="max-h-[68dvh] w-auto object-contain"
                />

                {filteredMoments.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playTick(0.85);
                        setLightboxIdx(
                          (lightboxIdx - 1 + filteredMoments.length) %
                            filteredMoments.length
                        );
                      }}
                      className="absolute left-3 p-2.5 rounded-full bg-obsidian/85 border border-white/15 hover:border-rec text-ivory cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playTick(0.85);
                        setLightboxIdx(
                          (lightboxIdx + 1) % filteredMoments.length
                        );
                      }}
                      className="absolute right-3 p-2.5 rounded-full bg-obsidian/85 border border-white/15 hover:border-rec text-ivory cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Footer + Crew Tags */}
              <div className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-ivory">
                      {activeMoment.title}
                    </h3>
                    <p className="text-sm text-ivory-muted mt-0.5">
                      {activeMoment.caption}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-rec shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activeMoment.location}</span>
                  </span>
                </div>

                {activeMoment.memberSlugs &&
                  activeMoment.memberSlugs.length > 0 && (
                    <div className="pt-2.5 border-t border-obsidian-border flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono text-ivory-subtle uppercase">
                        Thành viên có mặt:
                      </span>
                      {activeMoment.memberSlugs.map((slug) => {
                        const member = crewMembers.find((item) => item.slug === slug);
                        if (!member) return null;
                        return (
                          <Link
                            key={slug}
                            href={`/crew/${slug}`}
                            onClick={() => setLightboxIdx(null)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-obsidian-border bg-obsidian hover:border-rec text-xs text-ivory transition-colors"
                          >
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span>{member.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
