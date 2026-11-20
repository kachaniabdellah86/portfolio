# DESIGN.md: Kachani, indigo heat

The single source of truth for the portfolio's look and motion. Read before changing any page.

## Brief

- **Subject:** Abdellah Kachani, creative and full-stack web developer in Agadir, Morocco.
- **Audiences, split by language:**
  - `/fr`: Moroccan small businesses (hotels, agencies, shops).
  - `/en`: studios, agencies and startups hiring remotely.
- **Job:** get booked. Every page ends on one way to start: WhatsApp, email or the brief.
- **Real assets:**
  - Yalla China and FICAM, with real screenshots
  - two concepts and five experiments (on `/lab`)
  - one portrait
- **Placeholders (owner to replace):**
  - the portrait: sunglasses
  - the testimonial: empty until Aymane's real quote arrives
  - more projects
- **Direction chosen by the owner (2026-11-19):** "Bold graphic, like Melon Studio". The earlier "Agadir granary wall" home (flat CSS cells) was rejected as basic.

## Concept card

```
Idea:        The name in the Agadir heat. One bold field of indigo, the name KACHANI set huge, and the air above it shimmering like heat over the Souss in summer. Work is shown big and real, and it bends like paper in that heat when you scroll fast.
Metaphor:    summer heat haze over Agadir; the indigo of Amazigh dye and the painted doors of the south.
Signature:   the wordmark rendered in WebGL. A heat-haze displacement flows through the letters at rest and swells around the pointer (on touch, around the last tap and the scroll speed). The DOM h1 stays underneath for search and assistive tech.
Emotion:     loud, warm, confident. A brand, not a template.
Motion verb: shimmer and bend. Things ripple and settle (expo out); project screens bend with scroll velocity and spring back flat.
Screenshot:  the full indigo field with KACHANI melting at the edges, plus one plain line: "I design and build websites that sell."
```

**Anchors:**
- the owner's name
- Agadir's climate
- indigo, the Amazigh dye and door colour of the region

**Kept from the granary concept:** the 404 ("This cell was never built") and the Tifinagh word ⴰⴳⴰⴷⵉⵔ as a small signature.

## Art direction

### Palette

| Role | Hex | Use |
|---|---|---|
| field (indigo) | `#2133F0` | hero, offers band, finale; the brand |
| ink | `#F4EFE6` | text on field and on night |
| night | `#0C0B10` | the work section and case studies |
| muted | `rgb(244 239 230 / 0.86)` | secondary text (AA on both grounds) |
| line | `rgb(244 239 230 / 0.18)` | hairlines |
| saffron | `#FF9E2C` | rare marks: the availability dot, focus ring. Taliouine saffron comes from the Souss |

Colour changes between sections are a background tween on one variable. They are never hard cuts.

### Type

| Role | Family | Use |
|---|---|---|
| display | **Tanker** (Fontshare) | the wordmark and section titles; condensed heavy poster face. Wordmark: uppercase, fills the width, line-height 0.78 |
| text and UI | **General Sans** 400/500/600 | body 16 to 18 px; nav 15 px |
| meta | **JetBrains Mono** | clock, location, availability, counters (as Melon uses Geist Mono) |
| accent | **Noto Sans Tifinagh** | ⴰⴳⴰⴷⵉⵔ only |

### Layout

- **Grid:** 12 columns, gutter `clamp(1rem, .6rem + 1.6vw, 2.5rem)`.
- **Hero:** a poster. The wordmark fills the width at the top; the plain line sits bottom left; the meta sits bottom right.
- **Work:** large screens, 8 columns, alternating sides, with the title and year in the gutter column. The screens bend.
- **Offers:** an index list on indigo.
- **Footer:** a finale on indigo with a giant "LET'S TALK" in Tanker.

### Motion

- **Eases:** `expo.out` and `expo.inOut`.
- **Hovers:**
  - primary buttons: the fill floods from the pointer side
  - nav: an underline draws
  - project screens: a slight lift
- **Reveals:** masked line reveals for display type.
- **Transitions:** an indigo curtain wipes up, then lifts.
- **Idle:** the heat haze flows slowly through the wordmark (GSAP ticker, paused off screen, none under reduced motion).
- **Performance budget:**
  - one WebGL canvas for the wordmark, one for the bending screens
  - device pixel ratio at most 1.5
  - lazy-loaded three.js
  - render only while visible

## Decisions log

- **2026-11-18:** first rebuild ("Agadir granary wall", light limewash, CSS cells). The engine, QA setup, case-page structure and 404 remain from it.
- **2026-11-19:** the owner rejected the wall as basic and chose "Bold graphic (Melon)". The home was rebuilt on indigo, Tanker and WebGL.
- **Unchanged rules:**
  - the native cursor stays visible
  - no em or en dashes in visible copy
  - the header steps aside on scroll down
- **QA:** run `node ~/.claude/skills/awwwards/scripts/shoot.mjs http://127.0.0.1:3001/en --crawl --nav` and `audit.mjs`. Output goes to `.shots/`. Playwright's bundled Chromium is installed.
- 2026-11-19 (film pass, owner: "everything linked together like a film"): night loader wipes up onto the indigo field; KACHANI condenses out of the heat when the loader lifts and melts upward on scroll (`HeatWord mode="hero"`); statement reads word by word (scrubbed); screens rise into frame bottom-up (`uReveal`) and the clicked screen grows into the case study (shared-element cut in `motion/setup.ts`); process steps light in order; offer rows slide in; finale "LET'S TALK" condenses from the same heat (`HeatWord mode="finale"`). Choreography lives in `motion/choreo.ts`.
- 2026-11-19 (resident robot, owner's request): an original chibi robot modelled in code (`components/kachani/Robot.tsx`, mounted in the layout so it survives page transitions). Brand colours, saffron scarf and antenna as its signature (owner's reference was a stock model: style followed, design not copied). Movement is a pure function of scroll (owner: "synchronize the scrolling with the robot walking", no timed loops): it sits on the K at scroll 0; each `[data-robot-anchor]` spot gets an arrival scroll (when it reaches 62% of the viewport); the robot rests on each spot for 14% of a viewport of scroll, then walks the straight line to the next. Steps are counted from distance covered (one stride per ~1/3 robot height), so the legs always match its speed.
- 2026-11-19 (the guide; owner: robot "pixelated", "not part of the experience", "does not match the vibe"; chose "Guide + shortcuts" and "Flat poster style"):
  - **Look:** flat poster. Cream body, night ink outlines (inverted hull), saffron eyes, scarf and antenna; two-step toon shading, no shine, no gradients. On night grounds the outline turns indigo so the silhouette holds. Rendered antialiased at device pixel ratio (up to 2.5x), so it stays sharp on retina.
  - **Job:** every spot has one useful line (`data-robot-say`), shown in a speech bubble when it rests there, for 6 s (4 s on touch), then it goes quiet until the next spot. Hovering or focusing anything with `data-robot-react` (screens, price rows, WhatsApp, the brief, the lab) makes it point at that thing and say what happens next.
  - **Bubble placement:** right, left, above, or hanging below the feet, whichever covers the least text (paragraphs, headings, list items, `.g-btn`, `.g-link`). The wordmarks do not count.
  - **Shortcuts:** the robot is a button ("Open the guide's shortcuts"). The menu offers Start a project (WhatsApp), See the work, Prices, Back to top; Escape or a click outside closes it. From a case study, Work and Prices are page links that land on the section: the engine remembers the hash (`setPendingHash`), also across the router's full-reload fallback, which drops it. The header's section links use the same path.
  - **Spots stand in empty space:** the first project's spot is mid-screen (the section note sits above the right side); timeline stops sit at the right end of each column. Check any new anchor with spot screenshots at 1280, 1440, 1920 and 390 wide.
  - **Entrances:** on a first visit it arrives 0.9 s after the loader lifts, once the wordmark has condensed. It hides (and leaves the tab order) while a page has no spots, so it never parks in a corner under the page-change curtain.
  - Size about 96 to 126 px on desktop, 76 px on phones; half-rate redraw when idle; static under reduced motion.
- 2026-11-19 (the guide's paths; owner: "it still feels like it's floating", "make every page like the first page", then "it disappears without a reason and it's not synchronized with the scrolling, the robot should always be seen"). Path logic in `components/kachani/robotRoute.ts`, scenes and page measuring in `Robot.tsx`.
  - **Three hard rules, enforced in the code, not by tuning:**
    1. Always fully visible: at every scroll position its feet are inside a band (below the header with room for its head, above the bottom edge), and its body stays inside the window sideways (a wall at the window's edge is climbed on its front edge). Each move must end inside the band when it gets there; a backward pass from the bottom of the page keeps that true to the last pixel. On screen always wins over speed.
    2. Scroll = movement: every move is timed by scroll (no waiting while the page scrolls, no timers). Speed limits: about 3 px of path per px of scroll walking, 6 hopping. It talks only when the visitor stops: the line of the section it is in, once per section.
    3. Grounded: it walks on titles, words, hairlines, the foot of KACHANI and the tops of screens and the photo; it goes down by climbing down the side of a screen or the photo (hand over hand), or by hopping down a step of at most about a third of the screen. Screens and the photo are left from their nearer edge.
  - **Every page gets a path** from its own content (titles, screens, photos, images, hairlines; sticky and fixed things never count, since they move with the scroll). Positions come from the layout (offsetTop chain), so reveal animations never move the path. A path that does change (images loading) is glided to, not snapped. It starts sitting on the K (home) or on the first title, and ends on the lowest ledge, or on a floor at the very bottom of the page when nothing lower would still be in view.
  - **One way of moving per section** (`data-robot-scene` on the anchor, or automatic):
    - hero: sits on the K, hops down behind it and walks the foot of KACHANI behind the letters (the guide's layer sits just under the wordmark canvas, `z-index` 2 vs 3), lingering and turning to the visitor where the letters open up
    - statement (`read`): a staircase down the right ends of the lines, one line per step as each line finishes lighting up (word-to-word hopping was rejected: it zipped back across the screen on every line)
    - work screens (`surf`): rides each screen's top edge to the far side, knees bent, arms out, leaning with scroll speed, then climbs down the nearer side
    - prices (`rows`): hops down the price rows, pointing at each price when the visitor stops there
    - process (`.k-steps`): walks the line above the steps in time with them lighting up; case facts (`.g-case__facts`): walked as a line, ending at the "it's live" stop
    - about: climbs onto the photo frame (sits there when the visitor stops); finale: perches on the last letter of LET'S TALK (`glyph-last`); footer: the end of the tour
  - Verified with a rules check over whole pages in 60 px steps (home, both case studies, /lab, /studios; 1440 x 900 and 390 x 844): 0 steps not fully visible, 0 steps still while scrolling, no jumps. `?guide-debug` in the URL exposes the computed path as `window.__guide`.
- 2026-11-19 (engine): links that change the locale (`/en` ↔ `/fr`) do a full page load. The locale segment keys the root layout, so an in-page transition remounted the engine mid-way and left the new page black. Same-language links keep the curtain transition.
