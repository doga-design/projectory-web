import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from './CustomCursor.module.css';

interface CustomCursorProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  text?: string;
}

/**
 * A label that follows a real mouse while it's over the target, just below and right of
 * the native cursor. The browser's own hover events decide when: anything sitting on top
 * of the target (a button, the navbar) ends the hover by itself.
 */
const CustomCursor = ({ targetRef, isMobile, text = 'see the whole reel' }: CustomCursorProps) => {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const prevRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = targetRef.current;
    if (isMobile || !el) return;

    // Coming back during the fade-out cancels it, so the label can't get stuck hidden.
    const show = (x: number, y: number) => {
      window.clearTimeout(hideTimerRef.current);
      setPos({ x, y });
      setIsVisible(true);
      setActive(true);
      prevRef.current = { x, y };
    };

    const hide = () => {
      setIsVisible(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.clearTimeout(hideTimerRef.current);
      // Stays mounted for the fade-out.
      hideTimerRef.current = window.setTimeout(() => {
        setActive(false);
        setRotation(0);
        prevRef.current = null;
      }, 200);
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') show(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const x = e.clientX;
      const y = e.clientY;
      setPos({ x, y });

      // smooth rotation via rAF to reduce jitter/state spam
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const prev = prevRef.current;
        if (prev) {
          const dx = x - prev.x;
          const dy = y - prev.y;

          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);
            const speed = Math.sqrt(dx * dx + dy * dy);
            const maxRotation = 15;
            const speedFactor = Math.min(speed / 10, 1);
            const subtle = rawAngle * 0.3 * speedFactor;
            const clamped = Math.max(-maxRotation, Math.min(maxRotation, subtle));
            setRotation(clamped);
          }
        }
        prevRef.current = { x, y };
      });
    };

    el.addEventListener('pointerenter', onPointerEnter);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.clearTimeout(hideTimerRef.current);
      el.removeEventListener('pointerenter', onPointerEnter);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
    };
  }, [isMobile, targetRef]);

  if (isMobile || !active || typeof document === 'undefined') return null;

  const scale = isVisible ? 1 : 0.8;
  const opacity = isVisible ? 1 : 0;

  return ReactDOM.createPortal(
    <div
      className={styles.customCursor}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: `translate(18px, 18px) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: 'top left',
        opacity: opacity,
        transition: isVisible
          ? 'opacity 0.2s ease-out, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'opacity 0.15s ease-out, transform 0.15s ease-out',
      }}
    >
      {text}
    </div>,
    document.body
  );
};

export default CustomCursor;
