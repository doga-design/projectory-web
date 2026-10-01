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
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  // The card slowly rotates into place as the section scrolls through, without moving; the
  // floater settles with it, on the video's bottom edge.
  const cardRotate = useTransform(scrollYProgress, [0, 0.6], [-6, 0]);
  const floaterY = useTransform(scrollYProgress, [0, 0.6], [16, 0]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <TestimonialVideo src={videoSrc} poster={poster} />

      <motion.figure className={styles.card} style={{ rotate: cardRotate }}>
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
