"use client";

import { useEffect, useState } from "react";

const SCROLL_CUE_WORDS = ["Scroll", "to", "explore"];
// Delay between each word's blur-in reveal once it starts appearing.
const WORD_REVEAL_STAGGER_MS = 150;
// How long to wait before showing the cue at all.
const REVEAL_DELAY_MS = 2000;
// If the user scrolls past this before the delay is up, skip the reveal —
// they've already found their way down, so the hint would be redundant.
const SCROLL_CANCEL_THRESHOLD = 24;
// Start fading the instant the user scrolls even slightly.
const FADE_TRIGGER_SCROLL_Y = 8;

export default function ScrollCue() {
  const [revealed, setRevealed] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.scrollY <= SCROLL_CANCEL_THRESHOLD) {
        setRevealed(true);
      }
    }, REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setFadingOut(window.scrollY > FADE_TRIGGER_SCROLL_Y);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`flex items-center justify-center gap-2 transition-opacity duration-300 ease-out ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Balances the arrow's width so the words end up centered, not the row. */}
      <span aria-hidden="true" className="inline-block w-3.5" />
      <span className="font-handwriting text-lg tracking-[0.04em] text-zinc-900 dark:text-zinc-100">
        {SCROLL_CUE_WORDS.map((word, index) => (
          <span
            key={word}
            style={{ transitionDelay: `${index * WORD_REVEAL_STAGGER_MS}ms` }}
            className={`inline-block transition-[filter,opacity] duration-700 ease-out ${
              index < SCROLL_CUE_WORDS.length - 1 ? "mr-[0.3em]" : ""
            } ${revealed ? "opacity-100 blur-none" : "opacity-0 blur-md"}`}
          >
            {word}
          </span>
        ))}
      </span>
      <span
        style={{
          transitionDelay: `${SCROLL_CUE_WORDS.length * WORD_REVEAL_STAGGER_MS}ms`,
        }}
        className={`inline-block transition-[filter,opacity] duration-700 ease-out ${
          revealed ? "opacity-100 blur-none" : "opacity-0 blur-md"
        }`}
      >
        <svg
          viewBox="0 0 24 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="-mt-0.5 h-4 w-3.5 text-zinc-900 dark:text-zinc-100"
        >
          <path d="M12 3 C11.4 9 12.7 15 12.1 21" />
          <path d="M5.5 15 C7.8 18 9.8 20.3 12 21.5" />
          <path d="M18.5 14.5 C16.5 17.7 14.3 20.2 12 21.5" />
        </svg>
      </span>
    </div>
  );
}
