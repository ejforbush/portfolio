export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  tag?: string;
  metric?: string;
  // Additional full designs shown below the description in the modal —
  // each keeps its own intrinsic size instead of being cropped to a shared
  // aspect ratio, since these are finished graphics, not photos.
  gallery?: { src: string; width: number; height: number }[];
};

export const projects: Project[] = [
  {
    slug: "settings-redesign",
    title: "Restructuring settings for clarity and scale",
    tagline: "Rethinking a cluttered settings experience end to end",
    description:
      "Placeholder description: an overview of the settings redesign case study. Real write-up coming soon.",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&q=80&auto=format",
    tag: "Veras",
    metric: "Reduced onboarding time by 30+ minutes.",
  },
  {
    slug: "credential-management",
    title: "Designing a safer, clearer way to manage credentials",
    tagline: "Designing a safer, clearer way to manage credentials",
    description:
      "Placeholder description: an overview of the credential management case study. Real write-up coming soon.",
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop&q=80&auto=format",
    tag: "Veras",
    metric: "Cut credential-related support tickets by 40%.",
  },
  {
    slug: "core-scheduling-flows",
    title: "Simplifying the scheduling flows at the heart of the product",
    tagline: "Simplifying the scheduling flows at the heart of the product",
    description:
      "Placeholder description: an overview of the core scheduling flows case study. Real write-up coming soon.",
    image:
      "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&h=600&fit=crop&q=80&auto=format",
    tag: "Veras",
    metric: "Cut steps for common scheduling tasks in half.",
  },
];

export const moreProjects: Project[] = [
  {
    slug: "levelup",
    title: "LevelUp",
    tagline: "A rental app designed around women's safety",
    description:
      "Placeholder description: an overview of the LevelUp case study. Real write-up coming soon. This section will eventually cover the problem space, the research that shaped the design, and the key decisions made along the way. It will also walk through how the safety-first rental flow was designed, tested with real users, and refined based on feedback from early beta testers. Additional sections will cover the visual design system, onboarding flow, and the outcomes of the launch.",
    image: "/projects/levelup.jpg",
  },
  {
    slug: "toothnotes",
    title: "Toothnotes",
    tagline: "A website redesign for a dental software company",
    description:
      "Placeholder description: an overview of the Toothnotes case study. Real write-up coming soon. This section will eventually cover the redesign process for the marketing site, including stakeholder interviews, competitive research, and the rationale behind the new information architecture. It will also cover the visual identity refresh, the responsive layout system, and how the new site performed against the old one after launch.",
    image: "/projects/toothnotes.jpg",
  },
  {
    slug: "team-smart-power",
    title: "Team Smart Power",
    tagline: "Placeholder tagline for the Team Smart Power case study",
    description:
      "Placeholder description: an overview of the Team Smart Power case study. Real write-up coming soon. This section will eventually cover the project's goals, the constraints of working with an interdisciplinary engineering team, and how the product balanced technical requirements with usability. It will also cover prototyping decisions, testing with the target audience, and lessons learned from the final build.",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&q=80&auto=format",
  },
  {
    slug: "byu-soccer",
    title: "BYU Soccer",
    tagline: "Social media design for the BYU Men's Soccer team",
    description:
      "I got to work with the BYU Men's soccer team my last year of college. I designed and posted social media content for the team for their entire season. These are a couple of my favorite designs that I created in Photoshop.\n\nThe first is a Facebook Cover I could update for each upcoming game; the second I would take photos from the game as they came in and create a post with the halftime and final scores; the third was for an alumni game. I enjoyed really getting to refine their brand image and come up with a lot of great content at scale.",
    image: "/projects/byu-soccer.jpg",
    gallery: [
      { src: "/projects/byu-soccer-facebook-cover.jpg", width: 1600, height: 609 },
      { src: "/projects/byu-soccer-game-score.jpg", width: 1600, height: 1600 },
      { src: "/projects/byu-soccer-alumni-weekend.jpg", width: 1600, height: 1600 },
    ],
  },
];

export const allProjects: Project[] = [...projects, ...moreProjects];
