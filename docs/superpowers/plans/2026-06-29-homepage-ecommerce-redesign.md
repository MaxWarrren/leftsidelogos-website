# Homepage Ecommerce Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the Website homepage from a SaaS-style landing page into a flat, light ecommerce-store layout — light editorial hero with a right-side carousel, a live clickable catalog marquee, and the footer as the only dark surface.

**Architecture:** Replace the dark photographic `Hero` and standalone `About` with a single light `Hero` component. Add a `CatalogMarquee` that pulls live products. Recolor Services / Bottom CTA to light, flatten the Footer, and fix the Navbar so it's legible over a light hero. State-based SPA navigation in `App.tsx` is unchanged.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind CSS, framer-motion, lucide-react, Supabase JS.

## Global Constraints

- No unit-test runner exists; **verification = `npx tsc --noEmit` + visual check via `npm run dev`**. Pre-existing type errors in `components/Footer.tsx` and `components/ui/sheet.tsx` (framer-motion `ease` typing) are expected — only fail on NEW errors.
- Repo is **not** under git — there are no `git commit` steps. Each task ends with a typecheck + visual acceptance gate instead.
- Fonts/colors come from `tailwind.config.js` (`lsl-*` tokens, `font-display`/`font-sans`). Use existing tokens; do not introduce new colors.
- All animations must respect `useReducedMotion()`.
- Backgrounds are flat `bg-lsl-cream` everywhere except the Footer (`bg-lsl-ink`). No texture/glow overlays.

---

### Task 1: Navbar — remove `overHero` mode

**Files:**
- Modify: `components/Navbar.tsx`

**Interfaces:**
- Produces: nothing new (props unchanged). After this task the navbar always renders the cream/dark-text surface.

- [ ] **Step 1: Force the cream surface**

In `components/Navbar.tsx`, replace the `overHero` derivation (currently `const overHero = currentPage === 'home' && !scrolled;`) with:

```tsx
// The homepage hero is now light (cream), so the navbar always uses the
// cream surface with dark text — never the old transparent/light-text mode.
const overHero = false;
```

Leave the rest of the file as-is. The `scrolled` state and `useMotionValueEvent` hide/show logic still work; the now-constant `overHero` simply collapses every `overHero ? A : B` to `B`. (Optional tidy: nothing else required.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors (only the known `Footer.tsx` / `sheet.tsx` framer-motion errors).

- [ ] **Step 3: Visual acceptance**

Run `npm run dev`. At the very top of the homepage (not scrolled), the logo wordmark and nav links ("Catalog", "Mockup Studio", …) must be **dark and legible** on cream, with the bottom border + blur visible. Scrolling keeps the same look.

---

### Task 2: New light `Hero` component

**Files:**
- Create: `components/Hero.tsx`
- Reference (porting carousel from): `components/About.tsx`
- Reference (porting CTA/stat markup from): `components/ui/animated-hero.tsx`

**Interfaces:**
- Produces: `export function Hero(props: HeroProps)` where
  ```ts
  interface HeroProps {
    onShopCatalog: () => void;
    onStartProject: () => void;
  }
  ```

- [ ] **Step 1: Scaffold the component file**

Create `components/Hero.tsx`. Structure:
- `<section id="home" className="bg-lsl-cream pt-28 pb-20 md:pt-32 md:pb-28">`.
- Inner container: `mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-12 md:gap-16 md:px-10 md:items-center`.
- **Left column** `md:col-span-6` (order-1): eyebrow `<p className="font-sans text-sm font-semibold text-lsl-navy">Custom apparel · O'Fallon, MO</p>`; headline `<h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-lsl-ink md:text-5xl lg:text-[3.5rem]">Craft you can feel,<br className="hidden md:block" /> <span className="text-lsl-graphite">delivered on time.</span></h1>`; one paragraph (port the first About paragraph) in `mt-6 max-w-xl text-base leading-relaxed text-lsl-graphite md:text-[17px]`; CTA row + stats (Steps 2–3).
- **Right column** `md:col-span-6` (order-2): the carousel (Step 4).

- [ ] **Step 2: CTA row**

Inside the left column, after the paragraph. Reuse the existing `Button` from `./ui/button` and `ArrowRight`/`ChevronRight` from `lucide-react`:

```tsx
<div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
  <Button
    variant="primary"
    size="xl"
    onClick={onShopCatalog}
    className="group bg-lsl-ink text-lsl-cream hover:bg-lsl-ink hover:brightness-110"
  >
    Shop the catalog
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
  </Button>
  <Button
    variant="secondary"
    size="xl"
    onClick={onStartProject}
    className="border-lsl-ink/15 text-lsl-ink hover:bg-lsl-ink hover:text-lsl-cream"
  >
    Start a project
    <ChevronRight className="h-4 w-4" strokeWidth={2} />
  </Button>
</div>
```

- [ ] **Step 3: Stats row**

Port the `Stat` helper from `About.tsx` (value + label). Render:

```tsx
<div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-lsl-stone pt-8 md:gap-10">
  <Stat value="10,000+" label="Orders fulfilled" />
  <Stat value="100%" label="In-house production" />
  <Stat value="2–3 wk" label="Avg turnaround" />
</div>
```

`Stat` (local function, copied from About):
```tsx
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-semibold tracking-tight text-lsl-ink md:text-4xl">
        <span className="tabular-nums">{value}</span>
      </p>
      <p className="mt-1 font-sans text-sm text-lsl-graphite">{label}</p>
    </div>
  );
}
```

- [ ] **Step 4: Port the carousel into the right column**

Copy the carousel logic + markup from `components/About.tsx` (the `IMAGES` array, `index`/`paused` state, `useEffect` rotation, `goTo`, `onKey`, the `motion.img` `AnimatePresence`, gradient, caption, prev/next buttons, and the progress-dot tablist). Place it as the right column's content. Keep the container classes (`group relative h-[340px] w-full overflow-hidden rounded-3xl bg-lsl-stone shadow-lsl-lift md:h-[480px]`). Import `useCallback, useEffect, useRef, useState` from react; `AnimatePresence, motion, useReducedMotion` from framer-motion; `ChevronLeft, ChevronRight` from lucide-react; `cn` from `../lib/utils`. This is a straight port — no behavior change, just relocated to the right side.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors. (Component not yet mounted; this just confirms it compiles.)

---

### Task 3: `CatalogMarquee` component

**Files:**
- Create: `components/CatalogMarquee.tsx`
- Consumes: `getAllProducts` from `../lib/supabase`, `CatalogProduct` from `../types`

**Interfaces:**
- Consumes: `getAllProducts(): Promise<any[]>` (already exists; returns products with `id, name, images, base_price, featured`, possibly `images_by_color`).
- Produces: `export function CatalogMarquee(props: { onNavigateToCatalog: () => void })`.

- [ ] **Step 1: Data + loading state**

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getAllProducts } from '../lib/supabase';
import type { CatalogProduct } from '../types';

const FALLBACK: { id: string; name: string; image: string; base_price: number }[] = [
  { id: 'f1', name: 'Richardson 112 Trucker', image: '/catalog_pictures/hats-112-1.png', base_price: 18 },
  { id: 'f2', name: 'Richardson 6511 Rope Hat', image: '/catalog_pictures/hats-6511-1.png', base_price: 22 },
  { id: 'f3', name: 'Premium Hoodie', image: '/AboutUs-3.jpg', base_price: 38 },
  { id: 'f4', name: 'Custom Tee', image: '/AboutUs-4.jpg', base_price: 16 },
  { id: 'f5', name: 'Embroidered Cap', image: '/AboutUs-1.jpg', base_price: 24 },
  { id: 'f6', name: 'Promo & Koozies', image: '/AboutUs-2.jpg', base_price: 6 },
];

type MarqueeItem = { id: string; name: string; image: string; base_price: number };

function firstImage(p: CatalogProduct): string {
  const imgs = (p as any).images;
  if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
  return '/AboutUs-4.jpg';
}
```

Component body:
```tsx
export function CatalogMarquee({ onNavigateToCatalog }: { onNavigateToCatalog: () => void }) {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const products = await getAllProducts();
        if (!mounted) return;
        const mapped: MarqueeItem[] = (products || [])
          .slice()
          .sort((a: any, b: any) => Number(b.featured) - Number(a.featured))
          .slice(0, 8)
          .map((p: any) => ({ id: p.id, name: p.name, image: firstImage(p), base_price: p.base_price ?? 0 }));
        setItems(mapped.length > 0 ? mapped : FALLBACK);
      } catch {
        if (mounted) setItems(FALLBACK);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const track = useMemo(() => [...items, ...items], [items]);
  // ...render (Steps 2–4)
}
```

- [ ] **Step 2: Header row**

```tsx
<div className="mx-auto flex max-w-7xl items-end justify-between px-6 md:px-10">
  <div>
    <p className="font-sans text-sm font-semibold text-lsl-navy">Popular right now</p>
    <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-lsl-ink md:text-3xl">From the catalog</h2>
  </div>
  <button
    type="button"
    onClick={onNavigateToCatalog}
    className="group inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-lsl-ink hover:text-lsl-navy"
  >
    View all
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
  </button>
</div>
```

- [ ] **Step 3: Marquee track (motion + reduced-motion + hover pause)**

Wrap the whole section in `<section className="bg-lsl-cream py-14 md:py-16">`. Below the header, the track wrapper with edge mask:

```tsx
<div
  className="mt-8 overflow-hidden"
  style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)' }}
>
  {prefersReducedMotion ? (
    <div className="flex gap-5 overflow-x-auto px-6 no-scrollbar md:px-10">
      {(loading ? FALLBACK : items).map((p) => (
        <MarqueeCard key={p.id} item={p} onClick={onNavigateToCatalog} />
      ))}
    </div>
  ) : (
    <motion.div
      className="group/track flex w-max gap-5"
      initial={{ x: 0 }}
      animate={{ x: '-50%' }}
      transition={{ repeat: Infinity, duration: 38, ease: 'linear' }}
      style={{ animationPlayState: 'running' }}
    >
      {(loading ? [...FALLBACK, ...FALLBACK] : track).map((p, i) => (
        <MarqueeCard key={`${p.id}-${i}`} item={p} onClick={onNavigateToCatalog} />
      ))}
    </motion.div>
  )}
</div>
```

Hover-pause: add `whileHover={{ }}` is insufficient for framer `animate`; instead pause by toggling a state flag. Implement with a `paused` state and conditionally set the transition `duration` is awkward — simplest robust approach: wrap the `motion.div` `animate`/`transition` so that on `onMouseEnter`/`onMouseLeave` we set `paused`, and gate the animate target:

```tsx
const [paused, setPaused] = useState(false);
// on the motion.div:
onMouseEnter={() => setPaused(true)}
onMouseLeave={() => setPaused(false)}
animate={paused ? { x: undefined } : { x: '-50%' }}
transition={{ repeat: Infinity, duration: 38, ease: 'linear' }}
```

If `x: undefined` causes a jump, fall back to CSS: give the track `className` a CSS keyframe animation (`animate-[marquee_38s_linear_infinite]`) and pause with `[animation-play-state:paused]` on hover via a `paused` conditional class. Either approach is acceptable as long as: it loops seamlessly and pauses on hover. Add the keyframe to `tailwind.config.js` only if you take the CSS route:
```js
keyframes: { marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } } },
animation: { marquee: 'marquee 38s linear infinite' },
```

- [ ] **Step 4: `MarqueeCard`**

```tsx
function MarqueeCard({ item, onClick }: { item: MarqueeItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/card w-[220px] flex-shrink-0 overflow-hidden rounded-2xl border border-lsl-stone bg-white text-left shadow-lsl-card transition-all hover:-translate-y-0.5 hover:shadow-lsl-lift"
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-lsl-stone">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = '/AboutUs-4.jpg'; }}
        />
      </div>
      <div className="px-4 py-3">
        <p className="truncate font-display text-sm font-semibold text-lsl-ink">{item.name}</p>
        <p className="mt-0.5 font-sans text-xs text-lsl-graphite">
          from <span className="tabular-nums">${Number(item.base_price).toFixed(0)}</span>
        </p>
      </div>
    </button>
  );
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

---

### Task 4: Wire homepage in `App.tsx` (mount Hero + Marquee, retire old sections)

**Files:**
- Modify: `App.tsx`

**Interfaces:**
- Consumes: `Hero` from `./components/Hero` (`onShopCatalog`, `onStartProject`); `CatalogMarquee` from `./components/CatalogMarquee` (`onNavigateToCatalog`).

- [ ] **Step 1: Swap imports**

In `App.tsx`, remove:
```tsx
import { Hero } from './components/ui/animated-hero';
import { About } from './components/About';
```
Add:
```tsx
import { Hero } from './components/Hero';
import { CatalogMarquee } from './components/CatalogMarquee';
```

- [ ] **Step 2: Update the `home` branch**

Replace the current home block:
```tsx
{currentPage === 'home' && (
  <>
    <Hero onShopCatalog={() => navigateTo('catalog')} onStartProject={() => navigateTo('build-order')} />
    <CatalogMarquee onNavigateToCatalog={() => navigateTo('catalog')} />
    <Services />
    <BottomCTA onStartDesigning={() => navigateTo('build-order')} />
  </>
)}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Visual acceptance**

`npm run dev` → homepage shows: light hero (copy left, carousel **right**, working autoplay/arrows/dots), then the catalog marquee scrolling **right-to-left**, pausing on hover, cards clickable → catalog page. No dark hero, no workshop photo.

---

### Task 5: Services — flat cream, all light cards

**Files:**
- Modify: `components/Services.tsx`

- [ ] **Step 1: Remove `PaperTexture`**

Delete the `<PaperTexture />` usage in the section and delete the `PaperTexture` function definition. The section keeps `bg-lsl-cream`.

- [ ] **Step 2: All cards light**

In `ServiceCard`, delete the `anchor` branch entirely (the dark `bg-lsl-ink` article and its glow). Render every card with the existing light markup (the second `return`). Remove the now-unused `anchor` prop from the component signature and from the `.map` call (`<ServiceCard key={service.title} service={service} />`). The `tag` ("Signature service") may be dropped or rendered subtly; simplest is to drop the tag rendering since the anchor styling is gone.

- [ ] **Step 3: Typecheck + visual**

Run: `npx tsc --noEmit` (no new errors). Visual: Services section is flat cream, all six method cards are the uniform white style, process timeline intact.

---

### Task 6: Bottom CTA — recolor to light

**Files:**
- Modify: `components/BottomCTA.tsx`

- [ ] **Step 1: Section + remove texture/glow**

Change the section to `className="bg-lsl-cream"`. Delete `<StitchOverlay />` and the glow `<div>` block (the `pointer-events-none absolute inset-0 -z-10 opacity-30` wrapper and its two blur children), and delete the `StitchOverlay` function.

- [ ] **Step 2: Light panel + dark text**

Wrap the inner content in a bordered panel and recolor text:
```tsx
<div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    className="grid items-end gap-12 rounded-3xl border border-lsl-stone bg-white p-10 shadow-lsl-card md:grid-cols-12 md:p-14"
  >
    <div className="md:col-span-8">
      <p className="font-sans text-sm font-semibold text-lsl-navy">Ready when you are</p>
      <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-lsl-ink md:text-5xl lg:text-[3.5rem]">
        Let&apos;s put your<br />brand on something <span className="text-lsl-navy">real.</span>
      </h2>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-lsl-graphite md:text-lg">
        Start a project in minutes. Add the products you want, drop in your logo, and we&apos;ll come back with a proof and a quote — usually same day.
      </p>
    </div>
    <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
      <Button variant="primary" size="xl" onClick={onStartDesigning}
        className="group w-full bg-lsl-ink text-lsl-cream hover:bg-lsl-ink hover:brightness-110 md:w-auto">
        Start your project
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
      </Button>
      <button type="button" onClick={onStartDesigning} className="text-sm font-medium text-lsl-graphite underline-offset-4 transition-colors hover:text-lsl-ink hover:underline">
        Or browse the catalog
      </button>
    </div>
  </motion.div>
</div>
```
(The secondary link previously pointed to `#about`, which no longer exists — repoint it to a real action; using `onStartDesigning` is acceptable, or wire a catalog callback if preferred. Keep it simple.)

- [ ] **Step 2b: Typecheck + visual**

Run: `npx tsc --noEmit` (no new errors). Visual: CTA is a light cream section with a white bordered panel, dark heading, navy accent, dark primary button — no navy block, no texture.

---

### Task 7: Footer — flatten

**Files:**
- Modify: `components/Footer.tsx`

- [ ] **Step 1: Remove texture + glow**

Delete `<StitchPattern />` usage and the `StitchPattern` function. Delete the glow `<div className="absolute right-[-20%] bottom-[-20%] -z-10 ... bg-lsl-navy/30 blur-[140px]" />`. Keep `bg-lsl-ink` and all content/columns. The `relative isolate overflow-hidden` on `<footer>` can stay or be simplified to `relative`.

- [ ] **Step 2: Typecheck + visual**

Run: `npx tsc --noEmit` (no new errors). Visual: footer is flat dark `lsl-ink`, no diagonal weave, no glow; logo, contact, hours, and bottom bar unchanged.

---

### Task 8: Delete retired files

**Files:**
- Delete: `components/ui/animated-hero.tsx`
- Delete: `components/About.tsx`

**Interfaces:**
- Consumes: confirmation that no file imports these (only `App.tsx` did, updated in Task 4).

- [ ] **Step 1: Confirm no remaining importers**

Run: `grep -rn "animated-hero\|components/About\|from './About'\|{ About }\|{ Hero } from './components/ui/animated-hero'" --include=*.tsx --include=*.ts . | grep -v node_modules`
Expected: no results (App.tsx already swapped). If `About` is referenced anywhere else (e.g. an `#about` anchor link), repoint or remove that reference.

- [ ] **Step 2: Delete the files**

Remove `components/ui/animated-hero.tsx` and `components/About.tsx`.

- [ ] **Step 3: Final typecheck + full visual pass**

Run: `npx tsc --noEmit` (no new errors). Then `npm run dev` and walk the whole homepage top-to-bottom: navbar legible on cream → light hero (carousel right) → marquee (R→L, hover-pause, clickable) → flat Services with light cards → light Bottom CTA → flat dark Footer. Confirm reduced-motion (OS setting) makes the carousel/marquee static.

---

## Self-Review

**Spec coverage:** Hero (T2), carousel moved right (T2.4), marquee live+clickable+R→L (T3), navbar fix (T1), Services flat+all-light (T5), Bottom CTA light (T6), Footer flat dark (T7), App composition + retire old sections (T4, T8). All spec sections covered.

**Placeholder scan:** Marquee hover-pause offers two concrete implementations (framer state-gate or CSS keyframe) with the exact keyframe config — not a TODO. Bottom CTA dead `#about` link explicitly repointed. No "TBD"/"handle edge cases" left.

**Type consistency:** `HeroProps { onShopCatalog, onStartProject }` matches App T4 usage. `CatalogMarquee({ onNavigateToCatalog })` matches T4. `MarqueeItem`/`MarqueeCard` names consistent across T3 steps. `getAllProducts` signature matches `lib/supabase.ts`.
