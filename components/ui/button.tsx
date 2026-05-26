import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium tracking-tight transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lsl-navy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-lsl-cream disabled:cursor-not-allowed disabled:bg-lsl-stone disabled:text-lsl-graphite/60 disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-lsl-navy text-lsl-cream shadow-lsl-card hover:bg-lsl-navy-700 hover:shadow-lsl-lift active:scale-[0.98]',
        secondary:
          'border border-lsl-ink/90 bg-transparent text-lsl-ink hover:bg-lsl-ink hover:text-lsl-cream active:scale-[0.98]',
        ghost:
          'bg-transparent text-lsl-ink underline-offset-4 hover:underline',
        outline:
          'border border-lsl-stone bg-white text-lsl-ink hover:border-lsl-ink hover:shadow-lsl-card',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
        link:
          'h-auto p-0 text-lsl-navy underline-offset-4 hover:underline',
        // Legacy alias used by older components; keep until they are refactored.
        default:
          'bg-lsl-ink text-lsl-cream hover:bg-lsl-ink/90 active:scale-[0.98]',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-5',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-base',
        icon: 'h-11 w-11',
        // Legacy alias kept for backward compatibility.
        default: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
