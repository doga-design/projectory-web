import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useReducedMotion } from 'framer-motion';
import styles from './CustomCursor.module.css';

interface CustomCursorProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  text?: string;
}

const MAX_TILT_DEG = 15;
/** Smaller moves are jitter, and keep the current tilt. */
const MIN_TILT_MOVE_PX = 2;

/** Leans the label toward the direction of travel, further the faster it moves. */
const tiltFor = (dx: number, dy: number) => {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const speedFactor = Math.min(Math.hypot(dx, dy) / 10, 1);
  return Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, angle * 0.3 * speedFactor));
};

/**
 * A label that replaces the mouse cursor over the target; the target's CSS hides the native one.
 * The browser's own hover events decide when: anything sitting on top of the target (a button,
 * the navbar) ends the hover by itself.
 *
 * Position and tilt are written straight to the element, so moving the mouse never re-renders.
 */
const CustomCursor = ({ targetRef, isMobile, text = 'See the Whole Reel' }: CustomCursorProps) => {
  const labelRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const target = targetRef.current;
    const label = labelRef.current;
    if (!target || !label) return;

    let previous: { x: number; y: number } | null = null;

    // On every move, not just on enter: after the window loses focus the pointer can still be
    // over the target with no new enter event, and the native cursor is hidden there.
    const follow = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const { clientX: x, clientY: y } = e;
      label.style.translate = `calc(${x}px - 50%) calc(${y}px - 50%)`;

      if (previous && !reducedMotion) {
        const dx = x - previous.x;
        const dy = y - previous.y;
        if (Math.abs(dx) > MIN_TILT_MOVE_PX || Math.abs(dy) > MIN_TILT_MOVE_PX) {
          label.style.rotate = `${tiltFor(dx, dy)}deg`;
        }
      }
      previous = { x, y };
      setIsVisible(true);
    };

    const hide = () => {
      previous = null;
      label.style.rotate = '0deg';
      setIsVisible(false);
    };

    target.addEventListener('pointerenter', follow);
    target.addEventListener('pointermove', follow);
    target.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);

    return () => {
      target.removeEventListener('pointerenter', follow);
      target.removeEventListener('pointermove', follow);
      target.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
      hide();
    };
  }, [isMobile, targetRef, reducedMotion]);

  if (isMobile || typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <div
      ref={labelRef}
      className={`${styles.customCursor}${isVisible ? ` ${styles.visible}` : ''}`}
      aria-hidden
    >
      {text}
    </div>,
    document.body
  );
};

export default CustomCursor;
