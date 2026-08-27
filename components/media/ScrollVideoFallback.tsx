"use client";

import Image from "next/image";

export default function ScrollVideoFallback({
  poster = "/media/universe-poster.jpg",
  src = "/media/universe.webm",
  fallbackSrc = "/media/universe.mp4",
  staticOnly = false,
}: {
  poster?: string;
  src?: string;
  fallbackSrc?: string;
  staticOnly?: boolean;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {staticOnly ? (
        <Image
          src={poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
      ) : (
        <video
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        >
          <source src={src} type="video/webm" />
          <source src={fallbackSrc} type="video/mp4" />
        </video>
      )}
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
