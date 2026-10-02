import { useCallback, useEffect, useRef, useState } from "react";

export type AutoScrollMode = "idle" | "active" | "drawer" | "finished";

const BASE_PX_PER_SEC = 42;
export const MIN_SPEED = 0.5;
export const MAX_SPEED = 2.0;
const BOTTOM_TOLERANCE_PX = 6;
const BACK_TO_IDLE_PX = 100;

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

function clampSpeed(value: number) {
  return Math.min(Math.max(Math.round(value * 10) / 10, MIN_SPEED), MAX_SPEED);
}

function maxScroll() {
  return document.documentElement.scrollHeight - window.innerHeight;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Hands-free reading: scrolls the window at 42px/s × speed and reports progress.
 *
 * The position is kept as a float and applied with scrollTo. At 0.5× a frame
 * moves ~0.35px, and Chrome rounds a sub-pixel scrollBy to the device pixel
 * grid: measured on a 2× screen it moved 30px where 20px was asked, and on a
 * 1× screen the step can round to nothing. Accumulating keeps the speed true.
 */
export function useAutoScroll() {
  const [mode, setModeState] = useState<AutoScrollMode>("idle");
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const modeRef = useRef<AutoScrollMode>("idle");
  const speedRef = useRef(1);
  const scrollingRef = useRef(false);
  const runningRef = useRef(false); // scrolling and not paused
  const posRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const measureQueuedRef = useRef(false);

  const setMode = useCallback((next: AutoScrollMode) => {
    modeRef.current = next;
    setModeState(next);
  }, []);

  const measure = useCallback(() => {
    const top = window.scrollY;
    const max = maxScroll();
    setProgress(max > 0 ? Math.min(Math.max(top / max, 0), 1) : 1);
    setSecondsLeft(Math.ceil(Math.max(max - top, 0) / (BASE_PX_PER_SEC * speedRef.current)));
  }, []);

  const halt = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    halt();
    scrollingRef.current = false;
    setIsScrolling(false);
    setIsPaused(false);
    setMode("finished");
  }, [halt, setMode]);

  const stepRef = useRef<(ts: number) => void>(() => {});
  stepRef.current = (ts: number) => {
    if (!runningRef.current) return;
    const last = lastTsRef.current ?? ts;
    lastTsRef.current = ts;
    // Clamp so a frame after a background tab doesn't jump the page.
    const dt = Math.min((ts - last) / 1000, 0.1);
    const max = maxScroll();
    posRef.current = Math.min(posRef.current + BASE_PX_PER_SEC * speedRef.current * dt, max);
    window.scrollTo(0, posRef.current);
    if (posRef.current >= max - 1) {
      finish();
      return;
    }
    rafRef.current = requestAnimationFrame((t) => stepRef.current(t));
  };

  const run = useCallback(() => {
    posRef.current = window.scrollY;
    lastTsRef.current = null;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame((t) => stepRef.current(t));
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    scrollingRef.current = true;
    setIsScrolling(true);
    setIsPaused(false);
    setMode("active");
    run();
  }, [run, setMode]);

  const pause = useCallback(() => {
    halt();
    setIsPaused(true);
  }, [halt]);

  const resume = useCallback(() => {
    if (!scrollingRef.current) {
      start();
      return;
    }
    if (runningRef.current) return;
    setIsPaused(false);
    run();
  }, [run, start]);

  const stop = useCallback(() => {
    halt();
    scrollingRef.current = false;
    setIsScrolling(false);
    setIsPaused(false);
    setMode("idle");
  }, [halt, setMode]);

  const setSpeed = useCallback(
    (value: number) => {
      const next = clampSpeed(value);
      speedRef.current = next;
      setSpeedState(next);
      measure();
    },
    [measure],
  );

  const openDrawer = useCallback(() => setMode("drawer"), [setMode]);

  const collapse = useCallback(() => {
    setMode(scrollingRef.current ? "active" : "idle");
  }, [setMode]);

  const backToTop = useCallback(() => {
    halt();
    scrollingRef.current = false;
    setIsScrolling(false);
    setIsPaused(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMode("idle");
  }, [halt, setMode]);

  useEffect(() => {
    const onScroll = () => {
      // The user moved the page under us: continue from where they left it.
      if (runningRef.current && Math.abs(window.scrollY - posRef.current) > 2) {
        posRef.current = window.scrollY;
      }
      if (measureQueuedRef.current) return;
      measureQueuedRef.current = true;
      requestAnimationFrame(() => {
        measureQueuedRef.current = false;
        measure();
        const top = window.scrollY;
        const max = maxScroll();
        if (max > 0 && top + window.innerHeight >= document.documentElement.scrollHeight - BOTTOM_TOLERANCE_PX) {
          if (modeRef.current !== "finished") finish();
        } else if (modeRef.current === "finished" && top < BACK_TO_IDLE_PX) {
          setMode("idle");
        }
      });
    };

    // Taking over by hand while the page scrolls itself opens the controls.
    const onManual = () => {
      if (runningRef.current && modeRef.current === "active") setMode("drawer");
    };
    const onKey = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key) && !isTypingTarget(e.target)) onManual();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onManual, { passive: true });
    window.addEventListener("touchmove", onManual, { passive: true });
    window.addEventListener("keydown", onKey);
    measure();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onManual);
      window.removeEventListener("touchmove", onManual);
      window.removeEventListener("keydown", onKey);
      halt();
    };
  }, [finish, halt, measure, setMode]);

  return {
    mode,
    isScrolling,
    isPaused,
    speed,
    progress,
    secondsLeft,
    start,
    pause,
    resume,
    stop,
    setSpeed,
    openDrawer,
    collapse,
    backToTop,
  };
}
