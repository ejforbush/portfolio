import Image from "next/image";

export default function Hero() {
  return (
    <div className="grain-overlay relative h-[94vh] min-h-[480px] w-full overflow-hidden">
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
    </div>
  );
}
