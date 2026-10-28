"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { Film, IdCard, Play, Users } from "lucide-react";
import { CREW_MEMBERS } from "@/data/crew";
import { WORKS_DATA } from "@/data/works";
import { timelineMotion, useAppStore } from "@/lib/store";
import { getRoleMeta } from "@/lib/utils";
import { CrewCreditPills } from "./CrewCreditPills";
import { MemberContextPills } from "./MemberContextPills";
import { NLEScrubberRuler } from "./NLEScrubberRuler";
import { DecoderText } from "@/components/layout/DecoderText";
import { soundEngine } from "@/lib/sound";

gsap.registerPlugin(Observer);

const TimelineCarousel3DView = dynamic(
  () =>
    import("@/components/canvas/TimelineCarousel3D").then(
      (m) => m.TimelineCarousel3DView
    ),
  { ssr: false }
);

export function LivingTimelineStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const timelineMode = useAppStore((s) => s.timelineMode);
  const setTimelineMode = useAppStore((s) => s.setTimelineMode);
  const activeWorkIndex = useAppStore((s) => s.activeWorkIndex);
  const isOverlayOpen = useAppStore((s) => s.isOverlayOpen);

  // Immediately hide & disable homepage floating HUD whenever an intercepting modal opens or route leaves "/"
  const isBackgrounded = isOverlayOpen || pathname !== "/";

  const isCrewMode = timelineMode === "crew";
  const total = isCrewMode ? CREW_MEMBERS.length : WORKS_DATA.length;

  const activeMember = CREW_MEMBERS[activeWorkIndex] ?? CREW_MEMBERS[0];
  const activeWork = WORKS_DATA[activeWorkIndex] ?? WORKS_DATA[0];

  const activeAccentColor = isCrewMode
    ? getRoleMeta(activeMember.roles[0] ?? activeMember.roleCategory).color
    : activeWork.accentColor;

  // Support deep-linking directly to a member card (?member=tran-kim-thang) or works mode (?mode=works)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const memberSlug = params.get("member");
    const reqMode = params.get("mode");
    if (memberSlug) {
      const idx = CREW_MEMBERS.findIndex((m) => m.slug === memberSlug);
      if (idx >= 0) {
        useAppStore.getState().setTimelineMode("crew", idx);
        timelineMotion.currentIndex = idx;
        timelineMotion.targetIndex = idx;
      }
    } else if (reqMode === "works") {
      useAppStore.getState().setTimelineMode("works", 0);
      timelineMotion.currentIndex = 0;
      timelineMotion.targetIndex = 0;
    }
  }, []);

  useEffect(() => {
    if (!stageRef.current || isBackgrounded) return;

    const obs = Observer.create({
      target: stageRef.current,
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      onChange: (self) => {
        if (timelineMotion.isDragging) return;
        const isWheel = self.event.type === "wheel";
        if (!isWheel && !self.isDragging) return;

        const deltaRaw =
          Math.abs(self.deltaX) > Math.abs(self.deltaY) ? self.deltaX : self.deltaY;
        const sensitivity = isWheel ? 0.0038 : -0.0085;
        const step = isWheel ? -deltaRaw * sensitivity : deltaRaw * sensitivity;

        timelineMotion.targetIndex = Math.max(
          0,
          Math.min(total - 1, timelineMotion.targetIndex + step)
        );
      },
      onRelease: () => {
        timelineMotion.targetIndex = Math.round(timelineMotion.targetIndex);
      },
      tolerance: 6,
      preventDefault: true,
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (useAppStore.getState().isOverlayOpen || window.location.pathname !== "/") return;
      if (e.key === "ArrowRight") useAppStore.getState().stepWorkIndex(1);
      if (e.key === "ArrowLeft") useAppStore.getState().stepWorkIndex(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      obs.kill();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isBackgrounded, total]);

  return (
    <section
      ref={stageRef}
      aria-hidden={isBackgrounded}
      className={`relative w-full h-[100dvh] overflow-hidden bg-obsidian flex flex-col justify-between pt-20 pb-4 select-none transition-opacity duration-200 ${
        isBackgrounded ? "invisible opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Subtle radial studio spotlight behind center card */}
      <div
        className="pointer-events-none absolute inset-0 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${activeAccentColor}20 0%, rgba(10,11,14,0) 56%)`,
        }}
      />

      {/* Top Active Metadata HUD + Mode Switcher (Crew [16] vs Works [12]) */}
      <div
        className={`relative z-[45] max-w-[1440px] w-full mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 pointer-events-none ${
          isBackgrounded ? "hidden" : ""
        }`}
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono text-ivory-muted">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: activeAccentColor }}
            />
            {isCrewMode ? (
              <span>
                MEMBER #{activeMember.badgeNumber} //{" "}
                {activeMember.roleTitle.toUpperCase()}
              </span>
            ) : (
              <span>
                SCENE {activeWork.indexLabel} // {activeWork.category.toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-xs font-mono text-ivory-subtle">
            <DecoderText
              text={
                isCrewMode
                  ? activeMember.favoriteGear.join(" • ").toUpperCase()
                  : activeWork.cameraSpec
              }
            />
          </div>
        </div>

        {/* Interactive Mode Switcher Pill */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full border border-obsidian-border bg-obsidian-surface/85 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => {
              if (!isCrewMode) setTimelineMode("crew", 0);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              isCrewMode
                ? "bg-rec text-obsidian font-bold shadow-[0_0_18px_rgba(255,77,0,0.4)]"
                : "text-ivory-muted hover:text-ivory"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>THÀNH VIÊN [{CREW_MEMBERS.length}]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isCrewMode) setTimelineMode("works", 0);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              !isCrewMode
                ? "bg-rec text-obsidian font-bold shadow-[0_0_18px_rgba(255,77,0,0.4)]"
                : "text-ivory-muted hover:text-ivory"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>DỰ ÁN NHÓM [{WORKS_DATA.length}]</span>
          </button>
        </div>
      </div>

      {/* Center 3D WebGL Carousel Stage + Floating Info & Context Pills */}
      <div className="relative flex-1 w-full min-h-0 flex items-center justify-center">
        {/* Drei View Tracking Container (z-10 -> renders on PersistentCanvas z-40) */}
        <div className="absolute inset-0 z-10">
          <TimelineCarousel3DView />
        </div>

        {/* Left Info Card & Right Floating Glass Pills (z-[45] above z-40 3D Canvas, strictly below z-50 Modal) */}
        <div
          className={`relative z-[45] w-full max-w-[1280px] mx-auto px-4 sm:px-8 h-full pointer-events-none flex flex-col md:flex-row items-end md:items-center justify-end md:justify-between pb-3 md:pb-0 ${
            isBackgrounded ? "hidden" : ""
          }`}
        >
          {isCrewMode ? (
            <>
              {/* Left Active Member Spotlight Summary Card */}
              <div className="pointer-events-auto max-w-xs space-y-3 bg-obsidian-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hidden lg:block">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-obsidian border border-obsidian-border text-xs font-mono text-ivory-muted">
                    #{activeMember.badgeNumber}
                  </span>
                  {activeMember.roles.map((r) => {
                    const rMeta = getRoleMeta(r);
                    return (
                      <span
                        key={r}
                        className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-obsidian"
                        style={{ backgroundColor: rMeta.color }}
                      >
                        {rMeta.shortLabel}
                      </span>
                    );
                  })}
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold text-ivory leading-tight">
                    {activeMember.name}
                    {activeMember.nickname ? (
                      <span className="text-rec font-mono text-sm ml-2">
                        ({activeMember.nickname})
                      </span>
                    ) : null}
                  </h2>
                  <p className="text-xs font-mono text-ivory-muted mt-0.5">
                    {activeMember.secondaryRoles.join(" • ")}
                  </p>
                </div>

                <p className="text-xs text-ivory/80 line-clamp-3 leading-relaxed">
                  {activeMember.bio}
                </p>

                <Link
                  href={`/crew/${activeMember.slug}`}
                  scroll={false}
                  onClick={() => soundEngine.playShutter()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors"
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>MỞ HỒ SƠ &amp; THẺ 3D</span>
                </Link>
              </div>

              {/* Right Floating Frosted-Glass Member Context Pills */}
              <div className="md:ml-auto md:mr-[5%] lg:mr-[8%]">
                <MemberContextPills member={activeMember} />
              </div>
            </>
          ) : (
            <>
              {/* Left Active Project Info Card */}
              <div className="pointer-events-auto max-w-xs space-y-2.5 bg-obsidian-surface/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hidden lg:block">
                <div className="text-xs font-mono text-rec uppercase tracking-wider">
                  {activeWork.clientOrSeries} • {activeWork.year}
                </div>
                <h2 className="font-display text-2xl font-bold text-ivory leading-tight">
                  {activeWork.title}
                </h2>
                <p className="text-xs text-ivory-muted line-clamp-3 leading-relaxed">
                  {activeWork.summary}
                </p>
                <Link
                  href={`/works/${activeWork.slug}`}
                  scroll={false}
                  onClick={() => soundEngine.playShutter()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>MỞ DỰ ÁN &amp; BTS</span>
                </Link>
              </div>

              {/* Right Floating Frosted-Glass Crew Credit Pills */}
              <div className="md:ml-auto md:mr-[6%] lg:mr-[10%]">
                <CrewCreditPills work={activeWork} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom NLE Video Editor Timeline Scrubber Dock */}
      <div className={`relative z-[45] ${isBackgrounded ? "hidden" : ""}`}>
        <NLEScrubberRuler />
      </div>
    </section>
  );
}
