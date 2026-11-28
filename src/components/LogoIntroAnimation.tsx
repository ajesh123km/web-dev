import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

const SPIN_DURATION_MS = 1650;
const FLY_DURATION_MS = 720;

export const LogoIntroAnimation: React.FC = () => {
  const [phase, setPhase] = useState<'spinning' | 'flying' | 'done'>('spinning');

  const [flyTransform, setFlyTransform] = useState<string>(
    'translate3d(0px, 0px, 0px) scale(1) rotateY(0deg)'
  );
  const logoStageRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;

    if (phase === 'done') {
      body.classList.remove('is-loading', 'is-flying', 'intro-just-landed');
      body.classList.add('loaded');
      return;
    }

    if (phase === 'spinning') {
      body.classList.remove('loaded', 'is-flying', 'intro-just-landed');
      body.classList.add('is-loading');
    } else if (phase === 'flying') {
      body.classList.remove('is-loading');
      body.classList.add('is-flying');
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'spinning') return;

    const spinTimer = window.setTimeout(() => {
      const targetEl = document.getElementById('navbar-brand-logo');
      const flyingEl = logoStageRef.current;

      if (targetEl && flyingEl) {
        const targetRect = targetEl.getBoundingClientRect();
        const currentRect = flyingEl.getBoundingClientRect();

        if (targetRect.width > 0 && currentRect.width > 0) {
          const targetCenterX = targetRect.left + targetRect.width / 2;
          const targetCenterY = targetRect.top + targetRect.height / 2;
          const currentCenterX = currentRect.left + currentRect.width / 2;
          const currentCenterY = currentRect.top + currentRect.height / 2;

          const dx = targetCenterX - currentCenterX;
          const dy = targetCenterY - currentCenterY;
          const targetScale = targetRect.width / currentRect.width;

          setFlyTransform(
            `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0px) scale(${targetScale.toFixed(
              4
            )}) rotateY(0deg)`
          );
        }
      }

      setPhase('flying');
    }, SPIN_DURATION_MS);

    return () => window.clearTimeout(spinTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'flying') return;

    const landTimer = window.setTimeout(() => {
      const body = document.body;
      body.classList.remove('is-loading', 'is-flying');
      body.classList.add('loaded', 'intro-just-landed');
      setPhase('done');

      window.setTimeout(() => {
        body.classList.remove('intro-just-landed');
      }, 450);
    }, FLY_DURATION_MS);

    return () => window.clearTimeout(landTimer);
  }, [phase]);

  // Ensure body always returns to interactive .loaded state on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('is-loading', 'is-flying');
      document.body.classList.add('loaded');
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      aria-hidden="true"
      className={`intro-overlay fixed inset-0 z-[9995] flex items-center justify-center ${
        phase === 'spinning'
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-100 pointer-events-none'
      }`}
    >
      {/* Atmospheric Backdrop Scrim (fades out smoothly during flight) */}
      <div
        className={`intro-backdrop absolute inset-0 transition-opacity duration-600 ease-out ${
          phase === 'spinning' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 3D Perspective Container for the Flying Brand Logo */}
      <div className="intro-stage relative flex items-center justify-center">
        <div
          ref={logoStageRef}
          className={`intro-logo-carrier relative w-40 h-40 sm:w-52 sm:h-52 rounded-full ${
            phase === 'flying' ? 'is-flying' : 'is-spinning'
          }`}
          style={
            phase === 'flying'
              ? {
                  transform: flyTransform
                }
              : undefined
          }
        >
          {/* Subtle Ambient Glow Ring (fades as logo shrinks into navbar) */}
          <div
            className={`intro-logo-glow absolute -inset-4 rounded-full pointer-events-none transition-opacity duration-500 ${
              phase === 'spinning' ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* 3D Spinning Medal Surface */}
          <div
            className={`intro-logo-3d w-full h-full rounded-full overflow-hidden border-[3px] border-[#65E83A]/85 bg-white shadow-[0_24px_64px_-10px_rgba(6,40,28,0.55),0_0_48px_rgba(101,232,58,0.38)] ${
              phase === 'spinning' ? 'intro-spin-active' : 'intro-spin-settled'
            }`}
          >
            <img
              src="/images/team-stars-logo.jpeg"
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
