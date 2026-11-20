// The guide's path. Three hard rules (owner: "the robot should always be seen", "synchronized with
// the scrolling", and earlier "it feels like it's floating"):
//   1. Always visible: its whole body stays on screen, below the header, at every scroll position.
//   2. Scroll = movement: every bit of scroll moves it along its path (walk, climb, hop). It never
//      stands still while the page scrolls, and never makes one long fast jump.
//   3. Grounded: it walks on real things (letters, words, titles, screen and photo edges,
//      hairlines). To go down it climbs down the side of a screen or the photo, or hops down a
//      short step. Each section adds its own way of moving (see Robot.tsx, "scenes").
// Position is a pure function of scroll; nothing here runs on a timer.

// A ledge is something it can stand on (page coordinates). A thin one (a hairline) can be stepped
// off anywhere; a solid one only at its ends; a block (screen, photo) also has a wall to climb.
export type Ledge = { id: string; y: number; left: number; right: number; thin?: boolean; bottom?: number };
export type Waypoint = {
  x: number;
  ledge: Ledge;
  s?: number; // scroll at which to be here (a scene's own timing, e.g. as a word lights up)
  move?: "walk" | "surf" | "jump"; // how it travels here along the same ledge
  idle?: string; // pose when the visitor stops scrolling here: sit | perch | wave
  say?: string; // the section's line, said when the visitor stops scrolling in this section
  point?: Element | null; // something to point at when the visitor stops here
};
export type Word = {
  top: number; // page y of the cap tops
  baseline: number; // page y the letters stand on
  left: number;
  right: number;
  perchX: number;
  open: (x: number) => number; // 0 = behind a letter, 1 = fully visible gap
};
export type Sample = {
  x: number;
  y: number; // page y of the feet
  pose: string; // walk | surf | jump | climb | sit | stand
  side: number; // climbing: which side the wall is on (-1 left, 1 right)
  behind: boolean; // drawn behind the wordmark
  peek: number;
  say: string;
  sayId: number;
  point: Element | null;
  idle: string; // pose to take if the visitor stops here
  none?: boolean;
};
type Geo = { x: number; y: number; pose: string; side?: number; behind?: boolean; peek?: number };
type Leg = { s0: number; s1: number; at: (f: number) => Geo };
export type Route = { legs: Leg[]; says: { s: number; say: string; id: number }[]; marks: { s: number; point?: Element | null; idle?: string }[] };

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Band = { top: number; bottom: number; aim: number }; // feet y limits on screen

export function buildRoute(points: Waypoint[], ledges: Ledge[], word: Word | null, o: { vh: number; robotW: number; maxScroll: number; band: Band }): Route {
  const { vh, robotW, maxScroll, band } = o;
  const route: Route = { legs: [], says: [], marks: [] };
  if (!points.length && !word) return route;

  // ── 1. Geometry: a chain of legs from the first stop to the last ────────────
  type Raw = { kind: string; at: (f: number) => Geo; x0: number; y0: number; x1: number; y1: number; target?: number; wp?: Waypoint; span?: number };
  const raw: Raw[] = [];
  const reach = vh * 0.36; // the tallest step it hops down in one go
  const add = (r: Raw) => raw.push(r);
  const walk = (x0: number, x1: number, y: number, pose = "walk", wp?: Waypoint) => {
    if (Math.abs(x1 - x0) < 2 && !wp) return;
    add({ kind: pose, x0, y0: y, x1, y1: y, wp, target: wp?.s, at: (f) => ({ x: lerp(x0, x1, f), y, pose }) });
  };
  const hop = (x0: number, y0: number, x1: number, y1: number, wp?: Waypoint) => {
    const lift = clamp(Math.abs(x1 - x0) * 0.25 + 14, 18, 70);
    add({ kind: "jump", x0, y0, x1, y1, wp, target: wp?.s, at: (f) => ({ x: lerp(x0, x1, f), y: lerp(y0, y1, f * f * 0.5 + f * 0.5) - lift * 4 * f * (1 - f), pose: "jump" }) });
  };
  const climb = (x: number, y0: number, y1: number, side: number) =>
    add({ kind: "climb", x0: x, y0, x1: x, y1, at: (f) => ({ x, y: lerp(y0, y1, f), pose: "climb", side }) });

  let cur: { x: number; y: number; ledge: Ledge | null };
  const first = points[0];
  if (word) {
    // ── Hero: sit on the K, hop down behind it, weave along the foot of KACHANI ──
    route.marks.push({ s: 0, idle: "sit" });
    add({ kind: "rest", x0: word.perchX, y0: word.top, x1: word.perchX, y1: word.top, span: vh * 0.04, at: () => ({ x: word.perchX, y: word.top, pose: "sit" }) });
    const landX = word.perchX + robotW * 0.55;
    add({
      kind: "jump",
      x0: word.perchX,
      y0: word.top,
      x1: landX,
      y1: word.baseline,
      span: vh * 0.08,
      at: (f) => ({ x: lerp(word.perchX, landX, f), y: lerp(word.top, word.baseline, f * f) - Math.sin(Math.PI * f) * robotW * 0.5 * (1 - f), pose: "jump", behind: true }),
    });
    const endX = word.right + Math.min(robotW * 0.45, 60);
    const xs: number[] = [];
    const cum: number[] = [0];
    for (let x = landX; x <= endX; x += 4) xs.push(x);
    for (let j = 1; j < xs.length; j++) cum.push(cum[j - 1] + 1 + 3 * word.open(xs[j]) ** 2); // linger in the gaps
    const total = cum[cum.length - 1] || 1;
    add({
      kind: "weave",
      x0: landX,
      y0: word.baseline,
      x1: endX,
      y1: word.baseline,
      at: (f) => {
        const c = f * total;
        let lo = 0;
        let hi = cum.length - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (cum[mid] < c) lo = mid + 1;
          else hi = mid;
        }
        const x = xs[lo] ?? endX;
        return { x, y: word.baseline, pose: "walk", behind: x < word.right + robotW * 0.4, peek: word.open(x) };
      },
    });
    cur = { x: endX, y: word.baseline, ledge: { id: "foot", y: word.baseline, left: word.left, right: endX } };
  } else if (first) {
    add({ kind: "rest", x0: first.x, y0: first.ledge.y, x1: first.x, y1: first.ledge.y, span: vh * 0.04, wp: first, at: () => ({ x: first.x, y: first.ledge.y, pose: "stand" }) });
    cur = { x: first.x, y: first.ledge.y, ledge: first.ledge };
  } else return route;

  // Which end to leave a ledge from: mostly the nearer one (no long walks back), a little toward B.
  const edgeCost = (e: number, towardX: number) => Math.abs(cur.x - e) + 0.3 * Math.abs(towardX - e);
  const edgeOf = (L: Ledge, towardX: number) => (edgeCost(L.left + 8, towardX) <= edgeCost(L.right - 8, towardX) ? L.left + 8 : L.right - 8);
  const sorted = [...ledges].sort((p, q) => p.y - q.y);

  // Down from `cur` to waypoint B: climb walls, hop short steps, never a long drop if avoidable.
  const descend = (B: Waypoint) => {
    for (let guard = 0; guard < 40; guard++) {
      const L = cur.ledge;
      // On a block whose wall reaches down toward B: walk to its edge and climb down the side.
      if (L && L.bottom !== undefined && L.bottom - cur.y > vh * 0.16 && B.ledge.y > L.bottom - 4) {
        const right = edgeCost(L.right, B.x) < edgeCost(L.left, B.x);
        const side = right ? 1 : -1;
        const ex = (right ? L.right : L.left) + side * robotW * 0.3;
        walk(cur.x, ex, cur.y);
        climb(ex, cur.y, L.bottom, -side);
        cur = { x: ex, y: L.bottom, ledge: null };
        continue;
      }
      const dir = Math.sign(B.x - cur.x) || 1;
      const gap = B.ledge.y - cur.y;
      // The next step down: the farthest ledge within reach, else the nearest one below.
      const cands = sorted.filter((l) => l.y > cur.y + vh * 0.05 && l.y < B.ledge.y - vh * 0.05 && l.id !== L?.id && l.id !== B.ledge.id);
      const within = cands.filter((l) => l.y - cur.y <= reach);
      const next = gap <= reach ? null : within.length ? within[within.length - 1] : cands[0] ?? null;
      const target = next ?? B.ledge;
      // Leave a solid ledge from its end; a hairline can be stepped off anywhere.
      if (L && !L.thin && Math.abs(target.y - cur.y) > 4) {
        const ex = edgeOf(L, next ? (target.left + target.right) / 2 : B.x);
        walk(cur.x, ex, cur.y);
        cur = { ...cur, x: ex };
      }
      const land = clamp(next ? lerp(cur.x, B.x, 0.4) : lerp(cur.x, B.x, 0.7), target.left + 10, target.right - 10);
      void dir;
      if (!next) {
        // Landing right on the stop: the hop itself carries the stop's timing (no standing still).
        if (Math.abs(B.x - land) < 6) hop(cur.x, cur.y, B.x, B.ledge.y, B);
        else {
          hop(cur.x, cur.y, land, B.ledge.y);
          walk(land, B.x, B.ledge.y, B.move ?? "walk", B);
        }
        cur = { x: B.x, y: B.ledge.y, ledge: B.ledge };
        return;
      }
      hop(cur.x, cur.y, land, target.y);
      let x = land;
      if (target.thin) {
        x = clamp(lerp(land, B.x, 0.5), target.left + 12, target.right - 12);
        walk(land, x, target.y);
      }
      cur = { x, y: target.y, ledge: target };
    }
  };

  const rest = word ? points : points.slice(1);
  for (const wp of rest) {
    if (cur.ledge && wp.ledge.id === cur.ledge.id) {
      const pose = wp.move ?? "walk";
      if (pose === "jump") hop(cur.x, cur.y, wp.x, wp.ledge.y, wp);
      else walk(cur.x, wp.x, wp.ledge.y, pose, wp);
      cur = { x: wp.x, y: wp.ledge.y, ledge: wp.ledge };
    } else {
      descend(wp);
    }
  }

  // ── 2. Timing: scroll drives every leg, and the band keeps it on screen ──────
  const SPEED = { walk: 1.7, surf: 1.25, weave: 2.4 } as Record<string, number>;
  let s = 0;
  const times: number[] = [];
  const minDur: number[] = [];
  const floorAt: number[] = [];
  raw.forEach((r, idx) => {
    const s0 = s;
    let want: number;
    const dy = r.y1 - r.y0;
    const dx = Math.abs(r.x1 - r.x0);
    if (r.span !== undefined) want = s0 + r.span;
    else if (r.target !== undefined) want = Math.max(s0 + 4, r.target);
    else if (r.kind === "climb") want = lerp(s0 + dy, r.y1 - band.aim, 0.6); // ~1:1 with the scroll, drifting to the aim line
    else if (r.kind === "jump") want = clamp(lerp(s0 + vh * 0.05 + Math.abs(dy) * 0.35, r.y1 - band.aim, 0.5), s0 + vh * 0.04, s0 + vh * 0.06 + Math.abs(dy) * 0.7);
    else want = s0 + dx / (SPEED[r.kind] ?? 1.7);
    // Never faster than it can visibly move: walking ~3 px of path per px of scroll, hops ~6.
    const dist = Math.hypot(r.x1 - r.x0, dy);
    const vmax = r.kind === "jump" ? 6 : r.kind === "weave" ? 5.5 : 3;
    want = Math.max(want, s0 + dist / vmax);
    // The band: where each move ends must be on screen when it gets there (its feet between
    // band.top and band.bottom). The start already was, and in between it moves in a line.
    const lo = r.y1 - band.bottom;
    const hi = r.y1 - band.top;
    let s1 = clamp(want, lo, Math.max(lo, hi));
    // Nothing finishes after the bottom of the page (the last move ends exactly there).
    s1 = Math.min(s1, maxScroll - (raw.length - 1 - idx) * 2);
    s1 = Math.max(s1, s0 + 1);
    minDur.push(Math.min(vh * 0.3, dist / vmax));
    floorAt.push(lo);
    times.push(s1);
    s = s1;
  });
  // Backward pass from the bottom of the page: every move keeps its minimum time, so nothing is
  // crammed into the last pixels (earlier moves finish a little sooner instead).
  for (let i = times.length - 1; i >= 0; i--) {
    const limit = i === times.length - 1 ? maxScroll : times[i + 1] - minDur[i + 1];
    times[i] = Math.max(floorAt[i], Math.min(times[i], limit)); // on screen always wins over speed
  }
  for (let i = 0; i < times.length; i++) times[i] = Math.max(times[i], (i ? times[i - 1] : 0) + 1);
  if (times.length) times[times.length - 1] = Math.max(times[times.length - 1], maxScroll);

  let prev = 0;
  let sayId = 0;
  raw.forEach((r, i) => {
    const s0 = prev;
    const s1 = times[i];
    route.legs.push({ s0, s1, at: r.at });
    if (r.wp?.say) route.says.push({ s: s0, say: r.wp.say, id: ++sayId });
    if (r.wp && (r.wp.point || r.wp.idle)) route.marks.push({ s: s1, point: r.wp.point, idle: r.wp.idle });
    prev = s1;
  });
  return route;
}

export function sampleRoute(route: Route, scroll: number, vh: number): Sample | null {
  const legs = route.legs;
  if (!legs.length) return null;
  let geo: Geo | null = null;
  if (scroll <= legs[0].s0) geo = legs[0].at(0);
  else {
    for (const leg of legs) {
      if (scroll < leg.s1) {
        geo = leg.at(leg.s1 > leg.s0 ? clamp((scroll - leg.s0) / (leg.s1 - leg.s0), 0, 1) : 1);
        break;
      }
    }
    geo ??= legs[legs.length - 1].at(1);
  }
  // The section's line: the last one passed.
  let say = "";
  let sayId = 0;
  for (const s of route.says) if (s.s <= scroll + vh * 0.02) ({ say, id: sayId } = s);
  // What to point at / how to pose if the visitor stops right here.
  let point: Element | null = null;
  let idle = "";
  for (const m of route.marks) {
    if (Math.abs(m.s - scroll) < vh * 0.07) {
      point = m.point ?? point;
      idle = m.idle ?? idle;
    }
  }
  return { x: geo.x, y: geo.y, pose: geo.pose, side: geo.side ?? 0, behind: Boolean(geo.behind), peek: geo.peek ?? 0, say, sayId, point, idle };
}

// ── Measuring the page ─────────────────────────────────────────────

const measureCtx = () => document.createElement("canvas").getContext("2d")!;

/** Letter geometry of a wordmark, matching how HeatWord draws it (ink centred in the text box). */
export function wordGeometry(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const box = range.getBoundingClientRect();
  if (!box.width) return null;
  const s = getComputedStyle(el);
  const ctx = measureCtx();
  ctx.font = `${s.fontWeight} ${parseFloat(s.fontSize)}px ${s.fontFamily}`;
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = s.letterSpacing === "normal" ? "0px" : s.letterSpacing;
  const label = (el.textContent ?? "").toUpperCase();
  const m = ctx.measureText(label);
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const baseline = cy + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  const x0 = cx - m.width / 2;
  const chars = [...label].map((_, i) => ({
    left: x0 + ctx.measureText(label.slice(0, i)).width,
    right: x0 + ctx.measureText(label.slice(0, i + 1)).width,
  }));
  return { ctx, label, x0, baseline, top: baseline - m.actualBoundingBoxAscent, left: x0, right: x0 + m.width, chars, font: ctx.font, size: parseFloat(s.fontSize) };
}

/** How open each column is in the band the robot occupies at the foot of the word. */
export function wordOpenness(g: NonNullable<ReturnType<typeof wordGeometry>>, band: number) {
  const scale = 0.25;
  const w = Math.max(1, Math.ceil((g.right - g.left + 80) * scale));
  const h = Math.max(1, Math.ceil(band * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.font = g.font;
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = (g.ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing ?? "0px";
  ctx.scale(scale, scale);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#000";
  ctx.fillText(g.label, 40, band); // the word's left edge sits 40 px in; its baseline at the band's foot
  const data = ctx.getImageData(0, 0, w, h).data;
  const open = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    let empty = 0;
    for (let y = 0; y < h; y++) if (data[(y * w + x) * 4 + 3] < 100) empty++;
    open[x] = empty / h;
  }
  const originX = g.left - 40;
  return (x: number) => {
    // Average over the robot's body width (about 40 px), so a sliver of gap does not count.
    let sum = 0;
    let n = 0;
    for (let dx = -20; dx <= 20; dx += 4) {
      const i = Math.round((x + dx - originX) * scale);
      sum += i >= 0 && i < w ? open[i] : 1;
      n++;
    }
    return sum / n;
  };
}

/** The last line of a paragraph, plus how far right the lines above reach within `height` (so
 *  the robot can stand on that baseline without its head covering the line above). */
export function lastLine(p: HTMLElement, height: number) {
  const range = document.createRange();
  range.selectNodeContents(p);
  const rects = [...range.getClientRects()].filter((r) => r.width > 1);
  if (!rects.length) return null;
  const bottom = Math.max(...rects.map((r) => r.bottom));
  const onLine = rects.filter((r) => Math.abs(r.bottom - bottom) < 4);
  const size = parseFloat(getComputedStyle(p).fontSize);
  const right = Math.max(...onLine.map((r) => r.right));
  const above = rects.filter((r) => r.bottom < bottom - 4 && r.bottom > bottom - height);
  const clear = Math.max(right, ...above.map((r) => r.right));
  return { left: Math.min(...onLine.map((r) => r.left)), right, clear, baseline: bottom - size * 0.2 };
}
