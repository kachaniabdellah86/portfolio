"use client";

export default function ScrollVideoFallback({
  poster,
}: {
  poster?: string;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {poster && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 28% 55%, rgba(91,143,255,0.10) 0%, transparent 60%),
            radial-gradient(ellipse at 72% 28%, rgba(124,111,255,0.07) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 80%, rgba(91,143,255,0.05) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
}
