import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '../lib/utils';

const IMAGES = [
  { src: '/AboutUs-1.jpg', caption: 'Headwear · embroidered' },
  { src: '/AboutUs-2.jpg', caption: 'Promo & koozies' },
  { src: '/AboutUs-3.jpg', caption: 'Hoodies · screen-printed' },
  { src: '/AboutUs-4.jpg', caption: 'Tees · DTF transfer' },
  { src: '/AboutUs-5.jpg', caption: 'Decals & signage' },
];

const ROTATION_MS = 5200;

export const About: React.FC = () => {
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
    <section
      id="about"
      className="bg-lsl-cream py-24 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-14 px-6 md:grid-cols-12 md:gap-16 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-5"
        >
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
            className="group relative h-[340px] w-full overflow-hidden rounded-3xl bg-lsl-stone shadow-lsl-lift md:h-[520px]"
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

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lsl-ink/65 via-lsl-ink/10 to-transparent" />

            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
              <div className="text-lsl-cream">
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-lsl-cream/70">
                  <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                  <span aria-hidden="true"> / </span>
                  <span className="tabular-nums">{String(IMAGES.length).padStart(2, '0')}</span>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7 md:pt-6"
        >
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-lsl-navy">
            About · Est. 2023
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-lsl-ink md:text-5xl lg:text-[3.5rem]">
            Craft you can feel,
            <br className="hidden md:block" />
            <span className="text-lsl-graphite">delivered on time.</span>
          </h2>

          <div className="mt-7 max-w-xl space-y-5 text-base leading-relaxed text-lsl-graphite md:text-[17px]">
            <p>
              We make custom apparel and merch the way it should be made — every detail reviewed, every proof approved, and every order produced under one roof in O&apos;Fallon, Missouri.
            </p>
            <p>
              From a single embroidered cap to a full team rollout, we handle the artwork, the production, and the packing. You get a partner who actually answers the phone, not a faceless print broker.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-lsl-stone pt-8 md:gap-10">
            <Stat value="10,000+" label="Orders fulfilled" />
            <Stat value="100%" label="In-house production" />
            <Stat value="2–3 wk" label="Avg turnaround" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-semibold tracking-tight text-lsl-ink md:text-4xl">
        <span className="tabular-nums">{value}</span>
      </p>
      <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.18em] text-lsl-graphite">
        {label}
      </p>
    </div>
  );
}
