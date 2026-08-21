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
// single centered card, which is preferred over an even split. The trailing
// 1 is what phone widths land on — two cards at MIN_CARD_WIDTH don't fit, so
// it falls all the way through to a single, full-width card per page.
const VISIBLE_COUNT_OPTIONS = [5, 3, 2, 1] as const;
const MIN_CARD_WIDTH = 200;
// Buffer between the clip boundary and the nearest full card — a bit over
// half the inter-card gap — so the cut line doesn't sit flush against a
// card's edge.
const EDGE_INSET_PX = GAP_PX / 2 + 4;
// A dot's target offset (upper - index * pitch) and metrics.lower are
// mathematically identical at the last stop, but they're each built from a
// different chain of floating-point arithmetic, so they can land a hair
// apart — enough for a strict >=/<= boundary check to read "not quite
// there," leaving the next/prev button enabled for one extra,
// invisible click. Slack here is well above any float error but nowhere
// near a perceptible pixel.
const EDGE_EPSILON_PX = 0.5;
// The lone mobile card (count === 1) is pinned to this width — the large
// case-study card's own IMAGE (not the whole card) is a landscape
// aspect-[3/2] roughly this tall at that size — and the snapshot's own
// aspect-[2/3] is that same box just turned on its side, portrait instead
// of landscape.
const SINGLE_CARD_WIDTH_PX = 225;
// Below this many pixels of pointer movement, a touch is still treated as a
// tap (opens the card) rather than the start of a swipe.
const DRAG_TAP_THRESHOLD_PX = 6;
// Fraction of a card's pitch a swipe has to cross before it commits to the
// next/previous card instead of snapping back to the current one.
const SWIPE_COMMIT_RATIO = 0.2;

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

  if (count === 1) {
    return { count, width: Math.min(SINGLE_CARD_WIDTH_PX, widthFor(count)) };
  }

  return { count, width: widthFor(count) };
}

type Metrics = {
  count: number;
  width: number;
  pitch: number;
  containerWidth: number;
  contentWidth: number;
  // The offset (track translateX) bounds — "upper" is the offset for index
  // 0 (the rightmost/least-scrolled stop), "lower" is the offset for the
  // last index (the leftmost/most-scrolled stop). For the multi-card
  // layout these are the old flush-align bounds (upper is always 0). For
  // the single-card mobile layout, the clip window (containerWidth) is
  // wider than one card, so upper is pushed right by half that slack —
  // centering card 0 in the window instead of pinning it flush left —
  // and every following index is centered the same way, one pitch apart.
  upper: number;
  lower: number;
};

// Single source of truth for every offset calculation (paging, wheel,
// drag, and the initial/resize layout effects) — they used to each
// recompute containerWidth/contentWidth/bounds slightly differently,
// which was enough drift between them to leave swipe and paging
// disagreeing about where the track was allowed to land.
function computeSlideMetrics(viewportWidth: number, total: number): Metrics {
  const { count, width } = computeLayout(viewportWidth);
  const pitch = width + GAP_PX;
  const containerWidth = viewportWidth - 2 * EDGE_INSET_PX;
  const contentWidth = total * width + (total - 1) * GAP_PX;
  const upper = count === 1 ? (containerWidth - width) / 2 : 0;
  const lower =
    count === 1 ? upper - (total - 1) * pitch : Math.min(0, containerWidth - contentWidth);
  return { count, width, pitch, containerWidth, contentWidth, upper, lower };
}

export default function ProjectSlider({ projects }: { projects: Project[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: number;
    moved: boolean;
  } | null>(null);
  // Set when a drag actually moved the track, so the click that a touchend
  // synthesizes right after can be swallowed instead of opening the card.
  const justDraggedRef = useRef(false);
  const total = projects.length;

  const [openProject, setOpenProject] = useState<Project | null>(null);

  // Only the raw measurement is state — count/width/pitch/bounds are all
  // derived from it (plus total) via computeSlideMetrics below, so there's
  // exactly one place that formula lives.
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);

  const metrics: Metrics | null = useMemo(() => {
    if (viewportWidth === null) return null;
    return computeSlideMetrics(viewportWidth, total);
  }, [viewportWidth, total]);

  const cardWidth = metrics?.width ?? null;
  const visibleCount = metrics?.count ?? VISIBLE_COUNT_OPTIONS[1];
  const dotCount = Math.max(1, total - visibleCount + 1);

  // Driven directly off the track's pixel offset rather than a project
  // index — with a fixed step size some trailing indices land on the same
  // clamped offset as their neighbor, which made index-based paging get
  // "stuck" (a click would flip the disabled state without visibly moving).
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    setAtStart(target >= metrics.upper - EDGE_EPSILON_PX);
    setAtEnd(target <= metrics.lower + EDGE_EPSILON_PX);
    setCurrentIndex(Math.round((metrics.upper - target) / metrics.pitch));
  };

  // Steps by index (via goToIndex) rather than by raw pixel offset. The
  // offset at the last stop is clamped to metrics.lower, which generally
  // isn't an exact multiple of pitch below metrics.upper (the last "page"
  // is rarely a full step) — so stepping back by a flat pitch amount from
  // that clamped position carried its leftover fraction into every
  // subsequent stop, leaving cards a few pixels out of alignment on the way
  // back. Re-deriving the target from the index each time keeps every stop
  // pinned to the same grid dots use.
  const goTo = (direction: 1 | -1) => {
    goToIndex(Math.min(Math.max(currentIndex + direction, 0), dotCount - 1));
  };

  const goToIndex = (index: number) => {
    if (!metrics) return;
    const target = Math.min(
      metrics.upper,
      Math.max(metrics.upper - index * metrics.pitch, metrics.lower),
    );
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
    const next = computeSlideMetrics(viewport.clientWidth, total);

    setViewportWidth(viewport.clientWidth);
    applyOffset(next.upper);
    setAtStart(true);
    setAtEnd(next.lower >= next.upper - EDGE_EPSILON_PX);
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
      const next = computeSlideMetrics(viewport.clientWidth, total);
      const bounded = Math.min(next.upper, Math.max(offsetRef.current, next.lower));

      setViewportWidth(viewport.clientWidth);
      applyOffset(bounded);
      setAtStart(bounded >= next.upper - EDGE_EPSILON_PX);
      setAtEnd(bounded <= next.lower + EDGE_EPSILON_PX);
      setCurrentIndex(Math.round((next.upper - bounded) / next.pitch));
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

      const next = Math.min(metrics.upper, Math.max(offsetRef.current - e.deltaX, metrics.lower));
      applyOffset(next);
      setAtStart(next >= metrics.upper - EDGE_EPSILON_PX);
      setAtEnd(next <= metrics.lower + EDGE_EPSILON_PX);
      setCurrentIndex(Math.round((metrics.upper - next) / metrics.pitch));
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [metrics]);

  // Touch/pen swipe-to-page. Restricted to touch/pen (not mouse) so it
  // layers on top of, rather than fights with, the existing click-to-open
  // and wheel/trackpad handling. The viewport's `touch-pan-y` lets the
  // browser keep handling vertical page scrolling natively — we only ever
  // see the gesture at all once it's already horizontal enough not to be a
  // scroll, so there's no preventDefault tug-of-war with the page.
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
    if (!metrics) return;
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffset: offsetRef.current,
      moved: false,
    };
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (!justDraggedRef.current) return;
    justDraggedRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId || !metrics) return;

      const dx = e.clientX - drag.startX;
      if (!drag.moved) {
        const dy = e.clientY - drag.startY;
        if (Math.abs(dx) < DRAG_TAP_THRESHOLD_PX && Math.abs(dy) < DRAG_TAP_THRESHOLD_PX) return;
        drag.moved = true;
      }

      applyOffset(Math.min(metrics.upper, Math.max(drag.startOffset + dx, metrics.lower)));
    };

    const endDrag = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      dragRef.current = null;
      if (!drag.moved || !metrics) return;

      justDraggedRef.current = true;
      const dragged = offsetRef.current - drag.startOffset;
      const threshold = metrics.pitch * SWIPE_COMMIT_RATIO;
      let targetIndex = currentIndex;
      if (dragged <= -threshold) targetIndex = currentIndex + 1;
      else if (dragged >= threshold) targetIndex = currentIndex - 1;
      goToIndex(Math.min(Math.max(targetIndex, 0), dotCount - 1));
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [metrics, currentIndex, dotCount]);

  return (
    <div className="mx-auto w-full lg:w-[70vw] lg:max-w-[1024px]">
      {/* pl-7 lines the heading up with the hero headline's own left edge on
          mobile (~39px in at typical phone widths — the hero text isn't
          flush against its own container either, since it's centered as a
          block within a wider padded area). Only below sm; the multi-card
          desktop layout has no such offset. */}
      <h2 className="pl-7 font-serif text-2xl font-semibold tracking-tight text-zinc-900 sm:pl-0 sm:text-3xl dark:text-zinc-100">
        Snapshots
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
        {/* viewportRef stays naturally full-width and unstyled — it's purely
            the measurement source for computeLayout/ResizeObserver. Pinning
            a computed pixel width onto the same element being measured
            would make it self-referential (resize would only ever re-detect
            its own last-set width). The inner div below is the actual
            visual clip box, sized to the exact computed metrics and
            centered via mx-auto, so there's no reliance on the outer
            padding happening to match EDGE_INSET_PX pixel-for-pixel. The
            mx-4 here only insets the card viewport — the controls row below
            stays outside it, flush with the section's own edge, so the
            stepper can sit close to the page edge. */}
        {/* -mx-3 cancels the home page's own px-3 mobile padding (the
            section wrapper in page.tsx) so the viewport reaches the true
            screen edge below sm, letting the single mobile card's neighbors
            peek in further on both sides. sm+ keeps the original mx-4 inset;
            lg+ reverts to flush (no inset) same as before. */}
        <div className="-mx-3 sm:mx-4 lg:mx-0">
          <div ref={viewportRef} className="w-full">
            <div
              onPointerDown={handlePointerDown}
              onClickCapture={handleClickCapture}
              style={{
                width: metrics ? metrics.containerWidth + 2 * EDGE_INSET_PX : undefined,
              }}
              className="relative mx-auto touch-pan-y overflow-hidden px-4 pt-5 pb-8"
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
          </div>
        </div>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center">
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
          {/* Hidden on mobile — swipe is the primary way to move the slider
              there; the stepper only shows once there's room for a mouse-
              driven desktop layout, at sm and up. */}
          <div className="group relative ml-auto hidden h-9 w-[74px] items-center justify-center gap-0.5 rounded-full bg-glass/80 p-1 shadow-glass backdrop-blur-xl backdrop-saturate-150 sm:inline-flex dark:bg-zinc-900/70">
            <button
              type="button"
              onClick={() => goTo(-1)}
              disabled={atStart}
              aria-label="Previous project"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-zinc-700 transition-colors duration-150 hover:bg-black/5 active:bg-black/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-white/10 dark:active:bg-white/15"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex w-[6px] items-center justify-center px-px">
              <div className="h-5 w-px bg-zinc-200 transition-opacity duration-150 group-hover:opacity-0 dark:bg-zinc-600" />
            </div>
            <button
              type="button"
              onClick={() => goTo(1)}
              disabled={atEnd}
              aria-label="Next project"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-zinc-700 transition-colors duration-150 hover:bg-black/5 active:bg-black/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-white/10 dark:active:bg-white/15"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
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
