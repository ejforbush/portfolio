import type { Project } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";
import FadeIn from "@/components/FadeIn";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="mx-auto flex w-full flex-col gap-14 sm:w-[70%]">
      {projects.map((project) => (
        <FadeIn key={project.slug}>
          <ProjectCard project={project} />
        </FadeIn>
      ))}
    </div>
  );
}
