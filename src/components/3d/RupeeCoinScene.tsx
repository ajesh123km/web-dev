import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type RupeeSceneMode = 'shield' | 'carousel' | 'vault';

interface RupeeCoinSceneProps {
  variant?: 'hero' | 'ambient';
  mode?: RupeeSceneMode;
  className?: string;
}

interface CoinTextures {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

/**
 * Converts a blurred grayscale height canvas into a crisp tangent-space normal map
 * so embossed ₹ typography and concentric bezel tracks catch dynamic studio highlights.
 */
function buildNormalMapFromHeightCanvas(
  heightCanvas: HTMLCanvasElement,
  strength = 3.2
): THREE.CanvasTexture {
  const w = heightCanvas.width;
  const h = heightCanvas.height;
  const srcCtx = heightCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, w, h).data;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = w;
  normalCanvas.height = h;
  const dstCtx = normalCanvas.getContext('2d')!;
  const dstImg = dstCtx.createImageData(w, h);
  const dst = dstImg.data;

  const sample = (x: number, y: number): number => {
    const cx = Math.max(0, Math.min(w - 1, x));
    const cy = Math.max(0, Math.min(h - 1, y));
    return srcData[(cy * w + cx) * 4] / 255;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tl = sample(x - 1, y - 1);
      const t = sample(x, y - 1);
      const tr = sample(x + 1, y - 1);
      const l = sample(x - 1, y);
      const r = sample(x + 1, y);
      const bl = sample(x - 1, y + 1);
      const b = sample(x, y + 1);
      const br = sample(x + 1, y + 1);

      const dx = tr + 2 * r + br - (tl + 2 * l + bl);
      const dy = bl + 2 * b + br - (tl + 2 * t + tr);

      let nx = -dx * strength;
      let ny = -dy * strength;
      let nz = 1.0;
      const invLen = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx *= invLen;
      ny *= invLen;
      nz *= invLen;

      const idx = (y * w + x) * 4;
      dst[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      dst[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      dst[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      dst[idx + 3] = 255;
    }
  }

  dstCtx.putImageData(dstImg, 0, 0);
  const normalTex = new THREE.CanvasTexture(normalCanvas);
  normalTex.needsUpdate = true;
  return normalTex;
}

/**
 * Generates brushed white-silver / emerald minted Rupee coin textures
 * with matching Sobel normal map, roughness map, and relief bump map.
 */
function createRupeeFaceTextures(
  isBack = false,
  tone: 'platinum' | 'mint' = 'platinum',
  maxAnisotropy = 4
): CoinTextures {
  const size = 512;
  const cx = size / 2;
  const cy = size / 2;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(cx - 58, cy - 58, 16, cx, cy, 250);
  if (tone === 'platinum') {
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.45, '#F7FCF9');
    grad.addColorStop(0.84, '#E6F6EC');
    grad.addColorStop(1, '#A7F3D0');
  } else {
    grad.addColorStop(0, '#DCFCE7');
    grad.addColorStop(0.42, '#65E83A');
    grad.addColorStop(0.82, '#22C55E');
    grad.addColorStop(1, '#15803D');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 160; i++) {
    const angle = (i / 160) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 42, cy + Math.sin(angle) * 42);
    ctx.lineTo(cx + Math.cos(angle) * 244, cy + Math.sin(angle) * 244);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = '#064E3B';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(cx, cy, 222, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = tone === 'platinum' ? '#16A34A' : '#FFFFFF';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 200, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#65E83A';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 187, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 222, cy + Math.sin(a) * 222, 2.7, 0, Math.PI * 2);
    ctx.fill();
  }

  hCtx.fillStyle = '#6C6C6C';
  hCtx.fillRect(0, 0, size, size);
  hCtx.save();
  hCtx.filter = 'blur(2.5px)';
  hCtx.strokeStyle = '#F2F2F2';
  hCtx.lineWidth = 16;
  hCtx.beginPath();
  hCtx.arc(cx, cy, 222, 0, Math.PI * 2);
  hCtx.stroke();
  hCtx.lineWidth = 6;
  hCtx.beginPath();
  hCtx.arc(cx, cy, 198, 0, Math.PI * 2);
  hCtx.stroke();
  hCtx.restore();

  rCtx.fillStyle = '#6A6A6A';
  rCtx.fillRect(0, 0, size, size);
  rCtx.strokeStyle = '#2B2B2B';
  rCtx.lineWidth = 16;
  rCtx.beginPath();
  rCtx.arc(cx, cy, 222, 0, Math.PI * 2);
  rCtx.stroke();

  ctx.save();
  ctx.translate(cx, cy);
  hCtx.save();
  hCtx.translate(cx, cy);
  rCtx.save();
  rCtx.translate(cx, cy);

  if (!isBack) {
    ctx.font = '800 228px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = tone === 'platinum' ? 'rgba(6, 78, 59, 0.22)' : 'rgba(5, 46, 34, 0.26)';
    ctx.fillText('₹', 4, 14);
    const symGrad = ctx.createLinearGradient(0, -110, 0, 110);
    if (tone === 'platinum') {
      symGrad.addColorStop(0, '#064E3B');
      symGrad.addColorStop(0.5, '#16A34A');
      symGrad.addColorStop(1, '#052E22');
    } else {
      symGrad.addColorStop(0, '#052E22');
      symGrad.addColorStop(0.55, '#064E3B');
      symGrad.addColorStop(1, '#04241B');
    }
    ctx.fillStyle = symGrad;
    ctx.fillText('₹', 0, 8);

    hCtx.filter = 'blur(3.2px)';
    hCtx.font = '800 228px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    hCtx.textAlign = 'center';
    hCtx.textBaseline = 'middle';
    hCtx.fillStyle = '#FFFFFF';
    hCtx.fillText('₹', 0, 8);

    rCtx.font = '800 228px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    rCtx.textAlign = 'center';
    rCtx.textBaseline = 'middle';
    rCtx.fillStyle = '#262626';
    rCtx.fillText('₹', 0, 8);
  } else {
    ctx.font = '800 138px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#064E3B';
    ctx.fillText('₹', 0, -20);
    ctx.font = '800 24px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#064E3B';
    ctx.fillText('TEAM STARS', 0, 74);
    ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#264D40';
    ctx.fillText('CHITS PVT LTD', 0, 106);

    hCtx.filter = 'blur(2.8px)';
    hCtx.font = '800 138px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    hCtx.textAlign = 'center';
    hCtx.textBaseline = 'middle';
    hCtx.fillStyle = '#FFFFFF';
    hCtx.fillText('₹', 0, -20);

    rCtx.font = '800 138px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    rCtx.textAlign = 'center';
    rCtx.textBaseline = 'middle';
    rCtx.fillStyle = '#2A2A2A';
    rCtx.fillText('₹', 0, -20);
  }

  ctx.restore();
  hCtx.restore();
  rCtx.restore();

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(heightCanvas);
  bumpMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.anisotropy = maxAnisotropy;

  const normalMap = buildNormalMapFromHeightCanvas(heightCanvas, 3.6);
  normalMap.anisotropy = maxAnisotropy;

  return { map, normalMap, roughnessMap, bumpMap };
}

/**
 * Generates frosted sandblasted antique nickel-silver coin field textures
 * with isotropic micro-grain and inner-rim crevice AO matching the reference image.
 */
function createBrushedSatinTextures(maxAnisotropy = 4): CoinTextures {
  const size = 512;
  const cx = size / 2;
  const cy = size / 2;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  const colorImg = ctx.createImageData(size, size);
  const heightImg = hCtx.createImageData(size, size);
  const roughImg = rCtx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy) / (size * 0.5);

      // Subtle directional studio sheen + crisp inner-rim crevice AO darkening
      const offCenter = Math.hypot(x - (cx - 38), y - (cy - 38)) / (size * 0.55);
      const baseTone = 212 - Math.min(1, offCenter) * 28;
      const rimAO = dist > 0.88 ? 1 - Math.min(1, (dist - 0.88) / 0.12) * 0.42 : 1.0;

      // Deterministic fine sandblasted metallic grain (isotropic micro-facets)
      const h1 = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const noise1 = h1 - Math.floor(h1);
      const h2 = Math.sin((x >> 1) * 39.346 + (y >> 1) * 11.135) * 24634.6345;
      const noise2 = h2 - Math.floor(h2);
      const grain = (noise1 * 0.68 + noise2 * 0.32 - 0.5) * 26;

      // Warm-neutral antique nickel-silver tint (subtle warm pewter undertone)
      const lum = Math.max(40, Math.min(242, (baseTone + grain * 0.55) * rimAO));
      const idx = (y * size + x) * 4;
      colorImg.data[idx] = Math.round(lum);
      colorImg.data[idx + 1] = Math.round(lum * 0.975);
      colorImg.data[idx + 2] = Math.round(lum * 0.94);
      colorImg.data[idx + 3] = 255;

      // Micro-peened heightmap for genuine frosted metallic light scattering
      const hByte = Math.max(0, Math.min(255, Math.round(128 + grain * 2.2)));
      heightImg.data[idx] = hByte;
      heightImg.data[idx + 1] = hByte;
      heightImg.data[idx + 2] = hByte;
      heightImg.data[idx + 3] = 255;

      // Frosted matte-satin roughness across field (slight increase near dark rim crevice)
      const rByte = Math.max(
        70,
        Math.min(185, Math.round(122 + (1 - rimAO) * 58 + (noise1 - 0.5) * 24))
      );
      roughImg.data[idx] = rByte;
      roughImg.data[idx + 1] = rByte;
      roughImg.data[idx + 2] = rByte;
      roughImg.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(colorImg, 0, 0);
  hCtx.putImageData(heightImg, 0, 0);
  rCtx.putImageData(roughImg, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(heightCanvas);
  bumpMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.anisotropy = maxAnisotropy;

  const normalMap = buildNormalMapFromHeightCanvas(heightCanvas, 0.95);
  normalMap.anisotropy = maxAnisotropy;

  return { map, normalMap, roughnessMap, bumpMap };
}

/**
 * Generates high-contrast vertical milled/reeded coin edge textures
 * (116 crisp deep grooves around the cylindrical rim wall).
 */
function createCoinReedingTextures(maxAnisotropy = 4): CoinTextures {
  const width = 2048;
  const height = 64;
  const reedCount = 116;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = width;
  heightCanvas.height = height;
  const hCtx = heightCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rCtx = roughCanvas.getContext('2d')!;

  const colorImg = ctx.createImageData(width, height);
  const heightImg = hCtx.createImageData(width, height);
  const roughImg = rCtx.createImageData(width, height);

  for (let x = 0; x < width; x++) {
    const phase = ((x / width) * reedCount) % 1;
    // Crisp flat-topped trapezoidal tooth profile (bright ridges, deep dark valleys)
    let hVal = 1.0;
    if (phase < 0.35) {
      hVal = 1.0;
    } else if (phase < 0.49) {
      hVal = 1.0 - (phase - 0.35) / 0.14;
    } else if (phase < 0.86) {
      hVal = 0.0;
    } else {
      hVal = (phase - 0.86) / 0.14;
    }

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      const vEdge = Math.sin((y / (height - 1)) * Math.PI);
      const edgeAO = 0.74 + 0.26 * Math.min(1, vEdge * 2.5);

      const albedo = Math.round((62 + hVal * 184) * edgeAO);
      colorImg.data[idx] = albedo;
      colorImg.data[idx + 1] = Math.round(albedo * 0.985);
      colorImg.data[idx + 2] = Math.round(albedo * 0.955);
      colorImg.data[idx + 3] = 255;

      const hByte = Math.round(hVal * 255);
      heightImg.data[idx] = hByte;
      heightImg.data[idx + 1] = hByte;
      heightImg.data[idx + 2] = hByte;
      heightImg.data[idx + 3] = 255;

      // Polished silver tooth crests, matte-dark recessed valleys
      const rByte = Math.round(42 + (1 - hVal) * 145);
      roughImg.data[idx] = rByte;
      roughImg.data[idx + 1] = rByte;
      roughImg.data[idx + 2] = rByte;
      roughImg.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(colorImg, 0, 0);
  hCtx.putImageData(heightImg, 0, 0);
  rCtx.putImageData(roughImg, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(heightCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
  roughnessMap.anisotropy = maxAnisotropy;

  const normalMap = buildNormalMapFromHeightCanvas(heightCanvas, 5.2);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.ClampToEdgeWrapping;
  normalMap.anisotropy = maxAnisotropy;

  return { map, normalMap, roughnessMap, bumpMap };
}

/**
 * Generates a high-contrast neutral-warm studio HDR softbox reflection map
 * matching the antique pewter/nickel silver sheen and crisp charcoal shadows.
 */
function createVideoDarkStudioEnvironment(pmrem: THREE.PMREMGenerator): THREE.Texture {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#0B0A09');

  const panelGeo = new THREE.PlaneGeometry(1, 1);

  const addPanel = (
    color: [number, number, number],
    pos: [number, number, number],
    scale: [number, number],
    lookAtPos: [number, number, number] = [0, 0, 0]
  ) => {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color[0], color[1], color[2]),
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(panelGeo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.scale.set(scale[0], scale[1], 1);
    mesh.lookAt(lookAtPos[0], lookAtPos[1], lookAtPos[2]);
    envScene.add(mesh);
  };

  // Primary bright pearl-silver key softbox (top-left front)
  addPanel([3.95, 3.88, 3.74], [-5.2, 5.4, 5.5], [5.8, 4.4]);
  // Overhead crisp neutral-warm silver rim strip
  addPanel([2.55, 2.50, 2.40], [0.4, 7.2, 2.2], [6.8, 2.4]);
  // Lower-left antique pewter-silver edge kicker
  addPanel([1.85, 1.80, 1.72], [-6.5, -2.8, 2.8], [3.4, 5.0]);
  // Right silver-pearl contour softbox
  addPanel([2.72, 2.66, 2.56], [6.0, -1.6, 3.0], [3.6, 5.6]);
  // Rear-right dark silver rim accent
  addPanel([2.10, 2.05, 1.96], [4.4, 3.2, -5.8], [4.4, 4.0]);
  // Deep charcoal-taupe studio floor bounce
  addPanel([0.38, 0.36, 0.33], [0, -7.0, 1.0], [9.5, 9.5]);

  const rt = pmrem.fromScene(envScene, 0.04);

  envScene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      (m.material as THREE.Material).dispose();
    }
  });
  panelGeo.dispose();

  return rt.texture;
}

/**
 * Generates a soft elliptical studio contact shadow texture.
 */
function createContactShadowTexture(neutral = false): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
  if (neutral) {
    grad.addColorStop(0, 'rgba(18, 16, 15, 0.14)');
    grad.addColorStop(0.55, 'rgba(24, 20, 18, 0.06)');
    grad.addColorStop(1, 'rgba(24, 20, 18, 0)');
  } else {
    grad.addColorStop(0, 'rgba(5, 46, 34, 0.16)');
    grad.addColorStop(0.55, 'rgba(6, 78, 59, 0.07)');
    grad.addColorStop(1, 'rgba(6, 78, 59, 0)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates crisp metallic slab emblem texture for the Hero Shield financial cards.
 */
function createSlabFaceTexture(
  variant: 'rupee' | 'crest',
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#0B5D46');
  grad.addColorStop(0.55, '#064E3B');
  grad.addColorStop(1, '#052E22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle geometric arc highlight
  ctx.strokeStyle = 'rgba(101, 232, 58, 0.42)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.5, 196, 0, Math.PI * 2);
  ctx.stroke();

  if (variant === 'rupee') {
    ctx.font = '800 230px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillText('₹', size / 2 + 5, size / 2 + 12);

    const symGrad = ctx.createLinearGradient(0, 120, 0, 400);
    symGrad.addColorStop(0, '#FFFFFF');
    symGrad.addColorStop(0.55, '#ECFDF5');
    symGrad.addColorStop(1, '#65E83A');
    ctx.fillStyle = symGrad;
    ctx.fillText('₹', size / 2, size / 2 + 6);
  } else {
    // Circular seal emblem on right-hand card slab
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 136, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#65E83A';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 136, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '800 94px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('₹', size / 2, size / 2 - 14);

    ctx.font = '800 28px "Outfit", system-ui, sans-serif';
    ctx.fillStyle = '#65E83A';
    ctx.fillText('TEAM STARS', size / 2, size / 2 + 58);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createKnurledCoinGeometry(
  radius: number,
  thickness: number,
  radialSegments = 128,
  ridgeCount = 48,
  ridgeDepth = 0.011
): THREE.CylinderGeometry {
  const geo = new THREE.CylinderGeometry(radius, radius, thickness, radialSegments, 1, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r > radius * 0.92) {
      const angle = Math.atan2(z, x);
      const modulation = 1 + (ridgeDepth / radius) * Math.cos(angle * ridgeCount);
      pos.setX(i, x * modulation);
      pos.setZ(i, z * modulation);
    }
  }

  pos.needsUpdate = true;
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function createRoundedSlabGeometry(width: number, height: number, depth: number, radius: number): THREE.ExtrudeGeometry {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w * 0.5, h * 0.5);

  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.045,
    bevelSegments: 4
  });
  geo.center();
  return geo;
}

function createSecurityShieldGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 1.38);
  shape.bezierCurveTo(0.62, 1.38, 1.08, 1.24, 1.18, 0.98);
  shape.bezierCurveTo(1.22, 0.12, 0.94, -0.78, 0, -1.42);
  shape.bezierCurveTo(-0.94, -0.78, -1.22, 0.12, -1.18, 0.98);
  shape.bezierCurveTo(-1.08, 1.24, -0.62, 1.38, 0, 1.38);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 5
  });
  geo.center();
  return geo;
}

function createCheckmarkGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.42, -0.02);
  shape.lineTo(-0.27, 0.13);
  shape.lineTo(-0.08, -0.06);
  shape.lineTo(0.32, 0.35);
  shape.lineTo(0.47, 0.2);
  shape.lineTo(-0.08, -0.35);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 3
  });
  geo.center();
  return geo;
}

type CurrencySymbolType = '$' | '£' | '₹' | '€';

function createRectShape(x1: number, y1: number, x2: number, y2: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(x1, y1);
  s.lineTo(x2, y1);
  s.lineTo(x2, y2);
  s.lineTo(x1, y2);
  s.closePath();
  return s;
}

function extrudeAndMergeParts(
  parts: { shape: THREE.Shape; depth: number; zOffset?: number }[],
  scale: number
): THREE.BufferGeometry {
  const geos = parts.map(({ shape, depth, zOffset = 0 }) => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.004,
      bevelSegments: 3,
      curveSegments: 24
    });
    if (zOffset !== 0) g.translate(0, 0, zOffset);
    return g;
  });

  const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
  if (geos.length > 1) {
    geos.forEach((g) => g.dispose());
  }
  merged.scale(scale, scale, 1);
  merged.center();
  return merged;
}

/**
 * Builds precision 3D extruded & beveled currency glyph geometries matching the exact 4 symbols
 * from the reference video ($, £, ₹, €).
 */
function createCurrencyGlyphGeometry(symbol: CurrencySymbolType, scale = 0.80): THREE.BufferGeometry {
  if (symbol === '₹') {
    const shape = new THREE.Shape();
    shape.moveTo(-0.21, 0.32);
    shape.lineTo(0.22, 0.32);
    shape.lineTo(0.22, 0.25);
    shape.lineTo(0.02, 0.25);
    shape.quadraticCurveTo(0.115, 0.215, 0.125, 0.165);
    shape.lineTo(0.22, 0.165);
    shape.lineTo(0.22, 0.10);
    shape.lineTo(0.125, 0.10);
    shape.bezierCurveTo(0.115, -0.005, 0.035, -0.055, -0.075, -0.075);
    shape.lineTo(0.18, -0.34);
    shape.lineTo(0.075, -0.34);
    shape.lineTo(-0.195, -0.06);
    shape.lineTo(-0.195, 0.005);
    shape.lineTo(-0.05, 0.005);
    shape.quadraticCurveTo(0.035, 0.015, 0.038, 0.10);
    shape.lineTo(-0.21, 0.10);
    shape.lineTo(-0.21, 0.165);
    shape.lineTo(0.038, 0.165);
    shape.quadraticCurveTo(0.032, 0.22, -0.065, 0.25);
    shape.lineTo(-0.21, 0.25);
    shape.closePath();
    return extrudeAndMergeParts([{ shape, depth: 0.012 }], scale);
  }

  if (symbol === '$') {
    const s = new THREE.Shape();
    s.moveTo(0.165, 0.155);
    s.bezierCurveTo(0.155, 0.245, 0.075, 0.275, 0.0, 0.275);
    s.bezierCurveTo(-0.115, 0.275, -0.175, 0.21, -0.175, 0.12);
    s.bezierCurveTo(-0.175, 0.02, -0.085, -0.01, 0.01, -0.03);
    s.bezierCurveTo(0.085, -0.048, 0.105, -0.078, 0.105, -0.122);
    s.bezierCurveTo(0.105, -0.175, 0.055, -0.205, -0.005, -0.205);
    s.bezierCurveTo(-0.07, -0.205, -0.105, -0.175, -0.112, -0.12);
    s.lineTo(-0.192, -0.12);
    s.bezierCurveTo(-0.185, -0.225, -0.105, -0.278, -0.005, -0.278);
    s.bezierCurveTo(0.115, -0.278, 0.188, -0.212, 0.188, -0.112);
    s.bezierCurveTo(0.188, -0.012, 0.095, 0.022, 0.0, 0.042);
    s.bezierCurveTo(-0.072, 0.06, -0.092, 0.082, -0.092, 0.122);
    s.bezierCurveTo(-0.092, 0.172, -0.052, 0.202, 0.0, 0.202);
    s.bezierCurveTo(0.052, 0.202, 0.082, 0.182, 0.088, 0.14);
    s.closePath();

    const bar = createRectShape(-0.028, -0.345, 0.028, 0.345);
    return extrudeAndMergeParts(
      [
        { shape: s, depth: 0.012 },
        { shape: bar, depth: 0.010, zOffset: 0.001 }
      ],
      scale
    );
  }

  if (symbol === '€') {
    const c = new THREE.Shape();
    const rOut = 0.255;
    const rIn = 0.172;
    const aStart = 0.62;
    const aEnd = Math.PI * 2 - 0.62;
    const cx = 0.05;
    c.moveTo(cx + Math.cos(aStart) * rOut, Math.sin(aStart) * rOut);
    c.absarc(cx, 0, rOut, aStart, aEnd, false);
    c.lineTo(cx + Math.cos(aEnd) * rIn, Math.sin(aEnd) * rIn);
    c.absarc(cx, 0, rIn, aEnd, aStart, true);
    c.closePath();

    const barTop = createRectShape(-0.23, 0.025, 0.11, 0.085);
    const barBot = createRectShape(-0.23, -0.085, 0.11, -0.025);
    return extrudeAndMergeParts(
      [
        { shape: c, depth: 0.012 },
        { shape: barTop, depth: 0.010, zOffset: 0.001 },
        { shape: barBot, depth: 0.010, zOffset: 0.001 }
      ],
      scale
    );
  }

  // '£' (Pound Sterling)
  const body = new THREE.Shape();
  body.moveTo(0.17, 0.165);
  body.bezierCurveTo(0.155, 0.275, 0.065, 0.315, -0.02, 0.315);
  body.bezierCurveTo(-0.135, 0.315, -0.175, 0.225, -0.145, 0.08);
  body.lineTo(-0.11, -0.10);
  body.bezierCurveTo(-0.10, -0.155, -0.13, -0.195, -0.19, -0.22);
  body.lineTo(-0.19, -0.295);
  body.lineTo(0.195, -0.295);
  body.lineTo(0.195, -0.22);
  body.lineTo(-0.045, -0.22);
  body.bezierCurveTo(-0.018, -0.18, -0.012, -0.14, -0.025, -0.075);
  body.lineTo(-0.062, 0.09);
  body.bezierCurveTo(-0.082, 0.185, -0.055, 0.24, 0.005, 0.24);
  body.bezierCurveTo(0.055, 0.24, 0.082, 0.205, 0.09, 0.15);
  body.closePath();

  const crossbar = createRectShape(-0.185, -0.03, 0.115, 0.038);
  return extrudeAndMergeParts(
    [
      { shape: body, depth: 0.012 },
      { shape: crossbar, depth: 0.010, zOffset: 0.001 }
    ],
    scale
  );
}

/**
 * Builds a precision-machined, flat-topped coin outer rim collar with exact edge bevel.
 * At radius 0.5, thickness 0.09 (half 0.045), bevel 0.015: crest sits at r=0.485, wall at z=±0.030.
 */
function createSteppedCoinRimGeometry(
  coinRadius: number,
  fieldHalfT: number,
  rimHalfT: number,
  edgeBevel: number,
  radialSegments = 128
): THREE.LatheGeometry {
  const rInner = coinRadius * 0.870;
  const rStep = coinRadius * 0.900;
  const rCrestIn = coinRadius * 0.916;
  const rCrestOut = coinRadius - edgeBevel;
  const rChamfer = coinRadius;
  const wallHalfT = rimHalfT - edgeBevel;

  // Duplicate corner points slightly offset so flat rim faces stay crisp and specular bevels stay tight
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(rInner, fieldHalfT),
    new THREE.Vector2(rStep, fieldHalfT),
    new THREE.Vector2(rCrestIn, rimHalfT),
    new THREE.Vector2(rCrestIn + 0.002, rimHalfT),
    new THREE.Vector2(rCrestOut - 0.002, rimHalfT),
    new THREE.Vector2(rCrestOut, rimHalfT),
    new THREE.Vector2(rChamfer, wallHalfT),
    new THREE.Vector2(rChamfer, -wallHalfT),
    new THREE.Vector2(rCrestOut, -rimHalfT),
    new THREE.Vector2(rCrestOut - 0.002, -rimHalfT),
    new THREE.Vector2(rCrestIn + 0.002, -rimHalfT),
    new THREE.Vector2(rCrestIn, -rimHalfT),
    new THREE.Vector2(rStep, -fieldHalfT),
    new THREE.Vector2(rInner, -fieldHalfT),
    new THREE.Vector2(rInner, fieldHalfT)
  ];

  const geo = new THREE.LatheGeometry(profile, radialSegments);
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function buildCarouselCoin(
  fieldGeo: THREE.BufferGeometry,
  rimCollarGeo: THREE.BufferGeometry,
  edgeBandGeo: THREE.BufferGeometry,
  glyphGeo: THREE.BufferGeometry,
  fieldMat: THREE.Material,
  rimCollarMat: THREE.Material,
  edgeBandMat: THREE.Material,
  glyphMat: THREE.Material,
  fieldHalfT: number
): THREE.Group {
  const coin = new THREE.Group();

  const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
  fieldMesh.castShadow = true;
  fieldMesh.receiveShadow = true;
  coin.add(fieldMesh);

  const rimCollar = new THREE.Mesh(rimCollarGeo, rimCollarMat);
  rimCollar.castShadow = true;
  rimCollar.receiveShadow = true;
  coin.add(rimCollar);

  const edgeBand = new THREE.Mesh(edgeBandGeo, edgeBandMat);
  edgeBand.castShadow = true;
  edgeBand.receiveShadow = true;
  coin.add(edgeBand);

  const frontGlyph = new THREE.Mesh(glyphGeo, glyphMat);
  frontGlyph.position.z = fieldHalfT + 0.003;
  frontGlyph.castShadow = true;
  coin.add(frontGlyph);

  const backGlyph = new THREE.Mesh(glyphGeo, glyphMat);
  backGlyph.position.z = -(fieldHalfT + 0.003);
  backGlyph.rotation.y = Math.PI;
  backGlyph.castShadow = true;
  coin.add(backGlyph);

  return coin;
}

function buildHeroRupeeCoin(
  frontMat: THREE.MeshStandardMaterial,
  backMat: THREE.MeshStandardMaterial,
  edgeSilverMat: THREE.MeshStandardMaterial,
  forestGreenMat: THREE.MeshStandardMaterial,
  mintAccentMat: THREE.MeshStandardMaterial
): THREE.Group {
  const coinGroup = new THREE.Group();

  const coreGeo = createKnurledCoinGeometry(1.14, 0.19, 128, 56, 0.014);
  const coreMesh = new THREE.Mesh(coreGeo, [edgeSilverMat, frontMat, backMat]);
  coreMesh.castShadow = true;
  coreMesh.receiveShadow = true;
  coinGroup.add(coreMesh);

  const rimGeo = new THREE.TorusGeometry(1.13, 0.052, 20, 72);
  const frontRim = new THREE.Mesh(rimGeo, forestGreenMat);
  frontRim.position.z = 0.088;
  frontRim.castShadow = true;
  coinGroup.add(frontRim);

  const backRim = new THREE.Mesh(rimGeo, forestGreenMat);
  backRim.position.z = -0.088;
  coinGroup.add(backRim);

  const mintRingGeo = new THREE.TorusGeometry(1.175, 0.018, 12, 72);
  const mintRing = new THREE.Mesh(mintRingGeo, mintAccentMat);
  coinGroup.add(mintRing);

  return coinGroup;
}

function buildGrowthPillar(
  width: number,
  height: number,
  depth: number,
  bodyMat: THREE.Material,
  capMat: THREE.Material
): THREE.Group {
  const pillar = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  body.position.y = height / 2;
  pillar.add(body);

  const cap = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 0.045, depth * 0.96), capMat);
  cap.position.y = height + 0.022;
  cap.castShadow = true;
  pillar.add(cap);

  return pillar;
}

const _ndcPointer = new THREE.Vector2();
const _axisX = new THREE.Vector3(1, 0, 0);
const _axisY = new THREE.Vector3(0, 1, 0);
const _axisZ = new THREE.Vector3(0, 0, 1);
const _qFlipX = new THREE.Quaternion();
const _qPitchY = new THREE.Quaternion();
const _qRollZ = new THREE.Quaternion();

export const RupeeCoinScene: React.FC<RupeeCoinSceneProps> = ({
  variant = 'hero',
  mode = 'carousel',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const gl = renderer.getContext();
    if (!gl) {
      renderer.dispose();
      setWebglUnavailable(true);
      return;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const glRendererStr = String(
      (debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '') ||
        gl.getParameter(gl.RENDERER) ||
        ''
    );
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Mesa OffScreen/i.test(glRendererStr);

    const width = Math.max(container.clientWidth, 240);
    const height = Math.max(container.clientHeight, 220);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = mode === 'carousel' ? 1.15 : 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.outline = 'none';
    container.innerHTML = '';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    if (mode !== 'carousel') {
      scene.fog = new THREE.FogExp2('#F4FBF7', 0.018);
    }

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture =
      mode === 'carousel'
        ? createVideoDarkStudioEnvironment(pmrem)
        : pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const getCarouselFormationScale = (w: number): number => {
      if (w < 360) return 0.83;
      if (w < 480) return 0.90;
      if (w < 768) return 0.95;
      return 1.0;
    };

    const getTargetCameraZ = (w: number): number => {
      if (mode === 'carousel') {
        return 4.9;
      }
      if (mode === 'shield') {
        if (w < 360) return 6.8;
        if (w < 480) return 6.1;
        return 5.65;
      }
      return w < 380 ? 7.1 : variant === 'hero' ? 6.1 : 6.9;
    };

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);
    camera.position.set(0, mode === 'carousel' ? 0.02 : 0.25, getTargetCameraZ(width));

    if (mode === 'carousel') {
      // High-Contrast Antique Nickel-Silver Studio Lighting matching reference image
      const hemiLight = new THREE.HemisphereLight('#F6F3ED', '#1B1916', 0.65);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight('#FFFDF9', 2.95);
      keyLight.position.set(-4.6, 5.4, 5.6);
      if (!isSoftwareGl) {
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.bias = -0.0004;
        keyLight.shadow.camera.near = 1;
        keyLight.shadow.camera.far = 18;
        keyLight.shadow.camera.left = -3.8;
        keyLight.shadow.camera.right = 3.8;
        keyLight.shadow.camera.top = 3.8;
        keyLight.shadow.camera.bottom = -3.8;
      }
      scene.add(keyLight);

      const silverRimLight = new THREE.DirectionalLight('#ECE7DF', 1.95);
      silverRimLight.position.set(4.8, -2.5, 2.4);
      scene.add(silverRimLight);

      const edgeKicker = new THREE.DirectionalLight('#D8D2C8', 1.35);
      edgeKicker.position.set(-4.4, -3.2, 2.2);
      scene.add(edgeKicker);

      const backSilverRim = new THREE.DirectionalLight('#E5DFD6', 1.55);
      backSilverRim.position.set(2.4, 3.2, -4.4);
      scene.add(backSilverRim);
    } else {
      // High-Contrast Emerald & White Studio Lighting for Shield / Vault Modes
      const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#D1FAE5', 1.65);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.45);
      keyLight.position.set(4.5, 6.0, 5.2);
      if (!isSoftwareGl) {
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.bias = -0.0004;
        keyLight.shadow.camera.near = 1;
        keyLight.shadow.camera.far = 18;
        keyLight.shadow.camera.left = -3.8;
        keyLight.shadow.camera.right = 3.8;
        keyLight.shadow.camera.top = 3.8;
        keyLight.shadow.camera.bottom = -3.8;
      }
      scene.add(keyLight);

      const emeraldRimLight = new THREE.PointLight('#65E83A', 3.0, 16);
      emeraldRimLight.position.set(-3.8, 1.8, 2.0);
      scene.add(emeraldRimLight);

      const mintHighlightLight = new THREE.PointLight('#A7F3D0', 2.4, 14);
      mintHighlightLight.position.set(3.6, -1.4, 2.8);
      scene.add(mintHighlightLight);

      const backRimDir = new THREE.DirectionalLight('#FFFFFF', 1.35);
      backRimDir.position.set(3.0, 2.4, -4.5);
      scene.add(backRimDir);
    }

    const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy() || 1);

    // Textures & PBR Materials
    const platFrontTex = createRupeeFaceTextures(false, 'platinum', maxAniso);
    const platBackTex = createRupeeFaceTextures(true, 'platinum', maxAniso);
    const mintFrontTex = createRupeeFaceTextures(false, 'mint', maxAniso);
    const mintBackTex = createRupeeFaceTextures(true, 'mint', maxAniso);
    const satinFaceTex = createBrushedSatinTextures(maxAniso);
    const reedingEdgeTex = createCoinReedingTextures(maxAniso);
    const contactShadowTex = createContactShadowTexture(mode === 'carousel');
    const slabRupeeTex = createSlabFaceTexture('rupee', maxAniso);
    const slabCrestTex = createSlabFaceTexture('crest', maxAniso);

    const platFrontMat = new THREE.MeshStandardMaterial({
      map: platFrontTex.map,
      normalMap: platFrontTex.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: platFrontTex.roughnessMap,
      bumpMap: platFrontTex.bumpMap,
      bumpScale: 0.022,
      metalness: 0.66,
      roughness: 0.48
    });

    const platBackMat = new THREE.MeshStandardMaterial({
      map: platBackTex.map,
      normalMap: platBackTex.normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: platBackTex.roughnessMap,
      bumpMap: platBackTex.bumpMap,
      bumpScale: 0.02,
      metalness: 0.66,
      roughness: 0.5
    });

    const mintFrontMat = new THREE.MeshStandardMaterial({
      map: mintFrontTex.map,
      normalMap: mintFrontTex.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: mintFrontTex.roughnessMap,
      bumpMap: mintFrontTex.bumpMap,
      bumpScale: 0.022,
      metalness: 0.58,
      roughness: 0.44
    });

    const mintBackMat = new THREE.MeshStandardMaterial({
      map: mintBackTex.map,
      normalMap: mintBackTex.normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: mintBackTex.roughnessMap,
      bumpMap: mintBackTex.bumpMap,
      bumpScale: 0.02,
      metalness: 0.58,
      roughness: 0.46
    });

    const slabRupeeFaceMat = new THREE.MeshStandardMaterial({
      map: slabRupeeTex,
      metalness: 0.35,
      roughness: 0.28
    });

    const slabCrestFaceMat = new THREE.MeshStandardMaterial({
      map: slabCrestTex,
      metalness: 0.35,
      roughness: 0.28
    });

    const edgeSilverMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.68,
      roughness: 0.2
    });

    const edgeEmeraldMat = new THREE.MeshStandardMaterial({
      color: '#65E83A',
      metalness: 0.58,
      roughness: 0.22
    });

    const forestGreenMat = new THREE.MeshStandardMaterial({
      color: '#064E3B',
      metalness: 0.48,
      roughness: 0.26
    });

    const brushedSilverBezelMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.72,
      roughness: 0.18
    });

    const emeraldMat = new THREE.MeshStandardMaterial({
      color: '#0B5D46',
      metalness: 0.45,
      roughness: 0.28
    });

    const mintAccentMat = new THREE.MeshStandardMaterial({
      color: '#65E83A',
      emissive: '#22C55E',
      emissiveIntensity: 0.16,
      metalness: 0.45,
      roughness: 0.22
    });

    const ceramicWhiteMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.14,
      roughness: 0.30
    });

    const ashPlinthMat = new THREE.MeshStandardMaterial({
      color: '#DCFCE7',
      metalness: 0.16,
      roughness: 0.35
    });

    const glassEmeraldRingMat = new THREE.MeshPhysicalMaterial({
      color: '#65E83A',
      metalness: 0.1,
      roughness: 0.14,
      transparent: true,
      opacity: 0.42
    });

    // Frosted Antique Nickel-Silver Field, Crisp Polished Rim & Embossed Relief Materials
    const carouselSatinFieldMat = new THREE.MeshPhysicalMaterial({
      color: '#C7C1B8',
      map: satinFaceTex.map,
      normalMap: satinFaceTex.normalMap,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughnessMap: satinFaceTex.roughnessMap,
      bumpMap: satinFaceTex.bumpMap,
      bumpScale: 0.006,
      metalness: 0.87,
      roughness: 0.44,
      clearcoat: 0.04,
      clearcoatRoughness: 0.34,
      envMapIntensity: 1.2
    });

    const carouselPolishedRimMat = new THREE.MeshPhysicalMaterial({
      color: '#EBE7E0',
      metalness: 0.93,
      roughness: 0.16,
      clearcoat: 0.22,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.5
    });

    const carouselReededEdgeMat = new THREE.MeshPhysicalMaterial({
      color: '#DFDAD2',
      map: reedingEdgeTex.map,
      normalMap: reedingEdgeTex.normalMap,
      normalScale: new THREE.Vector2(2.1, 2.1),
      roughnessMap: reedingEdgeTex.roughnessMap,
      bumpMap: reedingEdgeTex.bumpMap,
      bumpScale: 0.026,
      metalness: 0.91,
      roughness: 0.24,
      clearcoat: 0.16,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.55
    });

    const carouselGlyphReliefMat = new THREE.MeshPhysicalMaterial({
      color: '#F1EDE6',
      metalness: 0.94,
      roughness: 0.15,
      clearcoat: 0.26,
      clearcoatRoughness: 0.13,
      envMapIntensity: 1.6
    });

    const rootRig = new THREE.Group();
    scene.add(rootRig);
    let interactiveTarget: THREE.Object3D = rootRig;

    // Animated entity references per mode
    const coinSlots: THREE.Group[] = [];
    const coinTiltGroups: THREE.Group[] = [];
    let carouselRingGroup: THREE.Group | null = null;

    let shieldHeroGroup: THREE.Group | null = null;
    let shieldLeftCard: THREE.Group | null = null;
    let shieldRightCard: THREE.Group | null = null;
    const shieldFloatingCoins: { mesh: THREE.Object3D; baseY: number; phase: number; speed: number }[] = [];

    let heroCoin: THREE.Group | null = null;
    let outerRing: THREE.Mesh | null = null;
    let innerGlassRing: THREE.Mesh | null = null;
    const microItems: { mesh: THREE.Object3D; baseY: number; phase: number; speed: number }[] = [];

    if (mode === 'shield') {
      // ============================================================
      // SCULPTED 3D HERO SHIELD + COIN STACK + SLAB CARDS (Video 00:01-00:03)
      // ============================================================
      const composition = new THREE.Group();
      composition.position.set(0, -0.05, 0);
      rootRig.add(composition);
      interactiveTarget = composition;

      // 1. Center Security Shield with Bold Embossed Checkmark
      shieldHeroGroup = new THREE.Group();
      const shieldBody = new THREE.Mesh(createSecurityShieldGeometry(), forestGreenMat);
      shieldBody.castShadow = true;
      shieldBody.receiveShadow = true;
      shieldHeroGroup.add(shieldBody);

      const shieldFaceInset = new THREE.Mesh(createSecurityShieldGeometry(), emeraldMat);
      shieldFaceInset.scale.set(0.84, 0.84, 0.4);
      shieldFaceInset.position.z = 0.11;
      shieldHeroGroup.add(shieldFaceInset);

      const checkMesh = new THREE.Mesh(createCheckmarkGeometry(), brushedSilverBezelMat);
      checkMesh.position.set(0, 0.05, 0.24);
      checkMesh.castShadow = true;
      shieldHeroGroup.add(checkMesh);

      shieldHeroGroup.position.set(0.45, 0.08, -0.15);
      shieldHeroGroup.rotation.set(0.06, -0.32, 0.04);
      composition.add(shieldHeroGroup);

      // 2. Vertical Coin Stack Tower behind left shoulder of shield
      const stackGroup = new THREE.Group();
      stackGroup.position.set(-0.62, -0.82, -0.45);
      const stackCoinGeo = createKnurledCoinGeometry(0.62, 0.13, 64, 36, 0.009);
      const stackRimGeo = new THREE.TorusGeometry(0.6, 0.028, 12, 48);

      for (let i = 0; i < 9; i++) {
        const coinLayer = new THREE.Group();
        const body = new THREE.Mesh(stackCoinGeo, [edgeSilverMat, platFrontMat, platBackMat]);
        body.rotation.x = Math.PI / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        const rim = new THREE.Mesh(stackRimGeo, i % 2 === 0 ? brushedSilverBezelMat : emeraldMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.055;
        coinLayer.add(body, rim);
        coinLayer.position.set(
          Math.sin(i * 0.65) * 0.08,
          i * 0.165,
          Math.cos(i * 0.5) * 0.06
        );
        coinLayer.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.03;
        stackGroup.add(coinLayer);
      }
      composition.add(stackGroup);

      // 3. Front-Left Angled Financial Card Slab with Embossed ₹ Face
      shieldLeftCard = new THREE.Group();
      const leftSlabMesh = new THREE.Mesh(
        createRoundedSlabGeometry(1.18, 1.54, 0.18, 0.18),
        forestGreenMat
      );
      leftSlabMesh.castShadow = true;
      leftSlabMesh.receiveShadow = true;
      const leftFacePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 1.32), slabRupeeFaceMat);
      leftFacePlane.position.z = 0.145;
      const leftRimFrame = new THREE.Mesh(
        createRoundedSlabGeometry(1.22, 1.58, 0.04, 0.19),
        mintAccentMat
      );
      leftRimFrame.position.z = -0.02;
      shieldLeftCard.add(leftSlabMesh, leftFacePlane, leftRimFrame);
      shieldLeftCard.position.set(-1.12, -0.58, 0.52);
      shieldLeftCard.rotation.set(-0.18, 0.34, 0.24);
      composition.add(shieldLeftCard);

      // 4. Front-Right Angled Vault Emblem Slab with Team Stars Crest
      shieldRightCard = new THREE.Group();
      const rightSlabMesh = new THREE.Mesh(
        createRoundedSlabGeometry(1.14, 1.36, 0.16, 0.22),
        brushedSilverBezelMat
      );
      rightSlabMesh.castShadow = true;
      rightSlabMesh.receiveShadow = true;
      const rightFacePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.15), slabCrestFaceMat);
      rightFacePlane.position.z = 0.135;
      shieldRightCard.add(rightSlabMesh, rightFacePlane);
      shieldRightCard.position.set(1.24, -0.66, 0.58);
      shieldRightCard.rotation.set(-0.12, -0.38, -0.22);
      composition.add(shieldRightCard);

      // 5. Floating Tilted ₹ Medallions Above Stack
      const floatCoinGeo = createKnurledCoinGeometry(0.38, 0.085, 64, 32, 0.008);
      const floatRimGeo = new THREE.TorusGeometry(0.365, 0.02, 10, 48);
      const floatConfigs: { pos: [number, number, number]; rot: [number, number, number]; speed: number }[] = [
        { pos: [-0.08, 1.18, 0.36], rot: [0.35, -0.45, 0.25], speed: 0.9 },
        { pos: [-0.82, 1.48, -0.1], rot: [-0.28, 0.55, -0.18], speed: 1.15 }
      ];

      floatConfigs.forEach((cfg, idx) => {
        const fGroup = new THREE.Group();
        const disc = new THREE.Mesh(floatCoinGeo, [edgeSilverMat, platFrontMat, platBackMat]);
        disc.castShadow = true;
        const rim = new THREE.Mesh(floatRimGeo, idx === 0 ? mintAccentMat : forestGreenMat);
        rim.position.z = 0.04;
        fGroup.add(disc, rim);
        fGroup.position.set(...cfg.pos);
        fGroup.rotation.set(...cfg.rot);
        composition.add(fGroup);
        shieldFloatingCoins.push({
          mesh: fGroup,
          baseY: cfg.pos[1],
          phase: idx * 1.6,
          speed: cfg.speed
        });
      });

      // Mint-White studio floor plane
      const shieldFloor = new THREE.Mesh(
        new THREE.CircleGeometry(4.8, 48),
        new THREE.MeshStandardMaterial({
          color: '#F4FBF7',
          metalness: 0.04,
          roughness: 0.92
        })
      );
      shieldFloor.rotation.x = -Math.PI / 2;
      shieldFloor.position.y = -1.62;
      shieldFloor.receiveShadow = true;
      rootRig.add(shieldFloor);
    } else if (mode === 'carousel') {
      // ============================================================
      // 12-COIN RIGID-BODY KINETIC CURRENCY WREATH (Exact Dimensions)
      // Diameter: 1.0 | Radius: 0.5 | Thickness: 0.09 | Bevel: 0.015
      // ============================================================
      const COIN_COUNT = 12;
      const COIN_DIAMETER = 1.0;
      const COIN_RADIUS = COIN_DIAMETER / 2; // 0.5 Three.js units
      const COIN_THICKNESS = 0.09;
      const EDGE_BEVEL = 0.015;
      const RIM_HALF_T = COIN_THICKNESS / 2; // 0.045
      const FIELD_HALF_T = 0.033;
      const BASE_RING_RADIUS = 0.90;

      const sharedFieldGeo = new THREE.CylinderGeometry(
        COIN_RADIUS * 0.900,
        COIN_RADIUS * 0.900,
        FIELD_HALF_T * 2 - 0.0004,
        96
      );
      sharedFieldGeo.rotateX(Math.PI / 2);
      sharedFieldGeo.computeTangents();

      const sharedRimCollarGeo = createSteppedCoinRimGeometry(
        COIN_RADIUS,
        FIELD_HALF_T,
        RIM_HALF_T,
        EDGE_BEVEL,
        128
      );

      const sharedEdgeBandGeo = new THREE.CylinderGeometry(
        COIN_RADIUS,
        COIN_RADIUS,
        COIN_THICKNESS - EDGE_BEVEL * 2,
        128,
        1,
        true
      );
      sharedEdgeBandGeo.rotateX(Math.PI / 2);
      sharedEdgeBandGeo.computeTangents();

      // Exact 4-currency repeating sequence from the reference video (12 coins: $, ₹, £, € × 3)
      const currencySequence: CurrencySymbolType[] = [
        '$',
        '₹',
        '£',
        '€',
        '$',
        '₹',
        '£',
        '€',
        '$',
        '₹',
        '£',
        '€'
      ];
      const glyphGeoCache: Record<CurrencySymbolType, THREE.BufferGeometry> = {
        '$': createCurrencyGlyphGeometry('$', 0.84),
        '£': createCurrencyGlyphGeometry('£', 0.83),
        '₹': createCurrencyGlyphGeometry('₹', 0.80),
        '€': createCurrencyGlyphGeometry('€', 0.97)
      };

      carouselRingGroup = new THREE.Group();
      carouselRingGroup.position.set(0, 0.02, 0);
      carouselRingGroup.scale.setScalar(getCarouselFormationScale(width));
      rootRig.add(carouselRingGroup);
      interactiveTarget = carouselRingGroup;

      const initBreath = Math.sin(0.35 * 0.65);
      const initRingRadius = BASE_RING_RADIUS + 0.18 * (initBreath * initBreath);

      for (let i = 0; i < COIN_COUNT; i++) {
        const theta = (i / COIN_COUNT) * Math.PI * 2;
        const slot = new THREE.Group();
        slot.position.set(
          Math.cos(theta) * initRingRadius,
          Math.sin(theta) * initRingRadius,
          0
        );
        slot.rotation.z = theta;

        const tiltHolder = new THREE.Group();
        const initFlipX = Math.PI / 2 + 0.60 * initBreath + 0.36 * Math.sin(theta - 0.35);
        const initPitchY = 0.14 * Math.cos(theta + 0.35 * 0.75);
        const initRollZ = 0.10 * Math.sin(0.35 * 0.55 + i * 0.65);
        _qFlipX.setFromAxisAngle(_axisX, initFlipX);
        _qPitchY.setFromAxisAngle(_axisY, initPitchY);
        _qRollZ.setFromAxisAngle(_axisZ, initRollZ);
        tiltHolder.quaternion.copy(_qFlipX).multiply(_qPitchY).multiply(_qRollZ);

        const symbol = currencySequence[i % currencySequence.length];
        const coinMesh = buildCarouselCoin(
          sharedFieldGeo,
          sharedRimCollarGeo,
          sharedEdgeBandGeo,
          glyphGeoCache[symbol],
          carouselSatinFieldMat,
          carouselPolishedRimMat,
          carouselReededEdgeMat,
          carouselGlyphReliefMat,
          FIELD_HALF_T
        );
        coinMesh.rotation.z = -Math.PI / 2;

        tiltHolder.add(coinMesh);
        slot.add(tiltHolder);
        carouselRingGroup.add(slot);

        coinSlots.push(slot);
        coinTiltGroups.push(tiltHolder);
      }

      // Soft Neutral Studio Ground Contact Shadow
      const contactShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(4.2, 2.0),
        new THREE.MeshBasicMaterial({
          map: contactShadowTex,
          transparent: true,
          depthWrite: false
        })
      );
      contactShadow.rotation.x = -Math.PI / 2;
      contactShadow.position.set(0, -1.66, 0);
      rootRig.add(contactShadow);
    } else {
      // ============================================================
      // SOVEREIGN RUPEE VAULT (Stepped Growth Pillars + Center Coin)
      // ============================================================
      const plinthGroup = new THREE.Group();
      plinthGroup.position.set(0, -1.62, 0);

      const baseCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(2.15, 2.35, 0.22, 64),
        ceramicWhiteMat
      );
      baseCylinder.castShadow = true;
      baseCylinder.receiveShadow = true;
      plinthGroup.add(baseCylinder);

      const innerAshStage = new THREE.Mesh(
        new THREE.CylinderGeometry(1.78, 1.84, 0.06, 64),
        ashPlinthMat
      );
      innerAshStage.position.y = 0.13;
      innerAshStage.receiveShadow = true;
      plinthGroup.add(innerAshStage);

      const topBezel = new THREE.Mesh(
        new THREE.TorusGeometry(2.14, 0.024, 12, 72),
        forestGreenMat
      );
      topBezel.rotation.x = Math.PI / 2;
      topBezel.position.y = 0.11;
      plinthGroup.add(topBezel);

      const mintBaseTrim = new THREE.Mesh(
        new THREE.TorusGeometry(2.34, 0.02, 12, 72),
        mintAccentMat
      );
      mintBaseTrim.rotation.x = Math.PI / 2;
      mintBaseTrim.position.y = -0.1;
      plinthGroup.add(mintBaseTrim);

      const floorMesh = new THREE.Mesh(
        new THREE.CircleGeometry(4.8, 48),
        new THREE.MeshStandardMaterial({
          color: '#F4FBF7',
          metalness: 0.04,
          roughness: 0.92
        })
      );
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = -0.115;
      floorMesh.receiveShadow = true;
      plinthGroup.add(floorMesh);

      rootRig.add(plinthGroup);

      heroCoin = buildHeroRupeeCoin(
        platFrontMat,
        platBackMat,
        edgeSilverMat,
        forestGreenMat,
        mintAccentMat
      );
      heroCoin.position.set(0, 0.36, 0.2);
      rootRig.add(heroCoin);
      interactiveTarget = heroCoin;

      outerRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.72, 0.022, 14, 80),
        emeraldMat
      );
      outerRing.position.copy(heroCoin.position);
      outerRing.rotation.set(0.42, 0.2, 0);
      rootRig.add(outerRing);

      innerGlassRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.48, 0.048, 16, 72),
        glassEmeraldRingMat
      );
      innerGlassRing.position.copy(heroCoin.position);
      innerGlassRing.rotation.set(-0.55, 0.35, 0);
      rootRig.add(innerGlassRing);

      const pillarLeft = buildGrowthPillar(0.42, 0.56, 0.42, ceramicWhiteMat, mintAccentMat);
      pillarLeft.position.set(-1.32, -1.48, 0.5);
      pillarLeft.rotation.y = 0.32;
      rootRig.add(pillarLeft);

      const pillarRight = buildGrowthPillar(0.44, 0.86, 0.44, emeraldMat, ceramicWhiteMat);
      pillarRight.position.set(1.28, -1.48, 0.45);
      pillarRight.rotation.y = -0.35;
      rootRig.add(pillarRight);

      const pillarBack = buildGrowthPillar(0.38, 1.18, 0.38, forestGreenMat, mintAccentMat);
      pillarBack.position.set(0.86, -1.48, -0.82);
      pillarBack.rotation.y = 0.24;
      rootRig.add(pillarBack);

      const microGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.036, 24);
      microGeo.rotateX(Math.PI / 2);
      const microRimGeo = new THREE.TorusGeometry(0.165, 0.012, 8, 24);

      const microCoords: [number, number, number][] = [
        [-2.05, 1.32, -0.55],
        [2.1, 1.22, -0.38],
        [-1.78, -0.22, -0.82],
        [1.88, 0.18, -0.78]
      ];

      microCoords.forEach(([x, y, z], idx) => {
        const mGroup = new THREE.Group();
        const disc = new THREE.Mesh(microGeo, [edgeSilverMat, platFrontMat, platBackMat]);
        const rim = new THREE.Mesh(microRimGeo, forestGreenMat);
        rim.position.z = 0.018;
        mGroup.add(disc, rim);
        mGroup.position.set(x, y, z);
        mGroup.rotation.set(0.2 * idx, 0.5 * idx, 0.1);
        rootRig.add(mGroup);
        microItems.push({
          mesh: mGroup,
          baseY: y,
          phase: idx * 1.15,
          speed: 0.78 + (idx % 3) * 0.22
        });
      });

      const cubeCoords: [number, number, number][] = [
        [-0.98, 1.78, -0.45],
        [1.12, 1.68, -0.68]
      ];
      const cubeGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
      cubeCoords.forEach(([x, y, z], idx) => {
        const cube = new THREE.Mesh(cubeGeo, idx === 0 ? mintAccentMat : ceramicWhiteMat);
        cube.position.set(x, y, z);
        cube.rotation.set(0.5, 0.65, 0.2);
        cube.castShadow = true;
        rootRig.add(cube);
        microItems.push({
          mesh: cube,
          baseY: y,
          phase: idx * 1.9 + 0.6,
          speed: 0.68 + idx * 0.15
        });
      });
    }

    renderer.compile(scene, camera);

    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    let spinImpulse = 0;
    let isHovered = false;

    const raycaster = new THREE.Raycaster();

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerTarget.x = Math.max(-1, Math.min(1, nx));
      pointerTarget.y = Math.max(-1, Math.min(1, ny));

      _ndcPointer.set(nx, ny);
      raycaster.setFromCamera(_ndcPointer, camera);
      const hits = raycaster.intersectObject(interactiveTarget, true);
      isHovered = hits.length > 0;
      canvas.style.cursor = isHovered ? 'pointer' : 'grab';
    };

    const onPointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
      isHovered = false;
      canvas.style.cursor = 'default';
    };

    const onPointerDown = () => {
      spinImpulse = Math.min(spinImpulse + 4.8, 8.5);
    };

    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointerdown', onPointerDown);

    let contextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      setWebglUnavailable(true);
    };
    const onContextRestored = () => {
      contextLost = false;
      setWebglUnavailable(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = Math.max(container.clientWidth, 240);
      const h = Math.max(container.clientHeight, 220);
      camera.aspect = w / h;
      camera.position.z = getTargetCameraZ(w);
      if (mode === 'carousel' && carouselRingGroup) {
        carouselRingGroup.scale.setScalar(getCarouselFormationScale(w));
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    if (resizeObserver) resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    let isVisible = true;
    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              isVisible = entries[0]?.isIntersecting ?? true;
            },
            { threshold: 0.05 }
          )
        : null;
    if (intersectionObserver) intersectionObserver.observe(container);

    let ringSpinAngle = 0;
    let motionPhase = 0.35;

    const renderFrame = (elapsed: number, delta: number) => {
      if (contextLost || !renderer) return;

      pointerCurrent.x = THREE.MathUtils.damp(pointerCurrent.x, pointerTarget.x, 4.5, delta);
      pointerCurrent.y = THREE.MathUtils.damp(pointerCurrent.y, pointerTarget.y, 4.5, delta);
      spinImpulse = THREE.MathUtils.damp(spinImpulse, 0, 2.8, delta);

      if (mode === 'shield') {
        rootRig.rotation.y = pointerCurrent.x * 0.28 + Math.sin(elapsed * 0.45) * 0.08;
        rootRig.rotation.x = -pointerCurrent.y * 0.16;

        if (shieldHeroGroup) {
          shieldHeroGroup.position.y = 0.08 + Math.sin(elapsed * 1.1) * 0.045;
          shieldHeroGroup.rotation.y = -0.32 + Math.sin(elapsed * 0.7) * 0.06 + spinImpulse * 0.04;
        }
        if (shieldLeftCard) {
          shieldLeftCard.position.y = -0.58 + Math.sin(elapsed * 1.25 + 0.8) * 0.055;
          shieldLeftCard.rotation.y = 0.34 + Math.cos(elapsed * 0.65) * 0.06;
        }
        if (shieldRightCard) {
          shieldRightCard.position.y = -0.66 + Math.sin(elapsed * 1.15 + 2.1) * 0.055;
          shieldRightCard.rotation.y = -0.38 - Math.cos(elapsed * 0.65) * 0.06;
        }

        for (let i = 0; i < shieldFloatingCoins.length; i++) {
          const fc = shieldFloatingCoins[i];
          fc.mesh.position.y = fc.baseY + Math.sin(elapsed * fc.speed + fc.phase) * 0.11;
          fc.mesh.rotation.y += delta * (0.65 + i * 0.25) + spinImpulse * delta * 0.8;
        }
      } else if (mode === 'carousel' && carouselRingGroup) {
        rootRig.rotation.y = pointerCurrent.x * 0.30;
        rootRig.rotation.x = -pointerCurrent.y * 0.18;

        // Rigid-Body Zero-Collision Wreath:
        // 1. Continuous central-axis ring rotation
        // 2. Synchronized circular expansion/contraction (R: 0.90 <-> 1.08)
        // 3. Quaternion-driven independent 3D coin flip wave across 90° edge-on
        const baseOrbitSpeed = isHovered ? 0.36 : 0.24;
        const baseCycleSpeed = isHovered ? 1.15 : 0.85;
        ringSpinAngle += delta * (baseOrbitSpeed + spinImpulse * 0.25);
        motionPhase += delta * (baseCycleSpeed + spinImpulse * 0.30);

        carouselRingGroup.rotation.z = ringSpinAngle;
        carouselRingGroup.rotation.x = 0.14 + 0.04 * Math.sin(elapsed * 0.45);
        carouselRingGroup.rotation.y = -0.22 + 0.06 * Math.cos(elapsed * 0.38);
        carouselRingGroup.position.y = 0.02 + Math.sin(elapsed * 0.85) * 0.015;

        const breath = Math.sin(motionPhase * 0.65);
        const ringRadius = 0.90 + 0.18 * (breath * breath);
        const wavePhase = motionPhase;

        const totalCoins = coinTiltGroups.length || 12;
        for (let i = 0; i < totalCoins; i++) {
          const theta = (i / totalCoins) * Math.PI * 2;

          // Update circular path position (smooth expansion & contraction)
          coinSlots[i].position.set(
            Math.cos(theta) * ringRadius,
            Math.sin(theta) * ringRadius,
            0
          );

          // Rigid quaternion rotation around local coin pivot:
          // flipX sweeps smoothly across 90° edge-on with traveling phase wave around ring
          const flipX = Math.PI / 2 + 0.60 * breath + 0.36 * Math.sin(theta - wavePhase);
          const pitchY = 0.14 * Math.cos(theta + wavePhase * 0.75);
          const rollZ = 0.10 * Math.sin(wavePhase * 0.55 + i * 0.65);

          _qFlipX.setFromAxisAngle(_axisX, flipX);
          _qPitchY.setFromAxisAngle(_axisY, pitchY);
          _qRollZ.setFromAxisAngle(_axisZ, rollZ);

          coinTiltGroups[i].quaternion
            .copy(_qFlipX)
            .multiply(_qPitchY)
            .multiply(_qRollZ);
        }
      } else if (heroCoin) {
        rootRig.rotation.y = pointerCurrent.x * 0.25;
        rootRig.rotation.x = -pointerCurrent.y * 0.13;

        heroCoin.rotation.y += delta * (isHovered ? 1.15 : 0.55) + spinImpulse * delta;
        heroCoin.position.y = 0.36 + Math.sin(elapsed * 1.4) * 0.07;

        if (outerRing) {
          outerRing.rotation.z += delta * 0.28;
          outerRing.rotation.y = 0.2 + Math.sin(elapsed * 0.6) * 0.14;
        }

        if (innerGlassRing) {
          innerGlassRing.rotation.z -= delta * 0.36;
          innerGlassRing.rotation.x = -0.55 + Math.cos(elapsed * 0.5) * 0.12;
        }

        for (let i = 0; i < microItems.length; i++) {
          const mc = microItems[i];
          mc.mesh.position.y = mc.baseY + Math.sin(elapsed * mc.speed + mc.phase) * 0.1;
          mc.mesh.rotation.y += delta * (0.45 + (i % 2) * 0.25);
        }
      }

      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) {
      renderFrame(0.6, 0.016);
    }

    let rafId = 0;
    let swTimerId = 0;
    let disposed = false;
    let lastTime = performance.now();
    const startTime = lastTime;

    const tick = (now: number) => {
      if (disposed) return;

      if (!prefersReducedMotion && isVisible && !document.hidden && !contextLost) {
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const elapsed = (now - startTime) / 1000;
        renderFrame(elapsed, delta);
      } else {
        lastTime = now;
      }

      if (prefersReducedMotion) return;

      if (isSoftwareGl) {
        swTimerId = window.setTimeout(() => {
          if (!disposed) {
            rafId = requestAnimationFrame(tick);
          }
        }, 32);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      if (swTimerId) clearTimeout(swTimerId);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      const disposedGeos = new Set<THREE.BufferGeometry>();
      const disposedMats = new Set<THREE.Material>();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry && !disposedGeos.has(mesh.geometry)) {
            mesh.geometry.dispose();
            disposedGeos.add(mesh.geometry);
          }
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            if (m && !disposedMats.has(m)) {
              m.dispose();
              disposedMats.add(m);
            }
          });
        }
      });

      [platFrontTex, platBackTex, mintFrontTex, mintBackTex, satinFaceTex, reedingEdgeTex].forEach((t) => {
        t.map.dispose();
        t.normalMap.dispose();
        t.roughnessMap.dispose();
        t.bumpMap.dispose();
      });
      contactShadowTex.dispose();
      slabRupeeTex.dispose();
      slabCrestTex.dispose();

      envTexture.dispose();
      pmrem.dispose();
      renderer?.dispose();
    };
  }, [variant, mode]);

  if (webglUnavailable) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-white via-[#F4FBF7] to-[#EAF7F0] border border-[#064E3B]/15 overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(101,232,58,0.28),transparent_65%)]" />
        <div className="relative flex flex-col items-center justify-center p-6 text-center">
          <div className="w-28 h-28 rounded-2xl bg-[#064E3B] border-2 border-[#65E83A] shadow-lg flex items-center justify-center">
            <span className="text-5xl font-extrabold text-[#65E83A]">₹</span>
          </div>
          <span className="mt-3 text-[11px] font-bold tracking-[0.2em] uppercase text-[#052E22]">
            Team Stars 3D Showcase
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      aria-label="Interactive 3D Fintech Showcase"
    />
  );
};
