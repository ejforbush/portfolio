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
  heading?: string;
  blocks: CaseStudyBlock[];
};

export type CaseStudy = {
  sections: CaseStudySection[];
};

export const caseStudies: Record<string, CaseStudy> = {
  "settings-redesign": {
    sections: [
      {
        id: "company-background",
        navLabel: "Company background",
        heading: "Company background",
        blocks: [
          {
            type: "paragraph",
            text: "Veras is a B2B workforce management platform for senior living communities. The platform included Scheduling, Messaging, Credentials, and Analytics. During this project, Veras was expanding into Time & Attendance and Payroll, which meant Settings needed to scale alongside the growing product suite.",
          },
        ],
      },
      {
        id: "settings-architecture-not-keeping-up",
        navLabel: "As Veras added products, our settings architecture wasn't keeping up.",
        heading: "As Veras added products, our settings architecture wasn't keeping up.",
        blocks: [
          {
            type: "paragraph",
            text: "Veras was built organically, with new settings and features added as the product evolved. There was very little consistency in how Settings were organized. Related settings weren't grouped together, and configuring a community often meant jumping between settings in an order that didn't make much sense. Up until that point, investing in Settings hadn't been a priority, but as we were looking to ship several new products in the coming months, it was obvious our Settings experience needed an overhaul before it could support the level of complexity we were about to add.",
          },
          {
            type: "paragraph",
            text: "Settings were complex enough that our customer success team decided that every new customer would get a 30-minute setup call where an onboarding specialist would walk through each setting to make sure everything was configured correctly before the customer ever started using the product. We had previously tried a more self-guided experience, and it had been disastrous.",
          },
          {
            type: "paragraph",
            text: "When setting up the platform on their own, customers frequently made configuration mistakes that made the product much more difficult to use. One of the most common was creating dozens of shift templates instead of a small set of reusable templates. Instead of scheduling eight CNAs from a single template, communities ended up managing dozens of nearly identical templates. Filtering schedules became cluttered, moving employees between shifts became more tedious, and staffing budgets became unnecessarily granular. Customers would reach out in frustration, then a member of our customer success team would step in, delete the unnecessary templates, and help them rebuild the configuration the right way.",
          },
          {
            type: "paragraph",
            text: "In redesigning Settings to be scalable for upcoming products, I wanted to make sure that same redesign would also improve customers' initial experience with the product and make it easier for them to configure their community correctly.",
          },
        ],
      },
      {
        id: "understanding-the-problem",
        navLabel: "Configuring settings required a translator",
        heading: "Configuring settings required a translator",
        blocks: [
          {
            type: "paragraph",
            text: "I spent time sitting in onboarding calls, watching customers configure the platform alongside their onboarding specialist. I quickly realized a lot of the call wasn't actually spent configuring things, it was spent explaining what each setting did.",
          },
          {
            type: "paragraph",
            text: "The specialist would ask for a community's bed count, and customers would often spend several minutes trying to answer a question that didn't actually affect the product. Bed count had existed for previous features, but in its current state it only created confusion and wasted time.",
          },
          {
            type: "paragraph",
            text: "The specialist would ask how their areas were organized, only to realize the customer didn't know what an \"Area\" was in Veras.",
          },
          {
            type: "paragraph",
            text: "The specialist would turn on features like Open Shift Pickup without even asking because nearly every community wanted it, while skipping over settings like Auto Publish because explaining what the setting did usually confused customers at that stage. Much of the onboarding call was spent helping customers make decisions they didn't have enough context to make on their own.",
          },
          {
            type: "paragraph",
            text: "I watched dozens of PostHog recordings to see how people navigated Settings without a specialist there to help. One recording that stuck out was a user trying to edit a shift template. They opened a help article, went back to the product, read a little more, clicked around, and eventually gave up without contacting support. Their permissions settings were configured in such a way that the page they needed to edit was completely hidden from them, but nothing in the interface made that obvious.",
          },
          {
            type: "paragraph",
            text: "The same patterns showed up outside of onboarding. Existing customers still struggled to find and configure settings on their own.",
          },
          {
            type: "paragraph",
            text: "Before I began the redesign, I created an inventory of every setting in the platform, documenting where it lived, what it controlled, and whether it was still relevant. Looking at everything together, it was clear that years of product growth had shaped the Settings experience, leaving it disconnected from the way customers actually thought when configuring their communities.",
          },
          {
            type: "paragraph",
            text: "Three themes came up consistently throughout my research. They became the guiding principles for the redesign:",
          },
          {
            type: "list",
            items: [
              "Organize around the customer's workflow",
              "Reduce unnecessary decisions",
              "Use consistent design patterns",
            ],
          },
        ],
      },
      {
        id: "organize-around-workflow",
        navLabel: "Organize around the customer's workflow",
        heading: "Organize around the customer's workflow",
        blocks: [
          {
            type: "paragraph",
            text: "The new information architecture followed the same order communities already used when configuring their operations.",
          },
          {
            type: "list",
            items: [
              "Community came first because it applied to the entire platform, regardless of which products a customer used.",
              "User Access followed so everyone participating in onboarding could access the platform and follow along as it was configured.",
              "Positions established the foundation by defining the roles and shifts each community would use.",
              "Areas built on positions and defined where each role worked.",
              "Budgets used positions, shifts, and areas to define the staffing requirements for each community.",
              "Compliance allowed for additional staffing rules for communities with more complex requirements.",
              "Staff Experience focused on the features employees would use every day, once the core scheduling setup was complete.",
              "Automation intentionally came last. It wasn't required for setup, but once customers understood how the platform worked, they could make informed decisions about what they wanted to automate.",
            ],
          },
          {
            type: "paragraph",
            text: "Grouping related settings made the platform easier to navigate long after onboarding concluded. Customers could find settings by following the way they already thought about their community, rather than remembering where a feature happened to live.",
          },
          {
            type: "paragraph",
            text: "The new structure also gave Settings a scalable framework for future products. Instead of throwing new products onto existing Settings pages, each product could be introduced as its own section with its own subpages.",
          },
        ],
      },
      {
        id: "reduce-unnecessary-decisions",
        navLabel: "Reduce unnecessary decisions",
        heading: "Reduce unnecessary decisions",
        blocks: [
          {
            type: "paragraph",
            text: "I focused on eliminating decisions that added little value during setup. Communities still had access to the same level of customization, but the most common path became much simpler.",
          },
          {
            type: "list",
            items: [
              "Infrequently used settings were moved out of the primary setup flow or removed altogether, helping customers focus on the decisions that actually mattered during setup.",
              "Defaults were driven by data rather than assumptions. I analyzed PostHog and Metabase data to identify which settings communities actually chose most often, then used those as the defaults for new communities.",
              "Progressive disclosure kept advanced configuration out of the way until it was needed. Most communities only needed a handful of fields to create a position, so additional options appeared only when customers chose to customize them.",
            ],
          },
          {
            type: "paragraph",
            text: "The redesign preserved the platform's flexibility while reducing unnecessary decisions during setup.",
          },
        ],
      },
      {
        id: "use-consistent-design-patterns",
        navLabel: "Use consistent design patterns",
        heading: "Use consistent design patterns",
        blocks: [
          {
            type: "paragraph",
            text: "Similar functionality often behaved differently throughout Settings. Save behavior, confirmations, layouts, and components had all evolved independently over time. My goal was to standardize those patterns so customers didn't have to second guess how the interface would work.",
          },
          {
            type: "list",
            items: [
              "Save behavior became consistent across Settings. Customers no longer had to wonder whether changes would save automatically, require saving the entire page, or update one item at a time. Once they learned how changes were applied, that behavior stayed consistent throughout the experience.",
              "Destructive actions followed the same confirmation pattern throughout Settings. Whether customers were deleting a position, area, or another configuration, the experience consistently communicated when an action was permanent and required confirmation.",
              "Related functionality reused the same layouts, components, and interaction patterns instead of treating every feature as a unique experience. The Staff Experience page brought together multiple scheduling features under a shared structure, making it easier to scan, compare, and configure similar settings.",
            ],
          },
          {
            type: "paragraph",
            text: "By building on familiar patterns instead of reinventing them, customers could spend less time learning how Settings worked and more time configuring their community.",
          },
        ],
      },
      {
        id: "outcome",
        navLabel: "A foundation for future products",
        heading: "A foundation for future products",
        blocks: [
          {
            type: "paragraph",
            text: "The redesign gave Veras a Settings experience that could scale alongside the platform instead of being reworked every time a new product was introduced. As Veras expanded into Time & Attendance and Payroll, those products adopted the redesigned information architecture rather than creating their own Settings structure. Each product had a dedicated place within the platform, allowing Settings to grow intentionally instead of becoming increasingly fragmented.",
          },
          {
            type: "paragraph",
            text: "Customer Success embraced the redesign because it directly addressed the challenges they encountered during onboarding. By introducing decisions in a more natural order, removing unnecessary configuration, and standardizing patterns across Settings, the redesign made it easier for Customer Success to onboard new communities and easier for customers to configure the platform with confidence.",
          },
          {
            type: "paragraph",
            text: "The project also established a framework for future design decisions. Rather than finding space for new features on existing pages, future Settings work was expected to fit within the established workflow, reduce unnecessary decisions, and build on existing design patterns. The redesign became a foundation the product team could continue building on as Veras expanded.",
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
