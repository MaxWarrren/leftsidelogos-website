# Homepage Ecommerce Redesign — Design

**Date:** 2026-06-29
**App:** Website (Vite + React 19 SPA)
**Goal:** Reshape the homepage from a SaaS-style landing page into a clean ecommerce-store feel. Flat light (cream) backgrounds throughout, with the footer as the only dark surface. Replace the photographic dark hero with an editorial light hero, and add a live, scrolling catalog preview.

---

## Approved Decisions

- **Scope:** Full homepage restyle (hero, marquee, Services, Bottom CTA, Footer, Navbar).
- **Marquee items:** Clickable → navigate to the catalog page.
- **Marquee data:** Live Supabase catalog via `getAllProducts()`, with local fallback.
- **Footer:** Flat dark — remove stitch texture and navy glow.
- **Bottom CTA:** Recolor to light (cream) — footer becomes the only dark surface.
- **Service cards:** All light (drop the single dark "anchor" card style).

---

## Section-by-Section

### 1. Hero (replaces both old `Hero` and `About`)

The old animated hero (`components/ui/animated-hero.tsx`: workshop photo, navy gradient tints, `StitchGrid`, thread blur, rotating-audience headline, `TrustMarquee`) and the standalone `About` section are **removed**. Their content consolidates into one new light hero.

- **Background:** flat `bg-lsl-cream`. No image, no texture, no glow.
- **Layout:** two columns on `md+` (single column stacked on mobile, copy first).
  - **Left:** eyebrow (e.g. "Custom apparel · O'Fallon, MO"), editorial headline ("Craft you can feel, delivered on time."), one tight paragraph, a CTA row, and the three stats.
    - **Primary CTA:** "Shop the catalog" → `catalog`.
    - **Secondary CTA:** "Start a project" → `build-order`.
    - **Stats:** 10k+ orders / 100% in-house / 2–3 wk turnaround.
  - **Right:** the existing image carousel (the `AboutUs-*.jpg` rotator — autoplay, dot indicators, prev/next arrows, pause-on-hover, reduced-motion aware), **moved from left to right**.
- **Height:** comfortable but not a forced `100svh` — reads like a store, not a landing page.
- **Top padding** clears the fixed navbar (`pt-28`/`md:pt-32`).

**Component:** new `components/Hero.tsx` exporting `Hero`. Props: `{ onShopCatalog: () => void; onStartProject: () => void }`. The carousel rotator is internal to this component (ported from `About.tsx`).

### 2. Catalog Marquee (new — directly under hero)

- **Component:** new `components/CatalogMarquee.tsx`. Props: `{ onNavigateToCatalog: () => void }`.
- **Data:** `getAllProducts()` on mount; take featured-first, slice to 6–8. On empty/error, fall back to a small local set (reuse the catalog fallback imagery already in `CatalogPage.tsx`). State: `loading` shows skeleton cards.
- **Header row:** small eyebrow ("Popular right now") + a "View all →" link → catalog.
- **Track:** the product list **duplicated** for a seamless loop; `motion.ul` animates `x: 0 → -50%`, `repeat: Infinity`, `ease: 'linear'`, ~35s. Edge fade via `mask-image` on both sides. **Pause on hover** (`animationPlayState` / state toggle). Reduced motion → static, horizontally wrapped/scrollable row.
- **Card:** product image (object-cover, fixed aspect), name, "from $XX". Whole card is a `<button>`; click → `onNavigateToCatalog()`.

### 3. Navbar (required fix)

`components/Navbar.tsx` currently uses an `overHero` flag (`currentPage === 'home' && !scrolled`) to render transparent with **light text** over the old dark hero. With a cream hero that text would be invisible.

- **Change:** remove the `overHero` transparent/light mode so the navbar always uses the cream surface style (dark text, bottom border, `bg-lsl-cream/85 backdrop-blur`). Simplest implementation: set `overHero = false` and let dead branches fall away (or strip them).
- The dark mobile slide-over menu is an overlay and is unaffected.

### 4. Services

`components/Services.tsx`:
- Remove the `PaperTexture` dot overlay → flat cream.
- **All service cards use the light/white style** — drop the dark "anchor" (`Embroidery` signature) card variant; render every card with the standard light treatment.
- Keep the 5-step process timeline as-is (structure unchanged).

### 5. Bottom CTA

`components/BottomCTA.tsx`: convert from the navy block to a **light** section.
- `bg-lsl-cream`. Remove `StitchOverlay` and the blur-glow blobs.
- A clean bordered panel (e.g. `border-lsl-stone bg-white` or subtle stone) holding the heading, supporting copy, primary "Start your project" button (dark/navy on light), and the secondary text link.
- Dark text (`text-lsl-ink`) with navy accents instead of cream-on-navy.

### 6. Footer

`components/Footer.tsx`: stays dark (`bg-lsl-ink`), but **flat**:
- Remove `StitchPattern` (weave texture).
- Remove the navy glow blob (`absolute … bg-lsl-navy/30 blur`).
- All content/columns unchanged.

### App composition

`App.tsx` homepage (`currentPage === 'home'`) renders in order:
`Hero → CatalogMarquee → Services → BottomCTA → Footer`
(`About` import/usage removed; `Hero` import path updated.)

---

## Files Touched

| File | Change |
|---|---|
| `components/Hero.tsx` | **New** — light editorial hero with right-side carousel. |
| `components/CatalogMarquee.tsx` | **New** — live, clickable, right-to-left product marquee. |
| `components/ui/animated-hero.tsx` | **Removed** (old dark hero retired). |
| `components/About.tsx` | **Removed** (folded into Hero). |
| `components/Navbar.tsx` | Drop `overHero` light/transparent mode. |
| `components/Services.tsx` | Remove `PaperTexture`; all cards light. |
| `components/BottomCTA.tsx` | Recolor to light, remove texture/glow. |
| `components/Footer.tsx` | Remove `StitchPattern` + glow. |
| `App.tsx` | New homepage order; update imports. |

## Out of Scope

- Catalog page, Mockup Studio, Build Order, Contact, Portal — untouched this pass.
- Marquee deep-linking to a specific product detail (clicks go to the catalog page; per-product selection can come later).
- Copywriting changes beyond what's needed to fit the new layout.

## Risks / Notes

- **Navbar contrast** is the main correctness risk — verify dark-on-cream legibility at the top of the page.
- Marquee must not layout-thrash: fixed card dimensions, images `object-cover`, skeletons while loading.
- Keep reduced-motion paths for both the carousel and the marquee.
- Repo is not under git, so the design doc is written to disk but not committed.
