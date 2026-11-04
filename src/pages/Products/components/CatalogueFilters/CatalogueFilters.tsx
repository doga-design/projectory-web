import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './CatalogueFilters.module.css';

type CatalogueFilter = { key: string; label: string; description: string; href: string };

interface CatalogueFiltersProps {
  items: readonly CatalogueFilter[];
  activeIndex: number;
  className?: string;
}

/**
 * The catalogue's objective filters. Each is a link, so filters can be shared.
 *
 * Desktop: stacked cards where the selected one is open, showing what that objective means. The
 * design and motion of Partners' CyclingCards, compact enough for nine to fit on screen, without
 * its auto-loop.
 *
 * Phones and tablets: a sliding row that sticks under the navbar, with the copy below it.
 */
const CatalogueFilters = ({ items, activeIndex, className }: CatalogueFiltersProps) => {
  const listRef = useRef<HTMLElement>(null);
  const hasCentred = useRef(false);

  // Slides the row sideways to centre the selected filter. Only the row scrolls, unlike
  // scrollIntoView, so the page can't move. On desktop nothing overflows, so nothing happens.
  useLayoutEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>('[aria-current]');
    const behavior = hasCentred.current ? 'smooth' : 'auto';
    hasCentred.current = true;
    if (!list || !selected || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({
      left: selected.offsetLeft - (list.clientWidth - selected.offsetWidth) / 2,
      behavior,
    });
  }, [activeIndex]);

  // A drag-select ends in a click; don't treat it as picking a filter.
  const keepSelection = (e: MouseEvent) => {
    const selection = document.getSelection();
    if (selection && !selection.isCollapsed && listRef.current?.contains(selection.anchorNode)) {
      e.preventDefault();
    }
  };

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ''}`}>
      <div className={styles.row}>
        <nav ref={listRef} className={styles.list} aria-label="Filter products by objective">
          {items.map((item, i) => {
            const isOpen = i === activeIndex;
            return (
              <Link
                key={item.key}
                to={item.href}
                className={`${styles.card}${isOpen ? ` ${styles.cardOpen}` : ''}`}
                aria-current={isOpen ? 'page' : undefined}
                draggable={false}
                onClick={keepSelection}
              >
                <span className={styles.title}>{item.label}</span>
                <span className={styles.reveal} aria-hidden={!isOpen}>
                  <span className={styles.revealInner}>
                    <span className={styles.body}>{item.description}</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* The sliding row's copy. All of it shares one cell, so the block keeps the tallest
          one's height and the cards below never shift; switching only cross-fades. */}
      <div className={styles.copies}>
        {items.map((item, i) => (
          <p
            key={item.key}
            className={`${styles.copy}${i === activeIndex ? ` ${styles.copyActive}` : ''}`}
          >
            {item.description}
          </p>
        ))}
      </div>
    </div>
  );
};

export default CatalogueFilters;
