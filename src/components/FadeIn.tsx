"use client";

import { useLayoutEffect, useRef, useState } from "react";

export default function FadeIn({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Already in view the moment we start observing (e.g. landing directly
    // on this section via an anchor jump) — just show it. The reveal is for
    // scrolling INTO view, not a pop-in for content you land on already
    // looking at, which is what happens when every card in the section
    // crosses the intersection threshold simultaneously on arrival.
    const rect = node.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
    if (alreadyInView) {
      setSkipAnimation(true);
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${skipAnimation ? "" : "transition-all duration-700 ease-out"} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
