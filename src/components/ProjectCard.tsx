import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

export default function ProjectCard({
  project,
  dimmed = false,
  compact = false,
  hideButton = false,
  buttonLabel = "Explore case study",
}: {
  project: Project;
  dimmed?: boolean;
  compact?: boolean;
  hideButton?: boolean;
  buttonLabel?: string;
}) {
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
      <div className={`flex flex-1 flex-col ${compact ? "p-5" : "p-6 sm:p-8"}`}>
        <div>
          <h3
            className={
              compact
                ? "text-base font-semibold text-zinc-900 dark:text-zinc-100"
                : "text-xl font-semibold text-zinc-900 sm:text-2xl dark:text-zinc-100"
            }
          >
            {project.title}
          </h3>
          <p
            className={
              compact
                ? "mt-1.5 text-sm text-zinc-500 dark:text-zinc-400"
                : "mt-3 text-zinc-600 dark:text-zinc-400"
            }
          >
            {compact ? project.tagline : project.description}
          </p>
        </div>
        {!hideButton && (
          <div className="mt-auto pt-6">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-opacity duration-150 active:opacity-60 dark:text-blue-400">
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
