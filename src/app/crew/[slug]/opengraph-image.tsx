import { ImageResponse } from "next/og";
import { getPublicSiteContent } from "@/lib/site-content";
import { loadViOgFont, readPublicImageDataUri, toAsciiStudio } from "@/lib/og-helper";
import { getCombinedRoleBadge, getRoleMeta } from "@/lib/utils";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CrewOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const siteContent = await getPublicSiteContent();
  const member = siteContent.crew.find((item) => item.slug === slug);
  const fontData = await loadViOgFont();
  const fmt = (s: string) => (fontData ? s : toAsciiStudio(s));

  if (!member) {
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
          THIET BI GIA // CREW ROSTER
        </div>
      ),
      size
    );
  }

  const avatarUri = await readPublicImageDataUri(member.avatar);
  const roleMeta = getRoleMeta(member.roles[0] ?? member.roleCategory);
  const memberWorks = siteContent.works.filter((work) =>
    work.credits.some((credit) => credit.memberSlug === member.slug)
  );
  const projectSlugs = new Set(memberWorks.map((work) => work.slug));
  const projectCovers = new Set(memberWorks.map((work) => work.coverImage));
  const personalProjects = member.showcase.filter((item) => {
    if (item.projectSlug && projectSlugs.has(item.projectSlug)) return false;
    const frames = item.gallery?.length ? item.gallery : [item.image];
    return frames.length > 1 || !projectCovers.has(item.image);
  });
  const projectCount = memberWorks.length + personalProjects.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0A0B0E",
          color: "#F5F2EB",
          padding: "46px 56px",
          justifyContent: "space-between",
          alignItems: "stretch",
          border: "2px solid #23262F",
        }}
      >
        {/* Left Press Pass Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "680px",
            paddingRight: "32px",
          }}
        >
          {/* Header Badge */}
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
              TBG
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                letterSpacing: "0.16em",
                color: "#A9A69E",
              }}
            >
              {`DIGITAL PRESS PASS // CREW #${member.badgeNumber}`}
            </div>
          </div>

          {/* Member Name & Role */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  backgroundColor: roleMeta.color,
                  color: "#0A0B0E",
                  fontWeight: 700,
                  fontSize: 18,
                  padding: "6px 16px",
                  borderRadius: "999px",
                }}
              >
                {fmt(getCombinedRoleBadge(member.roles).toUpperCase())}
              </div>
              <div
                style={{
                  display: "flex",
                  border: "1px solid #2D313D",
                  color: "#FF4D00",
                  fontSize: 18,
                  fontWeight: 700,
                  padding: "6px 14px",
                  borderRadius: "999px",
                }}
              >
                {`${projectCount} PROJECTS`}
              </div>
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
              {fmt(
                member.nickname ? `${member.name} (${member.nickname})` : member.name
              )}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 22,
                color: "#A9A69E",
                lineHeight: 1.4,
              }}
            >
              {fmt(member.secondaryRoles.join(" • "))}
            </div>
          </div>

          {/* Gear Footer */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "16px 20px",
              borderRadius: "14px",
              backgroundColor: "#12141A",
              border: "1px solid #262A35",
            }}
          >
            <div style={{ display: "flex", fontSize: 14, color: "#FF4D00", fontWeight: 700 }}>
              PRIMARY GEAR ARSENAL
            </div>
            <div style={{ display: "flex", fontSize: 18, color: "#F5F2EB" }}>
              {fmt(member.favoriteGear.slice(0, 2).join(" • "))}
            </div>
          </div>
        </div>

        {/* Right Portrait Frame */}
        <div
          style={{
            display: "flex",
            width: "370px",
            height: "100%",
            borderRadius: "24px",
            overflow: "hidden",
            border: `3px solid ${roleMeta.color}`,
            backgroundColor: "#14171F",
            position: "relative",
          }}
        >
          {avatarUri ? (
            <img
              src={avatarUri}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                fontWeight: 700,
                color: "#FF4D00",
              }}
            >
              {`#${member.badgeNumber}`}
            </div>
          )}
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
