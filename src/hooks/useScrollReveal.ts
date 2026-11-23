import { useEffect } from 'react';

/**
 * Observes all `.reveal` elements using the native IntersectionObserver API.
 * - Bi-directional: adds `.active` when entering the viewport (`entry.isIntersecting`)
 *   and removes `.active` when scrolling out of view so it replays in both directions.
 * - Uses `threshold: 0.15` and `rootMargin: '0px 0px -40px 0px'`.
 * - Continues observing elements without calling `unobserve`.
 * - Respects `prefers-reduced-motion: reduce` and automatically observes
 *   dynamically mounted `.reveal` elements.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const activateAllImmediately = () => {
      document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
        el.classList.add('active');
      });
    };

    if (reducedMotionQuery.matches || !('IntersectionObserver' in window)) {
      activateAllImmediately();
      return;
    }

    const observedElements = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else {
            entry.target.classList.remove('active');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const observeAll = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
        if (!observedElements.has(el)) {
          observedElements.add(el);
          observer.observe(el);
        }
      });
    };

    observeAll();

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.classList.contains('reveal') && !observedElements.has(node)) {
            if (reducedMotionQuery.matches) {
              node.classList.add('active');
            } else {
              observedElements.add(node);
              observer.observe(node);
            }
          }
          observeAll(node);
        });
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        activateAllImmediately();
        observer.disconnect();
      }
    };

    reducedMotionQuery.addEventListener('change', handleMotionChange);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      reducedMotionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);
}
