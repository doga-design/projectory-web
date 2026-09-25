import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useInView } from 'framer-motion';
import { caseStudies, caseStudiesHeader } from '../../pricingData';
import Button from '@/components/Button/Button';
import styles from './CaseStudies.module.css';

/**
 * The accent cycled through the case-study pills, one hue per study.
 *
 * These were hardcoded hexes, and two of them were the only place their
 * colour existed: a second lime 13/255 off --brand-lime, and a violet absent
 * from the palette entirely. Both now come from the tokens — the violet as
 * itself, the stray lime folded into the one lime.
 */
const ACCENTS = [
  'var(--brand-yellow)',
  'var(--brand-teal)',
  'var(--brand-coral)',
  'var(--brand-violet)',
  'var(--brand-lime)',
] as const;

/** How long each study stays up before the next one takes over. */
const CYCLE_MS = 6000;

const CaseStudies = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyed on `selectedIndex`, so a click also restarts the clock from the clicked tab.
  useEffect(() => {
    if (!inView) return;
    const id = window.setTimeout(
      () => setSelectedIndex((i) => (i + 1) % caseStudies.length),
      CYCLE_MS
    );
    return () => window.clearTimeout(id);
  }, [selectedIndex, inView]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <p className={styles.eyebrow}>{caseStudiesHeader.eyebrow}</p>
          <h2 className={styles.title}>{caseStudiesHeader.heading}</h2>
        </div>
      </div>

      <div className={styles.pills} role="tablist" aria-label="Case study categories">
        {caseStudies.map((study, index) => {
          const isActive = index === selectedIndex;
          const pillAccent = ACCENTS[index % ACCENTS.length];
          return (
            <Button
              key={study.name}
              variant="outline"
              role="tab"
              aria-selected={isActive}
              className={`${styles.pill}${isActive ? ` ${styles.pillActive}` : ''}`}
              style={{ '--accent': pillAccent } as CSSProperties}
              onClick={() => setSelectedIndex(index)}
            >
              {study.name}
            </Button>
          );
        })}
      </div>

      {/* Every slide stays mounted and stacked, and switching tabs only changes
          which one is shown. Nothing remounts, so each image is fetched and
          decoded once, image and copy change in the same frame, and the panel
          keeps the height of the tallest study. */}
      <div className={styles.panel} role="tabpanel">
        <div className={styles.panelInner}>
          <div className={styles.media}>
            {caseStudies.map((study, index) => (
              <img
                key={study.name}
                src={study.image}
                alt=""
                loading="lazy"
                decoding="async"
                className={`${styles.image}${index === selectedIndex ? ` ${styles.imageActive}` : ''}`}
              />
            ))}
          </div>
          <div className={styles.slides}>
            {caseStudies.map((study, index) => {
              const isActive = index === selectedIndex;
              return (
                <div
                  key={study.name}
                  className={`${styles.copy}${isActive ? ` ${styles.copyActive}` : ''}`}
                  inert={!isActive}
                >
                  <h3 className={styles.heading} style={{ color: ACCENTS[index % ACCENTS.length] }}>
                    {study.heading}
                  </h3>
                  <p className={styles.description}>{study.description}</p>
                  <div className={styles.priceBlock}>
                    <div className={styles.priceTags}>
                      {study.tags.map((tag) => (
                        <span key={tag} className={styles.priceTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className={styles.priceValue}>
                      {study.price}
                      <span className={styles.priceCurrency}>{study.currency}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
