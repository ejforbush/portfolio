"use client";

import { useEffect, useRef, useState } from "react";
import { allProjects, type Project } from "@/data/projects";
import { DEFAULT_FOCUS, type ImageFocus } from "@/lib/imageFocus";

const ASPECTS = [
  { key: "grid", label: "Grid card (2:3)", className: "aspect-[2/3]" },
  { key: "list", label: "List card (3:4)", className: "aspect-[3/4]" },
  { key: "desktop", label: "Desktop card (4:5)", className: "aspect-[4/5]" },
] as const;

type AspectKey = (typeof ASPECTS)[number]["key"];

// Drag-to-pan / scroll-to-zoom preview of the exact object-fit: cover crop
// each ProjectCard variant renders, so what you see here is what ships.
function EditableImage({
  project,
  focus,
  aspectClassName,
  onChange,
}: {
  project: Project;
  focus: ImageFocus;
  aspectClassName: string;
  onChange: (next: ImageFocus) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: focus.x,
      startY: focus.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!drag || !container || !img || !img.naturalWidth || !img.naturalHeight) return;

    const { width: containerW, height: containerH } = container.getBoundingClientRect();
    // Base object-fit: cover size, before the extra zoom transform is applied.
    const scale = Math.max(containerW / img.naturalWidth, containerH / img.naturalHeight);
    const baseW = img.naturalWidth * scale;
    const baseH = img.naturalHeight * scale;
    // Room to pan on each axis at the current zoom. A square photo in a
    // portrait frame has zero vertical room at 1x — that only opens up once
    // `focus.zoom` is folded in here, so this must scale with zoom too.
    const rangeX = focus.zoom * baseW - containerW;
    const rangeY = focus.zoom * baseH - containerH;

    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;

    let nextX = drag.startX;
    let nextY = drag.startY;
    if (rangeX > 0) nextX = drag.startX - (dx / rangeX) * 100;
    if (rangeY > 0) nextY = drag.startY - (dy / rangeY) * 100;

    onChange({
      ...focus,
      x: Math.min(100, Math.max(0, nextX)),
      y: Math.min(100, Math.max(0, nextY)),
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${aspectClassName} w-full max-w-[240px] cursor-grab touch-none overflow-hidden rounded-2xl bg-zinc-200 active:cursor-grabbing dark:bg-zinc-800`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <img
        ref={imgRef}
        src={project.image}
        alt={project.title}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
        style={{
          objectPosition: `${focus.x}% ${focus.y}%`,
          transform: `scale(${focus.zoom})`,
          transformOrigin: `${focus.x}% ${focus.y}%`,
        }}
      />
    </div>
  );
}

export default function ImageEditorPage() {
  const [focusMap, setFocusMap] = useState<Record<string, Partial<ImageFocus>>>({});
  const [aspectKey, setAspectKey] = useState<AspectKey>("grid");
  const [loaded, setLoaded] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dev/image-focus")
      .then((r) => r.json())
      .then((data) => setFocusMap(data ?? {}))
      .finally(() => setLoaded(true));
  }, []);

  const getFocus = (slug: string): ImageFocus => ({ ...DEFAULT_FOCUS, ...focusMap[slug] });
  const setFocus = (slug: string, focus: ImageFocus) =>
    setFocusMap((prev) => ({ ...prev, [slug]: focus }));

  const save = async (slug: string) => {
    const focus = getFocus(slug);
    await fetch("/api/dev/image-focus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, ...focus }),
    });
    setSavedSlug(slug);
    setTimeout(() => setSavedSlug((s) => (s === slug ? null : s)), 1500);
  };

  const aspect = ASPECTS.find((a) => a.key === aspectKey)!;

  if (!loaded) {
    return <div className="p-10 text-sm text-zinc-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-2 font-serif text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
        Image position &amp; zoom
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        Drag a photo to reposition it, use the zoom slider to zoom, then hit Save. This writes to{" "}
        <code>src/data/imageFocus.json</code> and every card using that photo picks it up
        automatically. Dev-only tool — not linked from, or shipped with, the live site.
      </p>

      <div className="mb-8 flex gap-2">
        {ASPECTS.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => setAspectKey(a.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              a.key === aspectKey
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {allProjects.map((project) => {
          const focus = getFocus(project.slug);
          return (
            <div key={project.slug} className="flex flex-col items-start gap-3">
              <h2 className="font-serif text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {project.title}
              </h2>
              <EditableImage
                project={project}
                focus={focus}
                aspectClassName={aspect.className}
                onChange={(next) => setFocus(project.slug, next)}
              />
              <div className="flex w-full max-w-[240px] items-center gap-2">
                <label className="text-xs text-zinc-500">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.01}
                  value={focus.zoom}
                  onChange={(e) => setFocus(project.slug, { ...focus, zoom: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="w-10 text-right text-xs tabular-nums text-zinc-500">
                  {focus.zoom.toFixed(2)}x
                </span>
              </div>
              <div className="text-xs text-zinc-400">
                x {focus.x.toFixed(0)}% · y {focus.y.toFixed(0)}%
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => save(project.slug)}
                  className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-zinc-900"
                >
                  {savedSlug === project.slug ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setFocus(project.slug, DEFAULT_FOCUS)}
                  className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
