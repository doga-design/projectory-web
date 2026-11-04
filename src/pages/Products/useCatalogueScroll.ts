import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import type { Location } from 'react-router-dom';
import { easeScrollTo } from '@/lib/scrollToId';

/** How long the grid takes to ease to a new height. */
const SETTLE_MS = 400;

/**
 * Brings the catalogue into view on a heavy ease whenever the URL carries its anchor (every
 * filter pick does), and returns the same scroll for the hero button.
 *
 * A new filter usually changes the grid's height, which would jump the scroll position if the
 * page got too short, and pop whatever's below the grid into view. So the grid is held at its
 * old height, then eases to the new one: straight away when it's growing, and once the scroll
 * has landed when it's shrinking, by which point the page can get shorter without jumping.
 */
export const useCatalogueScroll = (
  anchorRef: RefObject<HTMLElement | null>,
  gridRef: RefObject<HTMLElement | null>,
  location: Location
) => {
  const gridHeight = useRef(0);
  // Which pick currently holds the grid, so an earlier one finishing late can't release it.
  const holdId = useRef(0);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const ro = new ResizeObserver(() => {
      gridHeight.current = grid.offsetHeight;
    });
    ro.observe(grid);
    return () => ro.disconnect();
  }, [gridRef]);

  const scrollToCatalogue = () => anchorRef.current && easeScrollTo(anchorRef.current);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    const anchor = anchorRef.current;
    if (location.hash !== `#${anchor?.id}` || !grid || !anchor) return;
    const id = ++holdId.current;
    const from = gridHeight.current;

    const release = () => {
      grid.style.height = '';
      grid.style.overflow = '';
      grid.style.transition = '';
    };
    // Arriving on the page: nothing to hold, the grid just has its height.
    if (!from) {
      easeScrollTo(anchor);
      return;
    }

    release();
    grid.style.overflow = 'clip';
    grid.style.height = `${from}px`;
    // Held first, so measuring where the new cards end can't lay the page out short and jump.
    const cards = [...grid.children].filter((card) => !(card as HTMLElement).hidden);
    const lastCard = cards[cards.length - 1];
    const to = lastCard
      ? lastCard.getBoundingClientRect().bottom - grid.getBoundingClientRect().top
      : 0;

    const settle = () => {
      if (holdId.current !== id) return;
      if (to === from || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        release();
        return;
      }
      grid.style.transition = `height ${SETTLE_MS}ms ease`;
      grid.style.height = `${to}px`;
      window.setTimeout(() => {
        if (holdId.current === id) release();
      }, SETTLE_MS);
    };

    if (to > from) settle();
    easeScrollTo(anchor).then(() => {
      if (to <= from) settle();
    });
    // Keyed on the navigation itself, so picking the same filter again scrolls too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.hash]);

  return scrollToCatalogue;
};
