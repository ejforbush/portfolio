"use client";

import { useEffect, useState } from "react";

type Edge = "top" | "bottom";

// How far (in px) each fade ramps over: for the top edge, how far the user
// needs to scroll before it's fully visible; for the bottom edge, how close
// to the true bottom of the page before it fades back out. Both are "more
// content this way" cues, so neither should show when there's nothing to
// hint at — no scrolling done yet, or no content left below.
const FADE_ZONE = 120;

export default function EdgeBlur({ edge }: { edge: Edge }) {
  const [opacity, setOpacity] = useState(edge === "top" ? 0 : 1);

  useEffect(() => {
    const onScroll = () => {
      const raw =
        edge === "top"
          ? window.scrollY
          : document.documentElement.scrollHeight -
            window.scrollY -
            window.innerHeight;
      setOpacity(Math.min(Math.max(raw / FADE_ZONE, 0), 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [edge]);

  return (
    <div
      aria-hidden
      style={{ opacity }}
      className={`pointer-events-none fixed inset-x-0 z-30 h-10 backdrop-blur-[2px] ${
        edge === "top" ? "top-blur-fade top-0" : "bottom-blur-fade bottom-0"
      }`}
    />
  );
}
