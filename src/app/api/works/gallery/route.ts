import { NextRequest, NextResponse } from "next/server";
import { getPublicSiteContent } from "@/lib/site-content";
import { extractGoogleDriveFolderId } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  resourceKey?: string;
  imageMediaMetadata?: { width?: number; height?: number };
};

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  const memberSlug = request.nextUrl.searchParams.get("memberSlug")?.trim();
  const showcaseId = request.nextUrl.searchParams.get("showcaseId")?.trim();
  const requestedLimit = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "", 10);
  const previewLimit = Number.isInteger(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, 11)
    : null;
  const isPersonalProject = Boolean(memberSlug && showcaseId);
  if (!slug && !isPersonalProject) return NextResponse.json({ ok: false, error: "Thiếu dự án cần tải album." }, { status: 400 });

  const content = await getPublicSiteContent();
  const teamProject = slug ? content.works.find((item) => item.slug === slug) : undefined;
  const memberProject = isPersonalProject
    ? content.crew.find((item) => item.slug === memberSlug)?.showcase.find((item) => item.id === showcaseId)
    : undefined;
  const folderUrl = teamProject?.galleryDriveFolderUrl ?? memberProject?.galleryDriveFolderUrl;
  if (!folderUrl) return NextResponse.json({ ok: false, error: "Dự án chưa có thư mục ảnh Drive." }, { status: 404 });

  const folderId = extractGoogleDriveFolderId(folderUrl);
  if (!folderId) {
    return NextResponse.json({ ok: false, error: "Link Google Drive chưa đúng. Hãy dán link chia sẻ của thư mục." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: "Album Drive chưa được kết nối. Quản trị viên cần thêm GOOGLE_DRIVE_API_KEY vào cấu hình máy chủ.",
    }, { status: 503 });
  }

  try {
    const files: DriveFile[] = [];
    let pageToken: string | undefined;

    do {
      const apiUrl = new URL("https://www.googleapis.com/drive/v3/files");
      apiUrl.searchParams.set("q", `'${folderId}' in parents and trashed = false`);
      apiUrl.searchParams.set("key", apiKey);
      apiUrl.searchParams.set("pageSize", previewLimit ? "100" : "1000");
      if (previewLimit) apiUrl.searchParams.set("orderBy", "name_natural");
      apiUrl.searchParams.set("supportsAllDrives", "true");
      apiUrl.searchParams.set("includeItemsFromAllDrives", "true");
      apiUrl.searchParams.set("fields", "nextPageToken,files(id,name,mimeType,resourceKey,imageMediaMetadata(width,height))");
      if (pageToken) apiUrl.searchParams.set("pageToken", pageToken);

      const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        console.error("Google Drive gallery request failed:", response.status, body?.error?.status);
        return NextResponse.json({
          ok: false,
          error: "Không đọc được thư mục ảnh. Hãy bật chia sẻ “Bất kỳ ai có đường liên kết” và kiểm tra cấu hình Google Drive API.",
        }, { status: 502 });
      }

      const result = await response.json() as { files?: DriveFile[]; nextPageToken?: string };
      files.push(...(result.files ?? []));
      pageToken = result.nextPageToken;
    } while (
      pageToken &&
      files.length < 5000 &&
      (!previewLimit || files.filter((file) => file.mimeType.startsWith("image/")).length < previewLimit)
    );

    const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" });
    const allImages = files
      .filter((file) => file.mimeType.startsWith("image/"))
      .sort((a, b) => collator.compare(a.name, b.name))
      .map((file) => {
        const resourceKey = file.resourceKey ? `&resourcekey=${encodeURIComponent(file.resourceKey)}` : "";
        return {
          id: file.id,
          name: file.name,
          width: file.imageMediaMetadata?.width ?? null,
          height: file.imageMediaMetadata?.height ?? null,
          src: `https://drive.google.com/thumbnail?id=${encodeURIComponent(file.id)}&sz=w1600${resourceKey}`,
          viewUrl: `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view${file.resourceKey ? `?resourcekey=${encodeURIComponent(file.resourceKey)}` : ""}`,
        };
      });
    const images = previewLimit ? allImages.slice(0, previewLimit) : allImages;

    return NextResponse.json(
      {
        ok: true,
        images,
        ...(previewLimit ? { hasMore: allImages.length > 10 || Boolean(pageToken) } : {}),
      },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    console.error("Google Drive gallery load failed:", error);
    return NextResponse.json({ ok: false, error: "Chưa tải được album Google Drive. Vui lòng thử lại sau." }, { status: 502 });
  }
}
