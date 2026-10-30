"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import {
  ArrowUpRight,
  Camera,
  Film,
  IdCard,
  Images,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { CrewMember } from "@/data/schema";
import type { WorkProject } from "@/data/works";
import { getRoleMeta } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import { useSiteContent } from "@/lib/store";
import { toYoutubeEmbedUrl } from "@/lib/youtube";

gsap.registerPlugin(Flip);

function isGenericProjectCover(src: string) {
  const path = src.trim().replace(/^https?:\/\/[^/]+/i, "").split(/[?#]/, 1)[0];
  return !path || /^\/media\/works\/work-\d+\.(?:jpe?g|png|webp)$/i.test(path);
}

function WorkArchiveCard({
  work,
  crewMembers,
  selectedMemberSlug,
  onSelectMember,
}: {
  work: WorkProject;
  crewMembers: CrewMember[];
  selectedMemberSlug: string;
  onSelectMember: (slug: string) => void;
}) {
  const [isPortraitFrame, setIsPortraitFrame] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const coverSrc = work.coverImage?.trim() ?? "";
  const hasRealCover = Boolean(coverSrc) && !isGenericProjectCover(coverSrc);
  const videoEmbedUrl = toYoutubeEmbedUrl(work.videoEmbedUrl || work.videoUrl || "");
  const videoId = videoEmbedUrl?.split("/").pop();
  const shouldPlayVideoCover = !hasRealCover && Boolean(videoEmbedUrl && videoId);
  const fallbackCoverSrc = coverSrc || "/media/works/work-01.jpg";
  const previewVideoUrl = videoEmbedUrl
    ? `${videoEmbedUrl}?playsinline=1&rel=0`
    : null;
  const autoplayVideoUrl = videoEmbedUrl && videoId
    ? `${videoEmbedUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0`
    : null;
  const activeVideoUrl = isVideoHovered ? autoplayVideoUrl : previewVideoUrl;

  const selectedCredit =
    selectedMemberSlug !== "ALL"
      ? work.credits.find((c) => c.memberSlug === selectedMemberSlug)
      : undefined;

  return (
    <article className="rounded-2xl border border-obsidian-border hover:border-rec/70 bg-obsidian-surface overflow-hidden flex flex-col justify-between transition-colors shadow-[0_12px_36px_rgba(0,0,0,0.35)] group h-full">
      <div>
        {/* Top Metadata & Segmented Frame Progress */}
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

        {/* One fixed project cover; the full album lives on the detail page. */}
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
          {shouldPlayVideoCover && activeVideoUrl ? (
            <iframe
              src={activeVideoUrl}
              title={`Video xem trước ${work.title}`}
              aria-hidden="true"
              tabIndex={-1}
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture"
              className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] border-0"
            />
          ) : (
            <>
              <img
                src={fallbackCoverSrc}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
              />
              <img
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
            <span className="px-2.5 py-1 rounded-md bg-obsidian/80 backdrop-blur-md border border-white/15 text-xs font-mono text-ivory/90">
              {work.galleryDriveFolderUrl ? "ALBUM DRIVE BÊN DƯỚI" : work.durationTimecode}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-obsidian/85 backdrop-blur-md border border-white/15 group-hover:bg-rec group-hover:border-rec group-hover:text-obsidian text-xs font-mono font-bold text-ivory inline-flex items-center gap-1 transition-colors">
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

        {/* Interactive Ekip Credits: Click any member chip to filter all projects by that member! */}
        <div className="pt-2.5 border-t border-obsidian-border/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-ivory-subtle">
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-rec" />
              <span>EKIP THỰC HIỆN ({work.credits.length}) — BẤM TÊN ĐỂ LỌC:</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {work.credits.slice(0, 5).map((credit) => {
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
            {work.credits.length > 5 && (
              <Link
                href={`/works/${work.slug}`}
                scroll={false}
                className="px-2.5 py-1 rounded-full text-xs font-mono border border-obsidian-border bg-obsidian text-rec hover:border-rec transition-colors"
              >
                +{work.credits.length - 5} anh em
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function WorksArchiveGrid() {
  const siteContent = useSiteContent();
  const crewMembers = siteContent.crew;
  const workProjects = siteContent.works;
  const [selectedMemberSlug, setSelectedMemberSlug] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  // Support deep-link ?member=tran-kim-thang from Timeline, Crew Cards, or Spotlight
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const mSlug = params.get("member");
    if (mSlug && crewMembers.some((m) => m.slug === mSlug)) {
      setSelectedMemberSlug(mSlug);
    }
  }, []);

  const captureFlip = () => {
    if (!gridRef.current) return;
    const targets = gridRef.current.querySelectorAll(".work-flip-card");
    flipStateRef.current = Flip.getState(targets);
  };

  useLayoutEffect(() => {
    if (!flipStateRef.current || !gridRef.current) return;
    Flip.from(flipStateRef.current, {
      targets: gridRef.current.querySelectorAll(".work-flip-card"),
      duration: 0.48,
      ease: "power3.out",
      scale: true,
      stagger: 0.02,
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.36, ease: "power2.out" }
        ),
      onLeave: (elements) =>
        gsap.to(elements, { opacity: 0, scale: 0.9, duration: 0.25 }),
    });
    flipStateRef.current = null;
  }, [selectedMemberSlug, query]);

  const handleMemberSelect = (slug: string) => {
    if (slug === selectedMemberSlug) return;
    soundEngine.playTick(0.85);
    captureFlip();
    setSelectedMemberSlug(slug);
    if (typeof window !== "undefined") {
      const nextUrl =
        slug === "ALL" ? "/works" : `/works?member=${encodeURIComponent(slug)}`;
      window.history.replaceState(null, "", nextUrl);
    }
  };

  const selectedMember =
    selectedMemberSlug !== "ALL"
      ? crewMembers.find((member) => member.slug === selectedMemberSlug)
      : undefined;
  const normalizedQuery = query.trim().toLowerCase();

  // Prioritize the selected member's Lead Projects first, then Ekip shoots, then 16-member Collective Archive
  const orderedWorks =
    selectedMemberSlug === "ALL"
      ? workProjects
      : [...workProjects].sort((a, b) => {
          const rank = (w: WorkProject) => {
            if (w.credits[0]?.memberSlug === selectedMemberSlug) return 0;
            if (w.slug === "hau-truong-thiet-bi-gia" || w.credits.length >= 12) return 2;
            return 1;
          };
          return rank(a) - rank(b);
        });

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
            KHO PROJECT &amp; BỘ SƯU TẬP [{workProjects.length}]
          </h1>
          <p className="text-sm sm:text-base text-ivory-muted max-w-2xl">
            Chọn trực tiếp{" "}
            <span className="text-ivory font-medium">Avatar thành viên</span> bên dưới để xem toàn bộ các dự án và vai trò cụ thể của từng anh em trong Thiết Bị Gia, hoặc rê chuột lên từng thẻ để lướt nhanh bộ ảnh.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-ivory-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              captureFlip();
              setQuery(e.target.value);
            }}
            placeholder="Tìm tên project, DANAFF, MV, Áo dài..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-obsidian-border bg-obsidian-surface text-sm text-ivory placeholder:text-ivory-subtle focus:outline-none focus:border-rec transition-colors"
          />
        </div>
      </div>

      {/* Idea 3: 16-Member Interactive Avatar Filter Bar (GSAP Flip Powered) */}
      <div className="rounded-2xl border border-obsidian-border bg-obsidian-surface/65 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs font-mono text-ivory-muted">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rec" />
            <span>LỌC PROJECT THEO THÀNH VIÊN ({crewMembers.length} ANH EM):</span>
          </span>
          {selectedMemberSlug !== "ALL" && (
            <button
              type="button"
              onClick={() => handleMemberSelect("ALL")}
              className="text-rec hover:underline inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bỏ lọc thành viên</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleMemberSelect("ALL")}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedMemberSlug === "ALL"
                ? "bg-rec text-obsidian shadow-[0_0_20px_rgba(255,77,0,0.4)]"
                : "border border-obsidian-border bg-obsidian text-ivory-muted hover:text-ivory"
            }`}
          >
            TẤT CẢ EKIP [{workProjects.length}]
          </button>

          {crewMembers.map((m) => {
            const count = workProjects.filter((work) =>
              work.credits.some((credit) => credit.memberSlug === m.slug)
            ).length;
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

      {/* Selected Member Context Banner (Appears when filtering by a specific crew member!) */}
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
                {selectedMember.roleTitle}
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
              className="px-3.5 py-2.5 rounded-xl border border-obsidian-border bg-obsidian hover:border-rec/60 text-xs font-mono text-ivory-muted hover:text-ivory transition-colors"
            >
              XEM TẤT CẢ 12 PROJECTS
            </button>
          </div>
        </div>
      )}

      {/* GSAP Flip Project Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {orderedWorks.map((work) => {
          const matchesMember =
            selectedMemberSlug === "ALL" ||
            work.credits.some((c) => c.memberSlug === selectedMemberSlug);
          const matchesSearch =
            !normalizedQuery ||
            work.title.toLowerCase().includes(normalizedQuery) ||
            work.category.toLowerCase().includes(normalizedQuery) ||
            work.clientOrSeries.toLowerCase().includes(normalizedQuery) ||
            work.summary.toLowerCase().includes(normalizedQuery);

          const visible = matchesMember && matchesSearch;

          return (
            <div
              key={work.id}
              style={{ display: visible ? "block" : "none" }}
              className="work-flip-card"
            >
              <WorkArchiveCard
                work={work}
                crewMembers={crewMembers}
                selectedMemberSlug={selectedMemberSlug}
                onSelectMember={handleMemberSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
