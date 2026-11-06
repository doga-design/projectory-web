import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import styles from './ObjectiveFilter.module.css';

/** The brand colour a filter fills with when it's selected (classes in the CSS module). */
export type ObjectiveAccent = 'teal' | 'coral' | 'lime' | 'pink';

type Objective = {
  key: string;
  label: string;
  accent: ObjectiveAccent;
  description: string;
  href: string;
  /** How many products the filter shows. */
  count: number;
};

interface ObjectiveFilterProps {
  /** All Products first, then the objectives. */
  items: readonly Objective[];
  activeIndex: number;
}

/** Where a click counts as inside the menu: its trigger and its list. */
const MENU_AREA = '[data-objective-menu]';

/**
 * The catalogue's filter: a dropdown naming the selected objective, filled with its brand colour,
 * which opens a menu of every filter (each a link, so filters can be shared) and sticks under the
 * navbar while the cards scroll. The selected objective's copy sits below it.
 */
const ObjectiveFilter = ({ items, activeIndex }: ObjectiveFilterProps) => {
  const active = items[activeIndex];
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const close = () => setOpen(false);

  useEscapeKey(close, open);

  // A press anywhere outside the menu and its trigger closes it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest(MENU_AREA)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <div className={styles.anchor} data-objective-menu>
          <button
            type="button"
            className={`${styles.trigger} ${styles[active.accent]}`}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((o) => !o)}
          >
            {active.label}
            <FiChevronDown
              className={`${styles.chevron}${open ? ` ${styles.chevronOpen}` : ''}`}
              aria-hidden
            />
          </button>

          {open && (
            <nav id={menuId} className={styles.menu} aria-label="Filter products by objective">
              {items.map((item, i) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className={[
                    styles.option,
                    styles[item.accent],
                    i === activeIndex && styles.filled,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={i === activeIndex ? 'page' : undefined}
                  onClick={close}
                >
                  <span>{item.label}</span>
                  <span className={styles.count}>{item.count}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Keyed, so each new objective's copy fades in. */}
      <p
        key={active.key}
        className={`${styles.description}${activeIndex === 0 ? ` ${styles.descriptionAll}` : ''}`}
      >
        {active.description}
      </p>
    </div>
  );
};

export default ObjectiveFilter;
