"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { onScroll, prefersReducedMotion } from "@/engine";

/**
 * Work screens bend like paper with scroll speed and spring back flat (DESIGN.md: shimmer and
 * bend). One fixed canvas draws every `[data-bend]` image as a subdivided plane placed over its
 * DOM box each frame; the <img> stays for search, accessibility and the no-GL fallback.
 */
const vertex = /* glsl */ `
  uniform float uBend;
  uniform float uReveal;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Bend in pixel (world) space: the middle of the sheet lags behind its edges, like paper
    // pulled through the air.
    vec4 world = modelMatrix * vec4(position, 1.0);
    world.y += sin(uv.x * 3.14159) * uBend;
    world.x += sin(uv.y * 3.14159) * uBend * 0.08;
    world.y += (1.0 - uReveal) * 80.0; // rises into place as it is revealed
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uMap;
  uniform float uBend;
  uniform float uReveal;
  varying vec2 vUv;
  void main() {
    // Revealed from the bottom edge up, like the screen rising into frame.
    if (vUv.y > uReveal * 1.02) discard;
    // A little colour split at speed, the heat again.
    float k = clamp(abs(uBend) / 2600.0, 0.0, 0.0035);
    vec3 c = vec3(texture2D(uMap, vUv + vec2(0.0, k)).r, texture2D(uMap, vUv).g, texture2D(uMap, vUv - vec2(0.0, k)).b);
    gl_FragColor = vec4(c, 1.0);
  }
`;

export default function BendScreens() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const holders = [...document.querySelectorAll<HTMLElement>("[data-bend]")];
      if (!holders.length) return;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1000, 1000);
      const geometry = new THREE.PlaneGeometry(1, 1, 24, 24);
      const loader = new THREE.TextureLoader();
      const bend = { value: 0 };

      const planes = await Promise.all(
        holders.map(async (holder) => {
          const img = holder.querySelector("img");
          if (!img) return null;
          if (!img.complete) await img.decode().catch(() => {});
          const texture = await loader.loadAsync(img.currentSrc || img.src);
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          const reveal = { value: 0 };
          const material = new THREE.ShaderMaterial({ uniforms: { uMap: { value: texture }, uBend: bend, uReveal: reveal }, vertexShader: vertex, fragmentShader: fragment, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
          return { holder, mesh, material, texture, reveal };
        }),
      );
      if (disposed) return;
      const live = planes.filter((p): p is NonNullable<typeof p> => p !== null);
      document.documentElement.classList.add("gl-bend");
      // Each screen rises in the first time it enters the frame.
      const rise = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const p = live.find((x) => x.holder === entry.target);
            if (p) gsap.to(p.reveal, { value: 1, duration: 1.5, ease: "expo.out" });
            rise.unobserve(entry.target);
          }
        },
        { threshold: 0.12 },
      );
      live.forEach((p) => rise.observe(p.holder));

      const size = () => {
        renderer.setSize(innerWidth, innerHeight, false);
        camera.right = innerWidth;
        camera.bottom = innerHeight;
        camera.updateProjectionMatrix();
      };
      size();
      addEventListener("resize", size);

      let target = 0;
      const off = onScroll(({ velocity }) => {
        target = gsap.utils.clamp(-90, 90, velocity * 3.2);
      });

      const tick = () => {
        const r = gsap.ticker.deltaRatio();
        target *= Math.pow(0.9, r); // velocity fades out when scrolling stops
        bend.value += (target - bend.value) * (1 - Math.pow(0.82, r));
        let any = false;
        for (const p of live) {
          const b = p.holder.getBoundingClientRect();
          const inView = b.bottom > -100 && b.top < innerHeight + 100;
          p.mesh.visible = inView;
          if (!inView) continue;
          any = true;
          // Pixel space, y down: the plane sits exactly over its DOM box.
          p.mesh.position.set(b.left + b.width / 2, b.top + b.height / 2, 0);
          p.mesh.scale.set(b.width, -b.height, 1);
        }
        if (any) renderer.render(scene, camera);
        else renderer.clear();
      };
      gsap.ticker.add(tick);

      cleanup = () => {
        gsap.ticker.remove(tick);
        rise.disconnect();
        off();
        removeEventListener("resize", size);
        document.documentElement.classList.remove("gl-bend");
        live.forEach((p) => {
          p.material.dispose();
          p.texture.dispose();
        });
        geometry.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} className="k-bend-canvas" aria-hidden="true" />;
}
