# Website — Frontend Architecture

> **Last Updated:** 2026-03-18  
> **Scope:** Component hierarchy, data flow, and UI patterns for the Website application.

---

## Component Hierarchy

```
<App>                              ← Root component, manages page state
├── <Navbar>                       ← Always rendered, receives currentPage + navigateTo
├── <main>                         ← Flex-grow content area
│   │
│   ├── [home]
│   │   ├── <Hero>                 ← Animated hero with CTA (→ build-order)
│   │   ├── <About>               ← Company story with images from /public
│   │   ├── <Services>            ← Service cards grid
│   │   └── <BottomCTA>           ← Footer CTA (→ build-order)
│   │
│   ├── [mockup]
│   │   └── <MockupGenerator>     ← AI mockup tool, links to quote
│   │
│   ├── [build-order]
│   │   └── <BuildOrderPage>      ← Wrapper for build order flow
│   │       ├── <OrderBuilder>    ← Line item builder (type/size/qty/color/price)
│   │       ├── <QuoteEstimator>  ← Price estimator
│   │       └── <DesignStudio>    ← Design customization interface
│   │
│   └── [contact]
│       └── <ContactPage>         ← Cal.com embed for scheduling
│
└── <Footer>                       ← Always rendered
```

---

## State Management

- **No global state library** — all state is managed via React `useState` and prop drilling.
- **Page routing state** is managed in `App.tsx` via `useState<Page>('home')` where `Page = 'home' | 'mockup' | 'contact' | 'build-order'`.
- **Navigation** is a `navigateTo(page: Page)` function that sets state and scrolls to top.
- Component-local state is used extensively within large components (OrderBuilder, MockupGenerator, DesignStudio, QuoteEstimator).

---

## Data Flow

```
User Action → Navbar.setCurrentPage(page)
           → App re-renders correct page component
           → Page components manage their own internal state
           → AI features call Gemini API directly from client-side
           → Order/contact forms submit to Portal API (/api/leads)
```

### Cross-Component Communication

| Interaction | Mechanism |
|---|---|
| Navbar → App | `setCurrentPage` prop callback |
| Hero → BuildOrder | `onStartDesigning` prop → `navigateTo('build-order')` |
| MockupGenerator → BuildOrder | `onSwitchToQuote` prop → `navigateTo('build-order')` |
| BuildOrderPage → Mockup | `onNavigateToMockup` prop → `navigateTo('mockup')` |
| BuildOrderPage → Contact | `onNavigateToContact` prop → `navigateTo('contact')` |
| BottomCTA → BuildOrder | `onStartDesigning` prop → `navigateTo('build-order')` |

---

## UI Primitives (`components/ui/`)

| Component | Description |
|---|---|
| `button.tsx` | Shared button using `class-variance-authority` (CVA) for variant-based styling |
| `animated-hero.tsx` | Animated hero section used on the home page, uses Framer Motion |

---

## Key Interactive Components

### `OrderBuilder.tsx` (~41KB)
- **Largest component** — complex form with dynamic line items
- Uses the `OrderItem` interface: `{ id, type, size, quantity, color, unitPrice }`
- Manages add/remove/edit operations on order line items
- Interacts with `QuoteEstimator` and `DesignStudio` as part of `BuildOrderPage`

### `MockupGenerator.tsx` (~23KB)
- AI-powered apparel mockup generation tool
- Calls Google Gemini API via `@google/genai`
- Provides visual previews of custom apparel

### `DesignStudio.tsx` (~21KB)
- Design customization interface for apparel orders
- Part of the build order workflow

### `QuoteEstimator.tsx` (~18KB)
- Pricing estimation based on order parameters
- Provides real-time cost calculations

### `SloganGenerator.tsx` (~6KB)
- AI-powered slogan/tagline generator using Gemini
- Auxiliary feature accessible from the design flow

### `EmailGate.tsx` (~3KB)
- Email capture gate for premium features
- Collects user email before allowing access

---

## Styling Patterns

1. **Tailwind utility classes** applied directly in JSX (via CDN)
2. **CVA (Class Variance Authority)** for variant-driven component styling (see `button.tsx`)
3. **`cn()` utility** (`lib/utils.ts`) merges `clsx` + `tailwind-merge` for conditional class merging
4. **Framer Motion** for animations and transitions (Hero, page transitions)
5. **Brand tokens** defined in `index.html` theme config:
   - `lsl-black`, `lsl-grey`, `lsl-blue`, `lsl-light`
   - Fonts: `font-sans` (Inter), `font-display` (Oswald)

---

## External API Calls

| API | Component | Purpose |
|---|---|---|
| Google Gemini (`@google/genai`) | `MockupGenerator`, `SloganGenerator` | AI content generation |
| Portal API (`/api/leads`) | `OrderBuilder` / forms | Lead submission to Portal CRM |
| Cal.com Embed | `ContactPage` | Scheduling / booking |
