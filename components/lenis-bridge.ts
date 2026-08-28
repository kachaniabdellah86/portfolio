export type LenisLike = {
  scrollTo: (target: HTMLElement | number, options?: { offset?: number; immediate?: boolean }) => void;
};

declare global {
  interface Window {
    __lenis?: LenisLike;
  }
}

export function setLenis(lenis: LenisLike | undefined) {
  if (typeof window === "undefined") return;
  if (lenis) {
    window.__lenis = lenis;
  } else {
    delete window.__lenis;
  }
}

export const scrollBus = {
  y: 0,
  velocity: 0,
  progress: 0,
  journeyProgress: 0,
};
