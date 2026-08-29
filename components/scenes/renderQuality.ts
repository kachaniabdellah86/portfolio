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

type JourneyRuntimeInput = {
  contextAvailable: boolean;
  documentHidden: boolean;
  journeyVisible: boolean;
};

export function getRenderQuality({
  devicePixelRatio,
  quality,
  width,
}: RenderQualityInput): RenderQualitySettings {
  const safePixelRatio = Number.isFinite(devicePixelRatio)
    ? Math.max(1, devicePixelRatio)
    : 1;
  // High DPI devices (3x+) or mobile tablets should reduce quality to conserve battery
  const isHighDensity = safePixelRatio > 2;
  const maxPixelRatio = isHighDensity
    ? 1.25
    : width >= 768 && quality === "full"
      ? 1.75
      : 1.5;
  const minBudget =
    isHighDensity || quality === "compact"
      ? 1
      : width >= 768
        ? 1.25
        : 1.15;
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
  if (frameTimeMs > 20) {
    const slowFrames = state.slowFrames + 1;
    if (slowFrames < 24) {
      return { ...state, fastFrames: 0, slowFrames };
    }
    return {
      fastFrames: 0,
      pixelRatio: Math.max(minPixelRatio, state.pixelRatio - 0.25),
      slowFrames: 0,
    };
  }

  if (frameTimeMs < 17.5) {
    const fastFrames = state.fastFrames + 1;
    if (fastFrames < 180) {
      return { ...state, fastFrames, slowFrames: 0 };
    }
    return {
      fastFrames: 0,
      pixelRatio: Math.min(targetPixelRatio, state.pixelRatio + 0.25),
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
