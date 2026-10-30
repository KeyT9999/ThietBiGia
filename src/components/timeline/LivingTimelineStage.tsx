"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { Film, IdCard, MousePointerClick, Play, Users } from "lucide-react";
import { deferTimelineAutoplay, timelineMotion, useAppStore, useSiteContent } from "@/lib/store";
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
  const siteContent = useSiteContent();
  const crewMembers = siteContent.crew;
  const workProjects = siteContent.works;
  const stageRef = useRef<HTMLDivElement>(null);
  const carouselGestureAreaRef = useRef<HTMLDivElement>(null);
  const carouselGestureStartedInsideRef = useRef(false);
  const carouselGestureChangedRef = useRef(false);
  const pathname = usePathname();
  const timelineMode = useAppStore((s) => s.timelineMode);
  const setTimelineMode = useAppStore((s) => s.setTimelineMode);
  const activeWorkIndex = useAppStore((s) => s.activeWorkIndex);
  const isOverlayOpen = useAppStore((s) => s.isOverlayOpen);

  // Immediately hide & disable homepage floating HUD whenever an intercepting modal opens or route leaves "/"
  const isBackgrounded = isOverlayOpen || pathname !== "/";

  const isCrewMode = timelineMode === "crew";
  const total = isCrewMode ? crewMembers.length : workProjects.length;

  const activeMember = crewMembers[activeWorkIndex] ?? crewMembers[0];
  const activeWork = workProjects[activeWorkIndex] ?? workProjects[0];

  const activeAccentColor = isCrewMode
    ? getRoleMeta(activeMember.roles[0] ?? activeMember.roleCategory).color
    : activeWork.accentColor;

  // Support deep-linking directly to a member card (?member=tran-kim-thang) or works mode (?mode=works)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const memberSlug = params.get("member");
    const reqMode = params.get("mode");
    if (memberSlug) {
      const idx = crewMembers.findIndex((m) => m.slug === memberSlug);
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
      type: "touch,pointer",
      onPress: (self) => {
        const bounds = carouselGestureAreaRef.current?.getBoundingClientRect();
        const x = self.startX;
        const y = self.startY;
        carouselGestureChangedRef.current = false;
        carouselGestureStartedInsideRef.current = Boolean(
          bounds &&
            x !== undefined &&
            y !== undefined &&
            x >= bounds.left &&
            x <= bounds.right &&
            y >= bounds.top &&
            y <= bounds.bottom
        );
      },
      onChange: (self) => {
        if (timelineMotion.isDragging || !carouselGestureStartedInsideRef.current) return;
        if (!self.isDragging) return;
        // Horizontal swipes move the carousel; vertical swipes remain native page scrolling.
        if (Math.abs(self.deltaX) <= Math.abs(self.deltaY)) return;
        const step = self.deltaX * -0.0085;

        carouselGestureChangedRef.current = true;
        const nextTarget = timelineMotion.targetIndex + step;
        timelineMotion.targetIndex = nextTarget;
        deferTimelineAutoplay();
      },
      onRelease: () => {
        if (carouselGestureStartedInsideRef.current && carouselGestureChangedRef.current) {
          timelineMotion.targetIndex = Math.round(timelineMotion.targetIndex);
          deferTimelineAutoplay();
        }
        carouselGestureStartedInsideRef.current = false;
        carouselGestureChangedRef.current = false;
      },
      tolerance: 6,
      preventDefault: false,
    });

    const onKeyDown = (e: KeyboardEvent) => {
      const st = useAppStore.getState();
      if (st.isOverlayOpen || st.commandPaletteOpen || window.location.pathname !== "/")
        return;
      if (e.key === "ArrowRight") st.stepWorkIndex(1);
      if (e.key === "ArrowLeft") st.stepWorkIndex(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      obs.kill();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isBackgrounded, isCrewMode, total]);

  return (
    <section
      ref={stageRef}
      aria-hidden={isBackgrounded}
      className={`relative w-full h-[100dvh] overflow-hidden bg-obsidian flex flex-col justify-between pt-[calc(76px+env(safe-area-inset-top))] pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:pt-[calc(80px+env(safe-area-inset-top))] sm:pb-4 select-none touch-pan-y transition-opacity duration-200 ${
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
        className={`relative z-[45] max-w-[1440px] w-full mx-auto px-3 sm:px-8 flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pointer-events-none ${
          isBackgrounded ? "hidden" : ""
        }`}
      >
          <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-ivory-muted truncate">
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
          <div className="hidden sm:block text-xs font-mono text-ivory-subtle truncate">
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
        <div className="pointer-events-auto self-start sm:self-auto flex items-center gap-0.5 sm:gap-1 p-1 rounded-full border border-obsidian-border bg-obsidian-surface/85 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => {
              if (!isCrewMode) setTimelineMode("crew", 0);
            }}
            className={`inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-mono transition-all ${
              isCrewMode
                ? "bg-rec text-obsidian font-bold shadow-[0_0_18px_rgba(255,77,0,0.4)]"
                : "text-ivory-muted hover:text-ivory"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>THÀNH VIÊN [{crewMembers.length}]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isCrewMode) setTimelineMode("works", 0);
            }}
            className={`inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-mono transition-all ${
              !isCrewMode
                ? "bg-rec text-obsidian font-bold shadow-[0_0_18px_rgba(255,77,0,0.4)]"
                : "text-ivory-muted hover:text-ivory"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>DỰ ÁN [{workProjects.length}]</span>
          </button>
        </div>
      </div>

      {/* Center 3D WebGL Carousel Stage + Floating Info & Context Pills */}
      <div
        ref={carouselGestureAreaRef}
        className="relative flex-1 w-full min-h-0 flex items-center justify-center"
      >
        {/* Keep Drei Html video previews above the fixed 3D canvas and below the HUD. */}
        <div className="absolute inset-0 z-[41]">
          <TimelineCarousel3DView />
        </div>

        {/* Left Info Card & Right Floating Glass Pills (z-[45] above z-40 3D Canvas, strictly below z-50 Modal) */}
        <div
          className={`relative z-[45] w-full max-w-[1280px] mx-auto px-4 sm:px-8 h-full pointer-events-none flex flex-col md:flex-row items-end md:items-center justify-end md:justify-between pb-3 md:pb-0 ${
            isBackgrounded ? "hidden" : ""
          }`}
        >
          {isCrewMode && activeMember ? (
            <Link
              href={`/crew/${activeMember.slug}`}
              scroll={false}
              onClick={() => soundEngine.playShutter()}
              aria-label={`Mở hồ sơ ${activeMember.name}`}
              title={`Mở hồ sơ ${activeMember.name}`}
              className="pointer-events-auto absolute left-1/2 top-[calc(50%_+_7rem)] z-[46] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-rec drop-shadow-[0_0_12px_rgba(255,77,0,0.9)] transition-transform hover:scale-110 focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rec sm:top-[calc(50%_+_11rem)] lg:top-[calc(50%_+_12rem)]"
            >
              <MousePointerClick className="cursor-click-hint h-8 w-8" aria-hidden="true" />
            </Link>
          ) : null}

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

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/crew/${activeMember.slug}`}
                    scroll={false}
                    onClick={() => soundEngine.playShutter()}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors"
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    <span>MỞ HỒ SƠ &amp; THẺ 3D</span>
                  </Link>

                  <Link
                    href={`/works?member=${activeMember.slug}`}
                    onClick={() => soundEngine.playTick(0.8)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 bg-obsidian/70 hover:border-rec/60 text-ivory-muted hover:text-ivory font-mono text-xs transition-colors"
                  >
                    <Film className="w-3.5 h-3.5 text-rec" />
                    <span>PROJECTS</span>
                  </Link>
                </div>
              </div>

              {/* Right Floating Frosted-Glass Member Context Pills (Desktop & Tablet) */}
              <div className="hidden md:block md:ml-auto md:mr-[5%] lg:mr-[8%]">
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

              {/* Right Floating Frosted-Glass Crew Credit Pills (Desktop & Tablet) */}
              <div className="hidden md:block md:ml-auto md:mr-[6%] lg:mr-[10%]">
                <CrewCreditPills work={activeWork} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compact Mobile/Tablet Active Spotlight Pill (< 1024px) */}
      <div
        className={`relative z-[45] lg:hidden px-4 pb-2 ${
          isBackgrounded ? "hidden" : ""
        }`}
      >
        <div className="max-w-lg mx-auto rounded-2xl border border-white/12 bg-obsidian-surface/90 backdrop-blur-xl px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-xl">
          {isCrewMode ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={activeMember.avatar}
                  alt={activeMember.name}
                  className="w-9 h-9 rounded-full object-cover object-[50%_18%] border shrink-0"
                  style={{ borderColor: activeAccentColor }}
                />
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-rec font-bold truncate">
                    #{activeMember.badgeNumber} • {activeMember.roleTitle.toUpperCase()}
                  </div>
                  <div className="font-display text-sm font-bold text-ivory truncate">
                    {activeMember.name}
                  </div>
                </div>
              </div>
              <Link
                href={`/crew/${activeMember.slug}`}
                scroll={false}
                onClick={() => soundEngine.playShutter()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rec text-obsidian font-mono font-bold text-[11px] shrink-0"
              >
                <IdCard className="w-3.5 h-3.5" />
                <span>THẺ 3D</span>
              </Link>
            </>
          ) : (
            <>
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-rec font-bold truncate uppercase">
                  SCENE {activeWork.indexLabel} • {activeWork.category}
                </div>
                <div className="font-display text-sm font-bold text-ivory truncate">
                  {activeWork.title}
                </div>
              </div>
              <Link
                href={`/works/${activeWork.slug}`}
                scroll={false}
                onClick={() => soundEngine.playShutter()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rec text-obsidian font-mono font-bold text-[11px] shrink-0"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>XEM DỰ ÁN</span>
              </Link>
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
