"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Aperture, Clapperboard, Cpu, Layers, Sparkles } from "lucide-react";
import { GEAR_ARSENAL } from "@/data/gear";
import { CREW_MEMBERS } from "@/data/crew";
import { WORKS_DATA } from "@/data/works";
import { soundEngine } from "@/lib/sound";
import { FilmStripArchive } from "@/components/about/FilmStripArchive";

gsap.registerPlugin(ScrollTrigger);

export default function AboutGearPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".about-reveal", {
        y: 32,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });

      gsap.utils.toArray<HTMLElement>(".gear-card").forEach((card) => {
        gsap.from(card, {
          y: 36,
          opacity: 0,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
          },
        });
      });
    },
    { scope: containerRef }
  );

  const pillars = [
    {
      icon: Aperture,
      code: "01 // PHOTOGRAPHY",
      title: "Nhiếp Ảnh Thương Mại & Sự Kiện",
      desc: "Từ Studio Lookbook 102MP Medium Format, kiến trúc Tilt-Shift đến đại nhạc hội hàng chục nghìn khán giả trả ảnh realtime.",
    },
    {
      icon: Clapperboard,
      code: "02 // CINEMATOGRAPHY",
      title: "Quay Phim Điện Ảnh & FPV",
      desc: "Làm chủ ngôn ngữ ống kính Anamorphic, hệ thống đèn CRMX công suất lớn, Car-Rig tốc độ cao và Drone FPV xuyên không gian.",
    },
    {
      icon: Layers,
      code: "03 // POST-PRODUCTION",
      title: "Dựng Phim, Color Grading & Sound",
      desc: "Quy trình hậu kỳ chuẩn ACEScct trên DaVinci Resolve, dựng Same-Day Edit thần tốc ngay tại hiện trường và thiết kế âm thanh.",
    },
    {
      icon: Cpu,
      code: "04 // DESIGN & 3D MOTION",
      title: "Art Direction, Key Visual & VFX",
      desc: "Xây dựng trọn vẹn bộ nhận diện chiến dịch, thiết kế sân khấu LED 8K, 3D CGI và poster chuẩn lưới đồ họa hiện đại.",
    },
  ];

  return (
    <div ref={containerRef} className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-28 pb-24 space-y-20">
      {/* Hero Story */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end border-b border-obsidian-border pb-14">
        <div className="lg:col-span-8 space-y-5">
          <div className="about-reveal inline-flex items-center gap-2 text-xs font-mono text-rec uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MANIFESTO // CÂU CHUYỆN THIẾT BỊ GIA</span>
          </div>
          <h1 className="about-reveal font-display text-4xl sm:text-6xl font-bold text-ivory leading-[1.06] tracking-tight">
            NƠI NHỮNG NGƯỜI CẦM MÁY &amp; LÀM HÌNH HỌP THÀNH MỘT GIA ĐÌNH.
          </h1>
          <p className="about-reveal text-base sm:text-lg text-ivory-muted leading-relaxed max-w-3xl">
            <strong className="text-ivory">Thiết Bị Gia</strong> khởi nguồn từ niềm đam mê chung với từng vòng xoay tiêu cự, từng dải sáng và nhịp cắt khung hình. Không chỉ là một nhóm làm nghề đơn lẻ, tụi mình vận hành như một{" "}
            <span className="text-ivory">Creative Collective</span> đa chuyên môn — nơi mỗi dự án là sự bắt tay ăn ý giữa Photographer, DOP, Gaffer, Editor và Designer.
          </p>
        </div>

        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="about-reveal rounded-2xl border border-obsidian-border bg-obsidian-surface p-5">
            <div className="font-display text-4xl font-bold text-rec">
              {CREW_MEMBERS.length}+
            </div>
            <div className="text-xs font-mono text-ivory-muted mt-1 uppercase">
              Thành viên chuyên môn
            </div>
          </div>
          <div className="about-reveal rounded-2xl border border-obsidian-border bg-obsidian-surface p-5">
            <div className="font-display text-4xl font-bold text-ivory">
              {WORKS_DATA.length}0+
            </div>
            <div className="text-xs font-mono text-ivory-muted mt-1 uppercase">
              Chiến dịch &amp; Set quay
            </div>
          </div>
          <div className="about-reveal col-span-2 rounded-2xl border border-obsidian-border bg-obsidian-surface p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-rec">FULL PIPELINE</div>
              <div className="text-sm font-semibold text-ivory mt-0.5">
                Tiền kỳ → Hiện trường → Hậu kỳ 4K RAW
              </div>
            </div>
            <Link
              href="/crew"
              onClick={() => soundEngine.playShutter()}
              className="px-3.5 py-2 rounded-lg bg-rec text-obsidian font-mono font-bold text-xs hover:bg-rec-glow transition-colors"
            >
              GẶP EKIP →
            </Link>
          </div>
        </div>
      </section>

      {/* Idea 4: 35mm Kodak Portra 400 Film Strip Contact Sheet */}
      <FilmStripArchive />

      {/* 4 Core Disciplines */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ivory">
            BỐN MŨI NHỌN CỦA NHÓM
          </h2>
          <span className="text-xs font-mono text-ivory-subtle hidden sm:inline">
            DISCIPLINES // 01 — 04
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.code}
                className="gear-card rounded-2xl border border-obsidian-border bg-obsidian-surface p-6 space-y-4 hover:border-rec/60 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-rec/12 border border-rec/30 flex items-center justify-center text-rec">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono text-ivory-subtle">{p.code}</div>
                <h3 className="font-display text-xl font-bold text-ivory leading-snug">
                  {p.title}
                </h3>
                <p className="text-sm text-ivory-muted leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* GEAR ARSENAL */}
      <section className="space-y-8">
        <div className="space-y-2">
          <div className="text-xs font-mono text-rec uppercase tracking-widest">
            EQUIPMENT LOCKER // VŨ KHÍ TÁC NGHIỆP
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory">
            KHO THIẾT BỊ CHỦ LỰC CỦA THIẾT BỊ GIA
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {GEAR_ARSENAL.map((group) => (
            <div
              key={group.id}
              className="gear-card rounded-2xl border border-obsidian-border bg-obsidian-surface p-6 sm:p-8 space-y-5"
            >
              <div>
                <div className="text-xs font-mono text-rec">{group.code}</div>
                <h3 className="font-display text-2xl font-bold text-ivory mt-1">
                  {group.title}
                </h3>
                <p className="text-sm text-ivory-muted mt-1">{group.subtitle}</p>
              </div>

              <div className="divide-y divide-obsidian-border">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-ivory">{item.name}</div>
                      <div className="text-xs font-mono text-ivory-muted mt-0.5">
                        {item.spec}
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded bg-obsidian border border-obsidian-border text-xs font-mono text-rec">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-3xl border border-rec/40 bg-gradient-to-r from-obsidian-surface via-obsidian-elevated to-obsidian-surface p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="text-xs font-mono text-rec uppercase tracking-widest">
            READY FOR SET
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ivory">
            Cần một Photographer riêng lẻ hay trọn gói cả Ekip Sản Xuất?
          </h2>
          <p className="text-sm text-ivory-muted">
            Chọn đúng người hoặc để Thiết Bị Gia ráp đội hình phù hợp nhất cho dự án của bạn.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            onClick={() => soundEngine.playShutter()}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-xs transition-colors"
          >
            <span>ĐẶT LỊCH EKIP NGAY</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-obsidian-border bg-obsidian hover:border-ivory/40 text-ivory font-mono text-xs transition-colors"
          >
            <span>XEM TIMELINE 3D</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
