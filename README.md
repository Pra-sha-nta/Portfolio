# prashantaparajuli.com.np

Personal portfolio for Prashanta Parajuli, Associate QA Engineer.

Astro + Tailwind v4 + Motion One. Zero client framework; the only shipped JS is
the scroll-reveal/scroll-spy module.

## Commands

| Command | Does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server on `localhost:4321` |
| `npm run build` | Production build to `dist/` |
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
