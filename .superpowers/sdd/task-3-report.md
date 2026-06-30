# Task 3 Report — CatalogMarquee Component

## Status
DONE

## Files Changed
- **Created:** `components/CatalogMarquee.tsx`
- **Not modified:** `tailwind.config.js` (no changes required)

## Loop Approach
Used the **framer-motion percentage-based x animation** (preferred approach). The `motion.div` animates `x` from `'0%'` to `'-50%'` over 38s linear infinite, using the duplicated track. Pausing sets `animate={{}}` which freezes the element in place. `tailwind.config.js` was NOT modified.

## Final Contents of `components/CatalogMarquee.tsx`

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getAllProducts } from '../lib/supabase';

type MarqueeItem = { id: string; name: string; image: string; base_price: number };

const FALLBACK: MarqueeItem[] = [
  { id: 'f1', name: 'Richardson 112 Trucker', image: '/catalog_pictures/hats-112-1.png', base_price: 18 },
  { id: 'f2', name: 'Richardson 6511 Rope Hat', image: '/catalog_pictures/hats-6511-1.png', base_price: 22 },
  { id: 'f3', name: 'Premium Hoodie', image: '/AboutUs-3.jpg', base_price: 38 },
  { id: 'f4', name: 'Custom Tee', image: '/AboutUs-4.jpg', base_price: 16 },
  { id: 'f5', name: 'Embroidered Cap', image: '/AboutUs-1.jpg', base_price: 24 },
  { id: 'f6', name: 'Promo & Koozies', image: '/AboutUs-2.jpg', base_price: 6 },
];

function firstImage(p: any): string {
  const imgs = p?.images;
  if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
  return '/AboutUs-4.jpg';
}

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
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/AboutUs-4.jpg';
          }}
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

export function CatalogMarquee({
  onNavigateToCatalog,
}: {
  onNavigateToCatalog: () => void;
}): React.JSX.Element {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const products = await getAllProducts();
        if (!mounted) return;
        const mapped: MarqueeItem[] = (products || [])
          .slice()
          .sort((a: any, b: any) => Number(b?.featured) - Number(a?.featured))
          .slice(0, 8)
          .map((p: any) => ({
            id: String(p.id),
            name: p.name,
            image: firstImage(p),
            base_price: Number(p.base_price ?? 0),
          }));
        setItems(mapped.length > 0 ? mapped : FALLBACK);
      } catch {
        if (mounted) setItems(FALLBACK);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const display = items.length > 0 ? items : FALLBACK;
  const track = useMemo(() => [...display, ...display], [display]);

  return (
    <section className="bg-lsl-cream py-14 md:py-16">
      {/* Header row */}
      <div className="mx-auto flex max-w-7xl items-end justify-between px-6 md:px-10">
        <div>
          <p className="font-sans text-sm font-semibold text-lsl-navy">Popular right now</p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-lsl-ink md:text-3xl">
            From the catalog
          </h2>
        </div>
        <button
          type="button"
          onClick={onNavigateToCatalog}
          className="group inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-lsl-ink hover:text-lsl-navy"
        >
          View all{' '}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Track */}
      <div
        className="mt-8 overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        }}
      >
        {prefersReducedMotion ? (
          /* Static scrollable row for reduced-motion users */
          <div className="flex gap-5 overflow-x-auto px-6 no-scrollbar md:px-10">
            {display.map((p) => (
              <MarqueeCard key={p.id} item={p} onClick={onNavigateToCatalog} />
            ))}
          </div>
        ) : (
          /* Animated marquee — pauses on hover */
          <motion.div
            className="flex w-max gap-5"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            animate={paused ? {} : { x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 38, ease: 'linear' }}
          >
            {track.map((p, i) => (
              <MarqueeCard key={`${p.id}-${i}`} item={p} onClick={onNavigateToCatalog} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Subtle loading indicator — fades out once data arrives */}
      {loading && (
        <p className="mt-4 text-center font-sans text-xs text-lsl-graphite opacity-60">
          Loading…
        </p>
      )}
    </section>
  );
}
```

## tailwind.config.js Changes
None. The framer-motion percentage approach was chosen, so no keyframe additions were needed. The `fontFamily` block was not touched.

## TSC Output

Command: `npx tsc --noEmit` (run from `Website/`)

Result: Exit code 2, but ONLY the 6 pre-existing errors:
- `components/Footer.tsx` lines 31, 69, 110 — framer-motion `Variants` typing issues (pre-existing)
- `components/ui/sheet.tsx` lines 101, 102, 103 — framer-motion `animate` prop typing issues (pre-existing)

**Zero new errors introduced by `CatalogMarquee.tsx`.**

## Notes
- The unused `import type { CatalogProduct }` was removed to keep the file clean; tsc does not flag unused type-only imports as errors but it's better hygiene.
- `loading` state is used in the render (shows a subtle "Loading…" paragraph until data arrives).
- The FALLBACK renders immediately while the async fetch is in-flight, preventing layout shift.
