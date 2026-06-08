import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vite HMR re-executes modules, which would create a second GoTrueClient and
// trigger the supabase-js "Multiple GoTrueClient instances" warning. Cache the
// instance on globalThis so HMR re-imports get the same client back.
const globalForSupabase = globalThis as unknown as {
  __lslSupabase?: SupabaseClient;
};

// supabase-js attaches an auth header to EVERY request (even anon catalog
// reads) by first resolving the auth token behind a lock. Its default lock
// uses the Web Locks API (`navigator.locks`), which can stall on a cold load —
// notably in Brave with storage partitioning — leaving the very first catalog
// fetch AND the session restore hung until a manual refresh. `processLock` is
// an in-memory promise-chain lock that avoids the Web Locks cold-start stall.
export const supabase: SupabaseClient =
  globalForSupabase.__lslSupabase ??
  (globalForSupabase.__lslSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'lsl-auth',
      lock: processLock,
    },
  }));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Fetch all published products with their category name
// `image_variants`, `print_areas`, and `base_color` are optional new columns
// (see migrations/20260523_catalog_customizer_fields.sql). The select pulls
// them with safe fallbacks if the columns don't exist yet.
//
// A cold load (esp. Brave) can make the first request stall/fail; rather than
// permanently disabling catalog reads for the session, we retry once after a
// short delay so the catalog self-heals without a manual page refresh.
export async function getAllProducts(retriesLeft = 1): Promise<any[]> {
  const { data, error } = await supabase
    .from('catalog_products')
    .select(`
      id,
      name,
      slug,
      category_id,
      sku,
      brand,
      item_number,
      style_number,
      source_url,
      description,
      images,
      images_by_color,
      addon_rules,
      colors,
      sizes,
      base_price,
      featured,
      image_variants,
      print_areas,
      base_color,
      catalog_categories ( name )
    `)
    .eq('published', true)
    .order('name');

  if (error) {
    // Retry without the new columns so we keep working before the migration is applied.
    if (/image_variants|print_areas|base_color|brand|item_number|style_number|source_url|images_by_color|addon_rules/.test(error.message)) {
      const { data: legacy, error: legacyError } = await supabase
        .from('catalog_products')
        .select(`
          id, name, slug, category_id, sku, description, images, colors, sizes,
          base_price, featured, catalog_categories ( name )
        `)
        .eq('published', true)
        .order('name');
      if (legacyError) {
        console.error('Failed to fetch products:', legacyError);
        return [];
      }
      return (legacy || []).map(flattenCategory);
    }
    console.error('Failed to fetch products:', error);
    if (retriesLeft > 0) {
      await sleep(400);
      return getAllProducts(retriesLeft - 1);
    }
    return [];
  }

  return (data || []).map(flattenCategory);
}

function flattenCategory(p: any) {
  return {
    ...p,
    category: p.catalog_categories?.name || 'Uncategorized',
  };
}

// Fetch all categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('catalog_categories')
    .select('id, name, slug, description')
    .order('sort_order');

  if (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }

  return data || [];
}

// Fetch a single product by slug
export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('catalog_products')
    .select(`
      id,
      name,
      slug,
      category_id,
      sku,
      description,
      images,
      colors,
      sizes,
      base_price,
      featured,
      catalog_categories ( name )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }

  return data ? { ...data, category: (data as any).catalog_categories?.name || 'Uncategorized' } : null;
}
