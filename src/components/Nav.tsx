"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#mini", label: "Mini" },
  { href: "/about", label: "About" },
];

const barClasses =
  "flex w-full items-center justify-between border border-black/[0.06] bg-white px-10 py-2.5 shadow-[0px_4px_4px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.06)] dark:border-white/[0.06] dark:bg-zinc-900";

const SCROLL_DURATION = 1000;

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function animateScrollTo(targetY: number, duration: number, onDone?: () => void) {
  // The page has CSS `scroll-behavior: smooth`, which `window.scrollTo` with
  // `behavior: "auto"` actually defers to — so each per-frame call below would
  // otherwise kick off its own native smooth-scroll and stutter against the
  // next frame. Force it off for the duration of our own rAF-driven easing.
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";

  const finish = () => {
    root.style.scrollBehavior = previousScrollBehavior;
    onDone?.();
  };

  const startY = window.scrollY;
  const diff = targetY - startY;
  if (diff === 0) {
    finish();
    return;
  }
  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutQuad(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      finish();
    }
  }
  requestAnimationFrame(step);
}

function getScrollTarget(id: string): number | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const marginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return el.getBoundingClientRect().top + window.scrollY - marginTop;
}

function Brand() {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      animateScrollTo(0, SCROLL_DURATION);
    }
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="shrink-0 text-lg font-semibold tracking-tight text-neutral-900 uppercase dark:text-neutral-100"
    >
      Eric Forbush
    </Link>
  );
}

function NavLinks({
  activeHref,
  onSectionClick,
}: {
  activeHref: string | null;
  onSectionClick: (id: "work" | "mini") => (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-4">
      {links.map((link) => {
        const sectionId = link.href.startsWith("/#")
          ? (link.href.slice(2) as "work" | "mini")
          : null;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={sectionId ? onSectionClick(sectionId) : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
              activeHref === link.href
                ? "bg-black/10 text-neutral-900 dark:bg-white/15 dark:text-neutral-50"
                : "text-neutral-800 hover:bg-black/5 active:bg-black/10 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white dark:active:bg-white/15"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

// How much extra scroll, past the point the big bar is fully gone, it takes
// to fade the small bar all the way in (and, in reverse, back out).
const PILL_FADE_ZONE = 80;

export default function Nav() {
  const pathname = usePathname();
  const bigNavRef = useRef<HTMLElement>(null);
  const [navHeight, setNavHeight] = useState(0);
  const [pillProgress, setPillProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<"work" | "mini" | null>(
    null,
  );
  const suppressSpyRef = useRef(false);

  // Measure the big bar so the small bar's fade only ever starts once it's
  // fully scrolled out of view — never while any part of it is still visible.
  useEffect(() => {
    const measure = () => setNavHeight(bigNavRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const pastNav = window.scrollY - navHeight;
      setPillProgress(Math.min(Math.max(pastNav / PILL_FADE_ZONE, 0), 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navHeight]);

  useEffect(() => {
    if (pathname !== "/") return;

    const sectionIds = ["work", "mini"] as const;

    const onScroll = () => {
      if (suppressSpyRef.current) return;
      const band = window.innerHeight * 0.45;
      let current: "work" | "mini" | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= band) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const handleSectionClick =
    (id: "work" | "mini") => (e: React.MouseEvent) => {
      if (pathname !== "/") return;
      const target = getScrollTarget(id);
      if (target === null) return;

      e.preventDefault();
      // Highlight immediately on click rather than waiting for the
      // scroll-spy to catch up once the animated scroll finishes.
      setActiveSection(id);
      suppressSpyRef.current = true;
      animateScrollTo(target, SCROLL_DURATION, () => {
        suppressSpyRef.current = false;
      });
    };

  const activeHref = pathname.startsWith("/about")
    ? "/about"
    : activeSection
      ? `/#${activeSection}`
      : null;

  return (
    <>
      {/* Big bar: floats over whatever's at the top of the page (e.g. the hero
          image). Absolute, not fixed, so it scrolls away with the content. */}
      <header ref={bigNavRef} className="absolute inset-x-0 top-0 z-40 p-4">
        <nav className={`mx-auto max-w-6xl rounded-[36px] ${barClasses}`}>
          <Brand />
          <NavLinks activeHref={activeHref} onSectionClick={handleSectionClick} />
        </nav>
      </header>

      {/* Small bar: fixed, and only ever starts fading in once the big bar is
          fully out of view — so the fade in and the fade out (scrolling back
          up) are symmetric, and the two bars never overlap on screen. */}
      <header
        style={{
          opacity: pillProgress,
          transform: `translateY(${(1 - pillProgress) * -12}px)`,
          pointerEvents: pillProgress > 0.05 ? "auto" : "none",
        }}
        className="fixed inset-x-0 top-3 z-50 flex justify-center"
      >
        <nav className={`max-w-xl rounded-[36px] ${barClasses}`}>
          <Brand />
          <NavLinks activeHref={activeHref} onSectionClick={handleSectionClick} />
        </nav>
      </header>
    </>
  );
}
