# Homepage Ecommerce Redesign — Progress Ledger

Plan: docs/superpowers/plans/2026-06-29-homepage-ecommerce-redesign.md
Repo is NOT under git — no commits; verification = `npx tsc --noEmit` (ignore pre-existing Footer.tsx/sheet.tsx framer-motion errors) + visual.

- [x] Task 1: Navbar — remove overHero mode (overHero=false; tsc clean, review clean)
- [x] Task 2: New light Hero component (components/Hero.tsx; tsc clean, review clean)
- [x] Task 3: CatalogMarquee component (components/CatalogMarquee.tsx; framer % loop; tsc clean, review clean)
- [x] Task 4: Wire App.tsx (Hero+CatalogMarquee mounted; tsc clean)
- [x] Task 8: Delete retired files (animated-hero.tsx, About.tsx removed; no dangling imports)
- NOTE: BottomCTA.tsx still has href="#about" — Task 6 must repoint it (per plan)
- [x] Task 5: Services restyle (PaperTexture removed, all light cards; tsc clean)
- [x] Task 6: BottomCTA restyle (light cream + white panel, #about anchor removed; tsc clean)
- [x] Task 7: Footer flatten (StitchPattern + glow removed; tsc clean)
- [ ] Task 8: Delete retired files
- [x] Final whole-branch review (opus) — CHANGES REQUESTED, all addressed:
      - Marquee resume snap-back → switched to CSS animate-marquee + hover:[animation-play-state:paused] (tailwind.config.js marquee keyframe added)
      - Reduced-motion row no longer wrapped in mask (was clipping leading cards)
      - BottomCTA "browse the catalog" now wired to catalog via onBrowseCatalog prop (App.tsx passes navigateTo('catalog'))
      - Removed dead Service.tag field
      Final tsc: only 6 pre-existing errors (Footer.tsx columnVariants, sheet.tsx) — zero new.
ALL TASKS COMPLETE.
