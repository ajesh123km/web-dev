import React, { useEffect, useRef } from 'react';

/**
 * Full-screen, fixed, looping, muted 3D green Rupee video background (z-index: -1).
 * Scales cleanly across desktop and mobile via object-fit: cover + 100dvh,
 * includes a readability scrim, and respects prefers-reduced-motion.
 */
export const VideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof window === 'undefined') return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncPlayback = () => {
      if (reducedMotionQuery.matches) {
        video.pause();
        return;
      }
      if (video.paused) {
        video.play().catch(() => {
          // Ignore autoplay promise rejections in strict power-saving modes
        });
      }
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        syncPlayback();
      }
    };

    syncPlayback();
    video.addEventListener('canplay', syncPlayback);
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotionQuery.addEventListener('change', syncPlayback);

    return () => {
      video.removeEventListener('canplay', syncPlayback);
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotionQuery.removeEventListener('change', syncPlayback);
    };
  }, []);

  return (
    <div className="bg-video-layer" aria-hidden="true">
      <video
        ref={videoRef}
        className="bg-video-media"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/assets/aistudio/websev_e3640f49.mp4" type="video/mp4" />
      </video>
      <div className="bg-video-scrim" />
    </div>
  );
};
