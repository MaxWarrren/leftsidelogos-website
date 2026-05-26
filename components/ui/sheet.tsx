import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { cn } from '../../lib/utils';

type Side = 'right' | 'left' | 'bottom' | 'top';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: Side;
  className?: string;
  children: React.ReactNode;
  title?: string;
  description?: string;
  showClose?: boolean;
};

const sideMotion: Record<
  Side,
  { initial: object; animate: object; exit: object; positionClass: string }
> = {
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    positionClass:
      'top-0 right-0 h-full w-full max-w-md border-l border-lsl-stone',
  },
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    positionClass:
      'top-0 left-0 h-full w-full max-w-md border-r border-lsl-stone',
  },
  bottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    positionClass:
      'bottom-0 left-0 w-full max-h-[85vh] border-t border-lsl-stone rounded-t-2xl',
  },
  top: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' },
    positionClass:
      'top-0 left-0 w-full max-h-[85vh] border-b border-lsl-stone rounded-b-2xl',
  },
};

export function Sheet({
  open,
  onOpenChange,
  side = 'right',
  className,
  children,
  title,
  description,
  showClose = true,
}: SheetProps) {
  const config = sideMotion[side];

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-lsl-ink/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            aria-describedby={description ? 'sheet-desc' : undefined}
            initial={config.initial}
            animate={config.animate}
            exit={config.exit}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute flex flex-col bg-lsl-cream shadow-lsl-lift',
              config.positionClass,
              className,
            )}
          >
            {(title || showClose) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2 className="font-display text-xl font-semibold text-lsl-ink">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="sheet-desc" className="mt-1 text-sm text-lsl-graphite">
                      {description}
                    </p>
                  )}
                </div>
                {showClose && (
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    aria-label="Close"
                    className="rounded-md p-2 text-lsl-graphite transition-colors hover:bg-lsl-stone/60 hover:text-lsl-ink"
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
