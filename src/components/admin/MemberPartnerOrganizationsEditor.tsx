"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import type { CrewMember, PartnerOrganization } from "@/data/schema";
import { AdminField, AdminImageField } from "./AdminFields";

export function MemberPartnerOrganizationsEditor({
  member,
  onChange,
  signatureEndpoint,
}: {
  member: CrewMember;
  onChange: (patch: Partial<CrewMember>) => void;
  signatureEndpoint?: string;
}) {
  const organizations = member.partnerOrganizations ?? [];
  const [activeId, setActiveId] = useState(organizations[0]?.id ?? "");
  const active = organizations.find((item) => item.id === activeId) ?? null;

  useEffect(() => {
    if (!organizations.some((item) => item.id === activeId)) setActiveId(organizations[0]?.id ?? "");
  }, [activeId, organizations]);

  function addOrganization() {
    const organization: PartnerOrganization = {
      id: `${member.id}-partner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: "Đơn vị đồng hành mới",
      logo: "",
      website: "",
      description: "",
    };
    onChange({ partnerOrganizations: [...organizations, organization] });
    setActiveId(organization.id);
  }

  function updateOrganization(patch: Partial<PartnerOrganization>) {
    if (!active) return;
    onChange({
      partnerOrganizations: organizations.map((item) => item.id === active.id ? { ...item, ...patch } : item),
    });
  }

  function removeOrganization() {
    if (!active || !window.confirm(`Xóa “${active.name}” khỏi hồ sơ của bạn? Đơn vị này sẽ được gỡ khỏi các dự án cá nhân đang gắn.`)) return;
    onChange({
      partnerOrganizations: organizations.filter((item) => item.id !== active.id),
      showcase: member.showcase.map((project) => ({
        ...project,
        partnerIds: (project.partnerIds ?? []).filter((id) => id !== active.id),
      })),
    });
    setActiveId(organizations.find((item) => item.id !== active.id)?.id ?? "");
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-6">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-rec">PROFILE / PARTNERS</p>
          <h3 className="mt-1 font-display text-xl font-bold">Đơn vị đồng hành</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ivory-muted">Thêm logo và thông tin các đơn vị đồng hành với bạn. Sau đó chọn đơn vị trong dự án cá nhân ở mục “Dự án trưng bày”.</p>
        </div>
        <button type="button" onClick={addOrganization} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rec px-3.5 py-2.5 text-xs font-mono font-bold text-obsidian"><Plus className="h-4 w-4" />THÊM ĐƠN VỊ</button>
      </header>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.5fr)]">
        <aside className="space-y-2 rounded-2xl border border-white/10 bg-obsidian-surface p-3">
          <div className="flex items-center justify-between px-2 py-1"><h4 className="font-display font-bold">Danh sách của bạn</h4><span className="font-mono text-[10px] text-ivory-subtle">{organizations.length}</span></div>
          {organizations.length ? organizations.map((organization) => <button key={organization.id} type="button" onClick={() => setActiveId(organization.id)} className={`flex w-full min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition ${activeId === organization.id ? "border-rec/50 bg-rec/10" : "border-transparent hover:border-white/10 hover:bg-white/[0.035]"}`}>
            {organization.logo ? <img src={organization.logo} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-white/10 bg-white object-contain p-1" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]"><Building2 className="h-4 w-4 text-ivory-subtle" /></span>}
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ivory">{organization.name}</span><span className="mt-0.5 block text-[10px] text-ivory-subtle">Đơn vị cá nhân</span></span>
          </button>) : <p className="rounded-xl border border-dashed border-white/15 p-4 text-xs leading-relaxed text-ivory-subtle">Bạn chưa thêm đơn vị nào. Bấm “Thêm đơn vị” để bắt đầu.</p>}
        </aside>

        {active ? <section className="space-y-5 rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div><p className="font-mono text-[10px] text-rec">PARTNER / {active.id}</p><h4 className="mt-1 font-display text-lg font-bold">Thông tin đơn vị</h4></div>
            <button type="button" onClick={removeOrganization} className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 px-3 py-2 text-xs font-mono text-red-300 hover:bg-red-400/10"><Trash2 className="h-4 w-4" />XÓA ĐƠN VỊ</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Tên đơn vị" value={active.name} onChange={(name) => updateOrganization({ name })} />
            <AdminField label="Website (tùy chọn)" value={active.website ?? ""} onChange={(website) => updateOrganization({ website })} hint="Dán địa chỉ đầy đủ, ví dụ https://tenmien.vn" />
          </div>
          <AdminField label="Giới thiệu ngắn" value={active.description ?? ""} multiline rows={3} onChange={(description) => updateOrganization({ description })} />
          <AdminImageField label="Logo đơn vị" value={active.logo ?? ""} folder="thiet-bi-gia/partners" signatureEndpoint={signatureEndpoint} onChange={(logo) => updateOrganization({ logo })} />
        </section> : <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-obsidian-surface p-6 text-center text-sm text-ivory-muted">Chọn đơn vị để chỉnh sửa hoặc thêm đơn vị mới.</div>}
      </div>
    </div>
  );
}
