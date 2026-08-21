import Image from "next/image";

// Shared "frame" for the home hero and each large case study's banner —
// same padding, height, corner radius, and grain overlay, so the two never
// drift apart. Each caller supplies its own image; anything passed as
// children (the home hero's gradient + headline) sits on top of it.
export default function HeroFrame({
  src,
  alt,
  heightVh = 80,
  mobileHeightVh,
  children,
}: {
  src: string;
  alt: string;
  heightVh?: number;
  // Below the sm breakpoint only — defaults to heightVh (no mobile-specific
  // override) so existing callers that don't pass it are unaffected.
  mobileHeightVh?: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-0 pt-0 sm:px-8">
      <div
        style={
          {
            "--hero-h-mobile": `${mobileHeightVh ?? heightVh}vh`,
            "--hero-h-desktop": `${heightVh}vh`,
          } as React.CSSProperties
        }
        className="hero-frame-height grain-overlay relative min-h-[480px] w-full overflow-hidden rounded-none bg-zinc-100 sm:rounded-3xl dark:bg-zinc-900"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        {children}
      </div>
    </div>
  );
}
