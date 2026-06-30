import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { cn } from '../lib/utils';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is the typical turnaround?',
    a: 'Most jobs run 2–3 weeks from approved proof to shipped boxes. Rush is available on shirts, hats, and patches — just say so up front and we can usually compress to 5–7 business days.',
  },
  {
    q: 'Do you have minimum order quantities?',
    a: 'Embroidery has no minimum. Screen printing is best at 24+ pieces. DTF and heat transfer are flexible — we run as few as a single shirt if you need it.',
  },
  {
    q: 'What file format do you need for logos?',
    a: 'Vector files (SVG, AI, EPS, PDF) are ideal because we can resize without quality loss. High-resolution PNGs (300dpi, transparent background) work well too. If all you have is a JPG or a screenshot, we can usually recreate it for a small one-time fee.',
  },
  {
    q: 'How does shipping and pickup work?',
    a: 'Local pickup in O’Fallon, MO is free. We ship anywhere in the continental US — flat-rate boxes for small orders, freight for big team rollouts. Drop-shipping to individuals is available for merchandise store projects.',
  },
  {
    q: 'Do you handle artwork design?',
    a: 'Yes. If you have a rough concept or a logo that needs cleanup, our design team can polish it before production. Custom artwork from scratch is billed hourly and quoted in advance.',
  },
];

export function Faq(): React.JSX.Element {
  return (
    <section id="faq" className="bg-lsl-cream py-20 md:py-28">
      <div className="mx-auto max-w-[88rem] px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <p className="font-sans text-sm font-semibold text-lsl-navy">FAQs</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-lsl-ink md:text-4xl">
            Common questions, answered.
          </h2>
          <p className="mt-3 text-sm text-lsl-graphite md:text-base">
            Don&apos;t see yours? Drop it in the call or email us — we&apos;ll add it here.
          </p>
        </motion.div>

        <ul className="mt-10 max-w-4xl divide-y divide-lsl-stone border-y border-lsl-stone">
          {FAQS.map((faq, i) => (
            <FaqItem key={faq.q} faq={faq} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function FaqItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:bg-lsl-cream/60 md:py-6"
      >
        <span className="font-display text-lg font-semibold text-lsl-ink md:text-xl">
          {faq.q}
        </span>
        <span
          className={cn(
            'mt-1 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-lsl-stone text-lsl-graphite transition-all',
            open && 'rotate-180 border-lsl-ink bg-lsl-ink text-lsl-cream',
          )}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-3xl pb-6 pr-12 text-sm leading-relaxed text-lsl-graphite md:text-base">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
