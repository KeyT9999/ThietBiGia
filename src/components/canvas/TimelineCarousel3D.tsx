"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, PerspectiveCamera, useVideoTexture, View } from "@react-three/drei";
import { easing } from "maath";
import { usePathname, useRouter } from "next/navigation";
import type { CrewMember } from "@/data/schema";
import type { WorkProject } from "@/data/schema";
import {
  deferTimelineAutoplay,
  timelineMotion,
  useAppStore,
  useSiteContent,
} from "@/lib/store";
import { getRoleMeta } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import {
  getYoutubePreviewUrl,
  shouldUseYoutubeCoverPreview,
  toYoutubeEmbedUrl,
} from "@/lib/youtube";

const CAROUSEL_CIRCLE_RADIUS = 3.2;

function getResponsiveCircleRadius(viewportWidth: number) {
  if (viewportWidth < 640) return 2.9;
  if (viewportWidth < 1024) return 2.75;
  return CAROUSEL_CIRCLE_RADIUS;
}

function getResponsiveCameraZ(viewportWidth: number) {
  if (viewportWidth < 640) return 11.8;
  if (viewportWidth < 1024) return 9.8;
  return 8.4;
}

function getCircularOffset(index: number, currentIndex: number, total: number) {
  if (total <= 0) return 0;
  let offset = (index - currentIndex) % total;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function getCarouselRingAngle(position: number, total: number) {
  const slotCount = Math.max(1, total - 1);
  const maxPosition = slotCount - 1;
  if (maxPosition <= 3) {
    const span = 2 * Math.PI - (2 * Math.PI / slotCount);
    return Math.PI + position * (span / Math.max(1, maxPosition));
  }

  // Give the four next-in-line cards more room along the left arc so they
  // remain visible before passing behind the featured card.
  const leadSteps = 3;
  const arcSpan = 2 * Math.PI - (2 * Math.PI / slotCount);
  const leadStep = Math.PI / 9;
  const trailingSteps = maxPosition - leadSteps;
  const trailingStep = (arcSpan - leadSteps * leadStep) / trailingSteps;

  if (position <= leadSteps) return Math.PI - position * leadStep;
  return Math.PI - leadSteps * leadStep - (position - leadSteps) * trailingStep;
}

function wrapIndex(index: number, total: number) {
  return total > 0 ? ((index % total) + total) % total : 0;
}

/**
 * Generates a subdivided rounded-rectangle geometry or subdivided plane so custom
 * GLSL velocity bending (`uBend`) curves smoothly across the entire card surface.
 */
function createRoundedPlaneGeometry(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geo = new THREE.ShapeGeometry(shape, 12);
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uvs.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  }
  uvs.needsUpdate = true;
  return geo;
}

/**
 * Injects a GPU-lightweight GLSL velocity curl (`uBend`) into MeshBasicMaterial
 * so scrubbing rapidly along the 3D Timeline subtly arches the cards like 35mm film.
 */
function attachVelocityBendShader(mat: THREE.MeshBasicMaterial) {
  const uniforms = { uBend: { value: 0 } };
  mat.userData.uniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uBend = uniforms.uBend;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nuniform float uBend;`)
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float arch = cos(clamp(position.x, -0.5, 0.5) * 3.14159265);
        transformed.z += arch * abs(uBend) * 0.11;
        transformed.x -= position.y * uBend * 0.045;`
      );
  };
  return mat;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Renders a high-DPI Vietnamese Collector Member Card CanvasTexture (768x960)
 */
function useMemberCardTexture(member: CrewMember) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 960;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [member.slug]);

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    const W = canvas.width;
    const H = canvas.height;
    const primaryMeta = getRoleMeta(member.roles[0] ?? member.roleCategory);
    const secondaryMeta = getRoleMeta(
      member.roles[1] ?? member.roles[0] ?? member.roleCategory
    );

    const paintCard = (portraitImg?: HTMLImageElement) => {
      if (cancelled) return;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      drawRoundedRectPath(ctx, 0, 0, W, H, 36);
      ctx.clip();

      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#141824");
      bgGrad.addColorStop(0.55, "#0D1018");
      bgGrad.addColorStop(1, "#080A0F");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const glow1 = ctx.createRadialGradient(160, 240, 20, 160, 240, 420);
      glow1.addColorStop(0, `${primaryMeta.color}30`);
      glow1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, W, H);

      const glow2 = ctx.createRadialGradient(620, 680, 20, 620, 680, 420);
      glow2.addColorStop(0, `${secondaryMeta.color}26`);
      glow2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let gx = 48; gx < W; gx += 64) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (let gy = 48; gy < H; gy += 64) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      ctx.font = '700 20px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = "#9BA3B8";
      ctx.textBaseline = "middle";
      ctx.fillText("THIẾT BỊ GIA //", 42, 58);

      const prefixW = ctx.measureText("THIẾT BỊ GIA // ").width;
      ctx.fillStyle = primaryMeta.color;
      ctx.fillText(`#${member.badgeNumber}`, 42 + prefixW, 58);

      let pillRightX = W - 42;
      ctx.font = '700 17px "JetBrains Mono", Consolas, monospace';
      for (let i = member.roles.length - 1; i >= 0; i--) {
        const rMeta = getRoleMeta(member.roles[i]);
        const label = rMeta.shortLabel.toUpperCase();
        const tw = ctx.measureText(label).width;
        const pw = tw + 26;
        const ph = 32;
        const px = pillRightX - pw;
        const py = 42;

        drawRoundedRectPath(ctx, px, py, pw, ph, 16);
        ctx.fillStyle = rMeta.color;
        ctx.fill();

        ctx.fillStyle = "#080A0F";
        ctx.fillText(label, px + 13, py + ph / 2 + 1);
        pillRightX = px - 10;
      }

      const px = 42;
      const py = 100;
      const pw = W - 84;
      const ph = 526;

      ctx.save();
      drawRoundedRectPath(ctx, px, py, pw, ph, 24);
      ctx.clip();

      ctx.fillStyle = "#090B10";
      ctx.fillRect(px, py, pw, ph);

      if (portraitImg && portraitImg.width > 0 && portraitImg.height > 0) {
        const imgAspect = portraitImg.width / portraitImg.height;
        const boxAspect = pw / ph;
        let sx = 0,
          sy = 0,
          sw = portraitImg.width,
          sh = portraitImg.height;
        if (imgAspect > boxAspect) {
          sw = portraitImg.height * boxAspect;
          sx = (portraitImg.width - sw) / 2;
        } else {
          sh = portraitImg.width / boxAspect;
          const yBias = imgAspect < 0.8 ? 0.12 : 0.42;
          sy = (portraitImg.height - sh) * yBias;
        }
        ctx.drawImage(portraitImg, sx, sy, sw, sh, px, py, pw, ph);
      }

      const portVig = ctx.createLinearGradient(0, py + ph * 0.55, 0, py + ph);
      portVig.addColorStop(0, "rgba(8,10,15,0)");
      portVig.addColorStop(1, "rgba(8,10,15,0.82)");
      ctx.fillStyle = portVig;
      ctx.fillRect(px, py, pw, ph);

      const bPad = 18;
      const bLen = 22;
      ctx.strokeStyle = primaryMeta.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px + bPad, py + bPad + bLen);
      ctx.lineTo(px + bPad, py + bPad);
      ctx.lineTo(px + bPad + bLen, py + bPad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + pw - bPad - bLen, py + bPad);
      ctx.lineTo(px + pw - bPad, py + bPad);
      ctx.lineTo(px + pw - bPad, py + bPad + bLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + bPad, py + ph - bPad - bLen);
      ctx.lineTo(px + bPad, py + ph - bPad);
      ctx.lineTo(px + bPad + bLen, py + ph - bPad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + pw - bPad - bLen, py + ph - bPad);
      ctx.lineTo(px + pw - bPad, py + ph - bPad);
      ctx.lineTo(px + pw - bPad, py + ph - bPad - bLen);
      ctx.stroke();

      ctx.font = '600 16px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = "rgba(245,245,242,0.78)";
      ctx.fillText("AF-C • CREW LOCKED", px + 32, py + 38);

      ctx.font = '800 84px "Segoe UI", sans-serif';
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      const wmText = member.badgeNumber;
      const wmW = ctx.measureText(wmText).width;
      ctx.fillText(wmText, px + pw - wmW - 28, py + ph - 48);

      ctx.restore();

      drawRoundedRectPath(ctx, px, py, pw, ph, 24);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      drawRoundedRectPath(ctx, 42, 658, 64, 6, 3);
      ctx.fillStyle = primaryMeta.color;
      ctx.fill();

      if (member.roles.length > 1) {
        drawRoundedRectPath(ctx, 114, 658, 24, 6, 3);
        ctx.fillStyle = secondaryMeta.color;
        ctx.fill();
      }

      const displayName = member.nickname
        ? `${member.name.toUpperCase()} (${member.nickname.toUpperCase()})`
        : member.name.toUpperCase();

      let nameFontSize = 42;
      const maxNameW = W - 84;
      while (nameFontSize > 25) {
        ctx.font = `800 ${nameFontSize}px "Segoe UI", system-ui, sans-serif`;
        if (ctx.measureText(displayName).width <= maxNameW) break;
        nameFontSize -= 2;
      }
      ctx.fillStyle = "#F5F5F2";
      ctx.fillText(displayName, 42, 712);

      ctx.font = '500 22px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = "#A2AAC0";
      const subText = member.secondaryRoles.slice(0, 2).join("  •  ");
      ctx.fillText(subText, 42, 756);

      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(42, 804);
      ctx.lineTo(W - 42, 804);
      ctx.stroke();

      ctx.font = '600 18px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = primaryMeta.color;
      ctx.fillText("GEAR TỦ", 42, 842);

      ctx.font = '500 19px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = "#E2E6F0";
      const gearLine = member.favoriteGear.slice(0, 2).join(" • ");
      ctx.fillText(gearLine, 42, 876);

      const bcRight = W - 42;
      let bx = bcRight - 104;
      for (let b = 0; b < 18; b++) {
        const bw = b % 3 === 0 ? 4 : 2;
        ctx.fillStyle = b % 2 === 0 ? "rgba(245,245,242,0.75)" : "rgba(245,245,242,0.28)";
        ctx.fillRect(bx, 828, bw, 56);
        bx += bw + 3;
      }

      drawRoundedRectPath(ctx, 2, 2, W - 4, H - 4, 35);
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();
      texture.needsUpdate = true;
    };

    paintCard();

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => paintCard(img);
    img.src = member.avatar;

    return () => {
      cancelled = true;
    };
  }, [member, texture]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return texture;
}

/**
 * Renders a high-DPI Cinema Clapper / Slate Collector Card CanvasTexture (768x960)
 * for `workProjects` so Works Timeline Mode has full Vietnamese titles, SCENE badges,
 * timecodes, EXIF/camera specs, and crew count!
 */
function useWorkCardTexture(work: WorkProject, crewMembers: CrewMember[]) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 960;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [work.slug]);

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context as CanvasRenderingContext2D;

    let cancelled = false;
    const W = canvas.width;
    const H = canvas.height;
    let loadedCover: HTMLImageElement | undefined;
    const creditedMembers = work.credits
      .map((credit) => crewMembers.find((member) => member.slug === credit.memberSlug))
      .filter((member): member is CrewMember => Boolean(member));
    const crewAvatarImages = creditedMembers.slice(0, 4).map((member) => {
      const image = new window.Image();
      image.crossOrigin = "anonymous";
      image.onload = () => paintSlate(loadedCover);
      image.src = member.avatar;
      return { member, image };
    });

    function paintSlate(coverImg: HTMLImageElement | undefined = loadedCover) {
      if (cancelled) return;
      if (coverImg) loadedCover = coverImg;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      drawRoundedRectPath(ctx, 0, 0, W, H, 36);
      ctx.clip();

      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#151926");
      bgGrad.addColorStop(0.55, "#0C0F17");
      bgGrad.addColorStop(1, "#07090E");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const glow = ctx.createRadialGradient(384, 320, 30, 384, 320, 480);
      glow.addColorStop(0, `${work.accentColor}33`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Top Cinema Clapper Header
      ctx.textBaseline = "middle";
      drawRoundedRectPath(ctx, 42, 40, 146, 34, 10);
      ctx.fillStyle = work.accentColor;
      ctx.fill();
      ctx.fillStyle = "#080A0F";
      ctx.font = '800 18px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(`SCENE ${work.indexLabel}`, 60, 58);

      ctx.textAlign = "right";
      ctx.fillStyle = "#9BA3B8";
      ctx.font = '600 18px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(`TC ${work.durationTimecode}`, W - 42, 58);
      ctx.textAlign = "left";

      // Main Cover Window (x=42, y=96, w=684, h=520)
      const px = 42;
      const py = 96;
      const pw = W - 84;
      const ph = 520;

      ctx.save();
      drawRoundedRectPath(ctx, px, py, pw, ph, 24);
      ctx.clip();
      ctx.fillStyle = "#080A0F";
      ctx.fillRect(px, py, pw, ph);

      if (loadedCover && loadedCover.width > 0 && loadedCover.height > 0) {
        const imgAspect = loadedCover.width / loadedCover.height;
        const boxAspect = pw / ph;
        let sx = 0,
          sy = 0,
          sw = loadedCover.width,
          sh = loadedCover.height;
        if (imgAspect > boxAspect) {
          sw = loadedCover.height * boxAspect;
          sx = (loadedCover.width - sw) / 2;
        } else {
          sh = loadedCover.width / boxAspect;
          const yBias = imgAspect < 0.85 ? 0.14 : 0.4;
          sy = (loadedCover.height - sh) * yBias;
        }
        ctx.drawImage(loadedCover, sx, sy, sw, sh, px, py, pw, ph);
      }

      const vig = ctx.createLinearGradient(0, py + ph * 0.5, 0, py + ph);
      vig.addColorStop(0, "rgba(7,9,14,0)");
      vig.addColorStop(1, "rgba(7,9,14,0.88)");
      ctx.fillStyle = vig;
      ctx.fillRect(px, py, pw, ph);

      // Viewfinder REC & Frame Count inside Cover Window
      ctx.fillStyle = "#FF4D00";
      ctx.beginPath();
      ctx.arc(px + 34, py + 36, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#F4F1EA";
      ctx.font = '700 16px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(
        work.videoEmbedUrl || work.videoUrl
          ? "LIVE REEL • 24FPS"
          : `${work.galleryImages.length} FRAMES • ${work.year}`,
        px + 50,
        py + 36
      );

      ctx.restore();

      drawRoundedRectPath(ctx, px, py, pw, ph, 24);
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Editorial Project Typography
      ctx.fillStyle = work.accentColor;
      ctx.font = '700 18px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(work.category.toUpperCase(), 42, 656);

      const upperTitle = work.title.toUpperCase();
      let tSize = 42;
      let titleLines: string[] = [];
      while (tSize >= 16) {
        ctx.font = `800 ${tSize}px "Segoe UI", system-ui, sans-serif`;
        titleLines = wrapCanvasText(ctx, upperTitle, W - 84);
        if (titleLines.length <= 3) break;
        tSize -= 2;
      }
      ctx.fillStyle = "#F5F5F2";
      const titleLineHeight = Math.ceil(tSize * 1.12);
      const titleTop = 686;
      titleLines.forEach((line, lineIndex) => {
        ctx.fillText(line, 42, titleTop + lineIndex * titleLineHeight);
      });

      const titleBottom = titleTop + Math.max(0, titleLines.length - 1) * titleLineHeight;
      const subtitleTop = Math.max(742, titleBottom + 38);
      ctx.fillStyle = "#9BA3B8";
      ctx.font = '500 18px "Segoe UI", system-ui, sans-serif';
      wrapCanvasText(ctx, work.clientOrSeries, W - 84).slice(0, 2).forEach((line, lineIndex) => {
        ctx.fillText(line, 42, subtitleTop + lineIndex * 21);
      });

      const dividerY = subtitleTop + 56;
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(42, dividerY);
      ctx.lineTo(W - 42, dividerY);
      ctx.stroke();

      ctx.font = '600 17px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = work.accentColor;
      ctx.fillText("CAMERA / EXIF SPEC", 42, dividerY + 32);

      ctx.font = '500 18px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = "#E2E6F0";
      const specText = (work.exifSpec || work.cameraSpec).slice(0, 44);
      ctx.save();
      ctx.beginPath();
      ctx.rect(42, dividerY + 40, 470, 36);
      ctx.clip();
      ctx.fillText(specText, 42, dividerY + 58);
      ctx.restore();

      // Crew avatars replace the old member-count-only pill.
      const avatarSize = 42;
      const avatarStep = 31;
      const extraCount = Math.max(0, work.credits.length - crewAvatarImages.length);
      const itemCount = crewAvatarImages.length + (extraCount > 0 ? 1 : 0);
      if (itemCount > 0) {
        const stackWidth = avatarSize + Math.max(0, itemCount - 1) * avatarStep;
        const startX = W - 42 - stackWidth;
        const centerY = 910;
        crewAvatarImages.forEach(({ member, image }, index) => {
          const centerX = startX + index * avatarStep + avatarSize / 2;
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
          ctx.clip();
          if (image.complete && image.naturalWidth > 0) {
            ctx.drawImage(image, centerX - avatarSize / 2, centerY - avatarSize / 2, avatarSize, avatarSize);
          } else {
            ctx.fillStyle = "#1C2230";
            ctx.fill();
            const initials = member.nickname?.slice(0, 2) || member.name.split(/\s+/).slice(-2).map((part) => part[0]).join("");
            ctx.fillStyle = "#F4F1EA";
            ctx.font = '700 15px "JetBrains Mono", Consolas, monospace';
            ctx.textAlign = "center";
            ctx.fillText(initials.toUpperCase(), centerX, centerY);
            ctx.textAlign = "left";
          }
          ctx.restore();
          ctx.beginPath();
          ctx.arc(centerX, centerY, avatarSize / 2 - 1, 0, Math.PI * 2);
          ctx.strokeStyle = index === 0 ? work.accentColor : "rgba(255,255,255,0.75)";
          ctx.lineWidth = 3;
          ctx.stroke();
        });
        if (extraCount > 0) {
          const centerX = startX + crewAvatarImages.length * avatarStep + avatarSize / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, avatarSize / 2 - 1, 0, Math.PI * 2);
          ctx.fillStyle = "#10131B";
          ctx.fill();
          ctx.strokeStyle = `${work.accentColor}CC`;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = "#F4F1EA";
          ctx.font = '700 14px "JetBrains Mono", Consolas, monospace';
          ctx.textAlign = "center";
          ctx.fillText(`+${extraCount}`, centerX, centerY);
          ctx.textAlign = "left";
        }
      }

      drawRoundedRectPath(ctx, 2, 2, W - 4, H - 4, 35);
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();
      texture.needsUpdate = true;
    };

    paintSlate();
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      loadedCover = img;
      paintSlate(img);
    };
    img.src = work.coverImage;

    return () => {
      cancelled = true;
    };
  }, [work, crewMembers, texture]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return texture;
}

/**
 * Optional Live Video Reel Texture overlay (Skill: pmndrs-examples/video-textures).
 * Only mounts on the centered active project when `work.videoUrl` is defined!
 */
function ActiveWorkVideoPlane({ url }: { url: string }) {
  const videoTex = useVideoTexture(url, {
    muted: true,
    loop: true,
    start: true,
  });
  return (
    <mesh position={[0, 0.13, 0.012]}>
      <planeGeometry args={[2.12, 1.6]} />
      <meshBasicMaterial map={videoTex} toneMapped={false} />
    </mesh>
  );
}

function ActiveYoutubeCardPlayer({
  videoUrl,
  autoPlay,
}: {
  videoUrl: string;
  autoPlay: boolean;
}) {
  const src = getYoutubePreviewUrl(videoUrl, autoPlay);
  if (!src) return null;

  return (
    <Html
      transform
      distanceFactor={10}
      position={[0, 0.3875, 0.025]}
      pointerEvents="none"
    >
      <iframe
        src={src}
        title="Video YouTube xem trước dự án"
        aria-hidden="true"
        tabIndex={-1}
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{
          display: "block",
          width: "85.5px",
          height: "65px",
          border: 0,
          borderRadius: "2px",
          pointerEvents: "none",
        }}
      />
    </Html>
  );
}

interface MemberCardMeshProps {
  member: CrewMember;
  index: number;
  total: number;
  cardGeo: THREE.BufferGeometry;
  bezelGeo: THREE.BufferGeometry;
  onActivateOrOpen: (index: number, href: string) => void;
}

function MemberCardMesh({
  member,
  index,
  total,
  cardGeo,
  bezelGeo,
  onActivateOrOpen,
}: MemberCardMeshProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const cardMeshRef = useRef<THREE.Mesh>(null!);
  const frameRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const setCursor = useAppStore((s) => s.setCursor);

  const cardTexture = useMemberCardTexture(member);
  const roleColorHex = getRoleMeta(member.roles[0] ?? member.roleCategory).color;

  const accentColor = useMemo(() => new THREE.Color(roleColorHex), [roleColorHex]);
  const dimColor = useMemo(() => new THREE.Color("#5E657A"), []);
  const whiteColor = useMemo(() => new THREE.Color("#FFFFFF"), []);

  const cardMaterial = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      map: cardTexture,
      transparent: true,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    return attachVelocityBendShader(mat);
  }, [cardTexture]);

  useEffect(() => {
    return () => {
      cardMaterial.dispose();
    };
  }, [cardMaterial]);

  useFrame((state, delta) => {
    const offset = getCircularOffset(index, timelineMotion.currentIndex, total);
    const absOffset = Math.abs(offset);
    const isCenter = absOffset < 0.45;
    const ringPosition = offset > 0
      ? offset - 1
      : total - 1 + offset;
    const angle = total > 1 ? getCarouselRingAngle(ringPosition, total) : 0;

    // Orbit the cards behind the featured card. The next card approaches from
    // the left and the current card recedes to the right.
    const orbitBlend = Math.min(1, absOffset / 0.75);
    const circleRadius = getResponsiveCircleRadius(state.size.width);
    const targetX = Math.cos(angle) * circleRadius * orbitBlend;
    const targetY = Math.sin(angle) * circleRadius * 0.9 * orbitBlend +
      (state.size.width < 640 ? 0.45 : 0);
    let targetZ = THREE.MathUtils.lerp(
      0.95,
      -1.35,
      orbitBlend
    );
    if (hovered && !isCenter) targetZ += 0.18;

    easing.damp3(groupRef.current.position, [targetX, targetY, targetZ], 0.18, delta);

    const rotY = isCenter ? 0 : Math.sin(angle) * 0.16;
    const rotZ = THREE.MathUtils.clamp(-timelineMotion.velocity * 0.045, -0.14, 0.14);
    easing.dampE(groupRef.current.rotation, [0, rotY, rotZ], 0.18, delta);

    // Keep the featured member prominent while enlarging the mobile orbit cards
    // and widening their ring so they peek out from behind the center card.
    const mobileScale = state.size.width < 640 ? (isCenter ? 1.785 : 1.35) : 1;
    const scaleBoost = (hovered
      ? isCenter ? 1.28 : 0.44
      : isCenter
        ? 1.2
        : 0.38 + 0.49 * Math.exp(-0.48 * Math.max(0, absOffset - 1))) *
      mobileScale;

    const baseW = 2.4;
    const baseH = 3.0;

    easing.damp3(
      cardMeshRef.current.scale,
      [baseW * scaleBoost, baseH * scaleBoost, 1],
      0.14,
      delta
    );

    if (frameRef.current) {
      easing.damp3(
        frameRef.current.scale,
        [baseW * scaleBoost + 0.09, baseH * scaleBoost + 0.09, 1],
        0.14,
        delta
      );
      const frameMat = frameRef.current.material as THREE.MeshBasicMaterial;
      frameMat.color.lerp(isCenter ? accentColor : dimColor, 0.16);
      easing.damp(
        frameMat,
        "opacity",
        isCenter ? 0.96 : hovered ? 0.62 : 0.48,
        0.15,
        delta
      );
    }

    cardMaterial.color.lerp(isCenter || hovered ? whiteColor : dimColor, 0.14);
    easing.damp(cardMaterial, "opacity", isCenter ? 1 : 0.92, 0.15, delta);

    if (cardMaterial.userData.uniforms?.uBend) {
      const bendTarget = THREE.MathUtils.clamp(
        timelineMotion.velocity * 0.16,
        -1.2,
        1.2
      );
      easing.damp(
        cardMaterial.userData.uniforms.uBend,
        "value",
        bendTarget,
        0.12,
        delta
      );
    }

    groupRef.current.visible = true;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={frameRef} geometry={bezelGeo} position={[0, 0, -0.02]}>
        <meshBasicMaterial transparent opacity={0.2} color={roleColorHex} />
      </mesh>

      <mesh
        ref={cardMeshRef}
        geometry={cardGeo}
        material={cardMaterial}
        scale={[2.4, 3.0, 1]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          timelineMotion.isCardHovered = e.pointerType === "mouse";
          deferTimelineAutoplay();
          soundEngine.playHover();
          const isActive = Math.abs(
            getCircularOffset(index, timelineMotion.currentIndex, total)
          ) < 0.45;
          setCursor(
            "crew",
            isActive
              ? "MỞ THẺ 3D"
              : `#${member.badgeNumber} ${member.name
                  .split(" ")
                  .slice(-2)
                  .join(" ")
                  .toUpperCase()}`
          );
        }}
        onPointerOut={() => {
          setHovered(false);
          timelineMotion.isCardHovered = false;
          deferTimelineAutoplay();
          setCursor("default", "");
        }}
        onClick={(e) => {
          e.stopPropagation();
          onActivateOrOpen(index, `/crew/${member.slug}`);
        }}
      />
    </group>
  );
}

interface WorkCardMeshProps {
  work: WorkProject;
  crewMembers: CrewMember[];
  index: number;
  total: number;
  isActiveCenter: boolean;
  cardGeo: THREE.BufferGeometry;
  bezelGeo: THREE.BufferGeometry;
  onActivateOrOpen: (index: number, href: string) => void;
}

function WorkCardMesh({
  work,
  crewMembers,
  index,
  total,
  isActiveCenter,
  cardGeo,
  bezelGeo,
  onActivateOrOpen,
}: WorkCardMeshProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const cardMeshRef = useRef<THREE.Mesh>(null!);
  const frameRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [mouseHovered, setMouseHovered] = useState(false);
  const setCursor = useAppStore((s) => s.setCursor);

  const youtubeVideoUrl = work.videoEmbedUrl || work.videoUrl || "";
  const shouldPlayYoutubeCover = shouldUseYoutubeCoverPreview(youtubeVideoUrl, work.coverImage);
  const directVideoUrl = work.videoUrl && !toYoutubeEmbedUrl(work.videoUrl)
    ? work.videoUrl
    : null;

  const slateTexture = useWorkCardTexture(work, crewMembers);
  const accentColor = useMemo(() => new THREE.Color(work.accentColor), [work.accentColor]);
  const dimColor = useMemo(() => new THREE.Color("#686E82"), []);
  const whiteColor = useMemo(() => new THREE.Color("#FFFFFF"), []);

  const slateMaterial = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      map: slateTexture,
      transparent: true,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    return attachVelocityBendShader(mat);
  }, [slateTexture]);

  useEffect(() => {
    return () => {
      slateMaterial.dispose();
    };
  }, [slateMaterial]);

  useFrame((state, delta) => {
    const offset = getCircularOffset(index, timelineMotion.currentIndex, total);
    const absOffset = Math.abs(offset);
    const ringPosition = offset > 0
      ? offset - 1
      : total - 1 + offset;
    const angle = total > 1 ? getCarouselRingAngle(ringPosition, total) : 0;
    const circleRadius = getResponsiveCircleRadius(state.size.width);
    const orbitBlend = Math.min(1, absOffset / 0.75);
    const isCenter = absOffset < 0.45;

    const targetX = Math.cos(angle) * circleRadius * orbitBlend;
    const targetZ = THREE.MathUtils.lerp(0.95, -1.35, orbitBlend);
    const targetY = Math.sin(angle) * circleRadius * 0.9 * orbitBlend +
      (state.size.width < 640 ? 0.45 : 0) +
      (hovered ? 0.14 : 0);

    easing.damp3(groupRef.current.position, [targetX, targetY, targetZ], 0.14, delta);

    const rotY = isCenter ? 0 : Math.sin(angle) * 0.16;
    const rotZ = THREE.MathUtils.clamp(-timelineMotion.velocity * 0.045, -0.14, 0.14);
    easing.dampE(groupRef.current.rotation, [0, rotY, rotZ], 0.14, delta);

    const mobileScale = state.size.width < 640 ? (isCenter ? 1.785 : 1.35) : 1;
    const scaleBoost = (hovered
      ? isCenter ? 1.28 : 0.44
      : isCenter
        ? 1.2
        : 0.38 + 0.49 * Math.exp(-0.48 * Math.max(0, absOffset - 1))) *
      mobileScale;
    const baseW = 2.4;
    const baseH = 3.0;

    easing.damp3(
      groupRef.current.scale,
      [scaleBoost, scaleBoost, scaleBoost],
      0.14,
      delta
    );

    easing.damp3(
      cardMeshRef.current.scale,
      [baseW, baseH, 1],
      0.14,
      delta
    );

    if (frameRef.current) {
      easing.damp3(
        frameRef.current.scale,
        [baseW + 0.09, baseH + 0.09, 1],
        0.14,
        delta
      );
      const frameMat = frameRef.current.material as THREE.MeshBasicMaterial;
      frameMat.color.lerp(isCenter ? accentColor : dimColor, 0.15);
      easing.damp(
        frameMat,
        "opacity",
        isCenter ? 0.88 : hovered ? 0.4 : 0.14,
        0.15,
        delta
      );
    }

    slateMaterial.color.lerp(isCenter || hovered ? whiteColor : dimColor, 0.14);
    easing.damp(
      slateMaterial,
      "opacity",
      isCenter ? 1 : 0.88 - Math.min(0.18, Math.max(0, absOffset - 1) * 0.018),
      0.15,
      delta
    );

    if (slateMaterial.userData.uniforms?.uBend) {
      const bendTarget = THREE.MathUtils.clamp(
        timelineMotion.velocity * 0.16,
        -1.2,
        1.2
      );
      easing.damp(
        slateMaterial.userData.uniforms.uBend,
        "value",
        bendTarget,
        0.12,
        delta
      );
    }

    groupRef.current.visible = true;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={frameRef} geometry={bezelGeo} position={[0, 0, -0.02]}>
        <meshBasicMaterial transparent opacity={0.2} color={work.accentColor} />
      </mesh>

      <mesh
        ref={cardMeshRef}
        geometry={cardGeo}
        material={slateMaterial}
        scale={[2.4, 3.0, 1]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setMouseHovered(e.pointerType === "mouse");
          timelineMotion.isCardHovered = e.pointerType === "mouse";
          deferTimelineAutoplay();
          soundEngine.playHover();
          const isActive = Math.abs(
            getCircularOffset(index, timelineMotion.currentIndex, total)
          ) < 0.45;
          setCursor("project", isActive ? "MỞ DỰ ÁN" : `SCENE ${work.indexLabel}`);
        }}
        onPointerOut={() => {
          setHovered(false);
          setMouseHovered(false);
          timelineMotion.isCardHovered = false;
          deferTimelineAutoplay();
          setCursor("default", "");
        }}
        onClick={(e) => {
          e.stopPropagation();
          onActivateOrOpen(index, `/works/${work.slug}`);
        }}
      />

      {/* A YouTube poster stays still until this card is hovered. */}
      {shouldPlayYoutubeCover && (isActiveCenter || mouseHovered) && (
        <ActiveYoutubeCardPlayer
          videoUrl={youtubeVideoUrl}
          autoPlay={mouseHovered}
        />
      )}

      {/* Preserve playback for direct video files that are not YouTube links. */}
      {isActiveCenter && directVideoUrl && (
        <Suspense fallback={null}>
          <ActiveWorkVideoPlane url={directVideoUrl} />
        </Suspense>
      )}
    </group>
  );
}

function CarouselRig({ active }: { active: boolean }) {
  const siteContent = useSiteContent();
  const crewMembers = siteContent.crew;
  const workProjects = siteContent.works;
  const router = useRouter();
  const rigRef = useRef<THREE.Group>(null!);
  const timelineMode = useAppStore((s) => s.timelineMode);
  const activeWorkIndex = useAppStore((s) => s.activeWorkIndex);
  const setActiveWorkIndex = useAppStore((s) => s.setActiveWorkIndex);
  const settledAfterMotionRef = useRef(false);

  const total = timelineMode === "crew" ? crewMembers.length : workProjects.length;

  useEffect(() => {
    if (!active || total <= 1) {
      timelineMotion.isCardHovered = false;
      return;
    }
    timelineMotion.isCardHovered = false;
    settledAfterMotionRef.current = false;
    deferTimelineAutoplay();
    const interval = window.setInterval(() => {
      const isMoving = Math.abs(timelineMotion.targetIndex - timelineMotion.currentIndex) > 0.02;
      if (isMoving) {
        settledAfterMotionRef.current = true;
        return;
      }

      if (settledAfterMotionRef.current) {
        settledAfterMotionRef.current = false;
        deferTimelineAutoplay();
        return;
      }

      if (
        Date.now() < timelineMotion.autoplayResumeAt ||
        timelineMotion.isDragging ||
        timelineMotion.isCardHovered
      ) return;

      timelineMotion.targetIndex = Math.round(timelineMotion.currentIndex) + 1;
      settledAfterMotionRef.current = true;
    }, 100);
    return () => {
      window.clearInterval(interval);
      timelineMotion.isCardHovered = false;
    };
  }, [active, timelineMode, total]);

  // Subdivided PlaneGeometry (20x24) for silky smooth GLSL velocity arch deformation
  const sharedCardGeo = useMemo(
    () => new THREE.PlaneGeometry(1, 1, 20, 24),
    []
  );
  const sharedBezelGeo = useMemo(
    () => createRoundedPlaneGeometry(1, 1, 0.046),
    []
  );

  useEffect(() => {
    return () => {
      sharedCardGeo.dispose();
      sharedBezelGeo.dispose();
    };
  }, [sharedCardGeo, sharedBezelGeo]);

  useFrame((state, delta) => {
    if (!active) return;

    const prev = timelineMotion.currentIndex;

    easing.damp(
      timelineMotion,
      "currentIndex",
      timelineMotion.targetIndex,
      0.16,
      delta
    );

    timelineMotion.velocity =
      delta > 0.0001 ? (timelineMotion.currentIndex - prev) / delta : 0;

    const nearest = Math.round(timelineMotion.currentIndex);
    const displayIndex = wrapIndex(nearest, total);
    if (displayIndex !== useAppStore.getState().activeWorkIndex) {
      setActiveWorkIndex(displayIndex, false);
    }

    easing.damp3(
      state.camera.position,
      [
        state.pointer.x * 0.42,
        state.pointer.y * 0.26 + 0.08,
        getResponsiveCameraZ(state.size.width),
      ],
      0.28,
      delta
    );
    state.camera.lookAt(0, 0.05, 0);
  });

  const openCard = (href: string) => {
    soundEngine.playShutter();
    useAppStore.getState().setCursor("default", "");
    router.push(href, { scroll: false });
  };

  const handleActivateOrOpen = (index: number, href: string) => {
    const dist = Math.abs(getCircularOffset(index, timelineMotion.currentIndex, total));
    if (dist < 0.42) {
      openCard(href);
    } else {
      setActiveWorkIndex(index, true);
    }
  };

  return (
    <group ref={rigRef} visible={active}>
      {timelineMode === "crew"
        ? crewMembers.map((member, idx) => (
            <MemberCardMesh
              key={member.id}
              member={member}
              index={idx}
              total={total}
              cardGeo={sharedCardGeo}
              bezelGeo={sharedBezelGeo}
              onActivateOrOpen={handleActivateOrOpen}
            />
          ))
        : workProjects.map((work, idx) => (
            <WorkCardMesh
              key={work.id}
              work={work}
              crewMembers={crewMembers}
              index={idx}
              total={total}
              isActiveCenter={idx === activeWorkIndex}
              cardGeo={sharedCardGeo}
              bezelGeo={sharedBezelGeo}
              onActivateOrOpen={handleActivateOrOpen}
            />
          ))}
    </group>
  );
}

export function TimelineCarousel3DView() {
  const pathname = usePathname();
  const isOverlayOpen = useAppStore((s) => s.isOverlayOpen);
  const isActive = !isOverlayOpen && pathname === "/";

  return (
    <View
      visible={isActive}
      index={1}
      className={`w-full h-full ${isActive ? "" : "pointer-events-none"}`}
    >
      <PerspectiveCamera makeDefault position={[0, 0.08, 8.4]} fov={38} />
      <ambientLight intensity={1.2} />
      <Suspense fallback={null}>
        <CarouselRig active={isActive} />
      </Suspense>
    </View>
  );
}
