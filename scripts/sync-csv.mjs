#!/usr/bin/env node
/**
 * Script đồng bộ danh sách thành viên & dự án từ CSV (hoặc link Google Sheets xuất CSV)
 * Cách dùng:
 *   npm run sync:data -- --check
 *   npm run sync:data -- --crew=./data-templates/crew.csv --out=./src/data/crew.synced.json
 *   npm run sync:data -- --sheet-url="https://docs.google.com/spreadsheets/d/.../export?format=csv"
 */
import fs from "node:fs";
import path from "node:path";

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? "";
    });
    return obj;
  });
}

async function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [k, v] = arg.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );

  const root = process.cwd();
  const crewCsvPath = path.resolve(root, args.crew || "data-templates/crew.csv");
  const worksCsvPath = path.resolve(root, args.works || "data-templates/works.csv");

  let crewRaw = "";
  if (args["sheet-url"]) {
    console.log(`[TBG Sync] Đang tải dữ liệu trực tiếp từ Google Sheets CSV...`);
    const res = await fetch(args["sheet-url"]);
    if (!res.ok) throw new Error(`HTTP ${res.status} khi tải Google Sheet`);
    crewRaw = await res.text();
  } else {
    crewRaw = fs.readFileSync(crewCsvPath, "utf8");
  }

  const crewRows = parseCsv(crewRaw);
  const worksRows = fs.existsSync(worksCsvPath)
    ? parseCsv(fs.readFileSync(worksCsvPath, "utf8"))
    : [];

  const formattedCrew = crewRows.map((r, i) => {
    const parsedRoles = r.roles
      ? r.roles.split("|").map((x) => x.trim()).filter(Boolean)
      : [r.roleCategory || "chup-anh"];
    return {
      id: `tbg-${r.badgeNumber || String(i + 1).padStart(2, "0")}`,
      badgeNumber: r.badgeNumber || String(i + 1).padStart(2, "0"),
      slug: r.slug,
      name: r.name,
      nickname: r.nickname || undefined,
      roleCategory: parsedRoles[0] || "chup-anh",
      roles: parsedRoles,
      roleTitle: r.roleTitle,
      secondaryRoles: r.secondaryRoles ? r.secondaryRoles.split("|") : [],
      bio: r.bio || "",
      avatar: r.avatar || `/media/crew/crew-01.jpg`,
      favoriteGear: r.favoriteGear ? r.favoriteGear.split("|") : [],
      yearsActive: r.yearsActive || "THIẾT BỊ GIA",
      location: r.location || "VIỆT NAM",
      socials: {
        instagram: r.instagram || undefined,
        behance: r.behance || undefined,
        email: r.email || undefined,
      },
      showcase: [],
    };
  });

  if (args.check === "true") {
    console.log(
      `[TBG Sync] Kiểm tra hợp lệ: Đọc thành công ${formattedCrew.length} mẫu thành viên & ${worksRows.length} mẫu dự án từ data-templates/.`
    );
    return;
  }

  const outPath = path.resolve(root, args.out || "data-templates/synced-preview.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify({ syncedAt: new Date().toISOString(), crew: formattedCrew, worksCount: worksRows.length }, null, 2),
    "utf8"
  );
  console.log(`[TBG Sync] Đã xuất ${formattedCrew.length} hồ sơ thành viên ra: ${outPath}`);
}

main().catch((err) => {
  console.error("[TBG Sync] Lỗi:", err.message);
  process.exit(1);
});
