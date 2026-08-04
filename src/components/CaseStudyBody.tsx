"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import type { CaseStudy, CaseStudyBlock } from "@/data/caseStudies";
import ProjectModal from "@/components/ProjectModal";

function Block({ block }: { block: CaseStudyBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-sm leading-5 text-zinc-600 dark:text-zinc-300">{block.text}</p>
      );
    case "list":
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-5 text-zinc-600 dark:text-zinc-300">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "insight":
      return (
        <div>
          <p className="text-sm leading-5 font-semibold text-zinc-900 dark:text-zinc-100">
            {block.number} — {block.title}
          </p>
          <p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-300">
            {block.body}
          </p>
        </div>
      );
  }
}

// Fires once a section's top has scrolled past the upper third of the
// viewport (an IntersectionObserver with a bottom-heavy negative rootMargin,
// same trick Nav's own scroll-spy leans on) — the earliest section still
// intersecting that band is the active one, since that's the one currently
// occupying the reading position.
function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? null);
  const visibleIds = useRef(new Set<string>());

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.current.add(entry.target.id);
          } else {
            visibleIds.current.delete(entry.target.id);
          }
        }
        const firstVisible = ids.find((id) => visibleIds.current.has(id));
        if (firstVisible) setActiveId(firstVisible);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[180px_minmax(0,640px)_240px] lg:gap-12">
        {/* Meta: a row on mobile, a stacked column alongside the article on
            desktop. */}
        <aside className="flex flex-wrap gap-x-10 gap-y-4 lg:block lg:space-y-6">
          <div className="space-y-0.5">
            <p className="text-sm text-zinc-900 dark:text-zinc-100">Company</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {caseStudy.meta.company}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-sm text-zinc-900 dark:text-zinc-100">Industry</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {caseStudy.meta.industry}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-sm text-zinc-900 dark:text-zinc-100">Role</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{caseStudy.meta.role}</p>
          </div>
        </aside>

        <article className="space-y-10">
          {caseStudy.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 space-y-3">
              {section.eyebrow && (
                <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase dark:text-zinc-500">
                  {section.eyebrow}
                </p>
              )}
              {section.heading && (
                <p className="text-lg leading-7 font-bold text-zinc-900 dark:text-zinc-100">
                  {section.heading}
                </p>
              )}
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
        </article>

        {/* TOC: sticky so it tracks scroll position alongside the article;
            top offset clears the fixed nav pill. The quick-overview link
            lives in the same sticky block so it scrolls — and sticks —
            together with the section list, rather than scrolling away on
            its own underneath it. */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <nav className="space-y-2">
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
      </div>

      <ProjectModal
        project={highlightsOpen ? project : null}
        onClose={() => setHighlightsOpen(false)}
      />
    </div>
  );
}
