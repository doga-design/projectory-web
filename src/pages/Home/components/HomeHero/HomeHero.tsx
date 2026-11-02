import { useEffect, useRef, useState, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import Button from '@/components/Button/Button';
import { coralBurgundy, coralTeal } from '@/assets/images/shapes/floaters';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useScrollLock } from '@/hooks/useScrollLock';
import CustomCursor from '../CustomCursor/CustomCursor';
import HomeShape from '../HomeShape/HomeShape';
import { hero } from '../../homeData';
import { useHomeEntrance } from './useHomeEntrance';
import styles from './HomeHero.module.css';

const RISE_EASE = (t: number) => 1 - Math.pow(1 - t, 4);
const RISE_DURATION = 0.8;
const FADE_DURATION = 0.7;
const SHAPE_DURATION = 1;
/** The custom cursor is for real pointers on wide layouts, as it always was on Home. */
const CURSOR_MEDIA = '(max-width: 1024px)';

const useFadeUp = (time: MotionValue<number>, start: number) => {
  const range = [start, start + FADE_DURATION];
  const opacity = useTransform(time, range, [0, 1]);
  const y = useTransform(time, range, [14, 0], { ease: RISE_EASE });
  return { opacity, y };
};

/** A headline line rising out of its own mask. */
const RiseLine = ({
  time,
  start,
  children,
}: {
  time: MotionValue<number>;
  start: number;
  children: ReactNode;
}) => {
  const y = useTransform(time, [start, start + RISE_DURATION], ['110%', '0%'], { ease: RISE_EASE });
  return (
    <span className={styles.titleLine}>
      <motion.span className={styles.titleText} style={{ y }}>
        {children}
      </motion.span>
    </span>
  );
};

/** Drifts a shape in from off-screen, turning as it settles. Also sets its size and place. */
const ShapeEntrance = ({
  time,
  start,
  from,
  className,
  children,
}: {
  time: MotionValue<number>;
  start: number;
  from: { x: number; y: number; rotate: number };
  className: string;
  children: ReactNode;
}) => {
  const range = [start, start + SHAPE_DURATION];
  const opacity = useTransform(time, [start, start + 0.3], [0, 1]);
  const x = useTransform(time, range, [from.x, 0], { ease: RISE_EASE });
  const y = useTransform(time, range, [from.y, 0], { ease: RISE_EASE });
  const rotate = useTransform(time, range, [from.rotate, 0], { ease: RISE_EASE });
  return (
    <motion.div className={className} style={{ opacity, x, y, rotate }}>
      {children}
    </motion.div>
  );
};

const HomeHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const [cursorOff, setCursorOff] = useState(() => window.matchMedia(CURSOR_MEDIA).matches);

  const { mode, time, timeline, finished, stageStyle, reelStyle } = useHomeEntrance(frameRef);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const description = useFadeUp(time, timeline.description);
  const buttons = useFadeUp(time, timeline.buttons);

  // The phone entrance only. On desktop the pull-back moves the frame instead.
  const frameStart = timeline.frame ?? 0;
  const frameRange = [frameStart, frameStart + RISE_DURATION];
  const phoneFrameOpacity = useTransform(time, [frameStart, frameStart + 0.4], [0, 1]);
  const phoneFrameY = useTransform(time, frameRange, [36, 0], { ease: RISE_EASE });
  const phoneFrameScale = useTransform(time, frameRange, [0.96, 1], { ease: RISE_EASE });
  const frameStyle =
    mode === 'simple'
      ? { opacity: phoneFrameOpacity, y: phoneFrameY, scale: phoneFrameScale }
      : undefined;

  useEscapeKey(() => setIsLightboxOpen(false));
  useScrollLock(isLightboxOpen);

  useEffect(() => {
    const media = window.matchMedia(CURSOR_MEDIA);
    const sync = () => setCursorOff(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  // Play when ready and when in view: phones often block play() until it's on screen.
  useEffect(() => {
    const video = videoRef.current;
    const frame = frameRef.current;
    if (!video || !frame) return;

    const attemptPlay = () => {
      if (video.readyState < 2) return;
      video.play().catch(() => setNeedsTapToPlay(true));
    };
    const onPlaying = () => setNeedsTapToPlay(false);

    video.addEventListener('canplay', attemptPlay);
    video.addEventListener('loadeddata', attemptPlay);
    video.addEventListener('playing', onPlaying);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) attemptPlay();
      },
      { threshold: 0.25 }
    );
    observer.observe(frame);

    return () => {
      video.removeEventListener('canplay', attemptPlay);
      video.removeEventListener('loadeddata', attemptPlay);
      video.removeEventListener('playing', onPlaying);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero}>
      <ShapeEntrance
        time={time}
        start={timeline.shapes[0]}
        from={{ x: -220, y: -60, rotate: -40 }}
        className={styles.shapeTopLeft}
      >
        <HomeShape
          src={coralTeal}
          progress={scrollYProgress}
          x={[0, -60]}
          y={[0, -30]}
          rotate={[-25, -50]}
        />
      </ShapeEntrance>

      <div className={styles.text}>
        <h1 className={styles.title}>
          {hero.titleLines.map((line, i) => (
            <RiseLine key={line} time={time} start={timeline.title[i]}>
              {line}{' '}
            </RiseLine>
          ))}
        </h1>
        <motion.p className={styles.description} style={description}>
          {hero.description}
        </motion.p>
        <motion.div className={styles.buttons} style={buttons}>
          <Button variant="coral" to={hero.primaryCta.to}>
            {hero.primaryCta.label}
          </Button>
          <Button variant="outline" to={hero.secondaryCta.to}>
            {hero.secondaryCta.label}
          </Button>
        </motion.div>
      </div>

      <div className={styles.frameBox}>
        <motion.div
          ref={frameRef}
          className={styles.frame}
          style={frameStyle}
          onClick={() => {
            // The first click of the entrance only finishes it.
            if (finished) setIsLightboxOpen(true);
          }}
        >
          <motion.div className={styles.stage} style={stageStyle}>
            <motion.div className={styles.reel} style={reelStyle}>
              <video
                ref={videoRef}
                className={styles.video}
                src={hero.reelSrc}
                poster={hero.reelPoster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </motion.div>
          </motion.div>
          {needsTapToPlay && (
            <button
              type="button"
              className={styles.tapToPlay}
              onClick={(e) => {
                e.stopPropagation();
                videoRef.current
                  ?.play()
                  .then(() => setNeedsTapToPlay(false))
                  .catch(() => {});
              }}
              aria-label="Play video"
            />
          )}
          <CustomCursor targetRef={frameRef} isMobile={cursorOff || !finished} />
        </motion.div>

        <ShapeEntrance
          time={time}
          start={timeline.shapes[1]}
          from={{ x: 200, y: -120, rotate: 50 }}
          className={styles.shapeFrameCorner}
        >
          <HomeShape
            src={coralBurgundy}
            progress={scrollYProgress}
            x={[0, 50]}
            y={[0, -36]}
            rotate={[210, 245]}
            floatDelay={0.7}
          />
        </ShapeEntrance>
      </div>

      {isLightboxOpen &&
        ReactDOM.createPortal(
          <div className={styles.lightboxBackdrop} onClick={() => setIsLightboxOpen(false)}>
            <button
              type="button"
              className={styles.lightboxClose}
              aria-label="Close video"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
            >
              <FiX />
            </button>
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <video
                className={styles.lightboxVideo}
                src={hero.reelSrc}
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

export default HomeHero;
