import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Star } from 'lucide-react';

type Review = { name: string; meta: string; when: string; text: string };

const REVIEWS: Review[] = [
  {
    name: 'Nicole F',
    meta: '8 reviews · 1 photo',
    when: '2 months ago',
    text: "Loved working with Left Side Logos! Fast turnaround, great quality, and super easy to deal with. They're responsive, helpful, and really care about getting things right. Couldn't be happier with the result!",
  },
  {
    name: 'Nick Wetzel',
    meta: '7 reviews · 4 photos',
    when: '2 months ago',
    text: "Great quality and service with quick turnaround. Have had team and company hats, shirts and hoodies done by them. They also stepped up to sponsor our youth athletic team. You won't be disappointed.",
  },
  {
    name: 'Ben Holste',
    meta: '4 reviews',
    when: '2 months ago',
    text: "Purchased hats for my business. Couldn't be more satisfied. Great service. Will use again!",
  },
  {
    name: 'Nancy Gunn',
    meta: '6 reviews · 1 photo',
    when: '2 months ago',
    text: 'Left Side Logos provides top quality products. They get your products to you when you need them. Brad is great to work with. He makes sure your buying experience always goes well so you will become a repeat customer.',
  },
  {
    name: 'Jordyn Grimes',
    meta: '2 reviews',
    when: '2 months ago',
    text: 'Great business! Amazing quality products, and an extremely friendly staff!',
  },
  {
    name: 'amanda gulick',
    meta: 'Local Guide · 17 reviews · 16 photos',
    when: '2 months ago',
    text: 'Very quick to print with great customer service. 100 percent the best to work with!!!',
  },
  {
    name: 'Kelvin Lee',
    meta: '4 reviews',
    when: '2 months ago',
    text: 'Really easy to work with. Great products. Loved my order.',
  },
];

const AVATAR_COLORS = [
  'bg-[#1a73e8]',
  'bg-[#188038]',
  'bg-[#c5221f]',
  'bg-[#e37400]',
  'bg-[#9334e6]',
  'bg-[#0b8043]',
  'bg-[#b06000]',
];

const EDGE_MASK =
  'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function Stars({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span className="inline-flex" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${className} fill-[#fbbc04] text-[#fbbc04]`}
          strokeWidth={0}
        />
      ))}
    </span>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <article className="flex w-[340px] flex-shrink-0 flex-col rounded-2xl border border-lsl-stone bg-white p-5 shadow-lsl-card">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full font-sans text-sm font-semibold text-white ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
          aria-hidden="true"
        >
          {initials(review.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-lsl-ink">
            {review.name}
          </p>
          <p className="truncate font-sans text-xs text-lsl-graphite">{review.meta}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Stars className="h-3.5 w-3.5" />
        <span className="font-sans text-xs text-lsl-graphite">{review.when}</span>
      </div>
      <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-lsl-graphite">
        {review.text}
      </p>
    </article>
  );
}

export function Reviews(): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const track = useMemo(() => [...REVIEWS, ...REVIEWS], []);

  return (
    <section aria-label="Customer reviews" className="bg-lsl-cream py-16 md:py-20">
      <div className="mx-auto max-w-[88rem] px-6 md:px-10">
        {/* Header: heading + Google rating */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-sm font-semibold text-lsl-navy">Reviews</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-lsl-ink md:text-4xl">
              Loved by teams across the Midwest.
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-display text-4xl font-semibold tabular-nums text-lsl-ink">
              5.0
            </span>
            <div>
              <Stars className="h-5 w-5" />
              <p className="mt-1 font-sans text-sm text-lsl-graphite">
                <span className="tabular-nums">21</span> Google reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal marquee — constrained to content width, faded at edges */}
      <div className="mx-auto mt-10 max-w-[88rem] px-6 md:px-10">
        {prefersReducedMotion ? (
          <div className="no-scrollbar flex gap-5 overflow-x-auto">
            {REVIEWS.map((review, i) => (
              <ReviewCard key={review.name} review={review} index={i} />
            ))}
          </div>
        ) : (
          <div
            className="overflow-hidden"
            style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
          >
            <div
              className="flex w-max gap-5 animate-marquee hover:[animation-play-state:paused]"
              style={{ animationDuration: '60s' }}
            >
              {track.map((review, i) => (
                <ReviewCard key={`${review.name}-${i}`} review={review} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
