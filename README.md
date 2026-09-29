# Projectory

Marketing site for Projectory, the audience engagement company — product
catalogue, case studies, pricing and lead capture, plus a few standalone
audience-participation activities used live at events.

React 18 · TypeScript · Vite 6 · React Router 7 · CSS Modules. Deployed on
Vercel from the `docs/` build output.

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

Server-side variables live in the Vercel project settings (never in code). The
site runs without any of them locally.

The lead forms send to Pipedrive through `api/lead-form.cjs` and need two (see
[Leads → Pipedrive](#leads--pipedrive)). The activity forms proxy to Google Apps
Script and need two more, set in Vercel for production and in a local `.env` if
you are working on them:

| Variable                         | Purpose                                                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `PIPEDRIVE_COMPANY_DOMAIN`       | Pipedrive account for website leads: the `yourcompany` in `yourcompany.pipedrive.com`                                            |
| `PIPEDRIVE_API_TOKEN`            | That account's API token (Personal preferences → API). New leads are owned by the token's user                                   |
| `VENTING_MACHINE_API_KEY`        | Shared secret the venting-machine Apps Script checks before accepting a write                                                    |
| `VENTING_MACHINE_DEPLOYMENT_URL` | Deployed Apps Script web-app URL (`https://script.google.com/macros/s/<id>/exec`) that `api/venting-machine-form.cjs` proxies to |

## Scripts

| Script                    | What it does                                                   |
| ------------------------- | -------------------------------------------------------------- |
| `npm run dev`             | Vite dev server, with activity `/api/*` proxied to Apps Script |
| `npm run build`           | Production build into `docs/`                                  |
| `npm run preview`         | Serve the built output                                         |
| `npm run typecheck`       | `tsc --noEmit`. See the note below                             |
| `npm run lint`            | ESLint                                                         |
| `npm run format`          | Prettier write · `format:check` to verify only                 |
| `npm run knip`            | Unused files, exports and dependencies                         |
| `npm run setup:pipedrive` | Pipedrive custom fields for the lead form (see below)          |

> **`typecheck` reports 6 known errors**, all in `src/pages/activities/`. They
> are a frozen baseline, not new breakage. Anything _outside_ that directory
> should be zero; treat a 7th error as a regression. This is also why `build`
> does not yet run `typecheck`.

## Project structure

```
src/
  assets/       images, fonts, documents — all assets are global
  components/
    layout/     app chrome: Layout, Navbar, Footer, SlideInMenu, …
    sections/   page sections used by more than one page
    <Name>/     shared UI: ProductCard, CloudinaryImage, FaqAccordion, …
  config/       site.ts (keys, endpoints), seo.ts (per-route metadata)
  context/      LikedProductsContext
  data/         products.ts, caseStudies.ts, faq.ts — app-wide data
  hooks/        useEscapeKey, usePageEntrance, useDocumentMeta, useLeadForm
  lib/          leads.ts, visitorContext.ts, finderAnswers.ts, web3forms.ts, findProduct.ts
  pages/<Page>/ <Page>.tsx + <Page>.module.css + components/<Name>/
  styles/       tokens.css (design tokens), global.css
  types/        product.ts
```

**Where does a component go?** By how many places use it:

| Consumers                     | Home                                                 |
| ----------------------------- | ---------------------------------------------------- |
| 3+, or 2 in _different_ pages | `src/components/`                                    |
| 1                             | that page's `components/`                            |
| App chrome                    | `src/components/layout/` — global by role, not count |

**Import style.** `@/` for anything crossing a unit boundary, relative for
anything inside the same page or component group. So a relative path means
"mine" and `@/` means "shared". No barrel/`index.ts` files — they defeat Vite's
tree-shaking.

**Colour** comes from `src/styles/tokens.css`. Add a token when a colour is
used twice or more; one-off colours stay literal at the call site.

## Activities

`src/pages/activities/` holds the live-event apps (Combo Convo, Laser Focus,
Venting Machine). They are self-contained — they import nothing from the rest
of `src/` — and they post to Google Apps Script through the serverless
functions in `api/`. The Apps Script sources live in `apps-script-*/`

In production these routes redirect to `activity.projectory.live` (see
`vercel.json`).

## Leads → Pipedrive

The Contact form, Estimate request (with the Product Finder answers), footer
intro-deck form and the partner Apply overlay post to `/api/lead-form`
(`api/lead-form.cjs`). For each submission it finds or creates the organization
(exact name) and person (exact email), creates a lead in Pipedrive's Leads Inbox
with custom fields, and pins a note with the message. Leads also record where the
visitor came from: UTM tags, referrer, landing page, and the page that led to the
form (`src/lib/visitorContext.ts`). The Partners page "Register a Deal" button
links to the contact form with `?source=register-deal`, which tags the lead.

**Email backup.** If the function can't deliver (Pipedrive down, bad token, or the
`PIPEDRIVE_*` variables not set), the browser sends the Web3Forms email the forms
used before (`src/lib/leads.ts`), so no lead is lost. Bots are dropped by a hidden
honeypot field and a minimum fill time.

**It only runs on Vercel.** `npm run dev` has no local backend for it (unlike the
activity endpoints, which Vite proxies straight to Apps Script), so there the forms
fall back to the Web3Forms email, as they always have. Don't submit them while
developing; test on the staging preview.

**Custom fields** are found by name, so any Pipedrive account works once they
exist. Create them once per account, with `PIPEDRIVE_COMPANY_DOMAIN` and
`PIPEDRIVE_API_TOKEN` in a local `.env.local` (the script reads it; the field list
comes from `api/lead-form.cjs`, so the two always match):

```bash
npm run setup:pipedrive             # preview what's missing (changes nothing)
npm run setup:pipedrive -- --apply  # create the missing fields
```

The token's Pipedrive user needs permission to add custom fields. New-lead alerts
are set up inside Pipedrive (notifications / automations).

## Deployment

Vercel builds `docs/` and serves it, rewriting all unmatched paths to
`index.html` for client-side routing. `api/*.cjs` deploy as serverless
functions.

The canonical host is **`https://projectory.live`** — `www` permanently
redirects to it. That host is encoded in four places, which must stay in step:
`src/config/seo.ts`, `public/robots.txt`, `public/sitemap.xml`, and the
redirect in `vercel.json`.

`public/sitemap.xml` is a static file listing every product and case study.
**Regenerate it when either data file changes.**

## Notes

- **The main stylesheet is render-blocking on purpose. Do not defer it.** An
  earlier `vite.config.ts` inlined hand-picked "critical CSS" and loaded the real
  sheet with `media="print" onload="this.media='all'"`. The inline block covered a
  few rules while every layout rule, every `@media` block and every CSS-module
  class stayed in the deferred sheet, so the app painted and mounted unstyled and
  then re-laid out. That cost CLS 0.641 desktop / 1.689 mobile, and off-canvas
  panels hidden only by `transform` visibly slid off screen on first load. The
  sheet is ~8 KB brotli; blocking on it is far cheaper than the reflow.
  `vite.config.ts` now only emits `<link rel="preload">` for the two above-the-fold
  woff2 faces (`CRITICAL_FONTS`).
- `<main>` carries `min-height: 100vh` in `global.css`. Every route is `lazy()`
  while the `Footer` is eager, so without a reserved box the footer paints at the
  top of the viewport and is shoved down when the route chunk lands. Keep it.
- Closed overlays must hard-hide with `visibility: hidden`, not `transform` or
  `opacity` alone — see `SlideInMenu.module.css` and `WhatsAppFloat.module.css`
  for the transition-delay idiom that keeps the exit animation intact.
- `VITE_LOADING_SCREEN=off` skips the `LoadingScreen` at build time (see
  `.env.example`). It is worth ~1.1 s of LCP on a throttled mobile run, so use the
  flag to A/B it on a preview deploy rather than editing `App.tsx`.
- There is no test suite. A manual route walk is currently the gate.
