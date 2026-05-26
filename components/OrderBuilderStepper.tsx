import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';

import { cn } from '../lib/utils';

export type StepState = 'incomplete' | 'valid' | 'error' | 'current';

export type Step = {
  id: string;
  label: string;
  state: StepState;
};

interface OrderBuilderStepperProps {
  steps: Step[];
  onJump: (id: string) => void;
}

const stateStyles: Record<StepState, string> = {
  incomplete: 'border-lsl-stone bg-white text-lsl-graphite',
  valid: 'border-lsl-navy bg-lsl-navy text-lsl-cream',
  error: 'border-red-500 bg-red-50 text-red-600',
  current: 'border-lsl-ink bg-lsl-ink text-lsl-cream',
};

export const OrderBuilderStepper: React.FC<OrderBuilderStepperProps> = ({
  steps,
  onJump,
}) => {
  const completedCount = steps.filter((s) => s.state === 'valid').length;
  const progressPct = (completedCount / steps.length) * 100;

  return (
    <div className="sticky top-16 z-30 -mx-6 border-b border-lsl-stone bg-lsl-cream/90 px-6 py-3 backdrop-blur-md md:top-[72px] md:-mx-10 md:px-10">
      <div className="mx-auto flex max-w-3xl items-center gap-3 md:gap-5">
        <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-lsl-graphite md:block">
          Progress
        </p>
        <ol className="flex flex-1 items-center gap-2 md:gap-3" aria-label="Order builder progress">
          {steps.map((step, i) => {
            const active = step.state === 'current';
            return (
              <li key={step.id} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onJump(step.id)}
                  aria-current={active ? 'step' : undefined}
                  className="group flex flex-1 items-center gap-2 text-left"
                >
                  <span
                    className={cn(
                      'grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border-2 font-mono text-[11px] font-semibold tabular-nums transition-colors',
                      stateStyles[step.state],
                    )}
                  >
                    {step.state === 'valid' ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    ) : step.state === 'error' ? (
                      <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
                    ) : (
                      String(i + 1).padStart(2, '0')
                    )}
                  </span>
                  <span
                    className={cn(
                      'hidden truncate text-xs font-medium md:inline',
                      active ? 'text-lsl-ink' : 'text-lsl-graphite group-hover:text-lsl-ink',
                    )}
                  >
                    {step.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-px flex-1 transition-colors',
                      step.state === 'valid' ? 'bg-lsl-navy' : 'bg-lsl-stone',
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
        <div className="ml-2 hidden items-center gap-2 md:flex">
          <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-lsl-stone">
            <motion.div
              className="absolute inset-y-0 left-0 bg-lsl-navy"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
          <span className="font-mono text-[10px] tabular-nums text-lsl-graphite">
            {completedCount}/{steps.length}
          </span>
        </div>
      </div>
    </div>
  );
};
