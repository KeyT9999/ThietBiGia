"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Film,
  Hand,
  Mail,
  Maximize2,
  Play,
  Pause,
  Sparkles,
  X,
} from "lucide-react";
import { CREW_MEMBERS } from "@/data/crew";
import { type BentoItem, type CrewMember } from "@/data/schema";
import { getTeammatesForMember, getWorksForMember } from "@/data/works";
import { getCombinedRoleBadge, getRoleMeta } from "@/lib/utils";
import { DecoderText } from "@/components/layout/DecoderText";
import { soundEngine } from "@/lib/sound";

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
  const router = useRouter();
  const [reelPlaying, setReelPlaying] = useState(false);
  const [reelFrameIdx, setReelFrameIdx] = useState(0);
  const [lightboxItem, setLightboxItem] = useState<BentoItem | null>(null);
  const [lightboxPhotoIdx, setLightboxPhotoIdx] = useState(0);

  const roleMeta = getRoleMeta(member.roleCategory);
  const memberWorks = getWorksForMember(member.slug);
  const teammates = getTeammatesForMember(member.slug);

  const currentIdx = CREW_MEMBERS.findIndex((m) => m.slug === member.slug);
  const prevMember =
    CREW_MEMBERS[(currentIdx - 1 + CREW_MEMBERS.length) % CREW_MEMBERS.length];
  const nextMember = CREW_MEMBERS[(currentIdx + 1) % CREW_MEMBERS.length];

  const heroShowreel = member.showcase[0];
  const restShowcase = member.showcase.slice(1);
  const heroGallery =
    heroShowreel?.gallery && heroShowreel.gallery.length > 0
      ? heroShowreel.gallery
      : heroShowreel
      ? [heroShowreel.image]
      : [];

  useEffect(() => {
    setReelFrameIdx(0);
    setReelPlaying(false);
    setLightboxItem(null);
  }, [member.slug]);

  useEffect(() => {
    if (!reelPlaying || heroGallery.length <= 1) return;
    const id = setInterval(() => {
      setReelFrameIdx((prev) => (prev + 1) % heroGallery.length);
    }, 1300);
    return () => clearInterval(id);
  }, [reelPlaying, heroGallery.length]);

  const lightboxGallery = lightboxItem
    ? lightboxItem.gallery && lightboxItem.gallery.length > 0
      ? lightboxItem.gallery
      : [lightboxItem.image]
    : [];

  useEffect(() => {
    if (!lightboxItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxItem(null);
      if (e.key === "ArrowRight" && lightboxGallery.length > 1) {
        setLightboxPhotoIdx((i) => (i + 1) % lightboxGallery.length);
      }
      if (e.key === "ArrowLeft" && lightboxGallery.length > 1) {
        setLightboxPhotoIdx(
          (i) => (i - 1 + lightboxGallery.length) % lightboxGallery.length
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxItem, lightboxGallery.length]);

  const openItemLightbox = (item: BentoItem, startIdx = 0) => {
    soundEngine.playShutter();
    setLightboxItem(item);
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
    <div className="relative min-h-[100dvh] w-full flex flex-col pt-16">
      {/* Sticky Sub-Header Bar (z-50 sits cleanly above z-40 Canvas) */}
      <div className="sticky top-16 z-50 border-b border-obsidian-border/90 bg-obsidian/90 backdrop-blur-xl px-4 sm:px-8 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center gap-2 text-xs font-mono text-ivory-muted hover:text-rec transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {isModal ? "ĐÓNG & QUAY LẠI TIMELINE" : "QUAY LẠI ROSTER"} [
              {CREW_MEMBERS.length}]
            </span>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-ivory">
              THIẾT BỊ GIA /{" "}
              <span className="text-rec font-bold">CREW #{member.badgeNumber}</span>
            </span>

            <div className="flex items-center gap-1">
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
      </div>

      {/* Two-Column Split Layout: Left 3D Physics Lanyard Badge + Right Bento Showcase */}
      <div className="max-w-[1600px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN (35-38%): 3D Hanging Holographic Press Pass */}
        <div className="lg:col-span-5 relative border-b lg:border-b-0 lg:border-r border-obsidian-border/80 flex flex-col justify-between min-h-[500px] lg:h-[calc(100dvh-118px)] lg:sticky lg:top-[118px]">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${roleMeta.color}33 0%, transparent 68%)`,
            }}
          />

          {/* Tracked WebGL View Box (renders onto PersistentCanvas z-40) */}
          <div className="relative z-10 flex-1 w-full min-h-[440px]">
            <LanyardPressPass3DView member={member} />
          </div>

          {/* Bottom Drag Instruction Pill (z-50) */}
          <div className="relative z-50 px-6 pb-5 pt-2 flex items-center justify-between text-xs font-mono text-ivory-muted">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-obsidian-border bg-obsidian-surface/85 backdrop-blur-md">
              <Hand className="w-3.5 h-3.5 text-rec" />
              <span>NẮM KÉO THẺ 3D ĐỂ ĐUNG ĐƯA VẬT LÝ</span>
            </span>
            <span className="hidden sm:inline text-ivory-subtle">RAPIER 3D</span>
          </div>
        </div>

        {/* RIGHT COLUMN (62-65%): Editorial Bio + Bento Media Showcase + Đồng Đội Cùng Ekip */}
        <div
          data-lenis-prevent={isModal ? true : undefined}
          className="lg:col-span-7 relative z-50 p-5 sm:p-8 lg:p-10 space-y-10"
        >
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

              {member.socials.email && (
                <a
                  href={`mailto:${member.socials.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>LIÊN HỆ BOOKING</span>
                </a>
              )}
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

          {/* BENTO SHOWCASE (Matching Mockup 5 + Multi-Photo Interactive Lightbox!) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-wide text-ivory uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rec" />
                Tác Phẩm &amp; Bộ Sưu Tập Cá Nhân
              </h2>
              <span className="text-xs font-mono text-ivory-subtle">
                NHẤN VÀO ẢNH ĐỂ XEM FULL ALBUM
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Primary Showreel / Lead Series Card */}
              {heroShowreel && (
                <div className="md:col-span-8 rounded-2xl border border-obsidian-border hover:border-rec/60 bg-obsidian-surface overflow-hidden group relative transition-colors">
                  {/* Top progress indicator bar */}
                  <div className="px-4 py-2.5 bg-obsidian/90 border-b border-obsidian-border flex items-center gap-3">
                    <div className="flex-1 h-1 bg-obsidian-border rounded-full relative">
                      <div
                        className="h-full bg-rec rounded-full transition-all duration-500"
                        style={{
                          width:
                            heroGallery.length > 1
                              ? `${((reelFrameIdx + 1) / heroGallery.length) * 100}%`
                              : reelPlaying
                              ? "68%"
                              : "36%",
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-ivory-muted">
                      {heroShowreel.durationOrSpec}
                    </span>
                    <button
                      type="button"
                      onClick={() => openItemLightbox(heroShowreel, reelFrameIdx)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rec/15 hover:bg-rec text-rec hover:text-obsidian text-xs font-mono font-semibold transition-colors"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>ALBUM</span>
                    </button>
                  </div>

                  <div
                    onClick={() => {
                      soundEngine.playShutter();
                      if (heroGallery.length > 1) {
                        setReelPlaying((v) => !v);
                      } else {
                        openItemLightbox(heroShowreel, 0);
                      }
                    }}
                    className="relative aspect-video overflow-hidden cursor-pointer bg-obsidian"
                  >
                    <img
                      src={heroGallery[reelFrameIdx] ?? heroShowreel.image}
                      alt={heroShowreel.title}
                      className={`w-full h-full object-cover object-[50%_22%] transition-transform duration-700 ${
                        reelPlaying ? "scale-105" : "group-hover:scale-105"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent" />

                    {/* Center Play / Expand Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-14 h-14 rounded-full bg-obsidian/75 border border-ivory/30 group-hover:border-rec group-hover:bg-rec group-hover:text-obsidian text-ivory flex items-center justify-center backdrop-blur-md transition-all">
                        {reelPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono text-rec">
                          {reelPlaying
                            ? `● SLIDESHOW ${reelFrameIdx + 1}/${heroGallery.length}`
                            : heroShowreel.subtitle}
                        </div>
                        <div className="font-display font-bold text-base sm:text-lg text-ivory">
                          {heroShowreel.title}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-ivory-muted bg-obsidian/80 px-2.5 py-1 rounded border border-white/10 shrink-0">
                        {heroGallery.length > 1
                          ? `${reelFrameIdx + 1} / ${heroGallery.length}`
                          : "HD"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Secondary Bento Cards */}
              {restShowcase.map((item, idx) => {
                const count = item.gallery?.length ?? 1;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItemLightbox(item, 0)}
                    className={`${
                      idx === 0 ? "md:col-span-4 min-h-[280px]" : "md:col-span-6 min-h-[250px]"
                    } text-left rounded-2xl border border-obsidian-border hover:border-rec/70 bg-obsidian-surface overflow-hidden group relative flex flex-col justify-end transition-colors cursor-pointer`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover object-[50%_18%] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/95 via-obsidian/30 to-transparent" />

                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-obsidian/80 backdrop-blur-md border border-white/15 text-xs font-mono text-ivory flex items-center gap-1.5 group-hover:border-rec group-hover:text-rec transition-colors">
                      <Maximize2 className="w-3 h-3" />
                      <span>{count > 1 ? `${count} ẢNH` : "PHÓNG LỚN"}</span>
                    </span>

                    <div className="relative p-4 space-y-1">
                      <span className="text-xs font-mono text-rec">
                        {item.durationOrSpec}
                      </span>
                      <h3 className="font-display font-bold text-sm sm:text-base text-ivory leading-snug group-hover:text-rec transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-ivory-muted">{item.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GROUP CAMPAIGNS PARTICIPATED IN */}
          {memberWorks.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold tracking-wide text-ivory uppercase flex items-center gap-2">
                <Film className="w-4 h-4 text-rec" />
                Dự Án Nổi Bật &amp; Chiến Dịch Nhóm ({memberWorks.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {memberWorks.map((w) => {
                  const credit = w.credits.find((c) => c.memberSlug === member.slug);
                  return (
                    <Link
                      key={w.id}
                      href={`/works/${w.slug}`}
                      scroll={false}
                      onClick={() => soundEngine.playShutter()}
                      className="group flex items-center gap-3.5 p-3 rounded-xl border border-obsidian-border bg-obsidian-surface/75 hover:border-rec/60 transition-all"
                    >
                      <img
                        src={w.coverImage}
                        alt={w.title}
                        className="w-16 h-16 rounded-lg object-cover object-[50%_20%] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono text-rec truncate">
                          SCENE {w.indexLabel} • {credit?.roleOnProject}
                        </div>
                        <div className="font-display font-bold text-base text-ivory truncate group-hover:text-rec transition-colors">
                          {w.title}
                        </div>
                        <div className="text-xs text-ivory-muted truncate">
                          {w.category} ({w.year})
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-ivory-subtle group-hover:text-rec shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

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
                <span>XEM TẤT CẢ {CREW_MEMBERS.length} ANH EM</span>
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

      {/* Full-Screen Portfolio Album Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxItem(null)}
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
                  <div className="text-xs font-mono text-rec font-bold">
                    {member.name.toUpperCase()} • FRAME {lightboxPhotoIdx + 1} /{" "}
                    {lightboxGallery.length}
                  </div>
                  <h3 className="font-display text-lg font-bold text-ivory truncate">
                    {lightboxItem.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {lightboxItem.projectSlug && (
                    <Link
                      href={`/works/${lightboxItem.projectSlug}`}
                      scroll={false}
                      onClick={() => setLightboxItem(null)}
                      className="px-3 py-1.5 rounded-lg bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors"
                    >
                      MỞ TRANG DỰ ÁN →
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setLightboxItem(null)}
                    className="p-1.5 rounded-lg border border-obsidian-border hover:border-rec text-ivory-muted hover:text-ivory"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Uncropped Full-Frame Viewer */}
              <div className="relative bg-obsidian flex-1 min-h-0 flex items-center justify-center p-3 overflow-hidden">
                <img
                  src={lightboxGallery[lightboxPhotoIdx]}
                  alt=""
                  className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-110"
                />
                <img
                  src={lightboxGallery[lightboxPhotoIdx]}
                  alt={lightboxItem.title}
                  className="relative z-10 max-h-[64dvh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
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

                {lightboxItem.description && (
                  <p className="text-xs sm:text-sm text-ivory-muted">
                    {lightboxItem.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
