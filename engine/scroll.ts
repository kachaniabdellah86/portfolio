// Smooth scroll on ONE clock: Lenis is driven by gsap.ticker, ScrollTrigger reads Lenis.
// Reduced motion and touch: native scroll, no Lenis.
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isTouch, prefersReducedMotion } from "./env";
import { scrollBus, setLenis } from "@/components/lenis-bridge";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
const listeners = new Set<(s: ScrollState) => void>();

export type ScrollState = { y: number; velocity: number; progress: number };
const state: ScrollState = { y: 0, velocity: 0, progress: 0 };

function publish() {
  // Older components still read the shared bus.
  scrollBus.y = state.y;
  scrollBus.velocity = state.velocity;
  scrollBus.progress = state.progress;
  listeners.forEach((fn) => fn(state));
}

export function initScroll() {
  if (lenis) return;
  if (prefersReducedMotion() || isTouch()) {
    addEventListener("scroll", nativeTick, { passive: true });
    return;
  }
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: true });
  setLenis(lenis);
  lenis.on("scroll", (l: Lenis) => {
    state.y = l.scroll;
    state.velocity = l.velocity;
    state.progress = l.limit > 0 ? l.scroll / l.limit : 0; // Lenis reports 1 on pages that cannot scroll
    ScrollTrigger.update();
    publish();
  });
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function nativeTick() {
  const max = document.documentElement.scrollHeight - innerHeight;
  state.velocity = scrollY - state.y;
  state.y = scrollY;
  state.progress = max > 0 ? scrollY / max : 0;
  publish();
}

export const onScroll = (fn: (s: ScrollState) => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const scrollState = () => state;
export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();
export function resetScroll() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else scrollTo(0, 0);
  state.y = 0;
  state.velocity = 0;
}
// The section a page change should land on. Kept here and in session storage as well as in
// the URL, because the router does not always keep the hash (its full-reload fallback drops it).
let pendingHash = "";
const HASH_KEY = "engine:hash";
export const setPendingHash = (hash: string, path = "") => {
  pendingHash = hash;
  try {
    if (hash && path) sessionStorage.setItem(HASH_KEY, JSON.stringify({ path, hash }));
    else sessionStorage.removeItem(HASH_KEY);
  } catch {}
};
function storedHash() {
  try {
    const raw = sessionStorage.getItem(HASH_KEY);
    sessionStorage.removeItem(HASH_KEY);
    const saved = raw ? (JSON.parse(raw) as { path: string; hash: string }) : null;
    return saved?.path === location.pathname ? saved.hash : "";
  } catch {
    return "";
  }
}
/** After a page change (or a load) to `/page#section`, start at that section, not the top. */
export function jumpToHash() {
  const saved = storedHash();
  const hash = pendingHash || location.hash || saved;
  pendingHash = "";
  const id = decodeURIComponent(hash.slice(1));
  const el = id ? document.getElementById(id) : null;
  if (!el) return;
  const go = () => {
    // Lenis still holds the previous page's scroll limit until it re-measures.
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(el, { immediate: true, force: true });
    } else el.scrollIntoView();
    state.y = scrollY;
  };
  go();
  // Once more after ScrollTrigger has added its pin spacers.
  requestAnimationFrame(() => requestAnimationFrame(go));
}
export function scrollToTarget(target: string | HTMLElement | number) {
  if (lenis) lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else if (typeof target === "number") scrollTo({ top: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView();
}
