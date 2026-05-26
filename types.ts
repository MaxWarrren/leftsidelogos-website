import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  image: string;
}

export interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface OrderItem {
  id: string;
  type: string;
  size: string;
  quantity: number;
  color: string;
  unitPrice: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  category_id: string;
  sku: string | null;
  brand?: string | null;
  item_number?: string | null;
  style_number?: string | null;
  source_url?: string | null; // external product page (e.g. ssactivewear.com listing)
  description?: string;
  images: string[]; // Supabase Storage paths or local paths (legacy flat array)
  // Per-color ordered galleries. Shape: { [colorName]: string[] }.
  // First entry per color is the catalog hero. New CMS writes this; falls
  // back to `images` for legacy rows.
  images_by_color?: Record<string, string[]>;
  // Plain multiline text rendered as a bullet list on the item page.
  addon_rules?: string | null;
  colors: string[];
  sizes: string[];
  base_price: number;
  featured?: boolean;
  // Phase A — Customizer metadata (optional; falls back to `images[0]` + a default centered print area)
  image_variants?: ProductImageVariants;
  print_areas?: ProductPrintAreas;
  base_color?: string; // canonical "natural" color of the source PNG, used as the tint baseline
}

/**
 * Per-angle, per-color image library.
 * Color keys should be lowercased/slugified versions of the strings in `colors`.
 * If a (view, color) pair is missing, the Studio falls back to the base image + a color tint filter.
 */
export type ProductImageVariants = Record<string, Record<string, string>>;

/**
 * Normalized 0-1 rectangle defining the printable region for each angle.
 * x/y are top-left; width/height are fractions of the stage size.
 */
export type ProductPrintAreas = Record<
  string,
  { x: number; y: number; width: number; height: number }
>;

export interface MockupPlacement {
  id: string;
  imageDataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CartItem {
  id: string; // unique cart line ID (productId-color-size)
  productId: string;
  productName: string;
  sku: string;
  category: string;
  color: string;
  size: string;
  quantity: number;
  basePrice: number;
  image: string | null; // Supabase Storage URL or local path
  mockupUrl?: string | null; // composed mockup snapshot (data URL or Storage URL)
  // Public URLs of raw logo files uploaded inside MockupStudio. OrderBuilder
  // Step 4 auto-attaches these so the customer doesn't have to re-upload.
  sourceLogoUrls?: string[];
  // Customer-defined print area (normalized 0-1, plus the angle it was set on).
  // Production uses this to know where on the garment the logo should land.
  printArea?: {
    angle: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface GroupedCartItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  basePrice: number;
  image: string | null;
  mockupUrl?: string | null;
  // Union of raw logo URLs across all line items of this product (from MockupStudio).
  sourceLogoUrls?: string[];
  variants: { id: string; color: string; size: string; quantity: number }[];
  totalQuantity: number;
  subtotal: number;
}