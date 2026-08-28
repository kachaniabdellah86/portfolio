# Abdellah Kachani — Portfolio

A motion-led product design and front-end portfolio built with Next.js 16,
React 19, TypeScript, Tailwind CSS, Motion, and Lenis.

## Local development

Use Node.js 20 or newer and npm:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The main page composition
lives in `app/page.tsx`; reusable sections and interactive case-study previews
live in `components/`.

## Quality checks

Run the release gate before shipping:

```bash
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

The project currently has no separate automated unit or end-to-end test suite.
Interactive flows should also be checked in a real browser at mobile, tablet,
and desktop widths, including with reduced motion enabled.

## Scene behavior

The ambient layer is a dynamically loaded, scroll-driven Three.js journey. The
camera travels through a spline corridor and three project-specific 3D stations
using the normalized Lenis page progress without rerendering React. Render
density is capped by device class, and the loop pauses when the tab is hidden.
Reduced-motion visitors and failed WebGL contexts receive a static CSS corridor
without initializing the renderer. Third-party source attribution lives in
`THIRD_PARTY_NOTICES.md`.
