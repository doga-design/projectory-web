import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { yellowCoral } from '@/assets/images/shapes/floaters';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useScrollLock } from '@/hooks/useScrollLock';
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

/** A muted looping video that opens fullscreen, with a glass quote card over its bottom edge. */
const TestimonialFeature = ({
  videoSrc,
  poster,
  quote,
  name,
  role,
  floater = yellowCoral,
}: TestimonialFeatureProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // The MP4 is only requested as the section nears the viewport; the poster covers until then.
  const isNear = useInView(sectionRef, { once: true, margin: '200px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  // The card slowly rotates into place as the section scrolls through, without moving; the
  // floater settles with it, on the video's bottom edge.
  const cardRotate = useTransform(scrollYProgress, [0, 0.6], [-6, 0]);
  const floaterY = useTransform(scrollYProgress, [0, 0.6], [16, 0]);

  useEscapeKey(() => setIsLightboxOpen(false), isLightboxOpen);
  useScrollLock(isLightboxOpen);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const video = lightboxVideoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    video.play().catch(() => {});
  }, [isLightboxOpen]);

  const openLightbox = () => setIsLightboxOpen(true);
  const closeLightbox = () => setIsLightboxOpen(false);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div
        className={styles.media}
        onClick={openLightbox}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLightbox();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Play video fullscreen"
      >
        <video
          className={styles.video}
          src={isNear ? videoSrc : undefined}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

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

      {isLightboxOpen &&
        createPortal(
          <div className={styles.lightboxBackdrop} onClick={closeLightbox}>
            <button
              type="button"
              className={styles.lightboxCloseButton}
              onClick={(event) => {
                event.stopPropagation();
                closeLightbox();
              }}
              aria-label="Close video"
            >
              <FiX />
            </button>
            <div className={styles.lightboxContent} onClick={(event) => event.stopPropagation()}>
              <video
                ref={lightboxVideoRef}
                className={styles.lightboxVideo}
                src={videoSrc}
                autoPlay
                controls
                playsInline
              />
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default TestimonialFeature;
