"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Users } from "lucide-react";
import { getCrewBySlug } from "@/data/crew";
import { type WorkProject } from "@/data/schema";
import { getRoleMeta } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { soundEngine } from "@/lib/sound";

export function CrewCreditPills({ work }: { work: WorkProject }) {
  const setCursor = useAppStore((s) => s.setCursor);
  const visibleCredits = work.credits.slice(0, 3);
  const remainingCount = Math.max(0, work.credits.length - visibleCredits.length);

  return (
    <div className="pointer-events-auto flex flex-col items-start gap-2">
      <AnimatePresence mode="popLayout">
        {visibleCredits.map((credit, idx) => {
          const member = getCrewBySlug(credit.memberSlug);
          if (!member) return null;
          const roleMeta = getRoleMeta(member.roleCategory);

          return (
            <motion.div
              key={`${work.slug}-${member.slug}`}
              initial={{ opacity: 0, x: 18, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.94 }}
              transition={{
                duration: 0.32,
                delay: idx * 0.045,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={`/crew/${member.slug}`}
                scroll={false}
                onClick={() => {
                  soundEngine.playShutter();
                  setCursor("default", "");
                }}
                onMouseEnter={() => {
                  soundEngine.playHover();
                  setCursor("crew", "MỞ THẺ 3D");
                }}
                onMouseLeave={() => setCursor("default", "")}
                className="group flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-white/15 bg-obsidian-surface/75 hover:bg-obsidian-elevated/95 hover:border-rec/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.55)] transition-all"
              >
                <div
                  className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0"
                  style={{ borderColor: roleMeta.color }}
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover object-[50%_18%]"
                  />
                </div>
                <div className="text-xs leading-tight">
                  <span className="text-ivory-muted font-mono mr-1.5">
                    {credit.roleOnProject}:
                  </span>
                  <span className="text-ivory font-semibold group-hover:text-rec transition-colors">
                    {member.name}
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-ivory-subtle group-hover:text-rec group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
          );
        })}

        <motion.div
          key={`${work.slug}-more`}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.3, delay: 0.14 }}
        >
          <Link
            href={`/works/${work.slug}`}
            scroll={false}
            onClick={() => {
              soundEngine.playShutter();
              setCursor("default", "");
            }}
            onMouseEnter={() => setCursor("project", "FULL EKIP")}
            onMouseLeave={() => setCursor("default", "")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-obsidian/80 hover:border-rec/60 text-xs font-mono text-ivory-muted hover:text-ivory backdrop-blur-xl shadow-lg transition-all"
          >
            <Users className="w-3.5 h-3.5 text-rec" />
            <span>
              {remainingCount > 0 ? `+${remainingCount} Crew • ` : ""}Xem dự án
            </span>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
