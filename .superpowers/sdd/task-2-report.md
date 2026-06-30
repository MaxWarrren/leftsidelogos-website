# Task 2 Report — `components/Hero.tsx`

## Status: DONE

---

## Files Changed

- **CREATED**: `c:\Users\maxwe\Proton Drive\maxwell\My files\Axion Digital\Clients\Left Side Logos\Website\components\Hero.tsx`

---

## Hero.tsx — Final Contents

```tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from './ui/button';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Carousel data (ported from About.tsx)
// ---------------------------------------------------------------------------

const IMAGES = [
  { src: '/AboutUs-1.jpg', caption: 'Headwear · embroidered' },
  { src: '/AboutUs-2.jpg', caption: 'Promo & koozies' },
  { src: '/AboutUs-3.jpg', caption: 'Hoodies · screen-printed' },
  { src: '/AboutUs-4.jpg', caption: 'Tees · DTF transfer' },
  { src: '/AboutUs-5.jpg', caption: 'Decals & signage' },
];

const ROTATION_MS = 5200;

// ---------------------------------------------------------------------------
// Stat helper
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export interface HeroProps {
  onShopCatalog: () => void;
  onStartProject: () => void;
}

export function Hero({ onShopCatalog, onStartProject }: HeroProps): React.JSX.Element {
  // Carousel state
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const regionRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((next: number) => {
    setIndex(((next % IMAGES.length) + IMAGES.length) % IMAGES.length);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, ROTATION_MS);
    return () => clearInterval(timer);
  }, [paused, prefersReducedMotion]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  return (
    <section id="home" className="bg-lsl-cream pt-28 pb-20 md:pt-32 md:pb-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-12 md:gap-16 md:px-10 md:items-center">

        {/* LEFT column — editorial copy */}
        <div className="md:col-span-6">
          <p className="font-sans text-sm font-semibold text-lsl-navy">
            Custom apparel · O'Fallon, MO
          </p>

          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-lsl-ink md:text-5xl lg:text-[3.5rem]">
            Craft you can feel,
            <br className="hidden md:block" />{' '}
            <span className="text-lsl-graphite">delivered on time.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-lsl-graphite md:text-[17px]">
            We make custom apparel and merch the way it should be made — every
            detail reviewed, every proof approved, and every order produced
            under one roof in O&apos;Fallon, Missouri.
          </p>

          {/* CTA row */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="primary"
              size="xl"
              onClick={onShopCatalog}
              className="group bg-lsl-ink text-lsl-cream hover:bg-lsl-ink hover:brightness-110"
            >
              Shop the catalog
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
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

          {/* Stats row */}
          <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-lsl-stone pt-8 md:gap-10">
            <Stat value="10,000+" label="Orders fulfilled" />
            <Stat value="100%" label="In-house production" />
            <Stat value="2–3 wk" label="Avg turnaround" />
          </div>
        </div>

        {/* RIGHT column — image carousel */}
        <div className="md:col-span-6">
          <div
            ref={regionRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Recent Left Side Logos projects"
            tabIndex={0}
            onKeyDown={onKey}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="group relative h-[340px] w-full overflow-hidden rounded-3xl bg-lsl-stone shadow-lsl-lift md:h-[480px]"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={IMAGES[index].src}
                src={IMAGES[index].src}
                alt={IMAGES[index].caption}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000';
                }}
              />
            </AnimatePresence>

            {/* Gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lsl-ink/65 via-lsl-ink/10 to-transparent" />

            {/* Caption + nav arrows */}
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
              <div className="text-lsl-cream">
                <p className="font-sans text-xs font-medium text-lsl-cream/70">
                  <span className="tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true"> / </span>
                  <span className="tabular-nums">
                    {String(IMAGES.length).padStart(2, '0')}
                  </span>
                </p>
                <p className="mt-1 font-display text-lg font-semibold leading-tight md:text-xl">
                  {IMAGES[index].caption}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous project"
                  onClick={() => goTo(index - 1)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-lsl-cream/30 bg-lsl-ink/40 text-lsl-cream backdrop-blur-sm transition-colors hover:bg-lsl-cream hover:text-lsl-ink"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label="Next project"
                  onClick={() => goTo(index + 1)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-lsl-cream/30 bg-lsl-ink/40 text-lsl-cream backdrop-blur-sm transition-colors hover:bg-lsl-cream hover:text-lsl-ink"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Progress dot tablist */}
            <div
              className="absolute left-5 right-5 top-5 flex gap-1"
              role="tablist"
              aria-label="Choose project image"
            >
              {IMAGES.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show ${img.caption}`}
                  onClick={() => goTo(i)}
                  className="group/dot relative h-1 flex-1 overflow-hidden rounded-full bg-lsl-cream/25 transition-colors hover:bg-lsl-cream/45"
                >
                  <span
                    className={cn(
                      'absolute inset-y-0 left-0 block bg-lsl-cream transition-[width] duration-300',
                      i < index && 'w-full',
                      i === index && 'w-full',
                      i > index && 'w-0',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
```

---

## TSC Command + Output

Command: `npx tsc --noEmit` from Website directory

Output (relevant lines only — pre-existing errors only, zero from Hero.tsx):

```
components/Footer.tsx(31,13): error TS2322: ...framer-motion Variants typing... (pre-existing)
components/Footer.tsx(69,13): error TS2322: ...framer-motion Variants typing... (pre-existing)
components/Footer.tsx(110,13): error TS2322: ...framer-motion Variants typing... (pre-existing)
components/ui/sheet.tsx(101,13): error TS2322: ...framer-motion typing... (pre-existing)
components/ui/sheet.tsx(102,13): error TS2322: ...framer-motion typing... (pre-existing)
components/ui/sheet.tsx(103,13): error TS2322: ...framer-motion typing... (pre-existing)
```

**Hero.tsx: 0 errors.**

---

## Notes

- Initial draft used bare `JSX.Element` as return type; this caused `TS2503: Cannot find namespace 'JSX'` because the tsconfig uses `"jsx": "react-jsx"` which does not put `JSX` in the global namespace. Fixed by using `React.JSX.Element` and adding `React` to the named import.
- The `Stat` helper is a module-private function (not exported), matching the spec.
- The carousel container uses `md:h-[480px]` (vs About.tsx's `md:h-[520px]`) per the spec — the side-by-side hero layout has less vertical breathing room than the full-width About section.
