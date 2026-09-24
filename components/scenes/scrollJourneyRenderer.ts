import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { createJourneyParticles } from "./journeyParticles";
import { JourneyPostShader } from "./journeyPostShader";
import {
  getBloomResolutionScale,
  getBloomStrength,
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
 *    - Reduces resolution only after sustained >22ms averaged frame times
 *    - Restores resolution in small steps after 90 consistently smooth frames
 * 
 * 3. WebGL Context Restoration
 *    - Listens for webglcontextrestored to auto-resume rendering
 *    - Prevents user frustration from blank canvas after context loss
 * 
 * 4. High-DPI Device Handling
 *    - Keeps compact 3x+ displays at 1.25 DPR to conserve battery
 *    - Caps full desktop rendering at 1.8 DPR and adapts under sustained load
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
  new THREE.Color(0xe0483f),
  new THREE.Color(0x3b82f6),
];

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
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

/**
 * Materials sit in the opaque queue at full focus, for correct sorting, and
 * move to the transparent queue while they fade. Each queue needs its own
 * shader, so phones lock a single queue (userData.fixedQueue) and never
 * compile the second one.
 */
function syncRenderQueue(material: THREE.Material) {
  if (material.userData.fixedQueue === true) return;
  const transparent = material.opacity < 1;
  if (material.transparent !== transparent) {
    material.transparent = transparent;
    material.needsUpdate = true;
  }
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

function createOriginWorld(isCompact: boolean): StoryWorld {
  const group = new THREE.Group();
  group.position.copy(STORY_POINTS[0]);
  const composition = new THREE.Group();
  composition.rotation.set(-0.12, -0.24, -0.16);
  group.add(composition);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x172237,
    metalness: 0.58,
    roughness: 0.38,
  });
  const cutMaterial = new THREE.MeshStandardMaterial({
    color: 0x415573,
    metalness: 0.68,
    roughness: 0.27,
  });
  const seamMaterial = new THREE.MeshStandardMaterial({
    color: 0xc6dcff,
    emissive: 0x759fff,
    emissiveIntensity: 0.85,
    metalness: 0.25,
    roughness: 0.32,
  });
  const materials: THREE.Material[] = [bodyMaterial, cutMaterial, seamMaterial];
  materials.forEach((material) => { material.userData.opaqueAtFullFocus = true; });

  // Two open, folded profiles leave a generous central void and unequal ends.
  // Extrusion material 0 covers the faces; material 1 catches the cut edges.
  const makeFold = (points: number[][], depth: number) => {
    const shape = new THREE.Shape();
    points.forEach(([x, y], index) => {
      if (index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      curveSegments: 1,
    });
    geometry.translate(0, 0, -depth / 2);
    return new THREE.Mesh(geometry, [bodyMaterial, cutMaterial]);
  };

  const leftFold = makeFold([
    [-0.12, 1.83], [-1.38, 1.16], [-1.82, -0.73],
    [-0.72, -1.63], [-0.39, -1.22], [-1.12, -0.57],
    [-0.8, 0.8], [0.05, 1.29],
  ], 0.58);
  leftFold.position.z = 0.18;
  const rightFold = makeFold([
    [0.57, 1.42], [1.49, 0.62], [1.22, -1.08],
    [0.04, -1.87], [-0.14, -1.34], [0.64, -0.75],
    [0.87, 0.43], [0.3, 0.96],
  ], isCompact ? 0.42 : 0.48);
  rightFold.position.z = -0.22;
  composition.add(leftFold, rightFold);

  // A recessed sliver marks the moment of ignition, without filling the void.
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.82, 0.045), seamMaterial);
  seam.position.set(-0.96, 0.15, 0.47);
  seam.rotation.z = -0.23;
  composition.add(seam);

  if (!isCompact) {
    // Two quiet rear laminations echo the tooling of the main fold.
    const laminationGeometry = leftFold.geometry;
    for (let index = 0; index < 2; index += 1) {
      const lamination = new THREE.Mesh(laminationGeometry, bodyMaterial);
      lamination.scale.set(1, 1, 0.11);
      lamination.position.set(-0.1 * (index + 1), 0.045 * (index + 1), -0.48 - index * 0.19);
      composition.add(lamination);
    }
  }

  // Bake the static folds and laminations into one draw per metal finish.
  // Preserve the original normals, placement and face/edge materials.
  const batches = [bodyMaterial, cutMaterial].map((material) => ({
    material, positions: [] as number[], normals: [] as number[],
  }));
  const sourceGeometries = new Set<THREE.BufferGeometry>();
  const vertex = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();
  for (const child of [...composition.children]) {
    if (!(child instanceof THREE.Mesh) || child === seam) continue;
    child.updateMatrix();
    normalMatrix.getNormalMatrix(child.matrix);
    const geometry = child.geometry as THREE.BufferGeometry;
    const positionAttribute = geometry.getAttribute("position");
    const normalAttribute = geometry.getAttribute("normal");
    const ranges = Array.isArray(child.material) ? geometry.groups : [
      { start: 0, count: positionAttribute.count, materialIndex: 0 },
    ];
    for (const range of ranges) {
      const batch = batches[range.materialIndex ?? 0];
      for (let index = range.start; index < range.start + range.count; index += 1) {
        vertex.fromBufferAttribute(positionAttribute, index).applyMatrix4(child.matrix);
        normal.fromBufferAttribute(normalAttribute, index).applyNormalMatrix(normalMatrix);
        batch.positions.push(vertex.x, vertex.y, vertex.z);
        batch.normals.push(normal.x, normal.y, normal.z);
      }
    }
    sourceGeometries.add(geometry);
    composition.remove(child);
  }
  for (const batch of batches) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(batch.positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(batch.normals, 3));
    geometry.computeBoundingSphere();
    composition.add(new THREE.Mesh(geometry, batch.material));
  }
  sourceGeometries.forEach((geometry) => geometry.dispose());

  return {
    at: 0.04,
    group,
    materials,
    tick(time, _delta, focus) {
      // Use the opaque queue at full focus; retain the existing smooth exit fade.
      for (const material of materials) {
        syncRenderQueue(material);
      }
      composition.rotation.y = -0.24 + Math.sin(time * 0.18) * 0.035;
      composition.rotation.x = -0.12 + Math.sin(time * 0.14) * 0.018;
      seamMaterial.emissiveIntensity = 0.65 + focus * 0.2 + Math.sin(time * 0.7) * 0.045;
    },
  };
}

function createNeuralWorld(isCompact: boolean): StoryWorld {
  const group = new THREE.Group();
  group.position.copy(STORY_POINTS[2]);
  const materials: THREE.Material[] = [];
  const cognition = new THREE.Group();
  cognition.rotation.set(-0.06, 0.18, 0);
  group.add(cognition);

  // Stacked OS layers: glass panes receding in depth behind the graph.
  const paneMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0b1530,
    emissive: 0x1a2f66,
    emissiveIntensity: 0.18,
    metalness: 0.1,
    opacity: 0.16,
    roughness: 0.35,
    side: THREE.DoubleSide,
    transmission: 0.35,
    transparent: true,
  });
  materials.push(paneMaterial);
  const layers = new THREE.Group();
  for (let index = 0; index < 3; index += 1) {
    const width = 7.4 - index * 0.9;
    const height = 4.6 - index * 0.55;
    const frame = createFrame(width, height, index === 0 ? 0x7fa5ff : 0x4f6fd6);
    const layer = new THREE.Group();
    layer.add(new THREE.Mesh(new THREE.PlaneGeometry(width, height), paneMaterial), frame.group);
    layer.position.set(0, index * 0.18, -1.1 - index * 1.15);
    layer.rotation.z = (index - 1) * 0.02;
    layer.userData.baseZ = layer.position.z;
    layers.add(layer);
    materials.push(frame.material);
  }

  // Kernel: a glass sphere with a rotating wireframe mind inside.
  const kernelShellMaterial = new THREE.MeshPhysicalMaterial({
    clearcoat: 1,
    color: 0x08122e,
    emissive: 0x5b8fff,
    emissiveIntensity: 0.35,
    metalness: 0.4,
    opacity: 0.55,
    roughness: 0.2,
    transmission: 0.5,
    transparent: true,
  });
  const kernelCoreMaterial = new THREE.MeshBasicMaterial({
    blending: THREE.AdditiveBlending,
    color: 0x9dbcff,
    depthWrite: false,
    opacity: 0.9,
    transparent: true,
    wireframe: true,
  });
  const kernel = new THREE.Group();
  const kernelCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), kernelCoreMaterial);
  kernel.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.62, isCompact ? 16 : 32, isCompact ? 12 : 24),
      kernelShellMaterial,
    ),
    kernelCore,
  );
  materials.push(kernelShellMaterial, kernelCoreMaterial);

  // Agent nodes mirror the KachaniOS routing graph: Plan, Vault, Run, Judge around the Kernel.
  const nodeSpecs = [
    { color: 0x818cf8, position: new THREE.Vector3(-2.35, 1.15, 0.25) },
    { color: 0x22d3ee, position: new THREE.Vector3(2.35, 1.15, -0.25) },
    { color: 0xc084fc, position: new THREE.Vector3(-2.35, -1.15, -0.25) },
    { color: 0x34d399, position: new THREE.Vector3(2.35, -1.15, 0.25) },
  ];
  const nodes = new THREE.Group();
  const nodeGeometry = new THREE.OctahedronGeometry(0.22, 0);
  const nodeHaloGeometry = new THREE.TorusGeometry(0.4, 0.012, 6, isCompact ? 24 : 48);
  nodeSpecs.forEach((spec) => {
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: spec.color,
      emissive: spec.color,
      emissiveIntensity: 0.9,
      metalness: 0.5,
      roughness: 0.3,
    });
    const haloMaterial = createGlowMaterial(spec.color, 0.7);
    const node = new THREE.Group();
    node.add(
      new THREE.Mesh(nodeGeometry, nodeMaterial),
      new THREE.Mesh(nodeHaloGeometry, haloMaterial),
    );
    node.position.copy(spec.position);
    node.userData.baseY = spec.position.y;
    nodes.add(node);
    materials.push(nodeMaterial, haloMaterial);
  });

  // Routes bow toward the camera; pulses run along them like tasks being handed off.
  const kernelPoint = new THREE.Vector3();
  const routeEndpoints: [THREE.Vector3, THREE.Vector3][] = [
    [nodeSpecs[0].position, kernelPoint],
    [nodeSpecs[1].position, kernelPoint],
    [kernelPoint, nodeSpecs[2].position],
    [kernelPoint, nodeSpecs[3].position],
    [nodeSpecs[0].position, nodeSpecs[1].position],
    [nodeSpecs[2].position, nodeSpecs[3].position],
  ];
  const routeMaterial = createGlowMaterial(0x6f97ff, 0.55);
  const routes = new THREE.Group();
  const routeCurves = routeEndpoints.map(([from, to]) => {
    const control = from.clone().lerp(to, 0.5);
    control.z += 0.45;
    const curve = new THREE.QuadraticBezierCurve3(from.clone(), control, to.clone());
    routes.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, isCompact ? 12 : 24, 0.018, 5, false),
        routeMaterial,
      ),
    );
    return curve;
  });
  const routePulseMaterial = createGlowMaterial(0xffffff, 0.95);
  const routePulseGeometry = new THREE.SphereGeometry(0.07, 8, 8);
  const routePulses = routeCurves.map((_, index) => {
    const pulse = new THREE.Mesh(routePulseGeometry, routePulseMaterial);
    pulse.userData.offset = index / routeCurves.length;
    routes.add(pulse);
    return pulse;
  });
  materials.push(routeMaterial, routePulseMaterial);

  // Memory ring: chips orbiting the kernel, swelling as they pass in front of it.
  const memoryRing = new THREE.Group();
  memoryRing.rotation.set(1.25, 0, 0.35);
  const memoryRingMaterial = createGlowMaterial(0x5b8fff, 0.3);
  memoryRing.add(
    new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.01, 6, isCompact ? 48 : 96), memoryRingMaterial),
  );
  const chipMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d1838,
    emissive: 0x8eb0ff,
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.3,
  });
  const chipGeometry = new THREE.BoxGeometry(0.16, 0.1, 0.05);
  const chipCount = isCompact ? 8 : 14;
  const chips = Array.from({ length: chipCount }, (_, index) => {
    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    const angle = (index / chipCount) * Math.PI * 2;
    chip.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0);
    chip.rotation.z = angle;
    memoryRing.add(chip);
    return chip;
  });
  materials.push(memoryRingMaterial, chipMaterial);

  cognition.add(layers, kernel, nodes, routes, memoryRing);

  return {
    at: 0.3,
    group,
    materials,
    tick(time, delta, focus) {
      kernelCore.rotation.x += delta * 0.35;
      kernelCore.rotation.y -= delta * 0.5;
      kernel.scale.setScalar(1 + Math.sin(time * 1.6) * 0.02 + focus * 0.05);
      kernelShellMaterial.emissiveIntensity = 0.25 + focus * 0.3 + Math.sin(time * 2.2) * 0.05;
      nodes.children.forEach((node, index) => {
        node.position.y =
          (node.userData.baseY as number) + Math.sin(time * 0.7 + index * 1.6) * 0.06;
        node.children[0].rotation.y += delta * 0.6;
        node.children[1].rotation.x = time * 0.4 + index;
      });
      routePulses.forEach((pulse, index) => {
        const at = (time * 0.22 + (pulse.userData.offset as number)) % 1;
        routeCurves[index].getPointAt(at, pulse.position);
        pulse.scale.setScalar((0.6 + Math.sin(at * Math.PI) * 0.8) * (0.4 + focus * 0.6));
      });
      memoryRing.rotation.z = 0.35 + time * 0.12;
      chips.forEach((chip, index) => {
        chip.scale.setScalar(1 + Math.max(0, Math.sin(time * 2 + index * 1.3)) * 0.6 * focus);
      });
      layers.children.forEach((layer, index) => {
        layer.position.z = (layer.userData.baseZ as number) + Math.sin(time * 0.4 + index) * 0.08;
      });
    },
  };
}

function createRoundedRectShape(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.absarc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(x + width, y + height - radius);
  shape.absarc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(x + radius, y + height);
  shape.absarc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + radius);
  shape.absarc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false);
  return shape;
}

function createFinanceWorld(isCompact: boolean): StoryWorld {
  const group = new THREE.Group();
  group.position.copy(STORY_POINTS[3]);
  group.position.x += 0.4;
  group.position.z += 1.2;
  const materials: THREE.Material[] = [];
  const vault = new THREE.Group();
  vault.rotation.set(-0.18, -0.42, 0.08);

  // Titanium card in credit-card proportions: the "physical weight" of digital money.
  const cardWidth = 4.3;
  const cardHeight = 2.7;
  const cardGeometry = new THREE.ExtrudeGeometry(
    createRoundedRectShape(cardWidth, cardHeight, 0.28),
    {
      bevelEnabled: true,
      bevelSegments: isCompact ? 1 : 3,
      bevelSize: 0.03,
      bevelThickness: 0.02,
      curveSegments: isCompact ? 6 : 14,
      depth: 0.09,
      steps: 1,
    },
  );
  cardGeometry.center();
  const titaniumMaterial = new THREE.MeshPhysicalMaterial({
    clearcoat: 0.7,
    clearcoatRoughness: 0.25,
    color: 0x191a24,
    emissive: 0x0a0a14,
    emissiveIntensity: 0.15,
    metalness: 0.96,
    roughness: 0.34,
  });
  const cardEdgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2b3a,
    emissive: 0x8f6cff,
    emissiveIntensity: 0.28,
    metalness: 0.9,
    roughness: 0.3,
  });
  const card = new THREE.Mesh(cardGeometry, [titaniumMaterial, cardEdgeMaterial]);
  materials.push(titaniumMaterial, cardEdgeMaterial);

  const chipMaterial = new THREE.MeshStandardMaterial({
    color: 0x2c2417,
    emissive: 0xd7ab62,
    emissiveIntensity: 0.55,
    metalness: 0.9,
    roughness: 0.25,
  });
  const chip = new THREE.Mesh(
    new THREE.ExtrudeGeometry(createRoundedRectShape(0.52, 0.42, 0.07), {
      bevelEnabled: false,
      curveSegments: 6,
      depth: 0.03,
    }),
    chipMaterial,
  );
  chip.position.set(-1.35, 0.25, 0.06);
  [titaniumMaterial, cardEdgeMaterial, chipMaterial].forEach((material) => {
    material.userData.opaqueAtFullFocus = true;
  });

  const contactlessMaterial = createGlowMaterial(0xd7ab62, 0.75);
  const contactless = new THREE.Group();
  for (let index = 0; index < 3; index += 1) {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(0.16 + index * 0.13, 0.012, 4, 24, Math.PI * 0.5),
      contactlessMaterial,
    );
    arc.rotation.z = -Math.PI / 4;
    contactless.add(arc);
  }
  contactless.position.set(1.35, 0.35, 0.08);

  const stripMaterial = createGlowMaterial(0xc9cbe0, 0.5);
  const strips = new THREE.Group();
  [
    [-1.0, -0.6, 0.8],
    [0.1, -0.6, 0.8],
    [1.2, -0.6, 0.6],
    [-1.15, -1.0, 0.5],
  ].forEach(([x, y, width]) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, 0.015), stripMaterial);
    strip.position.set(x, y, 0.08);
    strips.add(strip);
  });
  card.add(chip, contactless, strips);
  materials.push(chipMaterial, contactlessMaterial, stripMaterial);

  // Ghost cards: accounts layered behind the one in hand.
  const ghostMaterial = createGlassMaterial(0x6f5bd1, 0.16);
  const ghosts = new THREE.Group();
  for (let index = 1; index <= (isCompact ? 1 : 2); index += 1) {
    const ghost = new THREE.Mesh(cardGeometry, ghostMaterial);
    ghost.position.set(-0.28 * index, 0.22 * index, -0.55 * index);
    ghost.rotation.z = 0.04 * index;
    ghosts.add(ghost);
  }
  materials.push(ghostMaterial);

  // Scan line sweeping the card face and a settlement beam through the chip.
  const scanMaterial = createGlowMaterial(0xb39dff, 0.4);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth, 0.04), scanMaterial);
  scan.position.z = 0.1;
  const beamMaterial = createGlowMaterial(0xffffff, 0.5);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 7, 6), beamMaterial);
  beam.position.set(-1.35, 0, 0.14);
  materials.push(scanMaterial, beamMaterial);
  vault.add(ghosts, card, scan, beam);

  // Yield orbits: value routed around the card, with coins riding the rings.
  const orbitMaterial = new THREE.MeshStandardMaterial({
    color: 0x241d12,
    emissive: 0xd7ab62,
    emissiveIntensity: 0.32,
    metalness: 0.9,
    opacity: 0.85,
    roughness: 0.3,
    transparent: true,
  });
  const coinMaterial = createGlowMaterial(0xffd8a3, 0.95);
  const coinGeometry = new THREE.SphereGeometry(0.06, 8, 8);
  const orbits = new THREE.Group();
  const orbitSpecs = [
    { arc: Math.PI * 1.4, radius: 3.1, rotation: [1.35, 0.1, 0.3], speed: 0.07 },
    { arc: Math.PI * 0.9, radius: 3.5, rotation: [1.15, -0.35, -0.6], speed: -0.05 },
  ].slice(0, isCompact ? 1 : 2);
  const coins = orbitSpecs.map((spec) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(spec.radius, 0.014, 5, isCompact ? 64 : 128, spec.arc),
      orbitMaterial,
    );
    ring.rotation.set(spec.rotation[0], spec.rotation[1], spec.rotation[2]);
    ring.userData.speed = spec.speed;
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.userData.arc = spec.arc;
    coin.userData.radius = spec.radius;
    ring.add(coin);
    orbits.add(ring);
    return coin;
  });
  materials.push(orbitMaterial, coinMaterial);

  // Biometric moment: a fingerprint of concentric arcs hovering beside the card.
  const printMaterial = createGlowMaterial(0xb39dff, 0.7);
  const fingerprint = new THREE.Group();
  const printArcs = isCompact ? 4 : 6;
  for (let index = 0; index < printArcs; index += 1) {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(
        0.22 + index * 0.13,
        0.008,
        4,
        32,
        Math.PI * (1.15 + (index % 2) * 0.4),
      ),
      printMaterial,
    );
    arc.rotation.z = Math.PI * 0.85 + index * 0.4 - (index % 2) * 0.7;
    fingerprint.add(arc);
  }
  fingerprint.scale.set(1, 1.3, 1);
  fingerprint.position.set(2.95, -0.95, 1.1);
  materials.push(printMaterial);

  const rimLight = new THREE.PointLight(0x6f86ff, 4.4, 9, 2);
  rimLight.position.set(-2.6, 2, -1.8);
  const financeComposition = new THREE.Group();
  financeComposition.scale.setScalar(isCompact ? 0.62 : 0.72);
  financeComposition.position.x = isCompact ? -1.6 : -1.3;
  financeComposition.add(vault, orbits, fingerprint, rimLight);
  group.add(financeComposition);

  return {
    at: 0.55,
    group,
    materials,
    tick(time, delta, focus) {
      for (const material of [titaniumMaterial, cardEdgeMaterial, chipMaterial]) {
        syncRenderQueue(material);
      }
      vault.rotation.x = -0.18 + Math.sin(time * 0.2) * 0.04;
      vault.rotation.y = -0.42 + Math.sin(time * 0.25) * 0.12;
      vault.position.y = Math.sin(time * 0.5) * 0.06;
      chipMaterial.emissiveIntensity = 0.45 + focus * 0.4 + Math.sin(time * 3) * 0.1;
      ghosts.children.forEach((ghost, index) => {
        ghost.position.z = -0.55 * (index + 1) - Math.sin(time * 0.6 + index) * 0.08;
      });
      scan.position.y = ((time * 0.3) % 1) * (cardHeight + 0.4) - cardHeight / 2 - 0.2;
      scanMaterial.opacity *= focus;
      const settle = Math.pow(Math.max(0, Math.sin(time * 1.1)), 6);
      beamMaterial.opacity = focus * (0.08 + settle * 0.7);
      beam.scale.x = beam.scale.z = 1 + settle * 2;
      orbits.children.forEach((ring) => {
        ring.rotation.z += delta * (ring.userData.speed as number);
      });
      coins.forEach((coin, index) => {
        const arc = coin.userData.arc as number;
        const radius = coin.userData.radius as number;
        const angle = ((time * 0.35 + index * 1.7) % arc) as number;
        coin.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      });
      fingerprint.rotation.z = Math.sin(time * 0.4) * 0.15;
      printMaterial.opacity *= 0.55 + 0.45 * Math.sin(time * 1.8) * focus;
      rimLight.intensity = 4 + focus;
    },
  };
}

function createStarCurve(points: number, outerRadius: number, innerRadius: number) {
  const path = new THREE.CurvePath<THREE.Vector3>();
  const vertexCount = points * 2;
  const vertex = (index: number) => {
    const angle = (index / vertexCount) * Math.PI * 2;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  };
  for (let index = 0; index < vertexCount; index += 1) {
    path.add(new THREE.LineCurve3(vertex(index), vertex(index + 1)));
  }
  return path;
}

const YALLA_RED = 0xd9333f;
const YALLA_GOLD = 0xf0b64a;

function createBridgeWorld(isCompact: boolean): StoryWorld {
  const group = new THREE.Group();
  group.position.copy(STORY_POINTS[4]);
  const materials: THREE.Material[] = [];
  const journey = new THREE.Group();
  journey.rotation.set(-0.08, 0.12, 0);
  journey.position.y = -0.55;
  group.add(journey);

  // The accompanied route from Morocco (left) to a campus in China (right).
  const routeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.4, -1.1, 0.2),
    new THREE.Vector3(-2, 0.6, 0.6),
    new THREE.Vector3(0, 1.35, 0.7),
    new THREE.Vector3(2, 0.7, 0.4),
    new THREE.Vector3(3.1, -0.6, 0.1),
  ]);
  const routeMaterial = createGlowMaterial(YALLA_GOLD, 0.9);
  const routeHaloMaterial = createGlowMaterial(YALLA_RED, 0.18);
  const route = new THREE.Mesh(
    new THREE.TubeGeometry(routeCurve, isCompact ? 48 : 96, 0.03, isCompact ? 4 : 8, false),
    routeMaterial,
  );
  const routeHalo = new THREE.Mesh(
    new THREE.TubeGeometry(routeCurve, isCompact ? 32 : 64, 0.11, 6, false),
    routeHaloMaterial,
  );
  materials.push(routeMaterial, routeHaloMaterial);

  // Seven stepping stones: consultation, orientation, dossier, admission, visa, préparation, arrivée.
  const stepMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a1a10,
    emissive: YALLA_GOLD,
    emissiveIntensity: 0.5,
    metalness: 0.85,
    roughness: 0.3,
  });
  const stepRingMaterial = createGlowMaterial(YALLA_GOLD, 0.6);
  const stepGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.04, isCompact ? 10 : 18);
  const stepRingGeometry = new THREE.TorusGeometry(0.2, 0.01, 4, isCompact ? 20 : 36);
  const steps = new THREE.Group();
  const stepCount = 7;
  for (let index = 0; index < stepCount; index += 1) {
    const at = 0.08 + (index / (stepCount - 1)) * 0.84;
    const disk = new THREE.Mesh(stepGeometry, stepMaterial);
    disk.rotation.x = Math.PI / 2;
    const step = new THREE.Group();
    step.add(disk, new THREE.Mesh(stepRingGeometry, stepRingMaterial));
    routeCurve.getPointAt(at, step.position);
    step.userData.at = at;
    steps.add(step);
  }
  materials.push(stepMaterial, stepRingMaterial);

  // The student travelling the route, trust trailing behind.
  const travellerMaterial = createGlowMaterial(0xffffff, 1);
  const traveller = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), travellerMaterial);
  const trailMaterial = createGlowMaterial(YALLA_GOLD, 0.5);
  const trailGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const trail = Array.from({ length: isCompact ? 4 : 7 }, () => {
    const bead = new THREE.Mesh(trailGeometry, trailMaterial);
    journey.add(bead);
    return bead;
  });
  materials.push(travellerMaterial, trailMaterial);

  // Home: an eight-point zellige star for Morocco.
  const starMaterial = createGlowMaterial(YALLA_GOLD, 0.85);
  const star = new THREE.Group();
  const outerStar = new THREE.Mesh(
    new THREE.TubeGeometry(createStarCurve(8, 0.9, 0.58), isCompact ? 48 : 96, 0.025, 6, true),
    starMaterial,
  );
  const innerStar = new THREE.Mesh(
    new THREE.TubeGeometry(createStarCurve(8, 0.5, 0.32), isCompact ? 48 : 96, 0.018, 6, true),
    starMaterial,
  );
  innerStar.rotation.z = Math.PI / 8;
  star.add(outerStar, innerStar);
  star.position.set(-3.4, -1.1, 0.2);
  materials.push(starMaterial);

  // Arrival: a red paifang gate with gold trim and lanterns.
  const gateRedMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a1220,
    emissive: YALLA_RED,
    emissiveIntensity: 0.35,
    metalness: 0.3,
    roughness: 0.45,
  });
  const gateGoldMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a2a10,
    emissive: YALLA_GOLD,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.3,
  });
  [gateRedMaterial, gateGoldMaterial].forEach((material) => {
    material.userData.opaqueAtFullFocus = true;
  });
  const gate = new THREE.Group();
  const pillarGeometry = new THREE.BoxGeometry(0.16, 2.6, 0.16);
  [-0.9, 0.9].forEach((x) => {
    const pillar = new THREE.Mesh(pillarGeometry, gateRedMaterial);
    pillar.position.x = x;
    gate.add(pillar);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 0.22), gateRedMaterial);
  beam.position.y = 1.15;
  const upperBeam = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 0.2), gateRedMaterial);
  upperBeam.position.y = 1.55;
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-1.55, 0);
  roofShape.lineTo(-1.25, 0.28);
  roofShape.lineTo(1.25, 0.28);
  roofShape.lineTo(1.55, 0);
  roofShape.lineTo(1.2, 0.06);
  roofShape.lineTo(-1.2, 0.06);
  roofShape.closePath();
  const roof = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roofShape, { bevelEnabled: false, curveSegments: 1, depth: 0.28 }),
    gateRedMaterial,
  );
  roof.position.set(0, 1.68, -0.14);
  const trimGeometry = new THREE.BoxGeometry(2.5, 0.03, 0.24);
  [1.06, 1.24, 1.97].forEach((y) => {
    const trim = new THREE.Mesh(trimGeometry, gateGoldMaterial);
    trim.position.y = y;
    gate.add(trim);
  });
  const lanternMaterial = createGlowMaterial(YALLA_RED, 0.9);
  const lanternGeometry = new THREE.SphereGeometry(0.11, 10, 10);
  const stringGeometry = new THREE.BoxGeometry(0.01, 0.2, 0.01);
  const lanterns = new THREE.Group();
  [-0.45, 0.45].forEach((x) => {
    const lantern = new THREE.Mesh(lanternGeometry, lanternMaterial);
    lantern.position.set(x, -0.32, 0);
    const string = new THREE.Mesh(stringGeometry, gateGoldMaterial);
    string.position.set(x, -0.1, 0);
    lanterns.add(lantern, string);
  });
  lanterns.position.set(0, 1.07, 0.1);
  gate.add(beam, upperBeam, roof, lanterns);
  gate.position.set(3.1, 0.7, 0.1);
  gate.rotation.y = -0.25;
  gate.scale.setScalar(0.85);
  materials.push(gateRedMaterial, gateGoldMaterial, lanternMaterial);

  // Six campus cities gathered beyond the gate.
  const cityMaterial = createGlowMaterial(YALLA_GOLD, 0.7);
  const cityGeometry = new THREE.OctahedronGeometry(0.07, 0);
  const cities = new THREE.Group();
  [
    [3.9, 1.9, -0.8],
    [4.6, 1.1, -1.4],
    [4.3, 0.2, -0.6],
    [5, 1.8, -0.2],
    [3.6, 2.4, -1.6],
    [4.9, 0.6, -2],
  ]
    .slice(0, isCompact ? 4 : 6)
    .forEach(([x, y, z], index) => {
      const city = new THREE.Mesh(cityGeometry, cityMaterial);
      city.position.set(x, y, z);
      city.userData.baseY = y;
      city.userData.phase = index;
      cities.add(city);
    });
  materials.push(cityMaterial);

  // Visa seal stamping the midpoint of the route.
  const sealMaterial = createGlowMaterial(YALLA_GOLD, 0.8);
  const seal = new THREE.Group();
  const tickCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.14, -0.02, 0),
    new THREE.Vector3(-0.04, -0.13, 0),
    new THREE.Vector3(0.16, 0.12, 0),
  ]);
  seal.add(
    new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.018, 6, 48), sealMaterial),
    new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 6, 40), sealMaterial),
    new THREE.Mesh(new THREE.TubeGeometry(tickCurve, 12, 0.02, 6, false), sealMaterial),
  );
  routeCurve.getPointAt(0.5, seal.position);
  seal.position.y += 0.05;
  seal.position.z += 0.5;
  materials.push(sealMaterial);

  const gateLight = new THREE.PointLight(YALLA_RED, 3, 8, 2);
  gateLight.position.set(3.1, 1.2, 1.2);
  journey.add(route, routeHalo, steps, traveller, star, gate, cities, seal, gateLight);

  return {
    at: 0.79,
    group,
    materials,
    tick(time, delta, focus) {
      for (const material of [gateRedMaterial, gateGoldMaterial]) {
        syncRenderQueue(material);
      }
      const at = (time * 0.09) % 1;
      routeCurve.getPointAt(at, traveller.position);
      trail.forEach((bead, index) => {
        const behind = (((at - (index + 1) * 0.025) % 1) + 1) % 1;
        routeCurve.getPointAt(behind, bead.position);
        bead.scale.setScalar(1 - index / (trail.length + 1));
      });
      steps.children.forEach((step, index) => {
        const lit = 1 - THREE.MathUtils.smoothstep(Math.abs(at - (step.userData.at as number)), 0, 0.06);
        step.scale.setScalar(1 + lit * 0.6 * focus);
        step.children[1].rotation.z = time * 0.5 + index;
      });
      outerStar.rotation.z = time * 0.12;
      innerStar.rotation.z = Math.PI / 8 - time * 0.12;
      lanterns.rotation.z = Math.sin(time * 1.3) * 0.08;
      cities.children.forEach((city) => {
        city.position.y =
          (city.userData.baseY as number) +
          Math.sin(time * 0.8 + (city.userData.phase as number)) * 0.08;
        city.rotation.y += delta * 0.8;
      });
      const stamp = Math.pow(Math.max(0, Math.sin(time * 0.8)), 8);
      seal.scale.setScalar(1.25 - stamp * 0.3);
      sealMaterial.opacity *= 0.35 + stamp * 0.65;
      gateLight.intensity = 2 + focus * 2;
    },
  };
}

function createHorizonWorld(isCompact: boolean): StoryWorld {
  const group = new THREE.Group();
  group.position.copy(STORY_POINTS[5]);
  const materials: THREE.Material[] = [];
  const ringMaterial = createGlowMaterial(0xffd8a3, 0.72);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.55, 0.035, 8, isCompact ? 64 : 192), ringMaterial);
  materials.push(ringMaterial);

  const monolithMaterial = new THREE.MeshPhysicalMaterial({
    clearcoat: 1,
    color: 0x17120d,
    emissive: 0xff9b58,
    emissiveIntensity: 0.14,
    metalness: 0.88,
    roughness: 0.12,
  });
  const monolith = new THREE.Mesh(new THREE.BoxGeometry(0.72, 5.2, 0.32), monolithMaterial);
  monolith.position.z = -0.35;
  materials.push(monolithMaterial);

  // The signature draws itself stroke by stroke as the chapter comes into focus.
  const strokePoints: [number[], number[]][] = [
    [[-1.7, -1.3], [-0.9, 1.4]],
    [[-0.9, 1.4], [-0.1, -1.3]],
    [[-1.38, -0.22], [-0.42, -0.22]],
    [[0.4, -1.3], [0.4, 1.4]],
    [[0.4, 0.1], [1.65, 1.4]],
    [[0.55, 0.25], [1.75, -1.3]],
  ];
  const strokeCoreMaterial = createGlowMaterial(0xffffff, 0.95);
  const strokeGlowMaterial = createGlowMaterial(0xffd8a3, 0.3);
  const jointGeometry = new THREE.SphereGeometry(0.045, 10, 10);
  const signature = new THREE.Group();
  signature.position.z = 0.4;
  const tubularSegments = 24;
  const strokes = strokePoints.map(([from, to]) => {
    const start = new THREE.Vector3(from[0], from[1], 0);
    const end = new THREE.Vector3(to[0], to[1], 0);
    const curve = new THREE.LineCurve3(start, end);
    const core = new THREE.Mesh(
      new THREE.TubeGeometry(curve, tubularSegments, 0.045, 8, false),
      strokeCoreMaterial,
    );
    const glow = new THREE.Mesh(
      new THREE.TubeGeometry(curve, tubularSegments, 0.11, 8, false),
      strokeGlowMaterial,
    );
    const joint = new THREE.Mesh(jointGeometry, strokeCoreMaterial);
    joint.position.copy(end);
    signature.add(core, glow, joint);
    return { core, curve, end, glow, joint, length: start.distanceTo(end) };
  });
  const signatureLength = strokes.reduce((total, stroke) => total + stroke.length, 0);
  const penMaterial = createGlowMaterial(0xffffff, 1);
  const pen = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), penMaterial);
  signature.add(pen);
  materials.push(strokeCoreMaterial, strokeGlowMaterial, penMaterial);
  let drawnRatio = 0;
  const drawSignature = (ratio: number) => {
    let remaining = ratio * signatureLength;
    strokes.forEach((stroke) => {
      const fraction = THREE.MathUtils.clamp(remaining / stroke.length, 0, 1);
      remaining -= stroke.length;
      const coreCount = stroke.core.geometry.index?.count ?? 0;
      const glowCount = stroke.glow.geometry.index?.count ?? 0;
      stroke.core.geometry.setDrawRange(0, Math.round(coreCount * fraction));
      stroke.glow.geometry.setDrawRange(0, Math.round(glowCount * fraction));
      stroke.joint.visible = fraction >= 0.999;
      if (fraction > 0 && fraction < 0.999) {
        stroke.curve.getPointAt(fraction, pen.position);
      }
    });
    pen.visible = ratio > 0.001 && ratio < 0.999;
  };
  drawSignature(0);

  const particles = new THREE.Group();
  const particleMaterial = createGlowMaterial(0xffd8a3, 0.66);
  const particleGeometry = new THREE.SphereGeometry(0.045, isCompact ? 4 : 8, isCompact ? 4 : 8);
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
      const targetRatio = THREE.MathUtils.smoothstep(focus, 0.2, 1);
      const nextRatio = THREE.MathUtils.damp(drawnRatio, targetRatio, 3.5, delta);
      if (Math.abs(nextRatio - drawnRatio) > 0.0005) {
        drawnRatio = nextRatio;
        drawSignature(drawnRatio);
      }
      pen.scale.setScalar(1 + Math.sin(time * 6) * 0.15);
      particles.rotation.z = time * 0.025;
    },
  };
}

function createDust(random: () => number, count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const blue = new THREE.Color(0x2f80ff);
  const warm = new THREE.Color(0x88ccff);
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

function createTerrain(isCompact: boolean) {
  const geometry = new THREE.PlaneGeometry(36, 115, isCompact ? 16 : 32, isCompact ? 48 : 96);
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
    color: 0x0f2545,
    opacity: 0.04,
    transparent: true,
    wireframe: true,
  });
  const terrain = new THREE.Mesh(geometry, material);
  terrain.position.z = -43;
  return terrain;
}

const PACING_SAMPLE_FRAMES = 45;
const PACING_SLOW_FRAME_MS = 19;
const COMPACT_CAMERA_LIFT = 1.8;
const COMPACT_CAMERA_DISTANCE = 1.3;

function chapterPhase(progress: number, anchors: number[]) {
  const last = anchors.length - 1;
  if (progress <= anchors[0]) return 0;
  if (progress >= anchors[last]) return last;
  let index = 0;
  while (index < last - 1 && progress >= anchors[index + 1]) index += 1;
  return index + (progress - anchors[index]) / (anchors[index + 1] - anchors[index]);
}

function chapterColor(progress: number, target: THREE.Color) {
  const scaled = THREE.MathUtils.clamp(progress, 0, 0.9999) * (CHAPTER_COLORS.length - 1);
  const index = Math.floor(scaled);
  return target
    .copy(CHAPTER_COLORS[index])
    .lerp(CHAPTER_COLORS[Math.min(index + 1, CHAPTER_COLORS.length - 1)], scaled - index);
}

/**
 * Hands the main thread back to the browser between build steps, so a touch
 * or scroll that lands while the scene is assembling is handled right away.
 */
function yieldToMain() {
  return new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();
    channel.port2.postMessage(null);
  });
}

export async function createScrollJourneyRenderer(
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

  // Each world is a sizeable geometry build, so they are made one per task.
  const worlds: StoryWorld[] = [];
  for (const createWorld of [createOriginWorld, createNeuralWorld, createFinanceWorld, createBridgeWorld, createHorizonWorld]) {
    await yieldToMain();
    worlds.push(createWorld(isCompact));
  }
  worlds.forEach((world) => {
    world.materials.forEach((material) => {
      material.userData.baseOpacity = material.opacity;
      material.transparent = material.userData.opaqueAtFullFocus !== true;
    });
    scene.add(world.group);
  });
  // Shader programs are keyed on the scene's light count, so a light that
  // appears or disappears with its world forces every lit material to
  // recompile mid-scroll. World lights live on the scene instead and fade to
  // zero intensity when their world is out of range, keeping the count fixed.
  // Phones drop them entirely: every point light is paid for by every lit
  // pixel on screen, and the camera light already carries the chapter colour.
  scene.updateMatrixWorld(true);
  const worldLights = worlds.map((world) => {
    const lights: THREE.Light[] = [];
    world.group.traverse((object) => {
      if (object instanceof THREE.Light) lights.push(object);
    });
    if (isCompact) {
      lights.forEach((light) => light.removeFromParent());
      return [];
    }
    lights.forEach((light) => {
      scene.attach(light);
      light.intensity = 0;
    });
    return lights;
  });
  if (isCompact) {
    // A phone GPU also composites the page, so every millisecond spent here is
    // taken from scrolling. Compact worlds keep their look but shed the
    // expensive shading: no transmission pass, no clearcoat layer, one draw
    // per double-sided surface, and a single render queue per material.
    worlds.forEach((world) => {
      world.materials.forEach((material) => {
        material.userData.fixedQueue = true;
        material.transparent = true;
      });
      world.group.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
        objectMaterials.forEach((material: THREE.Material) => {
          material.forceSinglePass = true;
          if (material instanceof THREE.MeshPhysicalMaterial) {
            material.transmission = 0;
            material.clearcoat = 0;
          }
        });
      });
    });
  }
  const random = createSeededRandom(20260829);
  await yieldToMain();
  const dust = createDust(random, isCompact ? 300 : 1500);
  const terrain = createTerrain(isCompact);
  scene.add(dust, terrain);
  await yieldToMain();
  const particles = createJourneyParticles(isCompact, createSeededRandom(20260920));
  scene.add(particles.points);
  const chapterAnchors = worlds.map((world) => world.at);

  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  let postPass: ShaderPass | null = null;
  const bloomEnabled = !isCompact && window.devicePixelRatio <= 2;
  if (!isCompact) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    if (bloomEnabled) {
      bloom = new UnrealBloomPass(
        new THREE.Vector2(1, 1),
        getBloomStrength(0),
        0.78,
        0.22,
      );
      composer.addPass(bloom);
    }
    composer.addPass(new SMAAPass());
    postPass = new ShaderPass(JourneyPostShader);
    composer.addPass(postPass);
    composer.addPass(new OutputPass());
  }

  const targetCamera = new THREE.Vector3();
  const targetLook = new THREE.Vector3();
  const cameraPosition = new THREE.Vector3();
  const cameraLook = new THREE.Vector3();
  const activeColor = new THREE.Color();
  const darkColor = new THREE.Color();
  const coreColor = new THREE.Color();
  let smoothProgress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let previousTimestamp = 0;
  let viewportWidth = Math.max(1, window.innerWidth);
  let viewportHeight = Math.max(1, window.innerHeight);
  let smoothedFrameTime = 1000 / 60;
  let baseFov = 46;
  let aberration = 0;
  let pointerActive = false;
  let pointerStrength = 0;
  const cloudPosition = new THREE.Vector3();
  let qualityBudget = initialRenderQuality;
  let adaptiveQuality: AdaptiveQualityState = {
    fastFrames: 0,
    pixelRatio: initialRenderQuality.pixelRatio,
    slowFrames: 0,
  };

  const frameIntervals: number[] = [];
  let lastFrameCall = 0;
  let halfRate = false;
  let skipFrame = false;

  const applyRenderSize = (pixelRatio: number) => {
    const bloomResolutionScale = getBloomResolutionScale({
      quality: initialOptions.quality,
      width: viewportWidth,
    });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(viewportWidth, viewportHeight, false);
    composer?.setPixelRatio(pixelRatio);
    composer?.setSize(viewportWidth, viewportHeight);
    bloom?.setSize(
      Math.max(1, Math.round(viewportWidth * pixelRatio * bloomResolutionScale)),
      Math.max(1, Math.round(viewportHeight * pixelRatio * bloomResolutionScale)),
    );
  };

  let disposed = false;
  const parallelCompile = renderer.extensions.has("KHR_parallel_shader_compile");
  // Like renderer.compileAsync, but stops polling once the renderer is
  // disposed (for example by a remount while shaders are still compiling),
  // since disposal clears the programs it would be checking.
  const waitForPrograms = (materials: Set<THREE.Material>) =>
    new Promise<void>((resolve) => {
      const check = () => {
        if (disposed) return resolve();
        materials.forEach((material) => {
          const { currentProgram: program } = renderer.properties.get(material) as {
            currentProgram?: { isReady(): boolean };
          };
          if (!program || program.isReady()) materials.delete(material);
        });
        if (materials.size === 0) resolve();
        else window.setTimeout(check, 10);
      };
      if (parallelCompile) check();
      else window.setTimeout(check, 10);
    });

  return {
    /**
     * Compiles every shader the journey can need before the first frame, so
     * scrolling into a new chapter never stalls on a shader compile. Materials
     * that switch between the opaque and transparent queues get both variants.
     * Uses parallel compilation where available, so the page stays responsive.
     */
    async warmup() {
      // Desktop renders through the composer's target, which changes the
      // tone-mapping and colour-space program variants.
      const compileInto = (root: THREE.Object3D) => {
        renderer.setRenderTarget(composer ? composer.readBuffer : null);
        const materials = renderer.compile(root, camera, scene);
        renderer.setRenderTarget(null);
        return materials;
      };
      // A phone GPU compiles and composites on the same thread, so one big
      // batch freezes the page. Compile a world at a time and give the
      // compositor a few frames between batches.
      const breathe = () => new Promise<void>((resolve) => window.setTimeout(resolve, isCompact ? 60 : 0));
      const flippable = worlds.flatMap((world) =>
        world.materials.filter(
          (material) => material.userData.opaqueAtFullFocus === true && material.userData.fixedQueue !== true,
        ),
      );
      const queues = flippable.length > 0 ? [true, false] : [null];
      for (const transparent of queues) {
        if (transparent !== null) {
          flippable.forEach((material) => {
            material.transparent = transparent;
            material.needsUpdate = true;
          });
        }
        for (const world of worlds) {
          if (disposed) return;
          await waitForPrograms(compileInto(world.group));
          await breathe();
        }
        if (disposed) return;
        await waitForPrograms(compileInto(scene));
      }
    },
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
      baseFov = width >= 1024 ? 46 : 56;
      camera.fov = baseFov;
      camera.updateProjectionMatrix();
    },
    setPointer(x: number, y: number) {
      pointerActive = true;
      targetPointerX = Number.isFinite(x) ? x : 0;
      targetPointerY = Number.isFinite(y) ? y : 0;
    },
    render(timestamp: number) {
      const now = Number.isFinite(timestamp) ? timestamp : performance.now();
      if (isCompact && !halfRate) {
        // Watch the display's real frame pacing. When a phone cannot hold
        // ~52fps, its GPU is also starving page scrolling, so the scene
        // settles to a steady 30fps and gives the compositor its time back.
        if (lastFrameCall) frameIntervals.push(now - lastFrameCall);
        lastFrameCall = now;
        if (frameIntervals.length >= PACING_SAMPLE_FRAMES) {
          const sorted = [...frameIntervals].sort((a, b) => a - b);
          halfRate = sorted[Math.floor(sorted.length / 2)] > PACING_SLOW_FRAME_MS;
          frameIntervals.length = 0;
        }
      }
      if (halfRate) {
        skipFrame = !skipFrame;
        if (skipFrame) return;
      }
      const options = getOptions();
      const delta = previousTimestamp
        ? THREE.MathUtils.clamp((now - previousTimestamp) / 1000, 0, 0.05)
        : 1 / 60;
      previousTimestamp = now;
      smoothedFrameTime = THREE.MathUtils.lerp(
        smoothedFrameTime,
        (delta * 1000) / (halfRate ? 2 : 1),
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
      if (isCompact) {
        // Portrait layouts pull back so wide compositions fit the narrow field of view,
        // and drop the camera so the focal object sits above the chapter copy.
        targetCamera.sub(targetLook).multiplyScalar(COMPACT_CAMERA_DISTANCE).add(targetLook);
        targetCamera.y -= COMPACT_CAMERA_LIFT;
        targetLook.y -= COMPACT_CAMERA_LIFT;
      }
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
      coreColor.setHex(0xffffff).lerp(activeColor, 0.15);
      lineMaterial.color.lerp(coreColor, 1 - Math.exp(-delta * 3));
      haloMaterial.color.lerp(activeColor, 1 - Math.exp(-delta * 3));

      const financeFocus = 1 - THREE.MathUtils.smoothstep(Math.abs(smoothProgress - 0.55), 0.05, 0.2);
      lineMaterial.opacity = 0.92 * (1 - financeFocus * 0.21);
      haloMaterial.opacity = 0.14 * (1 - financeFocus * 0.895);
      cameraLight.color.copy(activeColor);

      const velocity = Number.isFinite(options.velocity) ? Math.abs(options.velocity) : 0;
      const energy = THREE.MathUtils.clamp(velocity / 1100, 0, 1);

      const phase = chapterPhase(smoothProgress, chapterAnchors);
      const phaseIndex = Math.min(worlds.length - 2, Math.floor(phase));
      const phaseFraction = phase - phaseIndex;
      const scatter = Math.pow(Math.sin(phaseFraction * Math.PI), 1.6);
      cloudPosition.lerpVectors(
        worlds[phaseIndex].group.position,
        worlds[phaseIndex + 1].group.position,
        THREE.MathUtils.smoothstep(phaseFraction, 0, 1),
      );
      particles.points.position.copy(cloudPosition);
      particles.points.rotation.y = Math.sin(time * 0.09) * 0.22;
      pointerStrength = THREE.MathUtils.damp(
        pointerStrength,
        pointerActive && !isCompact ? 1 : 0,
        3,
        delta,
      );
      particles.update({
        aspect: camera.aspect,
        colorA: activeColor,
        colorB: coreColor,
        energy,
        phase,
        pixelRatio: adaptiveQuality.pixelRatio,
        pointerStrength,
        pointerX,
        pointerY: -pointerY,
        scatter,
        time,
      });

      aberration = THREE.MathUtils.damp(aberration, Math.max(energy, scatter * 0.45), 4.5, delta);
      if (postPass) {
        postPass.uniforms.uAberration.value = aberration;
        postPass.uniforms.uTime.value = time;
      }
      camera.fov = THREE.MathUtils.damp(camera.fov, baseFov + energy * 6 + scatter * 2.5, 5, delta);
      camera.updateProjectionMatrix();

      pulses.forEach((pulse) => {
        const at = (time * (0.018 + energy * 0.035) + pulse.userData.offset) % 1;
        storyCurve.getPointAt(at, pulse.position);
        pulse.scale.setScalar(0.7 + energy * 1.7);
      });

      worlds.forEach((world, index) => {
        const distance = Math.abs(smoothProgress - world.at);
        world.group.visible = distance < 0.32;
        if (!world.group.visible) {
          worldLights[index].forEach((light) => {
            light.intensity = 0;
          });
          return;
        }
        const focus = 1 - THREE.MathUtils.smoothstep(distance, 0.09, 0.28);
        const visibility = 0.08 + focus * 0.92;
        world.group.scale.setScalar(0.84 + focus * 0.16);
        world.materials.forEach((material) => {
          const baseOpacity = material.userData.baseOpacity as number;
          material.opacity = baseOpacity * visibility;
        });
        world.tick(time, delta, focus);
        // Ticks set full intensity; fade it with focus so lights ease in.
        worldLights[index].forEach((light) => {
          light.intensity *= focus;
        });
      });

      dust.rotation.y = Math.sin(time * 0.035) * 0.035;
      (dust.material as THREE.PointsMaterial).opacity = 0.34 + energy * 0.18;
      terrain.position.x = Math.sin(smoothProgress * Math.PI * 3) * 0.35;
      if (bloom && bloomEnabled) bloom.strength = getBloomStrength(velocity);
      if (composer) composer.render(delta);
      else renderer.render(scene, camera);
    },
    dispose() {
      disposed = true;
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
      postPass?.dispose();
      composer?.dispose();
      renderer.dispose();
    },
  };
}
