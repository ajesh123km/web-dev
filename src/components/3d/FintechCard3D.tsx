import React, { useEffect, useRef, useState } from 'react';

interface FintechCard3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium';
  accent?: 'emerald' | 'mint' | 'forest' | 'ash' | 'gold' | 'neutral';
  disabled?: boolean;
}

/**
 * GPU-composited 3D perspective tilt + subtle light-mode specular sheen wrapper.
 * Automatically disables tilt on touch screens, coarse pointers, and reduced-motion setups.
 */
export const FintechCard3D: React.FC<FintechCard3DProps> = ({
  children,
  className = '',
  intensity = 'subtle',
  accent = 'emerald',
  disabled = false
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [canHoverTilt, setCanHoverTilt] = useState(false);
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [glowPos, setGlowPos] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 50,
    active: false
  });

  useEffect(() => {
    if (typeof window === 'undefined' || disabled) {
      setCanHoverTilt(false);
      return;
    }
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanHoverTilt(finePointer && !reducedMotion);
  }, [disabled]);

  const maxDeg = intensity === 'medium' ? 6.0 : 3.0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHoverTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotY = (px - 0.5) * 2 * maxDeg;
    const rotX = -(py - 0.5) * 2 * maxDeg;

    setTransformStyle(
      `perspective(1100px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(
        2
      )}deg) translateZ(6px)`
    );
    setGlowPos({
      x: Math.round(px * 100),
      y: Math.round(py * 100),
      active: true
    });
  };

  const handleMouseLeave = () => {
    if (!canHoverTilt) return;
    setTransformStyle('');
    setGlowPos((prev) => ({ ...prev, active: false }));
  };

  const spotlightColor =
    accent === 'mint'
      ? 'rgba(101, 232, 58, 0.22)'
      : accent === 'forest'
      ? 'rgba(101, 232, 58, 0.16)'
      : accent === 'gold'
      ? 'rgba(101, 232, 58, 0.20)'
      : accent === 'ash'
      ? 'rgba(6, 78, 59, 0.07)'
      : accent === 'emerald'
      ? 'rgba(6, 78, 59, 0.08)'
      : 'rgba(255, 255, 255, 0.24)';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        canHoverTilt
          ? {
              transform: glowPos.active ? transformStyle : undefined,
              transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)'
            }
          : undefined
      }
      className={`relative overflow-hidden isolate bg-clip-padding ${className}`}
    >
      {canHoverTilt && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: glowPos.active ? 1 : 0,
            background: `radial-gradient(420px circle at ${glowPos.x}% ${glowPos.y}%, ${spotlightColor}, transparent 65%)`
          }}
        />
      )}
      {children}
    </div>
  );
};
