"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";

const GAP_PX = 24; // matches the track's gap-6
const ANIM_DURATION = 800;
// Exactly this many full cards visible at once — no partial/peeking card at
// either edge. Card width is computed to fit the count exactly, rather than
// the other way around. Tried largest-first, falling back until cards stay
// at or above MIN_CARD_WIDTH. Deliberately skips 4 — odd counts keep a
// single centered card, which is preferred over an even split.
const VISIBLE_COUNT_OPTIONS = [5, 3, 2] as const;
const MIN_CARD_WIDTH = 200;
// Buffer between the clip boundary and the nearest full card — half the
// inter-card gap — so the cut line doesn't sit flush against a card's edge.
const EDGE_INSET_PX = GAP_PX / 2;
// A dot's target offset (-index * pitch) and maxOffset (containerWidth -
// contentWidth) are mathematically identical at the last stop, but they're
// each built from a different chain of floating-point arithmetic, so they
// can land a hair apart — enough for a strict >=/<= boundary check to read
// "not quite there," leaving the next/prev button enabled for one extra,
// invisible click. Slack here is well above any float error but nowhere
// near a perceptible pixel.
const EDGE_EPSILON_PX = 0.5;

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

// Pure function of viewport width, so effects can compute the new card width
// and immediately use it (metrics, offset clamping) without waiting for a
// render + DOM readback — that readback lag was the root of the cascading
// effect this replaced (measure sets cardWidth -> a second effect reacts to
// the changed cardWidth -> sets more state -> another render).
//
// Reserves EDGE_INSET_PX on each side (via matching padding on the viewport
// element) before dividing up the remaining width — cards fill that reduced
// width with zero slack, so the clip boundary lands EDGE_INSET_PX past the
// last full card's edge instead of flush against it.
function computeLayout(viewportWidth: number) {
  const available = viewportWidth - 2 * EDGE_INSET_PX;
  const widthFor = (count: number) => (available - (count - 1) * GAP_PX) / count;
  const count =
    VISIBLE_COUNT_OPTIONS.find((option) => widthFor(option) >= MIN_CARD_WIDTH) ??
    VISIBLE_COUNT_OPTIONS[VISIBLE_COUNT_OPTIONS.length - 1];
  return { count, width: widthFor(count) };
}

type Metrics = { pitch: number; containerWidth: number; contentWidth: number };

export default function ProjectSlider({ projects }: { projects: Project[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const total = projects.length;

  const [openProject, setOpenProject] = useState<Project | null>(null);

  // Computed so exactly visibleCount cards fill the viewport width, with no
  // partial card ever showing at the edges.
  const [cardWidth, setCardWidth] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(VISIBLE_COUNT_OPTIONS[1]);
  const dotCount = Math.max(1, total - visibleCount + 1);

  // Driven directly off the track's pixel offset rather than a project
  // index — with a fixed step size some trailing indices land on the same
  // clamped offset as their neighbor, which made index-based paging get
  // "stuck" (a click would flip the disabled state without visibly moving).
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Derived purely from state (never read back off the DOM). offsetWidth
  // always rounds to a whole pixel for reporting, even when the card's
  // actual CSS width — cardWidth — is fractional; multiplying that rounded
  // value out across every card compounded into a few stray pixels of
  // drift, which showed up as the last "next" click landing short of the
  // true end and needing an extra, barely-moving click before the button
  // actually disabled. Computing containerWidth and contentWidth from the
  // same exact cardWidth used to size the cards keeps them perfectly
  // self-consistent, so maxOffset always lands on an exact multiple of
  // pitch and every step (including the last) moves a full card.
  const metrics: Metrics | null = useMemo(() => {
    if (cardWidth === null) return null;
    return {
      pitch: cardWidth + GAP_PX,
      containerWidth: visibleCount * cardWidth + (visibleCount - 1) * GAP_PX,
      contentWidth: total * cardWidth + (total - 1) * GAP_PX,
    };
  }, [cardWidth, visibleCount, total]);

  const maxOffset = (metrics: Metrics) =>
    Math.min(0, metrics.containerWidth - metrics.contentWidth);

  const applyOffset = (value: number) => {
    offsetRef.current = value;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${value}px)`;
    }
  };

  const animateTo = (target: number, metrics: Metrics) => {
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
    }

    const start = offsetRef.current;
    const delta = target - start;
    let startTime: number | null = null;

    const step = (now: number) => {
      startTime ??= now;
      const progress = Math.min((now - startTime) / ANIM_DURATION, 1);
      applyOffset(start + delta * easeOutQuint(progress));
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(step);
        return;
      }
      animationFrame.current = null;
    };

    animationFrame.current = requestAnimationFrame(step);
    setAtStart(target >= -EDGE_EPSILON_PX);
    setAtEnd(target <= maxOffset(metrics) + EDGE_EPSILON_PX);
    setCurrentIndex(Math.round(-target / metrics.pitch));
  };

  // Steps by index (via goToIndex) rather than by raw pixel offset. The
  // offset at the last stop is clamped to maxOffset, which generally isn't
  // an exact multiple of pitch (the last "page" is rarely a full step) — so
  // stepping back by a flat pitch amount from that clamped position carried
  // its leftover fraction into every subsequent stop, leaving cards a few
  // pixels out of alignment on the way back. Re-deriving the target from the
  // index each time keeps every stop pinned to the same grid dots use.
  const goTo = (direction: 1 | -1) => {
    goToIndex(Math.min(Math.max(currentIndex + direction, 0), dotCount - 1));
  };

  const goToIndex = (index: number) => {
    if (!metrics) return;
    const target = Math.min(0, Math.max(-index * metrics.pitch, maxOffset(metrics)));
    animateTo(target, metrics);
  };

  // Measures the viewport, sizes the cards, and snaps the track back to the
  // start — all synchronously before paint, so there's no flash of
  // wrongly-sized cards or a visible jump to index 0. Only reruns when the
  // project list itself changes (mount included); resizing is handled
  // separately below and deliberately does NOT reset scroll position.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const { count, width } = computeLayout(viewport.clientWidth);
    const containerWidth = viewport.clientWidth - 2 * EDGE_INSET_PX;
    const contentWidth = total * width + (total - 1) * GAP_PX;
    const max = Math.min(0, containerWidth - contentWidth);

    setVisibleCount(count);
    setCardWidth(width);
    applyOffset(0);
    setAtStart(true);
    setAtEnd(max >= 0);
    setCurrentIndex(0);
  }, [total]);

  // Re-measures and re-clamps whenever the viewport's actual box size
  // changes, preserving scroll position (just bounding it) rather than
  // resetting to the start. A ResizeObserver on the viewport itself, not a
  // window "resize" listener — the latter only fires when the browser
  // window's outer dimensions change, so it misses the container growing or
  // shrinking from something else (a font swap reflow, content above it
  // loading in, etc.). That gap was letting a stale, too-narrow card width
  // stick around after the container actually had room for another full
  // card, leaving a partial one peeking at the edge instead of clipping
  // cleanly. Recomputes the width directly instead of reading it back off
  // the DOM, since a readback here would still see the pre-resize layout.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleResize = () => {
      const { count, width } = computeLayout(viewport.clientWidth);
      const pitch = width + GAP_PX;
      const containerWidth = viewport.clientWidth - 2 * EDGE_INSET_PX;
      const contentWidth = total * width + (total - 1) * GAP_PX;
      const max = Math.min(0, containerWidth - contentWidth);
      const bounded = Math.min(0, Math.max(offsetRef.current, max));

      setVisibleCount(count);
      setCardWidth(width);
      applyOffset(bounded);
      setAtStart(bounded >= -EDGE_EPSILON_PX);
      setAtEnd(bounded <= max + EDGE_EPSILON_PX);
      setCurrentIndex(Math.round(-bounded / pitch));
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [total]);

  // Trackpad / Magic Mouse horizontal swipes arrive as wheel events with a
  // dominant deltaX. Only take over when the gesture is actually horizontal
  // — vertical page scrolling over the slider should pass through untouched.
  // Needs a real (non-passive) listener rather than React's onWheel prop,
  // since preventDefault on a passive listener is silently ignored.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !metrics) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

      e.preventDefault();
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }

      const min = maxOffset(metrics);
      const next = Math.min(0, Math.max(offsetRef.current - e.deltaX, min));
      applyOffset(next);
      setAtStart(next >= -EDGE_EPSILON_PX);
      setAtEnd(next <= min + EDGE_EPSILON_PX);
      setCurrentIndex(Math.round(-next / metrics.pitch));
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [metrics]);

  return (
    <div className="mx-auto w-full lg:w-[70vw] lg:max-w-[1024px]">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
        Other work
      </h2>
      <div className="mt-6">
        {/* Cards are sized (via cardWidth) so exactly visibleCount fill this
            viewport's width, minus the EDGE_INSET_PX reserved on each side
            (see computeLayout above) — the horizontal padding here matches
            that reserve, so the clip boundary lands EDGE_INSET_PX past the
            last card's edge instead of flush against it. The vertical
            padding gives the hover shadow (0 4px 20px) room to render
            without being clipped, since there's no card above or below to
            accidentally reveal. */}
        <div
          ref={viewportRef}
          className="relative overflow-hidden px-3 pt-5 pb-8"
        >
          <div ref={trackRef} className="flex gap-6" style={{ willChange: "transform" }}>
            {projects.map((project) => (
              <div
                key={project.slug}
                style={{ width: cardWidth ?? undefined }}
                className="shrink-0"
              >
                <ProjectCard project={project} compact onOpen={setOpenProject} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center pr-[13px]">
          <div />
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: dotCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === currentIndex}
                className={`h-1.5 w-1.5 cursor-pointer rounded-full transition-colors duration-150 ${
                  i === currentIndex
                    ? "bg-zinc-900/60 dark:bg-zinc-100/60"
                    : "bg-zinc-900/15 hover:bg-zinc-900/30 dark:bg-zinc-100/15 dark:hover:bg-zinc-100/30"
                }`}
              />
            ))}
          </div>
          <div className="group relative ml-auto inline-flex h-9 items-center rounded-full bg-glass/80 p-1 shadow-glass backdrop-blur-xl backdrop-saturate-150 dark:bg-zinc-900/70">
            <button
              type="button"
              onClick={() => goTo(-1)}
              disabled={atStart}
              aria-label="Previous project"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-zinc-900 transition-colors duration-150 hover:bg-black/5 active:bg-black/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-100 dark:hover:bg-white/10 dark:active:bg-white/15"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px]"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex w-[3px] items-center justify-center px-px">
              <div className="h-5 w-px bg-zinc-200 transition-opacity duration-150 group-hover:opacity-0 dark:bg-zinc-600" />
            </div>
            <button
              type="button"
              onClick={() => goTo(1)}
              disabled={atEnd}
              aria-label="Next project"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-zinc-900 transition-colors duration-150 hover:bg-black/5 active:bg-black/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-100 dark:hover:bg-white/10 dark:active:bg-white/15"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px]"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />
    </div>
  );
}
