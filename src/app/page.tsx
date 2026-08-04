import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import ProjectSlider from "@/components/ProjectSlider";
import ScrollCue from "@/components/ScrollCue";
import FadeIn from "@/components/FadeIn";
import { projects, moreProjects } from "@/data/projects";

export default function Home() {
  return (
    <div className="pb-24">
      <Hero />
      <div className="flex h-[6vh] min-h-12 items-center justify-center">
        <ScrollCue />
      </div>
      <FadeIn>
        <section id="work" className="mx-auto max-w-[1800px] scroll-mt-24 px-6">
          <ProjectGrid projects={projects} title="Work" />
        </section>
      </FadeIn>
      <FadeIn>
        <section
          id="mini"
          className="mx-auto mt-20 max-w-[1800px] scroll-mt-24 px-6"
        >
          <ProjectSlider projects={moreProjects} />
        </section>
      </FadeIn>
    </div>
  );
}
