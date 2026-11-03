import type { ComponentProps } from 'react';
import { motion } from 'framer-motion';
import styles from './LandingHero.module.css';
import { usePageEntrance } from '@/hooks/usePageEntrance';
import EyebrowPill from '@/components/EyebrowPill/EyebrowPill';
import FloatingShapes from '@/components/FloatingShapes/FloatingShapes';

type ShapeProps = ComponentProps<typeof FloatingShapes>;

interface LandingHeroProps {
  pill: string;
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick: () => void;
  wideDescription?: boolean;
  className?: string;
  shapes?: ShapeProps['shapes'];
  midRightRotateRange?: ShapeProps['midRightRotateRange'];
  flipMidRight?: boolean;
  solidShapes?: boolean;
  swapSidesOnMobile?: boolean;
  /** Session-once entrance key (e.g. "products"). Omit to skip entrance. */
  entranceKey?: string;
}

const LandingHero = ({
  pill,
  title,
  description,
  buttonLabel,
  onButtonClick,
  wideDescription = false,
  className,
  shapes,
  midRightRotateRange,
  flipMidRight,
  solidShapes,
  swapSidesOnMobile,
  entranceKey,
}: LandingHeroProps) => {
  const entrance = usePageEntrance(entranceKey ?? '');
  const playEntrance = Boolean(entranceKey) && entrance.play;
  const enterInitial = playEntrance ? entrance.fade.initial : false;

  return (
    <section className={`${styles.hero}${className ? ` ${className}` : ''}`}>
      <FloatingShapes
        shapes={shapes}
        midRightRotateRange={midRightRotateRange}
        flipMidRight={flipMidRight}
        solidShapes={solidShapes}
        swapSidesOnMobile={swapSidesOnMobile}
      />

      <div className={styles.content}>
        <EyebrowPill
          className={styles.pill}
          initial={enterInitial}
          animate={entrance.fade.animate}
          transition={entrance.transition(0)}
        >
          {pill}
        </EyebrowPill>
        <div className={styles.copy}>
          <motion.h1
            className={styles.title}
            initial={enterInitial}
            animate={entrance.fade.animate}
            transition={entrance.transition(0.12)}
          >
            {title}
          </motion.h1>
          <motion.p
            className={`${styles.description}${wideDescription ? ` ${styles.descriptionWide}` : ''}`}
            initial={enterInitial}
            animate={entrance.fade.animate}
            transition={entrance.transition(0.24)}
          >
            {description}
          </motion.p>
        </div>
        <motion.button
          type="button"
          className={styles.cta}
          onClick={onButtonClick}
          initial={enterInitial}
          animate={entrance.fade.animate}
          transition={entrance.transition(0.36)}
        >
          {buttonLabel}
        </motion.button>
      </div>
    </section>
  );
};

export default LandingHero;
