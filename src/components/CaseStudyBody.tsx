"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/data/projects";
import type { CaseStudy, CaseStudyBlock } from "@/data/caseStudies";
import ProjectModal from "@/components/ProjectModal";

function Block({ block }: { block: CaseStudyBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-300">{block.text}</p>
      );
    case "list":
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-lg leading-7 text-zinc-600 dark:text-zinc-300">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "insight":
      return (
        <div>
          <p className="text-lg leading-7 font-semibold text-zinc-900 dark:text-zinc-100">
            {block.number} — {block.title}
          </p>
          <p className="mt-1 text-lg leading-7 text-zinc-600 dark:text-zinc-300">
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

export default function CaseStudyBody({
  project,
  caseStudy,
}: {
  project: Project;
  caseStudy: CaseStudy;
}) {
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const sectionIds = caseStudy.sections.map((section) => section.id);
  const activeId = useScrollSpy(sectionIds);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 pb-24">
      {/* Article track is 36rem (576px): at this column's text-lg, that
          lands around 68-70 characters per line — inside body-copy
          readability guidelines (60-75 chars, ~66 target), matching the
          more spacious editorial feel of long-form references (Medium, The
          Athletic) rather than a denser news-blurb width. No explicit
          right-side column needed to keep this balanced: at max-w-6xl,
          TOC(240) + gap(48) + article(576 cap) leaves exactly 240px of
          natural space on the right — the same as the TOC, so it can't end
          up wider than the left side without any extra centering logic. */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,36rem)] lg:gap-12">
        {/* TOC: sticky so it tracks scroll position alongside the article;
            top offset clears the fixed nav pill. The quick-overview link
            lives in the same sticky block so it scrolls — and sticks —
            together with the section list, rather than scrolling away on
            its own underneath it. pt-1.5 on the nav nudges its first
            label down to visually align with the article's (larger,
            taller-line-height) first heading, since the two use different
            type sizes but should still read as starting on the same
            line. */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <nav className="space-y-2 pt-1.5">
              {caseStudy.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`block text-sm leading-5 transition-colors duration-150 ${
                    activeId === section.id
                      ? "font-medium text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {section.navLabel}
                </a>
              ))}
            </nav>
            <div className="mt-10 space-y-1.5">
              <p className="text-sm text-zinc-900 dark:text-zinc-100">Prefer a quick overview?</p>
              <button
                type="button"
                onClick={() => setHighlightsOpen(true)}
                className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                View highlights →
              </button>
            </div>
          </div>
        </aside>

        <article className="space-y-10">
          {caseStudy.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 space-y-3">
              {section.heading && (
                <p className="text-xl leading-7 font-semibold text-zinc-900 dark:text-zinc-100">
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

      <ProjectModal
        project={highlightsOpen ? project : null}
        onClose={() => setHighlightsOpen(false)}
      />
    </div>
  );
}
