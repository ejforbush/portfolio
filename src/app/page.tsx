import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import ProjectSlider from "@/components/ProjectSlider";
import FadeIn from "@/components/FadeIn";
import { projects, moreProjects } from "@/data/projects";

export default function Home() {
  return (
    <div className="pb-24">
      <Hero />
      <FadeIn>
        <section id="work" className="mx-auto mt-[6vh] max-w-[1800px] scroll-mt-24 px-6">
          <ProjectGrid projects={projects} />
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
