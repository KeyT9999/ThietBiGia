"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Volume2, VolumeX, Menu, X } from "lucide-react";
import { CREW_MEMBERS } from "@/data/crew";
import { useAppStore } from "@/lib/store";
import { soundEngine } from "@/lib/sound";

export function Navbar() {
  const pathname = usePathname();
  const soundMuted = useAppStore((s) => s.soundMuted);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const [liveTime, setLiveTime] = useState("21:00:00");
  const [mobileOpen, setMobileOpen] = useState(false);

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
      label: "TIMELINE 3D",
      match: (p: string) => p === "/" || p.startsWith("/works"),
    },
    {
      href: "/crew",
      label: `CREW [${CREW_MEMBERS.length}]`,
      match: (p: string) => p.startsWith("/crew"),
    },
    { href: "/about", label: "ABOUT & GEAR", match: (p: string) => p.startsWith("/about") },
    { href: "/contact", label: "CONTACT", match: (p: string) => p.startsWith("/contact") },
  ];

  return (
    <header className="fixed top-3 left-3 right-3 sm:left-5 sm:right-5 z-[60]">
      <div className="mx-auto max-w-[1680px] rounded-xl border border-obsidian-border/90 bg-obsidian-surface/80 backdrop-blur-xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        {/* Left descriptor */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            onClick={() => soundEngine.playHover()}
            className="flex items-center gap-2.5 group"
          >
            <span className="w-7 h-7 rounded-md bg-rec text-obsidian font-display font-extrabold text-xs flex items-center justify-center tracking-tighter group-hover:scale-105 transition-transform">
              TBG
            </span>
            <span className="hidden lg:inline-block text-xs font-mono tracking-[0.18em] text-ivory-muted uppercase truncate">
              Creative Media &amp; Design Collective
            </span>
          </Link>
        </div>

        {/* Center Brand Wordmark */}
        <Link
          href="/"
          className="font-display font-bold text-base sm:text-lg tracking-[0.08em] text-ivory hover:text-rec transition-colors shrink-0"
        >
          THIẾT BỊ GIA
        </Link>

        {/* Right Nav + Sound + Live Time */}
        <div className="flex items-center gap-2 sm:gap-5">
          <nav className="hidden md:flex items-center gap-1">
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

          <div className="h-4 w-[1px] bg-obsidian-border hidden md:block" />

          <button
            type="button"
            onClick={toggleSound}
            title={soundMuted ? "Bật âm thanh tương tác" : "Tắt âm thanh tương tác"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
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
            className="md:hidden p-1.5 rounded-lg border border-obsidian-border text-ivory"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden mt-2 rounded-xl border border-obsidian-border bg-obsidian-surface/95 backdrop-blur-xl p-3 flex flex-col gap-1 shadow-2xl">
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
  );
}
