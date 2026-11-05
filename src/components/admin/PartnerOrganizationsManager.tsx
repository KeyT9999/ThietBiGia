"use client";

import { useEffect, useState } from "react";
import { Building2, Trash2 } from "lucide-react";
import type { CrewMember, PartnerOrganization, WorkProject } from "@/data/schema";
import { AdminField, AdminImageField } from "./AdminFields";

export function PartnerOrganizationsManager({
  organizations,
  works,
  crew,
  onChange,
  onDelete,
}: {
  organizations: PartnerOrganization[];
  works: WorkProject[];
  crew: CrewMember[];
  onChange: (organizations: PartnerOrganization[]) => void;
  onDelete: (id: string) => void;
}) {
  const [activeId, setActiveId] = useState(organizations[0]?.id ?? "");
  const active = organizations.find((item) => item.id === activeId) ?? null;

  useEffect(() => {
    if (!organizations.some((item) => item.id === activeId)) setActiveId(organizations[0]?.id ?? "");
  }, [activeId, organizations]);

  function update(patch: Partial<PartnerOrganization>) {
    if (!active) return;
    onChange(organizations.map((item) => item.id === active.id ? { ...item, ...patch } : item));
  }

  function removeActive() {
    if (!active || !window.confirm(`Xóa “${active.name}” khỏi danh sách đơn vị đồng hành? Các dự án đang gắn sẽ được gỡ liên kết.`)) return;
    const next = organizations.filter((item) => item.id !== active.id);
    onDelete(active.id);
    setActiveId(next[0]?.id ?? "");
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-rec">PARTNERS / PROJECT CREDITS</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Đơn vị đồng hành</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ivory-muted">Các đơn vị thành viên gửi sẽ được thêm vào danh mục này khi admin duyệt ở phần bên trên. Tại đây, admin có thể cập nhật hoặc gỡ các đơn vị đã được duyệt.</p>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-2 rounded-3xl border border-white/10 bg-obsidian-surface p-3">
          <div className="flex items-center justify-between px-2 py-1"><h3 className="font-display font-bold">Danh sách</h3><span className="font-mono text-[10px] text-ivory-subtle">{organizations.length}</span></div>
          {organizations.length ? organizations.map((organization) => {
            const taggedCount = works.filter((work) => (work.partnerIds ?? []).includes(organization.id)).length
              + crew.reduce((count, member) => count + member.showcase.filter((item) => (item.partnerIds ?? []).includes(organization.id)).length, 0);
            return <button key={organization.id} type="button" onClick={() => setActiveId(organization.id)} className={`flex w-full min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition ${activeId === organization.id ? "border-rec/50 bg-rec/10" : "border-transparent hover:border-white/10 hover:bg-white/[0.035]"}`}>
              {organization.logo ? <img src={organization.logo} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-white/10 bg-white object-contain p-1" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]"><Building2 className="h-4 w-4 text-ivory-subtle" /></span>}
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ivory">{organization.name}</span><span className="mt-0.5 block text-[10px] text-ivory-subtle">Gắn với {taggedCount} dự án</span></span>
            </button>;
          }) : <p className="rounded-xl border border-dashed border-white/15 p-4 text-xs leading-relaxed text-ivory-subtle">Chưa có đơn vị được duyệt. Khi thành viên gửi đề xuất và admin duyệt, đơn vị sẽ xuất hiện ở đây.</p>}
        </aside>

        {active ? <section className="space-y-5 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
            <div><p className="font-mono text-[10px] text-rec">PARTNER / {active.id}</p><h3 className="mt-1 font-display text-xl font-bold">Thông tin đơn vị</h3></div>
            <button type="button" onClick={removeActive} className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 px-3 py-2 text-xs font-mono text-red-300 hover:bg-red-400/10"><Trash2 className="h-4 w-4" />XÓA ĐƠN VỊ</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Tên đơn vị" value={active.name} onChange={(name) => update({ name })} />
            <AdminField label="Website (tùy chọn)" value={active.website ?? ""} onChange={(website) => update({ website })} hint="Dán địa chỉ đầy đủ, ví dụ https://tenmien.vn" />
          </div>
          <AdminField label="Giới thiệu ngắn" value={active.description ?? ""} multiline rows={3} onChange={(description) => update({ description })} />
          <AdminImageField label="Logo đơn vị" value={active.logo ?? ""} folder="thiet-bi-gia/partners" onChange={(logo) => update({ logo })} />
        </section> : <div className="flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-obsidian-surface p-6 text-center text-sm text-ivory-muted">Chọn một đơn vị để chỉnh sửa hoặc thêm đơn vị mới.</div>}
      </div>
    </div>
  );
}
