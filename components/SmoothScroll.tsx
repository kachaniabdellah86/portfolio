import type { ReactNode } from "react";

// Smooth scrolling now lives in the motion engine (engine/scroll.ts): one Lenis instance on the
// GSAP ticker for every page. This wrapper stays so older pages keep compiling unchanged.
export default function SmoothScroll({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
