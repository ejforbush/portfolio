"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Same word-by-word blur-in treatment as Footer's "Let's connect!", but
// triggered once on mount rather than by scrolling into view — the hero is
// the first thing on the page, so there's no "into view" to wait for.
// `pause` adds extra delay before that word, on top of the regular stagger
// — used to set "simple" apart as a small beat rather than the next word in
// the same rhythm.
const HEADLINE_WORDS: { text: string; italic?: boolean; pause?: number }[] = [
  { text: "Making" },
  { text: "complex" },
  { text: "products" },
  { text: "feel" },
  { text: "simple", italic: true, pause: 100 },
];
const WORD_REVEAL_STAGGER_MS = 100;

export default function Hero() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setRevealed(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="px-4 pt-24">
      <div className="grain-overlay relative mx-auto h-[69vh] min-h-[480px] w-full max-w-6xl overflow-hidden rounded-card">
        <Image
          src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1200&fit=crop&q=80&auto=format"
          alt="Close-up of an ocean wave"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <h1 className="max-w-2xl -translate-y-8 text-center font-serif text-4xl text-white sm:text-5xl md:text-6xl">
            {HEADLINE_WORDS.map((word, index) => (
              <span
                key={word.text}
                style={{
                  transitionDelay: `${index * WORD_REVEAL_STAGGER_MS + (word.pause ?? 0)}ms`,
                }}
                className={`inline-block [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] transition-[filter,opacity] duration-700 ease-out ${
                  word.italic ? "italic" : ""
                } ${index < HEADLINE_WORDS.length - 1 ? "mr-[0.28em]" : ""} ${
                  revealed ? "opacity-100 blur-none" : "opacity-0 blur-md"
                }`}
              >
                {word.text}
              </span>
            ))}
          </h1>
        </div>
      </div>
    </div>
  );
}
