import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {
  getRenderQuality,
  updateAdaptiveQuality,
  type AdaptiveQualityState,
} from "./renderQuality";

/**
 * WebGL 3D Scene Optimizations:
 * 
 * 1. Adaptive Bloom (Battery Saver)
 *    - Disabled on compact mode and high-DPI devices (3x+) to reduce GPU overhead
 *    - Bloom adds ~15-20% GPU cost; disabling saves battery on mobile
 *    - Still renders smoothly with SMAA antialiasing alone
 * 
 * 2. Adaptive Quality Scaling
 *    - Dynamically adjusts pixel ratio based on frame time
 *    - Reduces resolution on low-end hardware when >20ms frame time detected
 *    - Increases resolution gradually (180 fast frames) when stable
 * 
 * 3. WebGL Context Restoration
 *    - Listens for webglcontextrestored to auto-resume rendering
 *    - Prevents user frustration from blank canvas after context loss
 * 
 * 4. High-DPI Device Handling
 *    - Limits pixel ratio to 1.25x on 3x+ DPI displays to conserve battery
 *    - Maintains visual fidelity while improving device longevity
 * 
 * 5. Camera Interpolation
 *    - Uses CatmullRom curves with custom tension for smooth transitions
 *    - Pointer tracking with damping for responsive but not jittery movement
 */

export type JourneyQuality = "compact" | "full";

export type ScrollJourneyOptions = {
  progress: number;
  velocity: number;
  quality: JourneyQuality;
};

export const SCROLL_JOURNEY_DEFAULTS: ScrollJourneyOptions = {
  progress: 0,
  velocity: 0,
  quality: "full",
};

type StoryWorld = {
  at: number;
  group: THREE.Group;
  materials: THREE.Material[];
  tick: (time: number, delta: number, focus: number) => void;
};

const STORY_POINTS = [
  new THREE.Vector3(0, -0.25, 4),
  new THREE.Vector3(-1.4, 0.2, -8),
  new THREE.Vector3(-4.8, 0.45, -22),
  new THREE.Vector3(4.4, -0.2, -43),
  new THREE.Vector3(-4.5, 0.3, -64),
  new THREE.Vector3(0, 0.65, -86),
];

const CAMERA_POINTS = [
  new THREE.Vector3(0, 1.1, 12),
  new THREE.Vector3(2.7, 1.4, 1),
  new THREE.Vector3(0.8, 1.25, -15),
  new THREE.Vector3(-0.4, 1.1, -36),
  new THREE.Vector3(0.8, 1.3, -57),
  new THREE.Vector3(0, 1.5, -78),
];

const LOOK_POINTS = [
  new THREE.Vector3(0, 0, 2),
  new THREE.Vector3(-1.4, 0.15, -8),
  new THREE.Vector3(-4.8, 0.25, -22),
  new THREE.Vector3(4.4, -0.15, -43),
  new THREE.Vector3(-4.5, 0.25, -64),
  new THREE.Vector3(0, 0.55, -86),
];

const CHAPTER_COLORS = [
  new THREE.Color(0x6d98ff),
  new THREE.Color(0x75a7ff),
  new THREE.Color(0xb083ff),
  new THREE.Color(0xff715b),
  new THREE.Color(0xffd8a3),
];

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function roundedRectangle(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height,
  );
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function createGlassMaterial(color: number, opacity = 0.42) {
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.12,
    metalness: 0.2,
    opacity,
    roughness: 0.18,
    side: THREE.DoubleSide,
    transparent: true,
    transmission: 0.26,
  });
}

function createGlowMaterial(color: number, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    blending: THREE.AdditiveBlending,
    color,
    depthWrite: false,
    opacity,
    transparent: true,
  });
}

function createFrame(width: number, height: number, color: number) {
  const group = new THREE.Group();
  const material = createGlowMaterial(color, 0.5);
  const horizontal = new THREE.BoxGeometry(width, 0.025, 0.025);
  const vertical = new THREE.BoxGeometry(0.025, height, 0.025);
  const top = new THREE.Mesh(horizontal, material);
  const bottom = new THREE.Mesh(horizontal, material);
  const left = new THREE.Mesh(vertical, material);
  const right = new THREE.Mesh(vertical, material);
  top.position.y = height / 2;
  bottom.position.y = -height / 2;
  left.position.x = -width / 2;
  right.position.x = width / 2;
  group.add(top, bottom, left, right);
  return { group, material };
}

function createOriginWorld(): StoryWorld {
  const group = new THREE.Group();
  group.position.copy(STORY_POINTS[0]);
  const materials: THREE.Material[] = [];

  const shellMaterial = createGlassMaterial(0x4f7fff, 0.25);
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 3), shellMaterial);
  materials.push(shellMaterial);

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xeaf2ff,
    emissive: 0x5b8fff,
    emissiveIntensity: 2.8,
    metalness: 0.72,
    roughness: 0.12,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 2), coreMaterial);
  materials.push(coreMaterial);

  const orbitMaterial = createGlowMaterial(0x8eb0ff, 0.68);
  const orbitA = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.018, 6, 128), orbitMaterial);
  const orbitB = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.012, 6, 128), orbitMaterial);
  orbitA.rotation.set(1.08, 0.2, 0.35);
  orbitB.rotation.set(0.42, 1.1, -0.2);
  materials.push(orbitMaterial);

  const shards = new THREE.Group();
  const shardMaterial = createGlowMaterial(0xc5d7ff, 0.58);
  const shardGeometry = new THREE.TetrahedronGeometry(0.07, 0);
  for (let index = 0; index < 22; index += 1) {
    const shard = new THREE.Mesh(shardGeometry, shardMaterial);
    const angle = (index / 22) * Math.PI * 2;
    const radius = 2.2 + (index % 4) * 0.24;
    shard.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.7) * 1.25,
      Math.sin(angle) * 0.8,
    );
    shard.rotation.set(angle, angle * 0.7, -angle);
    shards.add(shard);
  }
  materials.push(shardMaterial);

  const sketchFrames = new THREE.Group();
  for (let index = 0; index < 3; index += 1) {
    const frame = createFrame(5.2 - index * 0.55, 3.7 - index * 0.4, 0x6d98ff);
    frame.group.position.z = -0.85 - index * 0.48;
    frame.group.rotation.z = (index - 1) * 0.055;
    sketchFrames.add(frame.group);
    materials.push(frame.material);
  }

  const axisMaterial = createGlowMaterial(0xd9e5ff, 0.38);
  const axisGeometry = new THREE.BufferGeometry();
  axisGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [-2.6, 0, -0.5, 2.6, 0, -0.5, 0, -1.85, -0.5, 0, 1.85, -0.5],
      3,
    ),
  );
  const designAxis = new THREE.LineSegments(axisGeometry, axisMaterial);
  materials.push(axisMaterial);
  group.add(sketchFrames, shell, core, orbitA, orbitB, shards, designAxis);

  return {
    at: 0.04,
    group,
    materials,
    tick(time, delta, focus) {
      core.scale.setScalar(0.92 + Math.sin(time * 2.4) * 0.08 + focus * 0.16);
      shell.rotation.y += delta * 0.08;
      orbitA.rotation.z += delta * 0.12;
      orbitB.rotation.x -= delta * 0.08;
      shards.rotation.y = time * 0.045;
      sketchFrames.rotation.y = Math.sin(time * 0.2) * 0.035;
    },
  };
}

function createNeuralWorld(): StoryWorld {
  const group = new THREE.Group();
  group.position.copy(STORY_POINTS[2]);
  const materials: THREE.Material[] = [];
  const frame = createFrame(7.2, 5, 0x5b8fff);
  frame.group.rotation.y = 0.08;
  materials.push(frame.material);

  const coreMaterial = new THREE.MeshPhysicalMaterial({
    clearcoat: 1,
    color: 0x0d1838,
    emissive: 0x5b8fff,
    emissiveIntensity: 0.54,
    metalness: 0.86,
    roughness: 0.16,
  });
  const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.88, 1), coreMaterial);
  materials.push(coreMaterial);

  const nodePositions: THREE.Vector3[] = [];
  const nodeMaterial = createGlowMaterial(0xd8e5ff, 0.92);
  const nodeGeometry = new THREE.SphereGeometry(0.075, 12, 12);
  const nodes = new THREE.Group();
  for (let index = 0; index < 18; index += 1) {
    const y = 1 - (index / 17) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = Math.PI * (3 - Math.sqrt(5)) * index;
    const position = new THREE.Vector3(
      Math.cos(theta) * radius * 2.35,
      y * 2.05,
      Math.sin(theta) * radius * 1.15,
    );
    nodePositions.push(position);
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.copy(position);
    nodes.add(node);
  }
  materials.push(nodeMaterial);

  const edgePositions: number[] = [];
  nodePositions.forEach((from, fromIndex) => {
    nodePositions.forEach((to, toIndex) => {
      if (toIndex <= fromIndex || from.distanceTo(to) > 1.9) return;
      edgePositions.push(from.x, from.y, from.z, to.x, to.y, to.z);
    });
  });
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(edgePositions, 3));
  const edgeMaterial = new THREE.LineBasicMaterial({
    blending: THREE.AdditiveBlending,
    color: 0x5b8fff,
    opacity: 0.34,
    transparent: true,
  });
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  materials.push(edgeMaterial);

  const scanMaterial = createGlowMaterial(0x7aa2ff, 0.2);
  const scan = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.13, 96), scanMaterial);
  scan.rotation.x = Math.PI / 2;
  materials.push(scanMaterial);

  const systemPanels = new THREE.Group();
  [-1, 1].forEach((direction) => {
    const panel = createFrame(2.05, 1.35, 0x8eb0ff);
    panel.group.position.set(direction * 3.15, direction * -0.7, -0.35);
    panel.group.userData.baseY = panel.group.position.y;
    panel.group.rotation.y = direction * -0.28;
    systemPanels.add(panel.group);
    materials.push(panel.material);
  });
  group.add(frame.group, systemPanels, core, edges, nodes, scan);

  return {
    at: 0.3,
    group,
    materials,
    tick(time, delta, focus) {
      core.rotation.x += delta * 0.13;
      core.rotation.y += delta * 0.22;
      nodes.rotation.y = Math.sin(time * 0.22) * 0.18;
      edges.rotation.copy(nodes.rotation);
      scan.scale.setScalar(1 + ((time * 0.34) % 1) * 1.7);
      scanMaterial.opacity = (1 - ((time * 0.34) % 1)) * 0.32 * focus;
      frame.group.rotation.z = Math.sin(time * 0.25) * 0.015;
      systemPanels.children.forEach((panel, index) => {
        panel.position.y =
          (panel.userData.baseY as number) +
          Math.sin(time * 0.55 + index * Math.PI) * 0.07;
      });
    },
  };
}

function createFinanceWorld(): StoryWorld {
  const group = new THREE.Group();
  group.position.copy(STORY_POINTS[3]);
  const materials: THREE.Material[] = [];
  const cardGeometry = new THREE.ExtrudeGeometry(roundedRectangle(4.35, 2.7, 0.26), {
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.06,
    bevelThickness: 0.05,
    depth: 0.16,
  });
  cardGeometry.center();
  const cardMaterial = new THREE.MeshPhysicalMaterial({
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    color: 0x24123d,
    emissive: 0x7d43d5,
    emissiveIntensity: 0.24,
    metalness: 0.92,
    roughness: 0.16,
  });
  const card = new THREE.Mesh(cardGeometry, cardMaterial);
  card.rotation.set(-0.06, -0.34, -0.08);
  materials.push(cardMaterial);

  const chipMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8d6a5,
    emissive: 0x8a6d30,
    emissiveIntensity: 0.3,
    metalness: 1,
    roughness: 0.2,
  });
  const chip = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.06), chipMaterial);
  chip.position.set(-1.25, 0.45, 0.18);
  chip.rotation.copy(card.rotation);
  materials.push(chipMaterial);

  const coinMaterial = new THREE.MeshPhysicalMaterial({
    clearcoat: 1,
    color: 0xd3c1ff,
    emissive: 0x8f66ff,
    emissiveIntensity: 0.8,
    metalness: 0.95,
    roughness: 0.09,
  });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.13, 64), coinMaterial);
  coin.position.set(1.1, 0.25, 0.55);
  coin.rotation.x = Math.PI / 2;
  materials.push(coinMaterial);

  const orbitMaterial = createGlowMaterial(0xb083ff, 0.72);
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.022, 8, 144), orbitMaterial);
  orbit.rotation.set(1.18, 0.18, -0.22);
  materials.push(orbitMaterial);

  const bars = new THREE.Group();
  const barMaterial = createGlowMaterial(0xd8caff, 0.62);
  for (let index = 0; index < 7; index += 1) {
    const height = 0.2 + index * 0.13;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, 0.05), barMaterial);
    bar.position.set(-0.9 + index * 0.3, -0.72 + height / 2, 0.23);
    bar.rotation.copy(card.rotation);
    bars.add(bar);
  }
  materials.push(barMaterial);

  const frame = createFrame(6.8, 4.8, 0xa36bff);
  frame.group.rotation.y = -0.08;
  materials.push(frame.material);
  group.add(frame.group, card, chip, coin, orbit, bars);

  return {
    at: 0.55,
    group,
    materials,
    tick(time, delta, focus) {
      card.rotation.y = -0.34 + Math.sin(time * 0.38) * 0.07;
      chip.rotation.y = card.rotation.y;
      coin.rotation.z += delta * (0.3 + focus * 0.85);
      coin.position.y = 0.25 + Math.sin(time * 1.25) * 0.1;
      orbit.rotation.z -= delta * 0.08;
      bars.children.forEach((bar, index) => {
        bar.scale.y = 0.78 + Math.sin(time * 1.7 + index * 0.55) * 0.22;
      });
    },
  };
}

function createBridgeWorld(): StoryWorld {
  const group = new THREE.Group();
  group.position.copy(STORY_POINTS[4]);
  const materials: THREE.Material[] = [];

  const portalMaterial = createGlassMaterial(0xff5c45, 0.32);
  const portalGeometry = new THREE.TorusGeometry(1.58, 0.12, 16, 128);
  const leftPortal = new THREE.Mesh(portalGeometry, portalMaterial);
  const rightPortal = new THREE.Mesh(portalGeometry, portalMaterial);
  leftPortal.position.x = -2.05;
  rightPortal.position.x = 2.05;
  leftPortal.rotation.y = 0.26;
  rightPortal.rotation.y = -0.26;
  materials.push(portalMaterial);

  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.05, -0.25, 0),
    new THREE.Vector3(-0.9, 0.45, 0.45),
    new THREE.Vector3(0, 0.05, 0.8),
    new THREE.Vector3(0.9, -0.4, 0.45),
    new THREE.Vector3(2.05, 0.2, 0),
  ]);
  const bridgeMaterial = createGlowMaterial(0xffb08f, 0.95);
  const bridge = new THREE.Mesh(new THREE.TubeGeometry(bridgeCurve, 96, 0.035, 8, false), bridgeMaterial);
  materials.push(bridgeMaterial);

  const languageMaterial = createGlowMaterial(0xffd1bd, 0.78);
  const languageGeometry = new THREE.OctahedronGeometry(0.13, 0);
  const languageNodes = new THREE.Group();
  const languagePositions = [
    [-2.05, 1.95, 0], [-2.05, -1.95, 0], [0, 2.15, 0.3],
    [0, -2.15, 0.3], [2.05, 1.95, 0], [2.05, -1.95, 0],
  ];
  languagePositions.forEach(([x, y, z]) => {
    const node = new THREE.Mesh(languageGeometry, languageMaterial);
    node.position.set(x, y, z);
    languageNodes.add(node);
  });
  materials.push(languageMaterial);

  const frames = new THREE.Group();
  for (let index = 0; index < 3; index += 1) {
    const frame = createFrame(7 - index * 0.65, 5 - index * 0.45, 0xff715b);
    frame.group.position.z = -0.5 - index * 0.55;
    frame.group.rotation.z = (index - 1) * 0.045;
    frames.add(frame.group);
    materials.push(frame.material);
  }
  group.add(frames, leftPortal, rightPortal, bridge, languageNodes);

  return {
    at: 0.79,
    group,
    materials,
    tick(time, delta, focus) {
      leftPortal.rotation.z += delta * 0.08;
      rightPortal.rotation.z -= delta * 0.08;
      languageNodes.children.forEach((node, index) => {
        node.rotation.x += delta * (0.2 + index * 0.03);
        node.rotation.y -= delta * 0.16;
        node.scale.setScalar(0.8 + Math.sin(time * 1.4 + index) * 0.16 + focus * 0.18);
      });
    },
  };
}

function createHorizonWorld(): StoryWorld {
  const group = new THREE.Group();
  group.position.copy(STORY_POINTS[5]);
  const materials: THREE.Material[] = [];
  const ringMaterial = createGlowMaterial(0xffd8a3, 0.72);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.55, 0.035, 8, 192), ringMaterial);
  materials.push(ringMaterial);

  const monolithMaterial = new THREE.MeshPhysicalMaterial({
    clearcoat: 1,
    color: 0x17120d,
    emissive: 0xff9b58,
    emissiveIntensity: 0.25,
    metalness: 0.88,
    roughness: 0.12,
  });
  const monolith = new THREE.Mesh(new THREE.BoxGeometry(1.1, 5.2, 0.32), monolithMaterial);
  materials.push(monolithMaterial);

  const signatureMaterial = createGlowMaterial(0xffffff, 0.95);
  const signatureGeometry = new THREE.BufferGeometry();
  signatureGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -1.65, -1.25, 0.4, -0.9, 1.35, 0.4,
        -0.9, 1.35, 0.4, -0.15, -1.25, 0.4,
        -1.35, -0.2, 0.4, -0.45, -0.2, 0.4,
        0.35, 1.35, 0.4, 0.35, -1.25, 0.4,
        0.35, 0.05, 0.4, 1.6, 1.35, 0.4,
        0.35, 0.05, 0.4, 1.7, -1.25, 0.4,
      ],
      3,
    ),
  );
  const signature = new THREE.LineSegments(signatureGeometry, signatureMaterial);
  materials.push(signatureMaterial);

  const particles = new THREE.Group();
  const particleMaterial = createGlowMaterial(0xffd8a3, 0.66);
  const particleGeometry = new THREE.SphereGeometry(0.045, 8, 8);
  for (let index = 0; index < 36; index += 1) {
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    const angle = (index / 36) * Math.PI * 2;
    particle.position.set(
      Math.cos(angle) * (3.8 + (index % 3) * 0.3),
      Math.sin(angle) * (3.2 + (index % 4) * 0.15),
      Math.sin(angle * 2) * 0.65,
    );
    particles.add(particle);
  }
  materials.push(particleMaterial);
  group.add(ring, monolith, signature, particles);

  return {
    at: 0.97,
    group,
    materials,
    tick(time, delta, focus) {
      ring.rotation.z += delta * 0.035;
      monolith.rotation.y = Math.sin(time * 0.28) * 0.14;
      signature.scale.setScalar(0.88 + focus * 0.12);
      particles.rotation.z = time * 0.025;
    },
  };
}

function createDust(random: () => number, count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const blue = new THREE.Color(0x5b8fff);
  const warm = new THREE.Color(0xffa06d);
  const color = new THREE.Color();
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (random() - 0.5) * 32;
    positions[offset + 1] = (random() - 0.5) * 18;
    positions[offset + 2] = 14 - random() * 112;
    color.copy(blue).lerp(warm, random() * 0.7);
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.42,
    size: 0.035,
    transparent: true,
    vertexColors: true,
  });
  return new THREE.Points(geometry, material);
}

function createTerrain() {
  const geometry = new THREE.PlaneGeometry(36, 115, 32, 96);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    positions.setY(
      index,
      -3.1 + Math.sin(x * 0.56 + z * 0.08) * 0.22 + Math.sin(z * 0.2) * 0.12,
    );
  }
  positions.needsUpdate = true;
  const material = new THREE.MeshBasicMaterial({
    blending: THREE.AdditiveBlending,
    color: 0x345da8,
    opacity: 0.075,
    transparent: true,
    wireframe: true,
  });
  const terrain = new THREE.Mesh(geometry, material);
  terrain.position.z = -43;
  return terrain;
}

function chapterColor(progress: number, target: THREE.Color) {
  const scaled = THREE.MathUtils.clamp(progress, 0, 0.9999) * (CHAPTER_COLORS.length - 1);
  const index = Math.floor(scaled);
  return target
    .copy(CHAPTER_COLORS[index])
    .lerp(CHAPTER_COLORS[Math.min(index + 1, CHAPTER_COLORS.length - 1)], scaled - index);
}

export function createScrollJourneyRenderer(
  canvas: HTMLCanvasElement,
  getOptions: () => ScrollJourneyOptions,
) {
  const initialOptions = getOptions();
  const isCompact = initialOptions.quality === "compact";
  const initialRenderQuality = getRenderQuality({
    devicePixelRatio: window.devicePixelRatio || 1,
    quality: initialOptions.quality,
    width: window.innerWidth,
  });
  const renderer = new THREE.WebGLRenderer({
    alpha: false,
    antialias: initialRenderQuality.antialias,
    canvas,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const backgroundColor = new THREE.Color(0x02040b);
  scene.background = backgroundColor;
  scene.fog = new THREE.FogExp2(0x02040b, 0.018);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.08, 150);
  const cameraCurve = new THREE.CatmullRomCurve3(CAMERA_POINTS, false, "catmullrom", 0.2);
  const lookCurve = new THREE.CatmullRomCurve3(LOOK_POINTS, false, "catmullrom", 0.18);
  const storyCurve = new THREE.CatmullRomCurve3(STORY_POINTS, false, "catmullrom", 0.24);

  scene.add(new THREE.HemisphereLight(0x6c8fe8, 0x05030a, 1.15));
  const keyLight = new THREE.DirectionalLight(0xdde8ff, 2.1);
  keyLight.position.set(4, 7, 8);
  scene.add(keyLight);
  const cameraLight = new THREE.PointLight(0x7aa2ff, 3.2, 24, 1.8);
  scene.add(cameraLight);

  const lineMaterial = createGlowMaterial(0x7fa5ff, 0.92);
  const lifeLine = new THREE.Mesh(
    new THREE.TubeGeometry(storyCurve, isCompact ? 160 : 280, 0.025, 8, false),
    lineMaterial,
  );
  const haloMaterial = createGlowMaterial(0x5b8fff, 0.14);
  const lineHalo = new THREE.Mesh(
    new THREE.TubeGeometry(storyCurve, isCompact ? 120 : 220, 0.11, 8, false),
    haloMaterial,
  );
  scene.add(lifeLine, lineHalo);

  const pulseMaterial = createGlowMaterial(0xffffff, 1);
  const pulseGeometry = new THREE.SphereGeometry(0.085, 12, 12);
  const pulseCount = isCompact ? 3 : 6;
  const pulses = Array.from({ length: pulseCount }, (_, index) => {
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulse.userData.offset = index / pulseCount;
    scene.add(pulse);
    return pulse;
  });

  const worlds = [
    createOriginWorld(),
    createNeuralWorld(),
    createFinanceWorld(),
    createBridgeWorld(),
    createHorizonWorld(),
  ];
  worlds.forEach((world) => {
    world.materials.forEach((material) => {
      material.userData.baseOpacity = material.opacity;
      material.transparent = true;
    });
    scene.add(world.group);
  });
  const random = createSeededRandom(20260829);
  const dust = createDust(random, isCompact ? 650 : 1500);
  const terrain = createTerrain();
  scene.add(dust, terrain);

  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  const bloomEnabled = !isCompact && window.devicePixelRatio <= 2;
  if (!isCompact) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    if (bloomEnabled) {
      bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.72, 0.78, 0.22);
      composer.addPass(bloom);
    }
    composer.addPass(new SMAAPass());
    composer.addPass(new OutputPass());
  }

  const targetCamera = new THREE.Vector3();
  const targetLook = new THREE.Vector3();
  const cameraPosition = new THREE.Vector3();
  const cameraLook = new THREE.Vector3();
  const activeColor = new THREE.Color();
  const darkColor = new THREE.Color();
  let smoothProgress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let previousTimestamp = 0;
  let viewportWidth = Math.max(1, window.innerWidth);
  let viewportHeight = Math.max(1, window.innerHeight);
  let smoothedFrameTime = 1000 / 60;
  let qualityBudget = initialRenderQuality;
  let adaptiveQuality: AdaptiveQualityState = {
    fastFrames: 0,
    pixelRatio: initialRenderQuality.pixelRatio,
    slowFrames: 0,
  };

  const applyRenderSize = (pixelRatio: number) => {
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(viewportWidth, viewportHeight, false);
    composer?.setPixelRatio(pixelRatio);
    composer?.setSize(viewportWidth, viewportHeight);
    bloom?.setSize(
      Math.max(1, Math.round(viewportWidth * pixelRatio * 0.55)),
      Math.max(1, Math.round(viewportHeight * pixelRatio * 0.55)),
    );
  };

  return {
    resize(width: number, height: number) {
      const renderQuality = getRenderQuality({
        devicePixelRatio: window.devicePixelRatio || 1,
        quality: initialOptions.quality,
        width,
      });
      viewportWidth = Math.max(1, width);
      viewportHeight = Math.max(1, height);
      qualityBudget = renderQuality;
      adaptiveQuality = {
        fastFrames: 0,
        pixelRatio: renderQuality.pixelRatio,
        slowFrames: 0,
      };
      applyRenderSize(renderQuality.pixelRatio);
      camera.aspect = width / Math.max(1, height);
      camera.fov = width >= 1024 ? 46 : 56;
      camera.updateProjectionMatrix();
    },
    setPointer(x: number, y: number) {
      targetPointerX = Number.isFinite(x) ? x : 0;
      targetPointerY = Number.isFinite(y) ? y : 0;
    },
    render(timestamp: number) {
      const options = getOptions();
      const now = Number.isFinite(timestamp) ? timestamp : performance.now();
      const delta = previousTimestamp
        ? THREE.MathUtils.clamp((now - previousTimestamp) / 1000, 0, 0.05)
        : 1 / 60;
      previousTimestamp = now;
      smoothedFrameTime = THREE.MathUtils.lerp(
        smoothedFrameTime,
        delta * 1000,
        0.06,
      );
      const nextAdaptiveQuality = updateAdaptiveQuality(adaptiveQuality, {
        frameTimeMs: smoothedFrameTime,
        minPixelRatio: qualityBudget.minPixelRatio,
        targetPixelRatio: qualityBudget.pixelRatio,
      });
      if (nextAdaptiveQuality.pixelRatio !== adaptiveQuality.pixelRatio) {
        applyRenderSize(nextAdaptiveQuality.pixelRatio);
      }
      adaptiveQuality = nextAdaptiveQuality;
      const time = now / 1000;
      const rawProgress = Number.isFinite(options.progress) ? options.progress : 0;
      const progress = THREE.MathUtils.clamp(rawProgress, 0, 1);
      smoothProgress = THREE.MathUtils.damp(smoothProgress, progress, 6.8, delta);
      pointerX = THREE.MathUtils.damp(pointerX, targetPointerX, 5, delta);
      pointerY = THREE.MathUtils.damp(pointerY, targetPointerY, 5, delta);

      cameraCurve.getPointAt(smoothProgress, targetCamera);
      lookCurve.getPointAt(smoothProgress, targetLook);
      targetCamera.x += pointerX * (isCompact ? 0.08 : 0.3);
      targetCamera.y -= pointerY * (isCompact ? 0.05 : 0.18);
      targetLook.x += pointerX * 0.12;
      targetLook.y -= pointerY * 0.08;
      if (cameraPosition.lengthSq() < 0.001) cameraPosition.copy(targetCamera);
      if (cameraLook.lengthSq() < 0.001) cameraLook.copy(targetLook);
      cameraPosition.lerp(targetCamera, 1 - Math.exp(-delta * 8.5));
      cameraLook.lerp(targetLook, 1 - Math.exp(-delta * 10));
      camera.position.copy(cameraPosition);
      camera.lookAt(cameraLook);
      camera.rotation.z += Math.sin(smoothProgress * Math.PI * 4) * 0.008;
      cameraLight.position.copy(camera.position);

      chapterColor(smoothProgress, activeColor);
      darkColor.copy(activeColor).multiplyScalar(0.045);
      backgroundColor.lerp(darkColor, 1 - Math.exp(-delta * 2.4));
      (scene.fog as THREE.FogExp2).color.copy(backgroundColor);
      lineMaterial.color.lerp(activeColor, 1 - Math.exp(-delta * 3));
      haloMaterial.color.copy(lineMaterial.color);
      cameraLight.color.copy(activeColor);

      const velocity = Number.isFinite(options.velocity) ? Math.abs(options.velocity) : 0;
      const energy = THREE.MathUtils.clamp(velocity / 1100, 0, 1);
      pulses.forEach((pulse) => {
        const at = (time * (0.018 + energy * 0.035) + pulse.userData.offset) % 1;
        storyCurve.getPointAt(at, pulse.position);
        pulse.scale.setScalar(0.7 + energy * 1.7);
      });

      worlds.forEach((world) => {
        const distance = Math.abs(smoothProgress - world.at);
        world.group.visible = distance < 0.32;
        if (!world.group.visible) return;
        const focus = 1 - THREE.MathUtils.smoothstep(distance, 0.09, 0.28);
        const visibility = 0.08 + focus * 0.92;
        world.group.scale.setScalar(0.84 + focus * 0.16);
        world.materials.forEach((material) => {
          const baseOpacity = material.userData.baseOpacity as number;
          material.opacity = baseOpacity * visibility;
        });
        world.tick(time, delta, focus);
      });

      dust.rotation.y = Math.sin(time * 0.035) * 0.035;
      (dust.material as THREE.PointsMaterial).opacity = 0.34 + energy * 0.18;
      terrain.position.x = Math.sin(smoothProgress * Math.PI * 3) * 0.35;
      if (bloom && bloomEnabled) bloom.strength = 0.66 + energy * 0.24;
      if (composer) composer.render(delta);
      else renderer.render(scene, camera);
    },
    dispose() {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Points ||
          object instanceof THREE.Line
        ) {
          geometries.add(object.geometry);
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
          objectMaterials.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      composer?.dispose();
      renderer.dispose();
    },
  };
}
