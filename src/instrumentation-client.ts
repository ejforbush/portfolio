import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (key && host) {
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    // Next.js App Router navigates via the History API rather than full
    // page loads, so this setting is what makes pageviews fire on route changes.
    capture_pageview: "history_change",
  });
}
