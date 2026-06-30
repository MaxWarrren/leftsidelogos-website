import React from 'react';

// Pulled from real repeat-business customers in the Square / Portal data.
// Curated for recognizable, official-sounding company names.
const COMPANIES = [
  'CarShield',
  'Little Caesars',
  'Guaranteed Roofing',
  'Heartland Homes',
  'TailorMade Lawn Care',
  'Assumption Athletics',
  'Third Eye Renovation',
  'Matlock Lawncare'
];

export function TrustedBy(): React.JSX.Element {
  return (
    <section
      aria-label="Trusted by"
      className="border-y border-lsl-stone bg-lsl-cream"
    >
      <div className="mx-auto flex max-w-[88rem] flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:gap-8 md:px-10">
        <p className="shrink-0 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-lsl-graphite">
          Trusted by
        </p>

        {/* Horizontal list — scrolls on narrow screens to stay a thin single row */}
        <ul className="no-scrollbar flex items-center gap-x-7 gap-y-2 overflow-x-auto whitespace-nowrap md:flex-wrap md:whitespace-normal">
          {COMPANIES.map((name) => (
            <li
              key={name}
              className="font-display text-sm font-semibold text-lsl-ink/70 transition-colors hover:text-lsl-ink"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
