"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";

const GAP_PX = 24; // matches the track's gap-6
const ANIM_DURATION = 600;

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

type Metrics = { cardWidth: number; pitch: number; containerWidth: number };

export default function ProjectSlider({ projects }: { projects: Project[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const total = projects.length;

  // The slot centered in the viewport — starts on the first project
  // (Shareable), in the middle copy of the tripled array below.
  const [activeSlot, setActiveSlot] = useState(total);

  // Triple the list so there's always a buffer of identical cards on either
  // side of whichever one is centered — lets Previous/Next move forever in
  // either direction without ever hitting a real edge, while only rendering
  // six real projects worth of content.
  const looped = [...projects, ...projects, ...projects];

  const getMetrics = (): Metrics | null => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const card = track?.children[0] as HTMLElement | undefined;
    if (!viewport || !track || !card) return null;
    const cardWidth = card.offsetWidth;
    return {
      cardWidth,
      pitch: cardWidth + GAP_PX,
      containerWidth: viewport.clientWidth,
    };
  };

  const offsetForSlot = (slot: number, metrics: Metrics) => {
    const slotCenter = slot * metrics.pitch + metrics.cardWidth / 2;
    return metrics.containerWidth / 2 - slotCenter;
  };

  const applyOffset = (value: number) => {
    offsetRef.current = value;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${value}px)`;
    }
  };

  // Once settled, if the active slot has drifted near an edge of the tripled
  // array, silently fold it (and the visual offset) back by one full set —
  // lands on pixel-identical content, so the correction is invisible.
  const foldIntoSafeBand = (slot: number, pitch: number) => {
    if (slot < total * 0.5) {
      applyOffset(offsetRef.current - total * pitch);
      return slot + total;
    }
    if (slot >= total * 1.5) {
      applyOffset(offsetRef.current + total * pitch);
      return slot - total;
    }
    return slot;
  };

  const animateToSlot = (slot: number) => {
    const metrics = getMetrics();
    if (!metrics) return;

    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
    }

    const start = offsetRef.current;
    const delta = offsetForSlot(slot, metrics) - start;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / ANIM_DURATION, 1);
      applyOffset(start + delta * easeOutQuint(progress));
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(step);
        return;
      }
      animationFrame.current = null;
      const metricsNow = getMetrics();
      if (metricsNow) {
        const folded = foldIntoSafeBand(slot, metricsNow.pitch);
        if (folded !== slot) setActiveSlot(folded);
      }
    };

    animationFrame.current = requestAnimationFrame(step);
  };

  const selectSlot = (slot: number) => {
    setActiveSlot(slot);
    animateToSlot(slot);
  };

  // Center on the starting slot instantly, before paint — no slide-in flash.
  useLayoutEffect(() => {
    const metrics = getMetrics();
    if (!metrics) return;
    applyOffset(offsetForSlot(total, metrics));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Re-center on resize, since the transform offset is computed in pixels.
  useLayoutEffect(() => {
    const handleResize = () => {
      const metrics = getMetrics();
      if (!metrics) return;
      applyOffset(offsetForSlot(activeSlot, metrics));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeSlot]);

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
        More projects
      </h2>
      <div className="mt-6">
        <div ref={viewportRef} className="edge-fade overflow-hidden">
          <div ref={trackRef} className="flex gap-6" style={{ willChange: "transform" }}>
            {looped.map((project, i) => (
              <div key={`${project.slug}-${i}`} className="w-56 shrink-0 sm:w-64 md:w-72">
                <ProjectCard project={project} compact hideButton />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="group relative inline-flex h-9 items-center rounded-full bg-[#f7f7f7]/80 p-1 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150 dark:bg-zinc-900/70">
            <button
              type="button"
              onClick={() => selectSlot(activeSlot - 1)}
              aria-label="Previous projects"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#1a1a1a] transition-colors duration-150 hover:bg-black/5 active:bg-black/10 dark:text-zinc-100 dark:hover:bg-white/10 dark:active:bg-white/15"
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
              <div className="h-5 w-px bg-[#d9d9d9] opacity-100 transition-opacity duration-150 group-hover:opacity-0 dark:bg-zinc-600" />
            </div>
            <button
              type="button"
              onClick={() => selectSlot(activeSlot + 1)}
              aria-label="Next projects"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#1a1a1a] transition-colors duration-150 hover:bg-black/5 active:bg-black/10 dark:text-zinc-100 dark:hover:bg-white/10 dark:active:bg-white/15"
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
