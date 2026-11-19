// First-load sequence. Progress follows REAL work (fonts + critical images), with a floor so it
// reads as intentional and a ceiling so it never becomes a usability problem.
import { gsap } from "gsap";
import { ease, prefersReducedMotion } from "./env";

let format = (p: number) => String(Math.round(p)).padStart(3, "0");
export const setLoaderFormat = (fn: (p: number) => string) => {
  format = fn;
};
let exit: ((root: HTMLElement) => gsap.core.Timeline) | null = null;
export const setLoaderExit = (fn: (root: HTMLElement) => gsap.core.Timeline) => {
  exit = fn;
};

const MIN = 1.1;
const MAX = 2.6;

function criticalAssets(): Promise<unknown>[] {
  const imgs = [...document.querySelectorAll<HTMLImageElement>("img[data-critical]")];
  return [document.fonts.ready, ...imgs.map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {})))];
}

export async function runLoader(): Promise<void> {
  const root = document.getElementById("loader");
  if (!root || root.hidden) return;
  if (prefersReducedMotion()) {
    await Promise.race([Promise.all(criticalAssets()), wait(MAX)]);
    await gsap.to(root, { autoAlpha: 0, duration: 0.3 });
    return finish(root);
  }
  const count = root.querySelector<HTMLElement>("[data-loader-count]");
  const bar = root.querySelector<HTMLElement>("[data-loader-bar]");
  const tasks = criticalAssets();
  let done = 0;
  const shown = { v: 0 };
  const target = { v: 0 };
  tasks.forEach((t) =>
    t.then(() => {
      done++;
      target.v = (done / tasks.length) * 100;
    }),
  );
  const start = performance.now();

  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const timeCap = Math.min(100, (elapsed / MIN) * 100);
      const goal = elapsed > MAX ? 100 : Math.min(target.v, timeCap);
      shown.v += (goal - shown.v) * 0.14;
      if (goal === 100 && shown.v > 99.5) shown.v = 100;
      if (count) count.textContent = format(shown.v);
      if (bar) bar.style.transform = `scaleX(${shown.v / 100})`;
      if (shown.v === 100) {
        gsap.ticker.remove(tick);
        resolve();
      }
    };
    gsap.ticker.add(tick);
  });

  if (exit) {
    await exit(root);
    return finish(root);
  }
  await gsap.to(root, { autoAlpha: 0, duration: 0.6, ease: ease.inOut });
  finish(root);
}

// Hide rather than remove: in React apps the loader node belongs to React.
function finish(root: HTMLElement) {
  root.hidden = true;
  document.documentElement.classList.add("is-loaded");
}

const wait = (s: number) => new Promise((r) => setTimeout(r, s * 1000));
