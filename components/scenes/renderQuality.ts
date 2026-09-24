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
const SLOW_FRAME_LIMIT = 72;
const FAST_FRAME_LIMIT = 90;
const PIXEL_RATIO_STEP = 0.1;

function roundPixelRatio(pixelRatio: number) {
  return Math.round(pixelRatio * 100) / 100;
}

export function getBloomResolutionScale({
  quality,
  width,
}: BloomResolutionInput) {
  return quality === "full" && width >= 768 ? 0.7 : 0.55;
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
    return {
      antialias: true,
      minPixelRatio: 1.25,
      pixelRatio: Math.min(1.8, Math.max(1.4, safePixelRatio + 0.25)),
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

  if (frameTimeMs < FAST_FRAME_TIME_MS) {
    const fastFrames = state.fastFrames + 1;
    if (fastFrames < FAST_FRAME_LIMIT) {
      return { ...state, fastFrames, slowFrames: 0 };
    }
    return {
      fastFrames: 0,
      pixelRatio: Math.min(
        targetPixelRatio,
        roundPixelRatio(state.pixelRatio + PIXEL_RATIO_STEP),
      ),
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
