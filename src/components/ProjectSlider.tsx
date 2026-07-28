"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";

const GAP_PX = 24; // matches the track's gap-6
const ANIM_DURATION = 800;
// Width of the edge fade, in px — just enough to soften the cut so it
// doesn't read as a hard line, without washing out the peeking card.
const FADE_PX = 35;

// A plain 2-stop linear gradient has a sharp kink in its rate of change
// right where it meets the un-faded image — the eye reads that as a hard
// edge (a Mach band) even though the color itself is technically
// continuous. `smoothstep` (3t² - 2t³) has zero slope at both ends, which
// kills that kink, while still reaching ~50% opacity by the halfway point —
// most cards only overflow the fade zone partway, so a curve that stays
// near-zero until late (as a pure ease-in would) reads as invisible for
// anything short of a near-total overflow.
const EASE_STOPS: [pos: number, alphaPct: number][] = Array.from(
  { length: 11 },
  (_, i): [number, number] => {
    const t = i / 10;
    const alpha = 3 * t ** 2 - 2 * t ** 3;
    return [t * 100, Math.round(alpha * 1000) / 10];
  },
);

function edgeGradient(direction: "to left" | "to right") {
  const stops = EASE_STOPS.map(
    ([pos, alpha]) => `color-mix(in srgb, var(--background) ${alpha}%, transparent) ${pos}%`,
  ).join(", ");
  return `linear-gradient(${direction}, ${stops})`;
}

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

type Metrics = { pitch: number; containerWidth: number; contentWidth: number };

export default function ProjectSlider({ projects }: { projects: Project[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const total = projects.length;

  // Driven directly off the track's pixel offset rather than a project
  // index — with a fixed step size some trailing indices land on the same
  // clamped offset as their neighbor, which made index-based paging get
  // "stuck" (a click would flip the disabled state without visibly moving).
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const getMetrics = (): Metrics | null => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const card = track?.children[0] as HTMLElement | undefined;
    if (!viewport || !track || !card) return null;
    const cardWidth = card.offsetWidth;
    return {
      pitch: cardWidth + GAP_PX,
      containerWidth: viewport.clientWidth,
      contentWidth: total * cardWidth + (total - 1) * GAP_PX,
    };
  };

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
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / ANIM_DURATION, 1);
      applyOffset(start + delta * easeOutQuint(progress));
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(step);
        return;
      }
      animationFrame.current = null;
    };

    animationFrame.current = requestAnimationFrame(step);
    setAtStart(target >= 0);
    setAtEnd(target <= maxOffset(metrics));
  };

  const goTo = (direction: 1 | -1) => {
    const metrics = getMetrics();
    if (!metrics) return;
    const raw = offsetRef.current - direction * metrics.pitch;
    const target =
      direction === 1
        ? Math.max(raw, maxOffset(metrics))
        : Math.min(raw, 0);
    animateTo(target, metrics);
  };

  // Snap to the start instantly, before paint — no slide-in flash.
  useLayoutEffect(() => {
    applyOffset(0);
    setAtStart(true);
    const metrics = getMetrics();
    setAtEnd(metrics ? maxOffset(metrics) >= 0 : false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Re-clamp on resize, since the offset is computed in pixels.
  useLayoutEffect(() => {
    const handleResize = () => {
      const metrics = getMetrics();
      if (!metrics) return;
      const bounded = Math.min(0, Math.max(offsetRef.current, maxOffset(metrics)));
      applyOffset(bounded);
      setAtStart(bounded >= 0);
      setAtEnd(bounded <= maxOffset(metrics));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="mx-auto w-full lg:w-[70vw] lg:max-w-[1024px]">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
        More projects
      </h2>
      <div className="mt-6">
        {/* Clipped to exactly the same width as the case-study cards — no
            card content ever renders past that edge. The fade lives inside
            that boundary, over the last FADE_PX of whatever's visible. */}
        <div ref={viewportRef} className="relative overflow-hidden">
          <div ref={trackRef} className="flex gap-6" style={{ willChange: "transform" }}>
            {projects.map((project) => (
              <div key={project.slug} className="w-56 shrink-0 sm:w-64 md:w-72">
                <ProjectCard project={project} compact hideButton />
              </div>
            ))}
          </div>
          {/* Edge fades are separate overlays, not a mask, so opacity can
              actually transition — a mask-image swap can't animate since
              the "no fade" and "faded" gradients have different stop counts. */}
          <div
            aria-hidden
            style={{
              width: FADE_PX,
              opacity: atStart ? 0 : 1,
              transitionDuration: `${ANIM_DURATION}ms`,
              backgroundImage: edgeGradient("to left"),
            }}
            className="pointer-events-none absolute inset-y-0 left-0 transition-opacity"
          />
          <div
            aria-hidden
            style={{
              width: FADE_PX,
              opacity: atEnd ? 0 : 1,
              transitionDuration: `${ANIM_DURATION}ms`,
              backgroundImage: edgeGradient("to right"),
            }}
            className="pointer-events-none absolute inset-y-0 right-0 transition-opacity"
          />
        </div>
        <div className="mt-4 flex justify-end pr-[13px]">
          <div className="group relative inline-flex h-9 items-center rounded-full bg-[#f7f7f7]/80 p-1 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150 dark:bg-zinc-900/70">
            <button
              type="button"
              onClick={() => goTo(-1)}
              disabled={atStart}
              aria-label="Previous project"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#1a1a1a] transition-colors duration-150 hover:bg-black/5 active:bg-black/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-100 dark:hover:bg-white/10 dark:active:bg-white/15"
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
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#1a1a1a] transition-colors duration-150 hover:bg-black/5 active:bg-black/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-100 dark:hover:bg-white/10 dark:active:bg-white/15"
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
    </div>
  );
}
