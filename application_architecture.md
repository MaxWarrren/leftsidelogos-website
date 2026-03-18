# Left Side Logos — Website Architecture

> **Last Updated:** 2026-03-18  
> **App Type:** Single-Page Application (SPA)  
> **Framework:** Vite + React 19 + TypeScript  
> **Purpose:** Public-facing marketing site and order builder for Left Side Logos, a custom apparel & merchandise company.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Build Tool** | Vite | 6.2 |
| **UI Framework** | React | 19.2 |
| **Language** | TypeScript | 5.8 |
| **Styling** | Tailwind CSS (CDN) | 3.x (via `cdn.tailwindcss.com`) |
| **Animations** | Framer Motion | 12.x |
| **Icons** | Lucide React | 0.555 |
| **AI** | Google Gemini (`@google/genai`) | 1.30 | *(Used by MockupGenerator and SloganGenerator only; removed from OrderBuilder)* |
| **Scheduling** | Cal.com Embed React | 1.5 |
| **Fonts** | Inter, Oswald (Google Fonts) | — |

---

## Application Structure

```
Website/
├── index.html           # HTML shell — loads TailwindCSS CDN, defines CSS vars, custom theme
├── index.tsx            # React entry point — mounts <App /> to #root
├── App.tsx              # Root component — state-based router, renders pages
├── types.ts             # Shared TypeScript interfaces (NavItem, Testimonial, Service, OrderItem)
├── vite.config.ts       # Vite config — React plugin, env var injection (GEMINI_API_KEY), path alias (@)
├── metadata.json        # App metadata (name, description)
├── .env.local           # Environment variables (GEMINI_API_KEY)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
│
├── components/          # All page-level and feature components
│   ├── Navbar.tsx           # Top navigation bar — controls page state
│   ├── Footer.tsx           # Site-wide footer
│   ├── About.tsx            # About section (home page)
│   ├── Services.tsx         # Services showcase section (home page)
│   ├── BottomCTA.tsx        # Bottom call-to-action (home page)
│   ├── Hero3D.tsx           # 3D-styled hero banner
│   ├── MockupGenerator.tsx  # AI-powered apparel mockup generator (~23KB)
│   ├── OrderBuilder.tsx     # Full order builder with line items (~41KB) 
│   ├── QuoteEstimator.tsx   # Quote estimation tool (~18KB)
│   ├── DesignStudio.tsx     # Design customization interface (~21KB)
│   ├── SloganGenerator.tsx  # AI slogan generator using Gemini
│   ├── EmailGate.tsx        # Email capture / gating component
│   ├── BuildOrderPage.tsx   # Build Order page wrapper
│   ├── ContactPage.tsx      # Contact page with Cal.com embed
│   └── ui/                  # Reusable UI primitives
│       ├── animated-hero.tsx    # Animated hero variant used on home page
│       └── button.tsx           # Shared button component (CVA-based)
│
├── lib/
│   └── utils.ts         # Utility functions (cn class-merger)
│
├── public/              # Static assets
│   ├── LSL_Logo.png         # Company logo
│   └── AboutUs-{1-5}.jpg   # About section images
│
└── dist/                # Production build output (Vite)
```

---

## Routing Model

This app uses **client-side state-based routing** (no React Router). The `App.tsx` component manages a `currentPage` state variable with four possible values:

| Page State | Component Rendered | Description |
|---|---|---|
| `home` | `Hero` → `About` → `Services` → `BottomCTA` | Landing page with all marketing sections |
| `mockup` | `MockupGenerator` | AI-powered apparel mockup tool |
| `build-order` | `BuildOrderPage` | Interactive order builder with items/quantities |
| `contact` | `ContactPage` | Contact form with Cal.com scheduling embed |

**Navigation** is handled by passing a `navigateTo(page)` function through props. The `Navbar` receives `currentPage` and `setCurrentPage`.

---

## Key Features & Integrations

### 1. AI-Powered Mockup Generator (`MockupGenerator.tsx`)
- Generates apparel mockup images using AI
- Large, interactive component (~23KB)
- Likely uses the Gemini API key from environment

### 2. AI Slogan Generator (`SloganGenerator.tsx`)
- Generates brand slogans using Google Gemini (`@google/genai`)
- API key injected via Vite's `define` config as `process.env.GEMINI_API_KEY`

### 3. Order Builder (`OrderBuilder.tsx`)
- Largest component (~41KB) — full interactive order form
- Multi-step wizard: use case → services → quantity → timeline → products → colors → decoration → price estimate → logo upload → contact info
- **Submits leads via n8n webhook** (JSON POST, not multipart FormData)
- Automatic fallback: tries production webhook URL first, retries test webhook URL on failure
- AI summary generation removed — raw structured data sent to n8n for processing

### 4. Quote Estimator (`QuoteEstimator.tsx`)
- Pricing/estimation tool (~18KB)
- Connected to the order builder flow

### 5. Design Studio (`DesignStudio.tsx`)
- Design customization interface (~21KB)
- Part of the build order workflow

### 6. Cal.com Scheduling (`ContactPage.tsx`)
- Embeds Cal.com calendar via `@calcom/embed-react`
- Allows clients to book consultations

### 7. Email Gate (`EmailGate.tsx`)
- Captures user email before granting access to certain features

---

## Styling Architecture

- **Tailwind CSS loaded via CDN** in `index.html` (not via PostCSS/build pipeline)
- Custom theme defined inline in `<script>` tag in `index.html`:
  - Brand colors: `lsl-black` (#1a1a1a), `lsl-grey` (#a0a0a0), `lsl-blue` (#003380), `lsl-light` (#f4f4f5)
  - Fonts: `Inter` (sans), `Oswald` (display)
  - CSS custom properties for ShadCN-style theming (light/dark mode variables)
  - Custom `--radius` token for border radius
- Utility: `cn()` function in `lib/utils.ts` using `clsx` + `tailwind-merge`

---

## Environment Variables

| Variable | Purpose | Access Method |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Injected via `vite.config.ts` `define` as `process.env.API_KEY` and `process.env.GEMINI_API_KEY` |

---

## Build & Development

| Command | Action |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 (host: 0.0.0.0) |
| `npm run build` | Production build to `/dist` |
| `npm run preview` | Preview production build |

---

## Connection to Portal

The Website and Portal are **separate applications** but serve the same business (Left Side Logos). Key integration points:

1. **Lead Generation → n8n → Portal CRM:** The Website's order builder submits structured JSON to an **n8n webhook**, which processes the data and forwards it to the Portal's `/api/leads/create` endpoint (authenticated via `x-api-key`). This gives n8n full control over validation, enrichment, and automation before data reaches the database.
2. **Shared Branding:** Both apps use the Left Side Logos brand identity (logo, color palette, typography).
3. **User Journey:** Website visitors → submit orders/quotes → n8n webhook → Portal CRM → Admin converts leads to clients → Clients access Portal dashboard.
