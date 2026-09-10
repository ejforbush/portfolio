"use client";

import { useEffect, useState } from "react";
import type { CaseStudy, CaseStudyBlock } from "@/data/caseStudies";

function Block({ block }: { block: CaseStudyBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="font-serif text-xl leading-7 text-zinc-600 dark:text-zinc-300">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className="list-disc space-y-1.5 pl-5 font-serif text-xl leading-7 text-zinc-600 dark:text-zinc-300">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "insight":
      return (
        <div>
          <p className="font-serif text-xl leading-7 font-semibold text-zinc-900 dark:text-zinc-100">
            {block.number} — {block.title}
          </p>
          <p className="mt-1 font-serif text-xl leading-7 text-zinc-600 dark:text-zinc-300">
            {block.body}
          </p>
        </div>
      );
  }
}

// The active section is whichever heading has most recently scrolled past
// the line one-third down the viewport, i.e. the last one in document order
// whose top is at or above that line — matching what the reader is
// actually looking at, rather than a strip pinned near the sticky nav.
// Unlike a fixed-height "band" (an IntersectionObserver rootMargin
// approach), this can't skip short, consecutive sections that pass the
// check within the same scroll tick.
function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const handleScroll = () => {
      const offset = window.innerHeight / 3;
      let current = elements[0]?.id ?? null;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= offset) {
          current = el.id;
        } else {
          break;
        }
      }
      if (current) setActiveId(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ids]);

  return activeId;
}

export default function CaseStudyBody({ caseStudy }: { caseStudy: CaseStudy }) {
  const sectionIds = caseStudy.sections.map((section) => section.id);
  const activeId = useScrollSpy(sectionIds);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-24">
      {/* Symmetric [1fr][33rem][1fr] gutter layout — a normal (non-absolute)
          grid, so the TOC stays fully in flow and its sticky child gets a
          proper containing block stretched to the article's height (grid's
          default align-items: stretch), letting it track scroll the whole
          way down like before. Because both gutters are the same 1fr, the
          middle (article) column is always exactly page-centered on its
          own — independent of the TOC's presence and of this container's
          own width — while the TOC lives as a normal grid item in the left
          gutter, not glued to the article as a combined block. That
          independence is why bumping this cap from max-w-6xl to max-w-7xl
          only pushes the TOC toward the true page edge (more gutter room
          on wide screens) without shifting the article at all. At this
          container's max-w-7xl cap, gap-x-6 (24px) × 2 + article's 33rem
          (528px) leaves 656px for the two gutters — 328px each,
          comfortably more than the TOC's natural ~240px, so it degrades
          gracefully (not a hard cutoff) as the viewport narrows below
          that. The TOC's own width is left fluid (w-full, not a fixed px)
          minus the aside's pr-6, so it shrinks along with its gutter
          rather than overflowing it, while always keeping that fixed
          buffer before the gap. */}
      <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-[1fr_minmax(0,33rem)_1fr] lg:gap-x-6">
        {/* TOC: sticky so it tracks scroll position alongside the article;
            top offset clears the fixed nav pill. pt-1.5 on the nav nudges
            its first label down to visually align with the article's
            (larger, taller-line-height) first heading, since the two use
            different type sizes but should still read as starting on the
            same line. pr-6 reserves a fixed buffer (matching the page's own
            px-6 edge padding) between the TOC text and the grid's gap-x-6,
            so long labels that wrap out to the gutter's full fluid width
            still land with even spacing before the article — without it,
            the only separation left at narrower viewports is the 24px grid
            gap itself, which reads as cramped once a label reaches it. */}
        <aside className="hidden pr-6 lg:block">
          <div className="sticky top-24 w-full">
            <nav className="space-y-2 pt-1.5">
              {caseStudy.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="relative block text-sm leading-5">
                  {/* Invisible bold copy reserves the line count the active
                      (font-medium) state needs, so switching a label's
                      weight in and out never changes this link's height —
                      without it, a label that wraps to an extra line only
                      when bold would jump the rest of the TOC as it's
                      scrolled past. */}
                  <span aria-hidden className="invisible block font-medium">
                    {section.navLabel}
                  </span>
                  <span
                    className={`absolute inset-0 transition-colors duration-150 ${
                      activeId === section.id
                        ? "font-medium text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                  >
                    {section.navLabel}
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="space-y-10">
          {caseStudy.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 space-y-3">
              {section.heading && (
                <p className="font-serif text-xl leading-7 font-semibold text-zinc-900 dark:text-zinc-100">
                  {section.heading}
                </p>
              )}
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
