import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch all published products with their category name
export async function getAllProducts() {
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
    .eq('published', true)
    .order('name');

  if (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }

  // Flatten category name from the join
  return (data || []).map((p: any) => ({
    ...p,
    category: p.catalog_categories?.name || 'Uncategorized',
  }));
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
