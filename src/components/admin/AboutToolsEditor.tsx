"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { CrewMember } from "@/data/schema";
import type { SiteContent } from "@/lib/content-schema";
import { AdminField, AdminImageField, AdminStringListField } from "./AdminFields";
import { usePointerReorder } from "./use-pointer-reorder";

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

type AboutPageContent = SiteContent["about"];
type AboutMetric = AboutPageContent["metrics"][number];
type AboutPillar = AboutPageContent["pillars"][number];

export function AboutPageEditor({
  about,
  onChange,
}: {
  about: AboutPageContent;
  onChange: (about: AboutPageContent) => void;
}) {
  function updateHeroBanner(patch: Partial<AboutPageContent["heroBanner"]>) {
    onChange({ ...about, heroBanner: { ...about.heroBanner, ...patch } });
  }

  function updatePipeline(patch: Partial<AboutPageContent["pipeline"]>) {
    onChange({ ...about, pipeline: { ...about.pipeline, ...patch } });
  }

  function updateBottomCta(patch: Partial<AboutPageContent["bottomCta"]>) {
    onChange({ ...about, bottomCta: { ...about.bottomCta, ...patch } });
  }

  function updateMetric(index: number, patch: Partial<AboutMetric>) {
    onChange({
      ...about,
      metrics: about.metrics.map((metric, metricIndex) => metricIndex === index ? { ...metric, ...patch } : metric),
    });
  }

  function updatePillar(index: number, patch: Partial<AboutPillar>) {
    onChange({
      ...about,
      pillars: about.pillars.map((pillar, pillarIndex) => pillarIndex === index ? { ...pillar, ...patch } : pillar),
    });
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
      <div>
        <h2 className="font-display text-2xl font-bold">Nội dung trang About</h2>
        <p className="mt-1 text-sm text-ivory-muted">Chỉnh nội dung, ảnh chủ đạo, số liệu, năng lực, kho ảnh, thiết bị và lời kêu gọi. Thay đổi được lưu cùng nút “Lưu thay đổi”.</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-obsidian/40 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-rec/10 font-mono text-xs font-bold text-rec">01</span>
          <h3 className="font-semibold">Giới thiệu và câu chuyện</h3>
        </div>
        <AdminField label="Dòng nhãn phía trên" value={about.eyebrow} onChange={(eyebrow) => onChange({ ...about, eyebrow })} />
        <AdminField label="Tiêu đề chính" value={about.title} onChange={(title) => onChange({ ...about, title })} />
        <AdminField label="Đoạn giới thiệu" value={about.introduction} multiline rows={3} onChange={(introduction) => onChange({ ...about, introduction })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Tiêu đề câu chuyện" value={about.storyTitle} onChange={(storyTitle) => onChange({ ...about, storyTitle })} />
          <AdminField label="Nội dung câu chuyện" value={about.storyBody} multiline rows={3} onChange={(storyBody) => onChange({ ...about, storyBody })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Nhãn nút mở kho ảnh" value={about.archiveJumpLabel} hint="Dùng {count} để tự hiện số ảnh." onChange={(archiveJumpLabel) => onChange({ ...about, archiveJumpLabel })} />
          <AdminField label="Nhãn nút mở danh sách thành viên" value={about.crewJumpLabel} hint="Dùng {count} để tự hiện số thành viên." onChange={(crewJumpLabel) => onChange({ ...about, crewJumpLabel })} />
        </div>
      </div>

      <details className="rounded-2xl border border-white/10 bg-obsidian/40">
        <summary className="cursor-pointer list-none p-4 font-semibold marker:hidden">02 · Ảnh bìa và banner tập thể</summary>
        <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
          <AdminImageField label="Ảnh banner About" value={about.heroBanner.imageUrl} folder="thiet-bi-gia/site" onChange={(imageUrl) => updateHeroBanner({ imageUrl })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Mô tả ảnh" value={about.heroBanner.imageAlt} onChange={(imageAlt) => updateHeroBanner({ imageAlt })} />
            <AdminField label="Nhãn trên ảnh" value={about.heroBanner.label} onChange={(label) => updateHeroBanner({ label })} />
            <AdminField label="Thẻ nổi bật" value={about.heroBanner.badge} onChange={(badge) => updateHeroBanner({ badge })} />
            <AdminField label="Địa điểm / dòng nhỏ" value={about.heroBanner.location} onChange={(location) => updateHeroBanner({ location })} />
          </div>
          <AdminField label="Tiêu đề banner" value={about.heroBanner.title} onChange={(title) => updateHeroBanner({ title })} />
          <AdminField label="Giới thiệu trên banner" value={about.heroBanner.description} multiline rows={3} onChange={(description) => updateHeroBanner({ description })} />
          <AdminField label="Nhãn nút mở kho ảnh" value={about.heroBanner.archiveButtonLabel} onChange={(archiveButtonLabel) => updateHeroBanner({ archiveButtonLabel })} />
        </div>
      </details>

      <details className="rounded-2xl border border-white/10 bg-obsidian/40">
        <summary className="cursor-pointer list-none p-4 font-semibold">03 · Số liệu và pipeline</summary>
        <div className="space-y-5 border-t border-white/10 p-4 sm:p-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Các thẻ số liệu ({about.metrics.length})</h3>
              <button type="button" disabled={about.metrics.length >= 6} onClick={() => onChange({ ...about, metrics: [...about.metrics, { id: newId("about-metric"), value: "", label: "" }] })} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-ivory hover:border-rec disabled:opacity-40"><Plus className="h-3.5 w-3.5 text-rec" /> THÊM SỐ LIỆU</button>
            </div>
            {about.metrics.map((metric, index) => (
              <div key={metric.id} className="grid gap-3 rounded-xl border border-white/10 p-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.2fr)_auto] sm:items-end">
                <AdminField label="Giá trị" value={metric.value} onChange={(value) => updateMetric(index, { value })} />
                <AdminField label="Nhãn" value={metric.label} onChange={(label) => updateMetric(index, { label })} />
                <div className="flex gap-1">
                  <button type="button" disabled={index === 0} onClick={() => onChange({ ...about, metrics: moveItem(about.metrics, index, index - 1) })} aria-label="Đưa số liệu lên" className="rounded-lg border border-white/10 p-2 text-ivory-muted hover:border-rec disabled:opacity-35"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" disabled={index === about.metrics.length - 1} onClick={() => onChange({ ...about, metrics: moveItem(about.metrics, index, index + 1) })} aria-label="Đưa số liệu xuống" className="rounded-lg border border-white/10 p-2 text-ivory-muted hover:border-rec disabled:opacity-35"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onChange({ ...about, metrics: about.metrics.filter((_, metricIndex) => metricIndex !== index) })} aria-label="Xóa số liệu" className="rounded-lg border border-red-400/20 p-2 text-red-300 hover:bg-red-400/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
            <AdminField label="Nhãn pipeline" value={about.pipeline.eyebrow} onChange={(eyebrow) => updatePipeline({ eyebrow })} />
            <AdminField label="Nội dung pipeline" value={about.pipeline.title} onChange={(title) => updatePipeline({ title })} />
            <AdminField label="Nhãn nút booking" value={about.pipeline.bookingLabel} onChange={(bookingLabel) => updatePipeline({ bookingLabel })} />
          </div>
        </div>
      </details>

      <details className="rounded-2xl border border-white/10 bg-obsidian/40">
        <summary className="cursor-pointer list-none p-4 font-semibold">04 · Kho ảnh chung và cuộn phim</summary>
        <div className="grid gap-4 border-t border-white/10 p-4 sm:p-5 sm:grid-cols-2">
          <AdminField label="Dòng nhãn cuộn phim" value={about.filmStripEyebrow} hint="Dùng {count} để tự hiện số ảnh." onChange={(filmStripEyebrow) => onChange({ ...about, filmStripEyebrow })} />
          <AdminField label="Tiêu đề cuộn phim" value={about.filmStripTitle} onChange={(filmStripTitle) => onChange({ ...about, filmStripTitle })} />
          <AdminField label="Mô tả cuộn phim" value={about.filmStripDescription} multiline rows={3} hint="Dùng {count} để tự hiện số ảnh." onChange={(filmStripDescription) => onChange({ ...about, filmStripDescription })} />
          <AdminField label="Dòng nhãn album ảnh" value={about.albumEyebrow} onChange={(albumEyebrow) => onChange({ ...about, albumEyebrow })} />
          <AdminField label="Tiêu đề album ảnh" value={about.albumTitle} onChange={(albumTitle) => onChange({ ...about, albumTitle })} />
          <AdminField label="Mô tả album ảnh" value={about.albumDescription} multiline rows={3} onChange={(albumDescription) => onChange({ ...about, albumDescription })} />
        </div>
      </details>

      <details className="rounded-2xl border border-white/10 bg-obsidian/40">
        <summary className="cursor-pointer list-none p-4 font-semibold">05 · Các nhóm chuyên môn</summary>
        <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Dòng nhãn" value={about.disciplinesEyebrow} onChange={(disciplinesEyebrow) => onChange({ ...about, disciplinesEyebrow })} />
            <AdminField label="Tiêu đề khu vực" value={about.disciplinesTitle} onChange={(disciplinesTitle) => onChange({ ...about, disciplinesTitle })} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Thẻ chuyên môn ({about.pillars.length})</h3>
            <button type="button" disabled={about.pillars.length >= 12} onClick={() => onChange({ ...about, pillars: [...about.pillars, { id: newId("about-pillar"), icon: "aperture", code: "", title: "", description: "" }] })} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-ivory hover:border-rec disabled:opacity-40"><Plus className="h-3.5 w-3.5 text-rec" /> THÊM NHÓM</button>
          </div>
          {about.pillars.map((pillar, index) => (
            <div key={pillar.id} className="space-y-3 rounded-xl border border-white/10 p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1.3fr)_auto] sm:items-end">
                <label className="block space-y-1.5"><span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Biểu tượng</span><select value={pillar.icon} onChange={(event) => updatePillar(index, { icon: event.target.value as AboutPillar["icon"] })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-3 text-sm text-ivory"><option value="aperture">Nhiếp ảnh</option><option value="clapperboard">Quay phim</option><option value="layers">Hậu kỳ</option><option value="cpu">Thiết kế / 3D</option></select></label>
                <AdminField label="Mã nhóm" value={pillar.code} onChange={(code) => updatePillar(index, { code })} />
                <AdminField label="Tên nhóm" value={pillar.title} onChange={(title) => updatePillar(index, { title })} />
                <div className="flex gap-1">
                  <button type="button" disabled={index === 0} onClick={() => onChange({ ...about, pillars: moveItem(about.pillars, index, index - 1) })} aria-label="Đưa nhóm chuyên môn lên" className="rounded-lg border border-white/10 p-2 text-ivory-muted hover:border-rec disabled:opacity-35"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" disabled={index === about.pillars.length - 1} onClick={() => onChange({ ...about, pillars: moveItem(about.pillars, index, index + 1) })} aria-label="Đưa nhóm chuyên môn xuống" className="rounded-lg border border-white/10 p-2 text-ivory-muted hover:border-rec disabled:opacity-35"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onChange({ ...about, pillars: about.pillars.filter((_, pillarIndex) => pillarIndex !== index) })} aria-label="Xóa nhóm chuyên môn" className="rounded-lg border border-red-400/20 p-2 text-red-300 hover:bg-red-400/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <AdminField label="Mô tả nhóm" value={pillar.description} multiline rows={3} onChange={(description) => updatePillar(index, { description })} />
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-2xl border border-white/10 bg-obsidian/40">
        <summary className="cursor-pointer list-none p-4 font-semibold">06 · Kho thiết bị và lời kêu gọi</summary>
        <div className="space-y-5 border-t border-white/10 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Dòng nhãn kho thiết bị" value={about.gearEyebrow} onChange={(gearEyebrow) => onChange({ ...about, gearEyebrow })} />
            <AdminField label="Tiêu đề kho thiết bị" value={about.gearTitle} onChange={(gearTitle) => onChange({ ...about, gearTitle })} />
          </div>
          <div className="grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
            <AdminField label="Nhãn khu vực cuối trang" value={about.bottomCta.eyebrow} onChange={(eyebrow) => updateBottomCta({ eyebrow })} />
            <AdminField label="Tiêu đề cuối trang" value={about.bottomCta.title} onChange={(title) => updateBottomCta({ title })} />
            <AdminField label="Mô tả cuối trang" value={about.bottomCta.description} multiline rows={3} onChange={(description) => updateBottomCta({ description })} />
            <div className="grid gap-4">
              <AdminField label="Nhãn nút booking" value={about.bottomCta.bookingLabel} onChange={(bookingLabel) => updateBottomCta({ bookingLabel })} />
              <AdminField label="Nhãn nút timeline" value={about.bottomCta.timelineLabel} onChange={(timelineLabel) => updateBottomCta({ timelineLabel })} />
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}

export function GearManager({
  categories,
  onChange,
}: {
  categories: GearCategory[];
  onChange: (categories: GearCategory[]) => void;
}) {
  const [query, setQuery] = useState("");
  const categorySorter = usePointerReorder((draggedId, targetId) => {
    const from = categories.findIndex((item) => item.id === draggedId);
    const to = categories.findIndex((item) => item.id === targetId);
    if (from >= 0 && to >= 0) onChange(moveItem(categories, from, to));
  });
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

      <AdminField label="Tìm trong kho thiết bị" value={query} onChange={setQuery} hint="Kéo tay nắm để sắp xếp nhóm; tìm theo tên nhóm, mã hoặc tên thiết bị." />

      {filtered.length ? filtered.map(({ category, index }) => (
        <details key={category.id} {...categorySorter.itemProps(category.id)} className="rounded-2xl border border-white/10 bg-obsidian/50 data-[admin-sortable-dragging=true]:opacity-60 data-[admin-sortable-dragging=true]:ring-1 data-[admin-sortable-dragging=true]:ring-rec">
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4">
            <span className="min-w-0">
              <span className="block truncate font-semibold text-ivory">{category.title}</span>
              <span className="mt-1 block truncate text-xs font-mono text-ivory-subtle">{category.code} · {category.items.length} thiết bị</span>
            </span>
            <button {...categorySorter.handleProps(category.id, category.title)} />
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
            <div className="text-xs text-ivory-subtle">NHÓM {String(index + 1).padStart(2, "0")}</div>
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
  const momentSorter = usePointerReorder((draggedId, targetId) => {
    const from = moments.findIndex((item) => item.id === draggedId);
    const to = moments.findIndex((item) => item.id === targetId);
    if (from >= 0 && to >= 0) onChange(moveItem(moments, from, to));
  });
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
      onFilmStrip: true,
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

      <AdminField label="Tìm ảnh kỷ niệm" value={query} onChange={setQuery} hint="Kéo tay nắm để đổi thứ tự ảnh; tìm theo tiêu đề, chú thích, địa điểm hoặc mã ảnh." />

      {filtered.length ? filtered.map(({ moment, index }) => (
        <details key={moment.id} {...momentSorter.itemProps(moment.id)} className="rounded-2xl border border-white/10 bg-obsidian/50 data-[admin-sortable-dragging=true]:opacity-60 data-[admin-sortable-dragging=true]:ring-1 data-[admin-sortable-dragging=true]:ring-rec">
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
            {moment.src ? <img src={moment.src} alt="" className="h-12 w-16 shrink-0 rounded-lg border border-white/10 object-cover" /> : <span className="h-12 w-16 shrink-0 rounded-lg border border-dashed border-white/20" />}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-ivory">{moment.title || "Ảnh chưa đặt tên"}</span>
              <span className="mt-1 block truncate text-xs font-mono text-ivory-subtle">{moment.frameCode} · {moment.location || "Chưa có địa điểm"} · {moment.category}</span>
            </span>
            <button {...momentSorter.handleProps(moment.id, moment.title)} />
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

            <div className="text-xs text-ivory-subtle">ẢNH {String(index + 1).padStart(2, "0")} / {moments.length}</div>
          </div>
        </details>
      )) : <p className="rounded-xl border border-white/10 p-4 text-sm text-ivory-muted">Không tìm thấy ảnh kỷ niệm phù hợp.</p>}
    </section>
  );
}
