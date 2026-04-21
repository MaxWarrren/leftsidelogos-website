/**
 * Migration script: pushes fallback product data + local images into Sanity CMS.
 *
 * Usage:  node migrate-to-sanity.mjs
 *
 * Reads credentials from .env.local (VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET, VITE_SANITY_API_TOKEN).
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve, basename, extname } from 'path';

// ─── Load .env.local manually (no dotenv dependency) ───
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const projectId = env.VITE_SANITY_PROJECT_ID;
const dataset = env.VITE_SANITY_DATASET || 'production';
const token = env.VITE_SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('❌  Missing VITE_SANITY_PROJECT_ID or VITE_SANITY_API_TOKEN in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  useCdn: false,
  apiVersion: '2024-01-01',
});

// ─── Fallback products (mirrored from CatalogPage.tsx) ───
const products = [
  {
    name: 'Richardson 112 Trucker Hat',
    slug: 'richardson-112-trucker-hat',
    category: 'Hats',
    sku: '112',
    description:
      'The industry-standard trucker hat. Pre-curved visor with adjustable snapback. Perfect for embroidery, heat transfer, and leather patches. A fan favorite for its comfort and clean profile.',
    localImages: ['public/catalog_pictures/hats-112-1.png', 'public/catalog_pictures/hats-112-2.png'],
    colors: ['Black/White', 'Navy/White', 'Charcoal/White', 'Red/White', 'Heather Grey/Black', 'All Black', 'Camo/Black'],
    sizes: ['OSFA (Adjustable)'],
    basePrice: 18.0,
    featured: true,
  },
  {
    name: 'Richardson 6511 Rope Hat',
    slug: 'richardson-6511-rope-hat',
    category: 'Hats',
    sku: '6511',
    description:
      'Classic rope-front trucker hat with retro vibes. Structured crown with snapback closure. Great for embroidery and leather patch applications. Gives any brand an elevated, vintage look.',
    localImages: ['public/catalog_pictures/hats-6511-1.png', 'public/catalog_pictures/hats-6511-2.png'],
    colors: ['Black', 'Navy', 'Khaki/White', 'Charcoal/Black', 'White/Navy'],
    sizes: ['OSFA (Adjustable)'],
    basePrice: 22.0,
    featured: true,
  },
  {
    name: 'Gildan 2000 Classic Tee',
    slug: 'gildan-2000-classic-tee',
    category: 'T-Shirts',
    sku: '2000',
    description:
      'A reliable everyday tee with a classic fit. 100% ring-spun cotton for softness and durability. Ideal for DTF prints, screen printing, and heat transfer. Budget-friendly without sacrificing quality.',
    localImages: ['public/catalog_pictures/shirts-2000-1.png'],
    colors: ['Black', 'White', 'Navy', 'Sport Grey', 'Red', 'Royal Blue', 'Forest Green', 'Charcoal'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    basePrice: 14.0,
    featured: false,
  },
  {
    name: 'Bella+Canvas 3001 CVC Tee',
    slug: 'bella-canvas-3001-cvc-tee',
    category: 'T-Shirts',
    sku: '3001CVC',
    description:
      'Premium retail-quality tee with a modern, fitted silhouette. CVC blend (cotton/polyester) delivers an incredibly soft hand feel. Perfect for DTF and heat transfer — your go-to when quality matters.',
    localImages: ['public/catalog_pictures/shirts-3001cvc-1.png'],
    colors: ['Black', 'White', 'Heather Navy', 'Heather Slate', 'Athletic Heather', 'Red', 'True Royal', 'Dark Grey Heather'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    basePrice: 18.0,
    featured: true,
  },
  {
    name: 'Gildan 5000 Heavy Cotton Tee',
    slug: 'gildan-5000-heavy-cotton-tee',
    category: 'T-Shirts',
    sku: '5000',
    description:
      'The workhorse tee — heavyweight 5.3oz cotton built to last. Wide color range and consistent sizing make it the industry standard for custom prints. Great for events, crews, and bulk orders.',
    localImages: ['public/catalog_pictures/shirts-5000-1.png'],
    colors: ['Black', 'White', 'Navy', 'Red', 'Royal', 'Sport Grey', 'Forest Green', 'Cardinal Red', 'Safety Green'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    basePrice: 12.0,
    featured: false,
  },
];

// ─── Categories to create ───
const categories = [
  { name: 'Hats', slug: 'hats', description: 'Custom branded caps, beanies, and headwear.' },
  { name: 'T-Shirts', slug: 't-shirts', description: 'Blank tees ready for DTF, screen print, and heat transfer.' },
  { name: 'Hoodies', slug: 'hoodies', description: 'Heavyweight and midweight hoodies for custom branding.' },
  { name: 'Accessories', slug: 'accessories', description: 'Bags, patches, stickers, and more.' },
];

// ─── Helpers ───
function mimeFromExt(ext) {
  const map = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

async function uploadImage(filePath) {
  const absPath = resolve(process.cwd(), filePath);
  const buffer = readFileSync(absPath);
  const filename = basename(absPath);
  const contentType = mimeFromExt(extname(absPath));
  console.log(`  📸  Uploading ${filename}...`);
  const asset = await client.assets.upload('image', buffer, { filename, contentType });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

// ─── Main ───
async function migrate() {
  console.log(`\n🚀  Migrating to Sanity CMS (project: ${projectId}, dataset: ${dataset})\n`);

  // 1. Create categories
  console.log('── Creating categories ──');
  for (const cat of categories) {
    const doc = {
      _type: 'category',
      name: cat.name,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description,
    };
    const result = await client.createOrReplace({ ...doc, _id: `category-${cat.slug}` });
    console.log(`  ✅  ${result.name}`);
  }

  // 2. Create products (with image uploads)
  console.log('\n── Creating products ──');
  for (const prod of products) {
    console.log(`\n  📦  ${prod.name}`);

    // Upload images
    const sanityImages = [];
    for (const imgPath of prod.localImages) {
      try {
        const img = await uploadImage(imgPath);
        sanityImages.push(img);
      } catch (err) {
        console.warn(`    ⚠️  Failed to upload ${imgPath}: ${err.message}`);
      }
    }

    const doc = {
      _type: 'product',
      _id: `product-${prod.slug}`,
      name: prod.name,
      slug: { _type: 'slug', current: prod.slug },
      category: prod.category,
      sku: prod.sku,
      description: prod.description,
      images: sanityImages,
      colors: prod.colors,
      sizes: prod.sizes,
      basePrice: prod.basePrice,
      featured: prod.featured,
    };

    const result = await client.createOrReplace(doc);
    console.log(`  ✅  Created ${result.name} (${sanityImages.length} images)`);
  }

  // 3. Verify
  console.log('\n── Verifying ──');
  const count = await client.fetch('count(*[_type == "product"])');
  console.log(`  📊  Total products in Sanity: ${count}`);
  const catCount = await client.fetch('count(*[_type == "category"])');
  console.log(`  📊  Total categories in Sanity: ${catCount}`);

  console.log('\n✅  Migration complete!\n');
}

migrate().catch((err) => {
  console.error('❌  Migration failed:', err);
  process.exit(1);
});
