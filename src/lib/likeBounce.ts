/** The navbar heart's pulse (`heartPulse` in Navbar.module.css), minus its icon-only offset. */
const EASING = 'cubic-bezier(0.34, 1.45, 0.64, 1)';
const KEYFRAMES: Keyframe[] = [
  { transform: 'scale(1)', easing: EASING },
  { transform: 'scale(1.28)', offset: 0.4, easing: EASING },
  { transform: 'scale(1)' },
];
const DURATION_MS = 360;

/** Bounces a like button. Call it from the click that likes, so saved likes loading stay still. */
export const playLikeBounce = (element: Element) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  element.animate(KEYFRAMES, { duration: DURATION_MS });
};
