import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allProjects, projects, moreProjects } from "@/data/projects";

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

  return (
    <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {project.title}
      </h1>
      <p className="mt-3 max-w-xl text-zinc-500 dark:text-zinc-400">
        {project.tagline}
      </p>
      <div className="mt-8 aspect-[4/3] max-w-2xl overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
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
