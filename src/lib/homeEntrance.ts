/**
 * What Home's entrance needs from outside Home: when the loader lifts, and the
 * navbar hidden from before the first paint. Not in Home's lazy chunk, so both
 * work even when the chunk arrives after the loader has gone.
 */

const STAGE_ATTRIBUTE = 'data-home-stage';
/** The navbar must never stay hidden if Home doesn't mount (e.g. the visitor went back). */
const STAGE_SAFETY_MS = 10000;

let loaderLifted = false;
const waiting = new Set<() => void>();

export function markLoaderLifted() {
  loaderLifted = true;
  waiting.forEach((callback) => callback());
  waiting.clear();
}

/** Calls back as the loader starts lifting, or next tick if it already has. Returns a cancel. */
export function onLoaderLifted(callback: () => void) {
  if (loaderLifted) {
    const id = window.setTimeout(callback);
    return () => window.clearTimeout(id);
  }
  waiting.add(callback);
  return () => {
    waiting.delete(callback);
  };
}

export const setHomeStage = (on: boolean) =>
  document.documentElement.toggleAttribute(STAGE_ATTRIBUTE, on);

/** Run before the first render. Mirrors the checks in usePageEntrance and useHomeEntrance. */
export function armHomeEntrance() {
  if (window.location.pathname !== '/') return;
  if (window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches) return;
  try {
    if (sessionStorage.getItem('entrance:home')) return;
  } catch {
    // Storage blocked: usePageEntrance plays the entrance in this case too.
  }
  setHomeStage(true);
  window.setTimeout(() => setHomeStage(false), STAGE_SAFETY_MS);
}
