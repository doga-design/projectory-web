import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'framer-motion';
import { products } from '@/data/products';
import type { Product } from '@/types/product';
import Button from '@/components/Button/Button';
import CloudinaryImage from '@/components/CloudinaryImage/CloudinaryImage';
import { optimizeCloudinaryUrl } from '@/utils/cloudinaryHelpers';
import styles from './FeaturedCarousel.module.css';

/** How long each product stays up before it fades out. */
const SLIDE_MS = 5000;
/** Fade-out and fade-in duration; handed to the CSS as --fade. */
const FADE_MS = 600;

const imageUrl = (product: Product) =>
  optimizeCloudinaryUrl(product.thumbnail, 'f_auto,q_auto,w_1200');

const FeaturedCarousel = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const [index, setIndex] = useState(0);
  const [showing, setShowing] = useState(true);
  const [imageHovered, setImageHovered] = useState(false);
  // A keyboard user on Learn More.
  const [focused, setFocused] = useState(false);
  const paused = !inView || imageHovered || focused;

  const product = products[index];

  // Hold the product, then fade it out.
  useEffect(() => {
    if (!showing || paused) return;
    const id = window.setTimeout(() => setShowing(false), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, showing, paused]);

  // Once it has faded out, swap in the next one and fade back in. Not gated on
  // `paused`, so a hover mid-fade can't leave the section blank.
  useEffect(() => {
    if (showing) return;
    const id = window.setTimeout(() => {
      setIndex((i) => (i + 1) % products.length);
      setShowing(true);
    }, FADE_MS);
    return () => window.clearTimeout(id);
  }, [showing]);

  // Warm the cache with the next image so it's ready when it fades in.
  useEffect(() => {
    new Image().src = imageUrl(products[(index + 1) % products.length]);
  }, [index]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Featured products"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div
        className={`${styles.slide}${showing ? '' : ` ${styles.faded}`}`}
        style={{ '--fade': `${FADE_MS}ms` } as CSSProperties}
      >
        {/* Every product's copy sits in the same cell, so the column is always as
            tall as the longest headline and the page never jumps between slides. */}
        <div className={styles.slides}>
          {products.map((p, i) => {
            const isActive = i === index;
            return (
              <div
                key={p.id}
                className={`${styles.copy}${isActive ? ` ${styles.copyActive}` : ''}`}
                inert={!isActive}
              >
                <h2 className={styles.headline}>{p.shortDescription}</h2>
                <p className={styles.name} style={{ color: p.categoryColor }}>
                  {p.category}
                  {p.categoryHighlight && <strong>{p.categoryHighlight}</strong>}
                </p>
                <Button
                  variant="outline"
                  size="small"
                  to={`/products/${p.id}`}
                  className={styles.button}
                >
                  Learn More
                </Button>
              </div>
            );
          })}
        </div>

        {/* Duplicates Learn More for pointer users, so it's kept out of the tab order. */}
        <Link
          to={`/products/${product.id}`}
          className={styles.media}
          tabIndex={-1}
          aria-hidden
          onMouseEnter={() => setImageHovered(true)}
          onMouseLeave={() => setImageHovered(false)}
        >
          <CloudinaryImage src={imageUrl(product)} alt="" className={styles.image} />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
