import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import Cal, { getCalApi } from '@calcom/embed-react';

import { cn } from '../lib/utils';
import { toast } from './ui/toaster';

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

export const ContactPage: React.FC = () => {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: 'test-live' });
      cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
    })();
  }, []);

  return (
    <div className="bg-lsl-cream pt-24 pb-20 md:pt-28">
      <section className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-lsl-navy">
            Get in touch
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-lsl-ink md:text-5xl">
            Book a call.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-lsl-graphite md:text-lg">
            Pick a time below — you&apos;ll talk to the same person from quote through shipped boxes.
          </p>
        </motion.header>

        {/* Cal.com — focal point */}
        <motion.div
          id="contact-calendar"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-lsl-stone bg-white shadow-lsl-card"
        >
          <div className="flex items-center justify-between border-b border-lsl-stone px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-lsl-navy/10 text-lsl-navy">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-lsl-graphite">
                Book a call
              </span>
            </div>
            <span className="hidden font-sans text-[10px] uppercase tracking-[0.18em] text-lsl-graphite md:inline">
              30 min · CT timezone
            </span>
          </div>
          <div className="relative">
            <CalendarSkeleton />
            <div className="relative z-10 p-2 md:p-3">
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
          </div>
        </motion.div>

        {/* Contact methods — compact 4-up grid, footed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <ContactMethod
            icon={Calendar}
            label="Schedule"
            value="30-min call"
            actionHref="#contact-calendar"
            onAction={() => {
              const el = document.getElementById('contact-calendar');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
          <ContactMethod
            icon={Phone}
            label="Call"
            value="(314) 583-5431"
            actionHref="tel:+13145835431"
            onAction={() => {
              navigator.clipboard.writeText('+13145835431').then(
                () => toast.success('Number copied'),
                () => toast.error('Could not copy'),
              );
            }}
          />
          <ContactMethod
            icon={Mail}
            label="Email"
            value="leftsidelogos@gmail.com"
            actionHref="mailto:leftsidelogos@gmail.com"
            onAction={() => {
              navigator.clipboard
                .writeText('leftsidelogos@gmail.com')
                .then(
                  () => toast.success('Email copied'),
                  () => toast.error('Could not copy'),
                );
            }}
          />
          <ContactMethod
            icon={MapPin}
            label="Workshop"
            value="O’Fallon, MO"
            actionHref="https://maps.google.com/?q=29+West+Industrial+Dr,+O%27Fallon,+MO+63366"
          />
        </motion.div>

        <section className="mt-24 md:mt-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-lsl-navy">
              Faqs
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-lsl-ink md:text-4xl">
              Common questions, answered.
            </h2>
            <p className="mt-3 text-sm text-lsl-graphite md:text-base">
              Don&apos;t see yours? Drop it in the call or email us — we&apos;ll add it here.
            </p>
          </motion.div>

          <ul className="mt-10 divide-y divide-lsl-stone border-y border-lsl-stone">
            {FAQS.map((faq, i) => (
              <FaqItem key={faq.q} faq={faq} index={i} />
            ))}
          </ul>
        </section>
      </section>
    </div>
  );
};

function ContactMethod({
  icon: Icon,
  label,
  value,
  onAction,
  actionHref,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  onAction?: () => void;
  actionHref?: string;
}) {
  const isAnchor = actionHref?.startsWith('#');
  const Wrapper: React.ElementType =
    actionHref && !isAnchor ? 'a' : onAction ? 'button' : 'div';
  const wrapperProps: Record<string, unknown> =
    actionHref && !isAnchor
      ? {
          href: actionHref,
          target: actionHref.startsWith('http') ? '_blank' : undefined,
          rel: actionHref.startsWith('http') ? 'noreferrer' : undefined,
          onClick: onAction,
        }
      : onAction
      ? { type: 'button', onClick: onAction }
      : {};
  return (
    <Wrapper
      {...wrapperProps}
      className="group flex h-24 w-full items-center gap-3 rounded-2xl border border-lsl-stone bg-white px-4 text-left shadow-lsl-card transition-all hover:-translate-y-0.5 hover:border-lsl-ink/30 hover:shadow-lsl-lift"
    >
      <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-lsl-navy/8 text-lsl-navy">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-lsl-graphite">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-lsl-ink">
          {value}
        </p>
      </div>
    </Wrapper>
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

function CalendarSkeleton() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex flex-col gap-3 p-6">
      <div className="h-6 w-40 rounded-md skeleton" />
      <div className="grid grid-cols-7 gap-2 pt-3">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-md skeleton" />
        ))}
      </div>
    </div>
  );
}
