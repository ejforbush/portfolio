"use client";

import { useEffect, useRef, useState } from "react";

const CONNECT_WORDS = ["Let's", "connect!"];
// Delay between each word's blur-in reveal once it starts appearing.
const WORD_REVEAL_STAGGER_MS = 150;

export default function Footer() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="[overflow-anchor:none] border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 py-10 text-center">
        <p ref={ref} className="font-serif text-xl font-medium italic">
          {CONNECT_WORDS.map((word, index) => (
            <span
              key={word}
              style={{ transitionDelay: `${index * WORD_REVEAL_STAGGER_MS}ms` }}
              className={`inline-block transition-[filter,opacity] duration-700 ease-out ${
                index < CONNECT_WORDS.length - 1 ? "mr-[0.3em]" : ""
              } ${revealed ? "opacity-100 blur-none" : "opacity-0 blur-md"}`}
            >
              {word}
            </span>
          ))}
        </p>
        <a
          href="https://www.linkedin.com/in/eric-forbush/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-[#0A66C2] transition-colors duration-150 hover:text-[#004182] active:opacity-60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.940v5.666H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
