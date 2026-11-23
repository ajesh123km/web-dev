import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  scrollStep?: number;
  ariaLabel?: string;
}

/**
 * Reusable horizontal scroll wrapper for wide admin/member tables & navigation tab bars.
 * - Supports mouse drag/scrollbar, touchpad horizontal pan, mobile touch swipe,
 *   Shift + Mouse Wheel horizontal scrolling (never blocks normal vertical scrolling),
 *   and left/right navigation arrows whenever content overflows horizontally.
 */
export const HorizontalScrollArea: React.FC<HorizontalScrollAreaProps> = ({
  children,
  className = '',
  innerClassName = '',
  scrollStep = 240,
  ariaLabel = 'Horizontally scrollable content'
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(maxScrollLeft > 2 && el.scrollLeft < maxScrollLeft - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScrollState) : null;
    if (ro) {
      ro.observe(el);
      if (el.firstElementChild) {
        ro.observe(el.firstElementChild);
      }
    }

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      if (ro) ro.disconnect();
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, children]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    // Only translate wheel to horizontal when Shift is held so vertical page/modal scrolling is never blocked
    if (e.shiftKey && el.scrollWidth > el.clientWidth && Math.abs(e.deltaY) > 0) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  };

  const scrollBy = (delta: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className={`relative group ${className}`}>
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-scrollStep)}
          aria-label={`Scroll left (${ariaLabel})`}
          title="Scroll Left"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 border border-[#064E3B]/25 shadow-md text-[#052E22] hover:bg-[#65E83A] hover:border-[#064E3B] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onWheel={handleWheel}
        role="region"
        aria-label={ariaLabel}
        className={`scroll-area-horizontal ${innerClassName}`}
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(scrollStep)}
          aria-label={`Scroll right (${ariaLabel})`}
          title="Scroll Right"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 border border-[#064E3B]/25 shadow-md text-[#052E22] hover:bg-[#65E83A] hover:border-[#064E3B] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
