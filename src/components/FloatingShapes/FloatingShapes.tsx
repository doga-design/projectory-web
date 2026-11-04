import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { yellowCoral, teal, coralBurgundy, lime } from '@/assets/images/shapes/floaters';
import styles from './FloatingShapes.module.css';

const defaultShapes = {
  upper: yellowCoral,
  midLeft: teal,
  midRight: coralBurgundy,
  lower: lime,
};

type Range = [number, number];
type Drift = { x: Range; y: Range; rotate: Range };

/** Default turn of the right-hand shape on its way out. Pages can override it. */
const MID_RIGHT_ROTATE: Range = [-15, -55];

/** Shapes drift apart as the section scrolls off the top of the screen. */
const leaveDrift = (midRightRotate: Range): Record<keyof typeof defaultShapes, Drift> => ({
  upper: { x: [0, -80], y: [0, -36], rotate: [-30, -55] },
  midLeft: { x: [0, -40], y: [0, 20], rotate: [15.524, 55] },
  midRight: { x: [0, 40], y: [0, -30], rotate: midRightRotate },
  lower: { x: [0, 90], y: [0, 40], rotate: [-15, -50] },
});

/** Shapes start a little further out and ease in on the text as the section comes up the screen. */
const arriveDrift = (midRightRotate: Range): Record<keyof typeof defaultShapes, Drift> => ({
  // This shape is mirrored when arriving, which reverses its turn: positive is counter-clockwise.
  upper: { x: [-30, 0], y: [-14, 0], rotate: [37, 22] },
  midLeft: { x: [-30, 0], y: [14, 0], rotate: [30.5, 15.524] },
  midRight: { x: [30, 0], y: [-14, 0], rotate: [midRightRotate[0] - 15, midRightRotate[0]] },
  lower: { x: [30, 0], y: [14, 0], rotate: [-30, -15] },
});

/** One shape's scroll motion. A hook so each value keeps a stable place in the render. */
const useDrift = (progress: MotionValue<number>, drift: Drift) => ({
  x: useTransform(progress, [0, 1], drift.x),
  y: useTransform(progress, [0, 1], drift.y),
  rotate: useTransform(progress, [0, 1], drift.rotate),
});

interface FloatingShapesProps {
  /** `leave` for a hero at the top of a page; `arrive` for a section scrolled into. */
  motionType?: 'leave' | 'arrive';
  shapes?: typeof defaultShapes;
  midRightRotateRange?: Range;
  flipMidRight?: boolean;
  solidShapes?: boolean;
  swapSidesOnMobile?: boolean;
}

/**
 * Four brand shapes filling their positioned parent section. They bob on their own and drift as
 * it scrolls. Scroll is read from this component's own container, the same box as the section:
 * a parent's ref isn't attached yet when this effect runs, so scroll would track the whole page.
 */
const FloatingShapes = ({
  motionType = 'leave',
  shapes = defaultShapes,
  midRightRotateRange = MID_RIGHT_ROTATE,
  flipMidRight = false,
  solidShapes = false,
  swapSidesOnMobile = false,
}: FloatingShapesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const arriving = motionType === 'arrive';
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: arriving ? ['start end', 'end end'] : ['start start', 'end start'],
  });
  // Arriving, a spring smooths out the scroll wheel's steps as the shapes close in.
  const smoothed = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const atRest = useMotionValue(1);
  const arriveProgress = reducedMotion ? atRest : smoothed;
  const progress = arriving ? arriveProgress : scrollYProgress;

  const drift = (arriving ? arriveDrift : leaveDrift)(midRightRotateRange);
  const upper = useDrift(progress, drift.upper);
  const midLeft = useDrift(progress, drift.midLeft);
  const midRight = useDrift(progress, drift.midRight);
  const lower = useDrift(progress, drift.lower);
  const fadeOpacity = useTransform(scrollYProgress, [0, 1], [0.8, 0.1]);

  const swapMotion = swapSidesOnMobile && isMobile;
  const upperOpacity = solidShapes ? 1 : isMobile ? fadeOpacity : undefined;
  const lowerOpacity = solidShapes ? 1 : fadeOpacity;

  return (
    <div
      ref={containerRef}
      className={`${styles.container}${arriving ? ` ${styles.arriving}` : ''}`}
    >
      <motion.img
        src={shapes.upper}
        alt=""
        className={`${styles.shape} ${styles.shapeUpper}`}
        style={{
          ...upper,
          scaleX: arriving ? -1 : 1,
          scaleY: arriving ? 1 : -1,
          opacity: upperOpacity,
        }}
        aria-hidden
      />
      <motion.img
        src={shapes.midLeft}
        alt=""
        className={`${styles.shape} ${styles.shapeMidLeft}`}
        style={swapMotion ? midRight : midLeft}
        aria-hidden
      />
      <motion.img
        src={shapes.midRight}
        alt=""
        className={`${styles.shape} ${styles.shapeMidRight}`}
        style={{ ...(swapMotion ? midLeft : midRight), scaleY: flipMidRight ? -1 : undefined }}
        aria-hidden
      />
      <motion.img
        src={shapes.lower}
        alt=""
        className={`${styles.shape} ${styles.shapeLower}`}
        style={{ ...lower, opacity: lowerOpacity }}
        aria-hidden
      />
    </div>
  );
};

export default FloatingShapes;
