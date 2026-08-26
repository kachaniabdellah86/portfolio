"use client";

export default function ScrollVideoFallback({
  poster = "/media/universe-poster.jpg",
  src = "/media/universe.mp4",
}: {
  poster?: string;
  src?: string;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Real ambient looping video for mobile / iOS Safari */}
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        webkit-playsinline="true"
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />
      {/* Dark gradient overlay for typography readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(14,14,12,0.45) 0%,
              rgba(14,14,12,0.25) 25%,
              rgba(14,14,12,0.35) 50%,
              rgba(14,14,12,0.55) 75%,
              rgba(14,14,12,0.85) 100%
            )
          `,
        }}
      />
    </div>
  );
}
