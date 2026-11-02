import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import type { Location } from 'react-router-dom';
import { easeScrollTo } from '@/lib/scrollToId';

/**
 * Brings the catalogue into view on a heavy ease whenever the URL carries its anchor (every
 * tag pick does), and returns the same scroll for the hero button.
 *
 * When the reader is already past the top of the grid, a new filter removes cards *above*
 * the screen. The browser then jumps the scroll position, either to keep what's on screen in
 * place (scroll anchoring) or because the page is now too short. Either way the jump lands
 * before the ease can start. So in that case the grid is held at its old height until the
 * scroll lands; the held space is empty, below the last row. When the grid hasn't been
 * reached yet, nothing above the screen changes and nothing is held: the cards just re-flow.
 *
 * Whether the reader is past the grid's top is tracked as it changes, because it's needed
 * after the new cards are in the DOM, when reading layout would lay them out (and jump) early.
 */
export const useCatalogueScroll = (
  anchorRef: RefObject<HTMLElement | null>,
  gridRef: RefObject<HTMLElement | null>,
  location: Location
) => {
  const gridHeight = useRef(0);
  const pastGridTop = useRef(false);
  // Which scroll currently holds the grid, so an earlier one landing late can't release it.
  const holdId = useRef(0);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const track = () => {
      gridHeight.current = grid.offsetHeight;
      pastGridTop.current = grid.getBoundingClientRect().top < 0;
    };
    track();
    const ro = new ResizeObserver(track);
    ro.observe(grid);
    window.addEventListener('scroll', track, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', track);
    };
  }, [gridRef]);

  const scrollToCatalogue = () => anchorRef.current && easeScrollTo(anchorRef.current);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    const anchor = anchorRef.current;
    if (location.hash !== `#${anchor?.id}` || !grid || !anchor) return;
    const id = ++holdId.current;
    grid.style.minHeight = pastGridTop.current ? `${gridHeight.current}px` : '';
    easeScrollTo(anchor).then(() => {
      if (holdId.current === id) grid.style.minHeight = '';
    });
    // Keyed on the navigation itself, so picking the same tag again scrolls too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.hash]);

  return scrollToCatalogue;
};
