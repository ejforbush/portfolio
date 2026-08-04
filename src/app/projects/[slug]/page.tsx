import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allProjects, projects, moreProjects } from "@/data/projects";
import { caseStudies } from "@/data/caseStudies";
import CaseStudyBody from "@/components/CaseStudyBody";
import TransitionLink from "@/components/TransitionLink";

export async function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = allProjects.find((project) => project.slug === slug);

  return {
    title: project ? `${project.title} | Eric Forbush` : "Eric Forbush",
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = allProjects.find((project) => project.slug === slug);

  if (!project) {
    notFound();
  }

  const collection = projects.includes(project) ? projects : moreProjects;
  const index = collection.findIndex((p) => p.slug === project.slug);
  const prevProject = index > 0 ? collection[index - 1] : null;
  const nextProject =
    index < collection.length - 1 ? collection[index + 1] : null;

  const caseStudy = caseStudies[project.slug];

  if (caseStudy) {
    return (
      <div>
        {/* Full-bleed banner — no top padding, so it sits directly behind
            the fixed nav pill exactly like the home hero does. */}
        <div className="h-[66vh] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={project.image}
            alt={project.title}
            width={1280}
            height={545}
            unoptimized
            className="h-full w-full object-cover"
          />
        </div>
        {/* max-w-[640px] matches CaseStudyBody's article column, so the
            title wraps at the same width as the body text below it. */}
        <div className="mx-auto max-w-[640px] px-6 pt-14 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {project.title}
          </h1>
          {project.metric && (
            <p className="mt-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {project.metric}
            </p>
          )}
        </div>

        <CaseStudyBody project={project} caseStudy={caseStudy} />

        <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-zinc-200 px-6 py-6 dark:border-zinc-800">
          {prevProject ? (
            <TransitionLink
              href={`/projects/${prevProject.slug}`}
              destinationMenuLg={prevProject.slug in caseStudies}
              className="text-sm text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              ← {prevProject.title}
            </TransitionLink>
          ) : (
            <span />
          )}
          {nextProject ? (
            <TransitionLink
              href={`/projects/${nextProject.slug}`}
              destinationMenuLg={nextProject.slug in caseStudies}
              className="text-sm text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {nextProject.title} →
            </TransitionLink>
          ) : (
            <span />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {project.title}
      </h1>
      <p className="mt-3 max-w-xl text-zinc-500 dark:text-zinc-400">
        {project.tagline}
      </p>
      <div className="mt-8 aspect-[4/3] max-w-2xl overflow-hidden rounded-card bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={project.image}
          alt={project.title}
          width={800}
          height={600}
          unoptimized
          className="h-full w-full object-cover"
        />
      </div>
      <p className="mt-8 max-w-2xl text-zinc-600 dark:text-zinc-300">
        {project.description}
      </p>
      <div className="mt-12 flex max-w-2xl items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
        {prevProject ? (
          <Link
            href={`/projects/${prevProject.slug}`}
            className="text-sm text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← {prevProject.title}
          </Link>
        ) : (
          <span />
        )}
        {nextProject ? (
          <Link
            href={`/projects/${nextProject.slug}`}
            className="text-sm text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            {nextProject.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
