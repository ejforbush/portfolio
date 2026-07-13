export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 py-10 text-center">
        <p className="text-lg font-medium">Let&apos;s connect!</p>
        <a
          href="https://www.linkedin.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          LinkedIn (placeholder link)
        </a>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          &copy; {new Date().getFullYear()} Eric Forbush
        </p>
      </div>
    </footer>
  );
}
