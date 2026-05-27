import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  FileCheck,
  Flame,
  Layers,
  MessageSquare,
  MousePointerClick,
  Package,
  PackageCheck,
  PenTool,
  Printer,
  Scissors,
} from 'lucide-react';

import { cn } from '../lib/utils';

type Service = {
  icon: typeof Flame;
  title: string;
  desc: string;
  tag?: string;
};

const services: Service[] = [
  {
    icon: Scissors,
    title: 'Embroidery',
    desc: 'Premium thread on polos, hats, and outerwear. Digitized in-house so the stitch sits exactly where it should.',
    tag: 'Signature service',
  },
  {
    icon: Flame,
    title: 'Heat transfer',
    desc: 'Bold, washable vinyl graphics pressed onto garments.',
  },
  {
    icon: Printer,
    title: 'Direct to film',
    desc: 'Photographic detail and full color, even on dark fabrics.',
  },
  {
    icon: Layers,
    title: 'Leather patches',
    desc: 'Laser-engraved leather on hats and outerwear for a heritage feel.',
  },
  {
    icon: Box,
    title: 'Acrylic patches',
    desc: 'Dimensional, modern branding with clean edges and a sleek finish.',
  },
  {
    icon: Package,
    title: 'Fulfillment',
    desc: 'We pack and ship straight to your team, customers, or event.',
  },
];

type Step = {
  id: number;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const timelineSteps: Step[] = [
  {
    id: 1,
    title: 'Build order',
    desc: 'Use the Order Builder to put your project together and (optionally) preview your logo in the Mockup Studio.',
    icon: MousePointerClick,
  },
  {
    id: 2,
    title: 'Onboarding',
    desc: 'A quick call to lock in brand direction, file formats, and timeline expectations.',
    icon: MessageSquare,
  },
  {
    id: 3,
    title: 'Design',
    desc: 'We refine artwork and stitch files. You approve every detail before anything goes to production.',
    icon: PenTool,
  },
  {
    id: 4,
    title: 'Invoice',
    desc: 'Final quantities locked, secure payment, and your slot reserved on the production schedule.',
    icon: FileCheck,
  },
  {
    id: 5,
    title: 'Production',
    desc: 'In-house production begins. Average turnaround is 2–3 weeks; rush available on most jobs.',
    icon: PackageCheck,
  },
];

export const Services: React.FC = () => {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-lsl-cream py-24 md:py-32"
    >
      <PaperTexture />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeader
          eyebrow="What we do"
          title={
            <>
              Every method,
              <br className="hidden md:block" />{' '}
              <span className="text-lsl-graphite">under one roof.</span>
            </>
          }
          intro="Six in-house production methods. One project manager. Zero ‘we’ll get back to you’."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <ServiceCard
              key={service.title}
              service={service}
              anchor={idx === 0}
            />
          ))}
        </div>

        <ProcessSection />
      </div>
    </section>
  );
};

function ServiceCard({ service, anchor = false }: { service: Service; anchor?: boolean }) {
  const Icon = service.icon;
  if (anchor) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="group relative isolate flex flex-col overflow-hidden rounded-2xl border border-lsl-ink bg-lsl-ink p-6 text-lsl-cream shadow-lsl-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lsl-lift"
      >
        <div className="pointer-events-none absolute -right-12 -top-10 -z-10 h-56 w-56 rounded-full bg-lsl-thread/25 blur-[100px]" />
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-lsl-cream/15 bg-lsl-cream/5 text-lsl-thread">
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
          {service.tag && (
            <span className="rounded-full border border-lsl-thread/40 bg-lsl-thread/10 px-2.5 py-1 font-sans text-xs font-medium text-lsl-thread">
              {service.tag}
            </span>
          )}
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold leading-tight text-lsl-cream">
          {service.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-lsl-cream/75">
          {service.desc}
        </p>
        <p className="mt-4 font-sans text-xs font-medium text-lsl-thread">
          Our signature craft →
        </p>
      </motion.article>
    );
  }
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col rounded-2xl border border-lsl-stone bg-white p-6 shadow-lsl-card transition-all duration-300 hover:-translate-y-0.5 hover:border-lsl-ink/30 hover:shadow-lsl-lift"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-lsl-navy/8 text-lsl-navy">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold leading-tight text-lsl-ink">
        {service.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-lsl-graphite">
        {service.desc}
      </p>
    </motion.article>
  );
}

function SectionHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-sans text-sm font-semibold text-lsl-navy">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-lsl-ink md:text-5xl lg:text-[3.5rem]">
        {title}
      </h2>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-lsl-graphite md:text-lg">
        {intro}
      </p>
    </div>
  );
}

function ProcessSection() {
  return (
    <div className="mt-32 md:mt-40">
      <SectionHeader
        eyebrow="How it works"
        title={
          <>
            From inquiry to{' '}
            <span className="text-lsl-graphite">finished box.</span>
          </>
        }
        intro="A predictable five-step process — no mystery, no surprise upcharges."
      />

      {/* Mobile / tablet: vertical accordion with always-visible details. */}
      <ol className="mt-12 space-y-4 md:hidden">
        {timelineSteps.map((step) => (
          <MobileStep key={step.id} step={step} />
        ))}
      </ol>

      {/* Desktop: horizontal stepper, also keyboard accessible. */}
      <DesktopTimeline steps={timelineSteps} />
    </div>
  );
}

function MobileStep({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <li className="flex gap-4 rounded-2xl border border-lsl-stone bg-white p-5 shadow-lsl-card">
      <div className="flex flex-col items-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-lsl-navy text-lsl-cream">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <span className="mt-2 font-sans text-xs font-medium text-lsl-graphite tabular-nums">
          Step 0{step.id}
        </span>
      </div>
      <div className="flex-1">
        <h4 className="font-display text-lg font-semibold text-lsl-ink">
          {step.title}
        </h4>
        <p className="mt-1 text-sm leading-relaxed text-lsl-graphite">
          {step.desc}
        </p>
      </div>
    </li>
  );
}

function DesktopTimeline({ steps }: { steps: Step[] }) {
  const [activeId, setActiveId] = useState<number>(1);

  return (
    <div className="relative mt-16 hidden md:block">
      <div className="absolute left-0 right-0 top-7 h-px bg-lsl-stone" />
      <div
        className="absolute left-0 top-7 h-px bg-lsl-navy transition-all duration-300"
        style={{
          width: `${((activeId - 1) / (steps.length - 1)) * 100}%`,
        }}
      />

      <ol
        className="relative grid grid-cols-5 gap-6"
        role="tablist"
        aria-label="Production process steps"
      >
        {steps.map((step) => {
          const Icon = step.icon;
          const active = activeId === step.id;
          return (
            <li key={step.id} className="flex flex-col items-center text-center">
              <button
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`step-panel-${step.id}`}
                onMouseEnter={() => setActiveId(step.id)}
                onFocus={() => setActiveId(step.id)}
                onClick={() => setActiveId(step.id)}
                className={cn(
                  'group relative grid h-14 w-14 place-items-center rounded-full border-2 transition-all duration-300',
                  active
                    ? 'border-lsl-navy bg-lsl-navy text-lsl-cream shadow-lsl-lift'
                    : 'border-lsl-stone bg-white text-lsl-graphite hover:border-lsl-navy/40',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                <span className="sr-only">{step.title}</span>
              </button>
              <p className="mt-4 font-sans text-xs font-medium tabular-nums text-lsl-graphite">
                Step 0{step.id}
              </p>
              <h4
                className={cn(
                  'mt-1 font-display text-base font-semibold transition-colors',
                  active ? 'text-lsl-ink' : 'text-lsl-graphite',
                )}
              >
                {step.title}
              </h4>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 min-h-[120px] rounded-2xl border border-lsl-stone bg-white p-8 shadow-lsl-card">
        {steps.map((step) => (
          <div
            key={step.id}
            id={`step-panel-${step.id}`}
            role="tabpanel"
            hidden={activeId !== step.id}
          >
            {activeId === step.id && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="font-display text-2xl font-semibold text-lsl-ink">
                  {step.title}
                </p>
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-lsl-graphite">
                  {step.desc}
                </p>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PaperTexture() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          'radial-gradient(#0B0B0E 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    />
  );
}
