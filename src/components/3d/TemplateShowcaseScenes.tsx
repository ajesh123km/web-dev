import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

function createMedallionTexture(symbol: 'rupee' | 'diamond', maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 512;
  const cx = size / 2;
  const cy = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(cx - 48, cy - 48, 16, cx, cy, 248);
  if (symbol === 'rupee') {
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.5, '#F4FBF7');
    grad.addColorStop(0.85, '#DCFCE7');
    grad.addColorStop(1, '#A7F3D0');
  } else {
    grad.addColorStop(0, '#0B5D46');
    grad.addColorStop(0.45, '#064E3B');
    grad.addColorStop(1, '#052E22');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = symbol === 'rupee' ? '#064E3B' : '#65E83A';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, 220, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = symbol === 'rupee' ? '#16A34A' : 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 196, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(cx, cy);
  if (symbol === 'rupee') {
    ctx.font = '800 232px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(5, 46, 34, 0.2)';
    ctx.fillText('₹', 4, 14);
    ctx.fillStyle = '#052E22';
    ctx.fillText('₹', 0, 8);
  } else {
    // Architectural diamond crest
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(0, -118);
    ctx.lineTo(86, 0);
    ctx.lineTo(0, 118);
    ctx.lineTo(-86, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#65E83A';
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(36, 0);
    ctx.lineTo(0, 48);
    ctx.lineTo(-36, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

const CUBE_LOGO_SRC =
  '/assets/aistudio/WhatsApp_Image_2026-11-08_at_9.42.49_AM_694e1ea2.jpeg';

function createCubeFaceTexture(
  maxAnisotropy = 4,
  isDisposed?: () => boolean,
  onLoaded?: () => void
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const drawFrame = () => {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#0B5D46');
    grad.addColorStop(0.55, '#064E3B');
    grad.addColorStop(1, '#052E22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Crisp outer lime-emerald border
    ctx.strokeStyle = '#65E83A';
    ctx.lineWidth = 14;
    ctx.strokeRect(22, 22, size - 44, size - 44);

    // Clean white backdrop inside border matching the Team Stars seal
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(36, 36, size - 72, size - 72);
  };

  drawFrame();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (isDisposed && isDisposed()) return;
    drawFrame();
    const pad = 42;
    const targetSize = size - pad * 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(36, 36, size - 72, size - 72);
    ctx.clip();
    ctx.drawImage(img, pad, pad, targetSize, targetSize);
    ctx.restore();
    tex.needsUpdate = true;
    onLoaded?.();
  };
  img.src = CUBE_LOGO_SRC;

  return tex;
}

/**
 * 3D "Trust Through Transparency" Twin Upright Coins + Ground Cluster (Video 00:07–00:09)
 */
export const TrustCoins3DScene: React.FC<{ className?: string }> = ({ className = '' }) => {
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
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
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
    renderer.toneMappingExposure = 1.06;
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
    scene.fog = new THREE.FogExp2('#F4FBF7', 0.014);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0.25, 0.88, width < 420 ? 6.8 : 5.45);
    camera.lookAt(0, -0.05, 0);

    const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#D1FAE5', 1.6);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.45);
    keyLight.position.set(4.5, 6.5, 4.8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const emeraldRim = new THREE.PointLight('#65E83A', 2.8, 14);
    emeraldRim.position.set(-3.4, 2.0, -1.6);
    scene.add(emeraldRim);

    const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy() || 1);
    const rupeeTex = createMedallionTexture('rupee', maxAniso);
    const diamondTex = createMedallionTexture('diamond', maxAniso);

    const rupeeFaceMat = new THREE.MeshStandardMaterial({
      map: rupeeTex,
      metalness: 0.52,
      roughness: 0.24
    });
    const diamondFaceMat = new THREE.MeshStandardMaterial({
      map: diamondTex,
      metalness: 0.45,
      roughness: 0.26
    });
    const edgeSilverMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.65,
      roughness: 0.2
    });
    const forestRimMat = new THREE.MeshStandardMaterial({
      color: '#064E3B',
      metalness: 0.48,
      roughness: 0.26
    });
    const mintRimMat = new THREE.MeshStandardMaterial({
      color: '#65E83A',
      emissive: '#22C55E',
      emissiveIntensity: 0.14,
      metalness: 0.48,
      roughness: 0.22
    });

    const rig = new THREE.Group();
    scene.add(rig);

    // Horizon Studio Floor
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(6.5, 48),
      new THREE.MeshStandardMaterial({ color: '#EAF7F0', metalness: 0.04, roughness: 0.92 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.12;
    floor.receiveShadow = true;
    rig.add(floor);

    const bigCoinGeo = new THREE.CylinderGeometry(1.18, 1.18, 0.19, 72, 1, false);
    bigCoinGeo.rotateX(Math.PI / 2);
    const bigRimGeo = new THREE.TorusGeometry(1.17, 0.048, 16, 72);

    // Upright Hero ₹ Medallion (Front Left)
    const rupeeStanding = new THREE.Group();
    const rBody = new THREE.Mesh(bigCoinGeo, [edgeSilverMat, rupeeFaceMat, rupeeFaceMat]);
    rBody.castShadow = true;
    rBody.receiveShadow = true;
    const rRimF = new THREE.Mesh(bigRimGeo, forestRimMat);
    rRimF.position.z = 0.09;
    const rRimB = new THREE.Mesh(bigRimGeo, forestRimMat);
    rRimB.position.z = -0.09;
    rupeeStanding.add(rBody, rRimF, rRimB);
    rupeeStanding.position.set(-0.78, 0.08, 0.35);
    rupeeStanding.rotation.set(-0.08, 0.42, 0.06);
    rig.add(rupeeStanding);

    // Upright Diamond Crest Medallion (Rear Right)
    const diamondStanding = new THREE.Group();
    const dBody = new THREE.Mesh(bigCoinGeo, [forestRimMat, diamondFaceMat, diamondFaceMat]);
    dBody.castShadow = true;
    dBody.receiveShadow = true;
    const dRimF = new THREE.Mesh(bigRimGeo, mintRimMat);
    dRimF.position.z = 0.09;
    diamondStanding.add(dBody, dRimF);
    diamondStanding.position.set(0.86, 0.14, -0.38);
    diamondStanding.rotation.set(-0.06, -0.45, -0.08);
    rig.add(diamondStanding);

    // Small Ground Cluster Coins
    const smallGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.085, 48);
    smallGeo.rotateX(Math.PI / 2);
    const smallRimGeo = new THREE.TorusGeometry(0.41, 0.018, 10, 48);

    const clusterPositions: { pos: [number, number, number]; rot: [number, number, number]; useDiamond?: boolean }[] = [
      { pos: [-1.85, -1.06, 0.65], rot: [Math.PI / 2 - 0.06, 0.2, 0.4] },
      { pos: [0.08, -1.05, 1.02], rot: [Math.PI / 2 - 0.05, 0, -0.2], useDiamond: true },
      { pos: [1.55, -1.05, 0.72], rot: [Math.PI / 2 - 0.08, -0.1, 0.7] },
      { pos: [-1.42, -1.07, -0.68], rot: [Math.PI / 2, 0, 0.15], useDiamond: true },
      { pos: [2.05, -0.98, -0.18], rot: [Math.PI / 2 - 0.32, 0.2, -0.5] }
    ];

    clusterPositions.forEach((cfg) => {
      const sg = new THREE.Group();
      const faceM = cfg.useDiamond ? diamondFaceMat : rupeeFaceMat;
      const body = new THREE.Mesh(smallGeo, [edgeSilverMat, faceM, faceM]);
      body.castShadow = true;
      body.receiveShadow = true;
      const rim = new THREE.Mesh(smallRimGeo, forestRimMat);
      rim.position.z = 0.04;
      sg.add(body, rim);
      sg.position.set(...cfg.pos);
      sg.rotation.set(...cfg.rot);
      rig.add(sg);
    });

    renderer.compile(scene, camera);

    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    let pulseImpulse = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerTarget.x = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      pointerTarget.y = Math.max(-1, Math.min(1, -(((e.clientY - rect.top) / rect.height) * 2 - 1)));
    };
    const onPointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };
    const onPointerDown = () => {
      pulseImpulse = Math.min(pulseImpulse + 1.2, 2.0);
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
      camera.position.z = w < 420 ? 6.8 : 5.45;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    if (resizeObserver) resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    let isVisible = true;
    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            isVisible = entries[0]?.isIntersecting ?? true;
          }, { threshold: 0.05 })
        : null;
    if (intersectionObserver) intersectionObserver.observe(container);

    const renderFrame = (elapsed: number, delta: number) => {
      if (contextLost || !renderer) return;
      pointerCurrent.x = THREE.MathUtils.damp(pointerCurrent.x, pointerTarget.x, 4.2, delta);
      pointerCurrent.y = THREE.MathUtils.damp(pointerCurrent.y, pointerTarget.y, 4.2, delta);
      pulseImpulse = THREE.MathUtils.damp(pulseImpulse, 0, 3.0, delta);

      rig.rotation.y = pointerCurrent.x * 0.28 + Math.sin(elapsed * 0.35) * 0.08;
      rig.rotation.x = -pointerCurrent.y * 0.1;

      rupeeStanding.rotation.y = 0.42 + Math.sin(elapsed * 0.7) * 0.1 + pulseImpulse * 0.35;
      diamondStanding.rotation.y = -0.45 - Math.cos(elapsed * 0.65) * 0.1 - pulseImpulse * 0.35;

      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) renderFrame(0.4, 0.016);

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
        renderFrame((now - startTime) / 1000, delta);
      } else {
        lastTime = now;
      }
      if (prefersReducedMotion) return;
      if (isSoftwareGl) {
        swTimerId = window.setTimeout(() => {
          if (!disposed) rafId = requestAnimationFrame(tick);
        }, 32);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    if (!prefersReducedMotion) rafId = requestAnimationFrame(tick);

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

      const geos = new Set<THREE.BufferGeometry>();
      const mats = new Set<THREE.Material>();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          if (m.geometry && !geos.has(m.geometry)) {
            m.geometry.dispose();
            geos.add(m.geometry);
          }
          const arr = Array.isArray(m.material) ? m.material : [m.material];
          arr.forEach((mat) => {
            if (mat && !mats.has(mat)) {
              mat.dispose();
              mats.add(mat);
            }
          });
        }
      });
      rupeeTex.dispose();
      diamondTex.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer?.dispose();
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div className={`flex items-center justify-center bg-[#F4FBF7] rounded-2xl p-6 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-[#064E3B] shadow-lg flex items-center justify-center text-3xl font-extrabold text-[#064E3B]">
            ₹
          </div>
          <div className="w-16 h-16 rounded-full bg-[#064E3B] border-2 border-[#65E83A] shadow-lg flex items-center justify-center text-xl font-extrabold text-[#65E83A]">
            ◆
          </div>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={`relative select-none ${className}`} aria-label="3D Trust Medallions" />;
};

/**
 * 3D Stepped Isometric Pyramid + Floating Orbiting Ecosystem Cubes (Video 00:10–00:12)
 */
export const IsometricArchitecture3DScene: React.FC<{ className?: string }> = ({ className = '' }) => {
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
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
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
    renderer.toneMappingExposure = 1.06;
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
    scene.fog = new THREE.FogExp2('#F4FBF7', 0.015);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 60);
    camera.position.set(0, 1.35, width < 420 ? 6.8 : 5.6);
    camera.lookAt(0, 0.15, 0);

    const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#D1FAE5', 1.6);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.45);
    keyLight.position.set(4.5, 7.0, 5.0);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const emeraldRim = new THREE.PointLight('#65E83A', 3.0, 14);
    emeraldRim.position.set(-3.6, 2.2, -2.0);
    scene.add(emeraldRim);

    const mintRim = new THREE.PointLight('#A7F3D0', 2.2, 14);
    mintRim.position.set(3.5, 1.2, 2.5);
    scene.add(mintRim);

    let disposed = false;
    const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy() || 1);
    const cubeTex = createCubeFaceTexture(
      maxAniso,
      () => disposed,
      () => {
        if (!disposed && prefersReducedMotion && renderer) {
          renderer.render(scene, camera);
        }
      }
    );

    const tierWhiteMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.12, roughness: 0.30 });
    const tierAshMat = new THREE.MeshStandardMaterial({ color: '#DCFCE7', metalness: 0.16, roughness: 0.34 });
    const tierForestMat = new THREE.MeshStandardMaterial({ color: '#064E3B', metalness: 0.48, roughness: 0.28 });
    const heroCubeMat = new THREE.MeshStandardMaterial({ map: cubeTex, metalness: 0.35, roughness: 0.28 });
    const glassCubeMat = new THREE.MeshPhysicalMaterial({
      color: '#65E83A',
      metalness: 0.12,
      roughness: 0.14,
      transparent: true,
      opacity: 0.50
    });
    const wireMat = new THREE.LineBasicMaterial({ color: '#064E3B' });

    const isoRig = new THREE.Group();
    isoRig.rotation.y = Math.PI / 4; // Classic 45° isometric diamond orientation
    scene.add(isoRig);

    // 3 Stepped Square Plinth Tiers
    const tiers = [
      { size: 2.85, height: 0.3, y: -0.95, mat: tierWhiteMat },
      { size: 2.05, height: 0.32, y: -0.64, mat: tierAshMat },
      { size: 1.28, height: 0.34, y: -0.31, mat: tierForestMat }
    ];

    tiers.forEach((tier) => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(tier.size, tier.height, tier.size), tier.mat);
      box.position.y = tier.y;
      box.castShadow = true;
      box.receiveShadow = true;
      isoRig.add(box);
    });

    // Subtle Mint Trim Ring under Apex Tier
    const apexEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.3, 0.35, 1.3));
    const apexEdges = new THREE.LineSegments(apexEdgeGeo, wireMat);
    apexEdges.position.y = -0.31;
    isoRig.add(apexEdges);

    // Floating Crown Logo Cube
    const heroCube = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.76, 0.76), heroCubeMat);
    heroCube.position.y = 0.56;
    heroCube.castShadow = true;
    isoRig.add(heroCube);

    // 6 Orbiting Miniature Translucent Cubes with Crisp Wireframe Outlines
    const satGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    const satEdgeGeo = new THREE.EdgesGeometry(satGeo);
    const satellites: { group: THREE.Group; radius: number; angle: number; baseY: number; speed: number }[] = [];

    for (let i = 0; i < 6; i++) {
      const sGroup = new THREE.Group();
      const sMesh = new THREE.Mesh(satGeo, glassCubeMat);
      const sWire = new THREE.LineSegments(satEdgeGeo, wireMat);
      sGroup.add(sMesh, sWire);
      const angle = (i / 6) * Math.PI * 2;
      const radius = i % 2 === 0 ? 1.62 : 1.25;
      const baseY = i % 2 === 0 ? 0.22 : 0.88;
      sGroup.position.set(Math.cos(angle) * radius, baseY, Math.sin(angle) * radius);
      isoRig.add(sGroup);
      satellites.push({ group: sGroup, radius, angle, baseY, speed: 0.35 + (i % 3) * 0.12 });
    }

    renderer.compile(scene, camera);

    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    let boost = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerTarget.x = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      pointerTarget.y = Math.max(-1, Math.min(1, -(((e.clientY - rect.top) / rect.height) * 2 - 1)));
    };
    const onPointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };
    const onPointerDown = () => {
      boost = Math.min(boost + 3.2, 6.0);
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
      camera.position.z = w < 420 ? 6.8 : 5.6;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    if (resizeObserver) resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    let isVisible = true;
    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            isVisible = entries[0]?.isIntersecting ?? true;
          }, { threshold: 0.05 })
        : null;
    if (intersectionObserver) intersectionObserver.observe(container);

    const renderFrame = (elapsed: number, delta: number) => {
      if (contextLost || !renderer) return;
      pointerCurrent.x = THREE.MathUtils.damp(pointerCurrent.x, pointerTarget.x, 4.2, delta);
      pointerCurrent.y = THREE.MathUtils.damp(pointerCurrent.y, pointerTarget.y, 4.2, delta);
      boost = THREE.MathUtils.damp(boost, 0, 2.8, delta);

      isoRig.rotation.y = Math.PI / 4 + pointerCurrent.x * 0.35 + elapsed * 0.14;
      isoRig.rotation.x = -pointerCurrent.y * 0.12;

      heroCube.position.y = 0.56 + Math.sin(elapsed * 1.6) * 0.08;
      heroCube.rotation.y += delta * (0.45 + boost);

      for (let i = 0; i < satellites.length; i++) {
        const sat = satellites[i];
        const a = sat.angle + elapsed * sat.speed;
        sat.group.position.set(
          Math.cos(a) * sat.radius,
          sat.baseY + Math.sin(elapsed * 1.4 + i) * 0.12,
          Math.sin(a) * sat.radius
        );
        sat.group.rotation.y += delta * 0.8;
        sat.group.rotation.x += delta * 0.4;
      }

      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) renderFrame(0.5, 0.016);

    let rafId = 0;
    let swTimerId = 0;
    let lastTime = performance.now();
    const startTime = lastTime;

    const tick = (now: number) => {
      if (disposed) return;
      if (!prefersReducedMotion && isVisible && !document.hidden && !contextLost) {
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        renderFrame((now - startTime) / 1000, delta);
      } else {
        lastTime = now;
      }
      if (prefersReducedMotion) return;
      if (isSoftwareGl) {
        swTimerId = window.setTimeout(() => {
          if (!disposed) rafId = requestAnimationFrame(tick);
        }, 32);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    if (!prefersReducedMotion) rafId = requestAnimationFrame(tick);

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

      const geos = new Set<THREE.BufferGeometry>();
      const mats = new Set<THREE.Material>();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh || (obj as THREE.LineSegments).isLineSegments) {
          const m = obj as THREE.Mesh;
          if (m.geometry && !geos.has(m.geometry)) {
            m.geometry.dispose();
            geos.add(m.geometry);
          }
          const arr = Array.isArray(m.material) ? m.material : [m.material];
          arr.forEach((mat) => {
            if (mat && !mats.has(mat)) {
              mat.dispose();
              mats.add(mat);
            }
          });
        }
      });
      cubeTex.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer?.dispose();
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div className={`flex items-center justify-center bg-[#F4FBF7] rounded-2xl p-6 ${className}`}>
        <div className="w-20 h-20 rounded-xl bg-white border-2 border-[#064E3B] shadow-lg overflow-hidden flex items-center justify-center p-1">
          <img
            src={CUBE_LOGO_SRC}
            alt="Team Stars Chits Emblem"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={`relative select-none ${className}`} aria-label="3D Isometric Ecosystem Architecture" />;
};
