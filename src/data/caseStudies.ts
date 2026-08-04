// Rich content for the site's large, in-depth case studies — a superset of
// the placeholder `description` on Project. Keyed by slug so
// `src/app/projects/[slug]/page.tsx` can opt a project into the full
// article layout (hero + meta sidebar + scrolling TOC) just by having an
// entry here; anything without one falls back to the simple template.

export type CaseStudyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "insight"; number: string; title: string; body: string };

export type CaseStudySection = {
  id: string;
  navLabel: string;
  eyebrow?: string;
  heading?: string;
  blocks: CaseStudyBlock[];
};

export type CaseStudy = {
  meta: {
    company: string;
    industry: string;
    role: string;
  };
  sections: CaseStudySection[];
};

export const caseStudies: Record<string, CaseStudy> = {
  "settings-redesign": {
    meta: {
      company: "Veras",
      industry: "Healthcare",
      role: "Product designer",
    },
    sections: [
      {
        id: "background",
        navLabel: "Background",
        heading: "Background",
        blocks: [
          {
            type: "paragraph",
            text: "Settings had become difficult to navigate as Veras grew. What started as a simple collection of administrative tools had evolved into a complex system that no longer matched how administrators worked.",
          },
          {
            type: "paragraph",
            text: "New customers often needed a 30-minute onboarding call just to configure settings, while Customer Success teams spent time helping users complete tasks they should have been able to handle independently.",
          },
          {
            type: "paragraph",
            text: "My goal was to redesign settings into a scalable experience that was easier to understand, safer to manage, and ready for future product growth.",
          },
        ],
      },
      {
        id: "problem",
        navLabel: "The problem",
        heading: "The problem",
        blocks: [
          {
            type: "paragraph",
            text: "As the product expanded, settings became organized around how features were built rather than how customers managed their operations.",
          },
          {
            type: "list",
            items: [
              "Important settings were buried under “Advanced”",
              "Related workflows were separated across different areas",
              "Inconsistent patterns made the product harder to learn",
              "Users lacked confidence when making important changes",
            ],
            // Rendered as a real <ul> in CaseStudyBody, so items are stored
            // without a leading bullet character.
          },
        ],
      },
      {
        id: "understanding-the-problem",
        navLabel: "Understanding the problem",
        heading: "Understanding the problem",
        blocks: [
          {
            type: "paragraph",
            text: "I partnered with Customer Success, reviewed onboarding sessions and support tickets, audited existing workflows, and analyzed product usage through PostHog and Metabase.",
          },
          { type: "paragraph", text: "Three themes emerged:" },
          {
            type: "insight",
            number: "01",
            title: "Settings reflected product evolution, not user workflows",
            body: "Administrators thought about managing their teams and operations, not individual product features.",
          },
          {
            type: "insight",
            number: "02",
            title: "Inconsistent patterns created unnecessary friction",
            body: "Different settings behaved differently, making the experience harder to learn and trust.",
          },
          {
            type: "insight",
            number: "03",
            title: "Important actions lacked clarity and safeguards",
            body: "Users needed more confidence when making changes that affected their organization.",
          },
        ],
      },
      {
        id: "organize-settings-for-clarity",
        navLabel: "Organize settings for clarity",
        eyebrow: "Redesigning the experience",
        heading: "Organizing settings around workflows",
        blocks: [
          {
            type: "paragraph",
            text: "I restructured the information architecture around how administrators actually worked, breaking apart the existing “Advanced” section and creating clearer categories that could scale with future products.",
          },
        ],
      },
      {
        id: "standardize-patterns-and-behaviors",
        navLabel: "Standardize patterns and behaviors",
        heading: "Creating consistent patterns",
        blocks: [
          {
            type: "paragraph",
            text: "I introduced shared interaction patterns across settings, including consistent layouts, save behaviors, defaults, and reusable components.",
          },
        ],
      },
      {
        id: "make-changes-clear-and-safe",
        navLabel: "Make changes clear and safe",
        heading: "Making changes clear and safe",
        blocks: [
          {
            type: "paragraph",
            text: "I improved communication around important actions through clearer warnings, feedback states, and confirmation patterns.",
          },
        ],
      },
      {
        id: "testing-and-iteration",
        navLabel: "Testing & iteration",
        heading: "Testing & iteration",
        blocks: [
          {
            type: "paragraph",
            text: "I built a functional prototype using our codebase to validate the experience with Customer Success and provide engineering with a realistic reference during implementation.",
          },
          {
            type: "paragraph",
            text: "Feedback helped refine edge cases, including overflow states, staffing workflows, and areas where existing automation required additional technical investment.",
          },
        ],
      },
      {
        id: "outcome",
        navLabel: "Outcome",
        heading: "Outcome",
        blocks: [
          {
            type: "paragraph",
            text: "The redesigned settings experience created a scalable foundation for future growth.",
          },
          {
            type: "list",
            items: [
              "Reduced onboarding time by 30+ minutes",
              "Helped Customer Success teams train users more efficiently",
              "Created consistent patterns that made settings easier to learn and trust",
              "Enabled administrators to manage more workflows independently",
            ],
          },
        ],
      },
    ],
  },

  // Dummy placeholder content — same section structure as settings-redesign
  // (background, problem, understanding-the-problem w/ 3 insights, three
  // redesigning-the-experience subsections, testing & iteration, outcome) so
  // the layout can be reviewed before the real write-up replaces it.
  "credential-management": {
    meta: {
      company: "Veras",
      industry: "Healthcare",
      role: "Product designer",
    },
    sections: [
      {
        id: "background",
        navLabel: "Background",
        heading: "Background",
        blocks: [
          {
            type: "paragraph",
            text: "Credential management had grown increasingly risky as Veras added more integrations and user roles, leaving administrators uncertain about who had access to what.",
          },
          {
            type: "paragraph",
            text: "Support tickets tied to credential errors and permission mistakes were rising, and each one took significant time to resolve safely.",
          },
          {
            type: "paragraph",
            text: "My goal was to redesign credential management into an experience that made access easy to grant, easy to audit, and hard to get wrong.",
          },
        ],
      },
      {
        id: "problem",
        navLabel: "The problem",
        heading: "The problem",
        blocks: [
          {
            type: "paragraph",
            text: "As integrations multiplied, credentials became scattered across disconnected screens with no consistent way to see who could access what.",
          },
          {
            type: "list",
            items: [
              "Permissions were granted through inconsistent, easy-to-misuse flows",
              "There was no clear audit trail for sensitive access changes",
              "Expired or unused credentials were rarely cleaned up",
              "Administrators lacked confidence that access matched intent",
            ],
          },
        ],
      },
      {
        id: "understanding-the-problem",
        navLabel: "Understanding the problem",
        heading: "Understanding the problem",
        blocks: [
          {
            type: "paragraph",
            text: "I partnered with security and support teams, reviewed incident reports, audited access-related tickets, and analyzed usage patterns across customer accounts.",
          },
          { type: "paragraph", text: "Three themes emerged:" },
          {
            type: "insight",
            number: "01",
            title: "Access decisions were made without full visibility",
            body: "Administrators often granted broad permissions because narrower options weren't clear or convenient.",
          },
          {
            type: "insight",
            number: "02",
            title: "Mistakes were easy to make and hard to catch",
            body: "Small errors in credential setup could go unnoticed until they caused a real problem.",
          },
          {
            type: "insight",
            number: "03",
            title: "Accountability was difficult to trace",
            body: "There was no reliable way to see who changed what access, or when.",
          },
        ],
      },
      {
        id: "give-administrators-full-visibility",
        navLabel: "Give administrators full visibility",
        eyebrow: "Redesigning the experience",
        heading: "Giving administrators full visibility",
        blocks: [
          {
            type: "paragraph",
            text: "I consolidated credential and access information into a single view, making it clear at a glance who had access to what and why.",
          },
        ],
      },
      {
        id: "build-safer-defaults",
        navLabel: "Build safer defaults",
        heading: "Building safer defaults",
        blocks: [
          {
            type: "paragraph",
            text: "I introduced scoped permission templates and safer default settings, reducing how often administrators needed to configure access from scratch.",
          },
        ],
      },
      {
        id: "make-every-change-auditable",
        navLabel: "Make every change auditable",
        heading: "Making every change auditable",
        blocks: [
          {
            type: "paragraph",
            text: "I added a clear activity log for credential changes, so administrators could trace exactly who granted or revoked access, and when.",
          },
        ],
      },
      {
        id: "testing-and-iteration",
        navLabel: "Testing & iteration",
        heading: "Testing & iteration",
        blocks: [
          {
            type: "paragraph",
            text: "I built a functional prototype to validate the new permission model with security and support teams before implementation.",
          },
          {
            type: "paragraph",
            text: "Feedback surfaced edge cases around bulk access changes and legacy integrations, which shaped how the final audit log and permission templates worked.",
          },
        ],
      },
      {
        id: "outcome",
        navLabel: "Outcome",
        heading: "Outcome",
        blocks: [
          {
            type: "paragraph",
            text: "The redesigned credential experience gave administrators clearer, safer control over access.",
          },
          {
            type: "list",
            items: [
              "Cut credential-related support tickets by 40%",
              "Gave administrators a clear audit trail for every access change",
              "Made it easier to spot and clean up unused or risky credentials",
              "Increased administrator confidence in day-to-day access decisions",
            ],
          },
        ],
      },
    ],
  },

  "core-scheduling-flows": {
    meta: {
      company: "Veras",
      industry: "Healthcare",
      role: "Product designer",
    },
    sections: [
      {
        id: "background",
        navLabel: "Background",
        heading: "Background",
        blocks: [
          {
            type: "paragraph",
            text: "Scheduling sat at the center of the product, but the flows for building and adjusting schedules had grown complex as new scheduling rules and edge cases were added over time.",
          },
          {
            type: "paragraph",
            text: "Staff regularly ran into confusing states when editing schedules, and support fielded repeated questions about how specific scheduling rules actually worked.",
          },
          {
            type: "paragraph",
            text: "My goal was to simplify the core scheduling flows so they were easier to understand, faster to use, and more resilient to edge cases.",
          },
        ],
      },
      {
        id: "problem",
        navLabel: "The problem",
        heading: "The problem",
        blocks: [
          {
            type: "paragraph",
            text: "As scheduling rules grew more sophisticated, the interface hadn't kept pace, forcing users to piece together how the system actually behaved.",
          },
          {
            type: "list",
            items: [
              "Creating and editing schedules required too many steps for common tasks",
              "Conflicts and edge cases surfaced late, often after a schedule was already published",
              "Scheduling rules weren't visible or explained within the flow itself",
              "Small teams and large teams were forced through the same rigid flow",
            ],
          },
        ],
      },
      {
        id: "understanding-the-problem",
        navLabel: "Understanding the problem",
        heading: "Understanding the problem",
        blocks: [
          {
            type: "paragraph",
            text: "I partnered with operations and Customer Success teams, shadowed scheduling sessions, and reviewed support tickets and product usage data to understand where scheduling broke down.",
          },
          { type: "paragraph", text: "Three themes emerged:" },
          {
            type: "insight",
            number: "01",
            title: "Common tasks took too many steps",
            body: "Frequent scheduling actions were buried behind flows built for more complex, less common cases.",
          },
          {
            type: "insight",
            number: "02",
            title: "Conflicts surfaced too late",
            body: "Scheduling conflicts were often only visible after a schedule was already committed.",
          },
          {
            type: "insight",
            number: "03",
            title: "The system's rules weren't visible",
            body: "Users couldn't easily tell why the system behaved the way it did, which eroded trust in the schedule.",
          },
        ],
      },
      {
        id: "streamline-common-scheduling-tasks",
        navLabel: "Streamline common scheduling tasks",
        eyebrow: "Redesigning the experience",
        heading: "Streamlining common scheduling tasks",
        blocks: [
          {
            type: "paragraph",
            text: "I redesigned the core flow around the most frequent scheduling actions, cutting steps for common tasks while keeping advanced options available.",
          },
        ],
      },
      {
        id: "surface-conflicts-earlier",
        navLabel: "Surface conflicts earlier",
        heading: "Surfacing conflicts earlier",
        blocks: [
          {
            type: "paragraph",
            text: "I introduced real-time conflict detection within the scheduling flow itself, so issues could be caught and resolved before a schedule was published.",
          },
        ],
      },
      {
        id: "explain-the-systems-rules",
        navLabel: "Explain the system's rules",
        heading: "Explaining the system's rules",
        blocks: [
          {
            type: "paragraph",
            text: "I added contextual explanations for scheduling logic directly in the interface, so users could understand why the system behaved the way it did.",
          },
        ],
      },
      {
        id: "testing-and-iteration",
        navLabel: "Testing & iteration",
        heading: "Testing & iteration",
        blocks: [
          {
            type: "paragraph",
            text: "I prototyped the new scheduling flow and tested it with teams of varying size and complexity to validate that it scaled from small teams to large ones.",
          },
          {
            type: "paragraph",
            text: "Feedback helped refine how conflicts were surfaced and how much scheduling logic to expose without overwhelming users.",
          },
        ],
      },
      {
        id: "outcome",
        navLabel: "Outcome",
        heading: "Outcome",
        blocks: [
          {
            type: "paragraph",
            text: "The redesigned scheduling flow made day-to-day scheduling faster and more predictable.",
          },
          {
            type: "list",
            items: [
              "Cut steps for common scheduling tasks in half",
              "Reduced scheduling-related support tickets by surfacing conflicts earlier",
              "Made scheduling logic transparent instead of hidden",
              "Scaled cleanly across teams of different sizes",
            ],
          },
        ],
      },
    ],
  },
};
