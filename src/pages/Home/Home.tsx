import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import '@/styles/global.css';

import HomeHero from './components/HomeHero/HomeHero';
import Statement from './components/Statement/Statement';
import ClientLogos from '@/components/ClientLogos/ClientLogos';
import TestimonialSizzle from '@/components/TestimonialSizzle/TestimonialSizzle';
import BottomCTA from './components/BottomCTA/BottomCTA';
import ProductCard from '@/components/ProductCard/ProductCard';

import { products as allProducts } from '@/data/products';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { pageMeta } from '@/config/seo';

const Home = () => {
  useDocumentMeta(pageMeta.home);

  // Memoize random product selection to prevent recalculation on every render
  const randomProducts = useMemo(() => {
    // Six fills two rows of the three-column grid.
    return [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 6);
  }, []); // Only calculate once on mount

  return (
    <>
      <div className={styles.fitted}>
        <HomeHero />
        <Statement />
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
    </>
  );
};

export default Home;
