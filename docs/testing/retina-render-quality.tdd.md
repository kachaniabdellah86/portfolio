# Motion render quality — TDD evidence

## Source and user journey

The tests cover full-desktop supersampling, conservative compact rendering,
sustained adaptive-quality hysteresis, motion-driven bloom limits, and journey
visibility behavior.

## RED / GREEN report

- **RED 1:** 6 of 15 tests failed under the prior policy: desktop DPR remained
  at native density, slow frames reduced quality after 24 classifications in
  0.25 steps, and recovery still required 180 smooth classifications.
- **GREEN 1:** 15 of 15 tests passed after the desktop DPR target and adaptive
  thresholds were updated.
- **RED 2:** the suite failed at module instantiation because the tested bloom
  policy helpers did not yet exist.
- **GREEN 2:** 17 of 17 tests passed after the renderer adopted the bounded
  bloom-strength and resolution-scale helpers.
- **Coverage:** `node --test --experimental-test-coverage
  --disable-warning=MODULE_TYPELESS_PACKAGE_JSON
  components/scenes/renderQuality.test.mjs` passed 17/17 tests with 100% line,
  96.88% branch, and 100% function coverage for `renderQuality.ts`.

## Test specification

| # | Guarantee | Test type | Result |
| --- | --- | --- | --- |
| 1 | DPR=1 full desktops render at 1.4; moderate DPR desktops receive a bounded boost | Unit | PASS |
| 2 | Full desktop output never exceeds 1.8 DPR | Boundary | PASS |
| 3 | Compact and narrow layouts retain conservative DPR targets | Unit | PASS |
| 4 | Invalid device-pixel ratios produce finite conservative output | Error boundary | PASS |
| 5 | Fewer than 72 slow classifications do not reduce DPR | Unit | PASS |
| 6 | Sustained slow frames reduce DPR by only 0.1 | Unit | PASS |
| 7 | Ninety smooth classifications restore DPR by 0.1 | Unit | PASS |
| 8 | Adaptive DPR respects its minimum and resists alternating-frame oscillation | Boundary | PASS |
| 9 | Bloom remains 0.66–0.72 across the velocity range | Unit | PASS |
| 10 | Full desktop uses a 0.70 bloom scale while compact/narrow stays at 0.55 | Unit | PASS |
| 11 | Hidden, off-screen, or context-lost journeys stop rendering | Unit | PASS |

## Additional verification

- `npx tsc --noEmit` — PASS
- `npm run lint` — PASS
- `npm run build` — PASS

## Known gap

Automated tests verify the policy and production integration. Browser motion QA
was not completed because no controllable browser was available in the session;
real-device visual inspection remains required.

## Merge evidence

No checkpoint commits were created; the working tree remains available for the
user to review and commit with the rest of the scroll-journey redesign.
