import { ImageResponse } from "next/og";
import { getPublicSiteContent } from "@/lib/site-content";
import { loadViOgFont, readPublicImageDataUri, toAsciiStudio } from "@/lib/og-helper";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function WorkOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const siteContent = await getPublicSiteContent();
  const work = siteContent.works.find((item) => item.slug === slug);
  const fontData = await loadViOgFont();
  const fmt = (s: string) => (fontData ? s : toAsciiStudio(s));

  if (!work) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0A0B0E",
            color: "#F5F2EB",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          THIET BI GIA // SELECTED WORKS
        </div>
      ),
      size
    );
  }

  const coverUri = await readPublicImageDataUri(work.coverImage);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0A0B0E",
          color: "#F5F2EB",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {coverUri && (
          <img
            src={coverUri}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
              opacity: 0.42,
            }}
          />
        )}

        {/* Dark Cinema Slate Overlay */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "46px 56px",
            background:
              "linear-gradient(180deg, rgba(10,11,14,0.86) 0%, rgba(10,11,14,0.45) 45%, rgba(10,11,14,0.95) 100%)",
          }}
        >
          {/* Top Cinema Clapperboard Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "2px solid rgba(255,77,0,0.55)",
              paddingBottom: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#FF4D00",
                  color: "#0A0B0E",
                  fontWeight: 700,
                  fontSize: 20,
                  padding: "6px 14px",
                  borderRadius: "8px",
                }}
              >
                {`SCENE ${work.indexLabel}`}
              </div>
              <div style={{ display: "flex", fontSize: 20, color: "#F5F2EB", fontWeight: 700 }}>
                {fmt(work.category.toUpperCase())}
              </div>
            </div>

            <div style={{ display: "flex", fontSize: 18, color: "#FF4D00", fontWeight: 700 }}>
              {`REC ● ${work.durationTimecode} // ${work.year}`}
            </div>
          </div>

          {/* Bottom Title + Spec */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", fontSize: 20, color: "#FF4D00", fontWeight: 700 }}>
              {fmt(work.clientOrSeries.toUpperCase())}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.08,
                color: "#F5F2EB",
              }}
            >
              {fmt(work.title)}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              <div style={{ display: "flex", fontSize: 18, color: "#D4D0C8" }}>
                {fmt(work.exifSpec ?? work.cameraSpec)}
              </div>
              <div style={{ display: "flex", fontSize: 18, color: "#FF4D00", fontWeight: 700 }}>
                {`EKIP: ${work.credits.length} THANH VIEN // THIET BI GIA`}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: "Be Vietnam Pro",
                data: fontData,
                style: "normal" as const,
                weight: 700 as const,
              },
            ],
          }
        : {}),
    }
  );
}
