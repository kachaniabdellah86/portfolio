export type RenderQuality = "compact" | "full";

type RenderQualityInput = {
  devicePixelRatio: number;
  quality: RenderQuality;
  width: number;
};

export type RenderQualitySettings = {
  antialias: true;
  minPixelRatio: number;
  pixelRatio: number;
  samples: 0;
};

export type AdaptiveQualityState = {
  fastFrames: number;
  pixelRatio: number;
  slowFrames: number;
};

type AdaptiveQualityInput = {
  frameTimeMs: number;
  minPixelRatio: number;
  targetPixelRatio: number;
};

type BloomResolutionInput = {
  quality: RenderQuality;
  width: number;
};

type JourneyRuntimeInput = {
  contextAvailable: boolean;
  documentHidden: boolean;
  journeyVisible: boolean;
};

const SLOW_FRAME_TIME_MS = 22;
const FAST_FRAME_TIME_MS = 18;
// React to sustained slowness within ~0.5s, in a few large steps.
const SLOW_FRAME_LIMIT = 24;
const FAST_FRAME_LIMIT = 120;
const PIXEL_RATIO_STEP = 0.15;

function roundPixelRatio(pixelRatio: number) {
  return Math.round(pixelRatio * 100) / 100;
}

export function getBloomResolutionScale({
  quality,
  width,
}: BloomResolutionInput) {
  return quality === "full" && width >= 768 ? 0.5 : 0.45;
}

export function getBloomStrength(velocity: number) {
  const safeVelocity = Number.isFinite(velocity) ? Math.abs(velocity) : 0;
  const motionEnergy = Math.min(safeVelocity / 1100, 1);
  return roundPixelRatio(0.66 + motionEnergy * 0.06);
}

export function getRenderQuality({
  devicePixelRatio,
  quality,
  width,
}: RenderQualityInput): RenderQualitySettings {
  const safePixelRatio = Number.isFinite(devicePixelRatio)
    ? Math.max(1, devicePixelRatio)
    : 1;
  const isFullDesktop = width >= 768 && quality === "full";
  if (isFullDesktop) {
    // Never above the screen's own density: supersampling a full-screen scene
    // with bloom and post passes cost ~2x the pixels for an edge gain SMAA
    // already gives. Under load it may drop below native; the bloom hides it.
    const pixelRatio = Math.min(1.5, safePixelRatio);
    return {
      antialias: true,
      minPixelRatio: roundPixelRatio(Math.max(0.75, pixelRatio * 0.7)),
      pixelRatio,
      samples: 0,
    };
  }

  // Phones render at CSS resolution: the GPU that draws this canvas also
  // composites the page, and scrolling must never wait on the 3D.
  if (quality === "compact") {
    return {
      antialias: true,
      minPixelRatio: 0.8,
      pixelRatio: 1,
      samples: 0,
    };
  }

  // Narrow full-quality layouts stay bounded to protect GPU and battery budgets.
  const isHighDensity = safePixelRatio > 2;
  const maxPixelRatio = isHighDensity ? 1.25 : 1.5;
  const minBudget = isHighDensity ? 1 : 1.15;
  const pixelRatio = Math.min(safePixelRatio, maxPixelRatio);

  return {
    antialias: true,
    minPixelRatio: Math.min(pixelRatio, minBudget),
    pixelRatio,
    samples: 0,
  };
}

export function updateAdaptiveQuality(
  state: AdaptiveQualityState,
  { frameTimeMs, minPixelRatio, targetPixelRatio }: AdaptiveQualityInput,
): AdaptiveQualityState {
  if (frameTimeMs > SLOW_FRAME_TIME_MS) {
    const slowFrames = state.slowFrames + 1;
    if (slowFrames < SLOW_FRAME_LIMIT) {
      return { ...state, fastFrames: 0, slowFrames };
    }
    return {
      fastFrames: 0,
      pixelRatio: Math.max(
        minPixelRatio,
        roundPixelRatio(state.pixelRatio - PIXEL_RATIO_STEP),
      ),
      slowFrames: 0,
    };
  }

  // Quality only ever steps down. Every step reallocates the canvas and every
  // post-processing target, a stall that itself reads as slow frames, so
  // climbing back up made the resolution oscillate and the scroll stutter.
  if (frameTimeMs < FAST_FRAME_TIME_MS) {
    return {
      ...state,
      fastFrames: Math.min(state.fastFrames + 1, FAST_FRAME_LIMIT),
      pixelRatio: Math.min(targetPixelRatio, state.pixelRatio),
      slowFrames: 0,
    };
  }

  return { ...state, fastFrames: 0, slowFrames: 0 };
}

export function shouldRunJourney({
  contextAvailable,
  documentHidden,
  journeyVisible,
}: JourneyRuntimeInput) {
  return contextAvailable && !documentHidden && journeyVisible;
}
