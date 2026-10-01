import { useEffect, useRef, useState } from 'react';
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

/** True while the user has text selected inside `el`. */
const hasSelectionIn = (el: HTMLElement | null) => {
  const selection = document.getSelection();
  return !!el && !!selection && !selection.isCollapsed && el.contains(selection.anchorNode);
};

/** Title on the left, cards on the right that open one at a time, top to bottom, on a loop. */
const CyclingCards = ({ eyebrow, title, items, accent = 'pink' }: CyclingCardsProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const [active, setActive] = useState(0);
  // Card under the mouse, if any. The open card holds still while it's being read.
  const [hovered, setHovered] = useState<number | null>(null);
  const paused = hovered === active;

  // Keyed on `active`, so a click also restarts the clock from the clicked card.
  // Leaving the viewport or resting the mouse on the open card stops it; moving off
  // restarts a full cycle.
  useEffect(() => {
    if (!inView || paused) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % items.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [active, inView, paused, items.length]);

  // A drag-select ends in a click; don't treat it as picking a card.
  const open = (index: number) => {
    if (!hasSelectionIn(listRef.current)) setActive(index);
  };

  // Real mouse only: on touch, pointerenter fires on tap with no matching leave.
  const hover = (e: React.PointerEvent, index: number | null) => {
    if (e.pointerType === 'mouse') setHovered(index);
  };

  return (
    <section ref={sectionRef} className={`${styles.section} ${styles[accent]}`}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div ref={listRef} className={styles.list}>
        {items.map((item, index) => {
          const isOpen = index === active;
          return (
            <button
              key={item.title}
              type="button"
              className={`${styles.card}${isOpen ? ` ${styles.cardOpen}` : ''}`}
              onClick={() => open(index)}
              onPointerEnter={(e) => hover(e, index)}
              onPointerLeave={(e) => hover(e, null)}
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
