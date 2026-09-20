import type * as THREE from "three";

export const JourneyPostShader = {
  name: "JourneyPostShader",
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uAberration: { value: 0 },
    uGrain: { value: 0.008 },
    uTime: { value: 0 },
    uVignette: { value: 0.3 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uAberration;
    uniform float uGrain;
    uniform float uTime;
    uniform float uVignette;

    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 centered = vUv - 0.5;
      float radial = dot(centered, centered);
      vec2 shift = centered * (0.0025 + uAberration * 0.02) * (0.4 + radial * 2.4);
      vec3 color = vec3(
        texture2D(tDiffuse, vUv + shift).r,
        texture2D(tDiffuse, vUv).g,
        texture2D(tDiffuse, vUv - shift).b
      );
      color *= 1.0 - smoothstep(0.12, 0.62, radial) * uVignette;
      color += (hash(vUv * 1400.0 + fract(uTime * 0.37) * 53.0) - 0.5) * uGrain;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};
