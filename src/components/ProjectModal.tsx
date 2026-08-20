"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/data/projects";

// Matches the transition duration below (320ms, Apple's own curve).
const CLOSE_DURATION = 320;

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  // Keeps rendering the last-open project through the close animation, so
  // the content doesn't vanish before the fade/scale-out finishes. Adjusted
  // during render (React's documented pattern for prop-derived state, see
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  // rather than in an effect — an effect here would itself be reacting to
  // the `project` prop and firing a second render, the exact cascading
  // effect chain that bit the slider's own reset-on-change effect earlier.
  const [renderedProject, setRenderedProject] = useState(project);
  const [visible, setVisible] = useState(false);
  if (project !== null && project !== renderedProject) {
    setRenderedProject(project);
  }
  // Drop to closed the instant the prop says so — no delay needed for this
  // direction, only the reverse (open) needs the effect below's next-frame
  // trick to avoid skipping the transition entirely.
  if (project === null && visible) {
    setVisible(false);
  }

  useEffect(() => {
    if (project) {
      // Mount in the closed state, then flip to visible next frame so the
      // transition actually runs instead of starting already at its end
      // state (which would just be an instant snap-in).
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    const timeout = setTimeout(() => setRenderedProject(null), CLOSE_DURATION);
    return () => clearTimeout(timeout);
  }, [project]);

  useEffect(() => {
    if (!renderedProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [renderedProject, onClose]);

  if (!renderedProject || typeof document === "undefined") return null;

  // Portaled straight to <body>: FadeIn (wrapping the section this card
  // lives in) applies a CSS transform for its own reveal animation, and any
  // transformed ancestor becomes the containing block for `fixed`
  // descendants per the CSS spec — without the portal, this modal's
  // fixed positioning would resolve against that section's box instead of
  // the real viewport, cutting the overlay off partway down the page.
  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      {/* Overlay and card move in exact lockstep — no stagger, no scale,
          just opacity fading together, on Apple's own curve: pulled straight
          off apple.com's nav/search-overlay transitions via computed style
          (cubic-bezier(0.4, 0, 0.6, 1), 320ms) — close to but not quite
          ease-in-out, with wider control points. (A ~150ms lead/lag stagger
          was tried, based on frame-counting a real Apple recording, but the
          user preferred it back at exact lockstep — keep it this way unless
          asked again.)

          Blur itself is NOT animated (backdrop-blur-[80px] is always on) —
          only this layer's opacity fades, matching Apple's own
          globalnav-curtain element, which likewise holds backdrop-filter
          constant and only transitions opacity. Safari doesn't reliably
          interpolate an animated backdrop-filter, so ramping the blur radius
          left the page looking comparatively sharp for most of the
          transition instead of smoothly softening. The 80px figure (well
          past Tailwind's largest built-in step, blur-3xl at 64px) came from
          a direct side-by-side screenshot comparison against apple.com —
          their blur reads as fully illegible text/edges, which needed
          noticeably more than the built-in scale provides. */}
      <div
        onClick={onClose}
        aria-hidden
        className={`absolute inset-0 bg-black/30 backdrop-blur-[80px] transition-opacity duration-[320ms] ease-[cubic-bezier(0.4,0,0.6,1)] ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute top-1/2 left-1/2 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[700px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-card-lg bg-white transition-opacity duration-[320ms] ease-[cubic-bezier(0.4,0,0.6,1)] sm:h-[850px] dark:bg-zinc-900 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Sits outside the scrolling div below, so it stays pinned to the
            corner instead of scrolling away with the content. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-8 right-8 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-zinc-900 transition-colors duration-150 hover:bg-black/5 active:bg-black/10 dark:text-zinc-100 dark:hover:bg-white/10 dark:active:bg-white/15"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="no-scrollbar h-full overflow-y-auto">
          <div className="px-6 pt-16 pb-16 sm:px-[72px] sm:pt-20">
            <div className="mx-auto max-w-[33rem]">
              <h2 className="font-serif text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {renderedProject.title}
              </h2>
              <p className="mt-3 font-serif text-xl italic text-zinc-900 dark:text-zinc-100">
                {renderedProject.tagline}
              </p>

              <div className="mt-8 aspect-[3/2] overflow-hidden rounded-card bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={renderedProject.image}
                  alt={renderedProject.title}
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>

              <p className="mt-12 font-serif text-xl leading-7 text-zinc-600 dark:text-zinc-300">
                {renderedProject.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
