"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Film, IdCard, Images, Play, RefreshCw } from "lucide-react";
import type { CrewMember } from "@/data/schema";
import {
  getTeammatesForMember,
  getUnifiedProjectsForMember,
} from "@/data/works";
import { getRoleMeta } from "@/lib/utils";
import { useAppStore, useSiteContent } from "@/lib/store";
import { soundEngine } from "@/lib/sound";
import { getYoutubeThumbnailUrl, shouldUseYoutubeCoverPreview } from "@/lib/youtube";

export function MemberContextPills({ member }: { member: CrewMember }) {
  const siteContent = useSiteContent();
  const crewMembers = siteContent.crew;
  const setCursor = useAppStore((s) => s.setCursor);
  const setActiveWorkIndex = useAppStore((s) => s.setActiveWorkIndex);

  const allProjects = getUnifiedProjectsForMember(member, siteContent.works, crewMembers);
  const previewProjects = allProjects.slice(0, 3);
  const topTeammate = getTeammatesForMember(member.slug, siteContent.works, crewMembers)[0]?.member;
  const shortName =
    member.nickname ?? member.name.split(" ").slice(-2).join(" ");

  return (
    <div className="pointer-events-auto w-[264px] sm:w-[292px] flex flex-col gap-2">
      {/* Header Label for Member's Visual Project Stack */}
      <div className="px-3 py-1.5 rounded-xl border border-white/10 bg-obsidian-surface/85 backdrop-blur-xl flex items-center justify-between gap-2 shadow-lg">
        <span className="text-xs font-mono text-ivory flex items-center gap-1.5 truncate">
          <Film className="w-3.5 h-3.5 text-rec shrink-0" />
          <span className="font-bold truncate">
            PROJECT CỦA {shortName.toUpperCase()}
          </span>
        </span>
        <Link
          href={`/works?member=${member.slug}`}
          onClick={() => {
            soundEngine.playTick(0.8);
            setCursor("default", "");
          }}
          className="text-xs font-mono text-rec hover:underline shrink-0"
        >
          [{allProjects.length}] Tất cả →
        </Link>
      </div>

      <AnimatePresence mode="popLayout">
        {/* Idea 2: Visual Fan-Out / Stacked Project Thumbnail Cards */}
        {previewProjects.map((proj, idx) => {
          const targetHref = proj.workSlug
            ? `/works/${proj.workSlug}`
            : `/crew/${member.slug}`;
          const youtubeThumbnail = shouldUseYoutubeCoverPreview(proj.videoUrl, proj.coverImage)
            ? getYoutubeThumbnailUrl(proj.videoUrl ?? "")
            : null;
          return (
            <motion.div
              key={`${member.slug}-proj-${proj.id}`}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.95 }}
              transition={{
                duration: 0.28,
                delay: idx * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={targetHref}
                scroll={false}
                onClick={() => {
                  soundEngine.playShutter();
                  setCursor("default", "");
                }}
                onMouseEnter={() => {
                  soundEngine.playHover();
                  setCursor("project", "MỞ PROJECT");
                }}
                onMouseLeave={() => setCursor("default", "")}
                className="group flex items-center gap-3 p-2 rounded-2xl border border-white/15 bg-obsidian-surface/85 hover:bg-obsidian-elevated hover:border-rec/70 hover:-translate-x-1 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.55)] transition-all"
              >
                {/* Wide 16:10 Real Project Thumbnail + Frame Count */}
                <div
                  className="relative w-20 h-[52px] rounded-xl overflow-hidden border shrink-0 bg-obsidian"
                  style={{ borderColor: `${proj.accentColor}88` }}
                >
                  <img
                    src={youtubeThumbnail || proj.coverImage}
                    alt={proj.title}
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (youtubeThumbnail && image.dataset.fallback !== "true") {
                        image.dataset.fallback = "true";
                        image.src = proj.coverImage;
                      }
                    }}
                    className="w-full h-full object-cover object-[50%_20%] group-hover:scale-110 transition-transform duration-500"
                  />
                  {youtubeThumbnail ? (
                    <span className="pointer-events-none absolute inset-0 grid place-items-center">
                      <span className="grid h-5 w-7 place-items-center rounded-md bg-[#FF0033] shadow-lg">
                        <Play className="h-3 w-3 fill-white text-white" aria-hidden="true" />
                      </span>
                    </span>
                  ) : null}
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-obsidian/85 text-[10px] font-mono font-bold text-ivory flex items-center gap-0.5 leading-none">
                    {youtubeThumbnail ? <Film className="w-2.5 h-2.5 text-rec" /> : <Images className="w-2.5 h-2.5 text-rec" />}
                    {youtubeThumbnail ? "VIDEO" : proj.frames.length}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-xs font-mono text-rec truncate">
                    {proj.roleBadge}
                  </div>
                  <div className="font-display font-bold text-xs sm:text-sm text-ivory group-hover:text-rec transition-colors truncate">
                    {proj.title}
                  </div>
                  <div className="text-xs text-ivory-subtle truncate">
                    {proj.category}
                  </div>
                </div>

                <ArrowUpRight className="w-4 h-4 text-ivory-subtle group-hover:text-rec shrink-0 mr-1" />
              </Link>
            </motion.div>
          );
        })}

        {/* Quick-Glide Pill to a Frequent Teammate on the 3D Timeline */}
        {topTeammate && (
          <motion.div
            key={`${member.slug}-mate-${topTeammate.slug}`}
            initial={{ opacity: 0, x: 18, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12, scale: 0.95 }}
            transition={{
              duration: 0.28,
              delay: 0.13,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <button
              type="button"
              onClick={() => {
                const targetIdx = crewMembers.findIndex(
                  (m) => m.slug === topTeammate.slug
                );
                if (targetIdx >= 0) {
                  setActiveWorkIndex(targetIdx, true);
                }
              }}
              onMouseEnter={() => {
                soundEngine.playHover();
                setCursor("crew", `TỚI #${topTeammate.badgeNumber}`);
              }}
              onMouseLeave={() => setCursor("default", "")}
              className="w-full group flex items-center justify-between gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full border border-white/15 bg-obsidian-surface/75 hover:bg-obsidian-elevated/95 hover:border-cyan-400/60 backdrop-blur-xl shadow-lg transition-all text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-full overflow-hidden border-2 shrink-0"
                  style={{
                    borderColor: getRoleMeta(topTeammate.roleCategory).color,
                  }}
                >
                  <img
                    src={topTeammate.avatar}
                    alt={topTeammate.name}
                    className="w-full h-full object-cover object-[50%_18%]"
                  />
                </div>
                <div className="text-xs leading-tight truncate">
                  <span className="text-ivory-muted font-mono mr-1">
                    Cùng ekip:
                  </span>
                  <span className="text-ivory font-semibold group-hover:text-cyan-400 transition-colors">
                    {topTeammate.name}
                  </span>
                </div>
              </div>
              <RefreshCw className="w-3 h-3 text-ivory-subtle group-hover:text-cyan-400 group-hover:rotate-90 transition-transform shrink-0" />
            </button>
          </motion.div>
        )}

        {/* Open 3D Hanging Lanyard Press Pass & Full Portfolio */}
        <motion.div
          key={`${member.slug}-open-pass`}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.28, delay: 0.16 }}
        >
          <Link
            href={`/crew/${member.slug}`}
            scroll={false}
            onClick={() => {
              soundEngine.playShutter();
              setCursor("default", "");
            }}
            onMouseEnter={() => setCursor("crew", "MỞ THẺ 3D")}
            onMouseLeave={() => setCursor("default", "")}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-rec/45 bg-rec/15 hover:bg-rec hover:text-obsidian text-xs font-mono font-bold text-ivory backdrop-blur-xl shadow-lg transition-all"
          >
            <IdCard className="w-3.5 h-3.5" />
            <span>Mở Thẻ 3D &amp; Full {allProjects.length} Projects →</span>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
