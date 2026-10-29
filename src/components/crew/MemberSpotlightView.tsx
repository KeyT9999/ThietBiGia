"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarPlus,
  Camera,
  ChevronLeft,
  ChevronRight,
  Film,
  Hand,
  Images,
  QrCode,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { type CrewMember } from "@/data/schema";
import {
  getTeammatesForMember,
  getUnifiedProjectsForMember,
  type UnifiedMemberProject,
} from "@/data/works";
import { getCombinedRoleBadge, getRoleMeta } from "@/lib/utils";
import { DecoderText } from "@/components/layout/DecoderText";
import { MemberProjectCard } from "./MemberProjectCard";
import { soundEngine } from "@/lib/sound";
import { useSiteContent } from "@/lib/store";

const LanyardPressPass3DView = dynamic(
  () =>
    import("@/components/canvas/LanyardPressPass3D").then(
      (m) => m.LanyardPressPass3DView
    ),
  { ssr: false }
);

export function MemberSpotlightView({
  member,
  isModal = false,
}: {
  member: CrewMember;
  isModal?: boolean;
}) {
  const siteContent = useSiteContent();
  const crewMembers = siteContent.crew;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [badgeFlipped, setBadgeFlipped] = useState(false);
  const [projectTab, setProjectTab] = useState<"all" | "personal" | "shared">("all");
  const [lightboxProject, setLightboxProject] =
    useState<UnifiedMemberProject | null>(null);
  const [lightboxPhotoIdx, setLightboxPhotoIdx] = useState(0);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const roleMeta = getRoleMeta(member.roleCategory);
  const unifiedProjects = getUnifiedProjectsForMember(member, siteContent.works, crewMembers);
  const personalProjects = unifiedProjects.filter((p) => p.scope === "personal");
  const sharedProjects = unifiedProjects.filter((p) => p.scope !== "personal");
  const visibleProjects =
    projectTab === "personal"
      ? personalProjects
      : projectTab === "shared"
      ? sharedProjects
      : unifiedProjects;
  const totalFramesCount = unifiedProjects.reduce(
    (sum, p) => sum + p.frames.length,
    0
  );

  const teammates = getTeammatesForMember(member.slug, siteContent.works, crewMembers);

  const currentIdx = crewMembers.findIndex((m) => m.slug === member.slug);
  const prevMember =
    crewMembers[(currentIdx - 1 + crewMembers.length) % crewMembers.length];
  const nextMember = crewMembers[(currentIdx + 1) % crewMembers.length];

  useEffect(() => {
    setProjectTab("all");
    setBadgeFlipped(false);
    setLightboxProject(null);
    setLightboxZoomed(false);
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = "scaleX(0)";
    }
    if (!isModal && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [member.slug, isModal]);

  // Zero-setState 60fps reading progress bar in the sticky sub-header
  useEffect(() => {
    if (typeof window === "undefined") return;
    const scroller = isModal
      ? (document.querySelector("[data-modal-scroll]") as HTMLElement | null)
      : null;

    const updateProgress = () => {
      if (!progressBarRef.current) return;
      const scrollTop = scroller ? scroller.scrollTop : window.scrollY;
      const maxScroll = scroller
        ? scroller.scrollHeight - scroller.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        maxScroll > 4 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      progressBarRef.current.style.transform = `scaleX(${ratio})`;
    };

    updateProgress();
    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      target.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [isModal, member.slug, projectTab]);

  const lightboxGallery = lightboxProject ? lightboxProject.frames : [];

  useEffect(() => {
    if (!lightboxProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setLightboxProject(null);
      }
      if (e.key === "ArrowRight" && lightboxGallery.length > 1) {
        setLightboxPhotoIdx((i) => (i + 1) % lightboxGallery.length);
      }
      if (e.key === "ArrowLeft" && lightboxGallery.length > 1) {
        setLightboxPhotoIdx(
          (i) => (i - 1 + lightboxGallery.length) % lightboxGallery.length
        );
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [lightboxProject, lightboxGallery.length]);

  const openProjectLightbox = (
    proj: UnifiedMemberProject,
    startIdx = 0
  ) => {
    soundEngine.playShutter();
    setLightboxProject(proj);
    setLightboxPhotoIdx(startIdx);
  };

  const handleClose = () => {
    soundEngine.playTick(0.7);
    if (isModal) {
      router.back();
    } else {
      router.push("/crew");
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col pt-[72px]">
      {/* Ambient Radial Studio Glow behind z-40 PersistentCanvas in Modal mode */}
      {isModal && mounted
        ? createPortal(
            <div
              aria-hidden="true"
              className="pointer-events-none fixed top-[120px] bottom-0 left-0 w-full md:w-[42%] z-[35] opacity-30"
              style={{
                background: `radial-gradient(circle at 50% 45%, ${roleMeta.color}36 0%, transparent 68%)`,
              }}
            />,
            document.body
          )
        : null}

      {/* Sticky Sub-Header Bar (72px..120px, z-50 sits cleanly above z-40 Canvas & flush under Navbar shield) */}
      <div className="sticky top-[72px] z-50 h-12 border-b border-obsidian-border/90 bg-obsidian/95 backdrop-blur-xl px-4 sm:px-8 flex items-center">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center gap-2 text-xs font-mono text-ivory-muted hover:text-rec transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {isModal ? "ĐÓNG & QUAY LẠI TIMELINE" : "QUAY LẠI ROSTER"} [
              {crewMembers.length}]
            </span>
          </button>

          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <span className="text-xs font-mono text-ivory truncate">
              <span className="hidden sm:inline text-ivory-muted">
                {member.name.toUpperCase()} //{" "}
              </span>
              <span className="text-rec font-bold">CREW #{member.badgeNumber}</span>
            </span>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/crew/${prevMember.slug}`}
                replace={isModal}
                scroll={false}
                onClick={() => soundEngine.playTick(0.8)}
                title={prevMember.name}
                className="p-1.5 rounded-lg border border-obsidian-border bg-obsidian-surface hover:border-rec/60 text-ivory-muted hover:text-ivory transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={`/crew/${nextMember.slug}`}
                replace={isModal}
                scroll={false}
                onClick={() => soundEngine.playTick(0.8)}
                title={nextMember.name}
                className="p-1.5 rounded-lg border border-obsidian-border bg-obsidian-surface hover:border-rec/60 text-ivory-muted hover:text-ivory transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Scroll Reading Progress Indicator */}
        <div
          ref={progressBarRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-rec origin-left scale-x-0 transition-transform duration-75"
        />
      </div>

      {/* Two-Column Split Layout: Left 3D Physics Lanyard Badge (sticky from 768px+) + Right Bento Showcase */}
      <div className="max-w-[1600px] w-full mx-auto flex-1 grid grid-cols-1 md:grid-cols-12 md:items-start">
        {/* LEFT COLUMN (41.6%): 3D Hanging Holographic Press Pass */}
        <div className="md:col-span-5 relative border-b md:border-b-0 md:border-r border-obsidian-border/80 flex flex-col justify-between h-[420px] sm:h-[460px] md:h-[calc(100dvh-120px)] md:sticky md:top-[120px] touch-pan-y">
          {!isModal && (
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 50% 45%, ${roleMeta.color}33 0%, transparent 68%)`,
              }}
            />
          )}

          {/* Tracked WebGL View Box (transparent so PersistentCanvas z-40 shines through cleanly) */}
          <div className="relative z-10 flex-1 w-full min-h-0">
            <LanyardPressPass3DView
              member={member}
              flipped={badgeFlipped}
              onToggleFlip={() => setBadgeFlipped((f) => !f)}
            />
          </div>

          {/* Bottom Drag Instruction Pill + 180° QR Flip Button */}
          <div className="relative z-20 px-4 sm:px-5 pb-4 pt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-ivory-muted">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-obsidian-border bg-obsidian-surface/85 backdrop-blur-md">
              <Hand className="w-3.5 h-3.5 text-rec" />
              <span>KÉO THẺ ĐUNG ĐƯA</span>
            </span>

            <button
              type="button"
              onClick={() => {
                soundEngine.playShutter();
                setBadgeFlipped((f) => !f);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-bold transition-all cursor-pointer ${
                badgeFlipped
                  ? "bg-rec text-obsidian border-rec shadow-[0_0_16px_rgba(255,77,0,0.45)]"
                  : "border-rec/45 bg-obsidian-surface/90 text-ivory hover:border-rec hover:text-rec"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{badgeFlipped ? "XEM MẶT TRƯỚC" : "LẬT MẶT SAU QR"}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (58.3%): Editorial Bio + Bento Media Showcase + Đồng Đội Cùng Ekip */}
        <div className="md:col-span-7 relative z-20 bg-obsidian p-5 sm:p-8 lg:p-10 pb-24 space-y-10">
          {/* Member Intro & Gear Spec */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {member.roles.map((r) => {
                const rMeta = getRoleMeta(r);
                return (
                  <span
                    key={r}
                    className="px-3 py-1 rounded-full text-xs font-mono font-bold text-obsidian"
                    style={{ backgroundColor: rMeta.color }}
                  >
                    {rMeta.label.toUpperCase()}
                  </span>
                );
              })}
              {member.secondaryRoles.map((sr) => (
                <span
                  key={sr}
                  className="px-3 py-1 rounded-full text-xs font-mono border border-obsidian-border bg-obsidian-surface text-ivory-muted"
                >
                  {sr}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-ivory tracking-tight">
                  {member.name}
                  {member.nickname ? (
                    <span className="text-rec font-mono text-xl sm:text-2xl ml-2.5">
                      ({member.nickname})
                    </span>
                  ) : null}
                </h1>
                <p className="text-sm font-mono text-ivory-muted mt-1">
                  {member.roleTitle} • {member.location}
                </p>
              </div>

              <Link
                href={`/contact?crew=${member.slug}`}
                onClick={() => soundEngine.playShutter()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>
                  ĐẶT LỊCH CÙNG{" "}
                  {(member.nickname ?? member.name.split(" ").slice(-2).join(" ")).toUpperCase()}
                </span>
              </Link>
            </div>

            <p className="text-sm sm:text-base text-ivory/85 leading-relaxed max-w-3xl">
              {member.bio}
            </p>

            {/* Decoder Camera / Design Gear Strip */}
            <div className="rounded-xl border border-obsidian-border bg-obsidian-surface/70 px-4 py-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-rec font-semibold">
                <Camera className="w-3.5 h-3.5" />
                GEAR TỦ:
              </span>
              <DecoderText
                text={member.favoriteGear.join(" • ").toUpperCase()}
                className="text-xs font-mono text-ivory"
              />
            </div>
          </div>

          {/* UNIFIED VISUAL PROJECT SHOWCASE (Idea 1: Hover-Scrub Case-Study Cards + Scope Tabs) */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-obsidian-border bg-obsidian-surface/60 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-ivory uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rec" />
                    <span>
                      Projects Của {member.nickname ?? member.name.split(" ").slice(-2).join(" ")}
                    </span>
                  </h2>
                  <p className="text-xs font-mono text-ivory-muted mt-1 flex items-center gap-2">
                    <Images className="w-3.5 h-3.5 text-rec" />
                    <span>
                      {unifiedProjects.length} DỰ ÁN • {totalFramesCount} KHUNG HÌNH • RÊ CHUỘT TRÊN ẢNH ĐỂ LƯỚT NHANH
                    </span>
                  </p>
                </div>

                <Link
                  href={`/works?member=${member.slug}`}
                  onClick={() => soundEngine.playTick(0.8)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-obsidian-border hover:border-rec/60 bg-obsidian text-xs font-mono text-ivory-muted hover:text-rec transition-colors"
                >
                  <Film className="w-3.5 h-3.5 text-rec" />
                  <span>MỞ KHO PROJECT CHUNG</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Filter Scope Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-obsidian-border/70">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(0.8);
                    setProjectTab("all");
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                    projectTab === "all"
                      ? "bg-rec text-obsidian shadow-[0_0_16px_rgba(255,77,0,0.35)]"
                      : "border border-obsidian-border bg-obsidian text-ivory-muted hover:text-ivory"
                  }`}
                >
                  TẤT CẢ [{unifiedProjects.length}]
                </button>

                {personalProjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTick(0.8);
                      setProjectTab("personal");
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                      projectTab === "personal"
                        ? "bg-rec text-obsidian"
                        : "border border-obsidian-border bg-obsidian text-ivory-muted hover:text-ivory"
                    }`}
                  >
                    DỰ ÁN CÁ NHÂN [{personalProjects.length}]
                  </button>
                )}

                {sharedProjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTick(0.8);
                      setProjectTab("shared");
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                      projectTab === "shared"
                        ? "bg-cyan-400 text-obsidian"
                        : "border border-obsidian-border bg-obsidian text-ivory-muted hover:text-ivory"
                    }`}
                  >
                    DỰ ÁN CHUNG [{sharedProjects.length}]
                  </button>
                )}
              </div>
            </div>

            {/* Hover-Scrubbable Case-Study Grid */}
            <div className="grid grid-cols-12 gap-5">
              {visibleProjects.map((proj, idx) => (
                <MemberProjectCard
                  key={proj.id}
                  project={proj}
                  featured={idx === 0}
                  isModal={isModal}
                  onOpenAlbum={openProjectLightbox}
                />
              ))}
            </div>
          </div>

          {/* ĐỒNG ĐỘI CÙNG EKIP */}
          <div className="pt-4 border-t border-obsidian-border space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-bold tracking-wide text-ivory uppercase">
                ĐỒNG ĐỘI CÙNG EKIP
              </h2>
              <Link
                href="/crew"
                className="inline-flex items-center gap-2 text-xs font-mono text-rec hover:underline"
              >
                <span>XEM TẤT CẢ {crewMembers.length} ANH EM</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {teammates.map(({ member: tm, sharedCount }) => (
                <Link
                  key={tm.id}
                  href={`/crew/${tm.slug}`}
                  replace={isModal}
                  scroll={false}
                  onClick={() => soundEngine.playShutter()}
                  className="group flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-20 h-20 rounded-full p-1 border-2 border-rec group-hover:scale-105 transition-transform bg-obsidian-surface overflow-hidden">
                    <img
                      src={tm.avatar}
                      alt={tm.name}
                      className="w-full h-full rounded-full object-cover object-[50%_18%]"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ivory group-hover:text-rec transition-colors truncate max-w-[130px]">
                      {tm.name}
                    </div>
                    <div className="text-xs font-mono text-ivory-muted uppercase">
                      {getCombinedRoleBadge(tm.roles)}
                    </div>
                    <div className="text-xs font-mono text-ivory-subtle">
                      {sharedCount} dự án chung
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Portfolio Album Lightbox (portaled to document.body at z-[95] above Navbar & Canvas) */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {lightboxProject && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setLightboxProject(null)}
                  data-lenis-prevent
                  className="fixed inset-0 z-[95] bg-obsidian/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-5xl w-full rounded-2xl border border-obsidian-border bg-obsidian-surface overflow-hidden shadow-2xl flex flex-col max-h-[92dvh]"
                  >
                    {/* Lightbox Header */}
                    <div className="px-5 py-3.5 border-b border-obsidian-border flex items-center justify-between gap-4 shrink-0">
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-rec font-bold truncate">
                          {member.name.toUpperCase()} • {lightboxProject.roleBadge.toUpperCase()} • FRAME{" "}
                          {lightboxPhotoIdx + 1} / {lightboxGallery.length}
                        </div>
                        <h3 className="font-display text-lg font-bold text-ivory truncate">
                          {lightboxProject.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playTick(0.8);
                            setLightboxZoomed((z) => !z);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                            lightboxZoomed
                              ? "border-cyan-400 bg-cyan-400/15 text-cyan-300 font-bold"
                              : "border-obsidian-border text-ivory-muted hover:text-ivory"
                          }`}
                        >
                          {lightboxZoomed ? (
                            <>
                              <ZoomOut className="w-3.5 h-3.5" />
                              <span>THU NHỎ (1X)</span>
                            </>
                          ) : (
                            <>
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>SOI NÉT (2X)</span>
                            </>
                          )}
                        </button>
                        {lightboxProject.workSlug && (
                          <Link
                            href={`/works/${lightboxProject.workSlug}`}
                            scroll={false}
                            onClick={() => setLightboxProject(null)}
                            className="px-3 py-1.5 rounded-lg bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors"
                          >
                            MỞ TRANG DỰ ÁN &amp; BTS →
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => setLightboxProject(null)}
                          className="p-1.5 rounded-lg border border-obsidian-border hover:border-rec text-ivory-muted hover:text-ivory"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Uncropped Full-Frame Viewer with 2x Loupe Inspection */}
                    <div
                      onClick={() => setLightboxZoomed((z) => !z)}
                      className={`relative bg-obsidian flex-1 min-h-0 flex items-center justify-center p-3 ${
                        lightboxZoomed
                          ? "overflow-auto cursor-zoom-out"
                          : "overflow-hidden cursor-zoom-in"
                      }`}
                    >
                      <img
                        src={lightboxGallery[lightboxPhotoIdx]}
                        alt=""
                        className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-110"
                      />
                      <img
                        src={lightboxGallery[lightboxPhotoIdx]}
                        alt={lightboxProject.title}
                        className={`relative z-10 rounded-lg shadow-2xl transition-transform duration-300 ${
                          lightboxZoomed
                            ? "max-h-none w-auto scale-150 sm:scale-[1.85]"
                            : "max-h-[64dvh] w-auto max-w-full object-contain"
                        }`}
                      />

                      {lightboxGallery.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playTick(0.85);
                              setLightboxPhotoIdx(
                                (lightboxPhotoIdx - 1 + lightboxGallery.length) %
                                  lightboxGallery.length
                              );
                            }}
                            className="absolute z-20 left-3 p-2.5 rounded-full bg-obsidian/85 border border-white/15 hover:border-rec text-ivory"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playTick(0.85);
                              setLightboxPhotoIdx(
                                (lightboxPhotoIdx + 1) % lightboxGallery.length
                              );
                            }}
                            className="absolute z-20 right-3 p-2.5 rounded-full bg-obsidian/85 border border-white/15 hover:border-rec text-ivory"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnails & Description Footer */}
                    <div className="p-4 border-t border-obsidian-border space-y-3 shrink-0">
                      {lightboxGallery.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {lightboxGallery.map((src, idx) => (
                            <button
                              key={src + idx}
                              type="button"
                              onClick={() => {
                                soundEngine.playTick(0.75);
                                setLightboxPhotoIdx(idx);
                              }}
                              className={`w-16 h-12 rounded-md overflow-hidden border-2 shrink-0 transition-all ${
                                idx === lightboxPhotoIdx
                                  ? "border-rec scale-105"
                                  : "border-obsidian-border opacity-55 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={src}
                                alt=""
                                className="w-full h-full object-cover object-[50%_20%]"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ivory-muted">
                        <p className="max-w-3xl">{lightboxProject.summary}</p>
                        <span className="font-mono text-rec font-semibold shrink-0">
                          {lightboxProject.exifSpec ?? lightboxProject.cameraSpec}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )
        : null}
    </div>
  );
}
