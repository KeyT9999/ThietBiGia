"use client";

import { Trash2 } from "lucide-react";
import type { CrewMember, ProjectCredit, WorkProject } from "@/data/schema";
import { toYoutubeEmbedUrl } from "@/lib/youtube";
import { AdminDriveFolderField, AdminField, AdminImageField, AdminMultiImageField, AdminStringListField } from "./AdminFields";

export function ProjectEditor({
  work,
  crew,
  canDelete,
  onChange,
  onDelete,
}: {
  work: WorkProject;
  crew: CrewMember[];
  canDelete: boolean;
  onChange: (patch: Partial<WorkProject>) => void;
  onDelete: () => void;
}) {
  function updateCredit(index: number, patch: Partial<ProjectCredit>) {
    onChange({ credits: work.credits.map((credit, i) => i === index ? { ...credit, ...patch } : credit) });
  }

  return (
    <div className="space-y-5 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] text-rec">PROJECT / {work.slug}</p>
          <h2 className="mt-1 font-display text-2xl font-bold">{work.title}</h2>
        </div>
        <button type="button" disabled={!canDelete} onClick={onDelete} className="inline-flex items-center gap-2 rounded-xl border border-red-400/25 px-3 py-2 text-xs font-mono text-red-300 disabled:opacity-30">
          <Trash2 className="h-4 w-4" /> XÓA DỰ ÁN
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Tên dự án" value={work.title} multiline rows={2} onChange={(title) => onChange({ title })} hint="Không giới hạn ký tự; ô sẽ tự xuống dòng khi tiêu đề dài." />
        <AdminField label="Slug URL" value={work.slug} onChange={(slug) => onChange({ slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-") })} />
        <AdminField label="Khách hàng / series" value={work.clientOrSeries} onChange={(clientOrSeries) => onChange({ clientOrSeries })} />
        <AdminField label="Danh mục" value={work.category} onChange={(category) => onChange({ category })} />
        <AdminField label="Năm" value={work.year} onChange={(year) => onChange({ year })} />
        <AdminField label="Nhãn thứ tự" value={work.indexLabel} onChange={(indexLabel) => onChange({ indexLabel })} hint="Tự cập nhật theo vị trí khi sắp xếp bằng mũi tên trong danh sách." />
        <AdminField label="Timecode / thời lượng" value={work.durationTimecode} onChange={(durationTimecode) => onChange({ durationTimecode })} />
        <AdminField label="Màu nhấn" value={work.accentColor} onChange={(accentColor) => onChange({ accentColor })} />
        <AdminField label="Thông số máy" value={work.cameraSpec} onChange={(cameraSpec) => onChange({ cameraSpec })} />
        <AdminField label="Thông số EXIF" value={work.exifSpec ?? ""} onChange={(exifSpec) => onChange({ exifSpec: exifSpec || undefined })} />
      </div>

      <AdminField label="Tóm tắt dự án" value={work.summary} multiline rows={5} onChange={(summary) => onChange({ summary })} />
      <AdminImageField label="Ảnh bìa dự án" value={work.coverImage} folder="thiet-bi-gia/projects" onChange={(coverImage) => onChange({ coverImage })} />
      <section className="space-y-3 rounded-2xl border border-white/10 p-4">
        <div><h3 className="font-display text-lg font-bold">Album ảnh hiển thị bên dưới</h3><p className="mt-1 text-xs text-ivory-muted">Thêm một link thư mục để website tự lấy ảnh và xếp thành lưới sát nhau, giữ đúng tỷ lệ ảnh ngang/dọc. Ảnh bìa phía trên vẫn là một ảnh riêng.</p></div>
        <AdminDriveFolderField value={work.galleryDriveFolderUrl} onChange={(galleryDriveFolderUrl) => onChange({ galleryDriveFolderUrl })} hint="Chỉ lấy ảnh nằm trực tiếp trong thư mục; không đưa ảnh bìa vào album nếu không muốn ảnh bị lặp. Đặt tên 01, 02, 03… để tự sắp thứ tự." />
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
      <AdminStringListField label="Ghi chú hậu trường" value={work.btsNotes} onChange={(btsNotes) => onChange({ btsNotes })} placeholder="Nhập ghi chú hậu trường" addLabel="THÊM GHI CHÚ" reorderable />
      <AdminStringListField label="Thiết bị sử dụng" value={work.gearUsed} onChange={(gearUsed) => onChange({ gearUsed })} placeholder="Nhập thiết bị sử dụng" addLabel="THÊM THIẾT BỊ" reorderable />

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
    </div>
  );
}
