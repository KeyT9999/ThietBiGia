import { ImageResponse } from "next/og";
import { readPublicImageDataUri } from "@/lib/og-helper";

export const runtime = "nodejs";
export const alt = "Logo Thiết Bị Gia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BrandOpenGraphImage() {
  const logo = await readPublicImageDataUri("/brand-logo.png");
  if (!logo) throw new Error("The brand logo is missing from public/brand-logo.png.");

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", backgroundColor: "#ffffff" }}>
      {/* The source includes wide white margins; frame the complete logo inside a landscape share card. */}
      <img src={logo} alt={alt} width={1700} height={1700} style={{ position: "absolute", left: -250, top: -535, width: 1700, height: 1700 }} />
    </div>,
    size
  );
}
