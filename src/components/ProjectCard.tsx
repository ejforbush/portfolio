import Image from "next/image";
import type { Project } from "@/data/projects";
import TransitionLink from "@/components/TransitionLink";

export default function ProjectCard({
  project,
  dimmed = false,
  compact = false,
  small = false,
  read = false,
  onOpen,
}: {
  project: Project;
  dimmed?: boolean;
  compact?: boolean;
  small?: boolean;
  read?: boolean;
  onOpen?: (project: Project) => void;
}) {
  if (small) {
    return (
      <TransitionLink
        href={`/projects/${project.slug}`}
        className="relative flex w-full items-center gap-6 rounded-card border border-black/[0.06] bg-white p-4 shadow-card transition-all duration-300 ease-[cubic-bezier(0,0,0.5,1)] hover:scale-[1.016] hover:shadow-card-hover dark:border-white/[0.06] dark:bg-zinc-900"
      >
        <div className="relative aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 sm:w-48 dark:bg-zinc-800">
          {project.tag && (
            <span className="absolute bottom-2 left-2 inline-flex h-7 items-center rounded-full bg-glass/70 px-3 text-xs font-semibold text-zinc-900 shadow-glass backdrop-blur-xl backdrop-saturate-150 dark:bg-zinc-900/70 dark:text-zinc-100">
              {project.tag}
            </span>
          )}
          <Image
            src={project.image}
            alt={project.title}
            width={384}
            height={512}
            unoptimized
            className={`h-full w-full object-cover transition-all duration-500 ${
              dimmed ? "grayscale-[45%] brightness-[0.85]" : ""
            }`}
          />
        </div>
        <h3 className="font-serif text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
          {project.title}
        </h3>
        {read && (
          <span
            aria-label="Read"
            className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200/80 shadow-glass backdrop-blur-xl backdrop-saturate-150 dark:bg-zinc-700/60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        )}
      </TransitionLink>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onOpen?.(project)}
        className="relative flex aspect-[2/3] w-full cursor-pointer items-end rounded-card border border-black/[0.06] bg-zinc-100 p-5 text-left transition-all duration-300 ease-[cubic-bezier(0,0,0.5,1)] hover:scale-[1.016] hover:shadow-card-hover dark:border-white/[0.06] dark:bg-zinc-800"
      >
        {/* overflow-hidden lives here, one layer in from the shadow — on the
            same element as the shadow it would clip the shadow too, since
            overflow-hidden cuts off anything rendering outside the border
            box and box-shadow always does. */}
        <div className="absolute inset-0 overflow-hidden rounded-card">
          <Image
            src={project.image}
            alt={project.title}
            width={800}
            height={1200}
            unoptimized
            className={`h-full w-full object-cover transition-all duration-500 ${
              dimmed ? "grayscale-[45%] brightness-[0.85]" : ""
            }`}
          />
        </div>
        <span className="relative flex h-9 max-w-full items-center truncate rounded-full bg-glass/70 px-4 text-sm font-semibold text-zinc-900 shadow-glass backdrop-blur-xl backdrop-saturate-150 dark:bg-zinc-900/70 dark:text-zinc-100">
          {project.title}
        </span>
      </button>
    );
  }

  // No overflow-hidden on the outer link below — it's on the inner image
  // wrapper instead, so it doesn't also clip the link's own shadow.
  return (
    <TransitionLink
      href={`/projects/${project.slug}`}
      className="flex flex-col gap-8 rounded-card border border-black/[0.06] bg-white pt-3 pr-3 pb-5 pl-3 shadow-card transition-all duration-300 ease-[cubic-bezier(0,0,0.5,1)] hover:scale-[1.016] hover:shadow-card-hover lg:flex-row lg:gap-6 lg:p-5 dark:border-white/[0.06] dark:bg-zinc-900"
    >
      <div className="relative aspect-[3/2] w-full shrink-0 self-start overflow-hidden rounded-3xl bg-zinc-100 lg:aspect-[4/5] lg:w-[320px] dark:bg-zinc-800">
        {project.tag && (
          <span className="absolute bottom-2 left-2 inline-flex h-8 items-center rounded-full bg-glass/70 px-4 text-xs font-semibold text-zinc-900 shadow-glass backdrop-blur-xl backdrop-saturate-150 dark:bg-zinc-900/70 dark:text-zinc-100">
            {project.tag}
          </span>
        )}
        <Image
          src={project.image}
          alt={project.title}
          width={800}
          height={1000}
          unoptimized
          className={`h-full w-full object-cover transition-all duration-500 ${
            dimmed ? "grayscale-[45%] brightness-[0.85]" : ""
          }`}
        />
      </div>
      <div className="flex flex-1 -translate-y-2 flex-col justify-center gap-2 px-3">
        <h3 className="font-serif text-2xl font-semibold tracking-tight text-zinc-900 lg:text-4xl dark:text-zinc-100">
          {project.title}
        </h3>
        {project.metric && (
          <p className="font-serif text-xl font-normal italic text-zinc-900 dark:text-zinc-100">
            {project.metric}
          </p>
        )}
      </div>
    </TransitionLink>
  );
}
