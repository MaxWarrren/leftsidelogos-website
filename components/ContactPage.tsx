import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Cal, { getCalApi } from '@calcom/embed-react';

export const ContactPage: React.FC = () => {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: 'test-live' });
      cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
    })();
  }, []);

  return (
    <div className="bg-lsl-cream pt-24 pb-20 md:pt-28">
      <section className="mx-auto max-w-[88rem] px-6 md:px-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="font-sans text-sm font-semibold text-lsl-navy">
            Get in touch
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-lsl-ink md:text-5xl">
            Book a call.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-lsl-graphite md:text-lg">
            Pick a time below — you&apos;ll talk to the same person from quote through shipped boxes.
          </p>
        </motion.header>

        {/* Cal.com embed — no surrounding box */}
        <div id="contact-calendar" className="mx-auto mt-12 max-w-4xl">
          <Cal
            namespace="test-live"
            calLink="brad-gunn-q42thj/test-live"
            style={{
              width: '100%',
              minHeight: '600px',
              overflow: 'scroll',
            }}
            config={{ layout: 'month_view' }}
          />
        </div>
      </section>
    </div>
  );
};
