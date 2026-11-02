"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import {
  ArrowDownUp,
  ArrowUpRight,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Film,
  IdCard,
  Images,
  Maximize2,
  Search,
  Sparkles,
  UserRound,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { CrewMember, PartnerOrganization } from "@/data/schema";
import {
  getCuratedPersonalArchiveProjects,
  getTotalArchiveProjectCount,
  getUnifiedProjectsForMember,
  type UnifiedMemberProject,
  type WorkProject,
} from "@/data/works";
import { getRoleMeta } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import { useSiteContent } from "@/lib/store";
import { shouldUseYoutubeCoverPreview, toYoutubeEmbedUrl } from "@/lib/youtube";
import { YouTubePreview } from "./YouTubePreview";

gsap.registerPlugin(Flip);

type WorkSortOrder = "default" | "newest" | "oldest" | "title-asc" | "title-desc";
type ArchiveScopeFilter = "all" | "collective" | "personal";

type ArchiveGridEntry =
  | {
      kind: "collective";
      flipId: string;
      title: string;
      year: string;
      searchBlob: string;
      work: WorkProject;
    }
  | {
      kind: "personal";
      flipId: string;
      title: string;
      year: string;
      searchBlob: string;
      owner: CrewMember;
      project: UnifiedMemberProject;
    };

interface LightboxTarget {
  owner: CrewMember;
  project: UnifiedMemberProject;
}

function normalizeVi(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

function WorkArchiveCard({
  work,
  crewMembers,
  partnerOrganizations,
  selectedMemberSlug,
  onSelectMember,
}: {
  work: WorkProject;
  crewMembers: CrewMember[];
  partnerOrganizations: PartnerOrganization[];
  selectedMemberSlug: string;
  onSelectMember: (slug: string) => void;
}) {
  const [isPortraitFrame, setIsPortraitFrame] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [showAllCredits, setShowAllCredits] = useState(false);
  const [showAllPartners, setShowAllPartners] = useState(false);
  const coverSrc = work.coverImage?.trim() ?? "";
  const videoUrl = work.videoEmbedUrl || work.videoUrl || "";
  const shouldPlayVideoCover = shouldUseYoutubeCoverPreview(videoUrl, coverSrc);
  const fallbackCoverSrc = coverSrc || "/media/works/work-01.jpg";

  const syncAspectFromImg = useCallback((image: HTMLImageElement | null) => {
    if (image && image.complete && image.naturalWidth > 0) {
      setIsPortraitFrame(image.naturalHeight > image.naturalWidth * 1.05);
    }
  }, []);

  const selectedCredit =
    selectedMemberSlug !== "ALL"
      ? work.credits.find((c) => c.memberSlug === selectedMemberSlug)
      : undefined;
  const linkedPartners = (work.partnerIds ?? [])
    .map((id) => partnerOrganizations.find((organization) => organization.id === id))
    .filter((organization): organization is PartnerOrganization => Boolean(organization));

  return (
    <article className="rounded-2xl border border-obsidian-border hover:border-rec/70 bg-obsidian-surface overflow-hidden flex flex-col justify-between transition-colors shadow-[0_12px_36px_rgba(0,0,0,0.35)] group h-full">
      <div>
        {/* Top Metadata */}
        <div className="px-4 pt-3 pb-2.5 bg-obsidian/90 border-b border-obsidian-border space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="px-2 py-0.5 rounded font-bold text-obsidian shrink-0"
                style={{ backgroundColor: work.accentColor }}
              >
                SCENE {work.indexLabel}
              </span>
              {selectedCredit ? (
                <span className="text-rec font-bold truncate">
                  {work.credits[0]?.memberSlug === selectedMemberSlug
                    ? `★ CHỦ ĐẠO: ${selectedCredit.roleOnProject.toUpperCase()}`
                    : `VAI TRÒ: ${selectedCredit.roleOnProject.toUpperCase()}`}
                </span>
              ) : (
                <span className="text-ivory-muted truncate">
                  {work.clientOrSeries}
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-1 text-ivory-muted shrink-0">
              <Images className="w-3.5 h-3.5 text-rec" />
              <span>
                {work.galleryDriveFolderUrl
                  ? "DRIVE ALBUM"
                  : shouldPlayVideoCover
                    ? "VIDEO YOUTUBE"
                    : work.galleryImages.length
                      ? `${work.galleryImages.length} ẢNH`
                      : "ẢNH BÌA"}
              </span>
              <span className="text-ivory-subtle">• {work.year}</span>
            </span>
          </div>
        </div>

        {/* Cover Stage */}
        <Link
          href={`/works/${work.slug}`}
          scroll={false}
          onClick={() => soundEngine.playShutter()}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setIsVideoHovered(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setIsVideoHovered(false);
          }}
          className="relative aspect-[16/10] w-full bg-obsidian overflow-hidden flex items-center justify-center block"
        >
          {shouldPlayVideoCover ? (
            <YouTubePreview
              videoUrl={videoUrl}
              title={work.title}
              isHovered={isVideoHovered}
            />
          ) : (
            <>
              <img
                src={fallbackCoverSrc}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
              />
              <img
                ref={syncAspectFromImg}
                src={fallbackCoverSrc}
                alt={work.title}
                onLoad={(event) => {
                  const image = event.currentTarget;
                  setIsPortraitFrame(image.naturalHeight > image.naturalWidth * 1.05);
                }}
                className={
                  isPortraitFrame
                    ? "relative z-10 h-full w-auto max-w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                    : "relative z-10 h-full w-full object-cover object-[50%_20%] transition-transform duration-500 group-hover:scale-[1.03]"
                }
              />
            </>
          )}
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-obsidian/92 via-transparent to-obsidian/25" />

          <div className="pointer-events-none absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-md bg-obsidian/80 backdrop-blur-md border border-white/15 text-xs font-mono text-ivory/90 truncate max-w-[65%]">
              {work.galleryDriveFolderUrl ? "ALBUM DRIVE BÊN DƯỚI" : work.durationTimecode}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-obsidian/85 backdrop-blur-md border border-white/15 group-hover:bg-rec group-hover:border-rec group-hover:text-obsidian text-xs font-mono font-bold text-ivory inline-flex items-center gap-1 transition-colors shrink-0">
              <span>{shouldPlayVideoCover ? "XEM VIDEO" : "MỞ DỰ ÁN"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-3 left-4 right-4 z-30">
            <div className="text-xs font-mono text-rec font-semibold">
              {work.category}
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-ivory leading-snug group-hover:text-rec transition-colors">
              {work.title}
            </h2>
          </div>
        </Link>
      </div>

      {/* Footer: Summary, Camera Spec & Clickable Ekip Member Filter Chips */}
      <div className="p-4 sm:p-5 border-t border-obsidian-border/80 space-y-3.5">
        <p className="text-xs sm:text-sm text-ivory/80 line-clamp-2 leading-relaxed">
          {work.summary}
        </p>

        <div className="flex items-center gap-1.5 text-xs font-mono text-ivory-muted truncate">
          <Camera className="w-3.5 h-3.5 text-rec shrink-0" />
          <span className="truncate">{work.cameraSpec}</span>
        </div>

        {/* Interactive Ekip Credits */}
        <div className="pt-2.5 border-t border-obsidian-border/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-ivory-subtle">
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-rec" />
              <span>EKIP THỰC HIỆN ({work.credits.length}) — BẤM TÊN ĐỂ LỌC:</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(showAllCredits ? work.credits : work.credits.slice(0, 3)).map((credit) => {
              const m = crewMembers.find((member) => member.slug === credit.memberSlug);
              if (!m) return null;
              const isSelected = selectedMemberSlug === m.slug;
              const shortName =
                m.nickname ?? m.name.split(" ").slice(-2).join(" ");
              return (
                <button
                  key={m.slug}
                  type="button"
                  onClick={() => onSelectMember(isSelected ? "ALL" : m.slug)}
                  title={`Lọc các dự án của ${m.name} (${credit.roleOnProject})`}
                  className={`inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rec text-obsidian border-rec font-bold"
                      : "bg-obsidian border-obsidian-border text-ivory-muted hover:text-ivory hover:border-rec/50"
                  }`}
                >
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-5 h-5 rounded-full object-cover object-[50%_18%]"
                  />
                  <span>{shortName}</span>
                </button>
              );
            })}
            {work.credits.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllCredits((current) => !current)}
                aria-expanded={showAllCredits}
                className="px-2.5 py-1 rounded-full text-xs font-mono border border-obsidian-border bg-obsidian text-rec hover:border-rec transition-colors cursor-pointer"
              >
                {showAllCredits ? "Thu gọn" : `+${work.credits.length - 3} anh em`}
              </button>
            )}
          </div>
        </div>

        {linkedPartners.length ? (
          <div className="space-y-2 border-t border-obsidian-border/70 pt-2.5">
            <p className="text-[10px] font-mono text-ivory-subtle">ĐƠN VỊ ĐỒNG HÀNH</p>
            <div className="flex flex-wrap gap-1.5">
              {(showAllPartners ? linkedPartners : linkedPartners.slice(0, 3)).map((organization) => (
                <span
                  key={organization.id}
                  title={organization.description || organization.name}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-obsidian px-2.5 py-1 text-[11px] text-ivory-muted"
                >
                  {organization.logo ? (
                    <img
                      src={organization.logo}
                      alt=""
                      className="h-5 w-5 rounded-full bg-white object-contain p-0.5"
                    />
                  ) : null}
                  <span className="max-w-[180px] truncate">{organization.name}</span>
                </span>
              ))}
              {linkedPartners.length > 3 ? (
                <button
                  type="button"
                  onClick={() => setShowAllPartners((current) => !current)}
                  aria-expanded={showAllPartners}
                  className="inline-flex items-center rounded-full border border-obsidian-border bg-obsidian px-2.5 py-1 text-[11px] text-rec transition-colors hover:border-rec cursor-pointer"
                >
                  {showAllPartners ? "Thu gọn" : `+${linkedPartners.length - 3} đơn vị`}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function PersonalArchiveCard({
  owner,
  project,
  globalPartners,
  selectedMemberSlug,
  onSelectMember,
  onOpenAlbum,
}: {
  owner: CrewMember;
  project: UnifiedMemberProject;
  globalPartners: PartnerOrganization[];
  selectedMemberSlug: string;
  onSelectMember: (slug: string) => void;
  onOpenAlbum: (owner: CrewMember, project: UnifiedMemberProject, startIdx: number) => void;
}) {
  const [activeFrame, setActiveFrame] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [isPortraitFrame, setIsPortraitFrame] = useState(false);

  const frames = project.frames.length > 0 ? project.frames : [project.coverImage];
  const safeFrameIndex = activeFrame < frames.length ? activeFrame : 0;
  const currentSrc = (frames[safeFrameIndex] || project.coverImage || "/media/works/work-01.jpg").trim();
  const shouldPlayVideoCover = shouldUseYoutubeCoverPreview(project.videoUrl, project.coverImage);

  useEffect(() => {
    if (!isHovered || frames.length <= 1 || shouldPlayVideoCover) return;
    const timer = window.setInterval(() => {
      setActiveFrame((prev) => (prev + 1) % frames.length);
    }, 1700);
    return () => window.clearInterval(timer);
  }, [isHovered, frames.length, shouldPlayVideoCover]);

  const syncAspectFromImg = useCallback((image: HTMLImageElement | null) => {
    if (image && image.complete && image.naturalWidth > 0) {
      setIsPortraitFrame(image.naturalHeight > image.naturalWidth * 1.05);
    }
  }, []);

  const partnerCatalog = useMemo(() => {
    const map = new Map<string, PartnerOrganization>();
    for (const org of globalPartners) map.set(org.id, org);
    for (const org of owner.partnerOrganizations ?? []) map.set(org.id, org);
    return map;
  }, [globalPartners, owner.partnerOrganizations]);

  const linkedPartners = (project.partnerIds ?? [])
    .map((id) => partnerCatalog.get(id))
    .filter((organization): organization is PartnerOrganization => Boolean(organization));

  const isOwnerSelected = selectedMemberSlug === owner.slug;
  const ownerShortName = owner.nickname
    ? `${owner.name.split(" ").slice(-1)[0]} (${owner.nickname})`
    : owner.name;

  return (
    <article className="rounded-2xl border border-obsidian-border hover:border-rec/70 bg-obsidian-surface overflow-hidden flex flex-col justify-between transition-colors shadow-[0_12px_36px_rgba(0,0,0,0.35)] group h-full">
      <div>
        {/* Top Metadata & Segmented Multi-Frame Progress */}
        <div className="px-4 pt-3 pb-2.5 bg-obsidian/90 border-b border-obsidian-border space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded font-bold bg-rec text-obsidian shrink-0">
                CÁ NHÂN
              </span>
              <span className="text-rec font-semibold truncate">
                {project.roleBadge}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-ivory-muted shrink-0">
              <Images className="w-3.5 h-3.5 text-rec" />
              <span>
                {project.galleryDriveFolderUrl
                  ? "DRIVE ALBUM"
                  : shouldPlayVideoCover
                    ? "VIDEO YOUTUBE"
                    : frames.length > 1
                      ? isHovered
                        ? `${String(safeFrameIndex + 1).padStart(2, "0")}/${String(frames.length).padStart(2, "0")}`
                        : `${frames.length} ẢNH`
                      : "1 ẢNH"}
              </span>
              <span className="text-ivory-subtle">• {project.year}</span>
            </span>
          </div>

          {frames.length > 1 && !shouldPlayVideoCover && (
            <div className="flex items-center gap-1">
              {frames.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor:
                      idx === safeFrameIndex
                        ? project.accentColor
                        : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Interactive Gallery / Video Stage */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenAlbum(owner, project, safeFrameIndex)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenAlbum(owner, project, safeFrameIndex);
            }
          }}
          onPointerEnter={(event) => {
            setIsHovered(true);
            if (event.pointerType === "mouse") setIsVideoHovered(true);
          }}
          onPointerLeave={() => {
            setIsHovered(false);
            setIsVideoHovered(false);
            setActiveFrame(0);
          }}
          className="relative aspect-[16/10] w-full bg-obsidian overflow-hidden flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rec"
        >
          {shouldPlayVideoCover && project.videoUrl ? (
            <YouTubePreview
              videoUrl={project.videoUrl}
              title={project.title}
              isHovered={isVideoHovered}
            />
          ) : (
            <>
              <img
                src={currentSrc}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
              />
              <img
                ref={syncAspectFromImg}
                src={currentSrc}
                alt={project.title}
                onLoad={(event) => {
                  const image = event.currentTarget;
                  setIsPortraitFrame(image.naturalHeight > image.naturalWidth * 1.05);
                }}
                className={
                  isPortraitFrame
                    ? "relative z-10 h-full w-auto max-w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                    : "relative z-10 h-full w-full object-cover object-[50%_20%] transition-transform duration-500 group-hover:scale-[1.03]"
                }
              />
            </>
          )}

          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-obsidian/92 via-transparent to-obsidian/25" />

          <div className="pointer-events-none absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-md bg-obsidian/80 backdrop-blur-md border border-white/15 text-xs font-mono text-ivory/90 truncate max-w-[62%]">
              {project.subtitle}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-obsidian/85 backdrop-blur-md border border-white/15 group-hover:bg-rec group-hover:border-rec group-hover:text-obsidian text-xs font-mono font-bold text-ivory inline-flex items-center gap-1 transition-colors shrink-0">
              <span>{shouldPlayVideoCover ? "XEM VIDEO" : "MỞ BỘ ẢNH"}</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-3 left-4 right-4 z-30">
            <div className="text-xs font-mono text-rec font-semibold">
              {project.category}
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-ivory leading-snug group-hover:text-rec transition-colors">
              {project.title}
            </h2>
          </div>
        </div>
      </div>

      {/* Footer: Summary, EXIF/Gear & Author Chip */}
      <div className="p-4 sm:p-5 border-t border-obsidian-border/80 space-y-3.5">
        <p className="text-xs sm:text-sm text-ivory/80 line-clamp-2 leading-relaxed">
          {project.summary}
        </p>

        <div className="flex items-center gap-1.5 text-xs font-mono text-ivory-muted truncate">
          <Camera className="w-3.5 h-3.5 text-rec shrink-0" />
          <span className="truncate">{project.exifSpec || project.cameraSpec}</span>
        </div>

        <div className="pt-2.5 border-t border-obsidian-border/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-ivory-subtle">
            <span className="inline-flex items-center gap-1">
              <UserRound className="w-3.5 h-3.5 text-rec" />
              <span>TÁC GIẢ THỰC HIỆN:</span>
            </span>
            <Link
              href={`/crew/${owner.slug}`}
              onClick={() => soundEngine.playShutter()}
              className="text-rec hover:underline font-semibold inline-flex items-center gap-0.5"
            >
              <span>HỒ SƠ 3D</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onSelectMember(isOwnerSelected ? "ALL" : owner.slug)}
              title={`Lọc toàn bộ dự án của ${owner.name}`}
              className={`inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                isOwnerSelected
                  ? "bg-rec text-obsidian border-rec font-bold"
                  : "bg-obsidian border-obsidian-border text-ivory-muted hover:text-ivory hover:border-rec/50"
              }`}
            >
              <img
                src={owner.avatar}
                alt={owner.name}
                className="w-5 h-5 rounded-full object-cover object-[50%_18%]"
              />
              <span>{ownerShortName}</span>
            </button>

            {project.workSlug ? (
              <Link
                href={`/works/${project.workSlug}`}
                scroll={false}
                onClick={() => soundEngine.playShutter()}
                className="px-2.5 py-1 rounded-full text-xs font-mono border border-obsidian-border bg-obsidian text-ivory-muted hover:border-rec hover:text-rec transition-colors inline-flex items-center gap-1"
              >
                <span>CHI TIẾT &amp; BTS</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            ) : null}
          </div>
        </div>

        {linkedPartners.length ? (
          <div className="space-y-2 border-t border-obsidian-border/70 pt-2.5">
            <p className="text-[10px] font-mono text-ivory-subtle">ĐƠN VỊ ĐỒNG HÀNH</p>
            <div className="flex flex-wrap gap-1.5">
              {linkedPartners.map((organization) => (
                <span
                  key={organization.id}
                  title={organization.description || organization.name}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-obsidian px-2.5 py-1 text-[11px] text-ivory-muted"
                >
                  {organization.logo ? (
                    <img
                      src={organization.logo}
                      alt=""
                      className="h-5 w-5 rounded-full bg-white object-contain p-0.5"
                    />
                  ) : null}
                  <span className="max-w-[180px] truncate">{organization.name}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function WorksArchiveGrid() {
  const siteContent = useSiteContent();
  const crewMembers = siteContent.crew;
  const partnerOrganizations = siteContent.partnerOrganizations;
  const workProjects = siteContent.works;

  const [mounted, setMounted] = useState(false);
  const [selectedMemberSlug, setSelectedMemberSlug] = useState<string>("ALL");
  const [scopeFilter, setScopeFilter] = useState<ArchiveScopeFilter>("all");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<WorkSortOrder>("default");

  const [lightboxEntry, setLightboxEntry] = useState<LightboxTarget | null>(null);
  const [lightboxPhotoIdx, setLightboxPhotoIdx] = useState(0);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [driveAlbumImages, setDriveAlbumImages] = useState<string[] | null>(null);
  const [driveAlbumLoading, setDriveAlbumLoading] = useState(false);
  const [driveAlbumError, setDriveAlbumError] = useState("");

  const gridRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Support deep-link ?member=tran-kim-thang(&showcase=tkt-nini) from Timeline, Crew Cards, Spotlight, or Ctrl+K
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const mSlug = params.get("member");
      const showcaseId = params.get("showcase");
      if (mSlug && crewMembers.some((m) => m.slug === mSlug)) {
        setSelectedMemberSlug(mSlug);
        if (showcaseId) {
          const owner = crewMembers.find((m) => m.slug === mSlug);
          if (owner) {
            const unified = getUnifiedProjectsForMember(owner, workProjects, crewMembers);
            const matched = unified.find((p) => p.showcaseItemId === showcaseId);
            if (matched) {
              setDriveAlbumImages(null);
              setDriveAlbumError("");
              setLightboxEntry({ owner, project: matched });
              setLightboxPhotoIdx(0);
              setLightboxZoomed(false);
            }
          }
        }
      } else if (!mSlug) {
        setSelectedMemberSlug("ALL");
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [crewMembers, workProjects]);

  const curatedPersonalProjects = useMemo(
    () => getCuratedPersonalArchiveProjects(crewMembers, workProjects),
    [crewMembers, workProjects]
  );

  const totalArchiveCount = useMemo(
    () => getTotalArchiveProjectCount(workProjects, crewMembers),
    [workProjects, crewMembers]
  );

  const memberProjectCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const member of crewMembers) {
      map.set(
        member.slug,
        getUnifiedProjectsForMember(member, workProjects, crewMembers).length
      );
    }
    return map;
  }, [crewMembers, workProjects]);

  const captureFlip = () => {
    if (!gridRef.current) return;
    const targets = gridRef.current.querySelectorAll(".work-flip-card");
    if (targets.length > 0) {
      flipStateRef.current = Flip.getState(targets);
    } else {
      flipStateRef.current = null;
    }
  };

  const selectedMember =
    selectedMemberSlug !== "ALL"
      ? crewMembers.find((member) => member.slug === selectedMemberSlug)
      : undefined;

  // Base entries for the active member (or ALL archive) before scope/search/sort
  const baseEntries = useMemo<ArchiveGridEntry[]>(() => {
    const toCollectiveEntry = (work: WorkProject): ArchiveGridEntry => {
      const creditNames = work.credits
        .map((c) => {
          const found = crewMembers.find((m) => m.slug === c.memberSlug);
          return found ? `${found.name} ${found.nickname ?? ""} ${c.roleOnProject}` : c.roleOnProject;
        })
        .join(" ");
      return {
        kind: "collective",
        flipId: `work-${work.id}`,
        title: work.title,
        year: work.year,
        searchBlob: normalizeVi(
          [
            work.title,
            work.category,
            work.clientOrSeries,
            work.summary,
            work.cameraSpec,
            work.exifSpec ?? "",
            creditNames,
          ].join(" ")
        ),
        work,
      };
    };

    const toPersonalEntry = (
      owner: CrewMember,
      project: UnifiedMemberProject
    ): ArchiveGridEntry => ({
      kind: "personal",
      flipId: `personal-${owner.slug}-${project.id}`,
      title: project.title,
      year: project.year,
      searchBlob: normalizeVi(
        [
          project.title,
          project.subtitle,
          project.category,
          project.summary,
          project.cameraSpec,
          project.exifSpec ?? "",
          project.roleBadge,
          owner.name,
          owner.nickname ?? "",
        ].join(" ")
      ),
      owner,
      project,
    });

    if (!selectedMember) {
      return [
        ...workProjects.map(toCollectiveEntry),
        ...curatedPersonalProjects.map(({ owner, project }) =>
          toPersonalEntry(owner, project)
        ),
      ];
    }

    const unified = getUnifiedProjectsForMember(
      selectedMember,
      workProjects,
      crewMembers
    );
    const entries: ArchiveGridEntry[] = [];
    for (const proj of unified) {
      if (proj.scope !== "personal") {
        const matchedWork = workProjects.find(
          (w) => `work-${w.id}` === proj.id || w.slug === proj.workSlug
        );
        if (matchedWork) {
          entries.push(toCollectiveEntry(matchedWork));
          continue;
        }
      }
      entries.push(toPersonalEntry(selectedMember, proj));
    }
    return entries;
  }, [selectedMember, workProjects, crewMembers, curatedPersonalProjects]);

  const collectiveCount = useMemo(
    () => baseEntries.filter((e) => e.kind === "collective").length,
    [baseEntries]
  );
  const personalCount = useMemo(
    () => baseEntries.filter((e) => e.kind === "personal").length,
    [baseEntries]
  );

  // Never strand the user on an empty scope tab when switching members
  useEffect(() => {
    if (scopeFilter === "collective" && collectiveCount === 0 && personalCount > 0) {
      setScopeFilter("all");
    } else if (scopeFilter === "personal" && personalCount === 0 && collectiveCount > 0) {
      setScopeFilter("all");
    }
  }, [selectedMemberSlug, scopeFilter, collectiveCount, personalCount]);

  const normalizedQuery = normalizeVi(query.trim());
  const queryTokens = useMemo(
    () => normalizedQuery.split(/\s+/).filter(Boolean),
    [normalizedQuery]
  );

  const visibleEntries = useMemo(() => {
    const filtered = baseEntries.filter((entry) => {
      if (scopeFilter === "collective" && entry.kind !== "collective") return false;
      if (scopeFilter === "personal" && entry.kind !== "personal") return false;
      if (queryTokens.length > 0) {
        return queryTokens.every((tok) => entry.searchBlob.includes(tok));
      }
      return true;
    });

    if (sortOrder === "default") return filtered;

    const collator = new Intl.Collator("vi", { sensitivity: "base", numeric: true });
    return filtered
      .map((entry, originalIndex) => ({ entry, originalIndex }))
      .sort((a, b) => {
        let comparison = 0;
        if (sortOrder === "newest" || sortOrder === "oldest") {
          const yearDiff = (Number(a.entry.year) || 0) - (Number(b.entry.year) || 0);
          comparison = sortOrder === "newest" ? -yearDiff : yearDiff;
        } else {
          comparison = collator.compare(a.entry.title, b.entry.title);
          if (sortOrder === "title-desc") comparison *= -1;
        }
        return comparison || a.originalIndex - b.originalIndex;
      })
      .map(({ entry }) => entry);
  }, [baseEntries, scopeFilter, queryTokens, sortOrder]);

  useLayoutEffect(() => {
    if (!flipStateRef.current || !gridRef.current) return;
    const targets = gridRef.current.querySelectorAll(".work-flip-card");
    if (targets.length > 0) {
      Flip.from(flipStateRef.current, {
        targets,
        duration: 0.42,
        ease: "power3.out",
        scale: true,
        stagger: 0.02,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 0.92 },
            { opacity: 1, scale: 1, duration: 0.34, ease: "power2.out" }
          ),
      });
    }
    flipStateRef.current = null;
  }, [selectedMemberSlug, scopeFilter, query, sortOrder]);

  const handleMemberSelect = (slug: string) => {
    if (slug === selectedMemberSlug) return;
    soundEngine.playTick(0.85);
    captureFlip();
    setSelectedMemberSlug(slug);
    setScopeFilter("all");
    if (typeof window !== "undefined") {
      const nextUrl =
        slug === "ALL" ? "/works" : `/works?member=${encodeURIComponent(slug)}`;
      window.history.replaceState(null, "", nextUrl);
    }
  };

  const handleScopeSelect = (nextScope: ArchiveScopeFilter) => {
    if (nextScope === scopeFilter) return;
    soundEngine.playTick(0.8);
    captureFlip();
    setScopeFilter(nextScope);
  };

  const openPersonalLightbox = (
    owner: CrewMember,
    project: UnifiedMemberProject,
    startIdx = 0
  ) => {
    soundEngine.playShutter();
    setDriveAlbumImages(null);
    setDriveAlbumError("");
    setLightboxEntry({ owner, project });
    setLightboxPhotoIdx(startIdx);
    setLightboxZoomed(false);
  };

  const closePersonalLightbox = useCallback(() => {
    setLightboxEntry(null);
    setLightboxZoomed(false);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("showcase")) {
        params.delete("showcase");
        const qs = params.toString();
        window.history.replaceState(null, "", qs ? `/works?${qs}` : "/works");
      }
    }
  }, []);

  // Load Google Drive gallery when opening a personal project backed by Drive
  useEffect(() => {
    const project = lightboxEntry?.project;
    const owner = lightboxEntry?.owner;
    if (!project?.galleryDriveFolderUrl || !owner) {
      setDriveAlbumImages(null);
      setDriveAlbumLoading(false);
      setDriveAlbumError("");
      return;
    }

    const params = new URLSearchParams();
    if (project.showcaseItemId) {
      params.set("memberSlug", owner.slug);
      params.set("showcaseId", project.showcaseItemId);
    } else if (project.workSlug) {
      params.set("slug", project.workSlug);
    } else {
      setDriveAlbumError("Không xác định được dự án Drive này.");
      return;
    }

    const controller = new AbortController();
    setDriveAlbumImages(null);
    setDriveAlbumLoading(true);
    setDriveAlbumError("");
    fetch(`/api/works/gallery?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          ok: boolean;
          images?: { src: string }[];
          error?: string;
        };
        if (!response.ok || !result.ok) {
          throw new Error(result.error || "Không tải được album Drive.");
        }
        const images = result.images ?? [];
        setDriveAlbumImages(images.map((image) => image.src));
        setLightboxPhotoIdx((current) => Math.min(current, images.length));
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setDriveAlbumError(
          cause instanceof Error ? cause.message : "Không tải được album Drive."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setDriveAlbumLoading(false);
      });

    return () => controller.abort();
  }, [lightboxEntry]);

  const legacyDriveFallback = lightboxEntry?.project
    ? lightboxEntry.project.frames.filter(
        (src) => src !== lightboxEntry.project.coverImage
      )
    : [];

  const lightboxGallery = lightboxEntry?.project.galleryDriveFolderUrl
    ? [
        lightboxEntry.project.coverImage,
        ...((driveAlbumImages && driveAlbumImages.length > 0
          ? driveAlbumImages
          : driveAlbumError
            ? legacyDriveFallback
            : []
        ).filter((src) => src !== lightboxEntry.project.coverImage)),
      ]
    : lightboxEntry?.project.frames ?? [];

  const activeLightboxPhotoIdx = Math.min(
    lightboxPhotoIdx,
    Math.max(0, lightboxGallery.length - 1)
  );

  const lightboxYoutubeEmbed = lightboxEntry?.project.videoUrl
    ? toYoutubeEmbedUrl(lightboxEntry.project.videoUrl)
    : null;
  const showLightboxVideo = Boolean(
    lightboxEntry?.project &&
      lightboxYoutubeEmbed &&
      shouldUseYoutubeCoverPreview(
        lightboxEntry.project.videoUrl,
        lightboxEntry.project.coverImage
      )
  );

  useEffect(() => {
    if (!lightboxEntry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePersonalLightbox();
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
  }, [lightboxEntry, lightboxGallery.length, closePersonalLightbox]);

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-8 pt-28 pb-24 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-obsidian-border pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-rec uppercase tracking-widest">
            <Film className="w-3.5 h-3.5" />
            <span>THIẾT BỊ GIA // COLLECTIVE &amp; MEMBER PROJECT ARCHIVE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ivory tracking-tight">
            KHO PROJECT &amp; BỘ SƯU TẬP [{totalArchiveCount}]
          </h1>
          <p className="text-sm sm:text-base text-ivory-muted max-w-2xl">
            Dùng bộ lọc thành viên bên dưới để xem đầy đủ dự án ekip lẫn bộ sưu tập cá nhân của từng anh em trong Thiết Bị Gia, hoặc rê chuột lên từng thẻ để lướt nhanh bộ ảnh.
          </p>
        </div>

        {/* Project search and sort tools */}
        <div className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:w-auto lg:min-w-[34rem]">
          <div className="relative min-w-0">
            <Search className="w-4 h-4 text-ivory-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                captureFlip();
                setQuery(e.target.value);
              }}
              placeholder="Tìm tên project, Nini, DANAFF, MV, Áo dài..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-obsidian-border bg-obsidian-surface text-sm text-ivory placeholder:text-ivory-subtle focus:outline-none focus:border-rec transition-colors"
            />
          </div>
          <label className="relative block min-w-0 sm:w-52">
            <ArrowDownUp className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rec" />
            <span className="sr-only">Sắp xếp dự án</span>
            <select
              value={sortOrder}
              onChange={(event) => {
                captureFlip();
                setSortOrder(event.target.value as WorkSortOrder);
              }}
              className="w-full appearance-none rounded-xl border border-obsidian-border bg-obsidian-surface py-2.5 pl-10 pr-3 text-sm text-ivory outline-none transition-colors focus:border-rec"
            >
              <option value="default">Thứ tự mặc định</option>
              <option value="newest">Năm mới nhất</option>
              <option value="oldest">Năm cũ nhất</option>
              <option value="title-asc">Tên: A → Z</option>
              <option value="title-desc">Tên: Z → A</option>
            </select>
          </label>
        </div>
      </div>

      {/* 16-Member Interactive Avatar Filter Bar + Scope Filter Pills */}
      <div className="rounded-2xl border border-obsidian-border bg-obsidian-surface/65 p-3 space-y-2.5 sm:p-4 sm:space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-ivory-muted sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rec" />
            <span>LỌC PROJECT THEO THÀNH VIÊN ({crewMembers.length} ANH EM):</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Sub-Filter Tabs */}
            <div className="inline-flex items-center rounded-xl border border-obsidian-border bg-obsidian p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => handleScopeSelect("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  scopeFilter === "all"
                    ? "bg-rec text-obsidian font-bold"
                    : "text-ivory-muted hover:text-ivory"
                }`}
              >
                TẤT CẢ [{baseEntries.length}]
              </button>
              <button
                type="button"
                onClick={() => handleScopeSelect("collective")}
                disabled={collectiveCount === 0}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  scopeFilter === "collective"
                    ? "bg-rec text-obsidian font-bold cursor-pointer"
                    : collectiveCount === 0
                      ? "text-ivory-subtle/40 cursor-not-allowed"
                      : "text-ivory-muted hover:text-ivory cursor-pointer"
                }`}
              >
                EKIP [{collectiveCount}]
              </button>
              <button
                type="button"
                onClick={() => handleScopeSelect("personal")}
                disabled={personalCount === 0}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  scopeFilter === "personal"
                    ? "bg-rec text-obsidian font-bold cursor-pointer"
                    : personalCount === 0
                      ? "text-ivory-subtle/40 cursor-not-allowed"
                      : "text-ivory-muted hover:text-ivory cursor-pointer"
                }`}
              >
                CÁ NHÂN [{personalCount}]
              </button>
            </div>

            {selectedMemberSlug !== "ALL" && (
              <button
                type="button"
                onClick={() => handleMemberSelect("ALL")}
                className="text-rec hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bỏ lọc thành viên</span>
                <span className="sm:hidden">Bỏ lọc</span>
              </button>
            )}
          </div>
        </div>

        <label className="relative block sm:hidden">
          <span className="sr-only">Lọc dự án theo thành viên</span>
          <select
            value={selectedMemberSlug}
            onChange={(event) => handleMemberSelect(event.target.value)}
            className="w-full appearance-none rounded-xl border border-obsidian-border bg-obsidian py-2.5 pl-3 pr-9 text-xs font-mono text-ivory outline-none focus:border-rec"
          >
            <option value="ALL">Tất cả kho dự án ({totalArchiveCount} dự án)</option>
            {crewMembers.map((member) => {
              const count = memberProjectCounts.get(member.slug) ?? 0;
              return (
                <option key={member.id} value={member.slug}>
                  {member.name} ({count} dự án)
                </option>
              );
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-muted" />
        </label>

        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => handleMemberSelect("ALL")}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedMemberSlug === "ALL"
                ? "bg-rec text-obsidian shadow-[0_0_20px_rgba(255,77,0,0.4)]"
                : "border border-obsidian-border bg-obsidian text-ivory-muted hover:text-ivory"
            }`}
          >
            TẤT CẢ EKIP [{totalArchiveCount}]
          </button>

          {crewMembers.map((m) => {
            const count = memberProjectCounts.get(m.slug) ?? 0;
            const active = selectedMemberSlug === m.slug;
            const meta = getRoleMeta(m.roleCategory);
            const shortName =
              m.nickname
                ? `${m.name.split(" ").slice(-1)[0]} (${m.nickname})`
                : m.name.split(" ").slice(-2).join(" ");

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleMemberSelect(active ? "ALL" : m.slug)}
                className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                  active
                    ? "bg-rec text-obsidian border-rec font-bold shadow-[0_0_18px_rgba(255,77,0,0.38)]"
                    : "border-obsidian-border bg-obsidian text-ivory-muted hover:text-ivory hover:border-rec/50"
                }`}
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-6 h-6 rounded-full object-cover object-[50%_18%] border"
                  style={{ borderColor: active ? "#08090C" : meta.color }}
                />
                <span>{shortName}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    active
                      ? "bg-obsidian/20 text-obsidian font-extrabold"
                      : "bg-obsidian-surface text-ivory-subtle"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Member Context Banner */}
      {selectedMember && (
        <div className="rounded-2xl border border-rec/45 bg-gradient-to-r from-rec/12 via-obsidian-surface to-obsidian-surface p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={selectedMember.avatar}
              alt={selectedMember.name}
              className="w-16 h-16 rounded-full object-cover object-[50%_18%] border-2 border-rec shrink-0"
            />
            <div className="min-w-0 space-y-1">
              <div className="text-xs font-mono text-rec font-bold uppercase">
                ĐANG LỌC PROJECT CỦA CREW #{selectedMember.badgeNumber} •{" "}
                {selectedMember.roleTitle} • {baseEntries.length} DỰ ÁN &amp; BỘ ẢNH
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory truncate">
                {selectedMember.name}
                {selectedMember.nickname ? ` (${selectedMember.nickname})` : ""}
              </h2>
              <p className="text-xs font-mono text-ivory-muted truncate">
                Gear tủ: {selectedMember.favoriteGear.join(" • ")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/crew/${selectedMember.slug}`}
              onClick={() => soundEngine.playShutter()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors"
            >
              <IdCard className="w-4 h-4" />
              <span>MỞ THẺ ĐEO 3D &amp; HỒ SƠ CÁ NHÂN →</span>
            </Link>
            <button
              type="button"
              onClick={() => handleMemberSelect("ALL")}
              className="px-3.5 py-2.5 rounded-xl border border-obsidian-border bg-obsidian hover:border-rec/60 text-xs font-mono text-ivory-muted hover:text-ivory transition-colors cursor-pointer"
            >
              XEM TẤT CẢ {totalArchiveCount} PROJECTS
            </button>
          </div>
        </div>
      )}

      {/* GSAP Flip Project Grid */}
      {visibleEntries.length > 0 ? (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {visibleEntries.map((entry) => (
            <div
              key={entry.flipId}
              data-flip-id={entry.flipId}
              className="work-flip-card h-full"
            >
              {entry.kind === "collective" ? (
                <WorkArchiveCard
                  work={entry.work}
                  crewMembers={crewMembers}
                  partnerOrganizations={partnerOrganizations}
                  selectedMemberSlug={selectedMemberSlug}
                  onSelectMember={handleMemberSelect}
                />
              ) : (
                <PersonalArchiveCard
                  owner={entry.owner}
                  project={entry.project}
                  globalPartners={partnerOrganizations}
                  selectedMemberSlug={selectedMemberSlug}
                  onSelectMember={handleMemberSelect}
                  onOpenAlbum={openPersonalLightbox}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-obsidian-border bg-obsidian-surface/65 p-10 text-center space-y-3">
          <p className="font-display text-lg font-bold text-ivory">
            Không tìm thấy dự án khớp bộ lọc hiện tại
          </p>
          <p className="text-xs sm:text-sm font-mono text-ivory-muted">
            Thử đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc để xem toàn bộ kho dự án.
          </p>
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => {
                  captureFlip();
                  setQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-rec text-obsidian font-mono font-bold text-xs cursor-pointer"
              >
                XÓA TỪ KHÓA TÌM KIẾM
              </button>
            )}
            {(selectedMemberSlug !== "ALL" || scopeFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setScopeFilter("all");
                  handleMemberSelect("ALL");
                }}
                className="px-4 py-2 rounded-xl border border-obsidian-border bg-obsidian text-ivory font-mono text-xs hover:border-rec cursor-pointer"
              >
                XEM TẤT CẢ {totalArchiveCount} PROJECTS
              </button>
            )}
          </div>
        </div>
      )}

      {/* Full-Screen Personal Album Lightbox (portaled to document.body at z-[95] above Navbar & Canvas) */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {lightboxEntry && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closePersonalLightbox}
                  data-lenis-prevent
                  className="fixed inset-0 z-[95] bg-obsidian/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-5xl w-full h-[92dvh] max-h-[92dvh] rounded-2xl border border-obsidian-border bg-obsidian-surface overflow-hidden shadow-2xl flex flex-col"
                  >
                    {/* Lightbox Header */}
                    <div className="px-5 py-3.5 border-b border-obsidian-border flex flex-wrap items-center justify-between gap-3 shrink-0">
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-rec font-bold truncate">
                          {lightboxEntry.owner.name.toUpperCase()} •{" "}
                          {lightboxEntry.project.roleBadge.toUpperCase()}
                          {!showLightboxVideo
                            ? ` • FRAME ${activeLightboxPhotoIdx + 1} / ${lightboxGallery.length}`
                            : " • VIDEO"}
                        </div>
                        <h3 className="font-display text-lg font-bold text-ivory truncate">
                          {lightboxEntry.project.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {!showLightboxVideo && (
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playTick(0.8);
                              setLightboxZoomed((z) => !z);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
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
                        )}

                        {lightboxEntry.project.externalUrl && (
                          <a
                            href={lightboxEntry.project.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-obsidian-border hover:border-rec text-xs font-mono text-ivory-muted hover:text-ivory transition-colors"
                          >
                            <span>LINK GỐC</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {lightboxEntry.project.workSlug && (
                          <Link
                            href={`/works/${lightboxEntry.project.workSlug}`}
                            scroll={false}
                            onClick={closePersonalLightbox}
                            className="px-3 py-1.5 rounded-lg border border-rec/60 bg-rec/15 hover:bg-rec hover:text-obsidian text-ivory font-mono font-bold text-xs transition-colors"
                          >
                            TRANG DỰ ÁN &amp; BTS →
                          </Link>
                        )}

                        <Link
                          href={`/crew/${lightboxEntry.owner.slug}`}
                          onClick={closePersonalLightbox}
                          className="px-3 py-1.5 rounded-lg bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <IdCard className="w-3.5 h-3.5" />
                          <span>HỒ SƠ 3D →</span>
                        </Link>

                        <button
                          type="button"
                          aria-label="Đóng bộ ảnh"
                          onClick={closePersonalLightbox}
                          className="p-1.5 rounded-lg border border-obsidian-border hover:border-rec text-ivory-muted hover:text-ivory cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Uncropped Full-Frame Viewer or Embedded YouTube Stage */}
                    <div
                      className={`relative bg-obsidian flex-1 min-h-0 flex items-center justify-center p-3 ${
                        lightboxZoomed ? "overflow-auto" : "overflow-hidden"
                      }`}
                    >
                      {showLightboxVideo && lightboxYoutubeEmbed ? (
                        <iframe
                          src={`${lightboxYoutubeEmbed}?autoplay=1&playsinline=1&rel=0`}
                          title={lightboxEntry.project.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full max-w-4xl aspect-video rounded-xl border border-obsidian-border shadow-2xl"
                        />
                      ) : (
                        <>
                          <img
                            src={lightboxGallery[activeLightboxPhotoIdx]}
                            alt=""
                            className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-110"
                          />
                          <img
                            src={lightboxGallery[activeLightboxPhotoIdx]}
                            alt={lightboxEntry.project.title}
                            onClick={() => setLightboxZoomed((z) => !z)}
                            className={`relative z-10 rounded-lg shadow-2xl transition-transform duration-300 ${
                              lightboxZoomed
                                ? "max-h-none w-auto scale-150 cursor-zoom-out sm:scale-[1.85]"
                                : "max-h-full w-auto max-w-full cursor-zoom-in object-contain"
                            }`}
                          />

                          {lightboxGallery.length > 1 && (
                            <>
                              <button
                                type="button"
                                aria-label="Ảnh trước"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  soundEngine.playTick(0.85);
                                  setLightboxPhotoIdx(
                                    (activeLightboxPhotoIdx - 1 + lightboxGallery.length) %
                                      lightboxGallery.length
                                  );
                                }}
                                className="absolute z-20 left-3 p-2.5 rounded-full bg-obsidian/85 border border-white/15 hover:border-rec text-ivory cursor-pointer"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Ảnh tiếp theo"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  soundEngine.playTick(0.85);
                                  setLightboxPhotoIdx(
                                    (activeLightboxPhotoIdx + 1) % lightboxGallery.length
                                  );
                                }}
                                className="absolute z-20 right-3 p-2.5 rounded-full bg-obsidian/85 border border-white/15 hover:border-rec text-ivory cursor-pointer"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {/* Thumbnails & Description Footer */}
                    <div className="min-h-0 max-h-[38dvh] shrink-0 space-y-3 overflow-y-auto border-t border-obsidian-border p-4">
                      {driveAlbumLoading ? (
                        <p className="text-xs text-ivory-muted">
                          Đang tải ảnh từ Google Drive…
                        </p>
                      ) : null}
                      {driveAlbumError ? (
                        <p role="status" className="text-xs leading-relaxed text-amber-200">
                          {driveAlbumError}
                          {legacyDriveFallback.length ? " Đang dùng ảnh album cũ." : ""}
                        </p>
                      ) : null}
                      {lightboxEntry.project.galleryDriveFolderUrl &&
                      driveAlbumImages?.length === 0 &&
                      !driveAlbumLoading ? (
                        <p className="text-xs text-ivory-muted">
                          Thư mục Drive chưa có ảnh.
                        </p>
                      ) : null}

                      {!showLightboxVideo && lightboxGallery.length > 1 && (
                        <div
                          className="w-full columns-2 gap-2 pr-1 sm:columns-4 sm:gap-3"
                          aria-label="Lưới ảnh dự án"
                        >
                          {lightboxGallery.map((src, idx) => (
                            <button
                              key={src + idx}
                              type="button"
                              aria-label={`Mở ảnh ${idx + 1}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                soundEngine.playTick(0.75);
                                setLightboxPhotoIdx(idx);
                              }}
                              className={`group relative mb-2 block w-full break-inside-avoid overflow-hidden rounded-lg border-2 transition-all cursor-pointer sm:mb-3 ${
                                idx === activeLightboxPhotoIdx
                                  ? "border-rec opacity-100"
                                  : "border-obsidian-border opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={src}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
                              />
                              <span className="absolute bottom-1.5 right-1.5 rounded bg-obsidian/85 px-1.5 py-0.5 text-[10px] font-mono text-ivory">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ivory-muted">
                        <p className="max-w-3xl">{lightboxEntry.project.summary}</p>
                        <span className="font-mono text-rec font-semibold shrink-0">
                          {lightboxEntry.project.exifSpec ?? lightboxEntry.project.cameraSpec}
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
