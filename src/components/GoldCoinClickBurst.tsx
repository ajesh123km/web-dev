import React, { useEffect, useRef } from 'react';

interface CoinParticle {
  kind: 'coin';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  flipPhase: number;
  vFlip: number;
  age: number;
  life: number;
}

interface SparkleParticle {
  kind: 'star' | 'dot';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  age: number;
  life: number;
  hue: 'bright' | 'warm';
}

type Particle = CoinParticle | SparkleParticle;

// ============================================================================
// OPTIONAL CURSOR TRAIL TOGGLE:
// Change `ENABLE_CURSOR_FOLLOWER_COIN` to `true` below to render a subtle
// floating silver coin that smoothly follows the user's cursor on desktop.
// ============================================================================
const ENABLE_CURSOR_FOLLOWER_COIN = false;

/**
 * Draws a clean, glossy metallic silver/chrome coin with crisp white highlights and inner rim.
 */
function drawSilverCoin(
  ctx: CanvasRenderingContext2D,
  radius: number,
  rotation: number,
  flipScaleX: number
) {
  ctx.save();
  ctx.rotate(rotation);
  ctx.scale(flipScaleX, 1);

  // Outer milled chrome rim
  const rimGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
  rimGrad.addColorStop(0, '#FFFFFF');
  rimGrad.addColorStop(0.35, '#CBD5E1');
  rimGrad.addColorStop(0.75, '#64748B');
  rimGrad.addColorStop(1, '#E2E8F0');

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = rimGrad;
  ctx.fill();

  // Subtle dark slate outer hairline so silver pops over light frosted glass
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.42)';
  ctx.lineWidth = 0.75;
  ctx.stroke();

  // Inner metallic platinum/silver coin face
  const faceRadius = radius * 0.84;
  const faceGrad = ctx.createRadialGradient(
    -faceRadius * 0.35,
    -faceRadius * 0.35,
    faceRadius * 0.08,
    0,
    0,
    faceRadius
  );
  faceGrad.addColorStop(0, '#FFFFFF');
  faceGrad.addColorStop(0.28, '#F8FAFC');
  faceGrad.addColorStop(0.65, '#CBD5E1');
  faceGrad.addColorStop(0.88, '#94A3B8');
  faceGrad.addColorStop(1, '#64748B');

  ctx.beginPath();
  ctx.arc(0, 0, faceRadius, 0, Math.PI * 2);
  ctx.fillStyle = faceGrad;
  ctx.fill();

  // Subtle embossed inner rim rings
  ctx.beginPath();
  ctx.arc(0, 0, faceRadius * 0.88, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.lineWidth = Math.max(0.85, radius * 0.09);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, faceRadius * 0.74, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
  ctx.lineWidth = Math.max(0.65, radius * 0.06);
  ctx.stroke();

  // Crisp white specular highlight crescent
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, faceRadius * 0.88, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.lineWidth = Math.max(1.1, radius * 0.14);
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // Subtle center platinum diamond sheen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.beginPath();
  ctx.moveTo(0, -faceRadius * 0.34);
  ctx.lineTo(faceRadius * 0.18, 0);
  ctx.lineTo(0, faceRadius * 0.34);
  ctx.lineTo(-faceRadius * 0.18, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a crisp 4-point silver/white star sparkle.
 */
function drawStarSparkle(
  ctx: CanvasRenderingContext2D,
  size: number,
  rotation: number,
  hue: 'bright' | 'warm'
) {
  ctx.save();
  ctx.rotate(rotation);
  ctx.beginPath();
  const inner = size * 0.28;
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? size : inner;
    const angle = (i * Math.PI) / 4;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = hue === 'bright' ? '#FFFFFF' : '#E2E8F0';
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a soft glowing white/silver glitter dot without expensive canvas shadowBlur.
 */
function drawGlowDot(
  ctx: CanvasRenderingContext2D,
  size: number,
  hue: 'bright' | 'warm'
) {
  const glowR = size * 2.2;
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
  if (hue === 'bright') {
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(226, 232, 240, 0.85)');
    grad.addColorStop(1, 'rgba(148, 163, 184, 0)');
  } else {
    grad.addColorStop(0, 'rgba(241, 245, 249, 1)');
    grad.addColorStop(0.42, 'rgba(203, 213, 225, 0.8)');
    grad.addColorStop(1, 'rgba(100, 116, 139, 0)');
  }
  ctx.beginPath();
  ctx.arc(0, 0, glowR, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

export const GoldCoinClickBurst: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let viewW = window.innerWidth;
    let viewH = window.innerHeight;

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);
      canvas.style.width = `${viewW}px`;
      canvas.style.height = `${viewH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Particle[] = [];
    let rafId = 0;
    let isRunning = false;
    let lastTimestamp = 0;

    // Optional cursor-follower coin state (active only when ENABLE_CURSOR_FOLLOWER_COIN = true)
    const cursorState = {
      active: false,
      targetX: -100,
      targetY: -100,
      x: -100,
      y: -100,
      phase: 0
    };

    const spawnBurst = (originX: number, originY: number) => {
      // 8 to 12 subtle 10px–16px metallic silver coins (radius 5px–8px)
      const coinCount = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < coinCount; i++) {
        const baseAngle = (i / coinCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        // Tight velocity + high damping keeps travel within ~30px–50px around cursor
        const speed = prefersReducedMotion ? 28 + Math.random() * 24 : 115 + Math.random() * 65;
        const upwardPop = prefersReducedMotion ? -10 : -(24 + Math.random() * 18);

        particles.push({
          kind: 'coin',
          x: originX,
          y: originY,
          vx: Math.cos(baseAngle) * speed,
          vy: Math.sin(baseAngle) * speed * 0.72 + upwardPop,
          radius: 5 + Math.random() * 3, // 10px–16px diameter
          rotation: (Math.random() - 0.5) * 0.8,
          vRot: (Math.random() - 0.5) * 7.5,
          flipPhase: Math.random() * Math.PI * 2,
          vFlip: (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 4),
          age: 0,
          life: 0.5 + Math.random() * 0.2 // Snappy 0.5s – 0.7s
        });
      }

      // 12 to 16 crisp silver & white sparkles/glitter dots inside tight 30px–50px pocket
      const sparkleCount = 12 + Math.floor(Math.random() * 5);
      for (let i = 0; i < sparkleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = prefersReducedMotion ? 20 + Math.random() * 24 : 95 + Math.random() * 85;
        const upwardPop = prefersReducedMotion ? -8 : -(14 + Math.random() * 16);

        particles.push({
          kind: i % 2 === 0 ? 'star' : 'dot',
          x: originX + (Math.random() - 0.5) * 4,
          y: originY + (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.8 + upwardPop,
          size: i % 2 === 0 ? 2.4 + Math.random() * 2.2 : 1.4 + Math.random() * 1.4,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 9,
          age: 0,
          life: 0.45 + Math.random() * 0.22, // 0.45s – 0.67s
          hue: Math.random() > 0.45 ? 'bright' : 'warm'
        });
      }

      if (!isRunning) {
        isRunning = true;
        lastTimestamp = performance.now();
        rafId = requestAnimationFrame(renderLoop);
      }
    };

    const renderLoop = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.05);
      lastTimestamp = now;

      ctx.clearRect(0, 0, viewW, viewH);

      const gravity = prefersReducedMotion ? 35 : 135;
      const coinDrag = Math.pow(0.025, dt);
      const sparkleDrag = Math.pow(0.02, dt);

      // Update & draw particles backward for clean O(1) removal
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life) {
          particles.splice(i, 1);
          continue;
        }

        const progress = p.age / p.life;

        if (p.kind === 'coin') {
          p.vx *= coinDrag;
          p.vy = p.vy * coinDrag + gravity * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.vRot * dt;
          p.flipPhase += p.vFlip * dt;

          // Snappy scale-up in first 14%, gentle taper on exit
          const scaleIn = Math.min(1, progress / 0.14);
          const popScale =
            progress < 0.14
              ? 0.3 + 0.78 * Math.sin((scaleIn * Math.PI) / 2)
              : 1.05 - progress * 0.2;

          // Smooth fade-out over the second half of the 0.5s–0.7s burst
          const alpha =
            progress < 0.45 ? 1 : Math.max(0, 1 - (progress - 0.45) / 0.55);

          // Gentle 3D coin tumble clamped so rim stays visible
          const flipScaleX = 0.45 + 0.55 * Math.abs(Math.cos(p.flipPhase));

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.scale(popScale, popScale);
          drawSilverCoin(ctx, p.radius, p.rotation, flipScaleX);
          ctx.restore();
        } else {
          p.vx *= sparkleDrag;
          p.vy = p.vy * sparkleDrag + gravity * 0.35 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.vRot * dt;

          const twinkle = 0.72 + 0.28 * Math.sin(p.age * 26);
          const alpha =
            (progress < 0.4 ? 1 : Math.max(0, 1 - (progress - 0.4) / 0.6)) * twinkle;
          const scale = progress < 0.14 ? 0.45 + (progress / 0.14) * 0.65 : 1.05 - progress * 0.35;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.scale(scale, scale);
          if (p.kind === 'star') {
            drawStarSparkle(ctx, p.size, p.rotation, p.hue);
          } else {
            drawGlowDot(ctx, p.size, p.hue);
          }
          ctx.restore();
        }
      }

      // Optional subtle floating silver coin cursor follower
      if (ENABLE_CURSOR_FOLLOWER_COIN && cursorState.active) {
        cursorState.x += (cursorState.targetX - cursorState.x) * Math.min(1, dt * 14);
        cursorState.y += (cursorState.targetY - cursorState.y) * Math.min(1, dt * 14);
        cursorState.phase += dt * 3;
        const bobY = Math.sin(cursorState.phase) * 2.5;

        ctx.save();
        ctx.globalAlpha = 0.88;
        ctx.translate(cursorState.x + 14, cursorState.y + 16 + bobY);
        drawSilverCoin(ctx, 6, Math.sin(cursorState.phase * 0.5) * 0.18, 0.88);
        ctx.restore();
      }

      if (particles.length > 0 || (ENABLE_CURSOR_FOLLOWER_COIN && cursorState.active)) {
        rafId = requestAnimationFrame(renderLoop);
      } else {
        isRunning = false;
        ctx.clearRect(0, 0, viewW, viewH);
      }
    };

    const handleGlobalClick = (e: MouseEvent) => {
      // Ignore keyboard-synthesized clicks with (0, 0) coordinates unless targeting an element
      let x = e.clientX;
      let y = e.clientY;
      if (x === 0 && y === 0 && e.target instanceof HTMLElement) {
        const rect = e.target.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        } else {
          return;
        }
      }
      spawnBurst(x, y);
    };

    // Capture phase ensures bursts still trigger even if inner buttons/modals call stopPropagation()
    window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });

    let handleMouseMove: ((e: MouseEvent) => void) | null = null;
    let handleMouseLeave: (() => void) | null = null;

    if (ENABLE_CURSOR_FOLLOWER_COIN) {
      handleMouseMove = (e: MouseEvent) => {
        if (!cursorState.active) {
          cursorState.x = e.clientX;
          cursorState.y = e.clientY;
        }
        cursorState.active = true;
        cursorState.targetX = e.clientX;
        cursorState.targetY = e.clientY;
        if (!isRunning) {
          isRunning = true;
          lastTimestamp = performance.now();
          rafId = requestAnimationFrame(renderLoop);
        }
      };
      handleMouseLeave = () => {
        cursorState.active = false;
      };
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('click', handleGlobalClick, { capture: true });
      if (handleMouseMove) window.removeEventListener('mousemove', handleMouseMove);
      if (handleMouseLeave) document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
};
