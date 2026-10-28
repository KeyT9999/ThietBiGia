"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Film, IdCard, RefreshCw } from "lucide-react";
import { CREW_MEMBERS, type CrewMember } from "@/data/crew";
import { getTeammatesForMember, getWorksForMember } from "@/data/works";
import { getRoleMeta } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { soundEngine } from "@/lib/sound";

export function MemberContextPills({ member }: { member: CrewMember }) {
  const setCursor = useAppStore((s) => s.setCursor);
  const setActiveWorkIndex = useAppStore((s) => s.setActiveWorkIndex);

  const memberWorks = getWorksForMember(member.slug).slice(0, 2);
  const topTeammate = getTeammatesForMember(member.slug)[0]?.member;

  return (
    <div className="pointer-events-auto flex flex-col items-start gap-2">
      <AnimatePresence mode="popLayout">
        {/* Featured Campaigns of this Member */}
        {memberWorks.map((proj, idx) => (
          <motion.div
            key={`${member.slug}-work-${proj.slug}`}
            initial={{ opacity: 0, x: 18, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12, scale: 0.94 }}
            transition={{
              duration: 0.3,
              delay: idx * 0.045,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={`/works/${proj.slug}`}
              scroll={false}
              onClick={() => {
                soundEngine.playShutter();
                setCursor("default", "");
              }}
              onMouseEnter={() => {
                soundEngine.playHover();
                setCursor("project", "XEM DỰ ÁN");
              }}
              onMouseLeave={() => setCursor("default", "")}
              className="group flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-white/15 bg-obsidian-surface/80 hover:bg-obsidian-elevated/95 hover:border-rec/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.55)] transition-all"
            >
              <div
                className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0"
                style={{ borderColor: proj.accentColor }}
              >
                <img
                  src={proj.coverImage}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs leading-tight max-w-[190px] truncate">
                <span className="text-ivory-muted font-mono mr-1.5 inline-flex items-center gap-1">
                  <Film className="w-3 h-3 text-rec inline" />
                  Dự án:
                </span>
                <span className="text-ivory font-semibold group-hover:text-rec transition-colors">
                  {proj.title}
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-ivory-subtle group-hover:text-rec group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </Link>
          </motion.div>
        ))}

        {/* Quick-Glide Pill to a Frequent Teammate on the 3D Timeline */}
        {topTeammate && (
          <motion.div
            key={`${member.slug}-mate-${topTeammate.slug}`}
            initial={{ opacity: 0, x: 18, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12, scale: 0.94 }}
            transition={{
              duration: 0.3,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <button
              type="button"
              onClick={() => {
                const targetIdx = CREW_MEMBERS.findIndex(
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
              className="group flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-white/15 bg-obsidian-surface/75 hover:bg-obsidian-elevated/95 hover:border-cyan-400/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.55)] transition-all text-left"
            >
              <div
                className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0"
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
              <div className="text-xs leading-tight">
                <span className="text-ivory-muted font-mono mr-1.5">
                  Cùng ekip:
                </span>
                <span className="text-ivory font-semibold group-hover:text-cyan-400 transition-colors">
                  {topTeammate.name}
                </span>
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
          transition={{ duration: 0.3, delay: 0.15 }}
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
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rec/45 bg-rec/15 hover:bg-rec hover:text-obsidian text-xs font-mono font-semibold text-ivory backdrop-blur-xl shadow-lg transition-all"
          >
            <IdCard className="w-3.5 h-3.5" />
            <span>Mở Dây Đeo 3D &amp; Hồ Sơ →</span>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

