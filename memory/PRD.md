# РАНТЕХ — ПНДВ4 Scroll Experience (PRD)

## Original problem statement
Premium landing page for РАНТЕХ (https://runtch.ru/), Russian language. Stack: Vite + vanilla JS (no React), Three.js, GSAP + ScrollTrigger, Lenis. A DC/DC converter (ПНДВ4) sits centre-stage; scroll drives branching callouts that describe it (data only from provided images); converter rotates and branches/info change each scroll. Minimalist liquid-glass, fogged background. Stability & performance first: semantics, visible keyboard focus, decorative canvas, all meaning in HTML. prefers-reduced-motion → static frame, no Lenis/scroll, content visible; no-WebGL → CSS composition (dot pattern under soft mask + silver glow). No content beyond the image data. Production build at the end.

## Architecture / stack
- Vite (vanilla JS) served on port 3000 via supervisor `yarn start` (script repurposed craco→vite). Config: `vite.config.mjs`.
- Modules: `index.html`, `src/main.js`, `src/webgl/` (scene.js + fog.glsl.js shaders), `src/motion/` (intro.js reveal, scroll.js choreography), `src/branches.js` (SVG connectors), `src/styles/` (tokens, base, components, sections).
- No backend/DB used (static experience). FastAPI/Mongo left untouched.

## User choices (from user)
- No form — only the scroll converter.
- Stylized 3D converter built in Three.js (black body, gold pins, logo).
- Content strictly the image data (ПНДВ4 specs).
- Light theme + brand orange #EA5B29 + minimalist foggy liquid-glass background.
- Logo + "РАНТЕХ" on the module and in the top-left header (header logo without black chip).

## Core content (only allowed data)
ПНДВ4 (РТШН.436630.003 ТУ). Power 4 Вт (КПД до 80%, protections, no-load operation). Input «E» 4,5–15В / «A» 9–36В / «B» 18–75В. Output 3,3;5;9;12;15;24;27;48 В. Temp −60…+125 °C. Size 32×19×7,5 мм. Warranty 15 лет. Pin-to-pin replacement of MGDM-4 Gaia Converter.

## Implemented (2026-06)
- Fixed decorative Three.js scene: detailed ПНДВ4 (physical black body, machined metal top rim, corner hex bolts, cooling fins, side cable-entry connectors with brushed rings, ventilation grille, gold pins, РАНТЕХ logo on top+front), liquid-glass fbm fog shader (light), soft form-revealing lighting.
- Scroll choreography (Lenis + GSAP ScrollTrigger): converter rotates with scroll; 4 spec chapters each reveal one glass callout card + an animated orange PCB-style SVG branch projected from a 3D anchor; HUD chapter index + progress bar; hero masked line reveal + model entrance; outro "15 лет" + catalog CTA.
- Declarative active-chapter logic (viewport-centre based) → exactly one card visible even on fast/teleport scroll (no pile-up, no jump/disappear).
- Header: transparent runner mark + dark "РАНТЕХ" text (no black chip).
- Accessibility: semantic sections, all text in HTML, focusable cards (tabindex), orange focus-visible outline. prefers-reduced-motion → CSS static composition (dot pattern + silver/orange glow) + real product photo, all cards visible, no Lenis/canvas. no-WebGL → same CSS fallback.
- Verified in real headless Chrome at 1440×900, 1280×720, 768×1024, 375×812: no horizontal overflow, single card per chapter, fast down/up sweep clean, reduced-motion correct, zero app console errors/warnings (only headless SwiftShader GPU-fallback messages, absent on real GPUs).
- Production build in `dist/`.

## Backlog / possible next
- P2: optional sound/haptic cue on chapter change.
- P2: preloader with brand animation.
- P2: real GLB model swap if provided.

## Test credentials
None — no authentication/backend in this experience.
