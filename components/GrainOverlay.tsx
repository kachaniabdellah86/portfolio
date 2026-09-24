// Desktop only: on phones these two full-screen layers are re-blended over the
// live 3D canvas every frame, at device resolution, for texture barely visible
// on a high-density screen.
export default function GrainOverlay() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] hidden opacity-[0.05] md:block"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] hidden md:block"
        style={{ boxShadow: "inset 0 0 190px rgba(0, 0, 0, 0.55)" }}
      />
    </>
  );
}
