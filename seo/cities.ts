// ---------------------------------------------------------------------------
// City / "areas served" landing pages. One entry => one crawlable static page
// at /areas/<slug>/. Copy is intentionally distinct per city (bare link lists
// and near-duplicate templated text get discounted by Google).
// ---------------------------------------------------------------------------

export interface City {
  slug: string; // url segment, e.g. "st-charles-mo"
  name: string; // "St. Charles"
  region: string; // "MO"
  county: string;
  /** Approx drive time from the O'Fallon shop, used in copy. */
  driveTime: string;
  /** 1–2 sentence, genuinely city-specific intro. */
  intro: string;
  /** A locally-relevant detail — landmark, district, audience. */
  localNote: string;
}

export const CITIES: City[] = [
  {
    slug: 'ofallon-mo',
    name: "O'Fallon",
    region: 'MO',
    county: 'St. Charles County',
    driveTime: 'right here in town',
    intro:
      "Left Side Logos is based in O'Fallon, Missouri — our embroidery machines, screen-print presses, and DTF printers all live at 29 West Industrial Dr. When you order custom apparel in O'Fallon, it's made down the road, not outsourced across the country.",
    localNote:
      "We outfit O'Fallon youth leagues, contractors, churches, and small businesses, and free local pickup means you can grab your order the same week it's finished.",
  },
  {
    slug: 'st-charles-mo',
    name: 'St. Charles',
    region: 'MO',
    county: 'St. Charles County',
    driveTime: 'about 12 minutes away',
    intro:
      'St. Charles businesses, sports teams, and event organizers come to Left Side Logos for embroidery and custom printing without the wait of an online giant. Our shop is a short drive up the road in O’Fallon.',
    localNote:
      'From Historic Main Street boutiques to Lindenwood club teams, we handle one-off pieces and full bulk rollouts for the St. Charles community.',
  },
  {
    slug: 'st-peters-mo',
    name: 'St. Peters',
    region: 'MO',
    county: 'St. Charles County',
    driveTime: 'about 10 minutes away',
    intro:
      'Custom embroidery, screen printing, and team apparel for St. Peters, Missouri — designed, proofed, and produced in-house just minutes away in O’Fallon.',
    localNote:
      'We’re a go-to for St. Peters rec leagues, HOAs, and trades crews that need durable, professional branded gear on a real timeline.',
  },
  {
    slug: 'wentzville-mo',
    name: 'Wentzville',
    region: 'MO',
    county: 'St. Charles County',
    driveTime: 'about 15 minutes away',
    intro:
      'Wentzville is one of the fastest-growing towns in Missouri, and its new businesses, schools, and clubs need branded apparel that looks the part. Left Side Logos handles embroidery, screen printing, and promo products for the whole west side of St. Charles County.',
    localNote:
      'Whether it’s spirit wear for a Wentzville school or uniforms for a growing trades company, we scale from a dozen pieces to several hundred.',
  },
  {
    slug: 'lake-saint-louis-mo',
    name: 'Lake Saint Louis',
    region: 'MO',
    county: 'St. Charles County',
    driveTime: 'about 15 minutes away',
    intro:
      'Lake Saint Louis teams, HOAs, and small businesses get premium embroidered polos, hats, and custom merch from Left Side Logos — produced locally, not drop-shipped from a faceless print farm.',
    localNote:
      'We do a lot of clean, understated embroidery for Lake Saint Louis country-club and community-association groups who care how the finished piece looks.',
  },
  {
    slug: 'cottleville-mo',
    name: 'Cottleville',
    region: 'MO',
    county: 'St. Charles County',
    driveTime: 'about 12 minutes away',
    intro:
      'Cottleville, Missouri businesses and event organizers turn to Left Side Logos for custom apparel, embroidery, and screen printing with quick local turnaround and free O’Fallon pickup.',
    localNote:
      'From SCC events to Cottleville restaurants and breweries, we print staff shirts, merch, and promo gear that actually holds up.',
  },
  {
    slug: 'dardenne-prairie-mo',
    name: 'Dardenne Prairie',
    region: 'MO',
    county: 'St. Charles County',
    driveTime: 'about 8 minutes away',
    intro:
      'Right next door to our O’Fallon shop, Dardenne Prairie gets fast, hands-on custom apparel and embroidery from Left Side Logos — no minimums on embroidery and free local pickup.',
    localNote:
      'We’re the neighborhood option for Dardenne Prairie youth sports, churches, and family-run businesses that want a real person reviewing their proof.',
  },
  {
    slug: 'chesterfield-mo',
    name: 'Chesterfield',
    region: 'MO',
    county: 'St. Louis County',
    driveTime: 'about 20 minutes away',
    intro:
      'Across the Missouri River in west St. Louis County, Chesterfield companies and clubs use Left Side Logos for professional embroidery, screen printing, and corporate apparel programs.',
    localNote:
      'We handle polished corporate branding for Chesterfield offices and Valley businesses, plus team and event gear for the surrounding area.',
  },
  {
    slug: 'st-louis-mo',
    name: 'St. Louis',
    region: 'MO',
    county: 'St. Louis metro',
    driveTime: 'serving the greater metro',
    intro:
      'Left Side Logos serves the entire St. Louis metro with custom embroidery, screen printing, DTF transfers, and full-service merch — all produced in-house in O’Fallon and shipped or delivered across the region.',
    localNote:
      'From Gateway-area startups to established St. Louis sports clubs, we run everything from single custom pieces to large branded apparel programs.',
  },
];
