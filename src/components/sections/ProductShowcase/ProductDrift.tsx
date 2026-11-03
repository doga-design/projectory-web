import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';
import ProductCard from '@/components/ProductCard/ProductCard';
import type { Product } from '@/types/product';
import styles from './ProductDrift.module.css';

/** Drift speed, in px per second, leftwards. */
const DRIFT_SPEED = 30;
/** How gently the row eases to a stop, back up to speed, or out of a flick. Seconds. */
const EASE_SECONDS = 0.35;
/** How quickly the row brings a keyboard-focused card into place. Seconds. */
const FOCUS_SECONDS = 0.12;
/** How far a press has to travel before it's a drag rather than a click. */
const DRAG_THRESHOLD_PX = 6;
/** The fastest a flick can send the row, in px per second. */
const MAX_FLICK_SPEED = 2000;

/** Share of the way to a target to cover this frame, whatever the frame rate. */
const easeStep = (dt: number, seconds: number) => 1 - Math.exp(-dt / seconds);

type Press = { id: number; startX: number; lastX: number; lastTime: number; dragging: boolean };

/**
 * An endless row of product cards. It drifts slowly, eases to a stop while a card is hovered,
 * and can be dragged or swiped. The product set is repeated to fill the screen: only the first
 * copy is exposed to keyboards and screen readers, while the rest stay usable with a pointer.
 */
const ProductDrift = ({ products }: { products: readonly Product[] }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLUListElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  const [copies, setCopies] = useState(2);
  const x = useMotionValue(0);
  const inView = useInView(viewportRef, { margin: '100px' });
  const reducedMotion = useReducedMotion();

  // Per-frame state, kept out of React so the row never re-renders as it moves.
  const motionState = useRef({
    position: 0,
    velocity: 0,
    setWidth: 0,
    hovering: false,
    press: null as Press | null,
    focusTarget: null as number | null,
    suppressClick: false,
  });

  // One set's width is the distance the row can wrap by without a visible jump.
  useEffect(() => {
    const viewport = viewportRef.current;
    const firstSet = firstSetRef.current;
    const anchor = anchorRef.current;
    if (!viewport || !firstSet || !anchor) return;

    const measure = () => {
      const state = motionState.current;
      const setWidth = firstSet.getBoundingClientRect().width;
      if (!setWidth) return;
      // The first time, the second set's first card starts on the page column, with the end of
      // the first set peeking in on its left. After that, resizing keeps the same card in view.
      state.position = state.setWidth
        ? state.position * (setWidth / state.setWidth)
        : anchor.offsetLeft - setWidth;
      state.setWidth = setWidth;
      x.set(state.position);
      // Enough to still cover the screen when the row is a whole set along.
      setCopies(Math.ceil(viewport.clientWidth / setWidth) + 1);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(firstSet);
    return () => observer.disconnect();
  }, [x]);

  // The repeats are hidden from screen readers, so their links and buttons leave the tab order.
  // Not `inert`: that would also stop them responding to the mouse.
  useEffect(() => {
    trackRef.current
      ?.querySelectorAll('[aria-hidden="true"] a, [aria-hidden="true"] button')
      .forEach((el) => el.setAttribute('tabindex', '-1'));
  }, [copies, products]);

  useAnimationFrame((_, delta) => {
    const state = motionState.current;
    if (!state.setWidth || !inView) return;
    // A long frame (a background tab coming back) shouldn't throw the row forward.
    const dt = Math.min(delta, 50) / 1000;

    if (state.press?.dragging) {
      // The pointer moves the row. Holding still lets the flick speed die away before release.
      state.velocity *= 1 - easeStep(dt, 0.1);
    } else {
      const stopped = reducedMotion || state.hovering || state.press || state.focusTarget !== null;
      const target = stopped ? 0 : -DRIFT_SPEED;
      // Reduced motion: the row stays where it's put, with no glide after a flick.
      state.velocity = reducedMotion
        ? 0
        : state.velocity + (target - state.velocity) * easeStep(dt, EASE_SECONDS);
      state.position += state.velocity * dt;
    }

    if (state.focusTarget !== null) {
      state.position += (state.focusTarget - state.position) * easeStep(dt, FOCUS_SECONDS);
    } else if (state.position > 0) {
      state.position -= state.setWidth;
    } else if (state.position < -state.setWidth) {
      state.position += state.setWidth;
    }
    x.set(state.position);
  });

  const endPress = (e: React.PointerEvent) => {
    const state = motionState.current;
    if (state.press?.id !== e.pointerId) return;
    // A drag ends in a click on whatever's underneath; don't treat it as picking a card.
    if (state.press.dragging && e.type === 'pointerup') state.suppressClick = true;
    state.press = null;
    delete viewportRef.current?.dataset.dragging;
  };

  return (
    <div className={styles.drift}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          const state = motionState.current;
          state.suppressClick = false;
          state.focusTarget = null;
          state.press = {
            id: e.pointerId,
            startX: e.clientX,
            lastX: e.clientX,
            lastTime: e.timeStamp,
            dragging: false,
          };
        }}
        onPointerMove={(e) => {
          const state = motionState.current;
          const press = state.press;
          if (press?.id !== e.pointerId) return;
          if (!press.dragging) {
            if (Math.abs(e.clientX - press.startX) < DRAG_THRESHOLD_PX) return;
            press.dragging = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            e.currentTarget.dataset.dragging = '';
            state.velocity = 0;
          }
          const moved = e.clientX - press.lastX;
          const elapsed = (e.timeStamp - press.lastTime) / 1000;
          state.position += moved;
          // Blended and capped: two events a millisecond apart would otherwise read as a huge flick.
          if (elapsed > 0) {
            const speed = (state.velocity + moved / elapsed) / 2;
            state.velocity = Math.max(-MAX_FLICK_SPEED, Math.min(MAX_FLICK_SPEED, speed));
          }
          press.lastX = e.clientX;
          press.lastTime = e.timeStamp;
        }}
        onPointerUp={endPress}
        // The browser took over, usually to scroll the page vertically.
        onPointerCancel={endPress}
        onClickCapture={(e) => {
          const state = motionState.current;
          if (!state.suppressClick) return;
          state.suppressClick = false;
          e.preventDefault();
          e.stopPropagation();
        }}
        // Links and images would otherwise start the browser's own drag and cancel ours.
        onDragStart={(e) => e.preventDefault()}
        onFocus={(e) => {
          // Keyboard only: a mouse click on a card that's already in view shouldn't move it.
          const slide = e.target.closest<HTMLElement>('li');
          if (!slide || !e.target.matches(':focus-visible')) return;
          const state = motionState.current;
          const inset = anchorRef.current?.offsetLeft ?? 0;
          const left = e.currentTarget.getBoundingClientRect().left;
          const offset = inset + left - slide.getBoundingClientRect().left;
          // Sets are identical, so first jump a whole set if that makes the trip shorter; the row
          // then glides a short way rather than spinning through every product.
          const trips = Math.round(offset / state.setWidth);
          state.position += trips * state.setWidth;
          state.focusTarget = state.position + offset - trips * state.setWidth;
        }}
        onBlur={() => {
          motionState.current.focusTarget = null;
        }}
      >
        <span ref={anchorRef} className={styles.anchor} aria-hidden />
        <motion.div ref={trackRef} className={styles.track} style={{ x }}>
          {Array.from({ length: copies }, (_, copy) => (
            <ul
              key={copy}
              ref={copy === 0 ? firstSetRef : undefined}
              className={styles.set}
              aria-hidden={copy > 0 || undefined}
            >
              {products.map((product) => (
                <li
                  key={product.id}
                  className={styles.slide}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse') motionState.current.hovering = true;
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === 'mouse') motionState.current.hovering = false;
                  }}
                >
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDrift;
