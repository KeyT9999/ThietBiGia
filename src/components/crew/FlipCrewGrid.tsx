"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ArrowUpRight, Search, Users } from "lucide-react";
import { CREW_MEMBERS } from "@/data/crew";
import { getWorksForMember } from "@/data/works";
import { getRoleMeta, ROLE_STYLES, type RoleCategory } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import { StopMotionGroupHero } from "./StopMotionGroupHero";

gsap.registerPlugin(Flip);

export function FlipCrewGrid() {
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  const captureFlip = () => {
    if (!gridRef.current) return;
    const targets = gridRef.current.querySelectorAll(".crew-flip-card");
    flipStateRef.current = Flip.getState(targets);
  };

  useLayoutEffect(() => {
    if (!flipStateRef.current || !gridRef.current) return;
    Flip.from(flipStateRef.current, {
      targets: gridRef.current.querySelectorAll(".crew-flip-card"),
      duration: 0.52,
      ease: "power3.out",
      scale: true,
      stagger: 0.018,
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 0.38, ease: "power2.out" }
        ),
      onLeave: (elements) =>
        gsap.to(elements, { opacity: 0, scale: 0.88, duration: 0.28 }),
    });
    flipStateRef.current = null;
  }, [selectedRole, query]);

  const roleCounts = CREW_MEMBERS.reduce<Record<string, number>>((acc, m) => {
    m.roles.forEach((r) => {
      acc[r] = (acc[r] ?? 0) + 1;
    });
    return acc;
  }, {});

  const handleFilterChange = (role: string) => {
    if (role === selectedRole) return;
    soundEngine.playTick(0.85);
    captureFlip();
    setSelectedRole(role);
  };

  const normalizedQuery = query.trim().toLowerCase();

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-8 pt-28 pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-obsidian-border pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-rec uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            <span>THIẾT BỊ GIA // OFFICIAL MEMBER ROSTER</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ivory tracking-tight">
            ANH EM THIẾT BỊ GIA [{CREW_MEMBERS.length}]
          </h1>
          <p className="text-sm sm:text-base text-ivory-muted max-w-2xl">
            Danh sách chính thức các thành viên mảng Chụp ảnh, Quay phim và IT của Thiết Bị Gia. Nhấn vào bất kỳ thành viên nào để mở{" "}
            <span className="text-ivory font-medium">Thẻ Tác Nghiệp 3D</span> &amp; hồ sơ cá nhân.
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
            placeholder="Tìm tên thành viên, Quay phim, IT..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-obsidian-border bg-obsidian-surface text-sm text-ivory placeholder:text-ivory-subtle focus:outline-none focus:border-rec transition-colors"
          />
        </div>
      </div>

      {/* Idea 1: 2-Frame Stop-Motion Group Hero Banner */}
      <StopMotionGroupHero />

      {/* Multi-Role Filter Pills Bar (GSAP Flip Powered) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleFilterChange("ALL")}
          className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all ${
            selectedRole === "ALL"
              ? "bg-rec text-obsidian shadow-[0_0_20px_rgba(255,77,0,0.4)]"
              : "border border-obsidian-border bg-obsidian-surface text-ivory-muted hover:text-ivory"
          }`}
        >
          TẤT CẢ [{CREW_MEMBERS.length}]
        </button>

        {(Object.keys(ROLE_STYLES) as RoleCategory[]).map((cat) => {
          const meta = ROLE_STYLES[cat];
          const active = selectedRole === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleFilterChange(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono font-semibold transition-all border ${
                active
                  ? "text-obsidian border-transparent font-bold"
                  : "border-obsidian-border bg-obsidian-surface text-ivory-muted hover:text-ivory"
              }`}
              style={active ? { backgroundColor: meta.color } : undefined}
            >
              {meta.label.toUpperCase()} [{roleCounts[cat] ?? 0}]
            </button>
          );
        })}
      </div>

      {/* Crew Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {CREW_MEMBERS.map((member) => {
          const matchesRole =
            selectedRole === "ALL" ||
            member.roles.includes(selectedRole as RoleCategory);
          const matchesSearch =
            !normalizedQuery ||
            member.name.toLowerCase().includes(normalizedQuery) ||
            member.roleTitle.toLowerCase().includes(normalizedQuery) ||
            member.favoriteGear.some((g) => g.toLowerCase().includes(normalizedQuery));

          const visible = matchesRole && matchesSearch;
          const campaignCount = getWorksForMember(member.slug).length;

          return (
            <div
              key={member.id}
              style={{ display: visible ? "block" : "none" }}
              className="crew-flip-card"
            >
              <Link
                href={`/crew/${member.slug}`}
                onClick={() => soundEngine.playShutter()}
                className="group block h-full rounded-2xl border border-obsidian-border bg-obsidian-surface hover:border-rec/70 overflow-hidden transition-colors"
              >
                <div className="relative aspect-[4/4.5] overflow-hidden bg-obsidian">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className={`w-full h-full object-cover object-[50%_18%] group-hover:scale-105 transition-all duration-500 ${
                      member.avatarAlt ? "group-hover:opacity-0" : ""
                    }`}
                  />
                  {member.avatarAlt && (
                    <img
                      src={member.avatarAlt}
                      alt={`${member.name} — Pose 2`}
                      className="absolute inset-0 w-full h-full object-cover object-[50%_18%] opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-surface via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-obsidian/80 backdrop-blur-md border border-white/10 text-xs font-mono text-ivory shrink-0">
                      #{member.badgeNumber}
                    </span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {member.roles.map((r) => {
                        const rMeta = getRoleMeta(r);
                        return (
                          <span
                            key={r}
                            className="px-2 py-0.5 rounded-full text-xs font-mono font-bold text-obsidian"
                            style={{ backgroundColor: rMeta.color }}
                          >
                            {rMeta.shortLabel}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-display text-lg font-bold text-ivory group-hover:text-rec transition-colors leading-snug">
                        {member.name}
                      </h2>
                      <p className="text-xs font-mono text-ivory-muted mt-0.5">
                        {member.roleTitle}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-ivory-subtle group-hover:text-rec group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 mt-1" />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {member.favoriteGear.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded bg-obsidian border border-obsidian-border text-xs font-mono text-ivory-muted"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-obsidian-border/70 flex items-center justify-between text-xs font-mono text-ivory-subtle">
                    <span>{campaignCount} dự án nhóm</span>
                    <span className="text-rec font-semibold">MỞ THẺ 3D →</span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
