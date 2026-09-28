import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './LandingHero.module.css';
import { yellowCoral, teal, coralBurgundy, lime } from '@/assets/images/shapes/floaters';
import { usePageEntrance } from '@/hooks/usePageEntrance';
import EyebrowPill from '@/components/EyebrowPill/EyebrowPill';

const defaultShapes = {
  upper: yellowCoral,
  midLeft: teal,
  midRight: coralBurgundy,
  lower: lime,
};

export type LandingHeroShapes = typeof defaultShapes;

interface LandingHeroProps {
  pill: string;
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick: () => void;
  wideDescription?: boolean;
  className?: string;
  shapes?: LandingHeroShapes;
  midRightRotateRange?: [number, number];
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
  shapes = defaultShapes,
  midRightRotateRange = [-15, -55],
  flipMidRight = false,
  solidShapes = false,
  swapSidesOnMobile = false,
  entranceKey,
}: LandingHeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const entrance = usePageEntrance(entranceKey ?? '');
  const playEntrance = Boolean(entranceKey) && entrance.play;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const upperX = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const upperY = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const upperRotate = useTransform(scrollYProgress, [0, 1], [-30, -55]);

  const midLeftX = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const midLeftY = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const midLeftRotate = useTransform(scrollYProgress, [0, 1], [15.524, 55]);

  const midRightX = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const midRightY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const midRightRotate = useTransform(scrollYProgress, [0, 1], midRightRotateRange);

  const lowerX = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const lowerY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const lowerRotate = useTransform(scrollYProgress, [0, 1], [-15, -50]);
  const fadeOpacity = useTransform(scrollYProgress, [0, 1], [0.8, 0.1]);

  const swapMotion = swapSidesOnMobile && isMobile;
  const midLeftMotion = swapMotion
    ? { x: midRightX, y: midRightY, rotate: midRightRotate }
    : { x: midLeftX, y: midLeftY, rotate: midLeftRotate };
  const midRightMotion = swapMotion
    ? { x: midLeftX, y: midLeftY, rotate: midLeftRotate }
    : { x: midRightX, y: midRightY, rotate: midRightRotate };

  const upperOpacity = solidShapes ? 1 : isMobile ? fadeOpacity : undefined;
  const lowerOpacity = solidShapes ? 1 : fadeOpacity;

  const enterInitial = playEntrance ? entrance.fade.initial : false;

  return (
    <section ref={sectionRef} className={`${styles.hero}${className ? ` ${className}` : ''}`}>
      <div className={styles.shapesContainer}>
        <motion.img
          src={shapes.upper}
          alt=""
          className={`${styles.shape} ${styles.shapeUpper}`}
          style={{
            x: upperX,
            y: upperY,
            rotate: upperRotate,
            scaleX: 1,
            scaleY: -1,
            opacity: upperOpacity,
          }}
          aria-hidden
        />
        <motion.img
          src={shapes.midLeft}
          alt=""
          className={`${styles.shape} ${styles.shapeMidLeft}`}
          style={midLeftMotion}
          aria-hidden
        />
        <motion.img
          src={shapes.midRight}
          alt=""
          className={`${styles.shape} ${styles.shapeMidRight}`}
          style={{
            ...midRightMotion,
            scaleY: flipMidRight ? -1 : undefined,
          }}
          aria-hidden
        />
        <motion.img
          src={shapes.lower}
          alt=""
          className={`${styles.shape} ${styles.shapeLower}`}
          style={{ x: lowerX, y: lowerY, rotate: lowerRotate, opacity: lowerOpacity }}
          aria-hidden
        />
      </div>

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
