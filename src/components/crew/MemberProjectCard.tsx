"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Camera,
  Film,
  Images,
  Maximize2,
  Users,
} from "lucide-react";
import { type UnifiedMemberProject } from "@/data/works";
import { getRoleMeta } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

export function MemberProjectCard({
  project,
  memberSlug,
  featured = false,
  isModal = false,
  onOpenAlbum,
}: {
  project: UnifiedMemberProject;
  memberSlug: string;
  featured?: boolean;
  isModal?: boolean;
  onOpenAlbum: (project: UnifiedMemberProject, frameIdx: number) => void;
}) {
  const [activeFrame, setActiveFrame] = useState(0);
  const [isPortraitFrame, setIsPortraitFrame] = useState(false);
  const [isCoverPortraitFrame, setIsCoverPortraitFrame] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [driveFrames, setDriveFrames] = useState<string[]>([]);
  const [driveHasMore, setDriveHasMore] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState("");

  const driveGalleryUrl = (() => {
    if (!project.galleryDriveFolderUrl) return "";
    const params = new URLSearchParams();
    if (project.scope === "personal" && project.showcaseItemId) {
      params.set("memberSlug", memberSlug);
      params.set("showcaseId", project.showcaseItemId);
    } else if (project.workSlug) {
      params.set("slug", project.workSlug);
    } else {
      return "";
    }
    params.set("limit", "11");
    return `/api/works/gallery?${params.toString()}`;
  })();

  useEffect(() => {
    if (!driveGalleryUrl) return;
    const controller = new AbortController();
    setDriveFrames([]);
    setDriveHasMore(false);
    setDriveLoading(true);
    setDriveError("");

    fetch(driveGalleryUrl, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as {
          ok: boolean;
          images?: { src: string }[];
          hasMore?: boolean;
          error?: string;
        };
        if (!response.ok || !result.ok) {
          throw new Error(result.error || "Không tải được album Drive.");
        }
        const images = result.images ?? [];
        setDriveFrames(images.slice(0, 10).map((image) => image.src));
        setDriveHasMore(Boolean(result.hasMore) || images.length > 10);
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setDriveError(cause instanceof Error ? cause.message : "Không tải được album Drive.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setDriveLoading(false);
      });

    return () => controller.abort();
  }, [driveGalleryUrl]);

  const legacyDriveFrames = project.frames.filter((src) => src !== project.coverImage);
  const drivePreviewFrames = driveFrames.length > 0
    ? driveFrames
    : driveError ? legacyDriveFrames : [];
  const frames = project.galleryDriveFolderUrl
    ? drivePreviewFrames.length > 0 ? drivePreviewFrames : [project.coverImage]
    : project.frames.length > 0 ? project.frames : [project.coverImage];
  const currentSrc = frames[activeFrame] ?? project.coverImage;
  const previewFrames = project.galleryDriveFolderUrl ? drivePreviewFrames : frames;
  const showFrameStrip = project.galleryDriveFolderUrl
    ? driveLoading || Boolean(driveError) || drivePreviewFrames.length > 0
    : frames.length > 1;
  const isWide = project.span ? project.span === "wide" : featured;
  const cardSpan = project.span === "tall"
    ? "col-span-12 xl:col-span-5"
    : isWide
    ? "col-span-12"
    : "col-span-12 xl:col-span-6";
  const stageAspect = project.span === "tall"
    ? "aspect-[4/5]"
    : isWide
    ? "aspect-[16/9]"
    : "aspect-[16/10]";
  const kindLabel = project.kind ? {
    reel: "VIDEO",
    photo: "ẢNH",
    poster: "POSTER",
    motion: "MOTION",
  }[project.kind] : null;

  const scopeBadge =
    project.scope === "lead"
      ? { label: "CHỦ ĐẠO", bg: project.accentColor, text: "#08090C" }
      : project.scope === "personal"
      ? { label: "CÁ NHÂN", bg: "#FF4D00", text: "#08090C" }
      : { label: "CÙNG EKIP", bg: "#1E2433", text: "#F4F1EA" };

  useEffect(() => {
    if (!isHovered || frames.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % frames.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [isHovered, frames.length]);

  const toAlbumFrameIndex = (frameIndex: number) =>
    project.galleryDriveFolderUrl && drivePreviewFrames.length > 0
      ? frameIndex + 1
      : frameIndex;

  return (
    <article
      className={`${
        cardSpan
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
              {kindLabel && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold">{kindLabel}</span>}
              <span className="inline-flex items-center gap-1">
                <Images className="w-3.5 h-3.5 text-rec" />
                <span>
                  {project.galleryDriveFolderUrl
                    ? drivePreviewFrames.length > 0
                      ? isHovered
                        ? `${String(activeFrame + 1).padStart(2, "0")}/${String(drivePreviewFrames.length).padStart(2, "0")}${driveHasMore ? "+" : ""}`
                        : "BÌA"
                      : "DRIVE"
                    : `${String(activeFrame + 1).padStart(2, "0")}/${String(frames.length).padStart(2, "0")}`}
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
                      idx === activeFrame && (!project.galleryDriveFolderUrl || isHovered)
                        ? project.accentColor
                        : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Main Cinema / Gallery Stage */}
        <div
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => {
            setIsHovered(false);
            if (project.galleryDriveFolderUrl) setActiveFrame(0);
          }}
          onClick={() => onOpenAlbum(project, toAlbumFrameIndex(activeFrame))}
          className={`relative ${
            stageAspect
          } group/stage w-full bg-obsidian overflow-hidden cursor-pointer flex items-center justify-center`}
        >
          {project.galleryDriveFolderUrl ? (
            <>
              {/* Keep the project cover as the non-hover image, independent of React state. */}
              <img
                src={project.coverImage}
                alt=""
                className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-110 object-cover blur-2xl opacity-35 transition-opacity duration-300 group-hover/stage:opacity-0"
              />
              <img
                src={currentSrc}
                alt=""
                className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-110 object-cover blur-2xl opacity-0 transition-opacity duration-300 group-hover/stage:opacity-35"
              />
              <img
                src={project.coverImage}
                alt={`${project.title} — Ảnh bìa`}
                onLoad={(e) => {
                  const el = e.currentTarget;
                  setIsCoverPortraitFrame(el.naturalHeight > el.naturalWidth * 1.05);
                }}
                className={`z-10 rounded-lg shadow-2xl transition-opacity duration-300 group-hover/stage:opacity-0 ${
                  isCoverPortraitFrame
                    ? "relative h-full w-auto max-w-full object-contain"
                    : "relative h-full w-full object-cover object-[50%_20%]"
                }`}
              />
              <img
                src={currentSrc}
                alt={`${project.title} — Frame ${activeFrame + 1}`}
                onLoad={(e) => {
                  const el = e.currentTarget;
                  setIsPortraitFrame(el.naturalHeight > el.naturalWidth * 1.05);
                }}
                className={`z-10 rounded-lg opacity-0 shadow-2xl transition-opacity duration-300 group-hover/stage:opacity-100 ${
                  isPortraitFrame
                    ? "absolute inset-y-0 left-1/2 h-full w-auto max-w-full -translate-x-1/2 object-contain"
                    : "absolute inset-0 h-full w-full object-cover object-[50%_20%]"
                }`}
              />
            </>
          ) : (
            <>
              {/* Ambient Blurred Studio Backdrop (essential for vertical 2:3 DSLR shots) */}
              <img
                src={currentSrc}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-35"
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
                    : "relative z-10 h-full w-full object-cover object-[50%_20%] transition-transform duration-500 group-hover:scale-[1.03]"
                }
              />
            </>
          )}

          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-obsidian/90 via-transparent to-obsidian/25" />

          {/* Floating Action Badges */}
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-end gap-2 pointer-events-none">
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
        {showFrameStrip && (
          <div className="px-3 py-2.5 bg-obsidian/85 border-t border-obsidian-border flex items-center gap-2 overflow-x-auto">
            {driveLoading && (
              <span className="shrink-0 px-2 py-1 text-xs font-mono text-ivory-muted">
                ĐANG TẢI ẢNH DRIVE…
              </span>
            )}
            {driveError && (
              <span className="shrink-0 px-2 py-1 text-xs font-mono text-amber-200">
                KHÔNG TẢI ĐƯỢC ALBUM DRIVE
              </span>
            )}
            {previewFrames.map((frameSrc, idx) => {
              const isSelected = idx === activeFrame && (!project.galleryDriveFolderUrl || isHovered);
              return (
                <button
                  key={frameSrc + idx}
                  type="button"
                  onClick={() => onOpenAlbum(project, toAlbumFrameIndex(idx))}
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
            {project.galleryDriveFolderUrl && driveHasMore && (
              <button
                type="button"
                onClick={() => onOpenAlbum(project, 11)}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-rec/60 bg-rec/10 px-3 text-xs font-mono font-bold text-rec transition-colors hover:bg-rec hover:text-obsidian"
                aria-label="Xem thêm ảnh trong album Google Drive"
              >
                <Images className="h-3.5 w-3.5" />
                + XEM THÊM
              </button>
            )}
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
            {project.videoUrl && /^https?:\/\//i.test(project.videoUrl) && (
              <a href={project.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-mono text-ivory-muted transition-colors hover:border-rec/60 hover:text-rec">
                <Film className="h-3.5 w-3.5" /> VIDEO <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
            {project.externalUrl && /^https?:\/\//i.test(project.externalUrl) && (
              <a href={project.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-mono text-ivory-muted transition-colors hover:border-rec/60 hover:text-rec">
                LINK <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
