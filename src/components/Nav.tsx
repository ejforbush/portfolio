"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  useNavTransition,
  isPlainLeftClick,
  NAV_ENTRY_DELAY,
  NAV_ENTER_DURATION,
} from "@/components/NavTransition";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/about", label: "About" },
];

const barClasses =
  "flex w-full items-center justify-between border border-black/[0.06] bg-white/75 backdrop-blur-[10px] pl-7 pr-3 py-2.5 shadow-glass sm:pl-11 sm:pr-5 dark:border-white/[0.08] dark:bg-zinc-900/75";

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

function Brand({ onNavigate }: { onNavigate: (e: React.MouseEvent) => void }) {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      animateScrollTo(0, SCROLL_DURATION);
    } else {
      onNavigate(e);
    }
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="shrink-0 text-lg font-semibold tracking-tight text-zinc-900 uppercase dark:text-zinc-100"
    >
      Eric Forbush
    </Link>
  );
}

function NavLinks({
  activeHref,
  onSectionClick,
  onNavigate,
}: {
  activeHref: string | null;
  onSectionClick: (id: "work") => (e: React.MouseEvent) => void;
  onNavigate: (href: string) => (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      {links.map((link) => {
        const sectionId = link.href.startsWith("/#")
          ? (link.href.slice(2) as "work")
          : null;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={sectionId ? onSectionClick(sectionId) : onNavigate(link.href)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
              activeHref === link.href
                ? "bg-black/10 text-zinc-900 dark:bg-white/15 dark:text-zinc-50"
                : "text-zinc-800 hover:bg-black/5 active:bg-black/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white dark:active:bg-white/15"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

// Single pill everywhere — no large/small size switch, just the
// click-triggered fade+slide transition on every navigation (fade the
// current page's nav out, route, hold briefly, fade the new page's nav back
// in), same as small-template pages always used before this only had one
// size to begin with.
export default function Nav() {
  const pathname = usePathname();
  const { navFade, wasMenuFadeNavRef, navigate, fadeIn } = useNavTransition();
  const isHome = pathname === "/";
  const [activeSection, setActiveSection] = useState<"work" | null>(null);
  const suppressSpyRef = useRef(false);

  // Only a menu-fade navigation (a click via navigate()) needs the delayed
  // fade-back-in on landing; a plain route sync (e.g. browser back/forward)
  // leaves navFade at its already-settled value of 1, nothing to do.
  useEffect(() => {
    if (!wasMenuFadeNavRef.current) return;
    wasMenuFadeNavRef.current = false;

    // A cross-page "Work" click (e.g. from a case study) lands here via
    // navigate("/#work") — the browser scrolls to the section on arrival,
    // but nothing ever clears the #work fragment afterward. Left in place,
    // any later refresh jumps straight back to #work regardless of where
    // the reader has since scrolled to. The scroll-to-anchor has already
    // happened by the time this effect runs, so it's safe to drop the hash
    // from the URL bar without affecting scroll position.
    if (window.location.hash) {
      history.replaceState(null, "", pathname + window.location.search);
    }

    const timeout = setTimeout(() => {
      fadeIn(NAV_ENTER_DURATION);
    }, NAV_ENTRY_DELAY);
    return () => clearTimeout(timeout);
  }, [pathname, fadeIn, wasMenuFadeNavRef]);

  useEffect(() => {
    if (pathname !== "/") return;

    const onScroll = () => {
      if (suppressSpyRef.current) return;
      const el = document.getElementById("work");
      if (!el) {
        setActiveSection(null);
        return;
      }
      // Only highlight once we've actually reached the anchor point (same
      // point scroll-mt accounts for when we scroll to it on click) — not a
      // lookahead band that lights up while still mid-hero.
      const marginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      const current = el.getBoundingClientRect().top - marginTop <= 0 ? "work" : null;
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  function handleNavClick(e: React.MouseEvent, href: string) {
    if (!isPlainLeftClick(e)) return; // let modified clicks (new tab, etc.) behave normally
    const targetPath = href.split("#")[0] || "/";
    if (targetPath === pathname) return; // already there, nothing to navigate

    e.preventDefault();
    navigate(href);
  }

  const handleSectionClick = (id: "work") => (e: React.MouseEvent) => {
    if (pathname !== "/") {
      handleNavClick(e, `/#${id}`);
      return;
    }
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
    : isHome && activeSection
      ? `/#${activeSection}`
      : null;

  const menuTranslateY = (1 - navFade) * -12;
  const menuInteractive = navFade > 0.5;

  return (
    <header
      style={{
        opacity: navFade,
        transform: `translateY(${menuTranslateY}px)`,
        pointerEvents: menuInteractive ? "auto" : "none",
      }}
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-4"
    >
      <nav className={`max-w-xl rounded-full ${barClasses}`}>
        <Brand onNavigate={(e) => handleNavClick(e, "/")} />
        <NavLinks
          activeHref={activeHref}
          onSectionClick={handleSectionClick}
          onNavigate={(href) => (e) => handleNavClick(e, href)}
        />
      </nav>
    </header>
  );
}
