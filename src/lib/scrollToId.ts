import { animate, type AnimationPlaybackControls } from 'framer-motion';

/** Smooth-scroll to an in-page section by id, without touching the URL. */
export const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/** A weighted ease-in-out: slow to leave, slow to land. */
const HEAVY_EASE = [0.65, 0, 0.35, 1] as const;
const USER_SCROLL = ['wheel', 'touchstart', 'keydown'] as const;
let running: AnimationPlaybackControls | null = null;

/**
 * Scroll the window to an element on a heavy ease, which the browser's own smooth
 * scroll can't be given. Honours the element's scroll-margin-top, jumps straight there
 * under reduced motion, replaces any scroll it already has running, and lets go the
 * moment the user scrolls themselves. Resolves once it has landed or been stopped.
 */
export const easeScrollTo = async (el: HTMLElement, duration = 0.9) => {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const to = Math.min(max, el.getBoundingClientRect().top + window.scrollY - margin);

  running?.stop();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, to);
    return;
  }

  const stop = () => running?.stop();
  USER_SCROLL.forEach((type) => window.addEventListener(type, stop, { passive: true }));
  running = animate(window.scrollY, to, {
    duration,
    ease: HEAVY_EASE,
    onUpdate: (y) => window.scrollTo(0, y),
  });
  await running;
  USER_SCROLL.forEach((type) => window.removeEventListener(type, stop));
};
