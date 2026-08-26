export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const PRELOAD_COUNT_MS = 1400;
export const PRELOAD_HOLD_MS = 350;

const PRELOAD_TOTAL_S = (PRELOAD_COUNT_MS + PRELOAD_HOLD_MS) / 1000;
const HERO_LEAD_IN_S = 0.25;

export const HERO_INTRO_DELAY = PRELOAD_TOTAL_S + HERO_LEAD_IN_S;
