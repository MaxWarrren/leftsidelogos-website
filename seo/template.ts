// ---------------------------------------------------------------------------
// Renders the static SEO landing pages (one HTML string each). Pages are
// fully self-contained: inlined brand CSS, real crawlable content, and
// JSON-LD. They link back into the React SPA at "/" and cross-link each other.
// ---------------------------------------------------------------------------

import { BUSINESS, CORE_SERVICES, SHARED_FAQS, type Business, type Faq } from './business';
import { CITIES, type City } from './cities';
import { SERVICES, type Service } from './services';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Serialize JSON-LD safely so a stray "</script>" can't break out. */
function jsonLd(data: unknown): string {
  const json = JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

function postalAddress(b: Business) {
  return {
    '@type': 'PostalAddress',
    streetAddress: b.street,
    addressLocality: b.city,
    addressRegion: b.region,
    postalCode: b.postalCode,
    addressCountry: b.country,
  };
}

function faqSchema(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

function breadcrumb(b: Business, trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${b.domain}${t.path}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// Shared CSS — brand tokens inlined so each page is a single fast request.
// ---------------------------------------------------------------------------

const STYLES = `
:root{
  --cream:#F7F4EE;--ink:#0B0B0E;--navy:#003380;--graphite:#4A4D55;
  --stone:#E5E0D6;--thread:#C2A45F;--white:#fff;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  font-family:"Graphik Web Regular",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:var(--ink);background:var(--cream);line-height:1.55;-webkit-font-smoothing:antialiased;
}
.wrap{max-width:72rem;margin:0 auto;padding:0 1.5rem}
a{color:var(--navy);text-decoration:none}
a:hover{text-decoration:underline}
h1,h2,h3{font-family:"Graphik TT Medium","Graphik Web Regular",-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.1;letter-spacing:-0.015em;font-weight:600}
/* Header */
header.site{position:sticky;top:0;z-index:10;background:rgba(247,244,238,.9);backdrop-filter:blur(8px);border-bottom:1px solid var(--stone)}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
header.site img{height:34px;width:auto}
header.site .brand{display:flex;align-items:center;gap:.6rem;font-family:"Graphik TT Medium",sans-serif;font-weight:600;font-size:1.05rem;color:var(--ink)}
header.site .tel{font-weight:600;font-size:.95rem}
/* Hero */
.hero{padding:4rem 0 2.5rem}
.kicker{color:var(--navy);font-weight:600;font-size:.85rem;text-transform:uppercase;letter-spacing:.04em}
.hero h1{font-size:2.4rem;margin:.6rem 0 1rem}
.hero p.lead{font-size:1.12rem;color:var(--graphite);max-width:46rem}
.cta-row{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.75rem}
.btn{display:inline-flex;align-items:center;gap:.4rem;padding:.8rem 1.4rem;border-radius:999px;font-weight:600;font-size:.95rem;border:1px solid transparent}
.btn-primary{background:var(--ink);color:var(--cream)}
.btn-primary:hover{filter:brightness(1.15);text-decoration:none}
.btn-secondary{border-color:rgba(11,11,14,.18);color:var(--ink)}
.btn-secondary:hover{background:var(--ink);color:var(--cream);text-decoration:none}
/* Sections */
section{padding:2.5rem 0}
section h2{font-size:1.6rem;margin-bottom:1.25rem}
.prose p{color:var(--graphite);max-width:48rem;margin-bottom:1rem;font-size:1.03rem}
.grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))}
.card{background:var(--white);border:1px solid var(--stone);border-radius:14px;padding:1.1rem 1.2rem}
.card h3{font-size:1.05rem;margin-bottom:.35rem}
.card p{color:var(--graphite);font-size:.92rem}
ul.ticks{list-style:none;display:grid;gap:.55rem;margin:.5rem 0 0}
ul.ticks li{padding-left:1.4rem;position:relative;color:var(--graphite)}
ul.ticks li::before{content:"";position:absolute;left:0;top:.55em;width:.5rem;height:.5rem;border-radius:2px;background:var(--thread)}
/* FAQ */
details{border-bottom:1px solid var(--stone);padding:1rem 0}
details summary{font-weight:600;cursor:pointer;list-style:none;font-size:1.02rem}
details summary::-webkit-details-marker{display:none}
details summary::after{content:"+";float:right;color:var(--navy)}
details[open] summary::after{content:"–"}
details p{margin-top:.6rem;color:var(--graphite)}
/* Link clusters */
.linkcluster{display:flex;flex-wrap:wrap;gap:.5rem .9rem;margin-top:.5rem}
.linkcluster a{font-size:.95rem}
/* Footer */
footer.site{background:var(--ink);color:rgba(247,244,238,.78);margin-top:3rem;padding:3rem 0 2rem}
footer.site .cols{display:grid;gap:2rem;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))}
footer.site h4{color:rgba(247,244,238,.65);font-size:.8rem;text-transform:uppercase;letter-spacing:.04em;font-family:"Graphik Web Regular",sans-serif;font-weight:600;margin-bottom:.75rem}
footer.site a{color:rgba(247,244,238,.8)}
footer.site a:hover{color:var(--cream)}
footer.site .legal{border-top:1px solid rgba(247,244,238,.12);margin-top:2rem;padding-top:1.25rem;font-size:.85rem;color:rgba(247,244,238,.55)}
@media(min-width:768px){.hero h1{font-size:3rem}}
`;

// ---------------------------------------------------------------------------
// Shared shell
// ---------------------------------------------------------------------------

interface ShellOptions {
  title: string;
  description: string;
  canonicalPath: string; // e.g. "/areas/ofallon-mo/"
  bodyHtml: string;
  jsonLdBlocks: unknown[];
}

function renderShell(o: ShellOptions): string {
  const b = BUSINESS;
  const canonical = `${b.domain}${o.canonicalPath}`;
  const ld = o.jsonLdBlocks.map(jsonLd).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(o.title)}</title>
<meta name="description" content="${escapeHtml(o.description)}" />
<link rel="canonical" href="${canonical}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="icon" type="image/png" href="/icon.png" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${escapeHtml(o.title)}" />
<meta property="og:description" content="${escapeHtml(o.description)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${b.ogImage}" />
<meta property="og:site_name" content="${escapeHtml(b.name)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(o.title)}" />
<meta name="twitter:description" content="${escapeHtml(o.description)}" />
<meta name="twitter:image" content="${b.ogImage}" />
<style>${STYLES}</style>
${ld}
</head>
<body>
<header class="site">
  <div class="wrap">
    <a class="brand" href="/"><img src="/LSL_Logo.png" alt="${escapeHtml(b.name)} logo" style="filter:brightness(0)" /> ${escapeHtml(b.name)}</a>
    <a class="tel" href="tel:${b.phoneE164}">${escapeHtml(b.phoneDisplay)}</a>
  </div>
</header>
<main>
${o.bodyHtml}
</main>
${renderFooter()}
</body>
</html>`;
}

function renderFooter(): string {
  const b = BUSINESS;
  const cityLinks = CITIES.map(
    (c) => `<a href="/areas/${c.slug}/">${escapeHtml(c.name)}, ${c.region}</a>`,
  ).join('');
  const serviceLinks = SERVICES.map(
    (s) => `<a href="/services/${s.slug}/">${escapeHtml(s.name)}</a>`,
  ).join('');
  return `<footer class="site">
  <div class="wrap">
    <div class="cols">
      <div>
        <div class="brand" style="color:var(--cream);font-family:'Graphik TT Medium',sans-serif;font-weight:600;font-size:1.1rem;margin-bottom:.6rem">${escapeHtml(b.name)}</div>
        <p style="max-width:20rem;font-size:.9rem">Premium embroidery, screen printing, and full-service custom merch — made in ${escapeHtml(b.city)}, ${b.region}.</p>
        <p style="margin-top:1rem;font-size:.9rem">${escapeHtml(b.street)}<br/>${escapeHtml(b.city)}, ${b.region} ${b.postalCode}<br/><a href="tel:${b.phoneE164}">${escapeHtml(b.phoneDisplay)}</a><br/>${escapeHtml(b.hoursDisplay)}</p>
      </div>
      <div>
        <h4>Services</h4>
        <div style="display:grid;gap:.45rem;font-size:.92rem">${serviceLinks}</div>
      </div>
      <div>
        <h4>Areas served</h4>
        <div style="display:grid;gap:.45rem;font-size:.92rem">${cityLinks}</div>
      </div>
    </div>
    <div class="legal">© ${new Date().getFullYear()} ${escapeHtml(b.name)} · Custom apparel in ${escapeHtml(b.city)}, ${b.region} · <a href="/">Home</a></div>
  </div>
</footer>`;
}

// Shared building blocks --------------------------------------------------

function servicesGrid(): string {
  const cards = SERVICES.map(
    (s) =>
      `<a class="card" href="/services/${s.slug}/"><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.intro)}</p></a>`,
  ).join('');
  return `<div class="grid">${cards}</div>`;
}

function faqBlock(faqs: Faq[]): string {
  return faqs
    .map(
      (f) =>
        `<details><summary>${escapeHtml(f.question)}</summary><p>${escapeHtml(f.answer)}</p></details>`,
    )
    .join('');
}

function ctaRow(): string {
  return `<div class="cta-row">
    <a class="btn btn-primary" href="/">Start your order</a>
    <a class="btn btn-secondary" href="tel:${BUSINESS.phoneE164}">Call ${escapeHtml(BUSINESS.phoneDisplay)}</a>
  </div>`;
}

// ---------------------------------------------------------------------------
// City page
// ---------------------------------------------------------------------------

export function renderCityPage(city: City): string {
  const b = BUSINESS;
  const title = `Custom Apparel & Embroidery in ${city.name}, ${city.region} | ${b.name}`;
  const description = `Custom embroidery, screen printing, and team apparel for ${city.name}, ${city.region}. Made in-house in ${b.city} — 10,000+ orders fulfilled, 2–3 week turnaround. Get a same-day proof and quote.`;
  const canonicalPath = `/areas/${city.slug}/`;

  const otherCities = CITIES.filter((c) => c.slug !== city.slug);
  const cityLinkCluster = otherCities
    .map((c) => `<a href="/areas/${c.slug}/">${escapeHtml(c.name)}</a>`)
    .join('');

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${b.domain}/#business`,
    name: b.name,
    image: b.logo,
    url: `${b.domain}${canonicalPath}`,
    telephone: b.phoneE164,
    priceRange: b.priceRange,
    description: `Custom apparel, embroidery, and screen printing serving ${city.name}, ${city.region}.`,
    address: postalAddress(b),
    geo: { '@type': 'GeoCoordinates', latitude: b.latitude, longitude: b.longitude },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0', reviewCount: '21' },
    areaServed: { '@type': 'City', name: `${city.name}, ${city.region}` },
    sameAs: [b.facebook],
  };

  const bodyHtml = `
<section class="hero">
  <div class="wrap">
    <p class="kicker">Custom apparel · ${escapeHtml(city.name)}, ${city.region}</p>
    <h1>Custom Embroidery &amp; Apparel in ${escapeHtml(city.name)}, ${city.region}</h1>
    <p class="lead">${escapeHtml(city.intro)}</p>
    ${ctaRow()}
  </div>
</section>

<section>
  <div class="wrap prose">
    <h2>Serving ${escapeHtml(city.name)} from our ${escapeHtml(b.city)} shop</h2>
    <p>${escapeHtml(city.localNote)} Our shop is ${escapeHtml(city.driveTime)}, in ${escapeHtml(city.county)}, so ${escapeHtml(city.name)} orders are produced locally — embroidery, screen printing, and DTF all under one roof — and you can pick up free or have it shipped.</p>
    <p>Send us your logo and we’ll come back with a proof and a quote, usually the same day. Embroidery has no minimum; screen printing is best for larger runs.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>What we make for ${escapeHtml(city.name)} teams &amp; businesses</h2>
    ${servicesGrid()}
  </div>
</section>

<section>
  <div class="wrap">
    <h2>${escapeHtml(city.name)} custom apparel — FAQ</h2>
    ${faqBlock(SHARED_FAQS)}
  </div>
</section>

<section>
  <div class="wrap prose">
    <h2>Also serving nearby</h2>
    <div class="linkcluster">${cityLinkCluster}</div>
  </div>
</section>`;

  return renderShell({
    title,
    description,
    canonicalPath,
    bodyHtml,
    jsonLdBlocks: [
      localBusiness,
      breadcrumb(b, [
        { name: 'Home', path: '/' },
        { name: 'Areas Served', path: '/areas/' },
        { name: `${city.name}, ${city.region}`, path: canonicalPath },
      ]),
      faqSchema(SHARED_FAQS),
    ],
  });
}

// ---------------------------------------------------------------------------
// Service page
// ---------------------------------------------------------------------------

export function renderServicePage(service: Service): string {
  const b = BUSINESS;
  const title = `${service.headline} in ${b.city}, ${b.region} | ${b.name}`;
  const description = `${service.intro} Serving ${b.city} and the greater St. Louis metro.`;
  const canonicalPath = `/services/${service.slug}/`;

  const otherServices = SERVICES.filter((s) => s.slug !== service.slug);
  const serviceLinkCluster = otherServices
    .map((s) => `<a href="/services/${s.slug}/">${escapeHtml(s.name)}</a>`)
    .join('');
  const cityLinkCluster = CITIES.map(
    (c) => `<a href="/areas/${c.slug}/">${escapeHtml(c.name)}</a>`,
  ).join('');

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.headline,
    serviceType: service.name,
    description: service.intro,
    areaServed: { '@type': 'State', name: 'Missouri' },
    provider: {
      '@type': 'ClothingStore',
      name: b.name,
      image: b.logo,
      telephone: b.phoneE164,
      address: postalAddress(b),
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0', reviewCount: '21' },
    },
  };

  const detailItems = service.details
    .map((d) => `<li>${escapeHtml(d)}</li>`)
    .join('');

  const bodyHtml = `
<section class="hero">
  <div class="wrap">
    <p class="kicker">${escapeHtml(service.name)} · ${escapeHtml(b.city)}, ${b.region}</p>
    <h1>${escapeHtml(service.headline)} in ${escapeHtml(b.city)}, ${b.region}</h1>
    <p class="lead">${escapeHtml(service.intro)}</p>
    ${ctaRow()}
  </div>
</section>

<section>
  <div class="wrap prose">
    <h2>Why teams choose us for ${escapeHtml(service.name.toLowerCase())}</h2>
    <p>${escapeHtml(service.bestFor)}</p>
    <ul class="ticks">${detailItems}</ul>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>${escapeHtml(service.name)} — FAQ</h2>
    ${faqBlock(SHARED_FAQS)}
  </div>
</section>

<section>
  <div class="wrap prose">
    <h2>More of what we do</h2>
    <div class="linkcluster">${serviceLinkCluster}</div>
    <h2 style="margin-top:1.75rem">Areas we serve</h2>
    <div class="linkcluster">${cityLinkCluster}</div>
  </div>
</section>`;

  return renderShell({
    title,
    description,
    canonicalPath,
    bodyHtml,
    jsonLdBlocks: [
      serviceSchema,
      breadcrumb(b, [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services/' },
        { name: service.name, path: canonicalPath },
      ]),
      faqSchema(SHARED_FAQS),
    ],
  });
}

// ---------------------------------------------------------------------------
// Index pages for /areas/ and /services/ (hub pages)
// ---------------------------------------------------------------------------

export function renderAreasIndex(): string {
  const b = BUSINESS;
  const cards = CITIES.map(
    (c) =>
      `<a class="card" href="/areas/${c.slug}/"><h3>${escapeHtml(c.name)}, ${c.region}</h3><p>${escapeHtml(c.county)}</p></a>`,
  ).join('');
  const bodyHtml = `
<section class="hero">
  <div class="wrap">
    <p class="kicker">Areas served</p>
    <h1>Custom Apparel Across the St. Louis Metro</h1>
    <p class="lead">${escapeHtml(b.name)} produces custom embroidery, screen printing, and team apparel in-house in ${escapeHtml(b.city)}, ${b.region}, serving St. Charles County and the greater St. Louis area.</p>
    ${ctaRow()}
  </div>
</section>
<section><div class="wrap"><div class="grid">${cards}</div></div></section>`;
  return renderShell({
    title: `Areas We Serve — Custom Apparel in the St. Louis Metro | ${b.name}`,
    description: `Left Side Logos serves O'Fallon, St. Charles, St. Peters, Wentzville, and the greater St. Louis metro with custom embroidery, screen printing, and team apparel.`,
    canonicalPath: '/areas/',
    bodyHtml,
    jsonLdBlocks: [
      breadcrumb(b, [
        { name: 'Home', path: '/' },
        { name: 'Areas Served', path: '/areas/' },
      ]),
    ],
  });
}

export function renderServicesIndex(): string {
  const b = BUSINESS;
  const cards = SERVICES.map(
    (s) =>
      `<a class="card" href="/services/${s.slug}/"><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.intro)}</p></a>`,
  ).join('');
  const bodyHtml = `
<section class="hero">
  <div class="wrap">
    <p class="kicker">Services</p>
    <h1>Custom Apparel &amp; Merch Services</h1>
    <p class="lead">Everything ${escapeHtml(b.name)} makes — embroidery, screen printing, DTF transfers, patches, team apparel, and promotional products — produced under one roof in ${escapeHtml(b.city)}, ${b.region}.</p>
    ${ctaRow()}
  </div>
</section>
<section><div class="wrap"><div class="grid">${cards}</div></div></section>`;
  return renderShell({
    title: `Custom Apparel & Merch Services in ${b.city}, ${b.region} | ${b.name}`,
    description: `Embroidery, screen printing, DTF transfers, patches, team apparel, and promo products — made in-house in ${b.city}, ${b.region}.`,
    canonicalPath: '/services/',
    bodyHtml,
    jsonLdBlocks: [
      breadcrumb(b, [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services/' },
      ]),
    ],
  });
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

export function renderSitemap(): string {
  const b = BUSINESS;
  const today = new Date().toISOString().slice(0, 10);
  const urls: { loc: string; priority: string }[] = [
    { loc: '/', priority: '1.0' },
    { loc: '/services/', priority: '0.8' },
    { loc: '/areas/', priority: '0.8' },
    ...SERVICES.map((s) => ({ loc: `/services/${s.slug}/`, priority: '0.7' })),
    ...CITIES.map((c) => ({ loc: `/areas/${c.slug}/`, priority: '0.7' })),
  ];
  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${b.domain}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// Re-export data for the generator.
export { CITIES, SERVICES, BUSINESS, CORE_SERVICES };
