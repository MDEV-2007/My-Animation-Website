# ODYSSEY — The Journey of a Software Engineer

A cinematic, scroll-driven WebGL portfolio. The camera flies through seven
worlds — a code-particle genesis, a Forest of Logic, an Ocean of Data,
Mountains of Challenges, a Cosmic AI galaxy, the Developer, and a Skills
solar system — before landing on a holographic contact console.

Built with **Next.js 16 · React 19 · Three.js · React Three Fiber · Drei ·
GSAP-ready · Lenis smooth scroll · Framer Motion · Tailwind · Post-processing
(Bloom / Vignette / Noise)** and hand-written **GLSL shaders**.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 — click **Enter the universe**, then scroll.

Production build:

```bash
npm run build && npm start
```

## Make it yours

Everything personal lives in a few places:

| What | File |
| --- | --- |
| Your name | `NAME` in `src/components/Overlay.jsx` |
| Roles that cycle | `ROLES` in `src/components/RoleCycler.jsx` |
| Projects (3D cubes) | `PROJECTS` in `src/scenes/ProjectsWorld.jsx` |
| Skills / planets | `PLANETS` in `src/scenes/SkillsWorld.jsx` |
| Ambient sound design | `WORLDS` in `src/lib/audio.js` |
| Contact email + social links | contact `<form>` + footer in `src/components/Overlay.jsx` |
| Boot terminal lines | `LINES` in `src/components/BootSequence.jsx` |

## How it's wired

- `src/lib/state.js` — a single mutable `stage` signal (scroll progress, eased
  progress, pointer, time). It is **never** React state, so it can be read every
  frame with zero re-renders.
- `src/components/StageProvider.jsx` — Lenis smooth scroll + pointer tracking,
  both written into `stage`.
- `src/components/Experience.jsx` — the one persistent `<Canvas>`: a camera rig
  that dollies along a Z track by scroll, all worlds, and the post-processing.
- `src/scenes/*` — each world. `GlowField.jsx` is a reusable GPU particle
  system; every world just supplies a `builder(i)` that shapes its constellation.
- `src/components/Overlay.jsx` — the scrolling HTML narrative, aligned so each
  block of typography sits over its matching world. The overlay is
  `pointer-events-none` so the 3D project cubes stay clickable; only real
  controls (links, form, buttons) re-enable pointer events.
- `src/scenes/ProjectsWorld.jsx` — interactive holographic project cubes. Hover
  gives weight; click pulls one to the camera, tints the world in its colour and
  opens a detail panel (drei `Html`). Scrolling out auto-closes it.
- `src/lib/audio.js` — a fully procedural Web Audio engine (no sound files). An
  evolving pad chord + filtered noise bed morph per world; the boot "Enter"
  gesture starts it (autoplay policy) and the top-left button mutes it.

## Tuning the journey

World positions and reveal timings are aligned by progress value (0→1):

- Camera track length: `TRACK` in `Experience.jsx`.
- Where each world sits: the `Z` map in `Experience.jsx`.
- When each world fades in/out: the `useActOpacity(start, end)` call at the top
  of each scene file.

Keep a world's `Z = camZ(center)` and its `useActOpacity` band centered on the
same progress value as its Overlay section, and the camera will fly through it
exactly as the matching text scrolls into view.
