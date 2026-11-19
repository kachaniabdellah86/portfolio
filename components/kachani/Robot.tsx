"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import type { BufferGeometry, Material, Mesh, Object3D } from "three";
import { onPage, prefersReducedMotion, isTouch, scrollToTarget } from "@/engine";
import { whatsappUrl } from "@/lib/site";
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
      const offPage = onPage(() => {
        anchors = [...document.querySelectorAll<HTMLElement>("[data-robot-anchor]")].map((el) => ({
          el,
          pose: el.dataset.robotAnchor || "stand",
          say: el.dataset.robotSay || "",
        }));
        word = document.querySelector<HTMLElement>("[data-heat-text]");
        texts = [...document.querySelectorAll<HTMLElement>(".ag :is(p, h1, h2, h3, h4, li, dt, dd, label, summary, figcaption, blockquote, .g-btn, .g-link)")].filter(
          (el) => !el.querySelector("[data-heat-text]"),
        );
      });
      const measure = document.createElement("canvas").getContext("2d")!;
      const glyphTop = (el: HTMLElement) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        const st = getComputedStyle(el);
        measure.font = `${st.fontWeight} ${parseFloat(st.fontSize)}px ${st.fontFamily}`;
        const m = measure.measureText((el.textContent ?? "").toUpperCase());
        return { left: r.left, width: r.width, top: r.top + r.height / 2 - (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 2 };
      };
      type Key = { s: number; x: number; y: number; pose: string; say: string; spot: number };
      const keys = (): Key[] => {
        const line = innerHeight * 0.62;
        const dwell = innerHeight * 0.16;
        const spots: { x: number; y: number; pose: string; say: string }[] = [];
        if (word && word.getClientRects().length) {
          const g = glyphTop(word);
          if (g.width) spots.push({ x: g.left + g.width * 0.055, y: g.top + scrollY + 2, pose: "sit", say: helloRef.current });
        }
        for (const a of anchors) {
          if (!a.el.getClientRects().length) continue;
          const r = a.el.getBoundingClientRect();
          spots.push({ x: r.left, y: r.top + scrollY, pose: a.pose, say: a.say });
        }
        spots.sort((p, q) => p.y - q.y);
        const out: Key[] = [];
        let last = -Infinity;
        spots.forEach((p, i) => {
          const arrive = Math.max(0, p.y - line, last + 1);
          out.push({ s: arrive, ...p, spot: i });
          last = arrive + (i === 0 && p.pose === "sit" ? dwell * 0.6 : dwell);
          out.push({ s: last, ...p, spot: i });
        });
        return out;
      };
      const routeAt = (scroll: number) => {
        const k = keys();
        // No spots (mid page change, or a page without any): the guide steps out of view.
        if (!k.length) return { x: screen.x, y: screen.y + scroll, pose: "stand", say: "", resting: true, spot: -1, none: true };
        if (scroll <= k[0].s) return { ...k[0], resting: true };
        const end = k[k.length - 1];
        if (scroll >= end.s) return { ...end, resting: true };
        let j = 0;
        while (j < k.length - 2 && scroll >= k[j + 1].s) j++;
        const a = k[j];
        const b = k[j + 1];
        const f = (scroll - a.s) / Math.max(1, b.s - a.s);
        const resting = a.spot === b.spot;
        return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, pose: resting ? a.pose : "walk", say: resting ? a.say : "", resting, spot: resting ? a.spot : -1 };
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
        cands.forEach((c, i) => {
          const box = { x: c.x, y: c.y, w: bw, h: bh };
          let score = i * 300 + overlap(box, robot) * 3;
          for (const l of lines) score += overlap(box, l);
          if (score < bestScore) {
            bestScore = score;
            best = c;
          }
        });
        const bx = best.x - ox;
        const by = best.y - oy;
        bubble.style.setProperty("--bx", `${Math.round(bx)}px`);
        bubble.style.setProperty("--by", `${Math.round(by)}px`);
        bubble.style.setProperty("--ty", `${Math.round(Math.min(Math.max(headY - by - 7, 10), bh - 24))}px`);
        bubble.style.setProperty("--tx", `${Math.round(Math.min(Math.max(cw / 2 - bx - 7, 12), bw - 26))}px`);
        bubble.dataset.tail = ({ right: "left", left: "right", above: "down", below: "up" } as Record<string, string>)[best.at];
      };

      const tick = (time: number) => {
        const r = gsap.ticker.deltaRatio();
        const k = (x: number) => 1 - Math.pow(1 - x, r);

        const goal: ReturnType<typeof routeAt> & { none?: boolean } = routeAt(scrollY);
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
        const dy = first ? 0 : screen.y - prevY;
        const moved = Math.hypot(dx, goal.resting ? 0 : dy * 0.35);
        travel = lerp(travel, moved, k(0.3));
        const walking = !goal.resting && travel > 0.15;
        restFor = walking ? 0 : restFor + r / 60;
        if (goal.spot !== lastSpot) {
          // A new spot (or a jump straight to one) starts its own line, even without a walk.
          lastSpot = goal.spot;
          restFor = 0;
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
        if (walking) quiet = "";
        else if (goal.say && goal.say !== quiet && restFor > sayFor) quiet = goal.say;
        const spotLine = !walking && restFor > 0.35 && goal.say !== quiet ? goal.say : "";
        const line = menuOpen ? "" : reactVisible && react ? react.text : spotLine;
        const wantSide = screen.x > innerWidth - 320 ? "left" : "right";
        if (wantSide !== side) {
          side = wantSide;
          wrap.classList.toggle("is-left", side === "left");
        }
        if (line !== shown) {
          shown = line;
          if (line) {
            bubble.textContent = line;
            placeBubble();
          }
          bubble.classList.toggle("is-on", Boolean(line));
        } else if (line && !walking && frame % 30 === 0) placeBubble();
        const wantLow = screen.y > innerHeight - 190;
        if (wantLow !== low) {
          low = wantLow;
          wrap.classList.toggle("is-low", low);
        }

        if (!reduce) {
          sit = lerp(sit, goal.pose === "sit" ? 1 : 0, k(0.12));
          const stride = Math.max(18, robotH * 0.33);
          walkPhase += (walking ? moved / stride : 0) * Math.PI;
          const amp = walking ? Math.min(1, travel / 2) : 0;
          const swing = Math.sin(walkPhase) * 0.75 * amp;
          const dangle = Math.sin(time * 1.6) * 0.12 * sit;
          legs[0].rotation.x = lerp(swing, -1.45 + dangle, sit);
          legs[1].rotation.x = lerp(-swing, -1.45 - dangle, sit);
          body.position.y = lerp(Math.abs(Math.sin(walkPhase)) * 0.05 * amp, -HIP + 0.1, sit) + Math.sin(time * 2.1) * 0.01;

          // Pointing at what the visitor is looking at.
          const target = reactVisible && reactBox ? { x: reactBox.left + reactBox.width / 2, y: reactBox.top + reactBox.height / 2 } : null;
          point = lerp(point, target && !walking ? 1 : 0, k(0.12));
          const tx = target ? target.x - screen.x : 0;
          const ty = target ? target.y - (screen.y - robotH * 0.55) : 0;
          const len = Math.hypot(tx, ty) || 1;
          // Arm angle in the robot's plane: 0 hangs down, ±π/2 points sideways, ±π points up.
          const ang = Math.atan2(tx / len, ty / len);

          // Walk in profile; when resting, turn a little toward the target.
          const facing = walking && Math.abs(dx) > 0.2 ? Math.sign(dx) * 1.25 : target ? Math.sign(tx) * 0.35 * point : 0;
          face = lerp(face, facing, k(0.12));
          root.rotation.y = face;
          body.rotation.z = lerp(body.rotation.z, -dx * 0.01, k(0.1));

          chest.scale.y = 1 + Math.sin(time * 2.1) * 0.016;
          bulb.scale.setScalar(1 + Math.sin(time * 3) * 0.15);

          // Head: toward the target, else the pointer; looks around while sitting.
          const lookX = target ? target.x : pointer.x;
          const lookY = target ? target.y : pointer.y;
          const hx = (lookX - screen.x) / innerWidth;
          const hy = (lookY - (screen.y - robotH * 0.8)) / innerHeight;
          const around = sit > 0.5 && !pointer.active ? Math.sin(time * 0.7) * 0.5 : 0;
          const yawGoal = walking ? 0 : gsap.utils.clamp(-0.7, 0.7, hx * 1.8) - face * 0.6 + around;
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
          const greet = (goal.pose === "wave" && !walking) || near || menuOpen ? 1 : 0;
          wave = lerp(wave, greet && point < 0.5 ? 1 : 0, k(0.1));
          const [left, right] = arms;
          const pointRight = tx >= 0;
          const pr = pointRight ? point : 0;
          const pl = pointRight ? 0 : point;
          left.arm.rotation.x = swing * (1 - sit) * (1 - pl);
          left.arm.rotation.z = lerp(-0.1 - sit * 0.3, gsap.utils.clamp(-2.9, -0.2, ang), pl);
          right.arm.rotation.x = -swing * (1 - wave) * (1 - sit) * (1 - pr);
          right.arm.rotation.z = lerp(lerp(0.1 + sit * 0.3, 2.5, wave), gsap.utils.clamp(0.2, 2.9, ang), pr);
          right.fore.rotation.z = wave * Math.sin(time * 9) * 0.5;

          tail.rotation.x = lerp(tail.rotation.x, -0.25 - Math.min(1, Math.abs(dx) / 4) * 0.9, k(0.15));
          const pos = tailGeo.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const y = tailBase[i * 3 + 1];
            pos.setZ(i, tailBase[i * 3 + 2] + Math.sin(time * 9 + y * 14) * 0.03 * (-y / 0.42));
          }
          pos.needsUpdate = true;
        }

        const busy = reduce || walking || wave > 0.02 || point > 0.02 || happy > 0.02 || blink > 0 || sit > 0.02;
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
