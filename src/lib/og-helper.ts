import { promises as fs } from "node:fs";
import path from "node:path";

let cachedViFont: ArrayBuffer | null | undefined = undefined;

export function toAsciiStudio(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export async function readPublicImageDataUri(publicUrlPath: string): Promise<string | null> {
  try {
    const cleanRel = publicUrlPath.replace(/^\/+/, "").split("?")[0];
    const absPath = path.join(process.cwd(), "public", cleanRel);
    const buf = await fs.readFile(absPath);
    const ext = path.extname(cleanRel).toLowerCase();
    const mime =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function loadViOgFont(): Promise<ArrayBuffer | null> {
  if (cachedViFont !== undefined) return cachedViFont;
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700&display=swap",
      {
        headers: {
          // Request TrueType/OpenType format compatible with Satori
          "User-Agent":
            "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
        },
        signal: AbortSignal.timeout(2000),
      }
    );
    if (!cssRes.ok) {
      cachedViFont = null;
      return null;
    }
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(?:truetype|opentype)['"]?\)/i);
    const fontUrl = match?.[1];
    if (!fontUrl) {
      cachedViFont = null;
      return null;
    }
    const fontRes = await fetch(fontUrl, { signal: AbortSignal.timeout(2000) });
    if (!fontRes.ok) {
      cachedViFont = null;
      return null;
    }
    cachedViFont = await fontRes.arrayBuffer();
    return cachedViFont;
  } catch {
    cachedViFont = null;
    return null;
  }
}
