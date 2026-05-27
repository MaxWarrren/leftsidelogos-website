import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';
import { ArrowRight, ChevronRight, Pause, Play } from 'lucide-react';

import { Button } from './button';

interface HeroProps {
  onStartDesigning: () => void;
}

const rotatingAudiences = [
  'sports team.',
  'small business.',
  'Greek org.',
  'local event.',
  'corporation.',
  'crew.',
];

const trustStrip = [
  'Embroidery',
  'Screen Printing',
  'DTF Transfer',
  'Leather Patches',
  'Fulfillment',
  'No Minimums',
  'In-House Production',
  'Missouri Made',
];

function Hero({ onStartDesigning }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [titleIndex, setTitleIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const titles = useMemo(() => rotatingAudiences, []);
  const hovered = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion || paused) return;
    const interval = setInterval(() => {
      if (hovered.current) return;
      setTitleIndex((i) => (i + 1) % titles.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [paused, prefersReducedMotion, titles.length]);

  return (
    <section
      id="home"
      aria-label="Custom merchandise hero"
      className="relative isolate overflow-hidden bg-lsl-ink text-lsl-cream"
    >
      {/* Workshop photo */}
      <img
        src="/hero-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-30 h-full w-full object-cover"
      />
      {/* Navy tint so the photo reads as brand, not stock. Strong on left where
         the copy lives, softer on the right to let the workshop scene through. */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-r from-lsl-ink/95 via-lsl-navy/80 to-lsl-navy/55" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-t from-lsl-ink/70 via-transparent to-lsl-ink/30" />
      <StitchGrid />
      <div className="pointer-events-none absolute -top-32 right-[-12%] -z-10 h-[520px] w-[520px] rounded-full bg-lsl-thread/20 blur-[160px]" />

      <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col px-6 pb-12 pt-28 md:px-10 md:pt-32">
        <div className="flex flex-1 flex-col items-start justify-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-lsl-cream/20 bg-lsl-cream/10 px-3 py-1 text-xs font-medium text-lsl-cream/80 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-lsl-thread" />
            Premium custom apparel · Made in Missouri
          </motion.div>

          <h1 className="mt-8 max-w-[18ch] font-display text-[clamp(2.5rem,6.5vw,5.75rem)] font-semibold leading-[1.02] tracking-[-0.02em]">
            <span className="block text-lsl-cream/70">Custom merch for your</span>
            <span
              className="relative mt-1 block min-h-[1.15em]"
              onMouseEnter={() => {
                hovered.current = true;
              }}
              onMouseLeave={() => {
                hovered.current = false;
              }}
              onFocus={() => {
                hovered.current = true;
              }}
              onBlur={() => {
                hovered.current = false;
              }}
            >
              {prefersReducedMotion ? (
                <span className="text-lsl-cream">your brand.</span>
              ) : (
                <span
                  className="relative inline-block"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <AnimatePresence initial={false} mode="wait">
                    <motion.span
                      key={titles[titleIndex]}
                      initial={{ y: '60%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: '-60%', opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 320,
                        damping: 28,
                        opacity: { duration: 0.18 },
                      }}
                      className="inline-block text-lsl-cream"
                    >
                      {titles[titleIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              )}
              {!prefersReducedMotion && (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={
                    paused
                      ? 'Resume rotating audience text'
                      : 'Pause rotating audience text'
                  }
                  aria-pressed={paused}
                  className="absolute -right-12 top-1/2 hidden -translate-y-1/2 rounded-full border border-lsl-cream/20 bg-lsl-cream/5 p-2 text-lsl-cream/60 transition-colors hover:border-lsl-cream/40 hover:text-lsl-cream md:inline-flex"
                >
                  {paused ? (
                    <Play className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    <Pause className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                </button>
              )}
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-lsl-cream/75 md:text-lg">
            Embroidery, screen printing, DTF, patches — every step handled in-house, with proofs you actually approve before we touch a press.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="primary"
              size="xl"
              onClick={onStartDesigning}
              className="group bg-lsl-cream text-lsl-ink hover:bg-lsl-cream hover:text-lsl-ink hover:brightness-95"
            >
              Start a project
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Button>
            <a href="#about" className="sm:w-auto">
              <Button
                variant="secondary"
                size="xl"
                className="w-full border-lsl-cream/30 text-lsl-cream hover:bg-lsl-cream hover:text-lsl-ink sm:w-auto"
              >
                See the catalog
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </Button>
            </a>
          </div>

          <dl className="mt-14 grid w-full max-w-2xl grid-cols-3 gap-6 border-t border-lsl-cream/10 pt-8 md:gap-10">
            <HeroStat value="10k+" label="Orders fulfilled" />
            <HeroStat value="2-3 wk" label="Avg turnaround" />
            <HeroStat value="100%" label="In-house" />
          </dl>
        </div>
      </div>

      <TrustMarquee items={trustStrip} reduced={!!prefersReducedMotion} />
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-display text-3xl font-semibold tracking-tight text-lsl-cream md:text-4xl">
        <span className="tabular-nums">{value}</span>
      </dd>
      <p className="mt-1 font-sans text-sm text-lsl-cream/60">
        {label}
      </p>
    </div>
  );
}

function StitchGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
      style={{
        backgroundImage:
          'linear-gradient(to right, #F7F4EE 1px, transparent 1px), linear-gradient(to bottom, #F7F4EE 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage:
          'radial-gradient(ellipse at center top, black 35%, transparent 75%)',
      }}
    />
  );
}

function TrustMarquee({
  items,
  reduced,
}: {
  items: string[];
  reduced: boolean;
}) {
  // Duplicate for seamless scroll.
  const doubled = useMemo(() => [...items, ...items], [items]);

  return (
    <div className="relative border-y border-lsl-cream/10 bg-lsl-navy-700/40 py-4">
      <div
        className="overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        {reduced ? (
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 px-6 font-sans text-sm text-lsl-cream/70">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <motion.ul
            initial={{ x: 0 }}
            animate={{ x: '-50%' }}
            transition={{
              repeat: Infinity,
              duration: 38,
              ease: 'linear',
            }}
            className="flex w-max gap-12 px-6 font-sans text-sm text-lsl-cream/60"
          >
            {doubled.map((item, idx) => (
              <li key={`${item}-${idx}`} className="flex items-center gap-12">
                <span>{item}</span>
                <span aria-hidden="true" className="text-lsl-thread/60">
                  ·
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}

export { Hero };
