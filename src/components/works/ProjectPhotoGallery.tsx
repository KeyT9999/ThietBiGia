"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Images, RefreshCw } from "lucide-react";
import type { WorkProject } from "@/data/schema";
import { extractGoogleDriveFolderId } from "@/lib/google-drive";

type ProjectPhoto = {
  id: string;
  name: string;
  src: string;
  viewUrl: string;
  width: number | null;
  height: number | null;
};

type GalleryResponse = { ok: boolean; images?: ProjectPhoto[]; error?: string };

export function ProjectPhotoGallery({ work }: { work: WorkProject }) {
  const [drivePhotos, setDrivePhotos] = useState<ProjectPhoto[] | null>(null);
  const [loading, setLoading] = useState(Boolean(work.galleryDriveFolderUrl));
  const [error, setError] = useState("");
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setFailedPhotoIds(new Set());
    if (!work.galleryDriveFolderUrl) {
      setDrivePhotos(null);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    if (refreshNonce === 0) setDrivePhotos(null);
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ slug: work.slug });
    const folderId = extractGoogleDriveFolderId(work.galleryDriveFolderUrl);
    if (folderId) params.set("v", folderId);
    if (refreshNonce > 0) params.set("t", String(refreshNonce));

    fetch(`/api/works/gallery?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json() as GalleryResponse;
        if (!response.ok || !result.ok) throw new Error(result.error || "Không tải được album.");
        setDrivePhotos(result.images ?? []);
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Không tải được album Google Drive.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [work.galleryDriveFolderUrl, work.slug, refreshNonce]);

  const legacyPhotos: ProjectPhoto[] = work.galleryImages.map((src, index) => ({
    id: `legacy-${index}-${src}`,
    name: `${work.title} — ảnh ${index + 1}`,
    src,
    viewUrl: src,
    width: null,
    height: null,
  }));
  const rawPhotos: ProjectPhoto[] = work.galleryDriveFolderUrl
    ? drivePhotos ?? (error ? legacyPhotos : [])
    : legacyPhotos;
  const photos = rawPhotos.filter((photo) => !failedPhotoIds.has(photo.id));
  const emptyDriveFolder = Boolean(
    work.galleryDriveFolderUrl && drivePhotos && photos.length === 0 && !loading
  );

  if (!photos.length && !loading && !error && !emptyDriveFolder) return null;

  return (
    <section className="space-y-4" aria-labelledby="project-photo-gallery-title">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-obsidian-border pb-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-rec">PROJECT PHOTO ARCHIVE</p>
          <h2 id="project-photo-gallery-title" className="mt-1 flex items-center gap-2 font-display text-xl font-bold text-ivory">
            <Images className="h-5 w-5 text-rec" /> ẢNH DỰ ÁN
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {photos.length ? <span className="font-mono text-xs text-ivory-muted">{photos.length} ẢNH</span> : null}
          {work.galleryDriveFolderUrl ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => setRefreshNonce((current) => current + 1)}
              title="Đồng bộ lại danh sách ảnh mới nhất từ Google Drive"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 font-mono text-[10px] text-ivory-muted transition hover:border-rec hover:text-ivory disabled:cursor-wait disabled:opacity-50"
            >
              <RefreshCw className={"h-3 w-3 text-rec " + (loading ? "animate-spin" : "")} />
              {loading ? "ĐANG ĐỒNG BỘ…" : "ĐỒNG BỘ LẠI"}
            </button>
          ) : null}
        </div>
      </div>

      {loading && !drivePhotos?.length ? <p className="rounded-xl border border-white/10 px-4 py-3 text-sm text-ivory-muted">Đang tải album ảnh…</p> : null}
      {emptyDriveFolder ? <p className="rounded-xl border border-white/10 px-4 py-3 text-sm text-ivory-muted">Thư mục Drive này chưa có ảnh. Hãy thêm ảnh trực tiếp vào thư mục rồi bấm Đồng bộ lại.</p> : null}
      {error ? <p role="status" className="rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-xs leading-relaxed text-amber-100">{error}{photos.length ? " Đang hiển thị album đã lưu trước đây." : ""}</p> : null}

      {photos.length ? (
        <div className="columns-2 gap-2 sm:columns-3 sm:gap-3 xl:columns-4">
          {photos.map((photo, index) => (
            <a
              key={photo.id}
              href={photo.viewUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative mb-2 block break-inside-avoid overflow-hidden rounded-lg border border-white/10 bg-obsidian sm:mb-3"
              aria-label={`Mở ảnh ${index + 1}: ${photo.name}`}
            >
              <img
                src={photo.src}
                alt={photo.name}
                width={photo.width ?? undefined}
                height={photo.height ?? undefined}
                loading="lazy"
                decoding="async"
                onError={() => {
                  setFailedPhotoIds((current) => {
                    if (current.has(photo.id)) return current;
                    const next = new Set(current);
                    next.add(photo.id);
                    return next;
                  });
                }}
                className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-obsidian/85 to-transparent px-3 pb-2 pt-8 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                <span className="truncate">{photo.name}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}
