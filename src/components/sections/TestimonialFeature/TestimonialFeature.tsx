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
  const cardRef = useRef<HTMLElement>(null);

  // From the card's top edge entering the screen until the whole card is in view.
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end end'],
  });
  // The card rotates into place as it scrolls in, without moving, and is straight by the time
  // it's fully on screen; the floater settles with it, on the video's bottom edge.
  const cardRotate = useTransform(scrollYProgress, [0, 1], [-6, 0]);
  const floaterY = useTransform(scrollYProgress, [0, 1], [16, 0]);

  return (
    <section className={styles.section}>
      <TestimonialVideo src={videoSrc} poster={poster} />

      <motion.figure ref={cardRef} className={styles.card} style={{ rotate: cardRotate }}>
        <blockquote className={styles.quote}>{quote}</blockquote>
        <figcaption className={styles.caption}>
          <span className={styles.name}>{name}</span>
          <span className={styles.role}>{role}</span>
        </figcaption>
        <motion.img
          src={floater}
          alt=""
          className={styles.floater}
          style={{ y: floaterY }}
          aria-hidden
        />
      </motion.figure>
    </section>
  );
};

export default TestimonialFeature;
