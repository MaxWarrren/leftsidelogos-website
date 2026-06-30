import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Button } from './ui/button';

interface BottomCTAProps {
  onStartDesigning: () => void;
  onBrowseCatalog: () => void;
}

export const BottomCTA: React.FC<BottomCTAProps> = ({ onStartDesigning, onBrowseCatalog }) => {
  return (
    <section className="bg-lsl-cream">
      <div className="mx-auto max-w-[88rem] px-6 py-20 md:px-10 md:py-28">
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
            <p className="mt-6 flex items-baseline gap-2.5">
              <span className="font-display text-2xl font-semibold tabular-nums text-lsl-ink">
                2–3 wk
              </span>
              <span className="font-sans text-sm text-lsl-graphite">
                average turnaround, with rush available on most jobs.
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
            <Button variant="primary" size="xl" onClick={onStartDesigning}
              className="group w-full bg-lsl-ink text-lsl-cream hover:bg-lsl-ink hover:brightness-110 md:w-auto">
              Start your project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Button>
            <button type="button" onClick={onBrowseCatalog}
              className="text-sm font-medium text-lsl-graphite underline-offset-4 transition-colors hover:text-lsl-ink hover:underline">
              Or browse the catalog
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
