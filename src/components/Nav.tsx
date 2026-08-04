"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { caseStudies } from "@/data/caseStudies";
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
  "flex w-full items-center justify-between border border-black/[0.06] bg-white/85 backdrop-blur-[10px] px-10 py-2.5 shadow-glass dark:border-white/[0.08] dark:bg-zinc-900/85";

const SCROLL_DURATION = 1000;

// How much extra scroll, past the point menu-lg is fully gone, it takes to
// fade menu-sm all the way in (and, in reverse, back out).
const MENU_FADE_ZONE = 80;

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
    <div className="flex shrink-0 items-center gap-4">
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

export default function Nav() {
  const pathname = usePathname();
  const { navFade, predictedMenuLgRef, wasMenuFadeNavRef, navigate, fadeIn } =
    useNavTransition();
  // Menu-lg exists on home, about, and the large case-study pages (the ones
  // with an entry in caseStudies) — small-template project pages
  // (moreProjects) are always menu-sm.
  const isHome = pathname === "/";
  const isAbout = pathname === "/about";
  const caseStudySlug = pathname.startsWith("/projects/")
    ? pathname.slice("/projects/".length)
    : null;
  const isCaseStudy = caseStudySlug !== null && caseStudySlug in caseStudies;
  const showMenuLg = isHome || isAbout || isCaseStudy;
  const menuLgRef = useRef<HTMLElement>(null);
  const [menuSmProgress, setMenuSmProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<"work" | null>(null);
  const suppressSpyRef = useRef(false);

  useLayoutEffect(() => {
    if (predictedMenuLgRef.current !== null) {
      setMenuSmProgress(predictedMenuLgRef.current ? 0 : 1);
      predictedMenuLgRef.current = null;
    }
  }, [pathname, predictedMenuLgRef]);

  // Reads menu-lg's height straight off the DOM each time, rather than
  // caching it as React state — it doesn't need to be state (nothing in the
  // render depends on it), and caching it as state previously caused a race:
  // menu-lg mounting fresh on a page changed the cached height, which was a
  // dependency of the landing effect below, restarting it and cancelling the
  // pending fade-in before it ever fired.
  const computeMenuSmTarget = () => {
    const menuLgHeight = menuLgRef.current?.offsetHeight ?? 0;
    const pastNav = window.scrollY - menuLgHeight;
    return Math.min(Math.max(pastNav / MENU_FADE_ZONE, 0), 1);
  };

  // Keep menu-sm's progress accurate if the viewport resizes while menu-lg
  // is around to measure against.
  useEffect(() => {
    const onResize = () => setMenuSmProgress(computeMenuSmTarget());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  useEffect(() => {
    // Live scroll: track instantly, exactly as it always has.
    const onScroll = () => setMenuSmProgress(computeMenuSmTarget());

    let cancelLanding = () => {};

    if (wasMenuFadeNavRef.current) {
      // Landed here from a menu-bar click, already faded out (navFade ~0).
      // Deferred a frame so menu-lg, if it just mounted fresh on this page,
      // has actually laid out and its height is measurable. Then snap
      // menu-sm's progress straight to this page's real target while still
      // hidden, hold briefly, then fade the whole bar back in.
      wasMenuFadeNavRef.current = false;
      const raf = requestAnimationFrame(() => {
        setMenuSmProgress(computeMenuSmTarget());
        const timeout = setTimeout(() => {
          cancelLanding = fadeIn(NAV_ENTER_DURATION);
        }, NAV_ENTRY_DELAY);
        cancelLanding = () => clearTimeout(timeout);
      });
      cancelLanding = () => cancelAnimationFrame(raf);
    } else {
      // Re-sync on route change too — Nav never unmounts across navigations,
      // so without this it keeps the previous page's menuSmProgress for a
      // frame (e.g. landing on Work already scrolled down, but still
      // rendering menu-sm at the previous page's near-zero opacity).
      // Deferred a frame since Next's own scroll-to-target jump for the new
      // route may not have applied yet when this effect first runs.
      const raf = requestAnimationFrame(onScroll);
      cancelLanding = () => cancelAnimationFrame(raf);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelLanding();
      window.removeEventListener("scroll", onScroll);
    };
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

  // Fades the current menu out, then navigates once it's gone — for every
  // cross-page nav click, not just ones that change the menu's size. Leaving
  // a menu-lg page for a menu-sm one (or vice versa) obviously needs it, but
  // even a same-size hop (About <-> Work, both menu-sm) still gets the fade:
  // it reads as intentional rather than an abrupt content swap, even at this
  // small scale. `destinationMenuLg` is what the landing page's size will
  // actually be.
  function handleNavClick(e: React.MouseEvent, href: string, destinationMenuLg: boolean) {
    if (!isPlainLeftClick(e)) return; // let modified clicks (new tab, etc.) behave normally
    const targetPath = href.split("#")[0] || "/";
    if (targetPath === pathname) return; // already there, nothing to navigate

    e.preventDefault();
    navigate(href, destinationMenuLg);
  }

  const handleSectionClick = (id: "work") => (e: React.MouseEvent) => {
    if (pathname !== "/") {
      // Work always lands scrolled well into the section — past menu-lg's
      // fade zone — so the destination always reads as menu-sm, even from
      // a page (home) that structurally has a menu-lg element.
      handleNavClick(e, `/#${id}`, false);
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

  // On other pages menu-sm is just always fully visible. On home it fades in
  // with scroll, exactly as it always has. `navFade` layers the
  // click-triggered page-transition fade on top — combined into one "reveal"
  // value so opacity and the vertical slide move together using the exact
  // same formula as the scroll-driven case, whether the fade is coming from
  // scrolling or from a click. Computed as plain numbers (rather than
  // separately written headers per case) so menu-sm is one persistent
  // element in the tree — never freshly mounted when showMenuLg flips — and
  // is guaranteed to sit in the exact same spot everywhere instead of
  // relying on multiple copies of the same classes staying in sync.
  const menuSmReveal = (showMenuLg ? menuSmProgress : 1) * navFade;
  const menuSmOpacity = menuSmReveal;
  const menuSmTranslateY = (1 - menuSmReveal) * -12;
  const menuLgTranslateY = (1 - navFade) * -12;
  const menuInteractive = navFade > 0.5 && (!showMenuLg || menuSmProgress > 0.05);

  return (
    <>
      {/* menu-lg: floats over whatever's at the top of the page (the hero
          image on home and on large case studies, the page header on
          about). Absolute, not fixed, so it scrolls away with the content. */}
      {showMenuLg && (
        <header
          ref={menuLgRef}
          style={{ opacity: navFade, transform: `translateY(${menuLgTranslateY}px)` }}
          className="absolute inset-x-0 top-0 z-40 p-4"
        >
          <nav className={`mx-auto max-w-6xl rounded-full ${barClasses}`}>
            {/* Logo always lands at home's top, i.e. menu-lg. */}
            <Brand onNavigate={(e) => handleNavClick(e, "/", true)} />
            {/* About always lands at its own top, i.e. menu-lg too. */}
            <NavLinks
              activeHref={activeHref}
              onSectionClick={handleSectionClick}
              onNavigate={(href) => (e) => handleNavClick(e, href, true)}
            />
          </nav>
        </header>
      )}

      {/* menu-sm: fixed, and only ever starts fading in once menu-lg is
          fully out of view — so the fade in and the fade out (scrolling back
          up) are symmetric, and the two never overlap on screen. Always
          fully visible on pages that never have a menu-lg to fade from
          (small-template project pages). */}
      <header
        style={{
          opacity: menuSmOpacity,
          transform: `translateY(${menuSmTranslateY}px)`,
          pointerEvents: menuInteractive ? "auto" : "none",
        }}
        className="fixed inset-x-0 top-3 z-50 flex justify-center"
      >
        <nav className={`max-w-xl rounded-full ${barClasses}`}>
          {/* Logo always lands at home's top, i.e. menu-lg. */}
          <Brand onNavigate={(e) => handleNavClick(e, "/", true)} />
          {/* About always lands at its own top, i.e. menu-lg too. */}
          <NavLinks
            activeHref={activeHref}
            onSectionClick={handleSectionClick}
            onNavigate={(href) => (e) => handleNavClick(e, href, true)}
          />
        </nav>
      </header>
    </>
  );
}
