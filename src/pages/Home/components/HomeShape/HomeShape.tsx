import { motion, useTransform, type MotionValue } from 'framer-motion';
import styles from './HomeShape.module.css';

interface HomeShapeProps {
  src: string;
  /** Scroll progress (0–1) that the drift follows. */
  progress: MotionValue<number>;
  x: [number, number];
  y: [number, number];
  rotate: [number, number];
  flipX?: boolean;
  /** Offsets the idle float, so shapes don't bob in step. */
  floatDelay?: number;
}

/** A floater with Home's idle float and scroll drift. Its parent sets size and position. */
const HomeShape = ({ src, progress, x, y, rotate, flipX, floatDelay = 0 }: HomeShapeProps) => {
  const driftX = useTransform(progress, [0, 1], x);
  const driftY = useTransform(progress, [0, 1], y);
  const driftRotate = useTransform(progress, [0, 1], rotate);

  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden
      className={styles.shape}
      style={{
        x: driftX,
        y: driftY,
        rotate: driftRotate,
        scaleX: flipX ? -1 : 1,
        animationDelay: `${floatDelay}s`,
      }}
    />
  );
};

export default HomeShape;
