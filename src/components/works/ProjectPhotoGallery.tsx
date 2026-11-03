"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, RefreshCw, X } from "lucide-react";
import type { WorkProject } from "@/data/schema";
import { extractGoogleDriveFolderId } from "@/lib/google-drive";

type ProjectPhoto = {
  id: string;
  name: string;
  src: string;
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
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
  const activePhotoIndex = viewingIndex === null || photos.length === 0
    ? null
    : Math.min(viewingIndex, photos.length - 1);
  const activePhoto = activePhotoIndex === null ? null : photos[activePhotoIndex];
  const lightboxOpen = activePhotoIndex !== null;
  const photoCount = photos.length;

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewingIndex(null);
      if (event.key === "ArrowRight" && photoCount > 1) {
        setViewingIndex((current) => current === null ? 0 : (current + 1) % photoCount);
      }
      if (event.key === "ArrowLeft" && photoCount > 1) {
        setViewingIndex((current) => current === null ? 0 : (current - 1 + photoCount) % photoCount);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, photoCount]);

  function getPhotoSrc(photo: ProjectPhoto) {
    if (!work.galleryDriveFolderUrl || refreshNonce === 0) return photo.src;
    return `${photo.src}${photo.src.includes("?") ? "&" : "?"}refresh=${refreshNonce}`;
  }

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
              onClick={() => setRefreshNonce((current) => Math.max(Date.now(), current + 1))}
              title="Tải lại danh sách ảnh mới nhất từ Google Drive"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 font-mono text-[10px] text-ivory-muted transition hover:border-rec hover:text-ivory disabled:cursor-wait disabled:opacity-50"
            >
              <RefreshCw className={"h-3 w-3 text-rec " + (loading ? "animate-spin" : "")} />
              {loading ? "ĐANG CẬP NHẬT…" : "CẬP NHẬT ẢNH"}
            </button>
          ) : null}
        </div>
      </div>

      {loading && !drivePhotos?.length ? <p className="rounded-xl border border-white/10 px-4 py-3 text-sm text-ivory-muted">Đang tải album ảnh…</p> : null}
      {emptyDriveFolder ? <p className="rounded-xl border border-white/10 px-4 py-3 text-sm text-ivory-muted">Thư mục Drive này chưa có ảnh. Hãy thêm ảnh trực tiếp vào thư mục rồi bấm Cập nhật ảnh.</p> : null}
      {error ? <p role="status" className="rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-xs leading-relaxed text-amber-100">{error}{photos.length ? " Đang hiển thị album đã lưu trước đây." : ""}</p> : null}

      {photos.length ? (
        <div className="columns-2 gap-2 sm:columns-3 sm:gap-3 xl:columns-4">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setViewingIndex(index)}
              className="group relative mb-2 block w-full break-inside-avoid cursor-zoom-in overflow-hidden rounded-lg border border-white/10 bg-obsidian text-left sm:mb-3"
              aria-label={`Phóng lớn ảnh ${index + 1}: ${photo.name}`}
            >
              <img
                src={getPhotoSrc(photo)}
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
                <span className="truncate">{photo.name}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {mounted && activePhoto && activePhotoIndex !== null
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Ảnh ${activePhotoIndex + 1}: ${activePhoto.name}`}
              onClick={() => setViewingIndex(null)}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-6"
            >
              <div onClick={(event) => event.stopPropagation()} className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 border-b border-white/10 bg-obsidian/90 px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <p className="truncate font-mono text-[10px] uppercase tracking-wider text-rec">{work.title}</p>
                  <p className="truncate text-xs text-ivory-muted">{activePhoto.name} · {activePhotoIndex + 1}/{photos.length}</p>
                </div>
                <button
                  type="button"
                  aria-label="Đóng ảnh phóng lớn"
                  onClick={(event) => { event.stopPropagation(); setViewingIndex(null); }}
                  className="shrink-0 rounded-lg border border-white/15 p-2 text-ivory-muted transition hover:border-rec hover:text-ivory"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex h-full w-full items-center justify-center pt-14 pb-3" onClick={(event) => event.stopPropagation()}>
                <img
                  src={getPhotoSrc(activePhoto)}
                  alt={activePhoto.name}
                  className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                />
              </div>

              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Ảnh trước"
                    onClick={(event) => { event.stopPropagation(); setViewingIndex((activePhotoIndex - 1 + photos.length) % photos.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-obsidian/85 p-3 text-ivory transition hover:border-rec sm:left-6"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Ảnh tiếp theo"
                    onClick={(event) => { event.stopPropagation(); setViewingIndex((activePhotoIndex + 1) % photos.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-obsidian/85 p-3 text-ivory transition hover:border-rec sm:right-6"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
