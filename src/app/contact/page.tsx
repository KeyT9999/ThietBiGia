"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Film,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { CREW_MEMBERS } from "@/data/crew";
import { getWorkBySlug } from "@/data/works";
import { soundEngine } from "@/lib/sound";
import { getCombinedRoleBadge, getRoleMeta, type RoleCategory } from "@/lib/utils";

const SERVICE_OPTIONS = [
  "Trọn gói Ekip Quay & Chụp",
  "Photographer (Thời trang / Sự kiện / Sản phẩm)",
  "Quay MV / TVC / Phim ngắn (DOP & Cam)",
  "Dựng Video, Color Grading & Same-Day Edit",
  "Key Visual, 3D Motion & Thiết kế Sân khấu",
  "Hỗ trợ Lighting, Gaffer & Thiết bị",
];

type RoleFilter = "all" | RoleCategory;

export default function ContactBookingPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Trọn gói Ekip Quay & Chụp",
  ]);
  const [selectedCrewSlugs, setSelectedCrewSlugs] = useState<string[]>([]);
  const [crewFilter, setCrewFilter] = useState<RoleFilter>("all");
  const [projectRef, setProjectRef] = useState<string>("");

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [dateInfo, setDateInfo] = useState("");
  const [brief, setBrief] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<{
    referenceCode: string;
    squadNames: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Hydrate pre-selected crew or referenced project from URL query (?crew=slug1,slug2&project=slug)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const crewParam = params.get("crew");
    const projParam = params.get("project");

    if (crewParam) {
      const validSlugs = crewParam
        .split(",")
        .map((s) => s.trim())
        .filter((slug) => CREW_MEMBERS.some((m) => m.slug === slug));
      if (validSlugs.length > 0) {
        setSelectedCrewSlugs(Array.from(new Set(validSlugs)));
      }
    }

    if (projParam) {
      setProjectRef(projParam);
      const refWork = getWorkBySlug(projParam);
      if (refWork) {
        setBrief((prev) =>
          prev
            ? prev
            : `Tham khảo tone & quy mô từ dự án "${refWork.title}" (${refWork.category}). Mong muốn trao đổi thêm về lịch bấm máy:`
        );
      }
    }
  }, []);

  const selectedCrewMembers = useMemo(
    () =>
      selectedCrewSlugs
        .map((slug) => CREW_MEMBERS.find((m) => m.slug === slug))
        .filter((m): m is (typeof CREW_MEMBERS)[number] => Boolean(m)),
    [selectedCrewSlugs]
  );

  const filteredCrew = useMemo(() => {
    if (crewFilter === "all") return CREW_MEMBERS;
    return CREW_MEMBERS.filter((m) => m.roles.includes(crewFilter));
  }, [crewFilter]);

  const refWorkObj = useMemo(
    () => (projectRef ? getWorkBySlug(projectRef) : undefined),
    [projectRef]
  );

  const toggleService = (service: string) => {
    soundEngine.playTick(0.8);
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.length > 1 ? prev.filter((s) => s !== service) : prev;
      }
      return [...prev, service];
    });
  };

  const toggleCrewMember = (slug: string) => {
    soundEngine.playTick(0.85);
    setSelectedCrewSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    soundEngine.playShutter();

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          dateInfo,
          services: selectedServices,
          crewSlugs: selectedCrewSlugs,
          projectRef,
          brief,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setSubmitError(json.error ?? "Không thể gửi phiếu lúc này. Vui lòng thử lại.");
      } else {
        setTicketResult({
          referenceCode: json.referenceCode,
          squadNames: json.squadNames ?? [],
        });
      }
    } catch {
      setSubmitError("Lỗi kết nối mạng. Vui lòng thử lại hoặc liên hệ trực tiếp qua Hotline.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard?.writeText("booking@thietbigia.vn");
    soundEngine.playTick(0.9);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyTicketRef = (code: string) => {
    navigator.clipboard?.writeText(code);
    soundEngine.playTick(0.9);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="max-w-[1420px] mx-auto px-4 sm:px-8 pt-28 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Info & Live Squad Summary Column */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-rec uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CALL SHEET // SQUAD BUILDER DESK</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ivory leading-tight tracking-tight">
              LÊN LỊCH BẤM MÁY CÙNG THIẾT BỊ GIA.
            </h1>
            <p className="text-sm sm:text-base text-ivory-muted leading-relaxed">
              Tự tay lắp ráp <span className="text-ivory font-medium">đội hình thành viên yêu thích</span>{" "}
              hoặc để Producer đề xuất tổ hợp nhân sự + gói thiết bị tối ưu trong vòng 24 giờ.
            </p>
          </div>

          {/* Live Assembled Squad Manifest Card */}
          <div className="rounded-2xl border border-rec/35 bg-obsidian-surface/90 p-5 space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between gap-2 border-b border-obsidian-border pb-3">
              <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-rec uppercase">
                <Users className="w-4 h-4" />
                <span>
                  ĐỘI HÌNH ĐANG CHỌN [{selectedCrewMembers.length}/{CREW_MEMBERS.length}]
                </span>
              </span>
              {selectedCrewMembers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(0.75);
                    setSelectedCrewSlugs([]);
                  }}
                  className="text-[11px] font-mono text-ivory-muted hover:text-rec transition-colors"
                >
                  ĐẶT LẠI
                </button>
              )}
            </div>

            {selectedCrewMembers.length === 0 ? (
              <p className="text-xs text-ivory-muted leading-relaxed">
                Chưa chỉ định cá nhân cụ thể —{" "}
                <span className="text-ivory">Producer Thiết Bị Gia</span> sẽ tự động phân bổ
                Photographer, DOP &amp; Editor phù hợp nhất với lịch bấm máy của bạn.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedCrewMembers.map((m) => {
                    const meta = getRoleMeta(m.roles[0] ?? m.roleCategory);
                    return (
                      <span
                        key={m.slug}
                        className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-obsidian border border-rec/45 text-xs text-ivory"
                      >
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-6 h-6 rounded-full object-cover object-[50%_18%] border"
                          style={{ borderColor: meta.color }}
                        />
                        <span className="font-medium">{m.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleCrewMember(m.slug)}
                          aria-label={`Bỏ chọn ${m.name}`}
                          className="text-ivory-subtle hover:text-rec"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>

                <div className="rounded-xl bg-obsidian/80 border border-obsidian-border px-3.5 py-2.5 text-[11px] font-mono text-ivory-muted space-y-1">
                  <div className="text-rec font-semibold">
                    GEAR CHỦ LỰC CỦA SQUAD ĐÃ CHỌN:
                  </div>
                  <div className="text-ivory line-clamp-2">
                    {Array.from(
                      new Set(selectedCrewMembers.map((m) => m.favoriteGear[0]).filter(Boolean))
                    ).join(" • ")}
                  </div>
                </div>
              </div>
            )}

            {refWorkObj && (
              <div className="rounded-xl border border-white/10 bg-obsidian px-3.5 py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-rec uppercase flex items-center gap-1.5">
                    <Film className="w-3 h-3" />
                    <span>THAM CHIẾU TỪ DỰ ÁN</span>
                  </div>
                  <div className="text-xs font-semibold text-ivory truncate">
                    {refWorkObj.title}
                  </div>
                </div>
                <Link
                  href={`/works/${refWorkObj.slug}`}
                  className="text-[11px] font-mono text-ivory-muted hover:text-rec shrink-0"
                >
                  XEM LẠI →
                </Link>
              </div>
            )}
          </div>

          {/* Direct Contact Card */}
          <div className="rounded-2xl border border-obsidian-border bg-obsidian-surface p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rec/15 text-rec flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono text-ivory-subtle">EMAIL CHÍNH THỨC</div>
                  <div className="text-sm font-mono font-semibold text-ivory">
                    booking@thietbigia.vn
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={copyEmail}
                className="px-3 py-1.5 rounded-lg border border-obsidian-border bg-obsidian hover:border-rec/60 text-xs font-mono text-ivory-muted hover:text-ivory flex items-center gap-1.5"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? "ĐÃ CHÉP" : "COPY"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rec/15 text-rec flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-mono text-ivory-subtle">HOTLINE SẢN XUẤT</div>
                <div className="text-sm font-mono font-semibold text-ivory">
                  (+84) 909 • TBG • CREW
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rec/15 text-rec flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-mono text-ivory-subtle">TRẠM TẬP KẾT THIẾT BỊ</div>
                <div className="text-sm font-semibold text-ivory">
                  Đà Nẵng &amp; TP. Hồ Chí Minh • Sẵn sàng di chuyển toàn quốc
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Interactive Call-Sheet & Squad Builder Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-obsidian-border bg-obsidian-surface p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-obsidian-border pb-4">
              <span className="font-mono text-xs text-rec font-bold">
                PROJECT BRIEF // PHIẾU ĐẶT LỊCH &amp; CHỌN SQUAD
              </span>
              <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE CALL SHEET
              </span>
            </div>

            {/* 1. Multi-select service modules */}
            <div className="space-y-2.5">
              <label className="block text-xs font-mono text-ivory-muted uppercase">
                1. Hạng mục bạn cần Thiết Bị Gia đồng hành
              </label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((opt) => {
                  const active = selectedServices.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleService(opt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                        active
                          ? "bg-rec text-obsidian border-rec font-bold"
                          : "bg-obsidian border-obsidian-border text-ivory-muted hover:text-ivory"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Interactive 16-Member Squad Picker */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-mono text-ivory-muted uppercase">
                  2. Chỉ định thành viên trong Squad (Tùy chọn)
                </label>

                <div className="flex flex-wrap items-center gap-1">
                  {(
                    [
                      { id: "all", label: `TẤT CẢ [${CREW_MEMBERS.length}]` },
                      { id: "chup-anh", label: "CHỤP ẢNH" },
                      { id: "quay-phim", label: "QUAY PHIM" },
                      { id: "it-tech", label: "IT & KỸ THUẬT" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playTick(0.75);
                        setCrewFilter(tab.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors ${
                        crewFilter === tab.id
                          ? "bg-white/10 text-ivory border-rec/60 font-bold"
                          : "bg-obsidian border-obsidian-border text-ivory-subtle hover:text-ivory"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto pr-1">
                {filteredCrew.map((member) => {
                  const isPicked = selectedCrewSlugs.includes(member.slug);
                  const rMeta = getRoleMeta(member.roles[0] ?? member.roleCategory);

                  return (
                    <button
                      key={member.slug}
                      type="button"
                      onClick={() => toggleCrewMember(member.slug)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                        isPicked
                          ? "border-rec bg-rec/15 shadow-[0_0_20px_rgba(255,77,0,0.18)]"
                          : "border-obsidian-border bg-obsidian hover:border-white/25"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover object-[50%_18%] border"
                          style={{ borderColor: isPicked ? "#FF4D00" : rMeta.color }}
                        />
                        <span className="absolute -bottom-1 -right-1 px-1 rounded bg-obsidian border border-obsidian-border text-[9px] font-mono text-ivory-muted">
                          #{member.badgeNumber}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-ivory truncate">
                          {member.name}
                          {member.nickname ? (
                            <span className="text-rec font-mono ml-1">({member.nickname})</span>
                          ) : null}
                        </div>
                        <div className="text-[10px] font-mono text-ivory-muted truncate uppercase">
                          {getCombinedRoleBadge(member.roles)}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isPicked
                            ? "bg-rec border-rec text-obsidian"
                            : "border-obsidian-border text-transparent"
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 & 4. Client Name + Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-ivory-muted uppercase">
                  3. Tên của bạn / Thương hiệu *
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Nguyễn Minh / Brand X"
                  className="w-full px-4 py-3 rounded-xl border border-obsidian-border bg-obsidian text-sm text-ivory placeholder:text-ivory-subtle focus:outline-none focus:border-rec"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-ivory-muted uppercase">
                  4. Số điện thoại / Zalo / Email *
                </label>
                <input
                  required
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="090xxxxxxx hoặc email@..."
                  className="w-full px-4 py-3 rounded-xl border border-obsidian-border bg-obsidian text-sm text-ivory placeholder:text-ivory-subtle focus:outline-none focus:border-rec"
                />
              </div>
            </div>

            {/* 5. Date & Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-ivory-muted uppercase">
                5. Thời gian dự kiến bấm máy &amp; Địa điểm
              </label>
              <input
                type="text"
                value={dateInfo}
                onChange={(e) => setDateInfo(e.target.value)}
                placeholder="VD: Cuối tháng 11/2026 tại Đà Nẵng / TP.HCM (2 ngày quay)"
                className="w-full px-4 py-3 rounded-xl border border-obsidian-border bg-obsidian text-sm text-ivory placeholder:text-ivory-subtle focus:outline-none focus:border-rec"
              />
            </div>

            {/* 6. Brief */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-ivory-muted uppercase">
                6. Tóm tắt ý tưởng / Moodboard / Yêu cầu đặc biệt
              </label>
              <textarea
                rows={4}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Mô tả ngắn gọn concept, số lượng bối cảnh, link moodboard hoặc yêu cầu thiết bị đặc thù..."
                className="w-full px-4 py-3 rounded-xl border border-obsidian-border bg-obsidian text-sm text-ivory placeholder:text-ivory-subtle focus:outline-none focus:border-rec resize-none"
              />
            </div>

            {submitError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-mono text-red-300">
                {submitError}
              </div>
            )}

            {ticketResult ? (
              <div className="rounded-2xl border border-emerald-500/45 bg-emerald-500/10 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                    <UserCheck className="w-4 h-4" />
                    <span>CALL SHEET ĐÃ KHỞI TẠO THÀNH CÔNG</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyTicketRef(ticketResult.referenceCode)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-obsidian border border-emerald-500/40 text-xs font-mono font-bold text-ivory hover:border-emerald-400"
                  >
                    <span>MÃ PHIẾU: {ticketResult.referenceCode}</span>
                    {copiedRef ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-ivory-muted" />
                    )}
                  </button>
                </div>

                <p className="text-sm text-ivory leading-relaxed">
                  Cảm ơn <span className="font-semibold text-emerald-300">{name}</span>! Producer
                  của Thiết Bị Gia sẽ liên hệ qua{" "}
                  <span className="font-mono font-semibold">{contact}</span> kèm báo giá &amp; lịch
                  trống của ekip.
                </p>

                {ticketResult.squadNames.length > 0 && (
                  <div className="text-xs font-mono text-ivory-muted">
                    Squad đã ghi nhận:{" "}
                    <span className="text-ivory">{ticketResult.squadNames.join(", ")}</span>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setTicketResult(null)}
                    className="text-xs font-mono text-rec hover:underline"
                  >
                    + TẠO PHIẾU CALL SHEET MỚI
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-rec hover:bg-rec-glow disabled:opacity-60 text-obsidian font-mono font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-[0_8px_28px_rgba(255,77,0,0.35)] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ĐANG KHỞI TẠO CALL SHEET...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      GỬI CALL SHEET{" "}
                      {selectedCrewMembers.length > 0
                        ? `CÙNG ${selectedCrewMembers.length} THÀNH VIÊN ĐÃ CHỌN`
                        : "TỚI THIẾT BỊ GIA"}
                    </span>
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
