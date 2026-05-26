// Loose mapping from human color names → canonical CSS hex used for product tinting
// in the Mockup Studio. Heather / blended names map to a representative solid.
// Unknown names fall back to mid-gray so we still render something.

const NAMED_COLORS: Record<string, string> = {
  black: '#0B0B0E',
  white: '#F6F4EE',
  cream: '#F7F4EE',
  ivory: '#F1ECDD',
  natural: '#E8DFC8',
  khaki: '#B5A07D',
  charcoal: '#3A3D43',
  graphite: '#4A4D55',
  grey: '#9A9CA3',
  gray: '#9A9CA3',
  'sport grey': '#A6A8AD',
  'athletic heather': '#A8AAB1',
  'heather grey': '#B0B2B8',
  'heather slate': '#5B6470',
  'dark grey heather': '#52555C',
  navy: '#1F2C53',
  'heather navy': '#2B3656',
  royal: '#1F4FB5',
  'royal blue': '#1F4FB5',
  'true royal': '#2754C2',
  red: '#BE2C2C',
  'cardinal red': '#9B2231',
  'safety green': '#C4F03B',
  'forest green': '#1F4133',
  burgundy: '#5C1A29',
  brown: '#3D2A1E',
  tan: '#C8A672',
  orange: '#D45A1F',
  yellow: '#E8C233',
  pink: '#E68FA8',
  purple: '#553A8A',
  camo: '#5D6A45',
};

const SLASH_RE = /\s*\/\s*/;

export function normalizeColorKey(label: string): string {
  return label.trim().toLowerCase();
}

/**
 * Resolve a Tailwind/CSS hex value from a free-form color label.
 * Handles split colors like "Black/White" by using the first token (the body color).
 */
export function colorToHex(label?: string | null, fallback = '#9A9CA3'): string {
  if (!label) return fallback;
  const key = normalizeColorKey(label);
  if (NAMED_COLORS[key]) return NAMED_COLORS[key];
  const head = key.split(SLASH_RE)[0];
  if (NAMED_COLORS[head]) return NAMED_COLORS[head];
  // Take just the last word (e.g. "Heather Slate" → "slate" — try those too)
  const lastWord = head.split(/\s+/).pop() ?? head;
  if (NAMED_COLORS[lastWord]) return NAMED_COLORS[lastWord];
  return fallback;
}

/** True if a color label is light enough that dark text/handles should be used on top of it. */
export function isLightColor(label?: string | null): boolean {
  const hex = colorToHex(label, '#9A9CA3').replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Relative luminance (sRGB) — same formula WCAG uses.
  const srgb = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return luminance > 0.6;
}
