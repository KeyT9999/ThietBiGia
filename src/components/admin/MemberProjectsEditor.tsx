"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { BentoItem, CrewMember, WorkProject } from "@/data/schema";
import { getSharedWorkIdsForMember, getUnifiedProjectsForMember } from "@/data/works";
import { AdminDriveFolderField, AdminField, AdminImageField, AdminMultiImageField } from "./AdminFields";

function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function MemberProjectsEditor({
  member,
  works,
  crew,
  onChange,
  signatureEndpoint,
}: {
  member: CrewMember;
  works: WorkProject[];
  crew: CrewMember[];
  onChange: (patch: Partial<CrewMember>) => void;
  signatureEndpoint?: string;
}) {
  const [projectFilter, setProjectFilter] = useState<"all" | "personal" | "shared">("all");
  const eligibleSharedWorks = works.filter((work) =>
    work.credits.some((credit) => credit.memberSlug === member.slug)
  );
  const selectedWorkIds = new Set(getSharedWorkIdsForMember(member, works));
  const displayedProjects = getUnifiedProjectsForMember(member, works, crew);

  function updateShowcaseItem(id: string, patch: Partial<BentoItem>) {
    onChange({
      showcase: member.showcase.map((item) => item.id === id ? { ...item, ...patch } : item),
    });
  }

  function addPersonalProject() {
    const project: BentoItem = {
      id: `personal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: "Dự án cá nhân mới",
      subtitle: "",
      year: String(new Date().getFullYear()),
      kind: "photo",
      span: "normal",
      image: "",
      gallery: [],
      description: "",
      durationOrSpec: "DỰ ÁN CÁ NHÂN",
    };
    onChange({ showcase: [...member.showcase, project] });
  }

  function toggleSharedWork(workId: string, checked: boolean) {
    const next = new Set(selectedWorkIds);
    if (checked) next.add(workId);
    else next.delete(workId);
    onChange({ profileSharedWorkIds: eligibleSharedWorks.filter((work) => next.has(work.id)).map((work) => work.id) });
  }

  function moveDisplayedProject(index: number, direction: -1 | 1) {
    const orderedIds = displayedProjects.map((project) => project.id);
    onChange({ profileProjectOrder: moveItem(orderedIds, index, index + direction) });
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <div>
          <h3 className="font-display text-xl font-bold">Dự án chung trên profile</h3>
          <p className="mt-1 text-sm text-ivory-muted">Chọn những dự án tập thể đã gắn thành viên này. Bỏ chọn sẽ chỉ ẩn dự án khỏi profile, không xóa dự án chung.</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Lọc công cụ dự án thành viên">
          {([
            ["all", `TẤT CẢ (${member.showcase.length + eligibleSharedWorks.length})`],
            ["personal", `CÁ NHÂN (${member.showcase.length})`],
            ["shared", `DỰ ÁN CHUNG (${eligibleSharedWorks.length})`],
          ] as const).map(([filter, label]) => <button key={filter} type="button" aria-pressed={projectFilter === filter} onClick={() => setProjectFilter(filter)} className={"rounded-lg border px-3 py-2 text-[10px] font-mono transition " + (projectFilter === filter ? "border-rec bg-rec/10 text-rec" : "border-white/10 text-ivory-muted hover:border-white/25 hover:text-ivory")}>{label}</button>)}
        </div>
        {projectFilter !== "personal" ? eligibleSharedWorks.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {eligibleSharedWorks.map((work) => (
              <label key={work.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-obsidian/70 p-3 hover:border-rec/50">
                <input
                  type="checkbox"
                  checked={selectedWorkIds.has(work.id)}
                  onChange={(event) => toggleSharedWork(work.id, event.target.checked)}
                  className="mt-1 accent-[#ff4d00]"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ivory">{work.title}</span>
                  <span className="mt-1 block text-xs text-ivory-subtle">{work.year} · {work.category}</span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-white/10 p-4 text-sm text-ivory-muted">Chưa có dự án chung gắn với thành viên này. Hãy thêm thành viên vào dự án trong mục “Dự án”.</p>
        ) : <p className="rounded-xl border border-white/10 p-4 text-sm text-ivory-muted">Đang lọc dự án cá nhân; dự án chung hiện được ẩn.</p>}
      </section>

      {projectFilter !== "shared" ? <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold">Dự án cá nhân ({member.showcase.length})</h3>
            <p className="mt-1 text-sm text-ivory-muted">Tạo album hoặc dự án riêng. Mỗi bài có thể dùng link Google Drive hoặc album ảnh đã tải lên.</p>
          </div>
          <button type="button" onClick={addPersonalProject} className="inline-flex items-center gap-2 rounded-xl bg-rec px-3.5 py-2.5 text-xs font-mono font-bold text-obsidian">
            <Plus className="h-4 w-4" /> THÊM DỰ ÁN CÁ NHÂN
          </button>
        </div>

        {member.showcase.length ? member.showcase.map((item, index) => (
          <details key={item.id} className="group rounded-2xl border border-white/10 bg-obsidian/50">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4">
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ivory">{item.title || "Dự án chưa đặt tên"}</span>
                <span className="mt-1 block truncate text-xs text-ivory-subtle">CÁ NHÂN · {item.year || "Chưa đặt năm"} · {item.kind}</span>
              </span>
            </summary>

            <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  aria-label={`Xóa dự án ${item.title}`}
                  onClick={() => onChange({ showcase: member.showcase.filter((candidate) => candidate.id !== item.id) })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 px-2.5 py-2 text-xs text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> XÓA DỰ ÁN
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Tên dự án" value={item.title} onChange={(title) => updateShowcaseItem(item.id, { title })} />
                <AdminField label="Tên phụ / khách hàng" value={item.subtitle} onChange={(subtitle) => updateShowcaseItem(item.id, { subtitle })} />
                <AdminField label="Năm" value={item.year ?? ""} onChange={(year) => updateShowcaseItem(item.id, { year })} />
                <AdminField label="Nhãn / thông số" value={item.durationOrSpec} onChange={(durationOrSpec) => updateShowcaseItem(item.id, { durationOrSpec })} />
                <label className="block space-y-1.5">
                  <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Loại dự án</span>
                  <select value={item.kind} onChange={(event) => updateShowcaseItem(item.id, { kind: event.target.value as BentoItem["kind"] })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm text-ivory">
                    <option value="photo">Nhiếp ảnh</option><option value="reel">Video / Reel</option><option value="poster">Poster</option><option value="motion">Motion / thiết kế</option>
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Kích thước thẻ</span>
                  <select value={item.span} onChange={(event) => updateShowcaseItem(item.id, { span: event.target.value as BentoItem["span"] })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm text-ivory">
                    <option value="normal">Tiêu chuẩn</option><option value="wide">Rộng</option><option value="tall">Cao</option>
                  </select>
                </label>
              </div>

              <AdminField label="Mô tả dự án" value={item.description ?? ""} multiline rows={4} onChange={(description) => updateShowcaseItem(item.id, { description: description || undefined })} />
              <AdminImageField label="Ảnh bìa" value={item.image} folder="thiet-bi-gia/projects" signatureEndpoint={signatureEndpoint} onChange={(image) => updateShowcaseItem(item.id, { image })} />
              <AdminDriveFolderField value={item.galleryDriveFolderUrl} onChange={(galleryDriveFolderUrl) => updateShowcaseItem(item.id, { galleryDriveFolderUrl })} hint="Ảnh trong link này sẽ hiện khi mở album dự án. Chỉ ảnh trực tiếp trong thư mục; đặt tên 01, 02, 03… để sắp thứ tự." />
              <AdminField label="Thông số EXIF (tùy chọn)" value={item.exifSpec ?? ""} onChange={(exifSpec) => updateShowcaseItem(item.id, { exifSpec: exifSpec || undefined })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Link video (tùy chọn)" value={item.videoUrl ?? ""} onChange={(videoUrl) => updateShowcaseItem(item.id, { videoUrl: videoUrl || undefined })} hint="Dán link YouTube hoặc video liên quan." />
                <AdminField label="Link ngoài (tùy chọn)" value={item.externalUrl ?? ""} onChange={(externalUrl) => updateShowcaseItem(item.id, { externalUrl: externalUrl || undefined })} hint="Website, Behance hoặc bài đăng dự án." />
              </div>

              <div className="space-y-3 rounded-xl border border-white/10 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><h4 className="text-sm font-bold">Ảnh trong album ({item.gallery?.length ?? 0})</h4><p className="mt-1 text-xs text-ivory-subtle">Từng ảnh có thể tải lên Cloudinary hoặc nhập URL.</p></div>
                  <button type="button" onClick={() => updateShowcaseItem(item.id, { gallery: [...(item.gallery ?? []), ""] })} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-ivory hover:border-rec"><Plus className="h-3.5 w-3.5" /> THÊM ẢNH</button>
                </div>
                <AdminMultiImageField
                  label="Tải nhiều ảnh cùng lúc"
                  folder="thiet-bi-gia/projects"
                  signatureEndpoint={signatureEndpoint}
                  onUploaded={(urls) => updateShowcaseItem(item.id, { gallery: [...(item.gallery ?? []).filter(Boolean), ...urls] })}
                />
                {(item.gallery ?? []).map((image, imageIndex) => (
                  <div key={`${item.id}-gallery-${imageIndex}`} className="rounded-xl border border-white/10 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-ivory-subtle"><span>ẢNH {String(imageIndex + 1).padStart(2, "0")}</span><button type="button" onClick={() => updateShowcaseItem(item.id, { gallery: item.gallery?.filter((_, candidateIndex) => candidateIndex !== imageIndex) })} className="inline-flex items-center gap-1 text-red-300"><Trash2 className="h-3.5 w-3.5" /> GỠ</button></div>
                    <AdminImageField label="Ảnh album" value={image} folder="thiet-bi-gia/projects" signatureEndpoint={signatureEndpoint} onChange={(nextImage) => updateShowcaseItem(item.id, { gallery: item.gallery?.map((src, candidateIndex) => candidateIndex === imageIndex ? nextImage : src) })} />
                  </div>
                ))}
              </div>
            </div>
          </details>
        )) : (
          <p className="rounded-xl border border-white/10 p-4 text-sm text-ivory-muted">Chưa có dự án cá nhân. Bấm “Thêm dự án cá nhân” để tạo bài đầu tiên.</p>
        )}
      </section> : null}

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <div>
          <h3 className="font-display text-xl font-bold">Thứ tự bài trên profile</h3>
          <p className="mt-1 text-sm text-ivory-muted">Dùng mũi tên để sắp xếp chung dự án cá nhân và dự án tập thể. Thứ tự này được dùng trên trang profile thành viên.</p>
        </div>
        {displayedProjects.length ? (
          <ol className="space-y-2">
            {displayedProjects.map((project, index) => (
              <li key={project.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-obsidian/70 p-3">
                <span className="w-8 shrink-0 text-center font-mono text-xs text-rec">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ivory">{project.title}</span>
                  <span className="mt-1 block text-[10px] font-mono text-ivory-subtle">{project.scope === "personal" ? "CÁ NHÂN" : "DỰ ÁN CHUNG"}</span>
                </span>
                <button type="button" disabled={index === 0} onClick={() => moveDisplayedProject(index, -1)} aria-label="Đưa bài lên" className="rounded-lg border border-white/10 p-2 text-ivory-muted hover:border-rec hover:text-ivory disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" disabled={index === displayedProjects.length - 1} onClick={() => moveDisplayedProject(index, 1)} aria-label="Đưa bài xuống" className="rounded-lg border border-white/10 p-2 text-ivory-muted hover:border-rec hover:text-ivory disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-xl border border-white/10 p-4 text-sm text-ivory-muted">Chọn dự án chung hoặc thêm dự án cá nhân để sắp xếp.</p>
        )}
      </section>
    </div>
  );
}
