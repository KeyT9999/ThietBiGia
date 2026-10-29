"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { CrewMember } from "@/data/schema";
import type { SiteContent } from "@/lib/content-schema";
import { AdminField, AdminImageField, AdminStringListField } from "./AdminFields";

type GearCategory = SiteContent["gear"][number];
type GroupMoment = SiteContent["moments"][number];
type GearItem = GearCategory["items"][number];

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function GearManager({
  categories,
  onChange,
}: {
  categories: GearCategory[];
  onChange: (categories: GearCategory[]) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = categories
    .map((category, index) => ({ category, index }))
    .filter(({ category }) => `${category.title} ${category.code} ${category.subtitle} ${category.items.map((item) => `${item.name} ${item.spec} ${item.tag}`).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));

  function updateCategory(id: string, patch: Partial<GearCategory>) {
    onChange(categories.map((category) => category.id === id ? { ...category, ...patch } : category));
  }

  function updateItem(category: GearCategory, index: number, patch: Partial<GearItem>) {
    updateCategory(category.id, {
      items: category.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    });
  }

  function addCategory() {
    onChange([...categories, {
      id: newId("gear-category"),
      code: `${String(categories.length + 1).padStart(2, "0")} // NEW CATEGORY`,
      title: "Nhóm thiết bị mới",
      subtitle: "",
      items: [],
    }]);
  }

  function removeCategory(id: string) {
    const category = categories.find((item) => item.id === id);
    if (!category || !window.confirm(`Gỡ nhóm thiết bị “${category.title}”?`)) return;
    onChange(categories.filter((item) => item.id !== id));
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Kho thiết bị ({categories.length} nhóm)</h2>
          <p className="mt-1 text-sm text-ivory-muted">Sửa từng nhóm và từng thiết bị ngay trên form.</p>
        </div>
        <button type="button" onClick={addCategory} className="inline-flex items-center gap-2 rounded-xl bg-rec px-3.5 py-2.5 text-xs font-mono font-bold text-obsidian"><Plus className="h-4 w-4" /> THÊM NHÓM</button>
      </div>

      <AdminField label="Tìm trong kho thiết bị" value={query} onChange={setQuery} hint="Tìm theo tên nhóm, mã hoặc tên thiết bị." />

      {filtered.length ? filtered.map(({ category, index }) => (
        <details key={category.id} className="rounded-2xl border border-white/10 bg-obsidian/50">
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4">
            <span className="min-w-0">
              <span className="block truncate font-semibold text-ivory">{category.title}</span>
              <span className="mt-1 block truncate text-xs font-mono text-ivory-subtle">{category.code} · {category.items.length} thiết bị</span>
            </span>
            <span className="text-xs text-ivory-subtle">MỞ CHỈNH SỬA</span>
          </summary>
          <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
            <div className="flex justify-end">
              <button type="button" onClick={() => removeCategory(category.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 px-2.5 py-2 text-xs text-red-300 hover:bg-red-400/10"><Trash2 className="h-3.5 w-3.5" /> GỠ NHÓM</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Mã nhóm" value={category.code} onChange={(code) => updateCategory(category.id, { code })} />
              <AdminField label="Tên nhóm" value={category.title} onChange={(title) => updateCategory(category.id, { title })} />
            </div>
            <AdminField label="Mô tả nhóm" value={category.subtitle} multiline rows={3} onChange={(subtitle) => updateCategory(category.id, { subtitle })} />
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">Thiết bị trong nhóm ({category.items.length})</h3>
                <button type="button" onClick={() => updateCategory(category.id, { items: [...category.items, { name: "", spec: "", tag: "" }] })} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-ivory hover:border-rec"><Plus className="h-3.5 w-3.5" /> THÊM THIẾT BỊ</button>
              </div>
              {category.items.length ? category.items.map((item, itemIndex) => (
                <div key={`${category.id}-item-${itemIndex}`} className="grid gap-3 rounded-xl border border-white/10 bg-obsidian/70 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(100px,0.55fr)_auto] sm:items-end">
                  <AdminField label="Tên thiết bị" value={item.name} onChange={(name) => updateItem(category, itemIndex, { name })} />
                  <AdminField label="Thông số" value={item.spec} onChange={(spec) => updateItem(category, itemIndex, { spec })} />
                  <AdminField label="Nhãn" value={item.tag} onChange={(tag) => updateItem(category, itemIndex, { tag })} />
                  <button type="button" aria-label={`Gỡ thiết bị ${item.name || itemIndex + 1}`} onClick={() => updateCategory(category.id, { items: category.items.filter((_, candidateIndex) => candidateIndex !== itemIndex) })} className="rounded-lg border border-red-400/20 p-2.5 text-red-300 hover:bg-red-400/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              )) : <p className="rounded-xl border border-white/10 p-3 text-sm text-ivory-muted">Nhóm này chưa có thiết bị.</p>}
            </div>
            <div className="flex items-center justify-between text-xs text-ivory-subtle">
              <span>NHÓM {String(index + 1).padStart(2, "0")}</span>
              <div className="flex gap-2">
                <button type="button" disabled={index === 0} onClick={() => onChange(moveItem(categories, index, index - 1))} aria-label="Đưa nhóm lên" className="rounded border border-white/10 p-2 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button type="button" disabled={index === categories.length - 1} onClick={() => onChange(moveItem(categories, index, index + 1))} aria-label="Đưa nhóm xuống" className="rounded border border-white/10 p-2 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        </details>
      )) : <p className="rounded-xl border border-white/10 p-4 text-sm text-ivory-muted">Không tìm thấy nhóm thiết bị phù hợp.</p>}
    </section>
  );
}

export function GroupMomentsManager({
  moments,
  crew,
  onChange,
}: {
  moments: SiteContent["moments"];
  crew: CrewMember[];
  onChange: (moments: SiteContent["moments"]) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = moments
    .map((moment, index) => ({ moment, index }))
    .filter(({ moment }) => `${moment.title} ${moment.caption} ${moment.location} ${moment.dateLabel} ${moment.frameCode} ${(moment.memberNames ?? []).join(" ")} ${(moment.memberSlugs ?? []).map((slug) => crew.find((member) => member.slug === slug)?.name ?? "").join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));

  function updateMoment(id: string, patch: Partial<GroupMoment>) {
    onChange(moments.map((moment) => moment.id === id ? { ...moment, ...patch } : moment));
  }

  function addMoment() {
    const index = moments.length + 1;
    onChange([...moments, {
      id: newId("tbg-moment"),
      frameCode: `► ${String(index).padStart(2, "0")}A`,
      src: "",
      title: "Ảnh kỷ niệm mới",
      caption: "",
      location: "",
      filmStock: "",
      dateLabel: "",
      category: "doi-thuong",
      onFilmStrip: false,
      memberSlugs: [],
      memberNames: [],
    }]);
  }

  function removeMoment(moment: GroupMoment) {
    if (!window.confirm(`Gỡ ảnh kỷ niệm “${moment.title}”?`)) return;
    onChange(moments.filter((item) => item.id !== moment.id));
  }

  function changeTaggedMembers(moment: GroupMoment, slug: string, checked: boolean) {
    const currentSlugs = moment.memberSlugs ?? [];
    const nextSlugs = checked
      ? Array.from(new Set([...currentSlugs, slug]))
      : currentSlugs.filter((item) => item !== slug);
    const knownNames = new Set(currentSlugs.map((itemSlug) => crew.find((member) => member.slug === itemSlug)?.name).filter((name): name is string => Boolean(name)));
    const manualNames = (moment.memberNames ?? []).filter((name) => !knownNames.has(name));
    const nextNames = [
      ...nextSlugs.map((itemSlug) => crew.find((member) => member.slug === itemSlug)?.name).filter((name): name is string => Boolean(name)),
      ...manualNames,
    ];
    updateMoment(moment.id, { memberSlugs: nextSlugs, memberNames: nextNames });
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Album kỷ niệm ({moments.length} ảnh)</h2>
          <p className="mt-1 text-sm text-ivory-muted">Chỉnh chú thích, phân loại, ngày, thành viên xuất hiện và thứ tự ảnh.</p>
        </div>
        <button type="button" onClick={addMoment} className="inline-flex items-center gap-2 rounded-xl bg-rec px-3.5 py-2.5 text-xs font-mono font-bold text-obsidian"><Plus className="h-4 w-4" /> THÊM ẢNH KỶ NIỆM</button>
      </div>

      <AdminField label="Tìm ảnh kỷ niệm" value={query} onChange={setQuery} hint="Tìm theo tiêu đề, chú thích, địa điểm hoặc mã ảnh." />

      {filtered.length ? filtered.map(({ moment, index }) => (
        <details key={moment.id} className="rounded-2xl border border-white/10 bg-obsidian/50">
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
            {moment.src ? <img src={moment.src} alt="" className="h-12 w-16 shrink-0 rounded-lg border border-white/10 object-cover" /> : <span className="h-12 w-16 shrink-0 rounded-lg border border-dashed border-white/20" />}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-ivory">{moment.title || "Ảnh chưa đặt tên"}</span>
              <span className="mt-1 block truncate text-xs font-mono text-ivory-subtle">{moment.frameCode} · {moment.location || "Chưa có địa điểm"} · {moment.category}</span>
            </span>
            <span className="text-xs text-ivory-subtle">MỞ CHỈNH SỬA</span>
          </summary>

          <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
            <div className="flex justify-end">
              <button type="button" onClick={() => removeMoment(moment)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 px-2.5 py-2 text-xs text-red-300 hover:bg-red-400/10"><Trash2 className="h-3.5 w-3.5" /> GỠ ẢNH</button>
            </div>
            <AdminImageField label="Ảnh kỷ niệm" value={moment.src} folder="thiet-bi-gia/site" onChange={(src) => updateMoment(moment.id, { src })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Tiêu đề" value={moment.title} onChange={(title) => updateMoment(moment.id, { title })} />
              <AdminField label="Mã khung hình" value={moment.frameCode} onChange={(frameCode) => updateMoment(moment.id, { frameCode })} />
              <AdminField label="Địa điểm" value={moment.location} onChange={(location) => updateMoment(moment.id, { location })} />
              <AdminField label="Ngày / nhãn sự kiện" value={moment.dateLabel} onChange={(dateLabel) => updateMoment(moment.id, { dateLabel })} />
              <AdminField label="Film stock / thiết bị" value={moment.filmStock} onChange={(filmStock) => updateMoment(moment.id, { filmStock })} />
              <label className="block space-y-1.5">
                <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Phân loại album</span>
                <select value={moment.category} onChange={(event) => updateMoment(moment.id, { category: event.target.value as GroupMoment["category"] })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm text-ivory">
                  <option value="dai-gia-dinh">Đại gia đình</option><option value="hau-truong">Hậu trường</option><option value="doi-thuong">Đời thường / dã ngoại</option>
                </select>
              </label>
            </div>
            <AdminField label="Chú thích" value={moment.caption} multiline rows={4} onChange={(caption) => updateMoment(moment.id, { caption })} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-white/10 p-3 text-sm text-ivory">
                <input type="checkbox" checked={moment.onFilmStrip ?? false} onChange={(event) => updateMoment(moment.id, { onFilmStrip: event.target.checked })} className="accent-[#ff4d00]" />
                Hiện ảnh trên cuộn phim
              </label>
              <label className="block space-y-1.5">
                <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Số gương mặt (tùy chọn)</span>
                <input type="number" min={0} value={moment.detectedFaceCount ?? ""} onChange={(event) => updateMoment(moment.id, { detectedFaceCount: event.target.value === "" ? undefined : Math.max(0, Number(event.target.value)) })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm text-ivory outline-none focus:border-rec" />
              </label>
            </div>

            <section className="space-y-3 rounded-xl border border-white/10 p-3 sm:p-4">
              <div><h3 className="font-semibold">Thành viên trong ảnh</h3><p className="mt-1 text-xs text-ivory-subtle">Đánh dấu người xuất hiện; các tên thủ công cũ vẫn được giữ lại.</p></div>
              <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                {crew.map((member) => (
                  <label key={member.id} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-ivory">
                    <input type="checkbox" checked={(moment.memberSlugs ?? []).includes(member.slug)} onChange={(event) => changeTaggedMembers(moment, member.slug, event.target.checked)} className="accent-[#ff4d00]" />
                    <span className="truncate">{member.name}</span>
                  </label>
                ))}
              </div>
              <AdminStringListField label="Tên bổ sung (không có hồ sơ thành viên)" value={(moment.memberNames ?? []).filter((name) => !(moment.memberSlugs ?? []).some((slug) => crew.find((member) => member.slug === slug)?.name === name))} onChange={(manualNames) => {
                const linkedNames = (moment.memberSlugs ?? []).map((slug) => crew.find((member) => member.slug === slug)?.name).filter((name): name is string => Boolean(name));
                updateMoment(moment.id, { memberNames: [...linkedNames, ...manualNames] });
              }} placeholder="Tên thành viên" addLabel="THÊM TÊN" />
            </section>

            <div className="flex items-center justify-between text-xs text-ivory-subtle">
              <span>ẢNH {String(index + 1).padStart(2, "0")} / {moments.length}</span>
              <div className="flex gap-2">
                <button type="button" disabled={index === 0} onClick={() => onChange(moveItem(moments, index, index - 1))} aria-label="Đưa ảnh lên" className="rounded border border-white/10 p-2 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button type="button" disabled={index === moments.length - 1} onClick={() => onChange(moveItem(moments, index, index + 1))} aria-label="Đưa ảnh xuống" className="rounded border border-white/10 p-2 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        </details>
      )) : <p className="rounded-xl border border-white/10 p-4 text-sm text-ivory-muted">Không tìm thấy ảnh kỷ niệm phù hợp.</p>}
    </section>
  );
}
