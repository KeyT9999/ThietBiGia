"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerspectiveCamera, RoundedBox, View } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { type CrewMember } from "@/data/schema";
import { getCombinedRoleBadge, getRoleMeta } from "@/lib/utils";
import { getWorksForMember } from "@/data/works";
import { soundEngine } from "@/lib/sound";

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function createFrontBadgeTexture(
  member: CrewMember,
  avatarImg: HTMLImageElement | null,
  projectCount: number
): THREE.CanvasTexture {
  const W = 1024;
  const H = 1520;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const roleMeta = getRoleMeta(member.roleCategory);

  // Metallic dark laminated base with holographic diagonal sheen
  const baseGrad = ctx.createLinearGradient(0, 0, W, H);
  baseGrad.addColorStop(0, "#1A1D27");
  baseGrad.addColorStop(0.45, "#11131B");
  baseGrad.addColorStop(1, "#0B0D13");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle holographic foil card border & inner panel
  const holoGrad = ctx.createLinearGradient(0, 120, W, H - 100);
  holoGrad.addColorStop(0, "#FF6B3D");
  holoGrad.addColorStop(0.28, "#FDE047");
  holoGrad.addColorStop(0.55, "#22D3EE");
  holoGrad.addColorStop(0.8, "#A855F7");
  holoGrad.addColorStop(1, "#EC4899");

  // Inner frosted holographic plate
  drawRoundedRect(ctx, 44, 124, W - 88, H - 168, 36);
  const plateGrad = ctx.createLinearGradient(44, 124, W - 44, H - 80);
  plateGrad.addColorStop(0, "rgba(244, 241, 234, 0.96)");
  plateGrad.addColorStop(0.55, "rgba(229, 234, 244, 0.94)");
  plateGrad.addColorStop(1, "rgba(216, 224, 238, 0.95)");
  ctx.fillStyle = plateGrad;
  ctx.fill();

  // Soft pastel rainbow foil wash across plate
  ctx.save();
  drawRoundedRect(ctx, 44, 124, W - 88, H - 168, 36);
  ctx.clip();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = holoGrad;
  ctx.fillRect(44, 124, W - 88, H - 168);
  ctx.restore();

  // Top punch slot cutout indicator
  drawRoundedRect(ctx, W / 2 - 110, 42, 220, 38, 19);
  ctx.fillStyle = "#07080B";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.stroke();

  // Top pass header bar inside plate
  ctx.fillStyle = "#111319";
  ctx.font = "700 28px monospace";
  ctx.fillText("THIẾT BỊ GIA // PRESS PASS", 88, 190);

  ctx.textAlign = "right";
  ctx.fillStyle = roleMeta.color;
  ctx.font = "800 32px monospace";
  ctx.fillText(`#${member.badgeNumber}`, W - 88, 190);
  ctx.textAlign = "left";

  // Portrait Frame
  const px = 88;
  const py = 224;
  const pw = W - 176;
  const ph = 640;

  ctx.save();
  drawRoundedRect(ctx, px, py, pw, ph, 24);
  ctx.clip();
  ctx.fillStyle = "#101219";
  ctx.fillRect(px, py, pw, ph);

  if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
    const imgRatio = avatarImg.naturalWidth / avatarImg.naturalHeight;
    const boxRatio = pw / ph;
    let drawW = pw;
    let drawH = ph;
    let drawX = px;
    let drawY = py;
    if (imgRatio > boxRatio) {
      drawW = ph * imgRatio;
      drawX = px - (drawW - pw) / 2;
    } else {
      drawH = pw / imgRatio;
      const yBias = imgRatio < 0.8 ? 0.12 : 0.42;
      drawY = py - (drawH - ph) * yBias;
    }
    ctx.drawImage(avatarImg, drawX, drawY, drawW, drawH);
  }
  ctx.restore();

  // Role badge floating on bottom-left of portrait
  ctx.font = "700 26px sans-serif";
  const badgeText = getCombinedRoleBadge(member.roles);
  const badgeW = ctx.measureText(badgeText).width + 52;
  drawRoundedRect(ctx, px + 24, py + ph - 74, badgeW, 50, 25);
  ctx.fillStyle = roleMeta.color;
  ctx.fill();
  ctx.fillStyle = "#08090C";
  ctx.fillText(badgeText, px + 50, py + ph - 40);

  // Member Name & Role Title (auto-fit long 4-word Vietnamese names cleanly)
  ctx.fillStyle = "#0E1016";
  const upperName = member.name.toUpperCase();
  let nameFontSize = 52;
  ctx.font = `800 ${nameFontSize}px sans-serif`;
  while (ctx.measureText(upperName).width > W - 176 && nameFontSize > 32) {
    nameFontSize -= 2;
    ctx.font = `800 ${nameFontSize}px sans-serif`;
  }
  ctx.fillText(upperName, 88, 948);

  ctx.fillStyle = "#313647";
  ctx.font = "700 28px monospace";
  ctx.fillText(member.roleTitle.toUpperCase(), 88, 996);

  // Barcode vector stripes
  const barY = 1032;
  const barH = 92;
  let curX = 88;
  const seed = member.slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 17);
  ctx.fillStyle = "#0E1016";
  let step = 0;
  while (curX < W - 96) {
    const w = ((seed + step * 13) % 4) * 3 + 3;
    const gap = ((seed + step * 7) % 3) * 3 + 4;
    if (curX + w <= W - 88) {
      ctx.fillRect(curX, barY, w, barH);
    }
    curX += w + gap;
    step++;
  }

  // Favorite Gear Chips (up to 3)
  let gx = 88;
  const gy = 1158;
  ctx.font = "700 23px monospace";
  member.favoriteGear.slice(0, 3).forEach((gear) => {
    const label = gear.toUpperCase();
    const cw = ctx.measureText(label).width + 38;
    if (gx + cw < W - 80) {
      drawRoundedRect(ctx, gx, gy, cw, 46, 23);
      ctx.fillStyle = "rgba(14, 16, 22, 0.08)";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#1E2230";
      ctx.stroke();
      ctx.fillStyle = "#111319";
      ctx.fillText(label, gx + 19, gy + 31);
      gx += cw + 14;
    }
  });

  // Footer divider & stats box
  ctx.strokeStyle = "rgba(14, 16, 22, 0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(88, 1236);
  ctx.lineTo(W - 88, 1236);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(W * 0.6, 1236);
  ctx.lineTo(W * 0.6, 1418);
  ctx.stroke();

  // Socials left
  ctx.fillStyle = "#222634";
  ctx.font = "600 24px monospace";
  ctx.fillText(member.socials.instagram || `@${member.slug}.tbg`, 88, 1290);
  ctx.fillText(member.location + " • " + member.yearsActive, 88, 1336);
  ctx.fillStyle = "#FF4D00";
  ctx.font = "700 22px monospace";
  ctx.fillText("ALL ACCESS CREW", 88, 1384);

  // Project stat right
  ctx.fillStyle = "#0E1016";
  ctx.font = "800 84px sans-serif";
  ctx.fillText(String(projectCount + member.showcase.length).padStart(2, "0"), W * 0.64, 1335);
  ctx.font = "700 22px sans-serif";
  ctx.fillStyle = "#313647";
  ctx.fillText("TÁC PHẨM", W * 0.64, 1375);
  ctx.fillText("& DỰ ÁN NHÓM", W * 0.64, 1404);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function createBackBadgeTexture(member: CrewMember): THREE.CanvasTexture {
  const W = 512;
  const H = 760;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0E1017";
  ctx.fillRect(0, 0, W, H);

  drawRoundedRect(ctx, 28, 64, W - 56, H - 92, 20);
  ctx.strokeStyle = "rgba(255, 77, 0, 0.55)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#FF4D00";
  ctx.font = "700 20px monospace";
  ctx.fillText("CREATIVE MEDIA & DESIGN COLLECTIVE", W / 2, 260);

  ctx.fillStyle = "#F4F1EA";
  ctx.font = "800 46px sans-serif";
  ctx.fillText("THIẾT BỊ GIA", W / 2, 325);

  ctx.fillStyle = "#9499AB";
  ctx.font = "600 20px monospace";
  ctx.fillText(`OFFICIAL CREW PASS #${member.badgeNumber}`, W / 2, 385);
  ctx.fillText("TP. HỒ CHÍ MINH • VIETNAM", W / 2, 425);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function PhysicsBadgeAssembly({ member }: { member: CrewMember }) {
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<RapierRigidBody>(null!);
  const j2 = useRef<RapierRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);
  const strapMeshRef = useRef<THREE.Mesh>(null!);

  const [dragOffset, setDragOffset] = useState<THREE.Vector3 | null>(null);
  const [hovered, setHovered] = useState(false);
  const [avatarImg, setAvatarImg] = useState<HTMLImageElement | null>(null);

  const { camera } = useThree();
  const projectCount = useMemo(() => getWorksForMember(member.slug).length, [member.slug]);

  useEffect(() => {
    let active = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (active) setAvatarImg(img);
    };
    img.src = member.avatar;
    return () => {
      active = false;
    };
  }, [member.avatar]);

  const frontTex = useMemo(
    () => createFrontBadgeTexture(member, avatarImg, projectCount),
    [member, avatarImg, projectCount]
  );
  const backTex = useMemo(() => createBackBadgeTexture(member), [member]);

  useEffect(() => {
    return () => {
      frontTex.dispose();
      backTex.dispose();
    };
  }, [frontTex, backTex]);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.68]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.68]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.68]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.38, 0],
  ]);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 3.8, 0),
        new THREE.Vector3(0, 3.0, 0),
        new THREE.Vector3(0, 2.2, 0),
        new THREE.Vector3(0, 1.4, 0),
      ]),
    []
  );

  const vec = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (hovered) {
      document.body.style.cursor = dragOffset ? "grabbing" : "grab";
    }
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragOffset]);

  useFrame((state) => {
    if (dragOffset && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(camera);
      dir.copy(vec).sub(camera.position).normalize();
      vec.add(dir.multiplyScalar(camera.position.length()));

      [card, j1, j2, j3].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragOffset.x,
        y: vec.y - dragOffset.y,
        z: vec.z - dragOffset.z,
      });
    }

    if (fixed.current && j1.current && j2.current && j3.current && card.current && strapMeshRef.current) {
      const p0 = fixed.current.translation();
      const p1 = j1.current.translation();
      const p2 = j2.current.translation();
      const p3 = j3.current.translation();

      curve.points[0].set(p0.x, p0.y, p0.z);
      curve.points[1].set(p1.x, p1.y, p1.z);
      curve.points[2].set(p2.x, p2.y, p2.z);
      curve.points[3].set(p3.x, p3.y - 0.08, p3.z);

      const newGeo = new THREE.TubeGeometry(curve, 28, 0.055, 8, false);
      strapMeshRef.current.geometry.dispose();
      strapMeshRef.current.geometry = newGeo;

      // Stabilize spin so front of badge stays comfortably readable
      const ang = card.current.angvel();
      const rot = card.current.rotation();
      card.current.setAngvel(
        { x: ang.x, y: ang.y - rot.y * 0.22, z: ang.z },
        false
      );
    }
  });

  return (
    <>
      <group position={[0, 0.25, 0]}>
        <RigidBody ref={fixed} type="fixed" position={[0, 3.65, 0]} />
        <RigidBody
          ref={j1}
          position={[0.15, 2.95, 0]}
          colliders={false}
          linearDamping={3.2}
          angularDamping={3.2}
        >
          <BallCollider args={[0.08]} />
        </RigidBody>
        <RigidBody
          ref={j2}
          position={[0.28, 2.25, 0]}
          colliders={false}
          linearDamping={3.2}
          angularDamping={3.2}
        >
          <BallCollider args={[0.08]} />
        </RigidBody>
        <RigidBody
          ref={j3}
          position={[0.35, 1.55, 0]}
          colliders={false}
          linearDamping={3.2}
          angularDamping={3.2}
        >
          <BallCollider args={[0.08]} />
        </RigidBody>

        <RigidBody
          ref={card}
          position={[0.38, 0.15, 0]}
          type={dragOffset ? "kinematicPosition" : "dynamic"}
          colliders={false}
          linearDamping={1.8}
          angularDamping={2.5}
        >
          <CuboidCollider args={[0.92, 1.36, 0.04]} />

          <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.target as Element)?.setPointerCapture?.(e.pointerId);
              soundEngine.playTick(0.95);
              if (card.current) {
                const tr = card.current.translation();
                setDragOffset(
                  new THREE.Vector3().copy(e.point).sub(new THREE.Vector3(tr.x, tr.y, tr.z))
                );
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              (e.target as Element)?.releasePointerCapture?.(e.pointerId);
              soundEngine.playTick(0.6);
              setDragOffset(null);
            }}
          >
            {/* Metal Lobster Clasp Hardware */}
            <mesh position={[0, 1.42, 0]}>
              <torusGeometry args={[0.11, 0.026, 16, 32]} />
              <meshStandardMaterial color="#D4D8E2" metalness={0.92} roughness={0.18} />
            </mesh>
            <mesh position={[0, 1.55, 0]}>
              <cylinderGeometry args={[0.055, 0.075, 0.2, 20]} />
              <meshStandardMaterial color="#AEB4C4" metalness={0.9} roughness={0.22} />
            </mesh>

            {/* Clear Acrylic / Beveled Dark Card Core */}
            <RoundedBox args={[1.88, 2.78, 0.045]} radius={0.08} smoothness={4}>
              <meshPhysicalMaterial
                color="#141720"
                metalness={0.35}
                roughness={0.2}
                clearcoat={1}
                clearcoatRoughness={0.12}
              />
            </RoundedBox>

            {/* Front Holographic Laminated Face */}
            <mesh position={[0, 0, 0.025]}>
              <planeGeometry args={[1.82, 2.7]} />
              <meshPhysicalMaterial
                map={frontTex}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.18}
                metalness={0.12}
                iridescence={1}
                iridescenceIOR={1.32}
                iridescenceThicknessRange={[140, 720]}
              />
            </mesh>

            {/* Back Pass Face */}
            <mesh position={[0, 0, -0.025]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[1.82, 2.7]} />
              <meshPhysicalMaterial
                map={backTex}
                clearcoat={0.8}
                roughness={0.25}
                metalness={0.2}
                iridescence={0.6}
              />
            </mesh>
          </group>
        </RigidBody>
      </group>

      {/* Woven Black Fabric Strap Mesh */}
      <mesh ref={strapMeshRef} position={[0, 0.25, 0]}>
        <tubeGeometry args={[curve, 28, 0.055, 8, false]} />
        <meshStandardMaterial color="#16181F" roughness={0.85} metalness={0.08} />
      </mesh>
    </>
  );
}

export function LanyardPressPass3DView({ member }: { member: CrewMember }) {
  return (
    <View index={2} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 6.6]} fov={34} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} />
      <directionalLight position={[-4, 2, 3]} intensity={0.9} color="#FF6A2B" />

      {/* Local GPU procedural studio reflections — ZERO external HDR fetch latency */}
      <Environment resolution={256}>
        <Lightformer
          intensity={2.4}
          color="#ffffff"
          position={[0, 4, 5]}
          rotation={[0, 0, Math.PI / 6]}
          scale={[8, 2, 1]}
        />
        <Lightformer
          intensity={1.8}
          color="#FF4D00"
          position={[-5, 1, 2]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[6, 2, 1]}
        />
        <Lightformer
          intensity={1.6}
          color="#00E5FF"
          position={[5, -1, 3]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[6, 2, 1]}
        />
      </Environment>

      <Suspense fallback={null}>
        <Physics gravity={[0, -32, 0]} interpolate timeStep={1 / 60}>
          <PhysicsBadgeAssembly key={member.slug} member={member} />
        </Physics>
      </Suspense>
    </View>
  );
}
