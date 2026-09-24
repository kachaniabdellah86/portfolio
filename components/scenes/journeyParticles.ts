import * as THREE from "three";

export type JourneyParticleFrame = {
  aspect: number;
  colorA: THREE.Color;
  colorB: THREE.Color;
  energy: number;
  phase: number;
  pixelRatio: number;
  pointerStrength: number;
  pointerX: number;
  pointerY: number;
  scatter: number;
  time: number;
};

type ShapeWriter = (
  index: number,
  count: number,
  random: () => number,
  target: THREE.Vector3,
) => void;

const scratchEuler = new THREE.Euler();

const writeSpark: ShapeWriter = (_index, _count, random, target) => {
  const core = random() < 0.4;
  const radius = core ? Math.pow(random(), 1.6) * 0.7 : 2.3 + random() * 0.9;
  const y = random() * 2 - 1;
  const ring = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = random() * Math.PI * 2;
  target.set(
    Math.cos(theta) * ring * radius,
    y * radius,
    Math.sin(theta) * ring * radius,
  );
};

const writeLattice: ShapeWriter = (_index, _count, random, target) => {
  const cells = 6;
  const size = 5.4;
  const freeAxis = Math.floor(random() * 3);
  const coords = [0, 0, 0];
  for (let axis = 0; axis < 3; axis += 1) {
    coords[axis] =
      axis === freeAxis
        ? (random() - 0.5) * size
        : (Math.floor(random() * cells) / (cells - 1) - 0.5) * size;
  }
  target.set(coords[0], coords[1] * 0.72, coords[2] * 0.62);
};

const writeCard: ShapeWriter = (_index, _count, random, target) => {
  if (random() < 0.6) {
    // Card outline: a rounded rectangle traced just outside the titanium card.
    const width = 3.7;
    const height = 2.4;
    const perimeter = 2 * (width + height);
    let along = random() * perimeter;
    let x = -width / 2;
    let y = -height / 2;
    if (along < width) {
      x += along;
    } else if ((along -= width) < height) {
      x = width / 2;
      y += along;
    } else if ((along -= height) < width) {
      x = width / 2 - along;
      y = height / 2;
    } else {
      y = height / 2 - (along - width);
    }
    target.set(
      x + (random() - 0.5) * 0.12,
      y + (random() - 0.5) * 0.12,
      (random() - 0.5) * 0.2,
    );
    scratchEuler.set(-0.18, -0.42, 0.08);
    target.applyEuler(scratchEuler);
    return;
  }
  const angle = random() * Math.PI * 2;
  const radius = 2.3 + (random() - 0.5) * 0.14;
  target.set(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
    (random() - 0.5) * 0.14,
  );
  scratchEuler.set(1.35, 0.1, 0.3);
  target.applyEuler(scratchEuler);
};

const writeBridge: ShapeWriter = (_index, _count, random, target) => {
  const pick = random();
  if (pick < 0.5) {
    // The Morocco-to-China route: an arc rising from the star to the gate.
    const x = -3.4 + random() * 6.5;
    const y = 1.35 - ((x + 0.15) / 3.3) ** 2 * 2.4 + (random() - 0.5) * 0.25;
    target.set(x + (random() - 0.5) * 0.1, y, 0.4 + (random() - 0.5) * 0.4);
    return;
  }
  if (pick < 0.8) {
    // Paifang gate silhouette: two pillars and two beams.
    if (random() < 0.5) {
      target.set(random() < 0.5 ? -0.9 : 0.9, -1.3 + random() * 2.6, 0);
    } else {
      target.set(
        (random() - 0.5) * 2.6,
        1.15 + (random() < 0.5 ? 0 : 0.8) + (random() - 0.5) * 0.1,
        0,
      );
    }
    target.multiplyScalar(0.85);
    scratchEuler.set(0, -0.25, 0);
    target.applyEuler(scratchEuler);
    target.x += 3.1;
    target.y += 0.7;
    target.z += 0.1;
    return;
  }
  // Eight-point star for home.
  const angle = random() * Math.PI * 2;
  const radius = (0.55 + 0.35 * Math.abs(Math.cos(angle * 4))) * (0.92 + random() * 0.16);
  target.set(
    -3.4 + Math.cos(angle) * radius,
    -1.1 + Math.sin(angle) * radius,
    0.2 + (random() - 0.5) * 0.1,
  );
};

const writeHalo: ShapeWriter = (index, _count, random, target) => {
  const arm = index % 3;
  const radius = 0.5 + Math.pow(random(), 0.65) * 3.8;
  const angle =
    arm * ((Math.PI * 2) / 3) +
    radius * 0.65 +
    (random() - 0.5) * (0.35 + radius * 0.1);
  target.set(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
    (random() + random() - 1) * 0.45,
  );
};

const SHAPES = [writeSpark, writeLattice, writeCard, writeBridge, writeHalo];
const SHAPE_OPACITY = [0.34, 0.5, 0.56, 0.5, 0.62];

const vertexShader = /* glsl */ `
  attribute vec3 aShape1;
  attribute vec3 aShape2;
  attribute vec3 aShape3;
  attribute vec3 aShape4;
  attribute float aSeed;

  uniform float uPhase;
  uniform float uScatter;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uMaxSize;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform float uPointerStrength;

  varying float vAlpha;
  varying float vSeed;

  float ease(float t) {
    return t * t * (3.0 - 2.0 * t);
  }

  void main() {
    vec3 shape = position;
    shape = mix(shape, aShape1, ease(clamp(uPhase, 0.0, 1.0)));
    shape = mix(shape, aShape2, ease(clamp(uPhase - 1.0, 0.0, 1.0)));
    shape = mix(shape, aShape3, ease(clamp(uPhase - 2.0, 0.0, 1.0)));
    shape = mix(shape, aShape4, ease(clamp(uPhase - 3.0, 0.0, 1.0)));

    float t = uTime * 0.4 + aSeed * 6.2831853;
    vec3 drift = vec3(
      sin(t * 1.1 + shape.y * 0.9),
      cos(t * 0.8 + shape.x * 0.7),
      sin(t * 1.3 + shape.z * 0.8)
    );
    shape += drift * (0.05 + uScatter * 0.7 + uEnergy * 0.08);
    shape += normalize(shape + vec3(0.0001, 0.0002, 0.0)) * uScatter * (0.8 + aSeed * 2.2);

    vec4 viewPosition = modelViewMatrix * vec4(shape, 1.0);
    vec4 clip = projectionMatrix * viewPosition;
    vec2 ndc = clip.xy / clip.w;
    vec2 toPointer = ndc - uPointer;
    float pointerDistance = length(toPointer * vec2(uAspect, 1.0));
    float push = (1.0 - smoothstep(0.0, 0.5, pointerDistance)) * uPointerStrength;
    ndc += normalize(toPointer + vec2(0.0001)) * push * 0.14 * (0.5 + aSeed);
    clip.xy = ndc * clip.w;
    gl_Position = clip;

    float distance = max(1.0, -viewPosition.z);
    float size = uSize * uPixelRatio * (0.55 + aSeed * 0.95) * (1.0 + uEnergy * 0.9 + uScatter * 0.4);
    gl_PointSize = clamp(size * (14.0 / distance), 0.0, uMaxSize);

    vAlpha = (0.3 + aSeed * 0.7) * (1.0 - uScatter * 0.3) * (1.0 - smoothstep(6.0, 60.0, distance));
    vSeed = aSeed;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.32, r);
    float glow = pow(max(0.0, 1.0 - r * 2.0), 2.4);
    vec3 color = mix(uColorA, uColorB, vSeed * 0.85);
    float alpha = (core * 0.8 + glow * 0.4) * vAlpha * uOpacity;
    gl_FragColor = vec4(color * (0.55 + core * 0.9), alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createJourneyParticles(isCompact: boolean, random: () => number) {
  // Additive points are pure overdraw: phones get fewer, smaller ones.
  const count = isCompact ? 1100 : 5200;
  const opacityBoost = isCompact ? 1.35 : 1;
  const geometry = new THREE.BufferGeometry();
  const target = new THREE.Vector3();

  SHAPES.forEach((writeShape, shapeIndex) => {
    const array = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      writeShape(index, count, random, target);
      array[index * 3] = target.x;
      array[index * 3 + 1] = target.y;
      array[index * 3 + 2] = target.z;
    }
    geometry.setAttribute(
      shapeIndex === 0 ? "position" : `aShape${shapeIndex}`,
      new THREE.BufferAttribute(array, 3),
    );
  });

  const seeds = new Float32Array(count);
  for (let index = 0; index < count; index += 1) seeds[index] = random();
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uAspect: { value: 1 },
    uColorA: { value: new THREE.Color(0x6d98ff) },
    uColorB: { value: new THREE.Color(0xffffff) },
    uEnergy: { value: 0 },
    uOpacity: { value: SHAPE_OPACITY[0] * opacityBoost },
    uPhase: { value: 0 },
    uMaxSize: { value: isCompact ? 14 : 26 },
    uPixelRatio: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
    uPointerStrength: { value: 0 },
    uScatter: { value: 0 },
    uSize: { value: 3.2 },
    uTime: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    fragmentShader,
    transparent: true,
    uniforms,
    vertexShader,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    points,
    update(frame: JourneyParticleFrame) {
      const shapeIndex = Math.min(SHAPE_OPACITY.length - 2, Math.floor(frame.phase));
      const shapeBlend = frame.phase - shapeIndex;
      uniforms.uAspect.value = frame.aspect;
      uniforms.uColorA.value.copy(frame.colorA);
      uniforms.uColorB.value.copy(frame.colorB);
      uniforms.uEnergy.value = frame.energy;
      uniforms.uOpacity.value =
        THREE.MathUtils.lerp(
          SHAPE_OPACITY[shapeIndex],
          SHAPE_OPACITY[shapeIndex + 1],
          shapeBlend,
        ) * opacityBoost;
      uniforms.uPhase.value = frame.phase;
      uniforms.uPixelRatio.value = frame.pixelRatio;
      uniforms.uPointer.value.set(frame.pointerX, frame.pointerY);
      uniforms.uPointerStrength.value = frame.pointerStrength;
      uniforms.uScatter.value = frame.scatter;
      uniforms.uTime.value = frame.time;
    },
  };
}
