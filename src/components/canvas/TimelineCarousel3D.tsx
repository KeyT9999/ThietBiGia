"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Image, PerspectiveCamera, View } from "@react-three/drei";
import { easing } from "maath";
import { usePathname, useRouter } from "next/navigation";
import { CREW_MEMBERS, type CrewMember } from "@/data/crew";
import { WORKS_DATA, type WorkProject } from "@/data/works";
import { timelineMotion, useAppStore } from "@/lib/store";
import { getRoleMeta } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

const CARD_SPACING_ANGLE = 0.245;
const ARC_RADIUS = 11.0;

/**
 * Generates a normalized [0..1] UV rounded-rectangle PlaneGeometry so both
 * 3D cards and their glowing outer bezels have smooth rounded corners.
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

/**
 * Renders a high-DPI Vietnamese Collector Member Card CanvasTexture (768x960)
 * wrapping `member.avatar`, roles, Vietnamese name, specialty, and favorite gear.
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

      // 1. Studio Obsidian Card Base
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#141824");
      bgGrad.addColorStop(0.55, "#0D1018");
      bgGrad.addColorStop(1, "#080A0F");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Ambient dual-role studio glow
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

      // Subtle technical grid
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

      // 2. Top Collector Metadata Bar
      ctx.font = '700 20px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = "#9BA3B8";
      ctx.textBaseline = "middle";
      ctx.fillText("THIẾT BỊ GIA //", 42, 58);

      const prefixW = ctx.measureText("THIẾT BỊ GIA // ").width;
      ctx.fillStyle = primaryMeta.color;
      ctx.fillText(`#${member.badgeNumber}`, 42 + prefixW, 58);

      // Right-aligned Role Badges
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

      // 3. Center Portrait Frame (x=42, y=100, w=684, h=526)
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
        // Object-fit: cover center crop so real portraits never stretch
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

      // Bottom inner gradient inside portrait window
      const portVig = ctx.createLinearGradient(0, py + ph * 0.55, 0, py + ph);
      portVig.addColorStop(0, "rgba(8,10,15,0)");
      portVig.addColorStop(1, "rgba(8,10,15,0.82)");
      ctx.fillStyle = portVig;
      ctx.fillRect(px, py, pw, ph);

      // Viewfinder Corner Brackets inside Portrait Window
      const bPad = 18;
      const bLen = 22;
      ctx.strokeStyle = primaryMeta.color;
      ctx.lineWidth = 3;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(px + bPad, py + bPad + bLen);
      ctx.lineTo(px + bPad, py + bPad);
      ctx.lineTo(px + bPad + bLen, py + bPad);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(px + pw - bPad - bLen, py + bPad);
      ctx.lineTo(px + pw - bPad, py + bPad);
      ctx.lineTo(px + pw - bPad, py + bPad + bLen);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(px + bPad, py + ph - bPad - bLen);
      ctx.lineTo(px + bPad, py + ph - bPad);
      ctx.lineTo(px + bPad + bLen, py + ph - bPad);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(px + pw - bPad - bLen, py + ph - bPad);
      ctx.lineTo(px + pw - bPad, py + ph - bPad);
      ctx.lineTo(px + pw - bPad, py + ph - bPad - bLen);
      ctx.stroke();

      // Viewfinder AF tag & Watermark Number inside Portrait Frame
      ctx.font = '600 16px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = "rgba(245,245,242,0.78)";
      ctx.fillText("AF-C • CREW LOCKED", px + 32, py + 38);

      ctx.font = '800 84px "Segoe UI", sans-serif';
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      const wmText = member.badgeNumber;
      const wmW = ctx.measureText(wmText).width;
      ctx.fillText(wmText, px + pw - wmW - 28, py + ph - 48);

      ctx.restore();

      // Subtle border around portrait window
      drawRoundedRectPath(ctx, px, py, pw, ph, 24);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Bottom Editorial Member Typography Block (y=656..920)
      drawRoundedRectPath(ctx, 42, 658, 64, 6, 3);
      ctx.fillStyle = primaryMeta.color;
      ctx.fill();

      if (member.roles.length > 1) {
        drawRoundedRectPath(ctx, 114, 658, 24, 6, 3);
        ctx.fillStyle = secondaryMeta.color;
        ctx.fill();
      }

      // Auto-scaled Vietnamese Member Name
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

      // Specialty / Role Title
      ctx.font = '500 22px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = "#A2AAC0";
      const subText = member.secondaryRoles.slice(0, 2).join("  •  ");
      ctx.fillText(subText, 42, 756);

      // Divider line
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(42, 804);
      ctx.lineTo(W - 42, 804);
      ctx.stroke();

      // Bottom Gear Spec & Press Barcode
      ctx.font = '600 18px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = primaryMeta.color;
      ctx.fillText("GEAR TỦ", 42, 842);

      ctx.font = '500 19px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = "#E2E6F0";
      const gearLine = member.favoriteGear.slice(0, 2).join(" • ");
      ctx.fillText(gearLine, 42, 876);

      // Mini Vertical Barcode on Bottom Right
      const bcRight = W - 42;
      let bx = bcRight - 104;
      for (let b = 0; b < 18; b++) {
        const bw = b % 3 === 0 ? 4 : 2;
        ctx.fillStyle = b % 2 === 0 ? "rgba(245,245,242,0.75)" : "rgba(245,245,242,0.28)";
        ctx.fillRect(bx, 828, bw, 56);
        bx += bw + 3;
      }

      // Outer subtle glass border inside canvas
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

interface MemberCardMeshProps {
  member: CrewMember;
  index: number;
  cardGeo: THREE.ShapeGeometry;
  onActivateOrOpen: (index: number, href: string) => void;
}

function MemberCardMesh({
  member,
  index,
  cardGeo,
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

  useFrame((_, delta) => {
    const offset = index - timelineMotion.currentIndex;
    const absOffset = Math.abs(offset);
    const angle = offset * CARD_SPACING_ANGLE;

    const targetX = Math.sin(angle) * ARC_RADIUS;
    const targetZ = (Math.cos(angle) - 1) * ARC_RADIUS * 0.86 - absOffset * 0.28;
    const targetY = hovered ? 0.14 : -Math.min(0.32, absOffset * 0.05);

    easing.damp3(groupRef.current.position, [targetX, targetY, targetZ], 0.14, delta);

    const rotY = -angle * 0.72;
    const rotZ = THREE.MathUtils.clamp(-timelineMotion.velocity * 0.045, -0.14, 0.14);
    easing.dampE(groupRef.current.rotation, [0, rotY, rotZ], 0.14, delta);

    const isCenter = absOffset < 0.45;
    const scaleBoost = isCenter
      ? hovered
        ? 1.18
        : 1.13
      : hovered
      ? 0.95
      : Math.max(0.7, 0.92 - absOffset * 0.05);

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
        isCenter ? 0.92 : hovered ? 0.45 : 0.14,
        0.15,
        delta
      );
    }

    const cardMat = cardMeshRef.current.material as THREE.MeshBasicMaterial;
    if (cardMat) {
      cardMat.color.lerp(isCenter || hovered ? whiteColor : dimColor, 0.14);
      easing.damp(cardMat, "opacity", absOffset > 5.0 ? 0 : 1, 0.15, delta);
    }

    groupRef.current.visible = absOffset < 5.6;
  });

  return (
    <group ref={groupRef}>
      {/* Smooth Rounded Luminous Bezel */}
      <mesh ref={frameRef} geometry={cardGeo} position={[0, 0, -0.02]}>
        <meshBasicMaterial transparent opacity={0.2} color={roleColorHex} />
      </mesh>

      {/* High-DPI Collector Member Card Mesh */}
      <mesh
        ref={cardMeshRef}
        geometry={cardGeo}
        scale={[2.4, 3.0, 1]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          soundEngine.playHover();
          const isActive = Math.abs(index - timelineMotion.currentIndex) < 0.45;
          setCursor(
            "crew",
            isActive ? "MỞ THẺ 3D" : `#${member.badgeNumber} ${member.name.split(" ").slice(-2).join(" ").toUpperCase()}`
          );
        }}
        onPointerOut={() => {
          setHovered(false);
          setCursor("default", "");
        }}
        onClick={(e) => {
          e.stopPropagation();
          onActivateOrOpen(index, `/crew/${member.slug}`);
        }}
      >
        <meshBasicMaterial
          map={cardTexture}
          transparent
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

interface WorkCardMeshProps {
  work: WorkProject;
  index: number;
  cardGeo: THREE.ShapeGeometry;
  onActivateOrOpen: (index: number, href: string) => void;
}

function WorkCardMesh({
  work,
  index,
  cardGeo,
  onActivateOrOpen,
}: WorkCardMeshProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const imgRef = useRef<THREE.Mesh>(null!);
  const frameRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const setCursor = useAppStore((s) => s.setCursor);

  const accentColor = useMemo(() => new THREE.Color(work.accentColor), [work.accentColor]);
  const dimColor = useMemo(() => new THREE.Color("#686E82"), []);
  const whiteColor = useMemo(() => new THREE.Color("#FFFFFF"), []);

  useFrame((_, delta) => {
    const offset = index - timelineMotion.currentIndex;
    const absOffset = Math.abs(offset);
    const angle = offset * CARD_SPACING_ANGLE;

    const targetX = Math.sin(angle) * ARC_RADIUS;
    const targetZ = (Math.cos(angle) - 1) * ARC_RADIUS * 0.85 - absOffset * 0.28;
    const targetY = hovered ? 0.14 : -Math.min(0.32, absOffset * 0.05);

    easing.damp3(groupRef.current.position, [targetX, targetY, targetZ], 0.14, delta);

    const rotY = -angle * 0.72;
    const rotZ = THREE.MathUtils.clamp(-timelineMotion.velocity * 0.045, -0.14, 0.14);
    easing.dampE(groupRef.current.rotation, [0, rotY, rotZ], 0.14, delta);

    const isCenter = absOffset < 0.45;
    const scaleBoost = isCenter
      ? hovered
        ? 1.18
        : 1.13
      : hovered
      ? 0.94
      : Math.max(0.72, 0.92 - absOffset * 0.05);
    const baseW = 2.38;
    const baseH = 2.98;

    easing.damp3(
      imgRef.current.scale,
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
      frameMat.color.lerp(isCenter ? accentColor : dimColor, 0.15);
      easing.damp(
        frameMat,
        "opacity",
        isCenter ? 0.88 : hovered ? 0.38 : 0.14,
        0.15,
        delta
      );
    }

    const imgMat = imgRef.current.material as unknown as {
      color: THREE.Color;
      grayscale: number;
      zoom: number;
      opacity: number;
    };

    if (imgMat && imgMat.color) {
      imgMat.color.lerp(isCenter || hovered ? whiteColor : dimColor, 0.12);
      easing.damp(
        imgMat,
        "grayscale",
        isCenter || hovered ? 0 : Math.min(0.65, absOffset * 0.25),
        0.18,
        delta
      );
      easing.damp(imgMat, "zoom", hovered ? 1.06 : 1.0, 0.2, delta);
      easing.damp(imgMat, "opacity", absOffset > 4.6 ? 0 : 1, 0.15, delta);
    }

    groupRef.current.visible = absOffset < 5.2;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={frameRef} geometry={cardGeo} position={[0, 0, -0.02]}>
        <meshBasicMaterial transparent opacity={0.2} color={work.accentColor} />
      </mesh>

      <Image
        ref={imgRef}
        url={work.coverImage}
        transparent
        radius={0.045}
        scale={[2.38, 2.98]}
        side={THREE.DoubleSide}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          soundEngine.playHover();
          const isActive = Math.abs(index - timelineMotion.currentIndex) < 0.45;
          setCursor("project", isActive ? "MỞ DỰ ÁN" : `SCENE ${work.indexLabel}`);
        }}
        onPointerOut={() => {
          setHovered(false);
          setCursor("default", "");
        }}
        onClick={(e) => {
          e.stopPropagation();
          onActivateOrOpen(index, `/works/${work.slug}`);
        }}
      />
    </group>
  );
}

function CarouselRig({ active }: { active: boolean }) {
  const router = useRouter();
  const rigRef = useRef<THREE.Group>(null!);
  const timelineMode = useAppStore((s) => s.timelineMode);
  const setActiveWorkIndex = useAppStore((s) => s.setActiveWorkIndex);

  const total = timelineMode === "crew" ? CREW_MEMBERS.length : WORKS_DATA.length;
  const sharedCardGeo = useMemo(
    () => createRoundedPlaneGeometry(1, 1, 0.046),
    []
  );

  useEffect(() => {
    return () => {
      sharedCardGeo.dispose();
    };
  }, [sharedCardGeo]);

  useFrame((state, delta) => {
    if (!active) return;
    const prev = timelineMotion.currentIndex;
    timelineMotion.targetIndex = THREE.MathUtils.clamp(
      timelineMotion.targetIndex,
      0,
      total - 1
    );

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
    if (nearest !== useAppStore.getState().activeWorkIndex) {
      setActiveWorkIndex(nearest, false);
    }

    easing.damp3(
      state.camera.position,
      [state.pointer.x * 0.42, state.pointer.y * 0.26 + 0.08, 6.2],
      0.28,
      delta
    );
    state.camera.lookAt(0, 0.05, 0);
  });

  const handleActivateOrOpen = (index: number, href: string) => {
    const dist = Math.abs(index - timelineMotion.currentIndex);
    if (dist < 0.42) {
      soundEngine.playShutter();
      useAppStore.getState().setCursor("default", "");
      router.push(href, { scroll: false });
    } else {
      timelineMotion.targetIndex = index;
      setActiveWorkIndex(index, true);
    }
  };

  return (
    <group ref={rigRef} visible={active}>
      {timelineMode === "crew"
        ? CREW_MEMBERS.map((member, idx) => (
            <MemberCardMesh
              key={member.id}
              member={member}
              index={idx}
              cardGeo={sharedCardGeo}
              onActivateOrOpen={handleActivateOrOpen}
            />
          ))
        : WORKS_DATA.map((work, idx) => (
            <WorkCardMesh
              key={work.id}
              work={work}
              index={idx}
              cardGeo={sharedCardGeo}
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
      <PerspectiveCamera makeDefault position={[0, 0.08, 6.2]} fov={38} />
      <ambientLight intensity={1.2} />
      <Suspense fallback={null}>
        <CarouselRig active={isActive} />
      </Suspense>
    </View>
  );
}
