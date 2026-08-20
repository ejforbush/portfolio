import type { Project } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";

export default function ProjectGrid({
  projects,
  title,
}: {
  projects: Project[];
  title?: string;
}) {
  return (
    <div className="mx-auto w-full lg:w-[70vw] lg:max-w-[1024px]">
      {title && (
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          {title}
        </h2>
      )}
      <div className="mt-6 flex flex-col gap-14">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
