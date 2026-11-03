"use client";

import { useEffect, useState } from "react";
import { Images, Info, ListChecks, Trash2, Users } from "lucide-react";
import type { CrewMember, PartnerOrganization, ProjectCredit, WorkProject } from "@/data/schema";
import { toYoutubeEmbedUrl } from "@/lib/youtube";
import { AdminDriveFolderField, AdminField, AdminImageField, AdminMultiImageField, AdminStringListField } from "./AdminFields";

export function ProjectEditor({
  work,
  workPosition,
  workCount,
  crew,
  partnerOrganizations,
  canDelete,
  onChange,
  onMovePosition,
  onDelete,
}: {
  work: WorkProject;
  workPosition: number;
  workCount: number;
  crew: CrewMember[];
  partnerOrganizations: PartnerOrganization[];
  canDelete: boolean;
  onChange: (patch: Partial<WorkProject>) => void;
  onMovePosition: (targetOneBased: number) => void;
  onDelete: () => void;
}) {
  const [section, setSection] = useState<"basic" | "media" | "details" | "crew">("basic");
  const formattedPosition = String(Math.max(1, workPosition)).padStart(2, "0");
  const [orderDraft, setOrderDraft] = useState(formattedPosition);

  useEffect(() => {
    setOrderDraft(formattedPosition);
  }, [work.id, formattedPosition]);

  function commitOrderDraft() {
    const requested = Number(orderDraft.trim());
    if (!Number.isInteger(requested) || requested < 1 || workCount < 1) {
      setOrderDraft(formattedPosition);
      return;
    }
    const clamped = Math.min(Math.max(1, requested), workCount);
    setOrderDraft(String(clamped).padStart(2, "0"));
    if (clamped !== workPosition) {
      onMovePosition(clamped);
    }
  }

  function updateCredit(index: number, patch: Partial<ProjectCredit>) {
    onChange({ credits: work.credits.map((credit, i) => i === index ? { ...credit, ...patch } : credit) });
  }

  return (
    <div className="space-y-5 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] text-rec">PROJECT #{formattedPosition} / {work.slug}</p>
          <h2 className="mt-1 font-display text-2xl font-bold">{work.title}</h2>
        </div>
        <button type="button" disabled={!canDelete} onClick={onDelete} className="inline-flex items-center gap-2 rounded-xl border border-red-400/25 px-3 py-2 text-xs font-mono text-red-300 disabled:opacity-30">
          <Trash2 className="h-4 w-4" /> XÓA DỰ ÁN
        </button>
      </div>

      <label className="flex cursor-pointer flex-wrap items-center justify-between gap-3 rounded-2xl border border-rec/25 bg-rec/[0.06] px-4 py-3">
        <span className="space-y-1">
          <span className="block text-sm font-semibold text-ivory">Hiển thị thẻ 3D ở trang chủ</span>
          <span className="block text-xs text-ivory-muted">Bật để dự án tham gia vòng thẻ 3D. Dự án vẫn xuất hiện ở trang Dự án và hồ sơ thành viên khi tắt.</span>
        </span>
        <input
          type="checkbox"
          checked={work.showOnHome3D !== false}
          onChange={(event) => onChange({ showOnHome3D: event.target.checked })}
          className="h-5 w-5 shrink-0 accent-[#FF4D00]"
        />
      </label>

      <nav aria-label="Công cụ dự án" className="grid grid-cols-2 gap-2">
        {([
          { id: "basic", label: "Thông tin", detail: "Tên, thứ tự, tóm tắt", icon: Info },
          { id: "media", label: "Ảnh & video", detail: "Ảnh bìa, album, YouTube", icon: Images },
          { id: "details", label: "Hậu trường", detail: "Ghi chú và thiết bị", icon: ListChecks },
          { id: "crew", label: "Ekip & đối tác", detail: `${work.credits.length} thành viên · ${(work.partnerIds ?? []).length} đơn vị`, icon: Users },
        ] as const).map((item) => {
          const Icon = item.icon;
          return <button key={item.id} type="button" onClick={() => setSection(item.id)} aria-current={section === item.id ? "page" : undefined} className={"flex min-w-0 items-start gap-3 rounded-xl border px-3 py-3 text-left transition sm:px-4 " + (section === item.id ? "border-rec/60 bg-rec/10" : "border-white/10 bg-obsidian/50 hover:border-white/25")}>
            <Icon className={"mt-0.5 h-4 w-4 shrink-0 " + (section === item.id ? "text-rec" : "text-ivory-subtle")} aria-hidden="true" />
            <span className="min-w-0"><span className="block text-sm font-semibold text-ivory">{item.label}</span><span className="mt-1 hidden text-xs text-ivory-subtle sm:block">{item.detail}</span></span>
          </button>;
        })}
      </nav>

      {section === "basic" ? <section className="space-y-5" aria-label="Thông tin dự án">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Tên dự án" value={work.title} multiline rows={2} onChange={(title) => onChange({ title })} hint="Không giới hạn ký tự; ô sẽ tự xuống dòng khi tiêu đề dài." />
        <AdminField label="Slug URL" value={work.slug} onChange={(slug) => onChange({ slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-") })} />
        <AdminField label="Khách hàng / series" value={work.clientOrSeries} onChange={(clientOrSeries) => onChange({ clientOrSeries })} />
        <AdminField label="Danh mục" value={work.category} onChange={(category) => onChange({ category })} />
        <AdminField label="Năm" value={work.year} onChange={(year) => onChange({ year })} />
        <label className="block space-y-1.5">
          <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Số thứ tự hiển thị (1–{workCount})</span>
          <input
            type="number"
            min={1}
            max={workCount}
            step={1}
            value={orderDraft}
            onChange={(event) => setOrderDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitOrderDraft();
                event.currentTarget.blur();
              }
            }}
            onBlur={commitOrderDraft}
            className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm text-ivory outline-none focus:border-rec"
          />
          <span className="block text-xs text-ivory-subtle">Nhập vị trí mới rồi nhấn Enter (hoặc kéo thả thẻ ở cột trái) để chuyển dự án và tự đánh lại số liên tiếp.</span>
        </label>
        <AdminField label="Timecode / thời lượng" value={work.durationTimecode} onChange={(durationTimecode) => onChange({ durationTimecode })} />
        <AdminField label="Màu nhấn" value={work.accentColor} onChange={(accentColor) => onChange({ accentColor })} />
        <AdminField label="Thông số máy" value={work.cameraSpec} onChange={(cameraSpec) => onChange({ cameraSpec })} />
        <AdminField label="Thông số EXIF" value={work.exifSpec ?? ""} onChange={(exifSpec) => onChange({ exifSpec: exifSpec || undefined })} />
      </div>

      <AdminField label="Tóm tắt dự án" value={work.summary} multiline rows={5} onChange={(summary) => onChange({ summary })} />
      </section> : null}

      {section === "media" ? <section className="space-y-5" aria-label="Ảnh và video dự án">
      <AdminImageField label="Ảnh bìa dự án" value={work.coverImage} folder="thiet-bi-gia/projects" onChange={(coverImage) => onChange({ coverImage })} />
      <section className="space-y-3 rounded-2xl border border-white/10 p-4">
        <div><h3 className="font-display text-lg font-bold">Album ảnh hiển thị bên dưới</h3><p className="mt-1 text-xs text-ivory-muted">Thêm một link thư mục để website tự lấy ảnh và xếp thành lưới sát nhau, giữ đúng tỷ lệ ảnh ngang/dọc. Ảnh bìa phía trên vẫn là một ảnh riêng.</p></div>
        <AdminDriveFolderField value={work.galleryDriveFolderUrl} onChange={(galleryDriveFolderUrl) => onChange({ galleryDriveFolderUrl })} hint="Chỉ lấy ảnh nằm trực tiếp trong thư mục; không đưa ảnh bìa vào album nếu không muốn ảnh bị lặp. Đặt tên 01, 02, 03… để tự sắp thứ tự. Sau khi thêm, xóa hoặc thay ảnh trên Drive, bấm Cập nhật ảnh từ Drive để nạp danh sách mới." />
      </section>
      <details className="rounded-2xl border border-white/10 p-4">
        <summary className="cursor-pointer select-none text-sm font-semibold text-ivory">Album cũ tải lên website ({work.galleryImages.length} ảnh)</summary>
        <div className="mt-4 space-y-3">
          <p className="text-xs text-ivory-muted">Dùng để giữ và chỉnh các album đã tải lên trước đây. Album Google Drive ở trên sẽ được ưu tiên khi có link hợp lệ.</p>
          <AdminMultiImageField label="Thêm ảnh vào album cũ" folder="thiet-bi-gia/projects" onUploaded={(urls) => onChange({ galleryImages: [...work.galleryImages, ...urls] })} />
          <AdminStringListField label="Ảnh album cũ (URL)" value={work.galleryImages} onChange={(galleryImages) => onChange({ galleryImages })} placeholder="Dán URL ảnh" addLabel="THÊM URL ẢNH" reorderable />
        </div>
      </details>
      <AdminField label="Ảnh trước hậu kỳ (tùy chọn)" value={work.beforeImage ?? ""} onChange={(beforeImage) => onChange({ beforeImage: beforeImage || undefined })} />
      <AdminField label="Link video YouTube" value={work.videoEmbedUrl ?? ""} onChange={(videoEmbedUrl) => onChange({ videoEmbedUrl: videoEmbedUrl || undefined })} hint="Dán link watch, Shorts hoặc youtu.be. Website sẽ nhúng player trong trang dự án." />
      {work.videoEmbedUrl && !toYoutubeEmbedUrl(work.videoEmbedUrl) ? <p className="text-xs text-amber-300">Link YouTube chưa hợp lệ; kiểm tra trước khi lưu.</p> : null}
      </section> : null}

      {section === "details" ? <section className="space-y-5" aria-label="Ghi chú hậu trường">
      <AdminStringListField label="Ghi chú hậu trường" value={work.btsNotes} onChange={(btsNotes) => onChange({ btsNotes })} placeholder="Nhập ghi chú hậu trường" addLabel="THÊM GHI CHÚ" reorderable />
      <AdminStringListField label="Thiết bị sử dụng" value={work.gearUsed} onChange={(gearUsed) => onChange({ gearUsed })} placeholder="Nhập thiết bị sử dụng" addLabel="THÊM THIẾT BỊ" reorderable />
      </section> : null}

      {section === "crew" ? (
      <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold">Thành viên tham gia</h3>
            <p className="text-xs text-ivory-muted">Gắn người tham gia và vai trò trong dự án.</p>
          </div>
          <select
            value=""
            onChange={(event) => {
              const memberSlug = event.target.value;
              if (!memberSlug || work.credits.some((credit) => credit.memberSlug === memberSlug)) return;
              onChange({ credits: [...work.credits, { memberSlug, roleOnProject: "Thành viên ekip" }] });
            }}
            className="rounded-lg border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory"
          >
            <option value="">Thêm thành viên</option>
            {crew.filter((member) => !work.credits.some((credit) => credit.memberSlug === member.slug)).map((member) => <option key={member.slug} value={member.slug}>{member.name}</option>)}
          </select>
        </div>
        {work.credits.map((credit, index) => (
          <div key={credit.memberSlug} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <select value={credit.memberSlug} onChange={(event) => updateCredit(index, { memberSlug: event.target.value })} className="rounded-lg border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory">
              {crew.map((member) => <option key={member.slug} value={member.slug} disabled={work.credits.some((candidate, candidateIndex) => candidateIndex !== index && candidate.memberSlug === member.slug)}>{member.name}</option>)}
            </select>
            <input value={credit.roleOnProject} onChange={(event) => updateCredit(index, { roleOnProject: event.target.value })} placeholder="Vai trò" className="rounded-lg border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory" />
            <button type="button" onClick={() => onChange({ credits: work.credits.filter((_, i) => i !== index) })} className="rounded-lg border border-red-400/20 px-3 py-2 text-red-300" title="Gỡ thành viên"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </section>
      <section className="space-y-3 rounded-2xl border border-white/10 p-4">
        <div>
          <h3 className="font-display text-lg font-bold">Đơn vị đồng hành</h3>
          <p className="text-xs text-ivory-muted">Chọn các đối tác đã tạo ở công cụ “Đơn vị đồng hành”.</p>
        </div>
        {partnerOrganizations.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {partnerOrganizations.map((organization) => {
              const checked = (work.partnerIds ?? []).includes(organization.id);
              return <label key={organization.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${checked ? "border-rec/50 bg-rec/[0.07]" : "border-white/10 bg-obsidian/50 hover:border-white/20"}`}>
                <input type="checkbox" checked={checked} onChange={(event) => {
                  const next = new Set(work.partnerIds ?? []);
                  if (event.target.checked) next.add(organization.id);
                  else next.delete(organization.id);
                  onChange({ partnerIds: partnerOrganizations.filter((item) => next.has(item.id)).map((item) => item.id) });
                }} className="accent-[#ff4d00]" />
                {organization.logo ? <img src={organization.logo} alt="" className="h-9 w-9 shrink-0 rounded-md border border-white/10 bg-white object-contain p-1" /> : <span className="h-9 w-9 shrink-0 rounded-md border border-white/10 bg-white/5" />}
                <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ivory">{organization.name}</span>{organization.description ? <span className="mt-0.5 block truncate text-[10px] text-ivory-subtle">{organization.description}</span> : null}</span>
              </label>;
            })}
          </div>
        ) : <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-ivory-subtle">Chưa có đơn vị đồng hành. Tạo đơn vị ở tab riêng trong công cụ admin trước.</p>}
      </section>
      </div>
      ) : null}
    </div>
  );
}
