export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  image: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "shareable",
    title: "Shareable",
    tagline: "A rental app designed around women's safety",
    description:
      "Placeholder description: Shareable lets neighbors rent everyday items from each other. This case study will walk through the research, safety-first design decisions, and UI flows once the real write-up is added.",
    tags: ["Mobile App", "UX Research"],
    image: "https://placehold.co/800x600/e5e7eb/374151?text=Shareable",
    featured: true,
  },
  {
    slug: "toothnotes",
    title: "Toothnotes",
    tagline: "A website redesign for a dental software company",
    description:
      "Placeholder description: a full marketing site redesign for Toothnotes, focused on clarifying the product's value proposition and improving conversion. Real content coming soon.",
    tags: ["Web Design", "Redesign"],
    image: "https://placehold.co/800x600/e5e7eb/374151?text=Toothnotes",
    featured: true,
  },
  {
    slug: "sacred-circle-healthcare",
    title: "Sacred Circle Healthcare",
    tagline: "A responsive site for a healthcare summit",
    description:
      "Placeholder description: an event site built for a healthcare summit, designed to work seamlessly across devices for on-the-go attendees. Real content coming soon.",
    tags: ["Web Design", "Responsive"],
    image:
      "https://placehold.co/800x600/e5e7eb/374151?text=Sacred+Circle+Healthcare",
    featured: true,
  },
  {
    slug: "task-forge",
    title: "Task Forge",
    tagline: "A project management tool for creative teams",
    description:
      "Placeholder description: Task Forge blends project management with creative collaboration tools. This case study will cover the product design process end to end.",
    tags: ["Product Design", "SaaS"],
    image: "https://placehold.co/800x600/e5e7eb/374151?text=Task+Forge",
    featured: true,
  },
  {
    slug: "design-showcase",
    title: "Design Showcase",
    tagline: "A curated collection across design mediums",
    description:
      "Placeholder description: a rotating showcase of smaller design explorations spanning branding, illustration, and interaction design. Real content coming soon.",
    tags: ["Visual Design", "Collection"],
    image: "https://placehold.co/800x600/e5e7eb/374151?text=Design+Showcase",
    featured: true,
  },
];
