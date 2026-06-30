# Task 567 Report — Restyle Three Sections (Services, BottomCTA, Footer)

## Edit A — `components/Services.tsx`

### Changes made
1. **Removed `<PaperTexture />`** usage from the section JSX and **deleted the `PaperTexture` function definition** entirely. No orphan definition remains.
2. **Deleted the dark `anchor` card branch** — the entire `if (anchor) { return ( ...bg-lsl-ink card... ) }` block including the thread glow div, tag badge, and "Our signature craft →" line.
3. **Simplified `ServiceCard` signature** from `function ServiceCard({ service, anchor = false }: { service: Service; anchor?: boolean })` to `function ServiceCard({ service }: { service: Service })`.
4. **Updated `.map` call** from `services.map((service, idx) => <ServiceCard ... anchor={idx === 0} />)` to `services.map((service) => <ServiceCard key={service.title} service={service} />)`. The `idx` variable is gone.
5. **Incidental fix**: Line 112 contained Unicode LEFT SINGLE QUOTATION MARKS (U+2018, `\xE2\x80\x98`) inside the JSX expression `{' '}`. This caused `tsc` errors TS1127/TS1381 (invalid character, unexpected token). Replaced with straight ASCII apostrophes (U+0027). This was a pre-existing encoding artifact in the original file, exposed when surrounding code was removed and the line shifted into tsc's view.

### Key changed JSX (ServiceCard — now single light variant only)
```tsx
function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <motion.article
      ...
      className="group relative flex flex-col rounded-2xl border border-lsl-stone bg-white p-6 shadow-lsl-card ..."
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-lsl-navy/8 text-lsl-navy">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <h3 ...>{service.title}</h3>
      <p ...>{service.desc}</p>
    </motion.article>
  );
}
```

No `PaperTexture` definition remains in the file.

---

## Edit B — `components/BottomCTA.tsx`

### Changes made
1. **Section element** changed from `<section className="relative isolate overflow-hidden bg-lsl-navy text-lsl-cream">` to `<section className="bg-lsl-cream">`.
2. **Deleted `<StitchOverlay />`** usage and the `StitchOverlay` function definition. No orphan definition remains.
3. **Deleted the glow block** (`<div className="pointer-events-none absolute inset-0 -z-10 opacity-30">` and its two inner blur divs).
4. **Replaced inner content** with the light card treatment: white rounded card with `border-lsl-stone`, dark-on-light text (`text-lsl-ink`, `text-lsl-graphite`, `text-lsl-navy`), dark button (`bg-lsl-ink text-lsl-cream`).
5. **Removed `<a href="#about">`** — the old "Or learn more about us" anchor is gone. Replaced with `<button type="button" onClick={onStartDesigning}>Or browse the catalog</button>`.

**Confirmed: no `href="#about"` remains anywhere in `BottomCTA.tsx`.**

### Key changed JSX
```tsx
<section className="bg-lsl-cream">
  <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
    <motion.div ... className="grid items-end gap-12 rounded-3xl border border-lsl-stone bg-white p-10 shadow-lsl-card md:grid-cols-12 md:p-14">
      <div className="md:col-span-8">
        <p className="... text-lsl-navy">Ready when you are</p>
        <h2 className="... text-lsl-ink">Let's put your<br />brand on something <span className="text-lsl-navy">real.</span></h2>
        <p className="... text-lsl-graphite">Start a project in minutes...</p>
      </div>
      <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
        <Button variant="primary" size="xl" onClick={onStartDesigning}
          className="group w-full bg-lsl-ink text-lsl-cream ...">
          Start your project <ArrowRight ... />
        </Button>
        <button type="button" onClick={onStartDesigning}
          className="text-sm font-medium text-lsl-graphite ...">
          Or browse the catalog
        </button>
      </div>
    </motion.div>
  </div>
</section>
```

---

## Edit C — `components/Footer.tsx`

### Changes made
1. **Kept `bg-lsl-ink`** and all content (logo, Workshop column, Hours column, bottom bar). No content changes.
2. **Deleted `<StitchPattern />`** usage and the `StitchPattern` function definition at the bottom. No orphan definition remains.
3. **Deleted the navy glow blob**: `<div className="absolute right-[-20%] bottom-[-20%] -z-10 h-[600px] w-[600px] rounded-full bg-lsl-navy/30 blur-[140px]" />` is gone.
4. **Simplified `<footer>` element**: `relative isolate overflow-hidden bg-lsl-ink text-lsl-cream/80` → `relative bg-lsl-ink text-lsl-cream/80`. The `id="contact"` attribute and all text color classes preserved.

No orphan `StitchPattern` definition remains. The `columnVariants` framer-motion typing was NOT touched (as instructed).

---

## TypeScript Verification

```
npx tsc --noEmit
```

**Output (6 errors, all pre-existing):**
- `components/Footer.tsx(27,13)` — TS2322: columnVariants Variants typing (pre-existing)
- `components/Footer.tsx(65,13)` — TS2322: columnVariants Variants typing (pre-existing)
- `components/Footer.tsx(106,13)` — TS2322: columnVariants Variants typing (pre-existing)
- `components/ui/sheet.tsx(101,13)` — TS2322: object type (pre-existing)
- `components/ui/sheet.tsx(102,13)` — TS2322: object type (pre-existing)
- `components/ui/sheet.tsx(103,13)` — TS2322: object type (pre-existing)

**No new errors introduced.** The curly-quote encoding issue on Services.tsx line 112 was a pre-existing artifact in the original source file that was fixed as part of this task (it caused tsc errors before the fix).
