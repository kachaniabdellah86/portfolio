# Adaptive render quality — TDD evidence

## Source and user journey

The tests cover the two user-visible requirements for the scroll-driven 3D
story: its thin geometry must remain crisp on high-density displays, and it
must adapt its GPU cost when a visitor's device cannot sustain a smooth frame
rate. The renderer must also stop when the journey is not visible.

## RED / GREEN report

- **RED 1:** the initial quality tests failed because the shared render-quality
  policy did not exist.
- **GREEN 1:** the tests passed after `getRenderQuality` and the adaptive
  frame-time controller were added to the renderer and composer.
- **RED 2:** the runtime test failed because `shouldRunJourney` was not exported.
- **GREEN 2:** the full suite passed after the visibility policy was implemented
  and wired to the journey's intersection state.
- **Coverage:** `node --test --experimental-test-coverage
  --disable-warning=MODULE_TYPELESS_PACKAGE_JSON
  components/scenes/renderQuality.test.mjs` passed 10/10 tests with 100% line,
  branch, and function coverage for `renderQuality.ts` at implementation time.

## Test specification

| # | Guarantee | Test type | Result |
| --- | --- | --- | --- |
| 1 | High-density desktop displays use a crisp, capped 1.75× drawing buffer | Unit | PASS |
| 2 | High-density compact displays retain antialiasing at a capped 1.5× | Unit | PASS |
| 3 | Standard-density displays are not unnecessarily upscaled | Unit | PASS |
| 4 | Narrow full-quality viewports use the compact GPU budget | Boundary | PASS |
| 5 | Invalid device-pixel ratios fall back safely to 1× | Error boundary | PASS |
| 6 | Sustained slow frames reduce resolution in controlled 0.25× steps | Unit | PASS |
| 7 | Sustained smooth frames recover resolution without oscillation | Unit | PASS |
| 8 | Adaptive resolution never falls below its quality floor | Boundary | PASS |
| 9 | Neutral frame times reset adaptation counters | Unit | PASS |
| 10 | Hidden, off-screen, or context-lost journeys stop rendering | Unit | PASS |

## Additional verification

- `npx tsc --noEmit` — PASS
- `npm run lint` — PASS
- `npm run build` — PASS

## Known gap

Automated tests verify the quality and runtime policies and production
integration. A real-device visual check is still required to measure perceived
sharpness and frame pacing on the visitor's specific GPU and display.

## Merge evidence

No checkpoint commits were created; the working tree remains available for the
user to review and commit with the rest of the scroll-journey redesign.
