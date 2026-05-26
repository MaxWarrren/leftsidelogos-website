-- Phase A — Mockup Studio customizer metadata
--
-- Adds three optional columns to `catalog_products`:
--   image_variants — JSONB map of { angle: { color_slug: storage_url } }
--   print_areas    — JSONB map of { angle: { x, y, width, height } }, normalized 0-1
--   base_color     — canonical "natural" color of the base PNG (used as the tint baseline)
--
-- All three are nullable. The Mockup Studio falls back to `images[0]` + a
-- default centered print area + a Konva tint when these are missing.

alter table public.catalog_products
  add column if not exists image_variants jsonb,
  add column if not exists print_areas    jsonb,
  add column if not exists base_color     text;

comment on column public.catalog_products.image_variants is
  'Per-angle, per-color image URLs. Shape: { [angle: string]: { [colorSlug: string]: string } }. Color keys should be lowercased / slashed exactly like the entry in `colors`.';
comment on column public.catalog_products.print_areas is
  'Per-angle printable region as normalized rect. Shape: { [angle: string]: { x: number, y: number, width: number, height: number } } with all values in 0..1.';
comment on column public.catalog_products.base_color is
  'Canonical color label that matches the un-tinted source PNGs (e.g. "Black/White" for Richardson 112, "White" for most Gildan blanks).';

-- Optional: seed the existing fallback products if a row matches by sku.
-- Safe to re-run; uses jsonb_build_object so no merge with anything that might already exist.

update public.catalog_products
set
  base_color = coalesce(base_color, 'Black/White'),
  image_variants = coalesce(image_variants, jsonb_build_object(
    'front', jsonb_build_object('black/white', '/catalog_pictures/hats-112-1.png'),
    'side',  jsonb_build_object('black/white', '/catalog_pictures/hats-112-2.png')
  )),
  print_areas = coalesce(print_areas, jsonb_build_object(
    'front', jsonb_build_object('x', 0.35, 'y', 0.32, 'width', 0.30, 'height', 0.22),
    'side',  jsonb_build_object('x', 0.45, 'y', 0.34, 'width', 0.22, 'height', 0.18)
  ))
where sku = '112';

update public.catalog_products
set
  base_color = coalesce(base_color, 'Black'),
  image_variants = coalesce(image_variants, jsonb_build_object(
    'front', jsonb_build_object('black', '/catalog_pictures/hats-6511-1.png'),
    'side',  jsonb_build_object('black', '/catalog_pictures/hats-6511-2.png')
  )),
  print_areas = coalesce(print_areas, jsonb_build_object(
    'front', jsonb_build_object('x', 0.35, 'y', 0.32, 'width', 0.30, 'height', 0.22),
    'side',  jsonb_build_object('x', 0.45, 'y', 0.34, 'width', 0.22, 'height', 0.18)
  ))
where sku = '6511';

-- Centered chest print area for tees / hoodies (~36% × 34% from x=0.32, y=0.26).
update public.catalog_products
set
  base_color = coalesce(base_color, 'White'),
  image_variants = coalesce(image_variants, jsonb_build_object(
    'front', jsonb_build_object('white', images[1])
  )),
  print_areas = coalesce(print_areas, jsonb_build_object(
    'front', jsonb_build_object('x', 0.32, 'y', 0.26, 'width', 0.36, 'height', 0.34)
  ))
where sku in ('2000', '3001CVC', '5000');
