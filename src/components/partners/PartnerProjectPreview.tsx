"use client";

import { useState } from "react";
import { Clapperboard } from "lucide-react";
import { getYoutubeThumbnailUrl, shouldUseYoutubeCoverPreview } from "@/lib/youtube";

export function PartnerProjectPreview({
  image,
  videoUrl,
  title,
  className = "",
}: {
  image: string;
  videoUrl?: string;
  title: string;
  className?: string;
}) {
  const cover = image.trim();
  const youtubeThumbnail = videoUrl ? getYoutubeThumbnailUrl(videoUrl) : null;
  const youtubeMaxResolution = youtubeThumbnail?.replace(/\/hqdefault\.jpg$/, "/maxresdefault.jpg") ?? null;
  const videoSources = [youtubeMaxResolution, youtubeThumbnail].filter((source): source is string => Boolean(source));
  const sources = Array.from(new Set(
    (shouldUseYoutubeCoverPreview(videoUrl, cover)
      ? [...videoSources, cover]
      : [cover, ...videoSources])
      .filter((source): source is string => Boolean(source))
  ));
  const sourceKey = JSON.stringify(sources);
  const [failures, setFailures] = useState<{ key: string; sources: string[] }>({ key: "", sources: [] });
  const failedSources = failures.key === sourceKey ? failures.sources : [];
  const src = sources.find((source) => !failedSources.includes(source));

  function markFailed(source: string) {
    setFailures((current) => ({
      key: sourceKey,
      sources: Array.from(new Set([...(current.key === sourceKey ? current.sources : []), source])),
    }));
  }

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {src ? <img
        key={src}
        src={src}
        alt={title}
        loading="lazy"
        onError={() => markFailed(src)}
        onLoad={(event) => {
          if (videoSources.includes(src) && event.currentTarget.naturalWidth <= 120) markFailed(src);
        }}
        className="h-full w-full object-contain"
      /> : <div className="flex h-full w-full min-h-12 items-center justify-center text-ivory-subtle" role="img" aria-label={`Chưa có ảnh xem trước: ${title}`}><Clapperboard className="h-6 w-6" /></div>}
    </div>
  );
}
