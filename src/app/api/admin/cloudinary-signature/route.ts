import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdminUser } from "@/lib/supabase/server";

const ALLOWED_FOLDERS = new Set([
  "thiet-bi-gia/home",
  "thiet-bi-gia/members",
  "thiet-bi-gia/projects",
  "thiet-bi-gia/site",
]);

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Bạn cần đăng nhập admin." }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { ok: false, error: "Thiếu cấu hình Cloudinary phía server." },
      { status: 503 }
    );
  }

  let folder = "";
  try {
    const body = await request.json();
    folder = typeof body.folder === "string" ? body.folder : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }
  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ ok: false, error: "Thư mục upload không hợp lệ." }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    apiSecret
  );
  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
