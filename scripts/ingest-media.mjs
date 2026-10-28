#!/usr/bin/env node
/**
 * Thiết Bị Gia — Automated Media Ingest & Binary EXIF Extractor
 * Usage:
 *   npm run ingest:media
 *   npm run ingest:media -- --scan-only
 *   npm run ingest:media -- --member=doan-phuoc-truong-hai
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

/**
 * Pure Node.js binary JPEG EXIF reader (IFD0 + ExifSubIFD) — zero npm dependencies!
 * Extracts Make, Model, LensModel, FocalLength, FNumber, ExposureTime, ISOSpeedRatings.
 */
function readJpegExif(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length < 12 || buf.readUInt16BE(0) !== 0xffd8) return null;

    let offset = 2;
    while (offset + 4 < buf.length) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      if (marker === 0xda || marker === 0xd9) break; // SOS or EOI
      const segLen = buf.readUInt16BE(offset + 2);
      if (marker === 0xe1 && buf.toString("ascii", offset + 4, offset + 8) === "Exif") {
        return parseTiffHeader(buf, offset + 10);
      }
      offset += 2 + segLen;
    }
  } catch {
    return null;
  }
  return null;
}

function parseTiffHeader(buf, tiffStart) {
  if (tiffStart + 8 > buf.length) return null;
  const endian = buf.toString("ascii", tiffStart, tiffStart + 2);
  const le = endian === "II";
  if (!le && endian !== "MM") return null;

  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));

  const readRational = (valOff) => {
    if (valOff + 8 > buf.length) return null;
    const num = u32(valOff);
    const den = u32(valOff + 4);
    return den ? num / den : null;
  };

  const readString = (valOff, count) => {
    if (valOff + count > buf.length) return "";
    return buf
      .toString("utf8", valOff, valOff + count)
      .replace(/\0+$/g, "")
      .trim();
  };

  const out = {};

  const readIfd = (ifdRelOffset) => {
    const dirStart = tiffStart + ifdRelOffset;
    if (dirStart + 2 > buf.length) return;
    const entries = u16(dirStart);
    for (let i = 0; i < entries; i++) {
      const entry = dirStart + 2 + i * 12;
      if (entry + 12 > buf.length) break;
      const tag = u16(entry);
      const type = u16(entry + 2);
      const count = u32(entry + 4);
      const valPtr = entry + 8;

      const byteSize =
        type === 1 || type === 2 || type === 7
          ? count
          : type === 3
          ? count * 2
          : type === 4
          ? count * 4
          : type === 5 || type === 10
          ? count * 8
          : 0;
      const actualOffset = byteSize > 4 ? tiffStart + u32(valPtr) : valPtr;

      if (tag === 0x010f) out.make = readString(actualOffset, count);
      else if (tag === 0x0110) out.model = readString(actualOffset, count);
      else if (tag === 0xa434) out.lens = readString(actualOffset, count);
      else if (tag === 0x829a) {
        const exp = readRational(actualOffset);
        if (exp) {
          out.shutter = exp >= 1 ? `${exp.toFixed(1)}s` : `1/${Math.round(1 / exp)}s`;
        }
      } else if (tag === 0x829d) {
        const fn = readRational(actualOffset);
        if (fn) out.aperture = `f/${Number(fn.toFixed(1))}`;
      } else if (tag === 0x8827) {
        out.iso = type === 3 ? u16(actualOffset) : u32(actualOffset);
      } else if (tag === 0x920a) {
        const fl = readRational(actualOffset);
        if (fl) out.focalLength = `${Math.round(fl)}mm`;
      } else if (tag === 0x8769) {
        const subOffset = u32(valPtr);
        readIfd(subOffset);
      }
    }
  };

  readIfd(u32(tiffStart + 4));

  const parts = [];
  if (out.model) parts.push(out.model.toUpperCase());
  if (out.lens) parts.push(out.lens.toUpperCase());
  else if (out.focalLength) parts.push(out.focalLength);
  if (out.aperture) parts.push(out.aperture);
  if (out.shutter) parts.push(out.shutter);
  if (out.iso) parts.push(`ISO ${out.iso}`);

  return parts.length > 0 ? { ...out, formatted: parts.join(" • ") } : null;
}

function walkFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkFiles(full));
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) results.push(full);
  }
  return results;
}

function slugifyName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function optimizeImageWindows(srcPath, destJpgPath, maxDim = 1680) {
  const psScript = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('${srcPath.replace(/'/g, "''")}')
$ratio = [Math]::Min(${maxDim} / $img.Width, ${maxDim} / $img.Height)
if ($ratio -gt 1) { $ratio = 1 }
$w = [int][Math]::Round($img.Width * $ratio)
$h = [int][Math]::Round($img.Height * $ratio)
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, $w, $h)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 84L)
$bmp.Save('${destJpgPath.replace(/'/g, "''")}', $codec, $ep)
$g.Dispose(); $bmp.Dispose(); $img.Dispose()
`;
  execFileSync("powershell", ["-NoProfile", "-Command", psScript], { stdio: "ignore" });
}

function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );

  const root = process.cwd();
  const inboxDir = path.join(root, "media-inbox");
  const publicMediaDir = path.join(root, "public", "media");
  const scanOnly = args["scan-only"] === "true";
  const targetMember = args.member || null;

  if (!fs.existsSync(inboxDir)) {
    console.log("[TBG Ingest] Chưa có thư mục media-inbox/.");
    return;
  }

  const memberDirs = fs
    .readdirSync(inboxDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && (!targetMember || d.name === targetMember));

  const report = {
    generatedAt: new Date().toISOString(),
    members: [],
  };

  for (const mDir of memberDirs) {
    const memberSlug = slugifyName(mDir.name);
    const fullMemberDir = path.join(inboxDir, mDir.name);
    const files = walkFiles(fullMemberDir);
    const outDir = path.join(publicMediaDir, memberSlug);
    if (!scanOnly) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const items = [];
    files.forEach((fPath, idx) => {
      const rel = path.relative(fullMemberDir, fPath);
      const stat = fs.statSync(fPath);
      const exif = /\.jpe?g$/i.test(fPath) ? readJpegExif(fPath) : null;
      const baseSlug = slugifyName(path.basename(fPath, path.extname(fPath)));
      const outName = `${String(idx + 1).padStart(2, "0")}-${baseSlug}.jpg`;
      const outPath = path.join(outDir, outName);

      // Skip overwriting existing curated /media/keyt/ files on scan-only or if already optimized
      if (!scanOnly && memberSlug !== "tran-kim-thang" && !fs.existsSync(outPath)) {
        if (process.platform === "win32") {
          optimizeImageWindows(fPath, outPath);
        } else {
          fs.copyFileSync(fPath, outPath);
        }
      }

      items.push({
        sourceRel: rel,
        originalKB: Math.round(stat.size / 1024),
        webPath: `/media/${memberSlug}/${outName}`,
        exif: exif ?? undefined,
      });
    });

    report.members.push({
      memberSlug,
      fileCount: items.length,
      items,
    });
  }

  const reportPath = path.join(inboxDir, "ingest-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(
    `[TBG Ingest] Đã quét ${report.members.length} thư mục thành viên (${report.members.reduce(
      (s, m) => s + m.fileCount,
      0
    )} ảnh). Báo cáo EXIF lưu tại: ${reportPath}`
  );
}

main();
