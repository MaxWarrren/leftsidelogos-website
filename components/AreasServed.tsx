import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

import { CITIES } from '../seo/cities';
import { SERVICES } from '../seo/services';

// Real on-page content + internal links into the generated static landing
// pages (/areas/* and /services/*). These are plain <a> tags on purpose: they
// do a full navigation out of the SPA to the crawlable static page.
export function AreasServed(): React.JSX.Element {
  return (
    <section className="bg-lsl-cream py-16 md:py-20">
      <div className="mx-auto max-w-[88rem] px-6 md:px-10">
        <div className="max-w-2xl">
          <p className="font-sans text-sm font-semibold text-lsl-navy">Areas we serve</p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-lsl-ink md:text-3xl">
            Custom apparel across the St. Louis metro.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-lsl-graphite md:text-[17px]">
            Everything is made in-house at our O&apos;Fallon, Missouri shop and delivered
            across St. Charles County and the greater St. Louis area — embroidery, screen
            printing, and full-service merch with free local pickup.
          </p>
        </div>

        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3"
        >
          {CITIES.map((city) => (
            <li key={city.slug}>
              <a
                href={`/areas/${city.slug}/`}
                className="group flex items-center gap-2.5 rounded-xl border border-lsl-stone bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-lsl-navy/30 hover:shadow-lsl-card"
              >
                <MapPin className="h-4 w-4 flex-shrink-0 text-lsl-thread" strokeWidth={1.75} />
                <span className="font-sans text-sm font-medium text-lsl-ink">
                  {city.name}, {city.region}
                </span>
              </a>
            </li>
          ))}
        </motion.ul>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-lsl-stone pt-6">
          <span className="font-sans text-sm font-semibold text-lsl-ink">What we do:</span>
          {SERVICES.map((svc) => (
            <a
              key={svc.slug}
              href={`/services/${svc.slug}/`}
              className="font-sans text-sm text-lsl-graphite underline-offset-4 transition-colors hover:text-lsl-navy hover:underline"
            >
              {svc.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
