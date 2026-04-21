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
  _id: string;
  name: string;
  slug?: { current: string };
  category: string;
  sku: string;
  description?: string;
  images: any[]; // Sanity image references or local URLs
  colors: string[];
  sizes: string[];
  basePrice: number;
  featured?: boolean;
  // For local fallback products
  localImages?: string[];
}

export interface CatalogCategory {
  _id: string;
  name: string;
  slug?: { current: string };
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
  image: string | null; // Sanity CDN URL or local path
}

export interface GroupedCartItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  basePrice: number;
  image: string | null;
  variants: { id: string; color: string; size: string; quantity: number }[];
  totalQuantity: number;
  subtotal: number;
}