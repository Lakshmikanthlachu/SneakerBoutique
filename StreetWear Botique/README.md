# KAIROS — Sneaker & Streetwear Boutique HTML Template

A bold, trend-forward static HTML template for specialty sneaker and streetwear stores. It's built with **Tailwind CSS 3.4** and **vanilla JavaScript**, with no jQuery and no frameworks. It includes 3D animation effects, layered parallax layouts, light and dark modes, and RTL support.

---

## Pages (14)

| File | Purpose |
|---|---|
| `index.html` | **Home 01, Drop Culture.** 3D ring carousel hero, live countdown, crossed marquee tapes, live drops, shop-by-brand tiles, release preview, layered story, store-visit band |
| `home-2.html` | **Home 02, Editorial Lookbook.** 3D photo-fan hero, perspective grid floor, sticky stacking chapters, draggable 3D colourway cube, shop-the-look hotspots, review marquees |
| `shop.html` | **Shop by brand.** Brand tabs and spotlight banners, category/size/price/availability filters (desktop sidebar and mobile drawer), search, sort, empty state. Supports `shop.html?brand=aero` deep links |
| `product-details.html` | Gallery, size picker (size required before add-to-bag), accordions, **3D orbit spec stage** with floating callouts, spec bento, related products, Product JSON-LD |
| `release-calendar.html` | **Release calendar.** Month navigation, Cards/Month-grid views, method and brand filters, **3D flip cards**, `.ics` "Add to calendar" downloads, raffle explainer, FAQ |
| `about.html` | Mission/vision/values, history timeline, team, testimonials |
| `journal.html` | Editorial hero (floating layers, glass featured card), category tabs, search and **working pagination** (`?cat=`, `?q=`, `?page=` are shareable) |
| `journal-details.html` | One template renders every article: `journal-details.html?post=<slug>`. Article data is in the page's `#posts-data` JSON block. Recent posts, previous/next and share links all update automatically |
| `membership.html` | Pricing with a monthly/yearly toggle; every plan button opens a validated join form that carries the chosen plan and billing period |
| `contact.html` | Contact cards, validated form, **store-visit booking** (date/time), live open/closed badge, OpenStreetMap embed (no API key) |
| `policies.html` | Privacy, Terms, and Shipping & returns (linked from the footer) |
| `404.html`, `coming-soon.html`, `maintenance.html` | Utility pages with 3D extruded type, ring carousel and an animated shoebox |

The template has no login, register or dashboard pages, by design.

---

## Quick start

Open any `.html` file in a browser. The compiled CSS (`assets/css/style.css`) is already included, so you don't need to build anything to use the template.

### Rebuilding CSS (after editing classes or colours)

```bash
npm install
npm run build      # minified production CSS
npm run watch      # rebuild on save while developing
```

Tailwind scans `*.html` and `assets/js/**/*.js`. If you add a class that isn't used anywhere yet, run the build again. Otherwise the class won't exist in `style.css`.

---


## Deploying (Vercel, Netlify, any static host)

`npm run build` compiles the CSS and copies the 14 pages and `assets/` into `public/`.

- **Vercel:** `vercel.json` is included (build command `npm run build`, output directory `public`). Import the repo and deploy. If Project Settings has an Output Directory override, clear it or set it to `public`.
- **Netlify:** build command `npm run build`, publish directory `public`.
- **Plain hosting / cPanel:** no build needed. Upload the `.html` files and the `assets/` folder.

## Folder structure

```
├── *.html                  13 pages
├── assets/
│   ├── css/style.css       compiled Tailwind output (don't edit by hand)
│   ├── js/main.js          all interactions (data-attribute driven modules)
│   ├── fonts/              self-hosted Anton, Space Grotesk, JetBrains Mono (SIL OFL)
│   └── img/                favicon.svg, apple-touch-icon.png
├── src/input.css           source styles: theme tokens, components, 3D effects
├── scripts/build-public.mjs  copies the site into public/ for deployment
├── vercel.json             Vercel build settings
├── tailwind.config.js
└── package.json
```

---

## Customising

### Colours and themes

Brand colours are CSS variables in `src/input.css`, under `:root` for light and `html.dark` for dark. Every Tailwind colour (`bg-bg`, `text-fg`, `bg-accent`, `text-accenttext`, …) reads from them, so changing one value restyles the whole template in both themes.

- `--c-accent` is the infrared fill (buttons, badges)
- `--c-accent-text` is the accent used as **text**. It's darker in light mode so it keeps AA contrast.
- `--c-hot` is cobalt (raffles, secondary highlights)
- `--c-danger` is used for form errors

The **default theme** is dark unless the visitor's OS prefers light. The visitor's choice is saved in `localStorage` (`kr-theme`). To force a theme, edit the small inline script in each page's `<head>`.

### RTL

The toggle button switches `<html dir>` and remembers the choice (`kr-dir`). For an RTL-only site, set `<html dir="rtl">` and remove the toggle. Layouts use logical utilities (`ms-*`, `ps-*`, `start-*`, `end-*`), so they mirror automatically. Arrow icons flip with `rtl:-scale-x-100`.

### Fonts

The three font families are self-hosted, so they need no external requests. To switch to Google Fonts, replace the `@font-face` blocks at the top of `src/input.css` and update `fontFamily` in `tailwind.config.js`.

### Images

Demo photos are loaded from Unsplash (free licence) for preview only. Replace the URLs with your own product photography before going live. Products, brands, people and reviews in the demo are **fictional**.

---

## JavaScript modules (`assets/js/main.js`)

Every module turns on only when its markup is present. Main hooks:

| Attribute | Effect |
|---|---|
| `data-theme-toggle`, `data-dir-toggle` | Theme / direction toggles (any number per page) |
| `data-open="id"`, `.offcanvas`, `data-close` | Off-canvas drawers (menu, bag, filters). Fixed overlays that never push content. Esc closes them and focus is trapped |
| `.reveal`, `.reveal-x`, `data-split` | 3D scroll reveals and split-line headline animations |
| `data-tilt="10"` | 3D tilt with a glare layer (fine pointers only) |
| `data-parallax-scope` + `data-depth="0.6"` | Mouse-parallax layers |
| `data-scroll-depth="0.3"` | Scroll-parallax layers |
| `data-ring` | 3D ring carousel (drag, arrow keys, auto-spin) |
| `data-countdown="2026-12-01T10:00:00-05:00"` | Countdown to a fixed date. `data-countdown-offset="76"` counts down from N hours after page load, for demos |
| `data-add-to-cart data-name data-price data-img` | Demo bag (saved in `localStorage` when available) |
| `data-shop`, `data-calendar`, `data-journal` | Shop filters, release calendar, journal filter and pagination |
| `data-fill` + `<template data-filler>` | Completes the last row of a card grid with promo cards, so rows are never half empty |
| `data-open="join-modal" data-plan="Insider"` | Opens the membership join form with that plan |
| `data-cube` / `data-cube-face="n"` | 3D colourway cube |
| `data-ics="2026-10-18T100000" data-title` | Downloads an `.ics` calendar event |
| `form[data-validate="Toast text"]` | Front-end validation and success toast (wire up your own backend) |
| `data-open-status data-week="11-21" data-sun="12-18"` | Live open/closed badge from store hours |

All motion respects `prefers-reduced-motion`.

---

## Accessibility and SEO

- Semantic landmarks, skip link, one `<h1>` per page, labelled controls, `aria-pressed`/`aria-expanded` states, focus-visible rings
- Unique `<title>`, meta description, canonical, Open Graph and Twitter tags on every page
- JSON-LD: `ShoeStore` (home), `Product` (product page), `Article` (journal post)
- Utility pages are marked `noindex`

## Pre-delivery QA performed

- Overflow sweep on all 13 pages at 360, 390, 768, 900, 1024, 1180, 1280, 1440 and 1920 px, in light and dark, LTR and RTL: no horizontal scroll and no console errors
- The header stays visible while scrolling (it never hides). Desktop nav appears at 1024 px with no collisions. The "Drop alerts" CTA appears only from 1280 px.
- Mobile menu, bag and filter drawers are fixed overlays, so page content never shifts when they open
- Header controls are never duplicated in the drawer (theme and RTL buttons move into the drawer only below 640 px)
- Product-card CTAs stay on one line and align across every grid row at every width
- Native date/time pickers follow the active theme (`color-scheme`), so the icons stay visible in dark mode
- Every inner page shares one hero component with a photo background. The order is always breadcrumb → eyebrow → H1 → subtext, at the same height.
- Favicon and touch icon files exist

- Automated contrast audit in light and dark mode: body text meets WCAG AA
- Product page: gallery and details columns are equal height at every desktop width

## Test results (latest run)

- W3C Nu HTML Checker: 0 errors on all 14 pages
- axe-core (WCAG 2.1 AA + best practices): 0 violations in light/dark × LTR/RTL
- Links: 833 internal links/anchors and 323 external links verified; no dead `#` links
- Keyboard: skip link, visible focus on every tab stop, Escape closes menus, focus trap in drawers and modals
- 260 buttons and 12 forms exercised on desktop and mobile with no JavaScript errors; also works with browser storage blocked and with JavaScript disabled
- Responsive: no horizontal scroll at 320–2560 px in every theme/direction; holds at 200% text size
- Performance: CSS 15 KB and JS 13 KB gzipped; layout shift at most 0.04

## Social links

Footer, team and utility-page icons link to Instagram, Facebook, YouTube and X and open in a new tab. Replace the URLs in the HTML with your own profiles.

## Credits

- Tailwind CSS (MIT)
- Anton, Space Grotesk, JetBrains Mono, via Fontsource (SIL Open Font License 1.1)
- Demo photography from Unsplash (Unsplash License). Map from © OpenStreetMap contributors.
