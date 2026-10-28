"use client";

import { useState } from "react";
import { Check, Copy, Mail, MapPin, Phone, Send, Sparkles } from "lucide-react";
import { soundEngine } from "@/lib/sound";

const SERVICE_OPTIONS = [
  "Trọn gói Ekip Quay & Chụp",
  "Photographer (Thời trang / Sự kiện / Sản phẩm)",
  "Quay MV / TVC / Phim ngắn (DOP & Cam)",
  "Dựng Video, Color Grading & Same-Day Edit",
  "Key Visual, 3D Motion & Thiết kế Sân khấu",
  "Hỗ trợ Lighting, Gaffer & Thiết bị",
];

export default function ContactBookingPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Trọn gói Ekip Quay & Chụp",
  ]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [dateInfo, setDateInfo] = useState("");
  const [brief, setBrief] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleService = (service: string) => {
    soundEngine.playTick(0.8);
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playShutter();
    setSubmitted(true);
  };

  const copyEmail = () => {
    navigator.clipboard?.writeText("booking@thietbigia.vn");
    soundEngine.playTick(0.9);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-8 pt-28 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-rec uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CALL SHEET // BOOKING DESK</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ivory leading-tight tracking-tight">
              LÊN LỊCH BẤM MÁY CÙNG THIẾT BỊ GIA.
            </h1>
            <p className="text-sm sm:text-base text-ivory-muted leading-relaxed">
              Gửi nhanh yêu cầu dự án bên cạnh — Producer của nhóm sẽ phản hồi kèm{" "}
              <span className="text-ivory">đội hình nhân sự + gói thiết bị tối ưu</span> trong vòng 24 giờ.
            </p>
          </div>

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
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
                  TP. Hồ Chí Minh • Sẵn sàng di chuyển toàn quốc
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Interactive Call-Sheet Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-obsidian-border bg-obsidian-surface p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-obsidian-border pb-4">
              <span className="font-mono text-xs text-rec font-bold">
                PROJECT BRIEF // PHIẾU ĐẶT LỊCH EKIP
              </span>
              <span className="font-mono text-xs text-ivory-subtle">STATUS: READY</span>
            </div>

            {/* Multi-select crew modules */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-ivory-muted uppercase">
                  2. Tên của bạn / Thương hiệu
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
                  3. Số điện thoại / Zalo / Email
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

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-ivory-muted uppercase">
                4. Thời gian dự kiến bấm máy &amp; Địa điểm
              </label>
              <input
                type="text"
                value={dateInfo}
                onChange={(e) => setDateInfo(e.target.value)}
                placeholder="VD: Cuối tháng 11/2026 tại TP.HCM (2 ngày quay)"
                className="w-full px-4 py-3 rounded-xl border border-obsidian-border bg-obsidian text-sm text-ivory placeholder:text-ivory-subtle focus:outline-none focus:border-rec"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-ivory-muted uppercase">
                5. Tóm tắt ý tưởng / Thành viên bạn muốn chỉ định (nếu có)
              </label>
              <textarea
                rows={4}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Mô tả ngắn gọn concept, moodboard hoặc tên Photographer / DOP / Editor trong nhóm bạn muốn làm việc cùng..."
                className="w-full px-4 py-3 rounded-xl border border-obsidian-border bg-obsidian text-sm text-ivory placeholder:text-ivory-subtle focus:outline-none focus:border-rec resize-none"
              />
            </div>

            {submitted ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center justify-between gap-4">
                <div className="text-sm text-ivory">
                  <strong className="text-emerald-400">Đã ghi nhận phiếu đặt lịch!</strong> Ekip Thiết Bị Gia sẽ liên hệ ngay với{" "}
                  <span className="font-semibold">{name}</span> qua{" "}
                  <span className="font-mono">{contact}</span>.
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-mono text-ivory-muted hover:text-ivory shrink-0"
                >
                  GỬI PHIẾU MỚI
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-rec hover:bg-rec-glow text-obsidian font-mono font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-[0_8px_28px_rgba(255,77,0,0.35)]"
              >
                <Send className="w-4 h-4" />
                <span>GỬI CALL SHEET TỚI THIẾT BỊ GIA</span>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
