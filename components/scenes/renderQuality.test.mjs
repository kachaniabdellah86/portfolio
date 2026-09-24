import assert from "node:assert/strict";
import test from "node:test";

import {
  getBloomResolutionScale,
  getBloomStrength,
  getRenderQuality,
  shouldRunJourney,
  updateAdaptiveQuality,
} from "./renderQuality.ts";

test("mildly supersamples a standard-density desktop", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: 1, quality: "full", width: 1920 }),
    { antialias: true, minPixelRatio: 1.25, pixelRatio: 1.4, samples: 0 },
  );
});

test("gives moderate-density desktops a bounded supersampling boost", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: 1.25, quality: "full", width: 1440 }),
    { antialias: true, minPixelRatio: 1.25, pixelRatio: 1.5, samples: 0 },
  );
});

test("never exceeds the full desktop DPR cap", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: 3, quality: "full", width: 1440 }),
    { antialias: true, minPixelRatio: 1.25, pixelRatio: 1.8, samples: 0 },
  );
});

test("renders phones at CSS resolution, whatever their density", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: 3, quality: "compact", width: 390 }),
    { antialias: true, minPixelRatio: 0.8, pixelRatio: 1, samples: 0 },
  );
});

test("does not supersample a standard-density compact display", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: 1, quality: "compact", width: 390 }),
    { antialias: true, minPixelRatio: 0.8, pixelRatio: 1, samples: 0 },
  );
});

test("uses the conservative quality budget below tablet width", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: 3, quality: "full", width: 640 }),
    { antialias: true, minPixelRatio: 1, pixelRatio: 1.25, samples: 0 },
  );
});

test("falls back safely for invalid reported pixel ratios", () => {
  for (const devicePixelRatio of [Number.NaN, Number.POSITIVE_INFINITY, 0, -2]) {
    assert.deepEqual(
      getRenderQuality({ devicePixelRatio, quality: "compact", width: 390 }),
      { antialias: true, minPixelRatio: 0.8, pixelRatio: 1, samples: 0 },
    );
  }
});

test("ignores a short burst of slow averaged frames", () => {
  let state = { fastFrames: 0, pixelRatio: 1.8, slowFrames: 0 };
  for (let frame = 0; frame < 71; frame += 1) {
    state = updateAdaptiveQuality(state, {
      frameTimeMs: 24,
      minPixelRatio: 1.25,
      targetPixelRatio: 1.8,
    });
  }
  assert.equal(state.pixelRatio, 1.8);
});

test("reduces resolution in a subtle step after sustained slow frames", () => {
  let state = { fastFrames: 0, pixelRatio: 1.8, slowFrames: 0 };
  for (let frame = 0; frame < 72; frame += 1) {
    state = updateAdaptiveQuality(state, {
      frameTimeMs: 24,
      minPixelRatio: 1.25,
      targetPixelRatio: 1.8,
    });
  }
  assert.equal(state.pixelRatio, 1.7);
});

test("a brief spike interrupted by normal frames does not accumulate pressure", () => {
  let state = { fastFrames: 0, pixelRatio: 1.8, slowFrames: 0 };
  for (let burst = 0; burst < 6; burst += 1) {
    for (let frame = 0; frame < 20; frame += 1) {
      state = updateAdaptiveQuality(state, {
        frameTimeMs: 24,
        minPixelRatio: 1.25,
        targetPixelRatio: 1.8,
      });
    }
    state = updateAdaptiveQuality(state, {
      frameTimeMs: 19,
      minPixelRatio: 1.25,
      targetPixelRatio: 1.8,
    });
  }
  assert.equal(state.pixelRatio, 1.8);
});

test("recovers quality after sustained smooth frames", () => {
  let state = { fastFrames: 0, pixelRatio: 1.6, slowFrames: 0 };
  for (let frame = 0; frame < 90; frame += 1) {
    state = updateAdaptiveQuality(state, {
      frameTimeMs: 16.7,
      minPixelRatio: 1.25,
      targetPixelRatio: 1.8,
    });
  }
  assert.equal(state.pixelRatio, 1.7);
});

test("never reduces below the configured minimum", () => {
  let state = { fastFrames: 0, pixelRatio: 1.3, slowFrames: 71 };
  state = updateAdaptiveQuality(state, {
    frameTimeMs: 30,
    minPixelRatio: 1.25,
    targetPixelRatio: 1.8,
  });
  assert.equal(state.pixelRatio, 1.25);
});

test("alternating slow and fast frames do not cause quality oscillation", () => {
  let state = { fastFrames: 0, pixelRatio: 1.6, slowFrames: 0 };
  for (let frame = 0; frame < 240; frame += 1) {
    state = updateAdaptiveQuality(state, {
      frameTimeMs: frame % 2 === 0 ? 24 : 16.7,
      minPixelRatio: 1.25,
      targetPixelRatio: 1.8,
    });
  }
  assert.deepEqual(state, { fastFrames: 1, pixelRatio: 1.6, slowFrames: 0 });
});

test("resets adaptation counters inside the neutral frame-time band", () => {
  const state = updateAdaptiveQuality(
    { fastFrames: 80, pixelRatio: 1.5, slowFrames: 12 },
    { frameTimeMs: 19, minPixelRatio: 1.25, targetPixelRatio: 1.8 },
  );
  assert.deepEqual(state, { fastFrames: 0, pixelRatio: 1.5, slowFrames: 0 });
});

test("keeps the bloom core stable with only a modest motion contribution", () => {
  assert.equal(getBloomStrength(0), 0.66);
  assert.equal(getBloomStrength(550), 0.69);
  assert.equal(getBloomStrength(1100), 0.72);
  assert.equal(getBloomStrength(5000), 0.72);
  assert.equal(getBloomStrength(Number.NaN), 0.66);
});

test("raises bloom resolution only for full desktop mode", () => {
  assert.equal(getBloomResolutionScale({ quality: "full", width: 1440 }), 0.7);
  assert.equal(getBloomResolutionScale({ quality: "full", width: 640 }), 0.55);
  assert.equal(getBloomResolutionScale({ quality: "compact", width: 390 }), 0.55);
});

test("stops the GPU loop when the journey or document is not visible", () => {
  assert.equal(
    shouldRunJourney({ contextAvailable: true, documentHidden: false, journeyVisible: true }),
    true,
  );
  assert.equal(
    shouldRunJourney({ contextAvailable: true, documentHidden: false, journeyVisible: false }),
    false,
  );
  assert.equal(
    shouldRunJourney({ contextAvailable: true, documentHidden: true, journeyVisible: true }),
    false,
  );
  assert.equal(
    shouldRunJourney({ contextAvailable: false, documentHidden: false, journeyVisible: true }),
    false,
  );
});
