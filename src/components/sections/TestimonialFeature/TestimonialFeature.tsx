import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { yellowCoral } from '@/assets/images/shapes/floaters';
import TestimonialVideo from './TestimonialVideo';
import styles from './TestimonialFeature.module.css';

interface TestimonialFeatureProps {
  videoSrc: string;
  /** First frame, shown until the video loads. */
  poster: string;
  quote: string;
  name: string;
  role: string;
  floater?: string;
}

/** An inline testimonial video with its own controls, and a glass quote card over its bottom edge. */
const TestimonialFeature = ({
  videoSrc,
  poster,
  quote,
  name,
  role,
  floater = yellowCoral,
}: TestimonialFeatureProps) => {
  const cardWrapRef = useRef<HTMLDivElement>(null);

  // From the card's top edge entering the screen until the whole card is in view.
  const { scrollYProgress } = useScroll({
    target: cardWrapRef,
    offset: ['start end', 'end end'],
  });
  // The card and the floater rotate into place as the card scrolls in, without moving, and are
  // straight by the time it's fully on screen.
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 0]);

  return (
    <section className={styles.section}>
      <TestimonialVideo src={videoSrc} poster={poster} />

      {/* The floater sits beside the card, not inside it, so the card's tilt doesn't swing it. */}
      <div ref={cardWrapRef} className={styles.cardWrap}>
        <motion.figure className={styles.card} style={{ rotate }}>
          <blockquote className={styles.quote}>{quote}</blockquote>
          <figcaption className={styles.caption}>
            <span className={styles.name}>{name}</span>
            <span className={styles.role}>{role}</span>
          </figcaption>
        </motion.figure>
        <motion.img
          src={floater}
          alt=""
          className={styles.floater}
          style={{ rotate }}
          aria-hidden
        />
      </div>
    </section>
  );
};

export default TestimonialFeature;
