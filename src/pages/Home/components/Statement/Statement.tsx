import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { limeOlive, yellowCoral } from '@/assets/images/shapes/floaters';
import HomeShape from '../HomeShape/HomeShape';
import { statementLines } from '../../homeData';
import styles from './Statement.module.css';

/** Share of the scroll each line takes to light; the rest holds the finished copy. */
const LIT_BY = 0.88;

const Line = ({
  text,
  progress,
  range,
  accent,
}: {
  text: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
}) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <p className={styles.line}>
      {text}
      {/* The same text on top, so it wraps identically. Opacity keeps colours on tokens. */}
      <motion.span
        className={`${styles.lit}${accent ? ` ${styles.litAccent}` : ''}`}
        style={{ opacity }}
        aria-hidden
      >
        {text}
      </motion.span>
    </p>
  );
};

const Statement = () => {
  const wrapperRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    // Starts just before it pins, so the first line is lighting as the section arrives.
    offset: ['start 45%', 'end end'],
  });

  const step = LIT_BY / statementLines.length;

  return (
    <section ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.pin}>
        <div className={styles.copy}>
          <div className={styles.shapeTop}>
            <HomeShape
              src={yellowCoral}
              progress={scrollYProgress}
              x={[0, -24]}
              y={[0, -6]}
              rotate={[-8, -20]}
              flipX
              floatDelay={0.3}
            />
          </div>
          {statementLines.map((line, i) => (
            <Line
              key={line}
              text={line}
              progress={scrollYProgress}
              range={[i * step, (i + 1) * step]}
              accent={i === statementLines.length - 1}
            />
          ))}
          <div className={styles.shapeBottom}>
            <HomeShape
              src={limeOlive}
              progress={scrollYProgress}
              x={[0, 30]}
              y={[0, -14]}
              rotate={[-14, 4]}
              floatDelay={0.9}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statement;
