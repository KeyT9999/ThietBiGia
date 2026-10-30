"use client";

import { getYoutubePreviewUrl } from "@/lib/youtube";

export function YouTubePreview({
  videoUrl,
  title,
  isHovered,
}: {
  videoUrl: string;
  title: string;
  isHovered: boolean;
}) {
  const src = getYoutubePreviewUrl(videoUrl, isHovered);
  if (!src) return null;

  return (
    <iframe
      src={src}
      title={`Video xem trước ${title}`}
      aria-hidden="true"
      tabIndex={-1}
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full scale-[1.02] border-0"
    />
  );
}
