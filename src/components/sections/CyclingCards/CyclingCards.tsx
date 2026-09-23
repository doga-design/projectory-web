import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useInView } from 'framer-motion';
import styles from './CyclingCards.module.css';

export type CyclingCardsItem = { title: string; body: string };

interface CyclingCardsProps {
  eyebrow: string;
  title: string;
  items: readonly CyclingCardsItem[];
  /** Eyebrow colour. */
  accent?: 'pink' | 'coral' | 'teal' | 'lime';
}

/** How long each card stays open before the next one takes over. */
const CYCLE_MS = 3000;

/** Title on the left, cards on the right that open one at a time, top to bottom, on a loop. */
const CyclingCards = ({ eyebrow, title, items, accent = 'pink' }: CyclingCardsProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Keyed on `active`, so a click also restarts the clock from the clicked card.
  useEffect(() => {
    if (!inView || paused) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % items.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [active, inView, paused, items.length]);

  // Mouse only: on touch, a tap fires enter and would leave the cycle paused.
  const setHover = (hovering: boolean) => (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setPaused(hovering);
  };

  return (
    <section ref={sectionRef} className={`${styles.section} ${styles[accent]}`}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.list} onPointerEnter={setHover(true)} onPointerLeave={setHover(false)}>
        {items.map((item, index) => {
          const isOpen = index === active;
          return (
            <button
              key={item.title}
              type="button"
              className={`${styles.card}${isOpen ? ` ${styles.cardOpen}` : ''}`}
              onClick={() => setActive(index)}
              aria-expanded={isOpen}
            >
              <span className={styles.reveal}>
                <span className={styles.revealInner}>
                  <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                </span>
              </span>
              <span className={styles.cardTitle}>{item.title}</span>
              <span className={styles.reveal}>
                <span className={styles.revealInner}>
                  <span className={styles.body}>{item.body}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CyclingCards;
