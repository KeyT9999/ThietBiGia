"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarPlus,
  Camera,
  CheckCircle2,
  Film,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { type WorkProject } from "@/data/schema";
import { getRoleMeta } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import { useSiteContent } from "@/lib/store";
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

  const currentFrameSrc = work.coverImage;
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
            <h2 className="font-display text-xl font-bold text-ivory">VIDEO DỰ ÁN</h2>
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-obsidian-border bg-obsidian">
              <iframe
                src={work.videoEmbedUrl}
                title={work.title}
                className="h-full w-full border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
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
    </div>
  );
}
