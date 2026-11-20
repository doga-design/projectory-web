import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'framer-motion';
import { caseStudiesData } from '@/data/caseStudies';
import Button from '@/components/Button/Button';
import CloudinaryImage from '@/components/CloudinaryImage/CloudinaryImage';
import styles from './CaseStudyFeature.module.css';

/** How long each study stays up before the next one fades in. */
const CYCLE_MS = 6000;

interface CaseStudyFeatureProps {
  eyebrow: string;
  /** Line breaks in the copy are kept. */
  title: string;
  /** The title's line breaks once it has the full width (stacked), if they differ. */
  titleWide?: string;
  cta: { label: string; to: string };
  /** The studies the card cycles through, in order; each one's headline, name
      and colour come from caseStudiesData. */
  studies: readonly { id: string; image: string }[];
}

/** A section intro beside one large, clickable case study card with its text
    on the image. The card cycles through the given studies. */
const CaseStudyFeature = ({
  eyebrow,
  title,
  titleWide = title,
  cta,
  studies,
}: CaseStudyFeatureProps) => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const [index, setIndex] = useState(0);
  // Mouse only, so a tap on touch can't leave the cycle stuck paused.
  const [hovered, setHovered] = useState(false);
  // A keyboard user on Learn More or the section's own button.
  const [focused, setFocused] = useState(false);
  const paused = !inView || hovered || focused;

  const slides = studies.flatMap(({ id, image }) => {
    const study = caseStudiesData.find((s) => s.id === id);
    return study ? [{ study, image, href: `/case-study/${study.id}` }] : [];
  });
  const count = slides.length;

  // Keyed on `index`, so each study gets its full time after a resume.
  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, count]);

  if (count === 0) return null;
  const active = slides[index % count];

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title}>
          <span className={styles.titleColumn}>{title}</span>
          <span className={styles.titleWide}>{titleWide}</span>
        </h2>
        <Button variant="pink" to={cta.to} className={styles.cta}>
          {cta.label}
        </Button>
      </div>

      <div
        className={styles.card}
        onClick={() => navigate(active.href)}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      >
        <div className={styles.media}>
          {slides.map(({ study, image }, i) => {
            const isActive = i === index;
            return (
              <CloudinaryImage
                key={study.id}
                className={`${styles.image}${isActive ? ` ${styles.imageActive}` : ''}`}
                src={image}
                alt={isActive ? study.name : ''}
                loading="lazy"
              />
            );
          })}
        </div>

        <div className={styles.content}>
          {/* Every study's copy sits in the same cell, so the card is always as
              tall as the longest headline and never resizes between studies. */}
          <div className={styles.slides}>
            {slides.map(({ study, href }, i) => {
              const isActive = i === index;
              return (
                <div
                  key={study.id}
                  className={`${styles.copy}${isActive ? ` ${styles.copyActive}` : ''}`}
                  inert={!isActive}
                >
                  <h3 className={styles.headline}>{study.tagline}</h3>
                  <p className={styles.subtitle} style={{ color: study.titleColor }}>
                    {study.name}
                  </p>
                  <Button
                    variant="outline"
                    size="small"
                    to={href}
                    className={styles.learnMore}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Learn More
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyFeature;
