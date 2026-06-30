# Left Side Logos — Local SEO & AI Visibility (GEO) Report

**Page audited:** Homepage / landing page (Vite + React SPA)
**Business:** Left Side Logos — custom apparel, embroidery, screen printing & merch
**Location:** 29 West Industrial Dr, O'Fallon, MO 63366 · 314-583-5431
**Date:** 2026-06-30
**Method:** opc-skills `seo-geo` (SEO + Generative Engine Optimization)

---

## 1. Executive Summary

The homepage looks great but is **nearly invisible to search engines and AI assistants.** The root cause is structural, not cosmetic:

1. **It's a client-rendered SPA.** The served HTML is an empty `<div id="root">`. Google *can* render JS (slowly), but **Bing, ChatGPT (GPTBot), Perplexity, and Claude's crawlers largely do not execute JavaScript** — they see a blank page. Since AI assistants cite what they can *read*, this single issue caps your GEO ceiling at almost zero.
2. **No on-page SEO signals.** `index.html` has only a `<title>` — no meta description, canonical, Open Graph, or structured data.
3. **No local SEO scaffolding.** No `LocalBusiness` schema, no `robots.txt`, no `sitemap.xml`, and NAP (Name/Address/Phone) appears only in JS-rendered footer text.
4. **No AI-citable content.** No FAQ schema, no statistics-rich answer-first copy — the formats AI engines preferentially cite.

**The good news:** every gap here is fixable with static files and `index.html` edits. The biggest lever (getting real HTML to crawlers) is a configuration change, not a rewrite.

**Current scorecard:**

| Signal | Status | Notes |
|---|---|---|
| Crawlable HTML content | ❌ | Empty SPA shell; content is JS-only |
| `<title>` | ⚠️ | Present but not localized/keyworded |
| Meta description | ❌ | Missing |
| Open Graph / Twitter cards | ❌ | Missing — no link previews |
| Canonical URL | ❌ | Missing |
| `LocalBusiness` schema | ❌ | Missing — critical for local |
| `FAQPage` schema | ❌ | Missing — +40% AI citation lever |
| `robots.txt` | ❌ | Missing |
| `sitemap.xml` | ❌ | Missing |
| AI bot access | ⚠️ | Not blocked, but nothing to read |
| Mobile-friendly | ✅ | Responsive Tailwind layout |
| HTTPS / page speed | ✅ | Vite build is light & fast |

---

## 2. The #1 Priority: Make the Page Readable to Crawlers

Everything else in this report multiplies in value once crawlers can read the page. Pick one of these, in order of preference:

**Option A — Pre-render the homepage to static HTML (recommended).**
Keep the SPA, but ship a fully-rendered `index.html` at build time so the first byte already contains your copy + schema. Lowest effort for an existing Vite app:
- `vite-plugin-prerender` or `vite-plugin-ssg`, or
- `react-snap` (post-build crawler that snapshots routes to static HTML), or
- a hosting-level prerender (Cloudflare/Netlify prerendering, Prerender.io) that serves static HTML to bots.

**Option B — Migrate to SSR/SSG (Next.js).** Highest-quality outcome (the Portal is already Next.js 16, so the stack is familiar), but it's a real migration. Worth it if organic search becomes a primary channel.

**Option C — Static content fallback in `index.html` (do this regardless).** Even before pre-rendering, put real, keyword-rich content and all JSON-LD schema directly in `index.html` (`<head>` + a `<noscript>` block). Schema in raw HTML is read by every engine and is the single fastest win. Sections 4–6 below are written to be pasted straight into `index.html` today.

> **Why this matters for AI specifically:** AI search engines don't rank pages — they *cite sources*. A source they can't read can't be cited. Getting real HTML + schema in front of GPTBot/PerplexityBot/ClaudeBot is the entire ballgame for GEO.

---

## 3. Local SEO (O'Fallon, MO)

### 3.1 Google Business Profile (off-site, highest local ROI)
Local pack rankings are driven more by GBP than by the website. Confirm/optimize:
- **Claim & verify** the Google Business Profile at 29 West Industrial Dr.
- Primary category: **Embroidery shop** or **Screen printing shop**; add secondaries (Promotional products supplier, T-shirt store, Clothing supplier).
- Exact-match NAP to the website footer: `Left Side Logos · 29 West Industrial Dr, O'Fallon, MO 63366 · (314) 583-5431`.
- Hours: Mon–Fri 9:00 AM–4:30 PM (matches site).
- Post photos of real jobs monthly; request reviews from your repeat clients (you have many — see the Trusted By list).
- Add services (embroidery, screen printing, DTF, leather/acrylic patches, fulfillment) with descriptions.

### 3.2 NAP Consistency & Citations
Make the exact NAP string identical everywhere: website, GBP, Facebook, Bing Places, Apple Business Connect, Yelp, and local directories (Nextdoor, Chamber of Commerce of O'Fallon/St. Charles County). Inconsistent NAP is the most common local-ranking killer.

### 3.3 Local Keyword Targets
Build content/headings around intent + geo. Primary cluster:
- "custom embroidery O'Fallon MO" / "St. Charles County"
- "screen printing O'Fallon Missouri"
- "custom t-shirts / company apparel St. Louis area"
- "team uniforms / business merch Missouri"
- "DTF printing near me", "leather patch hats Missouri"

Reflect these in the `<title>`, `<h1>`, meta description, and a localized intro paragraph (Section 4).

### 3.4 `LocalBusiness` JSON-LD (paste into `index.html`)
This is the most important schema for local + the most reliably parsed by AI engines. Uses your real data:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  "name": "Left Side Logos",
  "image": "https://leftsidelogos.com/LSL_Logo.png",
  "description": "Custom apparel, embroidery, screen printing, and full-service merch produced in-house in O'Fallon, Missouri.",
  "@id": "https://leftsidelogos.com/#business",
  "url": "https://leftsidelogos.com",
  "telephone": "+1-314-583-5431",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "29 West Industrial Dr",
    "addressLocality": "O'Fallon",
    "addressRegion": "MO",
    "postalCode": "63366",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 38.7706,
    "longitude": -90.6998
  },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "09:00",
    "closes": "16:30"
  }],
  "sameAs": ["https://facebook.com/leftsidelogos"],
  "areaServed": [
    { "@type": "City", "name": "O'Fallon" },
    { "@type": "City", "name": "St. Charles" },
    { "@type": "City", "name": "St. Louis" },
    { "@type": "State", "name": "Missouri" }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Custom Apparel & Merch Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Custom Embroidery" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Screen Printing" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Direct-to-Film (DTF) Printing" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Leather & Acrylic Patches" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Order Fulfillment & Shipping" } }
    ]
  }
}
</script>
```
> Verify the `geo` coordinates against the real building before publishing (the values above are O'Fallon-approximate). Swap `leftsidelogos.com` for the production domain.

---

## 4. Traditional On-Page SEO (paste into `index.html` `<head>`)

Replace the current `<head>` block with localized, keyword-aware tags:

```html
<title>Custom Apparel & Embroidery in O'Fallon, MO | Left Side Logos</title>
<meta name="description" content="Left Side Logos makes custom embroidery, screen printing, and team apparel in O'Fallon, MO. 10,000+ orders fulfilled, 100% in-house, 2–3 week turnaround. Get a proof and quote — usually same day." />
<link rel="canonical" href="https://leftsidelogos.com/" />
<meta name="robots" content="index, follow, max-image-preview:large" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Custom Apparel & Embroidery in O'Fallon, MO | Left Side Logos" />
<meta property="og:description" content="Custom embroidery, screen printing & merch — made in-house in O'Fallon, Missouri. 10,000+ orders fulfilled, 2–3 week turnaround." />
<meta property="og:url" content="https://leftsidelogos.com/" />
<meta property="og:image" content="https://leftsidelogos.com/LSL_Logo.png" />
<meta property="og:locale" content="en_US" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Custom Apparel & Embroidery in O'Fallon, MO | Left Side Logos" />
<meta name="twitter:description" content="Custom embroidery, screen printing & merch made in-house in O'Fallon, MO." />
<meta name="twitter:image" content="https://leftsidelogos.com/LSL_Logo.png" />
```

**On-page content checklist:**
- [ ] One `<h1>` containing the primary keyword + geo ("Custom Apparel & Embroidery in O'Fallon, MO"). Current hero `<h1>` ("Craft you can feel…") is great branding but carries no keyword — add a visually-styled keyworded line or adjust the eyebrow into real heading text.
- [ ] Descriptive `alt` text on every image (the carousel + marquee images currently use generic captions; make them like `alt="Embroidered company polos by Left Side Logos, O'Fallon MO"`).
- [ ] A short localized intro paragraph near the top with the service+geo keywords woven in naturally (not stuffed).
- [ ] Internal links from homepage to catalog and contact (already present via nav — good).

---

## 5. GEO — Optimizing for AI Search Engines

AI engines cite content that is **structured, factual, and answer-first.** Apply the Princeton GEO methods, prioritized by proven visibility lift:

| Method | Lift | Apply to Left Side Logos |
|---|---|---|
| Cite sources / authority | +40% | Reference real specifics (in-house facility, MO-made, named processes) |
| Statistics addition | +37% | "10,000+ orders fulfilled," "2–3 week turnaround," "100% in-house" — already true, surface them as data |
| Authoritative tone | +25% | Confident, expert phrasing about process & materials |
| Easy-to-understand | +20% | Short, plain answers to buyer questions |
| Technical terms | +18% | DTF, digitized stitch files, Richardson 112, screen vs. heat transfer |
| Fluency | +15–30% | Clean, readable copy (already strong) |
| ~~Keyword stuffing~~ | **−10%** | **Avoid** — don't repeat "custom apparel O'Fallon" unnaturally |

**Best combination: Fluency + Statistics.** You already have the stats; the job is exposing them in crawlable HTML and schema.

### 5.1 FAQ Schema — the single biggest GEO lever (+40% AI citation)
Add a real FAQ section to the page *and* mirror it as `FAQPage` JSON-LD. Answer-first, statistic-bearing answers get cited by ChatGPT/Perplexity/AI Overviews. Paste into `index.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Where is Left Side Logos located?",
      "acceptedAnswer": { "@type": "Answer",
        "text": "Left Side Logos is a custom apparel and embroidery shop at 29 West Industrial Dr, O'Fallon, MO 63366, serving O'Fallon, St. Charles County, and the greater St. Louis area. All work is produced in-house." }
    },
    {
      "@type": "Question",
      "name": "What's the typical turnaround time for custom apparel?",
      "acceptedAnswer": { "@type": "Answer",
        "text": "Average turnaround is 2–3 weeks because production is 100% in-house with no outsourcing. Rush options are available on most jobs, and proofs/quotes are usually returned the same day." }
    },
    {
      "@type": "Question",
      "name": "What decoration methods does Left Side Logos offer?",
      "acceptedAnswer": { "@type": "Answer",
        "text": "Six in-house methods: embroidery, screen printing, direct-to-film (DTF) transfer, leather patches, acrylic patches, and order fulfillment/shipping — all managed by one project manager." }
    },
    {
      "@type": "Question",
      "name": "Is there a minimum order, and do you ship?",
      "acceptedAnswer": { "@type": "Answer",
        "text": "Local pickup in O'Fallon, MO is free. Left Side Logos ships anywhere in the continental US, with flat-rate boxes for small orders and freight for large team rollouts. Drop-shipping to individuals is available for merch-store projects." }
    }
  ]
}
</script>
```
Render the same Q&A visibly on the page (an FAQ block fits naturally below Services or in the BottomCTA area). Schema without matching visible content risks being ignored.

### 5.2 AI Bot Access — confirm in `robots.txt`
Create `public/robots.txt` explicitly welcoming AI crawlers (see Section 6). The default absence isn't blocking them, but an explicit allow + sitemap reference is best practice and signals intent.

### 5.3 Platform notes
- **ChatGPT (GPTBot):** favors branded-domain authority and content updated within ~30 days. Keep the homepage fresh (rotate featured work, update stats).
- **Perplexity (PerplexityBot):** strongly favors FAQ schema and semantic relevance — Section 5.1 directly targets this.
- **Google AI Overviews:** reward E-E-A-T + structured data + authoritative citations (+132% visibility). LocalBusiness + FAQ schema + real reviews drive this.
- **Claude:** uses Brave Search index and prefers high factual density — get listed in Brave, keep copy data-rich.
- **Bing/Copilot:** must be indexed in Bing (submit via Bing Webmaster Tools). Bing barely renders JS, so Section 2 is mandatory for Copilot visibility.

---

## 6. Technical Files to Add

### 6.1 `public/robots.txt`
```
User-agent: *
Allow: /

# AI / answer engines — explicitly welcomed
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: https://leftsidelogos.com/sitemap.xml
```

### 6.2 `public/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://leftsidelogos.com/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://leftsidelogos.com/catalog</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://leftsidelogos.com/build-order</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://leftsidelogos.com/contact</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>
```
> Note: the SPA uses state-based navigation, not URL routes, so `/catalog` etc. aren't real URLs today. Either (a) add real routes/hash-routes so these are crawlable, or (b) list only `/` in the sitemap until routing exists. Real per-page URLs are strongly recommended for SEO — each becomes an indexable, citable surface.

### 6.3 Organization schema (brand entity, helps all engines)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Left Side Logos",
  "url": "https://leftsidelogos.com",
  "logo": "https://leftsidelogos.com/LSL_Logo.png",
  "sameAs": ["https://facebook.com/leftsidelogos"],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-314-583-5431",
    "contactType": "sales",
    "areaServed": "US",
    "availableLanguage": "English"
  }
}
</script>
```

---

## 7. Off-Page / Authority

- **Reviews:** systematically request Google reviews from repeat clients (CarShield, Guaranteed Roofing, Heartland Homes, etc.). Volume + recency of reviews is a top-3 local ranking factor and feeds AI "is this business reputable?" signals.
- **Local backlinks:** O'Fallon/St. Charles Chamber of Commerce, local sports leagues you outfit (Assumption Athletics), supplier partner pages (Richardson, S&S Activewear dealer listings).
- **Bing Webmaster Tools + Google Search Console:** submit the sitemap to both; GSC also surfaces indexing problems caused by the SPA.
- **Consistent citations** across Yelp, Apple Business Connect, Nextdoor, BBB.

---

## 8. Prioritized Action Plan

**P0 — Do first (unlocks everything):**
1. Pre-render the homepage (or at minimum embed all schema + a `<noscript>` content block in `index.html`). — *Section 2*
2. Add `LocalBusiness` + `Organization` + `FAQPage` JSON-LD to `index.html`. — *Sections 3.4, 5.1, 6.3*
3. Add full meta tags (description, canonical, OG, Twitter). — *Section 4*
4. Add `public/robots.txt` and `public/sitemap.xml`. — *Section 6*

**P1 — High impact:**
5. Claim/optimize Google Business Profile; standardize NAP everywhere. — *Section 3.1–3.2*
6. Add a visible FAQ section mirroring the FAQ schema. — *Section 5.1*
7. Localize `<h1>` and add a keyword-aware intro paragraph + image alt text. — *Section 4*
8. Submit sitemap to Google Search Console + Bing Webmaster Tools.

**P2 — Compounding:**
9. Add real per-page URLs (catalog/contact/build-order) so each is indexable/citable.
10. Review-generation campaign to repeat clients.
11. Local backlink + citation building.
12. Keep homepage stats/featured work fresh (≤30-day updates favor AI citation).

**Measurement:** validate schema at `validator.schema.org` and Google Rich Results Test; track impressions/clicks in GSC + Bing WMT; spot-check AI visibility by asking ChatGPT/Perplexity "custom embroidery O'Fallon MO" monthly and watching for citation.

---

*Generated with the opc-skills `seo-geo` skill. Code blocks use Left Side Logos' real NAP data; replace `leftsidelogos.com` with the production domain and verify geo-coordinates before publishing.*
