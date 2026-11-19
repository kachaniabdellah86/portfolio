"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { isTouch, onScroll, prefersReducedMotion } from "@/engine";

/**
 * The signature (DESIGN.md): the wordmark in the Agadir heat. The real <h1> text stays in the
 * DOM (search, screen readers, no-JS); a WebGL layer redraws the same word through a flowing
 * heat-haze displacement with a saffron fringe. It breathes at rest and swells where the pointer
 * moves (on touch: where the visitor taps or drags). Paused off screen, absent under reduced motion.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uText;
  uniform float uTime;
  uniform float uSwell;
  uniform float uIntro;
  uniform float uMelt;
  uniform vec2 uPointer;
  uniform float uAspect;
  uniform vec3 uInk;
  uniform vec3 uSaffron;
  uniform float uDetail; // 1: two noise layers (desktop), 0: one (phones)

  // Simplex 3D noise (Ashima Arts, MIT).
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec2 uv = vUv;
    // Heat rises: noise flows upward, stronger toward the bottom of the letters.
    float rise = smoothstep(1.0, 0.0, uv.y) * 0.6 + 0.4;
    float n = snoise(vec3(uv.x * 4.0, uv.y * 7.0 - uTime * 0.55, uTime * 0.18));
    float n2 = uDetail > 0.5 ? snoise(vec3(uv.x * 11.0 + 3.0, uv.y * 15.0 - uTime * 0.9, uTime * 0.3)) : n;
    vec2 p = vec2((uv.x - uPointer.x) * uAspect, uv.y - uPointer.y);
    float near = smoothstep(0.42, 0.0, length(p));
    float amount = (0.0026 + near * uSwell * 0.034 + uIntro * 0.06 + uMelt * 0.07) * rise;
    vec2 off = vec2(n * 0.6 + n2 * 0.4, n * 1.2 + n2 * 0.5) * amount;
    off.y -= uMelt * uMelt * 0.12 * (0.5 + n * 0.5); // the word rises with the heat as it leaves

    float a = texture2D(uText, uv + off).a;
    float fringe = texture2D(uText, uv + off * 2.4 + vec2(0.0, 0.004)).a;
    vec3 color = mix(uSaffron, uInk, a);
    float alpha = max(a, fringe * (0.55 + near * uSwell * 0.45)) * (1.0 - smoothstep(0.55, 1.0, uMelt));
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

/**
 * mode "hero": the opening shot. The word condenses out of the heat once the loader lifts, and
 * melts upward as the visitor scrolls away.
 * mode "finale": the closing shot. The word condenses out of the heat as it scrolls into view.
 */
export default function HeatWord({ children, mode = "hero", className = "" }: { children: ReactNode; mode?: "hero" | "finale"; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const word = root?.querySelector<HTMLElement>("[data-heat-text]");
    if (!root || !canvas || !word || prefersReducedMotion()) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const style = getComputedStyle(word);
      await document.fonts.load(`${style.fontWeight} 100px ${style.fontFamily}`).catch(() => {});
      await document.fonts.ready;
      const THREE = await import("three");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "high-performance" });
      renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
      // The haze is soft: 1.25x density is indistinguishable and saves a third of the shading.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      renderer.setPixelRatio(dpr);

      const textCanvas = document.createElement("canvas");
      const texture = new THREE.CanvasTexture(textCanvas);
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      const uniforms = {
        uText: { value: texture },
        uTime: { value: 0 },
        uSwell: { value: 0 },
        uIntro: { value: 1 },
        uMelt: { value: 0 },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uAspect: { value: 1 },
        uInk: { value: new THREE.Color("#f4efe6") },
        uSaffron: { value: new THREE.Color("#ff9e2c") },
        uDetail: { value: isTouch() ? 0 : 1 },
      };
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true });
      const scene = new THREE.Scene();
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
      const camera = new THREE.Camera();

      // Draw the word into the texture exactly where the DOM text sits inside the canvas box.
      const draw = () => {
        const box = canvas.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(word);
        const text = range.getBoundingClientRect();
        const w = Math.max(1, Math.round(box.width * dpr));
        const h = Math.max(1, Math.round(box.height * dpr));
        renderer.setSize(box.width, box.height, false);
        textCanvas.width = w;
        textCanvas.height = h;
        const ctx = textCanvas.getContext("2d")!;
        const s = getComputedStyle(word);
        const size = parseFloat(s.fontSize) * dpr;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#fff";
        ctx.font = `${s.fontWeight} ${size}px ${s.fontFamily}`;
        if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${parseFloat(s.letterSpacing || "0") * dpr}px`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        const label = word.textContent ?? "";
        const m = ctx.measureText(label.toUpperCase());
        const cx = (text.left + text.width / 2 - box.left) * dpr;
        const cy = (text.top + text.height / 2 - box.top) * dpr + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
        ctx.fillText(label.toUpperCase(), cx, cy);
        texture.needsUpdate = true;
        uniforms.uAspect.value = box.width / Math.max(1, box.height);
      };
      draw();
      root.classList.add("is-gl");

      const aim = new THREE.Vector2(0.5, 0.5);
      let energy = 0;
      const onMove = (e: PointerEvent) => {
        const box = canvas.getBoundingClientRect();
        const x = (e.clientX - box.left) / box.width;
        const y = 1 - (e.clientY - box.top) / box.height;
        energy = Math.min(1, energy + Math.hypot(x - aim.x, y - aim.y) * 6 + (isTouch() ? 0.6 : 0));
        aim.set(x, y);
      };
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("pointerdown", onMove, { passive: true });

      // Opening shot: condense out of the heat right as the loader lifts (not hidden under it).
      let intro: gsap.core.Tween | null = null;
      const startIntro = () => {
        intro = gsap.to(uniforms.uIntro, { value: 0, duration: 1.8, ease: "expo.out", delay: 0.15 });
      };
      const loaded = () => document.documentElement.classList.contains("is-loaded") || !document.getElementById("loader") || document.getElementById("loader")!.hidden;
      let waitLoader: MutationObserver | null = null;
      if (mode === "hero") {
        if (loaded()) startIntro();
        else {
          waitLoader = new MutationObserver(() => {
            if (!loaded()) return;
            waitLoader?.disconnect();
            startIntro();
          });
          waitLoader.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        }
      }
      // Scroll links the shot to the film: hero melts away, finale condenses in.
      const offScroll = onScroll(() => {
        const b = root.getBoundingClientRect();
        if (mode === "hero") {
          uniforms.uMelt.value = gsap.utils.clamp(0, 1, -b.top / (b.height * 1.6));
        } else {
          // 1 while below the fold, 0 once the word reaches the upper half of the screen.
          uniforms.uIntro.value = gsap.utils.clamp(0, 1, (b.top - innerHeight * 0.35) / (innerHeight * 0.55));
        }
      });
      if (mode === "finale") uniforms.uIntro.value = 1;

      let visible = true;
      const tick = (time: number) => {
        if (!visible) return;
        const r = gsap.ticker.deltaRatio();
        energy *= Math.pow(0.965, r);
        uniforms.uSwell.value += (energy - uniforms.uSwell.value) * (1 - Math.pow(0.9, r));
        uniforms.uPointer.value.lerp(aim, 1 - Math.pow(0.88, r));
        uniforms.uTime.value = time;
        renderer.render(scene, camera);
      };
      gsap.ticker.add(tick);
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(root);
      const ro = new ResizeObserver(() => draw());
      ro.observe(root);

      cleanup = () => {
        gsap.ticker.remove(tick);
        intro?.kill();
        waitLoader?.disconnect();
        offScroll();
        io.disconnect();
        ro.disconnect();
        removeEventListener("pointermove", onMove);
        removeEventListener("pointerdown", onMove);
        root.classList.remove("is-gl");
        material.dispose();
        texture.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [mode]);

  return (
    <div ref={rootRef} className={`k-word ${className}`}>
      {children}
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
