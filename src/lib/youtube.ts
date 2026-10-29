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
