import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: false, // Always fetch fresh data so unpublished items disappear immediately
  apiVersion: '2024-01-01',
  token: import.meta.env.VITE_SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// Fetch all products from Sanity (excludes drafts/unpublished)
export async function getAllProducts() {
  return sanityClient.fetch(`
    *[_type == "product" && !(_id in path("drafts.**"))] | order(category asc, name asc) {
      _id,
      name,
      slug,
      category,
      sku,
      description,
      images,
      colors,
      sizes,
      basePrice,
      featured
    }
  `);
}

// Fetch all categories from Sanity
export async function getCategories() {
  return sanityClient.fetch(`
    *[_type == "category" && !(_id in path("drafts.**"))] | order(name asc) {
      _id,
      name,
      slug,
      description
    }
  `);
}

// Fetch a single product by slug
export async function getProductBySlug(slug: string) {
  return sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug && !(_id in path("drafts.**"))][0]`,
    { slug }
  );
}

