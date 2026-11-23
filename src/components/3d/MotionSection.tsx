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

/**
 * Lightweight 3D sculpted Indian Rupee (₹) brushed gold & royal navy medallion badge
 * for portals, calculator vaults, and section headers without spawning extra WebGL contexts.
 */
export const RupeeEmblem3D: React.FC<RupeeEmblem3DProps> = ({
  size = 'md',
  tone = 'forest',
  className = ''
}) => {
  const dims =
    size === 'sm'
      ? 'w-10 h-10 text-base'
      : size === 'lg'
      ? 'w-14 h-14 text-2xl'
      : 'w-12 h-12 text-xl';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none ${dims} ${className}`}
      style={{
        background:
          tone === 'light'
            ? 'linear-gradient(145deg, #DCFCE7 0%, #65E83A 58%, #22C55E 100%)'
            : 'linear-gradient(145deg, #0B5D46 0%, #064E3B 60%, #052E22 100%)',
        boxShadow:
          tone === 'light'
            ? '0 10px 22px -6px rgba(6, 78, 59, 0.22), inset 0 2px 3px rgba(255, 255, 255, 0.78), inset 0 -3px 5px rgba(6, 78, 59, 0.18)'
            : '0 10px 24px -6px rgba(5, 46, 34, 0.42), inset 0 2px 4px rgba(101, 232, 58, 0.35), inset 0 -3px 6px rgba(3, 31, 23, 0.6)'
      }}
      aria-hidden="true"
    >
      <div
        className={`w-[78%] h-[78%] rounded-full flex items-center justify-center border ${
          tone === 'light'
            ? 'bg-gradient-to-b from-[#86EFAC] to-[#65E83A] border-[#064E3B]/30'
            : 'bg-gradient-to-b from-[#0B533D] to-[#052E22] border-[#65E83A]/50'
        }`}
      >
        <span
          className={`font-extrabold leading-none drop-shadow-sm ${
            tone === 'light' ? 'text-[#052E22]' : 'text-[#65E83A]'
          }`}
        >
          ₹
        </span>
      </div>
    </div>
  );
};
