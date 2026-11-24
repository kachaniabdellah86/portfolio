// Scroll choreography (DESIGN.md: one continuous film). Every section hands over to the next:
// the hero melts away, the statement reads itself word by word, the steps light up in order and
// the offers slide in one by one. All of it is reverted on navigation and skipped under reduced motion.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { onPage, prefersReducedMotion } from "@/engine";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function setupChoreo() {
  onPage(() => {
    if (prefersReducedMotion()) return;

    // Hero base drifts up and out with the melting name.
    const hero = document.querySelector<HTMLElement>(".k-hero");
    const base = hero?.querySelector<HTMLElement>(".k-hero__base");
    if (hero && base) {
      gsap.to(base, { yPercent: -40, autoAlpha: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom 30%", scrub: true } });
    }

    // Statement: read word by word, as the visitor scrolls through it.
    document.querySelectorAll<HTMLElement>("[data-scrub-words]").forEach((el) => {
      const split = SplitText.create(el, { type: "words", wordsClass: "k-word-scrub" });
      gsap.fromTo(split.words, { opacity: 0.16 }, { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: 0.4 } });
    });

    // Process: the four steps light up in order.
    const steps = document.querySelector<HTMLElement>(".k-steps");
    if (steps) {
      gsap.fromTo(
        steps.querySelectorAll(".k-step"),
        { opacity: 0.18, y: 36 },
        { opacity: 1, y: 0, stagger: 0.35, ease: "none", scrollTrigger: { trigger: steps, start: "top 88%", end: "bottom 78%", scrub: 0.5 } },
      );
    }

    // Offers: rows slide in one after another.
    const rows = gsap.utils.toArray<HTMLElement>(".k-row");
    if (rows.length) {
      gsap.set(rows, { autoAlpha: 0, x: -28 });
      ScrollTrigger.batch(rows, {
        start: "top 92%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, x: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 }),
      });
    }
  });
}
