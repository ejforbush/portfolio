"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";

// Timing for the click-triggered page transition: fade the current menu out,
// navigate, hold briefly, then fade the new page's menu in. Lives here
// (rather than inside Nav) so any link on the site — not just Nav's own —
// can trigger the exact same sequence when it navigates somewhere whose
// menu size differs from the current page's.
const NAV_EXIT_DURATION = 135;
export const NAV_ENTRY_DELAY = 135;
export const NAV_ENTER_DURATION = 300;

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function animateValue(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  onDone?: () => void,
) {
  if (from === to) {
    onUpdate(to);
    onDone?.();
    return () => {};
  }
  const startTime = performance.now();
  let cancelled = false;

  function step(now: number) {
    if (cancelled) return;
    const progress = Math.min((now - startTime) / duration, 1);
    onUpdate(from + (to - from) * easeInOutQuad(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  }
  requestAnimationFrame(step);

  return () => {
    cancelled = true;
  };
}

type NavTransitionContextValue = {
  navFade: number;
  // Marks a navigation that already faded out via navFade and needs the
  // delayed fade-back-in on landing, as opposed to a route change Nav should
  // just resync to instantly (e.g. browser back/forward).
  wasMenuFadeNavRef: RefObject<boolean>;
  navigate: (href: string) => void;
  // Fades navFade back up to 1 — used by Nav's landing effect once a
  // menu-fade navigation has arrived and settled into its new page.
  fadeIn: (duration: number, onDone?: () => void) => () => void;
};

const NavTransitionContext = createContext<NavTransitionContextValue | null>(null);

export function NavTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [navFade, setNavFade] = useState(1);
  const wasMenuFadeNavRef = useRef(false);
  // Mirrors navFade so navigate() can read the current value without
  // depending on it directly — navFade updates every animation frame during
  // a fade, and closing over it would give navigate/fadeIn a new identity
  // every frame, which would in turn re-fire any effect that lists them as a
  // dependency mid-animation.
  const navFadeRef = useRef(navFade);
  useEffect(() => {
    navFadeRef.current = navFade;
  }, [navFade]);

  const navigate = useCallback(
    (href: string) => {
      animateValue(navFadeRef.current, 0, NAV_EXIT_DURATION, setNavFade, () => {
        wasMenuFadeNavRef.current = true;
        router.push(href);
      });
    },
    [router],
  );

  const fadeIn = useCallback(
    (duration: number, onDone?: () => void) => animateValue(0, 1, duration, setNavFade, onDone),
    [],
  );

  return (
    <NavTransitionContext.Provider value={{ navFade, wasMenuFadeNavRef, navigate, fadeIn }}>
      {children}
    </NavTransitionContext.Provider>
  );
}

export function useNavTransition() {
  const ctx = useContext(NavTransitionContext);
  if (!ctx) {
    throw new Error("useNavTransition must be used within a NavTransitionProvider");
  }
  return ctx;
}

export function isPlainLeftClick(e: React.MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
