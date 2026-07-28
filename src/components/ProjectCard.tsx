import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

export default function ProjectCard({
  project,
  dimmed = false,
  compact = false,
  hideButton = false,
  buttonLabel = "Explore",
}: {
  project: Project;
  dimmed?: boolean;
  compact?: boolean;
  hideButton?: boolean;
  buttonLabel?: string;
}) {
  if (compact) {
    return (
      <Link
        href={`/projects/${project.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white transition-transform duration-300 ease-[cubic-bezier(0,0,0.5,1)] hover:scale-[1.008] dark:border-white/[0.06] dark:bg-zinc-900"
      >
        <div className="aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={project.image}
            alt={project.title}
            width={800}
            height={600}
            unoptimized
            className={`h-full w-full object-cover transition-all duration-500 ${
              dimmed ? "grayscale-[45%] brightness-[0.85]" : ""
            }`}
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {project.title}
          </h3>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            {project.tagline}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white p-4 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)] lg:flex-row lg:gap-8 dark:border-white/[0.06] dark:bg-zinc-900"
    >
      <div className="aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 lg:w-[420px] dark:bg-zinc-800">
        <Image
          src={project.image}
          alt={project.title}
          width={800}
          height={800}
          unoptimized
          className={`h-full w-full object-cover transition-all duration-500 ${
            dimmed ? "grayscale-[45%] brightness-[0.85]" : ""
          }`}
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-6">
        <div className="flex flex-1 flex-col justify-center gap-5">
          <div className="flex flex-col gap-2">
            {project.tag && (
              <span className="inline-flex w-fit items-center rounded-2xl bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                {project.tag}
              </span>
            )}
            <h3 className="pl-3 text-3xl font-semibold tracking-tight text-zinc-900 lg:text-4xl dark:text-zinc-100">
              {project.title}
            </h3>
          </div>
          {project.metric && (
            <p className="pl-3 text-sm font-normal text-zinc-900 dark:text-zinc-100">
              {project.metric}
            </p>
          )}
        </div>
        {!hideButton && (
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm font-semibold text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-opacity duration-150 active:opacity-80 dark:bg-zinc-100 dark:text-zinc-900">
              {buttonLabel}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
