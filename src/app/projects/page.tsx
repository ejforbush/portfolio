import type { Metadata } from "next";
import ProjectGrid from "@/components/ProjectGrid";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects | Eric Forbush",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-3 max-w-xl text-zinc-500 dark:text-zinc-400">
        Placeholder intro copy for the projects page. This will introduce the
        case studies below once real write-ups replace these placeholders.
      </p>
      <div className="mt-10">
        <ProjectGrid projects={projects} />
      </div>
    </div>
  );
}
