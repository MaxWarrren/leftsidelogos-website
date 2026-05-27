import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Button } from './ui/button';

interface BottomCTAProps {
  onStartDesigning: () => void;
}

export const BottomCTA: React.FC<BottomCTAProps> = ({ onStartDesigning }) => {
  return (
    <section className="relative isolate overflow-hidden bg-lsl-navy text-lsl-cream">
      <StitchOverlay />

      {/* Reserved slot for the Remotion `cta-stitch.mp4` background loop (Step 7). */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-lsl-thread/20 blur-[140px]" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-lsl-cream/10 blur-[160px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="grid items-end gap-12 md:grid-cols-12"
        >
          <div className="md:col-span-8">
            <p className="font-sans text-sm font-semibold text-lsl-thread">
              Ready when you are
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.02em] md:text-6xl lg:text-[4.5rem]">
              Let&apos;s put your
              <br />
              brand on something{' '}
              <span className="text-lsl-thread">real.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-lsl-cream/75 md:text-lg">
              Start a project in minutes. Add the products you want, drop in your logo, and we&apos;ll come back with a proof and a quote — usually same day.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
            <Button
              variant="primary"
              size="xl"
              onClick={onStartDesigning}
              className="group w-full bg-lsl-cream text-lsl-ink hover:bg-lsl-cream hover:brightness-95 md:w-auto"
            >
              Start your project
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Button>
            <a
              href="#about"
              className="text-sm font-medium text-lsl-cream/65 underline-offset-4 transition-colors hover:text-lsl-cream hover:underline"
            >
              Or learn more about us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

function StitchOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, #F7F4EE 0 1px, transparent 1px 18px), repeating-linear-gradient(-45deg, #F7F4EE 0 1px, transparent 1px 18px)',
        backgroundSize: '36px 36px',
      }}
    />
  );
}
