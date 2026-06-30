import { useEffect } from 'react';

export type PageName =
  | 'home'
  | 'mockup'
  | 'contact'
  | 'build-order'
  | 'catalog'
  | 'portal';

type Meta = { title: string; description: string; noindex?: boolean };

const PAGE_META: Record<PageName, Meta> = {
  home: {
    title: "Custom T-Shirts & Apparel in O'Fallon, MO | Left Side Logos",
    description:
      "Left Side Logos makes custom embroidery, screen printing, and team apparel in O'Fallon, MO. 10,000+ orders fulfilled, 100% in-house, 2–3 week turnaround.",
  },
  catalog: {
    title: 'Custom Apparel Catalog — Hats, Tees & Hoodies | Left Side Logos',
    description:
      "Browse customizable hats, t-shirts, hoodies, and promo products. Add your logo and get a same-day proof from Left Side Logos in O'Fallon, MO.",
  },
  'build-order': {
    title: 'Start a Custom Order | Left Side Logos',
    description:
      'Build your custom apparel order in minutes — pick products, add your logo, and get a proof and quote, usually same day.',
  },
  mockup: {
    title: 'Free Mockup Studio — Preview Your Logo | Left Side Logos',
    description:
      'Upload your logo and preview it on hats, shirts, and hoodies free with the Left Side Logos Mockup Studio.',
  },
  contact: {
    title: "Book a Call | Left Side Logos — O'Fallon, MO",
    description:
      "Schedule a 30-minute call with Left Side Logos. Custom embroidery, screen printing, and merch in O'Fallon, Missouri.",
  },
  portal: {
    title: 'Customer Portal | Left Side Logos',
    description: 'Track your custom apparel orders, messages, and files.',
    noindex: true,
  },
};

function upsertMeta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Imperatively syncs <title>, meta description, and the robots tag to the
 * active SPA view. Lightweight stand-in for per-route metadata until the app
 * has real URLs.
 */
export function usePageMeta(page: PageName): void {
  useEffect(() => {
    const meta = PAGE_META[page] ?? PAGE_META.home;
    document.title = meta.title;
    upsertMeta('description', meta.description);
    upsertMeta(
      'robots',
      meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    );
  }, [page]);
}
