import assert from "node:assert/strict";
import test from "node:test";

import {
  getRenderQuality,
  shouldRunJourney,
  updateAdaptiveQuality,
} from "./renderQuality.ts";

test("uses a Retina drawing buffer on high-density desktop displays", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: 3, quality: "full", width: 1440 }),
    { antialias: true, minPixelRatio: 1, pixelRatio: 1.25, samples: 0 },
  );
});

test("keeps a crisp buffer on high-density mobile displays", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: 3, quality: "compact", width: 390 }),
    { antialias: true, minPixelRatio: 1, pixelRatio: 1.25, samples: 0 },
  );
});

test("does not waste GPU work by upscaling a standard-density display", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: 1, quality: "full", width: 1366 }),
    { antialias: true, minPixelRatio: 1, pixelRatio: 1, samples: 0 },
  );
});

test("uses the narrow full-quality budget below tablet width", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: 3, quality: "full", width: 640 }),
    { antialias: true, minPixelRatio: 1, pixelRatio: 1.25, samples: 0 },
  );
});

test("falls back safely when the browser reports an invalid pixel ratio", () => {
  assert.deepEqual(
    getRenderQuality({ devicePixelRatio: Number.NaN, quality: "compact", width: 390 }),
    { antialias: true, minPixelRatio: 1, pixelRatio: 1, samples: 0 },
  );
});

test("reduces resolution only after sustained slow frames", () => {
  let state = { fastFrames: 0, pixelRatio: 1.75, slowFrames: 0 };
  for (let frame = 0; frame < 23; frame += 1) {
    state = updateAdaptiveQuality(state, {
      frameTimeMs: 24,
      minPixelRatio: 1.25,
      targetPixelRatio: 1.75,
    });
  }
  assert.equal(state.pixelRatio, 1.75);
  state = updateAdaptiveQuality(state, {
    frameTimeMs: 24,
    minPixelRatio: 1.25,
    targetPixelRatio: 1.75,
  });
  assert.equal(state.pixelRatio, 1.5);
});

test("recovers quality after sustained smooth frames", () => {
  let state = { fastFrames: 0, pixelRatio: 1.25, slowFrames: 0 };
  for (let frame = 0; frame < 180; frame += 1) {
    state = updateAdaptiveQuality(state, {
      frameTimeMs: 16.7,
      minPixelRatio: 1.25,
      targetPixelRatio: 1.75,
    });
  }
  assert.equal(state.pixelRatio, 1.5);
});

test("never reduces below the configured minimum", () => {
  let state = { fastFrames: 0, pixelRatio: 1.25, slowFrames: 23 };
  state = updateAdaptiveQuality(state, {
    frameTimeMs: 30,
    minPixelRatio: 1.25,
    targetPixelRatio: 1.75,
  });
  assert.equal(state.pixelRatio, 1.25);
});

test("resets adaptation counters inside the neutral frame-time band", () => {
  const state = updateAdaptiveQuality(
    { fastFrames: 80, pixelRatio: 1.5, slowFrames: 12 },
    { frameTimeMs: 18, minPixelRatio: 1.25, targetPixelRatio: 1.75 },
  );
  assert.deepEqual(state, { fastFrames: 0, pixelRatio: 1.5, slowFrames: 0 });
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
