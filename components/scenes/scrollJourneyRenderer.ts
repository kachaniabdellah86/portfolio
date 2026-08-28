/**
 * Signal Corridor: an original scroll-driven Three.js scene informed by the
 * motion language of ThreeUI's Warp Field / Hyperspace component (MIT).
 * Source reference: MengTo/threeui@326580429881c2abe7893bee53c62cbb31b6ee49
 * See THIRD_PARTY_NOTICES.md.
 */

import * as THREE from "three";

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

type ProjectStationId = "kachanios" | "aura-pay" | "yalla-china";

type ProjectStation = {
  id: ProjectStationId;
  at: number;
  group: THREE.Group;
  light: THREE.PointLight;
  baseScale: number;
};

const JOURNEY_POINTS = [
  new THREE.Vector3(0, 0.2, 18),
  new THREE.Vector3(-0.8, -0.2, 4),
  new THREE.Vector3(2.8, 0.9, -15),
  new THREE.Vector3(-3.2, -0.7, -35),
  new THREE.Vector3(2.4, 1.1, -58),
  new THREE.Vector3(-2.7, -0.8, -84),
  new THREE.Vector3(0, 0.2, -114),
];

const STATION_CONFIG: ReadonlyArray<{
  id: ProjectStationId;
  at: number;
  color: number;
  offset: THREE.Vector3;
}> = [
  {
    id: "kachanios",
    at: 0.25,
    color: 0x7aa2ff,
    offset: new THREE.Vector3(-4.2, 0.2, 0),
  },
  {
    id: "aura-pay",
    at: 0.52,
    color: 0x9d7bff,
    offset: new THREE.Vector3(4.4, -0.1, 0),
  },
  {
    id: "yalla-china",
    at: 0.79,
    color: 0xff6b55,
    offset: new THREE.Vector3(-4.1, 0.3, 0),
  },
];

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createOrbit(
  radius: number,
  color: number,
  rotation: [number, number, number],
) {
  const geometry = new THREE.TorusGeometry(radius, 0.025, 6, 96);
  const material = new THREE.MeshBasicMaterial({
    blending: THREE.AdditiveBlending,
    color,
    depthWrite: false,
    opacity: 0.72,
    transparent: true,
  });
  const orbit = new THREE.Mesh(geometry, material);
  orbit.rotation.set(...rotation);
  return orbit;
}

function addKachaniOsArtifact(group: THREE.Group, color: number) {
  const coreGeometry = new THREE.IcosahedronGeometry(1.18, 1);
  const core = new THREE.Mesh(
    coreGeometry,
    new THREE.MeshStandardMaterial({
      color: 0x111c3d,
      emissive: color,
      emissiveIntensity: 0.36,
      flatShading: true,
      metalness: 0.8,
      roughness: 0.24,
    }),
  );
  group.add(core);

  const wire = new THREE.Mesh(
    coreGeometry,
    new THREE.MeshBasicMaterial({
      color,
      opacity: 0.42,
      transparent: true,
      wireframe: true,
    }),
  );
  wire.scale.setScalar(1.12);
  group.add(wire);
  group.add(createOrbit(1.72, color, [0.5, 0.2, 0]));
  group.add(createOrbit(2.05, 0xb9c9ff, [1.15, -0.35, 0.4]));

  const nodeGeometry = new THREE.SphereGeometry(0.08, 10, 10);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xdbe6ff });
  for (let index = 0; index < 7; index += 1) {
    const angle = (index / 7) * Math.PI * 2;
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(
      Math.cos(angle) * 1.72,
      Math.sin(angle) * 1.72,
      Math.sin(angle * 2) * 0.42,
    );
    group.add(node);
  }
}

function addAuraPayArtifact(group: THREE.Group, color: number) {
  const card = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 2.8, 0.28, 3, 4, 1),
    new THREE.MeshStandardMaterial({
      color: 0x18122f,
      emissive: color,
      emissiveIntensity: 0.3,
      metalness: 0.92,
      roughness: 0.18,
    }),
  );
  card.rotation.set(0.14, -0.38, -0.08);
  group.add(card);

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.72, 0),
    new THREE.MeshStandardMaterial({
      color: 0xd7c8ff,
      emissive: color,
      emissiveIntensity: 0.8,
      metalness: 0.75,
      roughness: 0.12,
    }),
  );
  core.position.z = 0.55;
  group.add(core);
  group.add(createOrbit(1.72, color, [Math.PI / 2, 0.28, 0.1]));
  group.add(createOrbit(2.14, 0xd6c8ff, [0.32, 0.9, 0]));

  for (let index = 0; index < 4; index += 1) {
    const shard = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.2, 0),
      new THREE.MeshBasicMaterial({ color: index % 2 ? 0xffffff : color }),
    );
    const angle = (index / 4) * Math.PI * 2;
    shard.position.set(Math.cos(angle) * 2.05, Math.sin(angle) * 1.45, 0.2);
    group.add(shard);
  }
}

function addYallaChinaArtifact(group: THREE.Group, color: number) {
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.92, 0.16, 120, 10, 2, 3),
    new THREE.MeshStandardMaterial({
      color: 0xffc2a8,
      emissive: color,
      emissiveIntensity: 0.6,
      metalness: 0.72,
      roughness: 0.2,
    }),
  );
  knot.rotation.x = 0.5;
  group.add(knot);

  for (let index = 0; index < 4; index += 1) {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.8 - index * 0.35, 2.8 - index * 0.35, 0.03),
      new THREE.MeshBasicMaterial({
        color: index % 2 ? 0xffb07a : color,
        opacity: 0.34 - index * 0.04,
        transparent: true,
        wireframe: true,
      }),
    );
    frame.position.z = -0.55 + index * 0.38;
    frame.rotation.z = index * 0.16;
    group.add(frame);
  }
  group.add(createOrbit(2.02, 0xffb07a, [0.85, 0.34, 0.2]));
}

function createProjectStation(
  curve: THREE.CatmullRomCurve3,
  config: (typeof STATION_CONFIG)[number],
) {
  const anchor = new THREE.Group();
  const pathPosition = curve.getPointAt(config.at);
  anchor.position.copy(pathPosition).add(config.offset);
  anchor.userData.projectId = config.id;

  const portal = createOrbit(2.68, config.color, [0, 0, 0]);
  portal.material.opacity = 0.25;
  anchor.add(portal);

  if (config.id === "kachanios") addKachaniOsArtifact(anchor, config.color);
  if (config.id === "aura-pay") addAuraPayArtifact(anchor, config.color);
  if (config.id === "yalla-china") addYallaChinaArtifact(anchor, config.color);

  const light = new THREE.PointLight(config.color, 3.8, 15, 2);
  light.position.set(0, 0, 2.4);
  anchor.add(light);

  return {
    id: config.id,
    at: config.at,
    group: anchor,
    light,
    baseScale: config.id === "aura-pay" ? 0.92 : 1,
  } satisfies ProjectStation;
}

function createDust(random: () => number, count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const blue = new THREE.Color(0x5b8fff);
  const violet = new THREE.Color(0x9d7bff);
  const color = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (random() - 0.5) * 22;
    positions[offset + 1] = (random() - 0.5) * 14;
    positions[offset + 2] = 24 - random() * 148;
    color.copy(blue).lerp(violet, random());
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
    opacity: 0.62,
    size: 0.045,
    transparent: true,
    vertexColors: true,
  });
  return new THREE.Points(geometry, material);
}

function createWarpStreaks(random: () => number, count: number) {
  const positions = new Float32Array(count * 6);
  for (let index = 0; index < count; index += 1) {
    const offset = index * 6;
    const x = (random() - 0.5) * 20;
    const y = (random() - 0.5) * 12;
    const z = 22 - random() * 146;
    const length = 0.4 + random() * 2.8;
    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    positions[offset + 3] = x;
    positions[offset + 4] = y;
    positions[offset + 5] = z - length;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    blending: THREE.AdditiveBlending,
    color: 0x9bb9ff,
    depthWrite: false,
    opacity: 0.16,
    transparent: true,
  });
  return new THREE.LineSegments(geometry, material);
}

export function createScrollJourneyRenderer(
  canvas: HTMLCanvasElement,
  getOptions: () => ScrollJourneyOptions,
) {
  const initialOptions = getOptions();
  const isCompact = initialOptions.quality === "compact";
  const random = createSeededRandom(20260828);
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isCompact,
    canvas,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.setClearColor(0x030610, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030610);
  scene.fog = new THREE.FogExp2(0x030610, 0.023);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.08, 190);
  const curve = new THREE.CatmullRomCurve3(
    JOURNEY_POINTS,
    false,
    "catmullrom",
    0.34,
  );

  scene.add(new THREE.HemisphereLight(0x7598ff, 0x02030a, 1.35));
  const cameraLight = new THREE.PointLight(0x8aa7ff, 2.4, 24, 2);
  scene.add(cameraLight);

  const pathMesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, isCompact ? 120 : 220, 0.016, 5, false),
    new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: 0x6f8fff,
      depthWrite: false,
      opacity: 0.38,
      transparent: true,
    }),
  );
  scene.add(pathMesh);

  const gateCount = isCompact ? 18 : 30;
  const gateMaterial = new THREE.MeshBasicMaterial({
    blending: THREE.AdditiveBlending,
    color: 0xffffff,
    depthWrite: false,
    opacity: 0.16,
    transparent: true,
  });
  const gates = new THREE.InstancedMesh(
    new THREE.TorusGeometry(3.35, 0.028, 6, isCompact ? 48 : 80),
    gateMaterial,
    gateCount,
  );
  const transform = new THREE.Object3D();
  const forward = new THREE.Vector3(0, 0, 1);
  const quaternion = new THREE.Quaternion();
  const gateColor = new THREE.Color();
  for (let index = 0; index < gateCount; index += 1) {
    const at = 0.035 + (index / Math.max(1, gateCount - 1)) * 0.93;
    transform.position.copy(curve.getPointAt(at));
    quaternion.setFromUnitVectors(forward, curve.getTangentAt(at).normalize());
    transform.quaternion.copy(quaternion);
    const pulse = 0.84 + Math.sin(index * 1.7) * 0.12;
    transform.scale.setScalar(pulse);
    transform.updateMatrix();
    gates.setMatrixAt(index, transform.matrix);
    gateColor.set(index % 5 === 0 ? 0xb69cff : 0x507fff);
    gates.setColorAt(index, gateColor);
  }
  gates.instanceMatrix.needsUpdate = true;
  if (gates.instanceColor) gates.instanceColor.needsUpdate = true;
  scene.add(gates);

  const dust = createDust(random, isCompact ? 1100 : 2600);
  const streaks = createWarpStreaks(random, isCompact ? 180 : 460);
  scene.add(dust, streaks);

  const stations = STATION_CONFIG.map((config) =>
    createProjectStation(curve, config),
  );
  stations.forEach((station) => scene.add(station.group));

  const targetPosition = new THREE.Vector3();
  const targetLookAt = new THREE.Vector3();
  const cameraPosition = new THREE.Vector3();
  const cameraLookAt = new THREE.Vector3();
  let smoothProgress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let previousTimestamp = 0;

  return {
    resize(width: number, height: number) {
      const desktop = width >= 1024;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, desktop ? 1.5 : 1.15),
      );
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.fov = desktop ? 58 : 66;
      camera.updateProjectionMatrix();
    },
    setPointer(x: number, y: number) {
      pointerTargetX = x;
      pointerTargetY = y;
    },
    render(timestamp: number) {
      const options = getOptions();
      const safeTimestamp = typeof timestamp === 'number' && !Number.isNaN(timestamp) ? timestamp : performance.now();
      const isFirstFrame = previousTimestamp === 0;
      const delta = previousTimestamp
        ? Math.max(0, Math.min((safeTimestamp - previousTimestamp) / 1000, 0.05))
        : 0;
      previousTimestamp = safeTimestamp;

      const rawProgress = typeof options.progress === 'number' && Number.isFinite(options.progress) ? options.progress : 0;
      const clampedProgress = THREE.MathUtils.clamp(rawProgress, 0, 1);
      
      // If delta is somehow NaN or 0, alpha is 0
      let progressAlpha = 1 - Math.exp(-(delta || 0) * 7.5);
      if (!Number.isFinite(progressAlpha)) progressAlpha = 1;
      
      if (!Number.isFinite(smoothProgress)) smoothProgress = 0;
      
      smoothProgress = THREE.MathUtils.lerp(
        smoothProgress,
        clampedProgress,
        progressAlpha,
      );
      
      const targetPointerX = typeof pointerTargetX === 'number' && !Number.isNaN(pointerTargetX) ? pointerTargetX : 0;
      const targetPointerY = typeof pointerTargetY === 'number' && !Number.isNaN(pointerTargetY) ? pointerTargetY : 0;
      
      if (Number.isNaN(pointerX)) pointerX = 0;
      if (Number.isNaN(pointerY)) pointerY = 0;
      
      pointerX = THREE.MathUtils.damp(pointerX, targetPointerX, 5, delta || 0.016);
      pointerY = THREE.MathUtils.damp(pointerY, targetPointerY, 5, delta || 0.016);

      let pathAt = 0.012 + smoothProgress * 0.968;
      if (!Number.isFinite(pathAt)) {
         pathAt = 0.012;
         smoothProgress = 0;
      }
      
      const lookAt = Math.min(0.998, pathAt + (isCompact ? 0.025 : 0.018));
      
      const pointPosition = curve.getPointAt(pathAt);
      if (pointPosition) targetPosition.copy(pointPosition);
      
      const pointLookAt = curve.getPointAt(lookAt);
      if (pointLookAt) targetLookAt.copy(pointLookAt);
      
      targetPosition.x += pointerX * 0.18;
      targetPosition.y -= pointerY * 0.12;
      targetLookAt.x += pointerX * 0.26;
      targetLookAt.y -= pointerY * 0.18;

      if (isFirstFrame || cameraPosition.lengthSq() === 0) {
        cameraPosition.copy(targetPosition);
        cameraLookAt.copy(targetLookAt);
      } else {
        cameraPosition.lerp(targetPosition, 1 - Math.exp(-delta * 9));
        cameraLookAt.lerp(targetLookAt, 1 - Math.exp(-delta * 11));
      }
      camera.position.copy(cameraPosition);
      camera.lookAt(cameraLookAt);
      camera.rotation.z +=
        Math.sin(smoothProgress * Math.PI * 5) * 0.018 + pointerX * 0.012;
      cameraLight.position.copy(camera.position);

      const rawVelocity = Number.isNaN(options.velocity) ? 0 : options.velocity;
      const velocityEnergy = Math.min(1, Math.abs(rawVelocity) / 1200);
      gateMaterial.opacity = 0.13 + velocityEnergy * 0.2;
      (streaks.material as THREE.LineBasicMaterial).opacity =
        0.12 + velocityEnergy * 0.52;
      (dust.material as THREE.PointsMaterial).opacity = 0.5 + velocityEnergy * 0.25;
      streaks.scale.z = 1 + velocityEnergy * 2.4;

      stations.forEach((station, index) => {
        const distance = Math.abs(smoothProgress - station.at);
        const focus = THREE.MathUtils.smoothstep(0.19 - distance, 0, 0.19);
        const scale = station.baseScale * (0.84 + focus * 0.16);
        station.group.scale.setScalar(scale);
        station.group.rotation.y += delta * (0.08 + focus * 0.34) * (index % 2 ? -1 : 1);
        station.group.rotation.x = Math.sin(timestamp * 0.00022 + index) * 0.08;
        station.light.intensity = 2.2 + focus * 5.8;
      });

      renderer.render(scene, camera);
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
          const objectMaterials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          objectMaterials.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    },
  };
}
