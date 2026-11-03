import { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiPlay, FiX } from 'react-icons/fi';
import styles from './Home.module.css';
import '@/styles/global.css';

import Button from '@/components/Button/Button';
import Statement from './components/Statement/Statement';
import LogoGrid from '@/components/sections/LogoGrid/LogoGrid';
import ProductShowcase from '@/components/sections/ProductShowcase/ProductShowcase';
import ShapeCta from '@/components/sections/ShapeCta/ShapeCta';
import TestimonialFeature from '@/components/sections/TestimonialFeature/TestimonialFeature';
import CustomCursor from './components/CustomCursor/CustomCursor';

import { productsByName } from '@/data/products';
import { brands, testimonial, whatWeDo, yawnProof } from './homeData';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useScrollLock } from '@/hooks/useScrollLock';
import icon1 from '@/assets/images/shapes/pMonograms/Projectory_GradientSymbol_Apricot_15.svg';
import icon2 from '@/assets/images/shapes/abstract/Projectory_AbstractSymbol_3.svg';
import icon3 from '@/assets/images/shapes/abstract/Projectory_AbstractSymbol_5.svg';
import icon4 from '@/assets/images/shapes/abstract/Projectory_AbstractSymbol_6.svg';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { pageMeta } from '@/config/seo';

/** At and below this width the hero is a single video with no scroll animation. */
const isMobileWidth = () => window.innerWidth <= 1024;

const Home = () => {
  useDocumentMeta(pageMeta.home);

  const heroRef = useRef<HTMLDivElement>(null);
  const middleVideoRef = useRef<HTMLVideoElement>(null);
  const middleVideoSlideRef = useRef<HTMLDivElement>(null);
  const reelButtonRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? isMobileWidth() : false
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [middleVideoNeedsTapToPlay, setMiddleVideoNeedsTapToPlay] = useState(false);
  const setMiddleVideoNeedsTapToPlayRef = useRef(setMiddleVideoNeedsTapToPlay);
  setMiddleVideoNeedsTapToPlayRef.current = setMiddleVideoNeedsTapToPlay;

  // Check screen size to disable animations on mobile - run first
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(isMobileWidth());
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle ESC key to close lightbox. Always active, matching the previous
  // effect's empty dependency array.
  useEscapeKey(() => setIsLightboxOpen(false));

  useScrollLock(isLightboxOpen);

  // Closing the lightbox hands focus back to where a keyboard user opened it.
  useEffect(() => {
    if (!isLightboxOpen) return;
    const reelButton = reelButtonRef.current;
    return () => reelButton?.focus({ preventScroll: true });
  }, [isLightboxOpen]);

  // Handle middle video: play when in view (fixes mobile autoplay) and when ready
  useEffect(() => {
    const video = middleVideoRef.current;
    const container = middleVideoSlideRef.current;
    if (!video || !container) return;

    const attemptPlay = () => {
      if (video.readyState >= 2) {
        video.play().catch(() => {
          // Autoplay blocked (power saving, strict browser, etc.) — show "Tap to play"
          setMiddleVideoNeedsTapToPlayRef.current?.(true);
        });
      }
    };

    const handleCanPlay = () => attemptPlay();
    const handleLoadedData = () => attemptPlay();
    const handlePlaying = () => setMiddleVideoNeedsTapToPlayRef.current?.(false);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('playing', handlePlaying);

    // On mobile, play() is often blocked unless the video is in view — use Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) attemptPlay();
      },
      { threshold: 0.25, rootMargin: '0px' }
    );
    observer.observe(container);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('playing', handlePlaying);
      observer.disconnect();
    };
  }, []);

  // Scroll animations (disabled on mobile). Read from the hero's own section, so they
  // don't shift whenever the page below it changes length. The end points keep the
  // distances they always had on a 1440×900 screen.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.83], isMobile ? [1, 1] : [1, 0]);
  const slidesScale = useTransform(scrollYProgress, [0, 0.66], isMobile ? [1, 1] : [1.2, 0.4]);
  const iconScale = useTransform(scrollYProgress, [0, 0.66], isMobile ? [1, 1] : [5, 1]);

  // Common video props
  const commonVideoProps = {
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: 'metadata' as const,
  };

  return (
    <>
      {/* First Section */}
      <div ref={heroRef} className={styles.wrapper}>
        <motion.div className={styles.homeSection}>
          <motion.div
            id="home-video-slides"
            className={styles.videoSlides}
            style={{ scale: slidesScale }}
          >
            {!isMobile && (
              <div className={styles.videoSlide}>
                <video
                  src="https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1746457021/Flag_Finder_Website_IP_V4_leeta4.mp4"
                  {...commonVideoProps}
                />
              </div>
            )}
            <div
              ref={middleVideoSlideRef}
              className={`${styles.videoSlide} ${styles.middleVideoSlide}`}
              onClick={() => setIsLightboxOpen(true)}
            >
              <video
                ref={middleVideoRef}
                src="https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1769443947/Projectory_LandingVideo_t4wkon.mp4"
                {...commonVideoProps}
              />
              {middleVideoNeedsTapToPlay && (
                <button
                  type="button"
                  className={styles.tapToPlayOverlay}
                  onClick={(e) => {
                    e.stopPropagation();
                    middleVideoRef.current
                      ?.play()
                      .then(() => setMiddleVideoNeedsTapToPlay(false))
                      .catch(() => {});
                  }}
                  aria-label="Play video"
                >
                  <span className={styles.tapToPlayIcon}>
                    <FiPlay />
                  </span>
                  <span className={styles.tapToPlayText}>Tap to play</span>
                </button>
              )}
              {/* The slide's click is mouse and touch only; this is its keyboard way in. */}
              <button
                ref={reelButtonRef}
                type="button"
                className={styles.reelButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
              >
                See the whole reel
              </button>
              <CustomCursor targetRef={middleVideoSlideRef} isMobile={isMobile} />
            </div>
            {!isMobile && (
              <div className={styles.videoSlide}>
                <video
                  src="https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1746457030/Align_by_Line_Website_IP_V5_Final_Colour_Pass_nzfmxp.mp4"
                  {...commonVideoProps}
                />
              </div>
            )}
          </motion.div>

          <motion.div className={styles.iconShapes} style={{ scale: iconScale }}>
            <img src={icon1} alt="" className={styles.icon} />
            <img src={icon2} alt="" className={styles.icon} />
            <img src={icon3} alt="" className={styles.icon} />
            <img src={icon4} alt="" className={styles.icon} />
          </motion.div>

          <motion.div
            className={styles.heroShade}
            style={{ opacity: contentOpacity }}
            aria-hidden
          />

          <motion.div className={styles.content} style={{ opacity: contentOpacity }}>
            <h1 className={styles.heroTitle}>
              Less Talking Heads, <br /> More Heads Talking
            </h1>
            <div className={styles.heroButtons}>
              <Button variant="coral" size="small" to="/get-started">
                Get Started
              </Button>
              <Button variant="outline" size="small" to="/products#tagContent">
                Explore Products
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Statement />

      <ProductShowcase {...whatWeDo} products={productsByName} />

      <div className={styles.column}>
        <LogoGrid {...brands} />
        <TestimonialFeature {...testimonial} />
      </div>

      <ShapeCta {...yawnProof} />

      {isLightboxOpen &&
        ReactDOM.createPortal(
          <div className={styles.lightboxBackdrop} onClick={() => setIsLightboxOpen(false)}>
            <button
              className={styles.lightboxCloseButton}
              aria-label="Close video"
              autoFocus
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
                src="https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1769443947/Projectory_LandingVideo_t4wkon.mp4"
                autoPlay
                controls
                playsInline
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Home;
