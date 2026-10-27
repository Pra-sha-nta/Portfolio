# prashantaparajuli.com.np

Personal portfolio for Prashanta Parajuli, Associate QA Engineer.

Astro + Tailwind v4, with a cinematic editorial look: near-black canvas, ivory
type, Anton display headings and film grain. No client framework.

Motion is split by job so the two libraries never animate the same property:

- GSAP + ScrollTrigger + SplitText (`src/scripts/cinema.ts`): hero opening,
  section headings, scroll reveals, the pinned platform reel.
- Motion, the Framer Motion package (`src/scripts/ui.ts`): hover and press
  feedback, nav indicator, mobile menu, the contact overlay.
- `src/scripts/flashlight.ts`: the reusable torch reveal (`Flashlight.astro`),
  rAF driven, with a touch mode, a "lights on" toggle and a low-power fallback.
- `src/scripts/collab.ts`: the hand-and-strings hire section.

Everything respects `prefers-reduced-motion`, and content stays readable if a
script fails (an inline watchdog removes the hidden entrance states).

## Commands

| Command | Does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server on `localhost:4321` |
| `npm run build` | Production build to `dist/` |
| `npm run check` | Type check (`astro check`) |
| `npm run preview` | Preview the built site |
| `node scripts/make-og.mjs` | Regenerate `public/og.png` |

## Content

Every factual claim on the site comes from `src/data/content.ts`. It is the
single source of truth and is traced to the CV in `public/`. Edit content there,
not in the components.

## QA scripts

Require a build served locally (`npx serve -l 4321 dist`).

- `node scripts/shoot.mjs http://127.0.0.1:4321/ ./shots` - responsive capture at
  320/390/768/1440, plus checks for horizontal overflow, console errors,
  stranded reveals and the reduced-motion path.
- `node scripts/a11y.mjs http://127.0.0.1:4321/` - axe-core WCAG 2.1 A+AA audit,
  focus order and broken anchors.

## Deploy

Pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`. The custom domain is served through Cloudflare.

The previous static site is preserved as the `legacy-static-site` branch and
the `v1-static-site` tag. To roll back, point Pages at that branch.
