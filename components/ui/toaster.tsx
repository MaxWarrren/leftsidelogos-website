import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-lsl-ink group-[.toaster]:border group-[.toaster]:border-lsl-stone group-[.toaster]:shadow-lsl-lift group-[.toaster]:rounded-xl',
          description: 'group-[.toast]:text-lsl-graphite',
          actionButton:
            'group-[.toast]:bg-lsl-navy group-[.toast]:text-lsl-cream',
          cancelButton:
            'group-[.toast]:bg-lsl-stone group-[.toast]:text-lsl-ink',
        },
      }}
    />
  );
}

export { toast } from 'sonner';
