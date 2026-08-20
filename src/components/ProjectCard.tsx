import Image from "next/image";
import type { Project } from "@/data/projects";
import TransitionLink from "@/components/TransitionLink";

export default function ProjectCard({
  project,
  dimmed = false,
  compact = false,
  onOpen,
}: {
  project: Project;
  dimmed?: boolean;
  compact?: boolean;
  onOpen?: (project: Project) => void;
}) {
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
      className="flex flex-col gap-6 rounded-card-lg border border-black/[0.06] bg-white p-5 shadow-card transition-all duration-300 ease-[cubic-bezier(0,0,0.5,1)] hover:scale-[1.016] hover:shadow-card-hover lg:flex-row lg:gap-6 dark:border-white/[0.06] dark:bg-zinc-900"
    >
      <div className="relative aspect-[4/5] w-full shrink-0 self-start overflow-hidden rounded-card bg-zinc-100 lg:w-[320px] dark:bg-zinc-800">
        {project.tag && (
          <span className="absolute bottom-5 left-5 inline-flex h-9 items-center rounded-full bg-glass/70 px-5 text-sm font-semibold text-zinc-900 shadow-glass backdrop-blur-xl backdrop-saturate-150 dark:bg-zinc-900/70 dark:text-zinc-100">
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
      <div className="flex flex-1 -translate-y-2 flex-col justify-center gap-2">
        <h3 className="pl-3 font-serif text-3xl font-semibold tracking-tight text-zinc-900 lg:text-4xl dark:text-zinc-100">
          {project.title}
        </h3>
        {project.metric && (
          <p className="pl-3 font-serif text-xl font-normal italic text-zinc-900 dark:text-zinc-100">
            {project.metric}
          </p>
        )}
      </div>
    </TransitionLink>
  );
}
