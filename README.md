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

The opening is a dynamically loaded, scroll-driven Three.js story. A continuous
signal line connects five authored worlds: the first spark, KachaniOS, Aura Pay,
Yalla China, and an open horizon. Normalized journey progress drives camera
composition, object focus, lighting, bloom, and color without rerendering React.
Render density is capped by device class, and the loop pauses when the tab is
hidden. Reduced-motion visitors and failed WebGL contexts receive a static
timeline composition without initializing the renderer.
