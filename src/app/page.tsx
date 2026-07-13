import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import { projects } from "@/data/projects";

export default function Home() {
  const featured = projects.filter((project) => project.featured);

  return (
    <div className="pb-24">
      <Hero />
      <section className="mx-auto max-w-4xl px-6">
        <h2 className="mb-6 text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Featured Projects
        </h2>
        <ProjectGrid projects={featured} />
      </section>
    </div>
  );
}
