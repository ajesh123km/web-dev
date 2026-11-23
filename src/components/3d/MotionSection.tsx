import React from 'react';

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Scroll-triggered reveal wrapper backed by global IntersectionObserver (.reveal / .active).
 */
export const MotionSection: React.FC<MotionSectionProps> = ({
  children,
  className = '',
  delay = 0
}) => {
  const delayClass =
    delay >= 0.35
      ? 'reveal-delay-400'
      : delay >= 0.25
      ? 'reveal-delay-300'
      : delay >= 0.15
      ? 'reveal-delay-200'
      : delay > 0
      ? 'reveal-delay-100'
      : '';

  return (
    <div className={`reveal ${delayClass} ${className}`.trim()}>
      {children}
    </div>
  );
};

interface RupeeEmblem3DProps {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'forest' | 'light';
  className?: string;
}

const NEW_EMBLEM_LOGO_SRC =
  '/assets/aistudio/WhatsApp_Image_2026-11-08_at_9.42.49_AM_694e1ea2.jpeg';

/**
 * Circular 3D Team Stars Chits medallion crest displayed across schemes,
 * calculator, and member/admin portals.
 */
export const RupeeEmblem3D: React.FC<RupeeEmblem3DProps> = ({
  size = 'md',
  tone = 'forest',
  className = ''
}) => {
  const dims =
    size === 'sm'
      ? 'w-11 h-11'
      : size === 'lg'
      ? 'w-16 h-16'
      : 'w-12 h-12';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none overflow-hidden bg-white border ${
        tone === 'light'
          ? 'border-[#65E83A]/85 shadow-[0_8px_20px_-4px_rgba(101,232,58,0.28)]'
          : 'border-[#064E3B]/35 ring-1 ring-[#65E83A]/25 shadow-[0_10px_22px_-6px_rgba(6,78,59,0.22)]'
      } ${dims} ${className}`}
      aria-hidden="true"
    >
      <img
        src={NEW_EMBLEM_LOGO_SRC}
        alt=""
        className="w-full h-full object-contain scale-[1.03]"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
