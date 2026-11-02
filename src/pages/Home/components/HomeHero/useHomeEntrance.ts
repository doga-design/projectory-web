import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import {
  animate,
  cubicBezier,
  useMotionValue,
  type AnimationPlaybackControls,
} from 'framer-motion';
import { onLoaderLifted, setHomeStage } from '@/lib/homeEntrance';
import { usePageEntrance } from '@/hooks/usePageEntrance';

/** Gets moving right away, then lands softly, so the full-screen moment stays brief. */
const PULL_EASE = cubicBezier(0.45, 0, 0.15, 1);
const FAST_FINISH_S = 0.3;

/** Seconds from the loader starting to lift. Everything on the hero reads one clock. */
const STAGE_TIMELINE = {
  end: 2.55,
  navbar: 0.35,
  pull: { start: 0.2, duration: 1 },
  title: [0.55, 0.65],
  description: 0.85,
  buttons: 0.95,
  shapes: [0.45, 0.6],
  frame: null,
};

/** Phones: no full-screen stage, so the words lead and the frame follows. */
const SIMPLE_TIMELINE = {
  end: 2.45,
  navbar: 0,
  pull: null,
  title: [0.1, 0.2],
  description: 0.45,
  buttons: 0.55,
  shapes: [0.3, 0.5],
  frame: 0.65,
};

type EntranceTimeline = typeof STAGE_TIMELINE | typeof SIMPLE_TIMELINE;

interface StageGeometry {
  /** How far the screen's edges sit outside the frame (mask start). */
  inset: { top: number; right: number; bottom: number; left: number };
  radius: number;
  /** What it takes to centre the reel on the screen, covering it. */
  scale: number;
  x: number;
  y: number;
}

function measureStage(frame: HTMLElement): StageGeometry {
  const rect = frame.getBoundingClientRect();
  const screenW = document.documentElement.clientWidth;
  const screenH = window.innerHeight;

  return {
    inset: {
      top: rect.top,
      right: screenW - rect.right,
      bottom: screenH - rect.bottom,
      left: rect.left,
    },
    radius: parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0,
    scale: Math.max(screenW / rect.width, screenH / rect.height),
    x: screenW / 2 - (rect.left + rect.width / 2),
    y: screenH / 2 - (rect.top + rect.height / 2),
  };
}

/**
 * The Home hero's first-landing entrance. One `time` value runs from 0 to the
 * timeline's end, and every moving part reads from it. When there's nothing to play
 * it simply starts at the end, and finishing early is one tween of `time`.
 */
export function useHomeEntrance(frameRef: RefObject<HTMLElement | null>) {
  const { play } = usePageEntrance('home');
  const [mode] = useState<'none' | 'stage' | 'simple'>(() => {
    if (!play) return 'none';
    return window.matchMedia('(max-width: 768px)').matches ? 'simple' : 'stage';
  });
  const timeline: EntranceTimeline = mode === 'stage' ? STAGE_TIMELINE : SIMPLE_TIMELINE;

  const time = useMotionValue(mode === 'none' ? timeline.end : 0);
  const [finished, setFinished] = useState(mode === 'none');

  const reelScale = useMotionValue(1);
  const reelX = useMotionValue(0);
  const reelY = useMotionValue(0);
  const mask = useMotionValue('none');
  const geometry = useRef<StageGeometry | null>(null);

  // The pull-back: the reel settles to its place while the mask closes in on the frame.
  useLayoutEffect(() => {
    if (mode !== 'stage') return;
    const { pull } = STAGE_TIMELINE;

    const render = (t: number) => {
      const g = geometry.current;
      if (!g) return;
      const linear = Math.min(1, Math.max(0, (t - pull.start) / pull.duration));
      const rest = 1 - PULL_EASE(linear);
      const { top, right, bottom, left } = g.inset;
      reelScale.set(1 + (g.scale - 1) * rest);
      reelX.set(g.x * rest);
      reelY.set(g.y * rest);
      mask.set(
        `inset(${-top * rest}px ${-right * rest}px ${-bottom * rest}px ${-left * rest}px round ${g.radius * (1 - rest)}px)`
      );
    };

    const measure = () => {
      if (frameRef.current) geometry.current = measureStage(frameRef.current);
      render(time.get());
    };

    measure();
    // Webfonts can change the text block's height, and so the frame's place.
    document.fonts?.ready.then(measure);
    setHomeStage(true);

    const unsubscribe = time.on('change', (t) => {
      render(t);
      if (t >= STAGE_TIMELINE.navbar) setHomeStage(false);
    });
    return () => {
      unsubscribe();
      setHomeStage(false);
    };
  }, [mode, frameRef, time, reelScale, reelX, reelY, mask]);

  const controls = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    if (mode === 'none') return;
    let started = false;
    let finishing = false;

    const settle = () => {
      setFinished(true);
      setHomeStage(false);
      removeListeners();
    };

    const finish = () => {
      if (finishing) return;
      finishing = true;
      controls.current?.stop();
      if (!started) {
        time.set(timeline.end);
        settle();
        return;
      }
      controls.current = animate(time, timeline.end, {
        duration: FAST_FINISH_S,
        ease: 'easeOut',
        onComplete: settle,
      });
    };

    // ScrollToTop's own reset fires a scroll event at 0, so only real movement counts.
    const onScroll = () => {
      if (window.scrollY > 0) finish();
    };
    const removeListeners = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', finish);
      window.removeEventListener('touchmove', finish);
      window.removeEventListener('pointerdown', finish);
      window.removeEventListener('keydown', finish);
      window.removeEventListener('resize', finish);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', finish, { passive: true });
    window.addEventListener('touchmove', finish, { passive: true });
    window.addEventListener('pointerdown', finish);
    window.addEventListener('keydown', finish);
    window.addEventListener('resize', finish);

    const cancelWait = onLoaderLifted(() => {
      if (finishing) return;
      started = true;
      controls.current = animate(time, timeline.end, {
        duration: timeline.end,
        ease: 'linear',
        onComplete: settle,
      });
    });

    return () => {
      cancelWait();
      controls.current?.stop();
      removeListeners();
    };
  }, [mode, time, timeline]);

  return {
    mode,
    time,
    timeline,
    finished,
    stageStyle: mode === 'stage' ? { clipPath: mask } : undefined,
    reelStyle: mode === 'stage' ? { scale: reelScale, x: reelX, y: reelY } : undefined,
  };
}
