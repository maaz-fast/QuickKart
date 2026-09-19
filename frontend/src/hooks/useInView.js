import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight IntersectionObserver hook for scroll-reveal animations.
 *
 * Design goals (test-friendly):
 *  - Content is NEVER hidden for automation: elements render fully-opaque by default
 *    and only get a CSS `.visible` transition class once scrolled into view.
 *  - If `prefers-reduced-motion: reduce` is set, elements are revealed immediately.
 *  - If IntersectionObserver is unavailable, elements are revealed immediately.
 *
 * Returns [ref, isInView].
 */
const useInView = (options = { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Bypass the observer entirely for reduced-motion users or old browsers.
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: options.threshold, rootMargin: options.rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.threshold, options.rootMargin]);

  return [ref, isInView];
};

export default useInView;