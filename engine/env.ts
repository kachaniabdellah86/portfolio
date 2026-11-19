export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isTouch = () => matchMedia("(hover: none), (pointer: coarse)").matches;
export const isMobile = () => matchMedia("(max-width: 767px)").matches;

// Shared easing vocabulary (DESIGN.md: unlatch and swing). Never invent per-component curves.
export const ease = {
  out: "expo.out", // entrances, bolt slides
  inOut: "expo.inOut", // doors, curtains, page transitions
  soft: "power3.out", // hovers and small UI
} as const;
