"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ContactService } from "@/lib/content-schema";
import { AdminField } from "./AdminFields";

export function ContactServicesManager({
  services,
  onChange,
}: {
  services: ContactService[];
  onChange: (services: ContactService[]) => void;
}) {
  function addService() {
    const id = `service-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    onChange([...services, { id, label: "Dịch vụ mới" }]);
  }

  function updateService(id: string, label: string) {
    onChange(services.map((service) => service.id === id ? { ...service, label } : service));
  }

  function removeService(id: string) {
    const service = services.find((item) => item.id === id);
    if (service && !window.confirm(`Xóa dịch vụ “${service.label}” khỏi form Contact?`)) return;
    onChange(services.filter((service) => service.id !== id));
  }

  return (
    <section className="space-y-5 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-rec">CONTACT / SERVICE MENU</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Dịch vụ đặt lịch</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ivory-muted">Thêm, đổi tên hoặc xóa hạng mục hiển thị trong phiếu Contact. Đơn đã gửi giữ nguyên tên dịch vụ tại thời điểm đặt; xóa ở đây không sửa lịch sử đơn.</p>
        </div>
        <button type="button" onClick={addService} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rec px-3.5 py-2.5 text-xs font-mono font-bold text-obsidian"><Plus className="h-4 w-4" />THÊM DỊCH VỤ</button>
      </div>

      {services.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {services.map((service, index) => (
            <article key={service.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-obsidian/60 p-4">
              <span className="mt-1 w-7 shrink-0 font-mono text-[10px] text-rec">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1"><AdminField label="Tên dịch vụ hiển thị" value={service.label} onChange={(label) => updateService(service.id, label)} /></div>
              <button type="button" onClick={() => removeService(service.id)} aria-label={`Xóa dịch vụ ${service.label}`} title="Xóa dịch vụ" className="mt-6 rounded-lg border border-red-400/20 p-2.5 text-red-300 hover:bg-red-400/10"><Trash2 className="h-4 w-4" /></button>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-ivory-muted">Chưa có dịch vụ nào. Thêm dịch vụ để khách có thể chọn khi gửi phiếu Contact.</div>
      )}
    </section>
  );
}
