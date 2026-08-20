import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About | Eric Forbush",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-40 pb-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">About</h1>
      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div className="aspect-square overflow-hidden rounded-card bg-zinc-100 sm:col-span-1 dark:bg-zinc-900">
          <Image
            src="https://placehold.co/400x400/e5e7eb/374151?text=Photo"
            alt="Placeholder headshot"
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="sm:col-span-2">
          <p className="font-serif text-lg text-zinc-600 dark:text-zinc-300">
            Placeholder bio copy. This section will introduce who I am, my
            background as a UX designer, and how I approach design work. It
            will be replaced with real content once the rest of the site
            structure is finalized.
          </p>
          <p className="mt-4 font-serif text-lg text-zinc-600 dark:text-zinc-300">
            A second paragraph placeholder — could cover current role,
            interests outside of work, or design philosophy.
          </p>
        </div>
      </div>
    </div>
  );
}
