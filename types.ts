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
  sku: string;
  description?: string;
  images: string[]; // Supabase Storage paths or local paths
  colors: string[];
  sizes: string[];
  base_price: number;
  featured?: boolean;
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
  mockupUrl?: string | null; // AI-generated mockup image (base64 data URL)
}

export interface GroupedCartItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  basePrice: number;
  image: string | null;
  mockupUrl?: string | null;
  variants: { id: string; color: string; size: string; quantity: number }[];
  totalQuantity: number;
  subtotal: number;
}