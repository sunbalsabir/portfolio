# Sunbal Sabir — QA Engineer portfolio

Personal portfolio for Sunbal Sabir, a QA Engineer with 4+ years of manual and automation
testing experience across blockchain, Web3, e-commerce and IoT products.

The site is a single page built with TanStack Start, React 19, Tailwind CSS v4, Motion and
React Three Fiber. Dark navy with mint and violet accents by default, with a light theme one
toggle away. The hero pairs a giant display-type name with an animated "Release check" card
that ticks through the gates a build passes before it ships, over a lazy-loaded WebGL orb
(CSS fallback everywhere WebGL is missing). Below it: a typed terminal card, a "How a release
gets checked" stepper with real tabs, a toolbox grid that says what each tool is for, a
date-column experience timeline, 3D tilt cards, side rails for scroll and social links, and a
columned footer. Every animation honours `prefers-reduced-motion`.

Because it is a QA engineer's portfolio, the project is also a small showcase of how I like a
front-end to be tested: unit tests for the rendered content, data-integrity tests for the
facts the page claims, and a Playwright suite that runs against the production build on
desktop and mobile viewports.

## Quick start

```sh
npm install
npm run dev        # prints the local URL
```

## Scripts

| Command               | What it does                                                          |
| --------------------- | --------------------------------------------------------------------- |
| `npm run dev`         | Start the dev server with hot reload                                  |
| `npm run build`       | Production build (Cloudflare preset, used for deployment)             |
| `npm run build:node`  | Production build with Nitro's Node preset, used by the e2e suite      |
| `npm run start`       | Serve the Node build on `$PORT` (default 3000)                        |
| `npm run lint`        | ESLint + Prettier                                                     |
| `npm run typecheck`   | TypeScript in strict mode                                             |
| `npm test`            | Vitest unit and data-integrity tests (jsdom + Testing Library)        |
| `npm run test:e2e`    | Playwright end-to-end tests; builds and serves the site automatically |
| `npm run test:e2e:ui` | Same, in Playwright's interactive UI                                  |
| `npm run og`          | Regenerate `public/og.png`, the social link-preview image             |

The first `test:e2e` run needs a browser: `npx playwright install chromium`.

## How the project is organised

```
src/
  data/profile.ts        single source of truth: profile, jobs, skills, process steps, toolbox
  routes/__root.tsx      document shell, global metadata, 404 and error pages
  routes/index.tsx       the portfolio page, rendered from profile.ts
  components/HeroScene.tsx  WebGL hero (React Three Fiber), lazy-loaded client-side only
  test/                  Vitest suites (page rendering, data integrity, routing)
  assets/resume.pdf      the CV served by the "Download CV" button
e2e/portfolio.spec.ts    Playwright suite: metadata, navigation, links, a11y, 404, mobile
scripts/og-image.mjs     renders the Open Graph image with headless Chromium
.github/workflows/ci.yml lint, typecheck, unit tests, build, then e2e on every push
```

Content changes (a new role, a new tool, updated contact details) go in
`src/data/profile.ts` only. The tests check that file for consistency, so the "Domains
tested" tile, the phone link and the navigation cannot drift from the content they describe.
Fill in `caseStudies` and `certifications` there and the matching sections appear.

## Testing strategy

- **Unit (Vitest + Testing Library).** Renders the page and asserts on what a user or a
  screen reader would perceive: one `h1`, landmark regions, every job and skill from the CV,
  correct `href`s, external links opening safely, decorative animation hidden from
  assistive technology. Interactive widgets are driven too: the release-check card under fake
  timers, the process stepper's tabs, the theme toggle and the mobile menu.
- **Data integrity.** Checks the profile data is internally consistent: no duplicate
  skills, current role listed first, the phone link matches the displayed number, stat
  counts derived from the data they summarise.
- **End-to-end (Playwright).** Runs against a real production build in desktop and mobile
  Chromium: zero console errors or failed requests, SEO and Open Graph tags, JSON-LD
  `Person` schema, CV and OG image served with the right content types, in-page navigation,
  keyboard skip link, the release-check card running to completion, the process stepper,
  the WebGL scene mounting, theme persistence, 404 handling and no horizontal overflow on
  phones.

## Accessibility

Landmark regions and a skip link, decorative motion hidden with `aria-hidden`, and
`prefers-reduced-motion` honoured both for Motion animations (`MotionConfig`) and for CSS
keyframes.

## Deployment

The default build targets Cloudflare via Nitro. The project is also connected to
[Lovable](https://lovable.dev); commits to `master` sync there, so keep the branch green.
