// ---------------------------------------------------------------------------
// Single source of truth for NAP (Name / Address / Phone) and other business
// facts used across the generated SEO landing pages, JSON-LD, and sitemap.
// Keep this in sync with the JSON-LD in index.html.
// ---------------------------------------------------------------------------

export interface Business {
  name: string;
  legalName: string;
  domain: string; // no trailing slash
  phoneDisplay: string;
  phoneE164: string;
  email: string;
  street: string;
  city: string;
  region: string; // state abbreviation
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  hoursDisplay: string;
  facebook: string;
  logo: string; // absolute URL
  ogImage: string; // absolute URL
  priceRange: string;
}

export const BUSINESS: Business = {
  name: 'Left Side Logos',
  legalName: 'Left Side Logos',
  domain: 'https://leftsidelogos.com',
  phoneDisplay: '(314) 583-5431',
  phoneE164: '+1-314-583-5431',
  email: 'leftsidelogos@gmail.com',
  street: '29 West Industrial Dr',
  city: "O'Fallon",
  region: 'MO',
  postalCode: '63366',
  country: 'US',
  latitude: 38.7706,
  longitude: -90.6998,
  hoursDisplay: 'Mon–Fri 9:00 AM–4:30 PM',
  facebook: 'https://facebook.com/leftsidelogos',
  logo: 'https://leftsidelogos.com/LSL_Logo.png',
  ogImage: 'https://leftsidelogos.com/LSL_Logo.png',
  priceRange: '$$',
};

// Services offered everywhere — reused in the "What we do" block on every page
// and in the LocalBusiness OfferCatalog schema.
export const CORE_SERVICES: string[] = [
  'Custom Embroidery',
  'Screen Printing',
  'Direct-to-Film (DTF) Transfers',
  'Leather & Acrylic Patches',
  'Team & League Apparel',
  'Promotional Products',
];

// Shared FAQ reused (as FAQPage schema + visible accordion) on every generated
// page. Mirrors the homepage FAQ so AI answer engines see consistent facts.
export interface Faq {
  question: string;
  answer: string;
}

export const SHARED_FAQS: Faq[] = [
  {
    question: 'What is the typical turnaround?',
    answer:
      'Most jobs run 2–3 weeks from approved proof to shipped boxes. Rush is available on shirts, hats, and patches — just say so up front and we can usually compress to 5–7 business days.',
  },
  {
    question: 'Do you have minimum order quantities?',
    answer:
      'Embroidery has no minimum. Screen printing is best at 24+ pieces. DTF and heat transfer are flexible — we run as few as a single shirt if you need it.',
  },
  {
    question: 'What file format do you need for logos?',
    answer:
      'Vector files (SVG, AI, EPS, PDF) are ideal because we can resize without quality loss. High-resolution PNGs (300dpi, transparent background) work well too. If all you have is a JPG, we can usually recreate it for a small one-time fee.',
  },
  {
    question: 'How does shipping and pickup work?',
    answer:
      "Local pickup in O'Fallon, MO is free. We ship anywhere in the continental US — flat-rate boxes for small orders, freight for big team rollouts. Drop-shipping to individuals is available for merch-store projects.",
  },
];
