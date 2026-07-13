import Image from "next/image";
import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={project.image}
          alt={project.title}
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="font-medium">{project.title}</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {project.tagline}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
