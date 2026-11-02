import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Link } from 'react-router-dom';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  type AnimationPlaybackControls,
  type PanInfo,
} from 'framer-motion';
import styles from './TagWheel.module.css';

type TagWheelItem = { key: string; label: string; href: string; prominent?: boolean };

interface TagWheelProps {
  items: readonly TagWheelItem[];
  activeIndex: number;
  /** Called on drag release and arrow keys; clicks just follow the tag's link. */
  onSelect: (index: number) => void;
}

/** Spin and snap motion, the same curve as FeaturedCarousel's fade. */
const EASE = [0.65, 0, 0.35, 1] as const;
const DURATION = 0.6;
/**
 * The coast after a drag is let go, all in tags. It heads for the whole tag about
 * `power` × release velocity away and springs there from the release speed, with a
 * small `bounce` so it visibly clicks into place. Longer trips get more time
 * (`baseDuration` + `perTag` per tag, capped). Velocity is capped so a wild flick spins
 * a few laps at most. The rest thresholds are in tags too; framer's defaults assume
 * pixels and would call it done half a tag early.
 */
const COAST = {
  power: 0.45,
  maxVelocity: 15,
  bounce: 0.12,
  baseDuration: 0.3,
  perTag: 0.05,
  maxDuration: 0.6,
  restDelta: 0.005,
  restSpeed: 0.08,
};
/** A prominent tag (All Products) fades this much less, so it stays easy to spot and pick. */
const PROMINENT_BOOST = 1.6;
/** Away from the centre, tags are muted; a prominent one wears the pill's pink instead. */
const AWAY_COLOR = { plain: 'var(--color-text-muted)', prominent: 'var(--brand-pink)' };

/**
 * Per size: the pill's horizontal padding (each side), [opacity, scale] by distance from
 * the centre in tags (0, 1, 2, …), and how tags are spaced.
 *
 * Desktop's scale takes the centre tag's 24px down to 18px everywhere else (--font-size-xl
 * to --font-size-md), so its spacing follows each tag's current size, and its gap comes
 * from `--block-3` (read in the measure below) and clears the pill's padding. Mobile keeps
 * a fixed gap between full-size labels, which clears the pill and the centre tag's boost.
 */
const FALLOFF = {
  desktop: {
    pillPad: 20,
    gap: 0,
    opacity: [1, 0.65, 0.3, 0],
    scale: [1, 0.75, 0.75, 0.75],
    scaledSpacing: true,
  },
  mobile: {
    pillPad: 14,
    gap: 44,
    opacity: [1, 0.6, 0],
    scale: [1.12, 1.04, 1],
    scaledSpacing: false,
  },
};

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Linear between the stops at 0, 1, 2, …; holds the last stop past the end. */
const along = (stops: number[], t: number) => {
  const i = Math.floor(t);
  if (i >= stops.length - 1) return stops[stops.length - 1];
  return stops[i] + (stops[i + 1] - stops[i]) * (t - i);
};

/**
 * A looping, iOS-picker-style strip: the selected tag sits in a fixed pill in the centre and
 * the rest fan out either side, fading and shrinking with distance. Click a tag, drag/swipe
 * the strip (it snaps and selects on release), or use ←/→.
 *
 * `pos` is the tag index at the centre as a float that never wraps, so a spin always takes
 * the short way round. Everything is positioned from it straight in the DOM, once per frame.
 */
const TagWheel = ({ items, activeIndex, onSelect }: TagWheelProps) => {
  const n = items.length;
  const pos = useMotionValue(activeIndex);
  // Where `pos` is heading. Lets a selection the wheel made itself skip the re-spin.
  const target = useRef(activeIndex);
  const spin = useRef<AnimationPlaybackControls | null>(null);
  // Set once a pan starts (or a coast is caught); swallows the click that ends it.
  const dragged = useRef(false);
  // A released wheel still springing to its tag, and whether a touch has caught it.
  const coasting = useRef(false);
  const caught = useRef(false);
  // Pixels between the centre tag and the next; converts drag distance to tags.
  const step = useRef(0);
  const widths = useRef<number[]>([]);
  const tokenGap = useRef(0);
  const tagRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const pillRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const layout = useCallback(() => {
    const w = widths.current;
    if (w.length !== n) return;
    const falloff = isMobile ? FALLOFF.mobile : FALLOFF.desktop;
    const { pillPad, opacity, scale, scaledSpacing } = falloff;
    const gap = scaledSpacing ? tokenGap.current : falloff.gap;
    const p = pos.get();
    const a = Math.floor(p);
    const f = p - a;
    const half = Math.floor(n / 2);

    // A tag's current on-screen width, and the space between neighbours. Beside the pill,
    // its padding is added (easing away with distance) so the gap is measured from its edge.
    const widthAt = (k: number) => {
      const full = w[mod(a + k, n)];
      return scaledSpacing ? full * along(scale, Math.abs(k - f)) : full;
    };
    const gapBetween = (k: number, l: number) => {
      if (!scaledSpacing) return gap;
      return gap + pillPad * Math.max(0, 1 - Math.min(Math.abs(k - f), Math.abs(l - f)));
    };

    // Centre of each tag relative to tag `a`, walking outward both ways. Labels differ in
    // width, so the spacing is built from the measured widths rather than equal slots.
    const centre: Record<number, number> = { 0: 0 };
    for (let k = 1; k <= n - 1 - half; k++) {
      centre[k] = centre[k - 1] + widthAt(k - 1) / 2 + gapBetween(k - 1, k) + widthAt(k) / 2;
    }
    for (let k = -1; k >= -half; k--) {
      centre[k] = centre[k + 1] - widthAt(k + 1) / 2 - gapBetween(k, k + 1) - widthAt(k) / 2;
    }
    step.current = centre[1];

    tagRefs.current.forEach((el, i) => {
      if (!el) return;
      // A tag that wraps from one end to the other is fully faded when it jumps.
      const k = mod(i - a + half, n) - half;
      const d = Math.abs(k - f);
      const { prominent } = items[i];
      const o = Math.min(1, along(opacity, d) * (prominent ? PROMINENT_BOOST : 1));
      // White inside the pill, blending to the away colour as the tag slides out of it.
      const white = Math.max(0, 1 - d) * 100;
      const away = prominent ? AWAY_COLOR.prominent : AWAY_COLOR.plain;
      el.style.transform = `translate(calc(-50% + ${centre[k] - f * step.current}px), -50%) scale(${along(scale, d)})`;
      el.style.opacity = String(o);
      el.style.color = `color-mix(in srgb, var(--color-text) ${white}%, ${away})`;
      el.tabIndex = o > 0 ? 0 : -1;
      el.setAttribute('aria-hidden', String(o === 0));
    });

    // The pill stays put; its width blends between the two tags either side of the centre.
    const pill = pillRef.current;
    if (pill) {
      const width = w[mod(a, n)] + (w[mod(a + 1, n)] - w[mod(a, n)]) * f;
      pill.style.width = `${width + pillPad * 2}px`;
      pill.style.transform = `translate(-50%, -50%) scale(${scale[0]})`;
    }
  }, [n, items, isMobile, pos]);

  useMotionValueEvent(pos, 'change', layout);

  // Measure the labels (and re-measure when the font loads or the size changes).
  useLayoutEffect(() => {
    const measure = () => {
      widths.current = tagRefs.current.map((el) => el?.offsetWidth ?? 0);
      tokenGap.current = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--block-3')
      );
      layout();
    };
    measure();
    const ro = new ResizeObserver(measure);
    tagRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [layout]);

  const spinTo = useCallback(
    (to: number) => {
      target.current = to;
      spin.current?.stop();
      spin.current = animate(pos, to, { duration: DURATION, ease: EASE });
    },
    [pos]
  );

  // The selection changed from outside the wheel (a click, footer link, back button):
  // spin the short way round to it.
  useEffect(() => {
    if (mod(Math.round(target.current), n) === activeIndex) return;
    const from = pos.get();
    spinTo(from + mod(activeIndex - from + n / 2, n) - n / 2);
  }, [activeIndex, n, pos, spinTo]);

  // Let go (velocity in tags/s): pick the tag the flick is heading for, then spring to it
  // starting at the flick's own speed, so the wheel carries the momentum and clicks into
  // place on a whole tag. It only selects once at rest, so the filter (and its scroll)
  // never kicks in while someone is still spinning.
  const release = (velocity: number) => {
    const v = Math.max(-COAST.maxVelocity, Math.min(COAST.maxVelocity, velocity));
    const to = Math.round(pos.get() + v * COAST.power);
    const distance = Math.abs(to - pos.get());
    coasting.current = true;
    spin.current = animate(pos, to, {
      type: 'spring',
      velocity: v,
      bounce: COAST.bounce,
      visualDuration: Math.min(COAST.maxDuration, COAST.baseDuration + COAST.perTag * distance),
      restDelta: COAST.restDelta,
      restSpeed: COAST.restSpeed,
      onComplete: () => {
        coasting.current = false;
        pos.set(to);
        target.current = to;
        onSelect(mod(to, n));
      },
    });
  };

  const onPanStart = () => {
    dragged.current = true;
    caught.current = false;
    coasting.current = false;
    spin.current?.stop();
  };

  const onPan = (_: PointerEvent, info: PanInfo) => {
    if (step.current) pos.set(pos.get() - info.delta.x / step.current);
  };

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    release(step.current ? -info.velocity.x / step.current : 0);
  };

  // Touching a coasting wheel stops it where it is, like iOS; the click that follows is
  // swallowed, and letting go (without dragging on) settles it onto the nearest tag.
  const onPointerDown = () => {
    dragged.current = false;
    if (!coasting.current) return;
    spin.current?.stop();
    coasting.current = false;
    caught.current = true;
    dragged.current = true;
  };

  const onPointerUp = () => {
    if (!caught.current) return;
    caught.current = false;
    release(0);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    onSelect(mod(activeIndex + (e.key === 'ArrowRight' ? 1 : -1), n));
  };

  return (
    <div className={styles.bar}>
      <motion.nav
        className={styles.strip}
        aria-label="Filter products by objective"
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        onPointerDownCapture={onPointerDown}
        onPointerUpCapture={onPointerUp}
        onClickCapture={(e) => {
          if (!dragged.current) return;
          e.preventDefault();
          e.stopPropagation();
        }}
        onKeyDown={onKeyDown}
      >
        <div ref={pillRef} className={styles.pill} aria-hidden />
        {items.map((item, i) => (
          <Link
            key={item.key}
            ref={(el) => {
              tagRefs.current[i] = el;
            }}
            to={item.href}
            className={styles.tag}
            aria-current={i === activeIndex ? 'page' : undefined}
            draggable={false}
          >
            {item.label}
          </Link>
        ))}
      </motion.nav>
    </div>
  );
};

export default TagWheel;
