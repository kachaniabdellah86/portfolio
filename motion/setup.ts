// Global motion (DESIGN.md: shimmer and bend). Runs once on the client, before the first page.
import { gsap } from "gsap";
import { ease, isTouch, onPage, prefersReducedMotion, setLoaderExit, setTransition } from "@/engine";
import { setupChoreo } from "./choreo";

// The screen the visitor opened, if the navigation started from a work screen.
let sourceScreen: HTMLElement | null = null;
function rememberSource(e: Event) {
  const a = (e.target as Element | null)?.closest?.("a");
  sourceScreen = a?.matches("[data-bend]") ? (a as HTMLElement) : null;
}

export function setupMotion() {
  addEventListener("pointerdown", rememberSource, true);
  addEventListener("keydown", (e) => {
    if (e.key === "Enter") rememberSource(e);
  }, true);

  // Loader → hero: the counter slides away and the indigo field lifts off the page.
  setLoaderExit((root) =>
    gsap
      .timeline()
      .to(root.querySelectorAll("[data-loader-out], [data-loader-bar]"), { yPercent: -110, autoAlpha: 0, duration: 0.6, ease: ease.inOut, stagger: 0.05 })
      .to(root, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: ease.inOut }, "-=0.3"),
  );

  // Page change: the indigo panel wipes up over the page, then lifts off the next one.
  setTransition({
    leave: (c) => {
      const panel = c.querySelector(".c-panel");
      const img = sourceScreen?.querySelector("img");
      if (sourceScreen && img) {
        // Shared-element cut: the clicked screen grows from where it sits to fill the frame,
        // and the case study opens behind it.
        const b = sourceScreen.getBoundingClientRect();
        const ghost = document.createElement("img");
        ghost.src = img.currentSrc || img.src;
        ghost.alt = "";
        ghost.className = "c-ghost";
        Object.assign(ghost.style, { left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px` });
        c.appendChild(ghost);
        gsap.set(panel, { clipPath: "inset(100% 0% 0% 0%)" });
        return gsap
          .timeline()
          .set(c, { autoAlpha: 1 })
          .to(ghost, { left: 0, top: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: 1, ease: ease.inOut });
      }
      return gsap
        .timeline()
        .set(c, { autoAlpha: 1 })
        .fromTo(panel, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: ease.inOut })
        .fromTo(panel?.querySelector("span") ?? [], { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: ease.out }, 0.25);
    },
    enter: (c) => {
      const panel = c.querySelector(".c-panel");
      const ghost = c.querySelector(".c-ghost");
      if (ghost) {
        sourceScreen = null;
        return gsap
          .timeline()
          .to(ghost, { autoAlpha: 0, scale: 1.04, duration: 0.7, ease: ease.soft, delay: 0.1 })
          .add(() => ghost.remove())
          .set(c, { autoAlpha: 0 });
      }
      return gsap
        .timeline()
        .to(panel?.querySelector("span") ?? [], { yPercent: -60, autoAlpha: 0, duration: 0.45, ease: ease.inOut })
        .to(panel, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: ease.inOut }, "-=0.2")
        .set(c, { autoAlpha: 0 });
    },
  });

  buttonFill();
  pageGround();
  setupChoreo();
}

/** The page ground shifts between indigo and night per section (one variable, tweened, never cut). */
function pageGround() {
  onPage(() => {
    const root = document.querySelector<HTMLElement>(".ag[data-grounds]");
    if (!root) return;
    const sections = [...document.querySelectorAll<HTMLElement>("[data-ground]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) root.style.setProperty("--page", entry.target.getAttribute("data-ground") === "night" ? "var(--c-night)" : "var(--c-field)");
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  });
}

/** Primary buttons: saffron floods in from the side the pointer entered. */
function buttonFill() {
  onPage(() => {
    if (isTouch() || prefersReducedMotion()) return;
    const off: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>("[data-fill]").forEach((btn) => {
      const fill = btn.querySelector<HTMLElement>(".g-btn__fill");
      if (!fill) return;
      const at = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        return `${e.clientX - r.left}px ${e.clientY - r.top}px`;
      };
      let closed = true;
      const open = (p: string) => {
        if (closed) gsap.set(fill, { clipPath: `circle(0% at ${p})` });
        closed = false;
        btn.classList.add("is-filled");
        gsap.to(fill, { clipPath: `circle(150% at ${p})`, duration: 0.6, ease: ease.soft, overwrite: true });
      };
      const close = (p: string) => {
        btn.classList.remove("is-filled");
        gsap.to(fill, { clipPath: `circle(0% at ${p})`, duration: 0.5, ease: ease.soft, overwrite: true, onComplete: () => { closed = true; } });
      };
      const enter = (e: PointerEvent) => open(at(e));
      const leave = (e: PointerEvent) => close(at(e));
      const focus = () => btn.matches(":focus-visible") && open("50% 50%");
      const blur = () => close("50% 50%");
      btn.addEventListener("pointerenter", enter);
      btn.addEventListener("pointerleave", leave);
      btn.addEventListener("focus", focus);
      btn.addEventListener("blur", blur);
      off.push(() => {
        btn.removeEventListener("pointerenter", enter);
        btn.removeEventListener("pointerleave", leave);
        btn.removeEventListener("focus", focus);
        btn.removeEventListener("blur", blur);
      });
    });
    return () => off.forEach((f) => f());
  });
}
