"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarPlus,
  Camera,
  CheckCircle2,
  Film,
  Maximize2,
  Play,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { type WorkProject } from "@/data/schema";
import { getRoleMeta } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import { useSiteContent } from "@/lib/store";
import { toYoutubeEmbedUrl } from "@/lib/youtube";
import { BeforeAfterGradeSlider } from "./BeforeAfterGradeSlider";
import { ProjectPhotoGallery } from "./ProjectPhotoGallery";

export function ProjectDetailView({
  work,
  isModal = false,
}: {
  work: WorkProject;
  isModal?: boolean;
}) {
  const router = useRouter();
  const crewMembers = useSiteContent().crew;
  const [compareGrade, setCompareGrade] = useState(false);
  const [isPortraitFrame, setIsPortraitFrame] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  const currentFrameSrc = work.coverImage;
  const videoEmbedUrl = work.videoEmbedUrl
    ? toYoutubeEmbedUrl(work.videoEmbedUrl)
    : null;
  const videoId = videoEmbedUrl?.split("/").pop();
  const videoThumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : currentFrameSrc;
  const expandedVideoUrl = videoEmbedUrl
    ? `${videoEmbedUrl}?autoplay=1&rel=0`
    : null;
  const crewBookingParam = work.credits
    .slice(0, 4)
    .map((c) => c.memberSlug)
    .join(",");

  const handleClose = () => {
    soundEngine.playTick(0.7);
    if (isModal) {
      router.back();
    } else {
      router.push("/works");
    }
  };

  useEffect(() => {
    if (!isVideoExpanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setIsVideoExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isVideoExpanded]);

  return (
    <div className="relative z-50 min-h-[100dvh] w-full bg-obsidian pt-[72px] pb-24">
      {/* Sticky Top Bar */}
      <div className="sticky top-[72px] z-50 h-12 border-b border-obsidian-border bg-obsidian/95 backdrop-blur-xl px-4 sm:px-8 flex items-center">
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center gap-2 text-xs font-mono text-ivory-muted hover:text-rec transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {isModal ? "ĐÓNG CỬA SỔ PROJECT [ESC]" : "QUAY LẠI KHO PROJECTS"}
            </span>
          </button>

          <div className="flex items-center gap-3 text-xs font-mono text-ivory-muted">
            <span>
              SCENE <span className="text-rec font-bold">{work.indexLabel}</span>{" "}
              // {work.durationTimecode}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 pt-8 space-y-10">
        {/* Header Metadata + EXIF Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span
                className="px-3 py-1 rounded-full font-bold text-obsidian"
                style={{ backgroundColor: work.accentColor }}
              >
                {work.category.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full border border-obsidian-border bg-obsidian-surface text-ivory-muted">
                {work.clientOrSeries} • {work.year}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-ivory tracking-tight">
              {work.title}
            </h1>
            <p className="text-sm sm:text-base text-ivory/85 leading-relaxed max-w-3xl">
              {work.summary}
            </p>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-obsidian-border bg-obsidian-surface/80 p-4 space-y-2">
            <div className="text-xs font-mono text-rec flex items-center justify-between gap-1.5">
              <span className="inline-flex items-center gap-1.5 font-bold">
                <Camera className="w-3.5 h-3.5" />
                <span>{work.exifSpec ? "EXIF THỰC TẾ TRÊN MÁY" : "THÔNG SỐ GHI HÌNH"}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-rec/15 text-[10px]">
                RAW / LOG
              </span>
            </div>
            <div className="text-xs font-mono text-ivory font-semibold leading-relaxed">
              {work.exifSpec ?? work.cameraSpec}
            </div>
          </div>
        </div>

        {/* Main Cinema Stage / Before-After Grade Viewer / Video Player */}
        <div className="space-y-3">
          {/* Interactive Viewer Mode Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTick(0.8);
                  setCompareGrade(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                  !compareGrade
                    ? "bg-rec text-obsidian"
                    : "border border-obsidian-border bg-obsidian-surface text-ivory-muted hover:text-ivory"
                }`}
              >
                ẢNH BÌA DỰ ÁN
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playShutter();
                  setCompareGrade((v) => !v);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                  compareGrade
                    ? "bg-cyan-400 text-obsidian shadow-[0_0_16px_rgba(34,211,238,0.4)]"
                    : "border border-obsidian-border bg-obsidian-surface text-ivory-muted hover:text-ivory"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>SO SÁNH MÀU HẬU KỲ (RAW ⇄ GRADE)</span>
              </button>
            </div>

            <Link
              href={`/contact?crew=${encodeURIComponent(crewBookingParam)}&project=${encodeURIComponent(work.slug)}`}
              onClick={() => soundEngine.playShutter()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rec/50 bg-rec/12 hover:bg-rec hover:text-obsidian text-xs font-mono font-bold text-rec transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>ĐẶT LỊCH EKIP NÀY →</span>
            </Link>
          </div>

          {/* Stage Box */}
          <div className="relative h-[56dvh] sm:h-[68dvh] w-full rounded-2xl border border-obsidian-border bg-obsidian overflow-hidden group flex items-center justify-center">
            {/* Hidden probe to detect portrait vs landscape cleanly */}
            <img
              src={currentFrameSrc}
              alt=""
              onLoad={(e) => {
                const el = e.currentTarget;
                setIsPortraitFrame(el.naturalHeight > el.naturalWidth * 1.05);
              }}
              className="hidden"
            />

            {compareGrade ? (
              <BeforeAfterGradeSlider
                afterSrc={currentFrameSrc}
                beforeSrc={work.beforeImage}
                title={work.title}
                isPortrait={isPortraitFrame}
              />
            ) : (
              <div
                className="relative w-full h-full flex items-center justify-center"
              >
                <img
                  src={currentFrameSrc}
                  alt=""
                  className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110"
                />
                <img
                  src={currentFrameSrc}
                  alt={work.title}
                  className="relative z-10 max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-obsidian/75 via-transparent to-obsidian/30" />

                <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-xs font-mono text-ivory/90 pointer-events-none">
                  <span className="flex items-center gap-2 bg-obsidian/75 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-rec animate-pulse" />
                    ẢNH BÌA DỰ ÁN
                  </span>
                  <span className="bg-obsidian/75 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    {work.durationTimecode}
                  </span>
                </div>

              </div>
            )}
          </div>

        </div>

        <ProjectPhotoGallery work={work} />

        {work.videoEmbedUrl ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-rec">PROJECT FILM</p>
                <h2 className="mt-1 font-display text-xl font-bold text-ivory">VIDEO DỰ ÁN</h2>
              </div>
              <span className="font-mono text-xs text-ivory-muted">Chạm vào khung để xem lớn và đọc ghi chú</span>
            </div>
            {videoEmbedUrl ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTick(0.85);
                  setIsVideoExpanded(true);
                }}
                aria-label={`Mở video và ghi chú dự án ${work.title}`}
                aria-haspopup="dialog"
                className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-obsidian-border bg-obsidian text-left"
              >
                <img
                  src={videoThumbnailUrl}
                  alt={`Ảnh xem trước video ${work.title}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute inset-0 bg-obsidian/20 transition-colors group-hover:bg-obsidian/40" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-obsidian/80 px-2.5 py-1.5 font-mono text-[10px] text-ivory backdrop-blur sm:left-5 sm:top-5 sm:px-3 sm:text-xs">
                  <Maximize2 className="h-3.5 w-3.5 text-rec" /> MỞ VIDEO &amp; GHI CHÚ
                </span>
                <span className="absolute left-1/2 top-1/2 flex h-14 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-rec text-obsidian shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-110 sm:h-16 sm:w-24">
                  <Play className="h-7 w-7 fill-current sm:h-8 sm:w-8" />
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/95 via-obsidian/50 to-transparent px-4 pb-4 pt-12 sm:px-6 sm:pb-6">
                  <span className="block font-display text-lg font-bold text-white sm:text-2xl">{work.title}</span>
                  <span className="mt-1 block text-xs text-white/75 sm:text-sm">{work.category} • {work.year}</span>
                </span>
              </button>
            ) : (
              <p role="status" className="rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-sm text-amber-100">
                Link video chưa đúng định dạng YouTube. Hãy kiểm tra lại trong phần chỉnh sửa dự án.
              </p>
            )}
          </section>
        ) : null}

        {/* Full Crew Credits & Behind The Scenes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-display text-xl font-bold text-ivory flex items-center gap-2">
              <Users className="w-5 h-5 text-rec" />
              <span>EKIP THIẾT BỊ GIA THỰC HIỆN ({work.credits.length})</span>
            </h2>
            <p className="text-xs font-mono text-ivory-muted">
              Nhấn vào từng thành viên để xem Thẻ Tác Nghiệp 3D &amp; Hồ sơ cá nhân
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {work.credits.map((c) => {
                const member = crewMembers.find((item) => item.slug === c.memberSlug);
                if (!member) return null;
                const meta = getRoleMeta(member.roleCategory);

                return (
                  <Link
                    key={c.memberSlug}
                    href={`/crew/${member.slug}`}
                    scroll={false}
                    onClick={() => soundEngine.playShutter()}
                    className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-obsidian-border bg-obsidian-surface hover:border-rec/70 transition-all"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover object-[50%_18%] border-2 shrink-0"
                      style={{ borderColor: meta.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono text-rec font-semibold">
                        {c.roleOnProject.toUpperCase()}
                      </div>
                      <div className="font-display font-bold text-sm text-ivory group-hover:text-rec transition-colors truncate">
                        {member.name}
                      </div>
                      <div className="text-xs text-ivory-muted truncate">
                        {member.favoriteGear[0]}
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-ivory-subtle group-hover:text-rec shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-obsidian-border bg-obsidian-surface p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-ivory flex items-center gap-2">
                <Film className="w-4 h-4 text-rec" />
                <span>GHI CHÚ HẬU TRƯỜNG (BTS)</span>
              </h3>
              <ul className="space-y-3">
                {work.btsNotes.map((note, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-ivory/85 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-rec shrink-0 mt-1" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-obsidian-border bg-obsidian-surface p-6 space-y-3">
              <h3 className="font-mono text-xs text-ivory-muted uppercase tracking-wider">
                THIẾT BỊ SỬ DỤNG TRÊN SET
              </h3>
              <div className="flex flex-wrap gap-2">
                {work.gearUsed.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1.5 rounded-lg border border-obsidian-border bg-obsidian text-xs font-mono text-ivory"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isVideoExpanded && expandedVideoUrl && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-2 backdrop-blur-sm sm:p-5"
              onClick={() => setIsVideoExpanded(false)}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="expanded-project-video-title"
                onClick={(event) => event.stopPropagation()}
                className="flex max-h-[96dvh] w-full max-w-[1500px] flex-col overflow-hidden rounded-xl border border-white/15 bg-obsidian shadow-[0_30px_120px_rgba(0,0,0,0.8)] sm:rounded-2xl"
              >
                <header className="flex shrink-0 items-center justify-between gap-3 border-b border-obsidian-border px-3 py-3 sm:px-5 sm:py-4">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[10px] font-bold tracking-wider text-rec sm:text-xs">
                      {work.category.toUpperCase()} • {work.clientOrSeries} • {work.year}
                    </p>
                    <h2 id="expanded-project-video-title" className="mt-1 truncate font-display text-base font-bold text-ivory sm:text-xl">
                      {work.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setIsVideoExpanded(false)}
                    aria-label="Đóng video"
                    className="shrink-0 rounded-lg border border-white/15 p-2 text-ivory-muted transition hover:border-rec hover:text-rec"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </header>

                <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)] lg:overflow-hidden">
                  <div className="aspect-video w-full shrink-0 self-start bg-black lg:aspect-auto lg:h-full">
                    <iframe
                      src={expandedVideoUrl}
                      title={work.title}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>

                  <aside className="space-y-5 border-t border-obsidian-border p-4 sm:p-5 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
                    <div className="space-y-2">
                      <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-rec">PROJECT NOTES</p>
                      <h3 className="font-display text-lg font-bold text-ivory">{work.title}</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-ivory/85">{work.summary}</p>
                    </div>

                    {work.btsNotes.length > 0 ? (
                      <div className="space-y-3 border-t border-obsidian-border pt-4">
                        <h4 className="flex items-center gap-2 font-display font-bold text-ivory">
                          <Film className="h-4 w-4 text-rec" /> GHI CHÚ DỰ ÁN
                        </h4>
                        <ul className="space-y-3">
                          {work.btsNotes.map((note, index) => (
                            <li key={`${index}-${note}`} className="flex items-start gap-2.5 text-sm leading-relaxed text-ivory/85">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-rec" />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="space-y-2 border-t border-obsidian-border pt-4">
                      <h4 className="font-mono text-[10px] font-bold tracking-wider text-ivory-muted">THÔNG TIN GHI HÌNH</h4>
                      <p className="text-sm leading-relaxed text-ivory">{work.exifSpec ?? work.cameraSpec}</p>
                      {work.gearUsed.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {work.gearUsed.map((gear) => (
                            <span key={gear} className="rounded-lg border border-obsidian-border bg-obsidian-surface px-2.5 py-1.5 font-mono text-[10px] text-ivory-muted">
                              {gear}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </aside>
                </div>
              </section>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
