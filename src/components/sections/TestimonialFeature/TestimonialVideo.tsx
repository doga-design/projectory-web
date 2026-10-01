import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useInView, useMotionValue } from 'framer-motion';
import { FiMaximize, FiMinimize, FiPause, FiPlay, FiVolume2, FiVolumeX } from 'react-icons/fi';
import styles from './TestimonialVideo.module.css';

interface TestimonialVideoProps {
  src: string;
  /** First frame, shown until the video loads. */
  poster: string;
}

/** A mouse, not a finger: only these get the unmute cursor and hover-revealed controls. */
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/** On touch, how long the controls stay up after a tap before sliding away. */
const CONTROLS_MS = 3000;

type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * Plays inline as a muted loop. The first unmute restarts it from the top with sound and
 * stops the loop. With a mouse, the cursor over the muted video is the unmute button; on touch,
 * tapping the video plays/pauses it and brings the controls up for a few seconds.
 */
const TestimonialVideo = ({ src, poster }: TestimonialVideoProps) => {
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fine, setFine] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [controlsUp, setControlsUp] = useState(false);
  // Brief centre icon confirming a play/pause the viewer just did.
  const [flash, setFlash] = useState<{ key: number; nowPlaying: boolean } | null>(null);
  const controlsTimer = useRef<number>(undefined);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // The MP4 is only requested as the video nears the viewport; the poster covers until then.
  const isNear = useInView(mediaRef, { once: true, margin: '200px' });
  const inView = useInView(mediaRef);

  useEffect(() => {
    const mq = window.matchMedia(FINE_POINTER);
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === mediaRef.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => () => window.clearTimeout(controlsTimer.current), []);

  // Touch only: (re)starts the countdown, so using a control keeps them up.
  const showControls = () => {
    setControlsUp(true);
    window.clearTimeout(controlsTimer.current);
    controlsTimer.current = window.setTimeout(() => setControlsUp(false), CONTROLS_MS);
  };

  // Don't keep talking once it's scrolled away. The muted preview just keeps looping.
  useEffect(() => {
    const video = videoRef.current;
    if (!inView && video && !video.muted && !video.paused) video.pause();
  }, [inView]);

  const unmute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!started) {
      video.currentTime = 0;
      setStarted(true);
    }
    video.muted = false;
    setMuted(false);
    video.play().catch(() => {});
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.muted) {
      video.muted = true;
      setMuted(true);
    } else unmute();
  };

  // A new key each time, so repeated toggles replay the flash from the start.
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    setFlash({ key: Date.now(), nowPlaying: !video.paused });
  };

  const toggleFullscreen = () => {
    const media = mediaRef.current;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (media?.requestFullscreen) media.requestFullscreen().catch(() => {});
    // iPhone has no element fullscreen; hand the video to the native player instead.
    else (videoRef.current as WebkitVideo | null)?.webkitEnterFullscreen?.();
  };

  const showCursor = fine && muted && hovering && !fullscreen;

  return (
    <div
      ref={mediaRef}
      className={[
        styles.media,
        showCursor && styles.unmuteCursor,
        !playing && styles.paused,
        controlsUp && styles.controlsUp,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => {
        if (!fine) {
          togglePlay();
          showControls();
        } else if (muted) unmute();
        else togglePlay();
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        // Over the buttons the pointer goes back to normal.
        setHovering(!(e.target as Element).closest(`.${styles.controls}`));
      }}
      onPointerLeave={() => setHovering(false)}
    >
      <video
        ref={videoRef}
        className={styles.video}
        src={isNear ? src : undefined}
        poster={poster}
        autoPlay
        muted
        loop={!started}
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div
        className={styles.controls}
        onClick={(e) => {
          e.stopPropagation();
          if (!fine) showControls();
        }}
      >
        <button
          type="button"
          className={styles.control}
          onClick={togglePlay}
          aria-label={playing ? 'Pause video' : 'Play video'}
        >
          {playing ? <FiPause /> : <FiPlay />}
        </button>
        <button
          type="button"
          className={styles.control}
          onClick={toggleMute}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? <FiVolumeX /> : <FiVolume2 />}
        </button>
        <button
          type="button"
          className={styles.control}
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? <FiMinimize /> : <FiMaximize />}
        </button>
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.key}
            className={styles.flash}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.85, 1, 1, 1.08] }}
            transition={{ duration: 0.7, times: [0, 0.25, 0.6, 1], ease: 'easeOut' }}
            onAnimationComplete={() => setFlash(null)}
            aria-hidden
          >
            {flash.nowPlaying ? <FiPlay /> : <FiPause />}
          </motion.div>
        )}
      </AnimatePresence>

      {createPortal(
        <AnimatePresence>
          {showCursor && (
            <motion.div
              className={styles.cursor}
              style={{ x: cursorX, y: cursorY }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              aria-hidden
            >
              <FiVolumeX />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default TestimonialVideo;
