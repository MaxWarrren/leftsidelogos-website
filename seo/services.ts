// ---------------------------------------------------------------------------
// Service landing pages. One entry => one crawlable static page at
// /services/<slug>/. Each targets a distinct search intent
// ("screen printing O'Fallon MO", "custom embroidery near me", etc.).
// ---------------------------------------------------------------------------

export interface Service {
  slug: string; // e.g. "screen-printing"
  name: string; // "Screen Printing"
  /** <title>/H1 friendly phrase, e.g. "Custom Screen Printing" */
  headline: string;
  /** 1–2 sentence intro for the hero + meta description seed. */
  intro: string;
  /** Bulleted specifics (minimums, materials, turnaround). */
  details: string[];
  /** Good-fit use cases. */
  bestFor: string;
}

export const SERVICES: Service[] = [
  {
    slug: 'embroidery',
    name: 'Embroidery',
    headline: 'Custom Embroidery',
    intro:
      'Crisp, durable embroidered logos on hats, polos, jackets, and bags — digitized and stitched in-house in O’Fallon, MO with no minimum order.',
    details: [
      'No minimum quantity — order a single hat or a thousand polos',
      'Logo digitizing handled in-house for clean, accurate stitching',
      'Hats, beanies, polos, quarter-zips, jackets, bags, and more',
      'Left-chest, full-back, sleeve, and cap-front placements',
    ],
    bestFor:
      'Corporate uniforms, company hats, country-club and HOA wear, and anyone who wants a premium, long-lasting finish.',
  },
  {
    slug: 'screen-printing',
    name: 'Screen Printing',
    headline: 'Custom Screen Printing',
    intro:
      'Vibrant, long-lasting screen-printed shirts, hoodies, and team apparel at true bulk pricing — printed on our presses in O’Fallon, Missouri.',
    details: [
      'Best value at 24+ pieces; multi-color designs welcome',
      'Soft-hand and standard plastisol inks',
      'Tees, hoodies, crewnecks, tanks, and performance wear',
      'Consistent color across large quantities',
    ],
    bestFor:
      'Team rosters, fundraisers, events, school spirit wear, and any larger run where per-piece price matters.',
  },
  {
    slug: 'dtf-transfers',
    name: 'DTF Transfers',
    headline: 'DTF (Direct-to-Film) Transfers',
    intro:
      'Full-color, photo-quality prints with no minimum — direct-to-film transfers let us run a single custom shirt or short batches without screen-printing setup.',
    details: [
      'No minimum — perfect for one-offs and small batches',
      'Full-color, photo-realistic detail and gradients',
      'Works on cotton, blends, and performance fabrics',
      'Durable, stretchy prints that survive the wash',
    ],
    bestFor:
      'Single custom pieces, small businesses testing designs, and complex full-color artwork.',
  },
  {
    slug: 'patches',
    name: 'Patches',
    headline: 'Custom Patches',
    intro:
      'Leather, acrylic, and embroidered patches that give hats and jackets a premium, branded look — made and applied in-house.',
    details: [
      'Leather, faux-leather, acrylic, and embroidered options',
      'Laser-cut and engraved for clean, sharp edges',
      'Applied to hats, beanies, jackets, and bags',
      'Great for a high-end, retail-style finish',
    ],
    bestFor:
      'Premium hat programs, brand merch, breweries and shops, and anyone wanting a standout patch look.',
  },
  {
    slug: 'team-apparel',
    name: 'Team Apparel',
    headline: 'Custom Team & League Apparel',
    intro:
      'Complete custom kits for sports teams and leagues — names, numbers, rosters, and matching gear for players, coaches, and parents.',
    details: [
      'Player names and numbers, coach and staff wear',
      'Jerseys, hoodies, hats, bags, and spirit wear',
      'Online team stores available for larger programs',
      'Coordinated looks across the whole roster',
    ],
    bestFor:
      'Youth and club sports, school teams, rec leagues, and tournament organizers.',
  },
  {
    slug: 'promo-products',
    name: 'Promotional Products',
    headline: 'Promotional Products & Branded Merch',
    intro:
      'Branded koozies, drinkware, bags, and giveaways that put your logo in customers’ hands — sourced and decorated alongside your apparel order.',
    details: [
      'Koozies, tumblers, water bottles, and drinkware',
      'Tote bags, drawstring bags, and backpacks',
      'Event giveaways and trade-show swag',
      'One coordinated order with your apparel',
    ],
    bestFor:
      'Events, trade shows, grand openings, and marketing giveaways.',
  },
];
