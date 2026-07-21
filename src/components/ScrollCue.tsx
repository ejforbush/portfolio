"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// How long it stays at full opacity before starting to fade.
const HOLD_SCROLL_DISTANCE = 200;
// How much additional scrolling, after the hold, it takes to fully fade out.
const FADE_SCROLL_DISTANCE = 400;

export default function ScrollCue() {
  const ref = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const pastHold = Math.max(window.scrollY - HOLD_SCROLL_DISTANCE, 0);
      setOpacity(Math.min(Math.max(1 - pastHold / FADE_SCROLL_DISTANCE, 0), 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      style={{ opacity }}
      className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2 sm:bottom-8"
    >
      <span className="text-sm font-semibold tracking-wide text-white uppercase [text-shadow:0px_1px_2px_rgba(0,0,0,0.05)]">
        Scroll to explore
      </span>
      <Image
        src="/icons/arrow-down.svg"
        alt=""
        width={16}
        height={16}
        className="animate-subtle-bounce -mt-0.5 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
      />
    </div>
  );
}
