"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Volume2, VolumeX, Menu, X, Search } from "lucide-react";
import { useAppStore, useSiteContent } from "@/lib/store";
import { soundEngine } from "@/lib/sound";

export function Navbar() {
  const pathname = usePathname();
  const siteContent = useSiteContent();
  const settings = siteContent.settings;
  const soundMuted = useAppStore((s) => s.soundMuted);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const isOverlayOpen = useAppStore((s) => s.isOverlayOpen);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const [liveTime, setLiveTime] = useState("21:00:00");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isScrollableView = isOverlayOpen || pathname !== "/";

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString("vi-VN", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  const navItems = [
    {
      href: "/",
      label: settings.navTimelineLabel || "TIMELINE 3D",
      match: (p: string) => p === "/",
    },
    {
      href: "/works",
      label: (settings.navProjectsLabel || "PROJECTS") + " [" + siteContent.works.length + "]",
      match: (p: string) => p.startsWith("/works"),
    },
    {
      href: "/crew",
      label: (settings.navCrewLabel || "CREW") + " [" + siteContent.crew.length + "]",
      match: (p: string) => p.startsWith("/crew"),
    },
    { href: "/about", label: settings.navAboutLabel || "ABOUT & GEAR", match: (p: string) => p.startsWith("/about") },
    { href: "/contact", label: settings.navContactLabel || "CONTACT", match: (p: string) => p.startsWith("/contact") },
  ];

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Top Studio Header Shield (0..72px, z-[55]): prevents scrolling content or z-40 WebGL Views from peeking above the floating Navbar */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 inset-x-0 h-[72px] z-[55] transition-colors duration-200 ${
          isScrollableView
            ? "bg-obsidian/95 backdrop-blur-xl"
            : "bg-gradient-to-b from-obsidian/80 to-transparent"
        }`}
      />

      <header className="fixed top-[max(0.625rem,env(safe-area-inset-top))] left-[max(0.5rem,env(safe-area-inset-left))] right-[max(0.5rem,env(safe-area-inset-right))] sm:top-3 sm:left-5 sm:right-5 z-[60]">
      <div className="mx-auto max-w-[1680px] rounded-xl border border-obsidian-border/90 bg-obsidian-surface/90 backdrop-blur-xl px-2.5 min-[390px]:px-3.5 sm:px-6 h-14 flex items-center justify-between gap-1.5 sm:gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        {/* Left descriptor */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <Link
            href="/"
            onClick={() => soundEngine.playHover()}
            className="flex items-center gap-2.5 group"
          >
            <span className="w-7 h-7 rounded-md bg-rec text-obsidian font-display font-extrabold text-xs flex items-center justify-center tracking-tighter group-hover:scale-105 transition-transform">
              TBG
            </span>
            <span className="hidden lg:inline-block text-xs font-mono tracking-[0.18em] text-ivory-muted uppercase truncate">
              {settings.brandSubtitle || "Creative Media & Design Collective"}
            </span>
          </Link>
        </div>

        {/* Center Brand Wordmark */}
        <Link
          href="/"
          className="font-display font-bold text-[13px] min-[390px]:text-sm sm:text-lg tracking-[0.025em] sm:tracking-[0.08em] text-ivory hover:text-rec transition-colors shrink-0"
        >
          {settings.brandName || "THIẾT BỊ GIA"}
        </Link>

        {/* Right Nav + Sound + Live Time */}
        <div className="flex items-center gap-1 sm:gap-2 xl:gap-5 shrink-0">
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => soundEngine.playHover()}
                  className={`relative px-3 py-1.5 text-xs font-mono tracking-wider transition-colors rounded-md ${
                    active
                      ? "text-ivory font-semibold bg-white/[0.06]"
                      : "text-ivory-muted hover:text-ivory"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-[2px] bg-rec rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="h-4 w-[1px] bg-obsidian-border hidden lg:block" />

          <button
            type="button"
            onClick={() => {
              soundEngine.playTick(0.85);
              setCommandPaletteOpen(true);
            }}
            title="Tìm nhanh Thành viên, Dự án & Thiết bị (Ctrl+K)"
            className="min-w-10 min-h-10 flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-obsidian-border bg-obsidian/70 hover:border-rec/60 text-xs font-mono text-ivory-muted hover:text-ivory transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-rec" />
            <span className="hidden lg:inline">CTRL+K</span>
          </button>

          <button
            type="button"
            onClick={toggleSound}
            title={soundMuted ? "Bật âm thanh tương tác" : "Tắt âm thanh tương tác"}
            className={`min-w-10 min-h-10 flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              soundMuted
                ? "border-obsidian-border text-ivory-subtle bg-obsidian/50"
                : "border-rec/40 text-ivory bg-rec/10 hover:bg-rec/20"
            }`}
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-rec" />}
            <span className="hidden xl:inline">{soundMuted ? "MUTED" : "SFX ON"}</span>
          </button>

          <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-ivory-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{liveTime}</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden min-w-10 min-h-10 flex items-center justify-center p-1.5 rounded-lg border border-obsidian-border text-ivory"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden mt-2 rounded-xl border border-obsidian-border bg-obsidian-surface/95 backdrop-blur-xl p-3 flex flex-col gap-1 shadow-2xl">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-xs font-mono tracking-wider ${
                  active ? "bg-rec text-obsidian font-bold" : "text-ivory-muted hover:text-ivory"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
      </header>
    </>
  );
}
