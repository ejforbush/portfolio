import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Creating simple and enjoyable digital experiences
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
        Placeholder intro copy: a sentence or two about who I am and the kind
        of design work I do. Update this once the real bio is ready.
      </p>
      <div className="mt-10">
        <Link
          href="/projects"
          className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          View projects
        </Link>
      </div>
    </section>
  );
}
