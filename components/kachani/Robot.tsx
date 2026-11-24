"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import type { BufferGeometry, Material, Mesh, Object3D } from "three";
import { onPage, prefersReducedMotion, isTouch, scrollState, scrollToTarget } from "@/engine";
import { whatsappUrl } from "@/lib/site";
import { buildRoute, sampleRoute, wordGeometry, wordOpenness, type Band, type Ledge, type Route, type Sample, type Waypoint, type Word } from "./robotRoute";
import { useLocale } from "../LocaleProvider";

/**
 * The guide. An original chibi robot drawn in the site's flat poster style (cream body, bold
 * night outlines, saffron eyes, scarf and antenna; two flat tones, no shine). It lives in the
 * layout, so it survives page transitions.
 *
 * What it does for the visitor:
 *  - Walks with the scroll (position is a pure function of scroll, never a timer) along the
 *    shortest path between `[data-robot-anchor]` spots, resting on each one.
 *  - At each spot it says one short, useful line (`data-robot-say`) in a speech bubble.
 *  - When the visitor points at something marked `data-robot-react` (a project, a price, the
 *    WhatsApp button), it turns, points at it with its arm and explains what will happen.
 *  - Clicking it (or Tab + Enter) opens shortcuts: start a project, see the work, prices, top.
 * The canvas and bubble are decorative (aria-hidden); the button and menu are real controls.
 */

const vertexOutline = /* glsl */ `
  uniform float uThickness;
  void main() {
    vec3 p = position + normal * uThickness;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragmentOutline = /* glsl */ `
  uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, 1.0); }
`;

export default function Robot() {
  const { lang, dict } = useLocale();
  const t = dict.robot;
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const helloRef = useRef(t.hello);

  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    helloRef.current = t.hello;
  }, [t.hello]);

  // Close the shortcuts on Escape or a click elsewhere.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const bubble = bubbleRef.current;
    if (!wrap || !canvas || !bubble) return;
    const reduce = prefersReducedMotion();
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      // ── Renderer: full device sharpness with smooth edges (the canvas is small) ──
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
      const scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xffffff, 1.1));
      const sun = new THREE.DirectionalLight(0xffffff, 1.6);
      sun.position.set(-3, 5, 6);
      scene.add(sun);
      const camera = new THREE.PerspectiveCamera(22, 0.78, 0.1, 50);
      camera.position.set(0, 1.4, 9.6);
      camera.lookAt(0, 1.35, 0);
      const FEET = 0.862; // feet (y = 0) sit 13.8% above the canvas bottom in this framing

      // ── Flat poster materials: two tones, no shine ───────────────
      const steps = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 255, 255, 255, 255]), 2, 1, THREE.RGBAFormat);
      steps.minFilter = THREE.NearestFilter;
      steps.magFilter = THREE.NearestFilter;
      steps.needsUpdate = true;
      const toon = (color: number) => new THREE.MeshToonMaterial({ color, gradientMap: steps });
      const cream = toon(0xf4efe6);
      const night = toon(0x15141c);
      const saffronToon = toon(0xff9e2c);
      const saffron = new THREE.MeshBasicMaterial({ color: 0xffa93a });
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffb04a });
      const visorMat = new THREE.MeshBasicMaterial({ color: 0x0c0b10 });
      const outline = new THREE.ShaderMaterial({
        uniforms: { uThickness: { value: 0.045 }, uColor: { value: new THREE.Color(0x0c0b10) } },
        vertexShader: vertexOutline,
        fragmentShader: fragmentOutline,
        side: THREE.BackSide,
      });
      const materials: Material[] = [cream, night, saffronToon, saffron, eyeMat, visorMat, outline];

      const mesh = (g: BufferGeometry, m: Material, x = 0, y = 0, z = 0, ink = true) => {
        const o = new THREE.Mesh(g, m);
        o.position.set(x, y, z);
        if (ink) o.add(new THREE.Mesh(g, outline)); // bold ink outline (inverted hull)
        return o;
      };

      // ── Model ────────────────────────────────────────────────────
      const root = new THREE.Group();
      const body = new THREE.Group();
      root.add(body);
      const HIP = 0.62;

      const legs = [-1, 1].map((side) => {
        const leg = new THREE.Group();
        leg.position.set(side * 0.17, HIP, 0);
        leg.add(mesh(new THREE.CapsuleGeometry(0.08, 0.08, 4, 12), night, 0, -0.1, 0, false));
        leg.add(mesh(new THREE.CapsuleGeometry(0.135, 0.12, 6, 16), cream, 0, -0.3, 0));
        const boot = mesh(new THREE.SphereGeometry(0.17, 24, 14), night, 0, -0.52, 0.04);
        boot.scale.set(1.05, 0.62, 1.38);
        leg.add(boot);
        leg.add(mesh(new THREE.BoxGeometry(0.1, 0.025, 0.02), saffron, 0, -0.54, 0.27, false));
        body.add(leg);
        return leg;
      });

      const torso = new THREE.Group();
      torso.position.y = HIP;
      body.add(torso);
      torso.add(mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.11, 28), night, 0, 0.04, 0));
      const chest = mesh(new THREE.CapsuleGeometry(0.27, 0.16, 8, 24), cream, 0, 0.32, 0);
      chest.scale.set(1, 1, 0.86);
      torso.add(chest);
      torso.add(mesh(new THREE.CircleGeometry(0.075, 28), saffron, 0, 0.34, 0.236, false));
      const scarf = mesh(new THREE.TorusGeometry(0.2, 0.065, 10, 28), saffronToon, 0, 0.58, 0);
      scarf.rotation.x = Math.PI / 2;
      scarf.scale.set(1, 1, 0.7);
      torso.add(scarf);
      const tail = new THREE.Group();
      tail.position.set(0.1, 0.56, -0.18);
      const tailGeo = new THREE.PlaneGeometry(0.12, 0.42, 1, 6);
      tailGeo.translate(0, -0.21, 0);
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xff9e2c, side: THREE.DoubleSide });
      materials.push(tailMat);
      tail.add(new THREE.Mesh(tailGeo, tailMat));
      torso.add(tail);
      const tailBase = tailGeo.attributes.position.array.slice();

      const arms = [-1, 1].map((side) => {
        const arm = new THREE.Group();
        arm.position.set(side * 0.34, 0.47, 0);
        arm.add(mesh(new THREE.SphereGeometry(0.115, 18, 12), night, 0, 0.01, 0));
        arm.add(mesh(new THREE.CapsuleGeometry(0.055, 0.1, 4, 10), night, 0, -0.13, 0, false));
        const fore = new THREE.Group();
        fore.position.y = -0.22;
        fore.add(mesh(new THREE.CapsuleGeometry(0.095, 0.1, 6, 14), cream, 0, -0.09, 0));
        fore.add(mesh(new THREE.SphereGeometry(0.075, 14, 10), night, 0, -0.25, 0, false));
        arm.add(fore);
        torso.add(arm);
        return { arm, fore };
      });

      const head = new THREE.Group();
      head.position.y = 0.66 + 0.6;
      torso.add(head);
      const R = 0.66;
      const skull = mesh(new THREE.SphereGeometry(R, 40, 28), cream);
      skull.scale.set(1, 0.93, 0.95);
      head.add(skull);
      const visor = mesh(new THREE.SphereGeometry(R + 0.01, 40, 20, Math.PI * 0.5 - 1.0, 2.0, 1.04, 1.02), visorMat, 0, 0, 0, false);
      visor.scale.copy(skull.scale);
      head.add(visor);
      // Eyes: saffron rings; they squint into a smile when the guide is happy.
      const eyes = [-1, 1].map((side) => {
        const eye = new THREE.Group();
        eye.position.set(side * 0.2, -0.05, 0.6);
        eye.rotation.y = side * 0.32;
        eye.add(new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.024, 10, 36), eyeMat));
        head.add(eye);
        return eye;
      });
      [-1, 1].forEach((side) => {
        const pod = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 28), night, side * 0.63, -0.04, 0);
        pod.rotation.z = Math.PI / 2;
        head.add(pod);
      });
      head.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 8), night, 0.22, 0.66, -0.06, false));
      const bulb = mesh(new THREE.SphereGeometry(0.055, 14, 10), saffron, 0.22, 0.77, -0.06);
      head.add(bulb);
      scene.add(root);

      // ── Size ─────────────────────────────────────────────────────
      let robotH = 110;
      let cw = 0;
      let ch = 0;
      const sizeCanvas = () => {
        robotH = innerWidth < 768 ? 76 : Math.round(Math.max(96, Math.min(126, innerHeight * 0.13)));
        ch = Math.round((robotH * 3.73) / 2.75);
        cw = Math.round(ch * 0.78);
        canvas.style.width = `${cw}px`;
        canvas.style.height = `${ch}px`;
        wrap.style.setProperty("--w", `${cw}px`);
        wrap.style.setProperty("--h", `${ch}px`);
        renderer.setSize(cw, ch, false);
        camera.aspect = cw / ch;
        camera.updateProjectionMatrix();
      };
      sizeCanvas();
      addEventListener("resize", sizeCanvas);

      // ── Route: keyed by scroll ───────────────────────────────────
      let anchors: { el: HTMLElement; pose: string; say: string }[] = [];
      let word: HTMLElement | null = null;
      let texts: HTMLElement[] = [];
      let timelines: HTMLElement[] = [];
      let steppers: HTMLElement[] = [];
      const offPage = onPage(() => {
        anchors = [...document.querySelectorAll<HTMLElement>("[data-robot-anchor]")].map((el) => ({
          el,
          pose: el.dataset.robotAnchor || "stand",
          say: el.dataset.robotSay || "",
        }));
        word = document.querySelector<HTMLElement>(".k-hero [data-heat-text]");
        timelines = [...document.querySelectorAll<HTMLElement>(".k-steps, .g-case__facts")];
        steppers = [...document.querySelectorAll<HTMLElement>(".k-lab, .k-rows, .k-row, .k-steps, .k-facts, .g-qa, .g-qa details, .g-small, .g-case__label, .g-case__next")];
        texts = [...document.querySelectorAll<HTMLElement>(".ag :is(p, h1, h2, h3, h4, li, dt, dd, label, summary, figcaption, blockquote, .g-btn, .g-link)")].filter(
          (el) => !el.querySelector("[data-heat-text]"),
        );
      });
      const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
      // ── Scenes and ledges ──────────────────────────────────────────
      // Scenes (an anchor's `data-robot-scene`) give a section its own way of moving:
      //   read  (statement)  hops word to word as each word lights up
      //   surf  (work)       rides the screen's top edge across, leaning with the scroll
      //   rows  (offers)     hops down the price rows, pointing at each price
      // `.k-steps` / `.g-case__facts` are a timeline it walks as the steps light up, and
      // `data-robot-ground="glyph-last"` perches on the last letter of the wordmark beside it.
      // Everything in between comes from the page itself (titles, screens, photos, images,
      // hairlines), so every page, even one without anchors, gets a path.
      const vh = () => innerHeight;
      // Page position from the layout itself (offsetTop chain): reveal and scroll animations on the
      // element or any parent never move it, so the path does not shift while the visitor scrolls.
      const restY = (el: Element) => {
        let y = 0;
        let e = el as HTMLElement | null;
        if (!(e instanceof HTMLElement)) return el.getBoundingClientRect().top + scrollY;
        while (e) {
          y += e.offsetTop;
          e = e.offsetParent as HTMLElement | null;
        }
        return y;
      };
      const blockLedge = (el: Element, id: string): Ledge => {
        const r = el.getBoundingClientRect();
        const y = restY(el);
        const h = el instanceof HTMLElement ? el.offsetHeight : r.height;
        return { id, y, bottom: y + h, left: r.left, right: r.right };
      };
      const textLedge = (el: Element, id: string): Ledge | null => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = [...range.getClientRects()].filter((q) => q.width > 2);
        if (!rects.length) return null;
        const top = Math.min(...rects.map((q) => q.top));
        const line = rects.filter((q) => Math.abs(q.top - top) < 4);
        // Height from the heading's own layout box: its lines may be sliding in (split reveals).
        const size = parseFloat(getComputedStyle(el).fontSize) || 16;
        return { id, y: restY(el) + size * 0.12, left: Math.min(...line.map((q) => q.left)), right: Math.max(...line.map((q) => q.right)), thin: true };
      };
      const idleOf = (pose: string) => (pose === "sit" || pose === "perch" || pose === "wave" ? pose : undefined);

      const sceneOf = (a: (typeof anchors)[number], n: number): Waypoint[] => {
        const el = a.el;
        if (!el.getClientRects().length) return [];
        const sy = scrollY;
        const kind = el.dataset.robotScene;

        if (kind === "read") {
          const p = el.parentElement?.querySelector<HTMLElement>("p");
          if (!p) return [];
          const words = [...p.querySelectorAll<HTMLElement>(".k-word-scrub")];
          const sA = restY(p) - vh() * 0.82;
          const sB = restY(p) + p.offsetHeight - vh() * 0.5;
          const ledges = (words.length ? words : [p]).map((w, i) => {
            const r = w.getBoundingClientRect();
            return { w: { id: `w${i}`, y: restY(w) + r.height * 0.2, left: r.left, right: r.right, thin: true }, cx: r.left + r.width / 2, top: r.top, i };
          });
          // A staircase down the right side of the paragraph: it stands on the last word of each
          // line as that line finishes lighting up, one small hop per line (so the movement keeps
          // pace with the scroll). A short last line is skipped.
          const lines: (typeof ledges)[] = [];
          for (const l of ledges) {
            const line = lines[lines.length - 1];
            if (line && Math.abs(line[0].top - l.top) < 4) line.push(l);
            else lines.push([l]);
          }
          const pr = p.getBoundingClientRect();
          const picks = lines.map((line) => line[line.length - 1]).filter((l, j, all) => j < all.length - 1 || l.w.right > pr.left + pr.width * 0.6);
          const count = Math.max(1, ledges.length - 1);
          return picks.map((l, j) => ({
            x: l.cx,
            ledge: l.w,
            s: sA + Math.min(1, (l.i * 0.08 + 0.6) / (count * 0.08 + 1)) * (sB - sA),
            say: j === 0 ? a.say : undefined,
          }));
        }

        if (kind === "rows") {
          const list = el.nextElementSibling as HTMLElement | null;
          const rows = list ? [...list.querySelectorAll<HTMLElement>(".k-row")] : [];
          return rows.map((row, j) => {
            const price = row.querySelector<HTMLElement>(".k-row__price");
            const range = document.createRange();
            range.selectNodeContents(price ?? row);
            const pr = range.getBoundingClientRect();
            const rr = row.getBoundingClientRect();
            const y = restY(row);
            return {
              x: Math.max(rr.left + robotH * 0.4, pr.left - robotH * 0.55),
              ledge: { id: `row${j}`, y, left: rr.left, right: rr.right, thin: true },
              say: j === 0 ? a.say : undefined,
              point: price,
              s: y - vh() * 0.55,
            };
          });
        }

        if (el.dataset.robotGround === "glyph-last") {
          const t = el.parentElement?.querySelector<HTMLElement>("[data-heat-text]");
          const g = t && wordGeometry(t);
          if (!g) return [];
          const last = g.chars[g.chars.length - 1];
          return [{ x: last.left + (last.right - last.left) * 0.3, ledge: { id: `glyph${n}`, y: g.top + sy, left: last.left, right: last.right }, idle: idleOf(a.pose) ?? "perch", say: a.say }];
        }

        const r = el.getBoundingClientRect();
        const parent = el.offsetParent as HTMLElement | null;
        const spanEl = el.dataset.robotSpan === "next" ? (el.nextElementSibling as HTMLElement | null) : parent;
        const span = spanEl?.getBoundingClientRect() ?? r;
        const thin = el.hasAttribute("data-robot-thin");
        const isBlock = !thin && parent?.matches(".k-project__screen, .k-about__photo");
        const ledge: Ledge = isBlock && parent ? blockLedge(parent, `a${n}`) : { id: `a${n}`, y: restY(el), left: Math.min(span.left, r.left), right: Math.max(span.right, r.left), thin };
        const x = clamp(r.left, ledge.left + robotH * 0.3, ledge.right - robotH * 0.3);
        const here: Waypoint = { x, ledge, idle: idleOf(a.pose), say: a.say };
        if (kind === "surf") {
          const toRight = x < (ledge.left + ledge.right) / 2 + 4;
          return [here, { x: toRight ? ledge.right - robotH * 0.45 : ledge.left + robotH * 0.45, ledge, move: "surf" }];
        }
        return [here];
      };
      // A timeline: the line above the process steps (or a case study's facts), walked as each
      // step lights up. Stacked (phones): it hops down the steps instead.
      const timelineOf = (list: HTMLElement, n: number): Waypoint[] => {
        const items = [...list.children].filter((c): c is HTMLElement => c instanceof HTMLElement && c.getClientRects().length > 0);
        if (!items.length) return [];
        const lr = list.getBoundingClientRect();
        const top = restY(list);
        const sA = top - vh() * 0.85;
        const sB = top + list.offsetHeight - vh() * 0.6;
        const tops = items.map((c) => restY(c));
        const stacked = Math.max(...tops) - Math.min(...tops) > 8;
        return items.map((c, j) => {
          const cr = c.getBoundingClientRect();
          return {
            x: Math.max(cr.left + robotH * 0.4, cr.right - robotH * 0.45),
            ledge: stacked ? { id: `tl${n}-${j}`, y: tops[j], left: cr.left, right: cr.right, thin: true } : { id: `tl${n}`, y: top, left: lr.left, right: lr.right, thin: true },
            // Only the process steps light up with the scroll; keep pace with them there.
            s: list.matches(".k-steps") ? sA + ((0.35 * j + 1) / (0.35 * (items.length - 1) + 1)) * (sB - sA) : undefined,
          };
        });
      };
      // Everything else it can stand on or climb, read from the page.
      const pageLedges = (): Ledge[] => {
        const out: Ledge[] = [];
        // Sticky or fixed things move with the scroll: never stand on them.
        const pinned = (el: Element) => {
          for (let e: Element | null = el, i = 0; e && i < 8; e = e.parentElement, i++) {
            const p = getComputedStyle(e).position;
            if (p === "sticky" || p === "fixed") return true;
          }
          return false;
        };
        const skip = (el: Element) => el.closest(".k-guide, .g-header, .g-menu, header, nav, #loader, #curtain") || !el.getClientRects().length || pinned(el);
        document.querySelectorAll("h1, h2, h3").forEach((el, i) => {
          if (skip(el) || el.querySelector("[data-heat-text]")) return;
          const l = textLedge(el, `h${i}`);
          if (l && l.right - l.left > 40) out.push(l);
        });
        document.querySelectorAll(".k-project__screen, .k-about__photo, main img, .ag img, main video").forEach((el, i) => {
          if (skip(el) || (el.tagName === "IMG" && el.closest(".k-project__screen, .k-about__photo"))) return;
          const r = el.getBoundingClientRect();
          if (r.width >= 160 && r.height >= 100) out.push(blockLedge(el, `b${i}`));
        });
        steppers.forEach((el, i) => {
          if (skip(el)) return;
          const r = el.getBoundingClientRect();
          if (r.width < innerWidth * 0.3) return;
          const st = getComputedStyle(el);
          const y = restY(el);
          if (parseFloat(st.borderTopWidth) >= 1) out.push({ id: `t${i}`, y, left: r.left, right: r.right, thin: true });
          if (parseFloat(st.borderBottomWidth) >= 1) out.push({ id: `u${i}`, y: y + r.height, left: r.left, right: r.right, thin: true });
        });
        return out;
      };
      const bandNow = (): Band => ({
        top: Math.max(vh() * 0.2, robotH * 1.15 + 72), // its head stays clear of the header
        bottom: vh() - Math.max(24, vh() * 0.06),
        aim: vh() * 0.58,
      });

      let route: Route = { legs: [], says: [], marks: [] };
      let routeSig = "";
      let blendX = 0;
      let blendY = 0;
      let openKey = "";
      let openFn: (x: number) => number = () => 1;
      const refreshRoute = () => {
        const band = bandNow();
        let w: Word | null = null;
        const g = word && word.getClientRects().length ? wordGeometry(word) : null;
        if (g) {
          const sy = scrollY;
          const key = `${Math.round(g.left)},${Math.round(g.right)},${Math.round(g.size)},${robotH}`;
          if (key !== openKey) {
            openKey = key;
            openFn = wordOpenness(g, robotH * 0.85);
          }
          const perchX = g.left + (g.right - g.left) * 0.055;
          w = { top: g.top + sy, baseline: g.baseline + sy, left: g.left, right: g.right, perchX, open: openFn };
        }
        const points: Waypoint[] = [];
        // Timelines first: a stop on the same line (a case study's "it's live") comes after the walk.
        timelines.forEach((list, n) => points.push(...timelineOf(list, n)));
        anchors.forEach((a, n) => points.push(...sceneOf(a, n)));
        const ledges = pageLedges();
        // Rule 4: never on text. Where its body would cover a line of text (a label above a
        // title, the line before a row), it does not stand: surfaces shrink to their clear part
        // and stops slide to the nearest clear spot. The line it stands on (below its feet) and
        // the wordmark it weaves behind do not count.
        const bodyH = robotH * 0.76;
        const half = robotH * 0.3 + 4;
        const lines: { l: number; r: number; t: number; b: number }[] = [];
        for (const el of texts) {
          if (!el.getClientRects().length) continue;
          textRange.selectNodeContents(el);
          for (const q of textRange.getClientRects()) if (q.width > 2 && q.height > 2) lines.push({ l: q.left, r: q.right, t: q.top + scrollY, b: q.bottom + scrollY });
        }
        const freeOn = (l: Ledge): [number, number][] => {
          const blocks = lines
            .filter((q) => (q.t + q.b) / 2 < l.y - 2 && q.b > l.y - bodyH && q.r > l.left - half && q.l < l.right + half)
            .map((q) => [q.l - half, q.r + half] as [number, number])
            .sort((a, b) => a[0] - b[0]);
          const out: [number, number][] = [];
          let from = l.left;
          for (const [a, b] of blocks) {
            if (a > from) out.push([from, Math.min(a, l.right)]);
            from = Math.max(from, b);
            if (from >= l.right) break;
          }
          if (from < l.right) out.push([from, l.right]);
          return out.filter(([a, b]) => b - a >= 4);
        };
        for (let i = ledges.length - 1; i >= 0; i--) {
          const l = ledges[i];
          if (!l.thin) continue; // screens and photos keep their walls for climbing
          const fr = freeOn(l);
          if (!fr.length || fr.every(([a, b]) => b - a < robotH * 0.5)) {
            ledges.splice(i, 1);
            continue;
          }
          const widest = fr.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a));
          if (widest[0] > l.left || widest[1] < l.right) ledges[i] = { ...l, left: widest[0], right: widest[1] };
        }
        for (const p of points) {
          // Timeline stops keep their spacing: sliding them could stack them on one spot, and
          // then it would stand still while the steps light up (rule 2 wins).
          if (p.ledge.id.startsWith("tl")) continue;
          const fr = freeOn(p.ledge);
          if (!fr.length || fr.some(([a, b]) => p.x >= a && p.x <= b)) continue;
          let best = p.x;
          let d = Infinity;
          for (const [a, b] of fr) {
            const x = clamp(p.x, a, b);
            if (Math.abs(x - p.x) < d) {
              d = Math.abs(x - p.x);
              best = x;
            }
          }
          p.x = best;
        }
        points.forEach((p, i) => ((p as Waypoint & { i?: number }).i = i));
        points.sort((p, q) => p.ledge.y - q.ledge.y || ((p as Waypoint & { i: number }).i - (q as Waypoint & { i: number }).i));
        if (!w) {
          // No wordmark: start sitting on the first title that is on screen at the top of the page.
          const startLedge = [...ledges].sort((p, q) => p.y - q.y).find((l) => l.y >= band.top - 40 && l.y <= band.bottom && l.id.startsWith("h"));
          if (startLedge && (!points.length || points[0].ledge.y > startLedge.y))
            points.unshift({ x: startLedge.left + Math.min(robotH * 0.6, (startLedge.right - startLedge.left) / 2), ledge: startLedge, idle: "sit" });
        }
        // The end: the lowest thing on the page; and if even that would be above the visitor's
        // screen at the very bottom, the bottom of the page itself (a floor), so it is always in view.
        const docH = document.documentElement.scrollHeight;
        const bottomScroll = Math.max(0, docH - innerHeight);
        const floor: Ledge = { id: "floor", y: bottomScroll + band.bottom - 8, left: 24, right: innerWidth - 24, thin: true };
        ledges.push(floor);
        const lowest = ledges.filter((l) => l !== floor).sort((p, q) => q.y - p.y)[0];
        let last = points[points.length - 1];
        if (lowest && (!last || lowest.y > last.ledge.y + vh() * 0.1)) {
          points.push({ x: clamp(lowest.left + (lowest.right - lowest.left) * 0.8, lowest.left + 20, lowest.right - 20), ledge: lowest, idle: "wave" });
          last = points[points.length - 1];
        }
        if (!last || last.ledge.y - bottomScroll < band.top) points.push({ x: clamp(last ? last.x : innerWidth * 0.7, 40, innerWidth - 40), ledge: floor, idle: "wave" });
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
        const sig =
          `${innerWidth}x${innerHeight}|${robotH}|${Math.round(maxScroll)}|${w ? Math.round(w.baseline) : 0}|` +
          points.map((p) => `${Math.round(p.x / 4)},${Math.round(p.ledge.y / 4)},${Math.round((p.s ?? -1) / 4)}`).join(";") +
          "|" +
          ledges.map((l) => `${Math.round(l.y / 4)},${Math.round(l.left / 4)}`).join(";");
        if (sig === routeSig) return;
        routeSig = sig;
        const before = route.legs.length ? sampleRoute(route, scrollY, innerHeight) : null;
        route = buildRoute(points, ledges, w, { vh: innerHeight, robotW: robotH * 0.55, maxScroll, band });
        const after = before ? sampleRoute(route, scrollY, innerHeight) : null;
        if (before && after) {
          blendX += before.x - after.x;
          blendY += before.y - after.y;
        }
        // ?guide-debug in the URL exposes the computed path (for tuning, never on by default).
        if (location.search.includes("guide-debug"))
          (window as unknown as { __guide?: unknown }).__guide = {
            band,
            points: points.map((p) => ({ x: Math.round(p.x), y: Math.round(p.ledge.y), id: p.ledge.id, s: p.s === undefined ? null : Math.round(p.s) })),
            legs: route.legs.map((l) => {
              const m = l.at(0.5);
              return [Math.round(l.s0), Math.round(l.s1), m.pose, Math.round(m.x), Math.round(m.y)];
            }),
          };
      };
      const routeAt = (scroll: number): Sample => {
        if (frame % 30 === 0 || !route.legs.length) refreshRoute();
        const s = sampleRoute(route, scroll, innerHeight);
        // Its whole body stays inside the window sideways too (a wall at the window's edge is
        // climbed on its front edge instead of outside it).
        if (s) {
          const half = robotH * 0.34;
          const viewW = document.documentElement.clientWidth || innerWidth;
          s.x = clamp(s.x, half + 6, viewW - half - 6);
        }
        if (s && (blendX || blendY)) {
          s.x += blendX;
          s.y += blendY;
          const fade = Math.pow(0.86, gsap.ticker.deltaRatio());
          blendX = Math.abs(blendX) < 0.5 ? 0 : blendX * fade;
          blendY = Math.abs(blendY) < 0.5 ? 0 : blendY * fade;
        }
        // No path (mid page change): the guide steps out of view.
        return s ?? { x: screen.x, y: screen.y + scroll, pose: "stand", side: 0, behind: false, peek: 0, say: "", sayId: 0, point: null, idle: "", none: true };
      };

      // ── What the visitor points at ───────────────────────────────
      let react: { text: string; el: HTMLElement } | null = null;
      let reactTimer = 0;
      const onOver = (e: Event) => {
        const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-robot-react]");
        if (!el) return;
        window.clearTimeout(reactTimer);
        react = { text: el.dataset.robotReact || "", el };
      };
      const onOut = (e: Event) => {
        const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-robot-react]");
        if (!el) return;
        window.clearTimeout(reactTimer);
        reactTimer = window.setTimeout(() => {
          if (react?.el === el) react = null;
        }, 500);
      };
      if (!isTouch()) {
        document.addEventListener("pointerover", onOver);
        document.addEventListener("pointerout", onOut);
      }
      document.addEventListener("focusin", onOver);
      document.addEventListener("focusout", onOut);

      const pointer = { x: innerWidth / 2, y: innerHeight / 2, active: false };
      const onMove = (e: PointerEvent) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
      };
      addEventListener("pointermove", onMove, { passive: true });

      // ── Life ─────────────────────────────────────────────────────
      const screen = { x: -999, y: -999 };
      let walkPhase = 0;
      let face = 0;
      let nextBlink = 1.5;
      let blink = 0;
      let wave = 0;
      let point = 0;
      let happy = 0;
      let sit = reduce ? 0 : 1; // reduced motion: drawn standing, never animated
      let travel = 0;
      let restFor = 0;
      let lastSpot = -2;
      let shownGuide = false;
      let isBehind = false;
      let jump = 0;
      let surf = 0;
      let climb = 0;
      let prevPageX = 0;
      let prevPageY = -1e9;
      let peek = 0;
      let loadedAt = -1;
      let frame = 0;
      let shown = "";
      let side = "right";
      let low = false;
      let quiet = "";
      const sayFor = isTouch() ? 4 : 6; // seconds a spot's line stays up
      const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
      // Ink outline on the indigo field; an indigo outline on the night grounds, where ink vanishes.
      const inkOnField = new THREE.Color(0x0c0b10);
      const inkOnNight = new THREE.Color(0x2133f0);
      let inkGoal = inkOnField;
      const groundAt = (x: number, y: number) => {
        for (const el of document.elementsFromPoint(x, y)) {
          const g = el.closest<HTMLElement>("[data-ground]");
          if (g) return g.dataset.ground;
        }
        return "field";
      };

      // The bubble goes beside the head (right or left) or above it, wherever it covers the
      // least text, so the guide never talks over what the visitor is reading.
      const textRange = document.createRange();
      type Box = { x: number; y: number; w: number; h: number };
      const overlap = (a: Box, b: Box) =>
        Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      // Returns false when every place would still cover text: then it says nothing.
      const placeBubble = () => {
        const bw = bubble.offsetWidth;
        const bh = bubble.offsetHeight;
        const ox = Math.round(screen.x - cw / 2);
        const oy = Math.round(screen.y - ch * FEET);
        const headY = ch * lerp(0.36, 0.5, sit);
        const sideY = headY - bh + 22;
        const beside = [
          { at: "right", x: cw * 0.76, y: sideY },
          { at: "left", x: cw * 0.24 - bw, y: sideY },
        ];
        if (side === "left") beside.reverse();
        const cands = [
          ...beside,
          { at: "above", x: cw / 2 - bw / 2, y: ch * lerp(0.1, 0.24, sit) - bh - 14 },
          // Last resort: hanging below the feet, like a sign (over a screenshot, never over text).
          { at: "below", x: cw / 2 - bw / 2, y: ch * FEET + 14 },
        ].map((c) => ({
          ...c,
          x: Math.min(Math.max(ox + c.x, 8), innerWidth - 8 - bw),
          y: Math.min(Math.max(oy + c.y, 8), innerHeight - 8 - bh),
        }));
        const area = {
          x: Math.min(...cands.map((c) => c.x)),
          y: Math.min(...cands.map((c) => c.y)),
          w: 0,
          h: 0,
        };
        area.w = Math.max(...cands.map((c) => c.x + bw)) - area.x;
        area.h = Math.max(...cands.map((c) => c.y + bh)) - area.y;
        const lines: Box[] = [];
        for (const el of texts) {
          const r = el.getBoundingClientRect();
          if (!r.width || !overlap(area, { x: r.left, y: r.top, w: r.width, h: r.height })) continue;
          textRange.selectNodeContents(el);
          for (const l of textRange.getClientRects()) lines.push({ x: l.left, y: l.top, w: l.width, h: l.height });
        }
        const robot = { x: ox + cw * 0.27, y: oy + ch * 0.11, w: cw * 0.46, h: ch * 0.77 };
        let best = cands[0];
        let bestScore = Infinity;
        let bestText = 0;
        cands.forEach((c, i) => {
          const box = { x: c.x, y: c.y, w: bw, h: bh };
          let onText = 0;
          for (const l of lines) onText += overlap(box, l);
          const score = i * 300 + overlap(box, robot) * 3 + onText;
          if (score < bestScore) {
            bestScore = score;
            best = c;
            bestText = onText;
          }
        });
        const bx = best.x - ox;
        const by = best.y - oy;
        bubble.style.setProperty("--bx", `${Math.round(bx)}px`);
        bubble.style.setProperty("--by", `${Math.round(by)}px`);
        bubble.style.setProperty("--ty", `${Math.round(Math.min(Math.max(headY - by - 7, 10), bh - 24))}px`);
        bubble.style.setProperty("--tx", `${Math.round(Math.min(Math.max(cw / 2 - bx - 7, 12), bw - 26))}px`);
        bubble.dataset.tail = ({ right: "left", left: "right", above: "down", below: "up" } as Record<string, string>)[best.at];
        return bestText < bw * bh * 0.04;
      };

      const tick = (time: number) => {
        const r = gsap.ticker.deltaRatio();
        const k = (x: number) => 1 - Math.pow(1 - x, r);

        const goal = routeAt(scrollY);
        // First visit: arrive just after the loader, once the wordmark has condensed.
        if (loadedAt < 0 && document.documentElement.classList.contains("is-loaded")) loadedAt = time;
        const present = !goal.none && loadedAt >= 0 && (reduce || time - loadedAt > 0.9);
        if (present !== shownGuide) {
          shownGuide = present;
          wrap.classList.toggle("is-on", present);
          if (!present) setOpen(false);
        }
        const prevX = screen.x;
        const prevY = screen.y;
        screen.x = goal.x;
        screen.y = goal.y - scrollY;
        const first = prevX < -900;
        const dx = first ? 0 : screen.x - prevX;
        void prevY;
        // Movement along its path (page space): a climb moves it even when it holds still on screen.
        const moved = first || prevPageY < -1e8 ? 0 : Math.hypot(goal.x - prevPageX, goal.y - prevPageY);
        prevPageX = goal.x;
        prevPageY = goal.y;
        travel = lerp(travel, moved, k(0.3));
        const moving = travel > 0.15;
        const walking = moving && goal.pose === "walk";
        const idle = moving ? "" : goal.idle;
        // Behind the wordmark while it weaves through the letters (never with the shortcuts open).
        const behind = goal.behind && !openRef.current;
        if (behind !== isBehind) {
          isBehind = behind;
          wrap.classList.toggle("is-behind", behind);
        }
        restFor = moving ? 0 : restFor + r / 60;
        if (goal.sayId !== lastSpot) {
          // A new section: its line can be said (once), the next time the visitor stops.
          lastSpot = goal.sayId;
          quiet = "";
        }
        wrap.style.transform = `translate3d(${Math.round(screen.x - cw / 2)}px, ${Math.round(screen.y - ch * FEET)}px, 0)`;
        if (frame % 10 === 0) inkGoal = groundAt(screen.x, screen.y - robotH * 0.5) === "night" ? inkOnNight : inkOnField;
        const ink = outline.uniforms.uColor.value as InstanceType<typeof THREE.Color>;
        if (!ink.equals(inkGoal)) ink.lerp(inkGoal, k(0.15));

        // The bubble: a reaction to what the visitor points at wins over the spot's own line.
        const menuOpen = openRef.current;
        const reactBox = react ? react.el.getBoundingClientRect() : null;
        const reactVisible = Boolean(reactBox && reactBox.bottom > 0 && reactBox.top < innerHeight);
        // A spot's line is said once per visit, then the guide goes quiet so it never parks a
        // bubble over what the visitor is reading. Pointing at something always gets an answer.
        // (Once per section: moving on within the section does not repeat it.)
        if (goal.say && goal.say !== quiet && restFor > sayFor) quiet = goal.say;
        const spotLine = !moving && restFor > 0.35 && goal.say !== quiet ? goal.say : "";
        const line = menuOpen || behind ? "" : reactVisible && react ? react.text : spotLine;
        const wantSide = screen.x > innerWidth - 320 ? "left" : "right";
        if (wantSide !== side) {
          side = wantSide;
          wrap.classList.toggle("is-left", side === "left");
        }
        if (line !== shown) {
          shown = line;
          let clear = true;
          if (line) {
            bubble.textContent = line;
            clear = placeBubble();
          }
          bubble.classList.toggle("is-on", Boolean(line) && clear);
        } else if (line && !moving && frame % 30 === 0) bubble.classList.toggle("is-on", placeBubble());
        const wantLow = screen.y > innerHeight - 190;
        if (wantLow !== low) {
          low = wantLow;
          wrap.classList.toggle("is-low", low);
        }

        if (!reduce) {
          sit = lerp(sit, goal.pose === "sit" || idle === "sit" || idle === "perch" ? 1 : 0, k(0.12));
          climb = lerp(climb, goal.pose === "climb" ? 1 : 0, k(0.2));
          jump = lerp(jump, goal.pose === "jump" ? 1 : 0, k(0.25));
          surf = lerp(surf, goal.pose === "surf" ? 1 : 0, k(0.15));
          peek = lerp(peek, walking ? goal.peek : 0, k(0.15));
          const stride = Math.max(18, robotH * 0.33);
          walkPhase += (walking || (moving && goal.pose === "climb") ? moved / stride : 0) * Math.PI;
          const amp = walking ? Math.min(1, travel / 2) : 0;
          const swing = Math.sin(walkPhase) * 0.75 * amp;
          const dangle = Math.sin(time * 1.6) * 0.12 * sit;
          // Hops: knees tucked, arms up.
          // Surfing: knees bent, one foot forward.
          // Climbing: hand over hand, feet stepping down the wall.
          const reachStep = Math.sin(walkPhase) * 0.5 * Math.min(1, travel / 1.5);
          legs[0].rotation.x = lerp(lerp(lerp(lerp(swing, -1.45 + dangle, sit), -0.45, surf), -0.85, jump), -0.5 + reachStep, climb);
          legs[1].rotation.x = lerp(lerp(lerp(lerp(-swing, -1.45 - dangle, sit), 0.2, surf), -0.55, jump), -0.5 - reachStep, climb);
          body.position.y = lerp(Math.abs(Math.sin(walkPhase)) * 0.05 * amp, -HIP + 0.1, sit) + Math.sin(time * 2.1) * 0.01;

          // Pointing at what the visitor is looking at.
          // What the visitor points at wins; otherwise what this stop is about (a price).
          const stopBox = !moving && goal.point ? goal.point.getBoundingClientRect() : null;
          const box = reactVisible && reactBox ? reactBox : stopBox;
          const target = box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : null;
          point = lerp(point, target && !walking ? 1 : 0, k(0.12));
          const tx = target ? target.x - screen.x : 0;
          const ty = target ? target.y - (screen.y - robotH * 0.55) : 0;
          const len = Math.hypot(tx, ty) || 1;
          // Arm angle in the robot's plane: 0 hangs down, ±π/2 points sideways, ±π points up.
          const ang = Math.atan2(tx / len, ty / len);

          // Walk in profile; when resting, turn a little toward the target.
          // Between letters it turns to the visitor for a moment (a peek), then walks on.
          const facing =
            climb > 0.3
              ? goal.side * 1.45 // turned to the wall it climbs
              : (jump > 0.3 || surf > 0.3) && Math.abs(dx) > 0.2
              ? Math.sign(dx) * (surf > 0.3 ? 0.7 : 0.9)
              : walking && Math.abs(dx) > 0.2
                ? Math.sign(dx) * 1.25 * (1 - 0.8 * peek)
                : target
                  ? Math.sign(tx) * 0.35 * point
                  : 0;
          face = lerp(face, facing, k(0.12));
          root.rotation.y = face;
          // Surfing: lean into the scroll and wobble to keep balance.
          const lean = gsap.utils.clamp(-0.35, 0.35, -scrollState().velocity * 0.012) + Math.sin(time * 2.4) * 0.07;
          body.rotation.z = lerp(body.rotation.z, -dx * 0.01 + surf * lean, k(0.1));

          chest.scale.y = 1 + Math.sin(time * 2.1) * 0.016;
          bulb.scale.setScalar(1 + Math.sin(time * 3) * 0.15);

          // Head: toward the target, else the pointer; looks around while sitting.
          const lookX = target ? target.x : pointer.x;
          const lookY = target ? target.y : pointer.y;
          const hx = (lookX - screen.x) / innerWidth;
          const hy = (lookY - (screen.y - robotH * 0.8)) / innerHeight;
          const around = sit > 0.5 && !pointer.active ? Math.sin(time * 0.7) * 0.5 : 0;
          const yawGoal = walking ? -face * 0.5 * peek : gsap.utils.clamp(-0.7, 0.7, hx * 1.8) - face * 0.6 + around;
          head.rotation.y = lerp(head.rotation.y, yawGoal, k(0.1));
          head.rotation.x = lerp(head.rotation.x, gsap.utils.clamp(-0.35, 0.3, hy * 1.2), k(0.1));

          // Eyes: blink; squint into a smile when greeted or when the shortcuts are open.
          if (time > nextBlink) {
            blink = 1;
            nextBlink = time + 2.2 + Math.random() * 3;
          }
          blink = Math.max(0, blink - 0.12 * r);
          const near = pointer.active && !isTouch() && Math.hypot(pointer.x - screen.x, pointer.y - (screen.y - robotH * 0.5)) < robotH * 1.2;
          happy = lerp(happy, menuOpen || near ? 1 : 0, k(0.12));
          const lid = (1 - Math.sin(blink * Math.PI) * 0.92) * (1 - happy * 0.55);
          eyes.forEach((eye) => {
            eye.scale.y = lid;
            eye.position.y = -0.05 + happy * 0.02;
          });

          // Arms: swing when walking; wave on a greeting spot, when near, or with the shortcuts
          // open; otherwise the arm on the target's side points at it.
          const greet = idle === "wave" || idle === "perch" || near || menuOpen ? 1 : 0;
          wave = lerp(wave, greet && point < 0.5 ? 1 : 0, k(0.1));
          const [left, right] = arms;
          const pointRight = tx >= 0;
          const pr = pointRight ? point : 0;
          const pl = pointRight ? 0 : point;
          left.arm.rotation.x = swing * (1 - sit) * (1 - pl);
          left.arm.rotation.z = lerp(lerp(lerp(lerp(-0.1 - sit * 0.3, gsap.utils.clamp(-2.9, -0.2, ang), pl), -1.35, surf), -2.3, jump), -2.5 + Math.sin(walkPhase) * 0.45, climb);
          right.arm.rotation.x = -swing * (1 - wave) * (1 - sit) * (1 - pr);
          right.arm.rotation.z = lerp(lerp(lerp(lerp(lerp(0.1 + sit * 0.3, 2.5, wave), gsap.utils.clamp(0.2, 2.9, ang), pr), 1.35, surf), 2.3, jump), 2.5 + Math.sin(walkPhase) * 0.45, climb);
          right.fore.rotation.z = wave * Math.sin(time * 9) * 0.5;

          tail.rotation.x = lerp(tail.rotation.x, -0.25 - Math.min(1, Math.abs(dx) / 4) * 0.9, k(0.15));
          const pos = tailGeo.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const y = tailBase[i * 3 + 1];
            pos.setZ(i, tailBase[i * 3 + 2] + Math.sin(time * 9 + y * 14) * 0.03 * (-y / 0.42));
          }
          pos.needsUpdate = true;
        }

        const busy = reduce || moving || jump > 0.02 || surf > 0.02 || climb > 0.02 || wave > 0.02 || point > 0.02 || happy > 0.02 || blink > 0 || sit > 0.02;
        frame++;
        if (busy || frame % 2 === 0) renderer.render(scene, camera);
      };
      gsap.ticker.add(tick);
      // Visible once the first spot is measured (see the tick).

      cleanup = () => {
        gsap.ticker.remove(tick);
        offPage();
        window.clearTimeout(reactTimer);
        removeEventListener("resize", sizeCanvas);
        removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerover", onOver);
        document.removeEventListener("pointerout", onOut);
        document.removeEventListener("focusin", onOver);
        document.removeEventListener("focusout", onOut);
        scene.traverse((o: Object3D) => {
          if ((o as Mesh).isMesh) (o as Mesh).geometry.dispose();
        });
        materials.forEach((m) => m.dispose());
        steps.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  // On the home page the shortcuts glide to the section; elsewhere they are plain links that the
  // engine turns into a page transition landing on that section.
  const home = pathname === `/${lang}`;
  const section = (hash: string) => ({
    href: home ? hash : `/${lang}${hash}`,
    onClick: (e: ReactMouseEvent) => {
      setOpen(false);
      if (home) {
        e.preventDefault();
        scrollToTarget(hash);
      }
    },
  });

  return (
    <div ref={wrapRef} className="k-guide">
      <canvas ref={canvasRef} className="k-robot" aria-hidden="true" />
      <p ref={bubbleRef} className="k-guide__bubble" aria-hidden="true" />
      <button
        ref={buttonRef}
        type="button"
        className="k-guide__hit"
        aria-label={open ? t.closeLabel : t.menuLabel}
        aria-expanded={open}
        aria-controls="k-guide-menu"
        onClick={() => setOpen((v) => !v)}
      />
      <nav id="k-guide-menu" className="k-guide__menu" hidden={!open} aria-label={t.menuLabel}>
        <a href={whatsappUrl(dict.journey.whatsappMessage)} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" data-track-label="guide" onClick={() => setOpen(false)}>
          {t.menu.start} <span aria-hidden="true">↗</span>
        </a>
        <a {...section("#work")}>
          {t.menu.work} <span aria-hidden="true">→</span>
        </a>
        <a {...section("#offers")}>
          {t.menu.prices} <span aria-hidden="true">→</span>
        </a>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            scrollToTarget(0);
          }}
        >
          {t.menu.top} <span aria-hidden="true">↑</span>
        </button>
      </nav>
    </div>
  );
}
