"use client";

import { useEffect, useState } from "react";
import HeroFrame from "@/components/HeroFrame";

// Same word-by-word blur-in treatment as Footer's "Let's connect!", but
// triggered once on mount rather than by scrolling into view — the hero is
// the first thing on the page, so there's no "into view" to wait for.
// `pause` adds extra delay before that word, on top of the regular stagger
// — used to set "simple" apart as a small beat rather than the next word in
// the same rhythm. `breakAfter` forces a line break after that word instead
// of leaving the wrap point to whatever the container's width happens to
// produce — natural reflow put "Making complex" / "products feel simple" at
// this width, but "Making complex products" / "feel simple" is the intended
// reading regardless of viewport.
const HEADLINE_WORDS: { text: string; italic?: boolean; pause?: number; breakAfter?: boolean }[] =
  [
    { text: "Making" },
    { text: "complex" },
    { text: "products", breakAfter: true },
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
    <HeroFrame
      src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1200&fit=crop&q=80&auto=format"
      alt="Close-up of an ocean wave"
      mobileHeightVh={64}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/20" />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <h1 className="max-w-3xl -translate-y-8 text-left font-serif text-3xl text-white sm:text-5xl md:text-6xl">
          {HEADLINE_WORDS.map((word, index) => (
            <span key={word.text}>
              <span
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
              {word.breakAfter && <br />}
            </span>
          ))}
        </h1>
      </div>
    </HeroFrame>
  );
}
