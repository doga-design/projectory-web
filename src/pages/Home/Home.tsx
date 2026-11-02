import { useRef, useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';
import styles from './Home.module.css';
import '@/styles/global.css';

import ContactButton from './components/ContactButton/ContactButton';
import ClientLogos from '@/components/ClientLogos/ClientLogos';
import TestimonialSizzle from '@/components/TestimonialSizzle/TestimonialSizzle';
import BottomCTA from './components/BottomCTA/BottomCTA';
import ProductCard from '@/components/ProductCard/ProductCard';
import CustomCursor from './components/CustomCursor/CustomCursor';

import { products as allProducts } from '@/data/products';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useScrollLock } from '@/hooks/useScrollLock';
import icon1 from '@/assets/images/shapes/pMonograms/Projectory_GradientSymbol_Apricot_15.svg';
import icon2 from '@/assets/images/shapes/abstract/Projectory_AbstractSymbol_3.svg';
import icon3 from '@/assets/images/shapes/abstract/Projectory_AbstractSymbol_5.svg';
import icon4 from '@/assets/images/shapes/abstract/Projectory_AbstractSymbol_6.svg';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { pageMeta } from '@/config/seo';

const Home = () => {
  useDocumentMeta(pageMeta.home);

  const secondSectionRef = useRef<HTMLDivElement>(null);
  const middleVideoRef = useRef<HTMLVideoElement>(null);
  const middleVideoSlideRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 764 : false
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [middleVideoNeedsTapToPlay, setMiddleVideoNeedsTapToPlay] = useState(false);
  const setMiddleVideoNeedsTapToPlayRef = useRef(setMiddleVideoNeedsTapToPlay);
  setMiddleVideoNeedsTapToPlayRef.current = setMiddleVideoNeedsTapToPlay;

  const { ref: sizzleRef, inView: sizzleInView } = useInView({
    triggerOnce: true,
    rootMargin: '300px',
  });

  // Check screen size to disable animations on mobile - run first
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 1024);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle ESC key to close lightbox. Always active, matching the previous
  // effect's empty dependency array.
  useEscapeKey(() => setIsLightboxOpen(false));

  useScrollLock(isLightboxOpen);

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

  // Scroll animations (disabled on mobile)
  const { scrollYProgress } = useScroll();
  const contentOpacity = useTransform(scrollYProgress, [0, 0.25], isMobile ? [1, 1] : [1, 0]);
  const slidesScale = useTransform(scrollYProgress, [0, 0.2], isMobile ? [1, 1] : [1.2, 0.4]);
  const iconScale = useTransform(scrollYProgress, [0, 0.2], isMobile ? [1, 1] : [5, 1]);

  // Second section scroll animations
  const { scrollYProgress: secondScrollProgress } = useScroll({
    target: secondSectionRef,
    offset: ['start start', 'end start'],
  });

  const textColor1 = useTransform(
    secondScrollProgress,
    [0, 0.2, 0.3],
    ['var(--background-dark-gray)', 'white', 'var(--background-dark-gray)']
  );
  const textColor2 = useTransform(
    secondScrollProgress,
    [0.2, 0.3, 0.4],
    ['var(--background-dark-gray)', 'white', 'var(--background-dark-gray)']
  );
  const textColor3 = useTransform(
    secondScrollProgress,
    [0.3, 0.4, 0.5],
    ['var(--background-dark-gray)', 'white', 'var(--background-dark-gray)']
  );
  const textColor4 = useTransform(
    secondScrollProgress,
    [0.4, 0.5, 0.6],
    ['var(--background-dark-gray)', 'white', 'var(--background-dark-gray)']
  );
  const textColor5 = useTransform(
    secondScrollProgress,
    [0.5, 0.6, 0.7],
    ['var(--background-dark-gray)', 'white', 'var(--background-dark-gray)']
  );
  const textColor6 = useTransform(
    secondScrollProgress,
    [0.6, 0.7, 0.8],
    ['var(--background-dark-gray)', 'white', 'var(--background-dark-gray)']
  );
  const textColor7 = useTransform(
    secondScrollProgress,
    [0.7, 0.8],
    ['var(--background-dark-gray)', 'transparent']
  );
  const textShadow7 = useTransform(
    secondScrollProgress,
    [0.7, 0.8],
    [
      '0.1px 0.1px 0 var(--background-dark-gray), -0.1px 0.1px 0 var(--background-dark-gray), -0.1px -0.1px 0 var(--background-dark-gray), 0.1px -0.1px 0 var(--background-dark-gray)',
      'none',
    ]
  );

  // Memoize random product selection to prevent recalculation on every render
  const randomProducts = useMemo(() => {
    // Six fills two rows of the three-column grid.
    return [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 6);
  }, []); // Only calculate once on mount

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
      <div className={styles.wrapper}>
        <motion.div className={styles.homeSection}>
          <motion.div className={styles.content} style={{ opacity: contentOpacity }}>
            <h1>
              Less Talking Heads, <br /> More Heads Talking.
            </h1>
            <ContactButton />
          </motion.div>

          <motion.div
            id="home-video-slides"
            className={styles.videoSlides}
            style={{ scale: slidesScale }}
          >
            {!isMobile && (
              <div className={styles.videoSlide}>
                <video
                  className={styles.videoBackground}
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
                className={styles.videoBackground}
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
                ></button>
              )}
              <CustomCursor targetRef={middleVideoSlideRef} isMobile={isMobile} />
            </div>
            {!isMobile && (
              <div className={styles.videoSlide}>
                <video
                  className={styles.videoBackground}
                  src="https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1746457030/Align_by_Line_Website_IP_V5_Final_Colour_Pass_nzfmxp.mp4"
                  {...commonVideoProps}
                />
              </div>
            )}
          </motion.div>

          <motion.div className={styles.iconShapes} style={{ scale: iconScale }}>
            <img src={icon1} alt="Icon 1" className={styles.icon} />
            <img src={icon2} alt="Icon 2" className={styles.icon} />
            <img src={icon3} alt="Icon 3" className={styles.icon} />
            <img src={icon4} alt="Icon 4" className={styles.icon} />
          </motion.div>
        </motion.div>
      </div>

      {/* Second Section */}
      <div ref={secondSectionRef} className={styles.secondWrapper}>
        <motion.div className={styles.secondSection}>
          <motion.p className={styles.text} style={{ color: textColor1 }}>
            Event attendees don’t want to just sit and listen.
          </motion.p>
          <motion.p className={styles.text} style={{ color: textColor2 }}>
            Forget stretch breaks and unstructured happy hours.
          </motion.p>
          <motion.p className={styles.text} style={{ color: textColor3 }}>
            Attendees want more meaningful interactions,
          </motion.p>
          <motion.p className={styles.text} style={{ color: textColor4 }}>
            deeper connections, and better conversations.
          </motion.p>
          <motion.p className={styles.text} style={{ color: textColor5 }}>
            They want real engagement – and more of it.
          </motion.p>
          <motion.p className={styles.text} style={{ color: textColor6 }}>
            The future of events is clearly experiential.
          </motion.p>
          <motion.p
            className={`${styles.text} ${styles.gradientText}`}
            style={{ color: textColor7, textShadow: textShadow7 }}
          >
            We’re here to create it with you. Now.
          </motion.p>
        </motion.div>
      </div>

      {/* Main Video Section */}
      <div ref={sizzleRef} className={styles.mainSizzleWrapper}>
        <div className={styles.mainSizzle}>
          {sizzleInView && (
            <video
              className={styles.mainSizzleVideo}
              src="https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1749521688/Website_Testimonials_Dec_2024_V4_jsyqfo_mb8c7q.mp4"
              {...commonVideoProps}
              controls
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
      </div>

      {/* Secondary Section */}
      <div className={styles.secondarySizzleWrapper}>
        <div className={styles.secondarySizzle}>
          <div className={styles.secondarySizzleTitle}>
            <h5>What We Do</h5>
            <h2>
              Interactive. Integrated <br /> Unexpected.
            </h2>
            <h4>
              Projectory creates tangible, data-rich experiences that enhance in-person events,
              helping organizers extend the value of their programs and make info-dense events,
              well, less boring. Find some of our featured products below, or explore all of them in
              depth.
            </h4>
          </div>

          <div className={styles.productsGrid}>
            {randomProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
          <Link to="/products" className={styles.btnOutlinePrimary}>
            See All Products
          </Link>
        </div>
      </div>

      <div className={styles.clientLogosWrapper}>
        <ClientLogos background="transparent" />
      </div>

      <TestimonialSizzle
        videoSrc="https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1749521688/Website_Testimonials_Dec_2024_V4_jsyqfo_mb8c7q.mp4"
        quote='"Projectory helped bring our conference to life. As soon as I heard they took the analog experience and could make it read out results for us, I was blown away."'
        author="Sandy Sharman"
        role="Group Head, People Culture & Brand, CIBC"
      />

      <BottomCTA
        title="Yawn-Proof Your Events."
        text="Projectory turns half-listening attendees into active participants – the kind who engage with your content, make valuable connections, contribute to the conversation, and take responsibility for real next steps."
        buttonText="Get Started"
        buttonLink="/get-started"
      />

      {isLightboxOpen &&
        ReactDOM.createPortal(
          <div className={styles.lightboxBackdrop} onClick={() => setIsLightboxOpen(false)}>
            <button
              className={styles.lightboxCloseButton}
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
