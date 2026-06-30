/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        lsl: {
          // Legacy tokens kept for backward compatibility with existing components.
          black: '#0B0B0E',
          grey: '#4A4D55',
          blue: '#003380',
          light: '#F7F4EE',
          // New scale (see design-system/plan).
          ink: '#0B0B0E',
          navy: {
            DEFAULT: '#003380',
            50: '#EAF0FA',
            700: '#002259',
          },
          cream: '#F7F4EE',
          stone: '#E5E0D6',
          graphite: '#4A4D55',
          thread: '#C2A45F',
        },
      },
      fontFamily: {
        sans: ['"Graphik Web Regular"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Graphik TT Medium"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-xl': ['6rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'lsl-card': '0 1px 2px rgba(11, 11, 14, 0.04)',
        'lsl-lift': '0 8px 24px rgba(11, 11, 14, 0.08)',
      },
      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'shimmer': 'shimmer 1.8s linear infinite',
        'fade-in': 'fade-in 200ms ease-out both',
        'marquee': 'marquee 38s linear infinite',
        'blink': 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
