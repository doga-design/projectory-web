import { useEffect, useRef } from 'react';
import {
  cubicBezier,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from 'framer-motion';
import { limeOlive } from '@/assets/images/shapes/floaters';
import { statementLines } from '../../homeData';
import styles from './Statement.module.css';

/*
 * The scroll, in vh. The band pins for 180vh (the wrapper's 280vh less the screen); the timeline
 * also takes in 40vh either side of the pin, so the band starts growing while it's still scrolling
 * in.
 */
const LEAD = 40;
const PINNED = 180;
const at = (vh: number) => vh / (LEAD + PINNED + LEAD);

/** Grown to the full screen 30vh into the pin; lines light until 150vh; holds lit to the release.
    Symmetric (LIT_BY = 1 - GROWN_BY), so coming back up the band regrows as the last line dims. */
const GROWN_BY = at(LEAD + 30);
const LIT_BY = at(LEAD + 150);

/** A heavy ease-in-out: the band gathers slowly, sweeps open, then settles into the screen's edges. */
const HEAVY = cubicBezier(0.76, 0, 0.24, 1);

// How far the floater drifts (px) while the band crosses the screen, bottom of the screen to top.
// It drifts up faster than the page, so it reads as nearer than the copy.
const DRIFT: [number, number] = [50, -50];

/** The band's resting height (its original size) and the room it keeps above and below the copy. */
const BAND_MIN = 550;
const BAND_PAD = 80;

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

/**
 * A white band that scrolls in at its resting size and grows to fill the screen as it pins, lights
 * its seven lines one by one (they stay lit, the last in coral), then scrolls away full-screen. Once
 * it's off the screen it is back at its resting size, so scrolling back up replays the grow from
 * the other side.
 * On phones it is a plain band, fully lit, each line wrapped to two balanced rows.
 */
const Statement = () => {
  const wrapperRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const pinRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  // From the band's top 40% down the screen until its bottom is 60% down: LEAD either side of the pin.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start 40%', 'end 60%'],
  });

  // How far the white band sits in from the screen's top and bottom at its resting size: the
  // original band (550px, or the copy plus its padding where taller), centred on the screen.
  const restInset = useMotionValue(0);
  useEffect(() => {
    const pin = pinRef.current;
    const copy = copyRef.current;
    if (!pin || !copy) return;
    const measure = () => {
      const band = Math.max(BAND_MIN, copy.offsetHeight + 2 * BAND_PAD);
      restInset.set(Math.max(0, (pin.offsetHeight - band) / 2));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pin);
    observer.observe(copy);
    return () => observer.disconnect();
  }, [restInset]);

  // From the band's top entering the screen until its bottom leaves it.
  const { scrollYProgress: passProgress } = useScroll({
    target: wrapperRef,
    offset: ['start end', 'end start'],
  });

  // Which side the band was last entered from (1: from below, scrolling up). Only flips while the
  // band is wholly off the screen, so its reset to the resting size is never seen.
  const fromBelow = useMotionValue(0);
  useEffect(() => {
    fromBelow.set(passProgress.get() > 0.5 ? 1 : 0);
  }, [fromBelow, passProgress]);
  useMotionValueEvent(passProgress, 'change', (pass) => {
    if (pass >= 0.999) fromBelow.set(1);
    else if (pass <= 0.001) fromBelow.set(0);
  });

  // How far in from its full-screen size the band sits (1: resting size). It grows on the heavy
  // curve as it pins, on whichever side it arrives from, and never shrinks while on screen.
  const insetShare = useTransform([scrollYProgress, fromBelow], ([p, below]: number[]) => {
    if (below) return p > 1 - GROWN_BY ? HEAVY((p - (1 - GROWN_BY)) / GROWN_BY) : 0;
    return p < GROWN_BY ? 1 - HEAVY(p / GROWN_BY) : 0;
  });
  const bandInset = useTransform([insetShare, restInset], ([share, rest]: number[]) =>
    reduceMotion ? 0 : share * rest
  );
  // The band arrives at its resting size, so the gap above counts from that edge, not the screen's.
  const bandMargin = useTransform(restInset, (rest) => `${reduceMotion ? 0 : rest}px`);

  const floaterY = useTransform(passProgress, [0, 1], reduceMotion ? [0, 0] : DRIFT);

  // How far the floater has climbed off the band's bottom edge into the band (0: straddling the
  // edge, 1: fully inside). It rises as the band grows, so it isn't cut off by the screen's edge
  // while pinned, and settles back onto the edge as the band scrolls away.
  const RELEASED = at(LEAD + PINNED);
  const floaterLift = useTransform([scrollYProgress, fromBelow], ([p, below]: number[]) => {
    if (reduceMotion) return 0;
    if (below) {
      if (p > 1 - GROWN_BY) return 1 - HEAVY((p - (1 - GROWN_BY)) / GROWN_BY);
      return p < 1 - RELEASED ? HEAVY(p / (1 - RELEASED)) : 1;
    }
    if (p < GROWN_BY) return HEAVY(p / GROWN_BY);
    return p > RELEASED ? 1 - HEAVY((p - RELEASED) / (1 - RELEASED)) : 1;
  });

  // Lines light only once the band fills the screen.
  const step = (LIT_BY - GROWN_BY) / statementLines.length;

  return (
    <motion.section
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ '--rest-inset': bandMargin } as MotionStyle}
    >
      <div ref={pinRef} className={styles.pin}>
        {/* The white band: grows from its resting size to the full screen while pinned. */}
        <motion.div className={styles.band} style={{ top: bandInset, bottom: bandInset }}>
          <motion.img
            src={limeOlive}
            alt=""
            className={styles.shapeBottom}
            style={{ y: floaterY, rotate: -15, '--lift': floaterLift } as MotionStyle}
            aria-hidden
          />
        </motion.div>
        <div ref={copyRef} className={styles.copy}>
          {statementLines.map((line, i) => (
            <Line
              key={line}
              text={line}
              progress={scrollYProgress}
              range={[GROWN_BY + i * step, GROWN_BY + (i + 1) * step]}
              accent={i === statementLines.length - 1}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Statement;
