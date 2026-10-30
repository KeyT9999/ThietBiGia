export function toYoutubeEmbedUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw.includes("://") ? raw : "https://" + raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") id = url.searchParams.get("v") ?? "";
      else {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(parts[0] ?? "")) id = parts[1] ?? "";
      }
    }

    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return "https://www.youtube-nocookie.com/embed/" + id;
  } catch {
    return null;
  }
}

export function isGenericWorkCover(src: string) {
  const path = src.trim().replace(/^https?:\/\/[^/]+/i, "").split(/[?#]/, 1)[0];
  return !path || /^\/media\/works\/work-\d+\.(?:jpe?g|png|webp)$/i.test(path);
}

export function shouldUseYoutubeCoverPreview(videoUrl: string | undefined, coverImage: string) {
  return Boolean(videoUrl && toYoutubeEmbedUrl(videoUrl) && isGenericWorkCover(coverImage));
}

export function getYoutubePreviewUrl(input: string, autoPlay: boolean) {
  const embedUrl = toYoutubeEmbedUrl(input);
  if (!embedUrl) return null;
  const videoId = embedUrl.split("/").pop();
  const params = new URLSearchParams();
  if (autoPlay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
    params.set("controls", "0");
    params.set("loop", "1");
    if (videoId) params.set("playlist", videoId);
  }
  params.set("playsinline", "1");
  params.set("rel", "0");
  return `${embedUrl}?${params.toString()}`;
}
