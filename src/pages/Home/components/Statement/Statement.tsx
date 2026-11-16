import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { limeOlive, yellowCoral } from '@/assets/images/shapes/floaters';
import { statementLines } from '../../homeData';
import styles from './Statement.module.css';

// How far each floater drifts (px) while the band crosses the screen, bottom of the screen to top.
// They drift up faster than the page at different rates, so they read as nearer than the copy.
const TOP_DRIFT: [number, number] = [30, -30];
const BOTTOM_DRIFT: [number, number] = [50, -50];

const Statement = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // From the band's top entering the screen until its bottom leaves it.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const topY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : TOP_DRIFT);
  const bottomY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : BOTTOM_DRIFT);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Tilt and flip ride in the motion style, after the drift, so the drift stays vertical.
          Motion flips before it turns, and the flip reverses the turn: 15 here leans the same
          way as the bottom shape's -15. */}
      <motion.img
        src={yellowCoral}
        alt=""
        className={styles.shapeTop}
        style={{ y: topY, rotate: 15, scaleX: -1 }}
        aria-hidden
      />
      <div className={styles.copy}>
        {statementLines.map((line, i) => (
          <p
            key={line}
            className={`${styles.line}${i === statementLines.length - 1 ? ` ${styles.accent}` : ''}`}
          >
            {line}
          </p>
        ))}
      </div>
      <motion.img
        src={limeOlive}
        alt=""
        className={styles.shapeBottom}
        style={{ y: bottomY, rotate: -15 }}
        aria-hidden
      />
    </section>
  );
};

export default Statement;
