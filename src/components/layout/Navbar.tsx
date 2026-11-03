"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Volume2, VolumeX, Menu, X, UserRound } from "lucide-react";
import { getTotalArchiveProjectCount } from "@/data/works";
import { useAppStore, useAuthenticatedMemberId, useSiteContent } from "@/lib/store";
import { soundEngine } from "@/lib/sound";
import { normalizeNavigationOrder } from "@/lib/navigation-order";
import { BrandLogo } from "./BrandLogo";

export function Navbar() {
  const pathname = usePathname();
  const siteContent = useSiteContent();
  const authenticatedMemberId = useAuthenticatedMemberId();
  const loggedInMember = authenticatedMemberId
    ? siteContent.crew.find((member) => member.id === authenticatedMemberId) ?? null
    : null;
  const settings = siteContent.settings;
  const partnerCount = new Set([
    ...siteContent.partnerOrganizations.map((organization) => organization.id),
    ...siteContent.crew.flatMap((member) => (member.partnerOrganizations ?? []).map((organization) => organization.id)),
  ]).size;
  const soundMuted = useAppStore((s) => s.soundMuted);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const isOverlayOpen = useAppStore((s) => s.isOverlayOpen);
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

  const allNavItems = [
    {
      id: "timeline",
      href: "/",
      label: settings.navTimelineLabel || "TIMELINE 3D",
      match: (p: string) => p === "/",
    },
    {
      id: "projects",
      href: "/works",
      label: (settings.navProjectsLabel || "PROJECTS") + " [" + getTotalArchiveProjectCount(siteContent.works, siteContent.crew) + "]",
      match: (p: string) => p.startsWith("/works"),
    },
    {
      id: "crew",
      href: "/crew",
      label: (settings.navCrewLabel || "CREW") + " [" + siteContent.crew.length + "]",
      match: (p: string) => p.startsWith("/crew"),
    },
    {
      id: "partners",
      href: "/partners",
      label: (settings.navPartnersLabel || "ĐƠN VỊ ĐỒNG HÀNH") + " [" + partnerCount + "]",
      match: (p: string) => p.startsWith("/partners"),
    },
    { id: "about", href: "/about", label: settings.navAboutLabel || "ABOUT & GEAR", match: (p: string) => p.startsWith("/about") },
    { id: "contact", href: "/contact", label: settings.navContactLabel || "CONTACT", match: (p: string) => p.startsWith("/contact") },
  ];
  const navItems = normalizeNavigationOrder(settings.navOrder)
    .map((id) => allNavItems.find((item) => item.id === id))
    .filter((item): item is (typeof allNavItems)[number] => Boolean(item));

  if (pathname.startsWith("/admin") || pathname.startsWith("/member")) return null;

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
        {/* Brand wordmark beside the logo */}
        <Link
          href="/"
          aria-label="Về trang chủ Thiết Bị Gia"
          onClick={() => soundEngine.playHover()}
          className="group flex min-w-0 shrink-0 items-center gap-2.5"
        >
          <BrandLogo />
          <span className="min-w-0">
            <span className="block truncate font-display text-[12px] font-bold tracking-[0.025em] text-ivory transition-colors group-hover:text-rec min-[390px]:text-sm sm:text-base">
              {settings.brandName || "THIẾT BỊ GIA"}
            </span>
            <span className="hidden truncate font-mono text-[9px] uppercase tracking-[0.12em] text-ivory-muted 2xl:block">
              {settings.brandSubtitle || "Creative Media & Design Collective"}
            </span>
          </span>
        </Link>

        {/* Right Nav + Sound + Live Time */}
        <div className="flex items-center gap-1 sm:gap-2 xl:gap-2 2xl:gap-4 shrink-0">
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => soundEngine.playHover()}
                  className={`relative px-2 py-1.5 text-xs font-mono tracking-wider whitespace-nowrap transition-colors rounded-md 2xl:px-3 ${
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

          <div className="h-4 w-[1px] bg-obsidian-border hidden xl:block" />

          {loggedInMember ? (
            <Link
              href="/member/profile"
              prefetch={false}
              title={`Mở Member Studio của ${loggedInMember.name}`}
              className="hidden sm:inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1.5 text-[10px] font-mono font-semibold text-ivory transition-colors hover:border-rec hover:bg-rec/15"
            >
              {loggedInMember.avatar ? (
                <img
                  src={loggedInMember.avatar}
                  alt=""
                  className="h-5 w-5 rounded-full border border-emerald-400/60 object-cover"
                />
              ) : (
                <UserRound className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span className="max-w-[115px] truncate uppercase">
                {(loggedInMember.nickname ?? loggedInMember.name.split(" ").slice(-1)[0]).toUpperCase()} • STUDIO
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </Link>
          ) : (
            <Link
              href="/member"
              prefetch={false}
              title="Đăng nhập dành cho thành viên"
              className="hidden xl:inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-obsidian-border bg-obsidian/70 px-2.5 py-1.5 text-[10px] font-mono text-ivory-muted transition-colors hover:border-rec/60 hover:text-ivory"
            >
              <UserRound className="h-3.5 w-3.5 text-rec" /> MEMBER
            </Link>
          )}

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
            <span className="hidden 2xl:inline">{soundMuted ? "MUTED" : "SFX ON"}</span>
          </button>

          <div className="hidden 2xl:flex items-center gap-1.5 text-xs font-mono text-ivory-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{liveTime}</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="xl:hidden min-w-10 min-h-10 flex items-center justify-center p-1.5 rounded-lg border border-obsidian-border text-ivory"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="xl:hidden mt-2 rounded-xl border border-obsidian-border bg-obsidian-surface/95 backdrop-blur-xl p-3 flex flex-col gap-1 shadow-2xl">
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
          {loggedInMember ? (
            <Link
              href="/member/profile"
              prefetch={false}
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-400/10 px-3 py-2.5 text-xs font-mono font-semibold text-ivory hover:border-rec"
            >
              <UserRound className="h-4 w-4 text-emerald-400" />
              <span>MEMBER STUDIO ({loggedInMember.nickname ?? loggedInMember.name})</span>
            </Link>
          ) : (
            <Link
              href="/member"
              prefetch={false}
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-lg border border-rec/20 bg-rec/[0.06] px-3 py-2.5 text-xs font-mono text-ivory hover:border-rec"
            >
              <UserRound className="h-4 w-4 text-rec" />
              <span>ĐĂNG NHẬP MEMBER</span>
            </Link>
          )}
        </div>
      )}
      </header>
    </>
  );
}
