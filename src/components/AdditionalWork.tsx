"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { Project } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";

// Session-only, not persisted across days — sessionStorage clears itself
// when the tab closes, which is exactly the "read this browsing session
// only" lifetime the read badge is meant to have.
const readKey = (slug: string) => `case-study-read:${slug}`;

// Read state can only change (sessionStorage gets written) on a page the
// visitor is currently viewing, never on the page displaying these cards —
// so there's nothing for this store to notify subscribers about within a
// single mount. useSyncExternalStore is still the correct tool here (over
// state-from-an-effect) because the snapshot itself — sessionStorage — is
// external, client-only data the server can't see.
const noSubscribe = () => () => {};

export default function AdditionalWork({
  projects,
  currentSlug,
}: {
  projects: Project[];
  currentSlug: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Reaching this section (near the bottom of the article) is the signal
  // that the visitor actually scrolled through the case study above it,
  // rather than opening and immediately leaving — that's what marks the
  // current page read for the rest of the session.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sessionStorage.setItem(readKey(currentSlug), "1");
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [currentSlug]);

  const readSnapshot = useSyncExternalStore(
    noSubscribe,
    () => projects.filter((p) => sessionStorage.getItem(readKey(p.slug))).map((p) => p.slug).join(","),
    () => "",
  );

  const readSlugs = useMemo(
    () => new Set(readSnapshot ? readSnapshot.split(",") : []),
    [readSnapshot],
  );
  const ordered = useMemo(
    () => [...projects].sort((a, b) => Number(readSlugs.has(a.slug)) - Number(readSlugs.has(b.slug))),
    [projects, readSlugs],
  );

  if (projects.length === 0) return null;

  return (
    <div
      ref={sectionRef}
      className="mx-auto max-w-6xl border-t border-zinc-200 px-3 pt-8 pb-16 lg:px-6 dark:border-zinc-800"
    >
      <p className="font-serif text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
        Case studies
      </p>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {ordered.map((project) => (
          <ProjectCard key={project.slug} project={project} small read={readSlugs.has(project.slug)} />
        ))}
      </div>
    </div>
  );
}
