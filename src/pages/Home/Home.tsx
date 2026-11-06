import { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
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
  const videoSlidesRef = useRef<HTMLDivElement>(null);
  const middleVideoRef = useRef<HTMLVideoElement>(null);
  const middleVideoSlideRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? isMobileWidth() : false
  );
  const reducedMotion = useReducedMotion();
  // One video and no scroll animation. Home.module.css matches this for the layout.
  const isStaticHero = isMobile || !!reducedMotion;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  // Starts true: the page opens on the hero, and the first report would otherwise pause the videos.
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [middleVideoNeedsTapToPlay, setMiddleVideoNeedsTapToPlay] = useState(false);

  // Check screen size to disable animations on mobile - run first
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(isMobileWidth());
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setIsHeroInView(entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEscapeKey(() => setIsLightboxOpen(false), isLightboxOpen);

  useScrollLock(isLightboxOpen);

  // The lightbox is portalled outside #root, so this leaves only it reachable by keyboard. Focus
  // goes to the dialog, not the close button, which would open with a focus ring around it.
  useEffect(() => {
    const root = document.getElementById('root');
    if (!isLightboxOpen || !root) return;
    root.inert = true;
    lightboxRef.current?.focus();
    return () => {
      root.inert = false;
    };
  }, [isLightboxOpen]);

  // On phones the WhatsApp bubble would cover Explore Products, so it waits until the hero has gone.
  useEffect(() => {
    const phone = window.matchMedia('(max-width: 768px)');
    const sync = () =>
      document.body.classList.toggle('hide-whatsapp', phone.matches && isHeroInView);
    sync();
    phone.addEventListener('change', sync);
    return () => {
      phone.removeEventListener('change', sync);
      document.body.classList.remove('hide-whatsapp');
    };
  }, [isHeroInView]);

  // The videos only play while they can be seen, retrying as they load: some browsers block
  // autoplay until then.
  const shouldPlayVideos = isHeroInView && !isLightboxOpen;
  useEffect(() => {
    const videos = Array.from(videoSlidesRef.current?.querySelectorAll('video') ?? []);
    if (!shouldPlayVideos) {
      videos.forEach((video) => video.pause());
      return;
    }

    const attemptPlay = (video: HTMLVideoElement) => {
      if (video.readyState < 2) return;
      video.play().catch((error: DOMException) => {
        // Autoplay really blocked (power saving, strict browser). Any other rejection is only a
        // play() interrupted by a pause.
        if (error.name === 'NotAllowedError' && video === middleVideoRef.current) {
          setMiddleVideoNeedsTapToPlay(true);
        }
      });
    };
    const onLoaded = (event: Event) => attemptPlay(event.currentTarget as HTMLVideoElement);

    videos.forEach((video) => {
      attemptPlay(video);
      video.addEventListener('canplay', onLoaded);
      video.addEventListener('loadeddata', onLoaded);
    });
    return () => {
      videos.forEach((video) => {
        video.removeEventListener('canplay', onLoaded);
        video.removeEventListener('loadeddata', onLoaded);
      });
    };
    // isStaticHero adds or removes the side videos.
  }, [shouldPlayVideos, isStaticHero]);

  // Scroll animations (off for the static hero). Read from the hero's own section, so they
  // don't shift whenever the page below it changes length. The end points keep the
  // distances they always had on a 1440×900 screen.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.83], isStaticHero ? [1, 1] : [1, 0]);
  // Faded out, the buttons mustn't still catch clicks and keyboard focus.
  const contentVisibility = useTransform(contentOpacity, (opacity) =>
    opacity > 0 ? 'visible' : 'hidden'
  );
  const slidesScale = useTransform(scrollYProgress, [0, 0.66], isStaticHero ? [1, 1] : [1.2, 0.4]);
  const iconScale = useTransform(scrollYProgress, [0, 0.66], isStaticHero ? [1, 1] : [5, 1]);

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
            ref={videoSlidesRef}
            id="home-video-slides"
            className={styles.videoSlides}
            style={{ scale: slidesScale }}
          >
            {!isStaticHero && (
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
                onPlaying={() => setMiddleVideoNeedsTapToPlay(false)}
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
                  <span className={styles.tapToPlayText}>Tap to Play</span>
                </button>
              )}
              <CustomCursor targetRef={middleVideoSlideRef} isMobile={isMobile} />
            </div>
            {!isStaticHero && (
              <div className={styles.videoSlide}>
                <video
                  src="https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1746457030/Align_by_Line_Website_IP_V5_Final_Colour_Pass_nzfmxp.mp4"
                  {...commonVideoProps}
                />
              </div>
            )}
          </motion.div>

          {!isStaticHero && (
            <motion.div className={styles.iconShapes} style={{ scale: iconScale }}>
              <img src={icon1} alt="" className={styles.icon} />
              <img src={icon2} alt="" className={styles.icon} />
              <img src={icon3} alt="" className={styles.icon} />
              <img src={icon4} alt="" className={styles.icon} />
            </motion.div>
          )}

          <motion.div
            className={styles.heroShade}
            style={{ opacity: contentOpacity }}
            aria-hidden
          />

          <motion.div
            className={styles.content}
            style={{ opacity: contentOpacity, visibility: contentVisibility }}
          >
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
          <div
            ref={lightboxRef}
            className={styles.lightboxBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label="Projectory reel"
            tabIndex={-1}
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              className={styles.lightboxCloseButton}
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
