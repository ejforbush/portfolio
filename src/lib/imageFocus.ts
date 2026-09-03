import raw from "@/data/imageFocus.json";

export type ImageFocus = { x: number; y: number; zoom: number };

export const DEFAULT_FOCUS: ImageFocus = { x: 50, y: 50, zoom: 1 };

const focusMap = raw as Record<string, Partial<ImageFocus>>;

export function getImageFocus(slug: string): ImageFocus {
  return { ...DEFAULT_FOCUS, ...focusMap[slug] };
}
