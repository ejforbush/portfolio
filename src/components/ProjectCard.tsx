import Image from "next/image";
import type { Project } from "@/data/projects";
import TransitionLink from "@/components/TransitionLink";
import { getImageFocus } from "@/lib/imageFocus";

function focusStyle(project: Project) {
  const { x, y, zoom } = getImageFocus(project.slug);
  return {
    objectPosition: `${x}% ${y}%`,
    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
    transformOrigin: `${x}% ${y}%`,
  };
}

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
        className="relative flex w-full select-none items-center gap-6 rounded-card border border-black/[0.06] bg-white p-4 shadow-card transition-all duration-300 ease-[cubic-bezier(0,0,0.5,1)] hover:scale-[1.016] hover:shadow-card-hover dark:border-white/[0.06] dark:bg-zinc-900"
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
            style={focusStyle(project)}
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
    // Same framed-photo treatment as the default card below (white mat,
    // rounded-card outer / rounded-3xl inner), with the title as a small
    // corner tag over the image — same bottom-left tag pill the default
    // card uses for project.tag, just carrying the title text instead since
    // these (moreProjects) don't have a separate tag.
    return (
      <button
        type="button"
        onClick={() => onOpen?.(project)}
        className="relative aspect-[2/3] w-full cursor-pointer select-none overflow-hidden rounded-3xl bg-zinc-100 text-left transition-all duration-300 ease-[cubic-bezier(0,0,0.5,1)] hover:scale-[1.016] dark:bg-zinc-800"
      >
        <span className="absolute bottom-4 left-4 z-10 inline-flex h-8 max-w-[calc(100%-32px)] items-center truncate rounded-full bg-glass/70 px-4 text-xs font-semibold text-zinc-900 shadow-glass backdrop-blur-xl backdrop-saturate-150 sm:h-9 sm:text-sm dark:bg-zinc-900/70 dark:text-zinc-100">
          {project.title}
        </span>
        <Image
          src={project.image}
          alt={project.title}
          width={800}
          height={1200}
          unoptimized
          style={focusStyle(project)}
          className={`h-full w-full object-cover transition-all duration-500 ${
            dimmed ? "grayscale-[45%] brightness-[0.85]" : ""
          }`}
        />
      </button>
    );
  }

  // No overflow-hidden on the outer link below — it's on the inner image
  // wrapper instead, so it doesn't also clip the link's own shadow.
  return (
    <TransitionLink
      href={`/projects/${project.slug}`}
      className="flex select-none flex-col gap-8 rounded-card border border-black/[0.06] bg-white pt-3 pr-3 pb-5 pl-3 shadow-card transition-all duration-300 ease-[cubic-bezier(0,0,0.5,1)] hover:scale-[1.016] hover:shadow-card-hover lg:flex-row lg:gap-6 lg:p-5 dark:border-white/[0.06] dark:bg-zinc-900"
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
          style={focusStyle(project)}
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
