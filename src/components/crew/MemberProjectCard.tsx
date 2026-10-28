"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Camera,
  Film,
  Images,
  Maximize2,
  Sparkles,
  Users,
} from "lucide-react";
import { type UnifiedMemberProject } from "@/data/works";
import { getRoleMeta } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

export function MemberProjectCard({
  project,
  featured = false,
  isModal = false,
  onOpenAlbum,
}: {
  project: UnifiedMemberProject;
  featured?: boolean;
  isModal?: boolean;
  onOpenAlbum: (project: UnifiedMemberProject, frameIdx: number) => void;
}) {
  const [activeFrame, setActiveFrame] = useState(0);
  const [isPortraitFrame, setIsPortraitFrame] = useState(false);

  const frames = project.frames;
  const currentSrc = frames[activeFrame] ?? project.coverImage;

  const scopeBadge =
    project.scope === "lead"
      ? { label: "CHỦ ĐẠO", bg: project.accentColor, text: "#08090C" }
      : project.scope === "personal"
      ? { label: "CÁ NHÂN", bg: "#FF4D00", text: "#08090C" }
      : { label: "CÙNG EKIP", bg: "#1E2433", text: "#F4F1EA" };

  const scrubAtClientX = (clientX: number, el: HTMLElement) => {
    if (frames.length <= 1) return;
    const rect = el.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.min(frames.length - 1, Math.floor(relX * frames.length));
    if (idx !== activeFrame) {
      soundEngine.playTick(0.42);
      setActiveFrame(idx);
    }
  };

  const handleStageScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    scrubAtClientX(e.clientX, e.currentTarget);
  };

  const handleTouchScrub = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      scrubAtClientX(e.touches[0].clientX, e.currentTarget);
    }
  };

  return (
    <article
      className={`${
        featured ? "col-span-12" : "col-span-12 xl:col-span-6"
      } rounded-2xl border border-obsidian-border hover:border-rec/65 bg-obsidian-surface overflow-hidden flex flex-col justify-between transition-all shadow-[0_12px_36px_rgba(0,0,0,0.35)] group`}
    >
      <div>
        {/* Top Camera Viewfinder Bar + Multi-Frame Segment Progress */}
        <div className="px-4 pt-3 pb-2.5 bg-obsidian/90 border-b border-obsidian-border space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="px-2 py-0.5 rounded font-bold shrink-0"
                style={{
                  backgroundColor: scopeBadge.bg,
                  color: scopeBadge.text,
                }}
              >
                {scopeBadge.label}
              </span>
              <span className="text-rec font-semibold truncate">
                {project.roleBadge}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 text-ivory-muted">
              <span className="inline-flex items-center gap-1">
                <Images className="w-3.5 h-3.5 text-rec" />
                <span>
                  {String(activeFrame + 1).padStart(2, "0")}/
                  {String(frames.length).padStart(2, "0")}
                </span>
              </span>
              <span className="text-ivory-subtle">• {project.year}</span>
            </div>
          </div>

          {/* Segmented Frame Scrubber Bar */}
          {frames.length > 1 && (
            <div className="flex items-center gap-1">
              {frames.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor:
                      idx === activeFrame
                        ? project.accentColor
                        : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Main Hover-Scrubbable & Touch-Swipeable Cinema / Gallery Stage */}
        <div
          onMouseMove={handleStageScrub}
          onTouchMove={handleTouchScrub}
          onClick={() => onOpenAlbum(project, activeFrame)}
          className={`relative ${
            featured ? "aspect-[16/9]" : "aspect-[16/10]"
          } w-full bg-obsidian overflow-hidden cursor-pointer flex items-center justify-center`}
        >
          {/* Ambient Blurred Studio Backdrop (essential for vertical 2:3 DSLR shots) */}
          <img
            src={currentSrc}
            alt=""
            className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110"
          />

          <img
            src={currentSrc}
            alt={`${project.title} — Frame ${activeFrame + 1}`}
            onLoad={(e) => {
              const el = e.currentTarget;
              setIsPortraitFrame(el.naturalHeight > el.naturalWidth * 1.05);
            }}
            className={
              isPortraitFrame
                ? "relative z-10 h-full w-auto max-w-full object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.75)] transition-transform duration-500 group-hover:scale-[1.02]"
                : "relative z-10 w-full h-full object-cover object-[50%_20%] transition-transform duration-500 group-hover:scale-[1.03]"
            }
          />

          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-obsidian/90 via-transparent to-obsidian/25" />

          {/* Floating Action Badges */}
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
            {frames.length > 1 ? (
              <span className="px-2.5 py-1 rounded-md bg-obsidian/80 backdrop-blur-md border border-white/15 text-xs font-mono text-ivory/90">
                RÊ CHUỘT ĐỂ LƯỚT {frames.length} ẢNH
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md bg-obsidian/80 backdrop-blur-md border border-white/15 text-xs font-mono text-ivory/90 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rec" />
                <span>SINGLE PRINT</span>
              </span>
            )}

            <span className="px-2.5 py-1 rounded-md bg-obsidian/85 backdrop-blur-md border border-white/15 group-hover:border-rec group-hover:bg-rec group-hover:text-obsidian text-xs font-mono font-semibold text-ivory inline-flex items-center gap-1.5 transition-colors">
              <Maximize2 className="w-3 h-3" />
              <span>PHÓNG LỚN ALBUM</span>
            </span>
          </div>

          {/* Bottom Category Overlay */}
          <div className="pointer-events-none absolute bottom-3 left-4 right-4 z-30 flex items-end justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-rec font-semibold">
                {project.category}
              </div>
              <h3
                className={`font-display font-bold ${
                  featured ? "text-lg sm:text-2xl" : "text-base sm:text-lg"
                } text-ivory leading-snug`}
              >
                {project.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Contact Sheet Filmstrip Bar (Direct Visual Preview of Every Frame!) */}
        {frames.length > 1 && (
          <div className="px-3 py-2.5 bg-obsidian/85 border-t border-obsidian-border flex items-center gap-2 overflow-x-auto">
            {frames.map((frameSrc, idx) => {
              const isSelected = idx === activeFrame;
              return (
                <button
                  key={frameSrc + idx}
                  type="button"
                  onMouseEnter={() => {
                    if (idx !== activeFrame) {
                      soundEngine.playTick(0.45);
                      setActiveFrame(idx);
                    }
                  }}
                  onClick={() => onOpenAlbum(project, idx)}
                  className={`relative h-12 w-18 sm:w-20 aspect-[16/10] rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? "border-rec scale-[1.03] opacity-100 shadow-[0_0_12px_rgba(255,77,0,0.35)]"
                      : "border-obsidian-border opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={frameSrc}
                    alt=""
                    className="w-full h-full object-cover object-[50%_20%]"
                  />
                  <span className="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-ivory bg-obsidian/80 px-1 rounded">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Editorial Footer: Summary, Camera Spec, Ekip Co-Creators & Case-Study Link */}
      <div className="p-4 sm:p-5 border-t border-obsidian-border/80 space-y-3.5 bg-obsidian-surface">
        <p className="text-xs sm:text-sm text-ivory/80 line-clamp-2 leading-relaxed">
          {project.summary}
        </p>

        <div className="flex items-center gap-1.5 text-xs font-mono text-ivory-muted truncate">
          <Camera className="w-3.5 h-3.5 text-rec shrink-0" />
          {project.exifSpec && (
            <span className="px-1.5 py-0.5 rounded bg-rec/15 text-rec text-[10px] font-bold shrink-0">
              EXIF
            </span>
          )}
          <span className="truncate">
            {project.exifSpec ?? project.cameraSpec}
          </span>
        </div>

        <div className="pt-2.5 border-t border-obsidian-border/70 flex flex-wrap items-center justify-between gap-3">
          {/* Co-Creator Avatar Stack */}
          {project.coCreators.length > 0 ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex -space-x-2 shrink-0">
                {project.coCreators.slice(0, 4).map((mate) => {
                  const meta = getRoleMeta(mate.roleCategory);
                  return (
                    <Link
                      key={mate.slug}
                      href={`/crew/${mate.slug}`}
                      replace={isModal}
                      scroll={false}
                      onClick={() => soundEngine.playTick(0.75)}
                      title={`${mate.name} (${mate.roleTitle})`}
                      className="w-7 h-7 rounded-full overflow-hidden border-2 bg-obsidian hover:scale-110 hover:z-10 transition-transform"
                      style={{ borderColor: meta.color }}
                    >
                      <img
                        src={mate.avatar}
                        alt={mate.name}
                        className="w-full h-full object-cover object-[50%_18%]"
                      />
                    </Link>
                  );
                })}
              </div>
              <span className="text-xs font-mono text-ivory-muted truncate">
                <Users className="w-3 h-3 inline mr-1 text-ivory-subtle" />
                {project.totalCrewCount > 5
                  ? `Cùng ${project.totalCrewCount - 1} anh em TBG`
                  : `Cùng ${project.coCreators
                      .slice(0, 2)
                      .map((m) => m.name.split(" ").slice(-2).join(" "))
                      .join(", ")}`}
              </span>
            </div>
          ) : (
            <span className="text-xs font-mono text-ivory-subtle">
              ● BỘ ẢNH ĐỘC LẬP CÁ NHÂN
            </span>
          )}

          {/* Direct Link to Full BTS Case-Study Page */}
          <div className="flex items-center gap-2 ml-auto">
            {project.workSlug && (
              <Link
                href={`/works/${project.workSlug}`}
                scroll={false}
                onClick={() => soundEngine.playShutter()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rec/45 bg-rec/10 hover:bg-rec text-rec hover:text-obsidian text-xs font-mono font-bold transition-colors"
              >
                <Film className="w-3.5 h-3.5" />
                <span>CHI TIẾT &amp; BTS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
