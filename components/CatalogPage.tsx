import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Minus,
  Plus,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';

import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { getAllProducts } from '../lib/supabase';
import { toast } from './ui/toaster';
import { useCart } from './CartContext';
import { useCartDrawer } from './CartDrawer';
import type { CatalogProduct } from '../types';

// ─── Fallback Products ───

// Centered ~36% × 34% rectangle — the typical chest-print box for a tee.
const TEE_CHEST_PRINT_AREA = { x: 0.32, y: 0.26, width: 0.36, height: 0.34 };
// Tighter ~30% × 18% rectangle near the front-panel crown — typical hat patch / embroidery area.
const HAT_FRONT_PRINT_AREA = { x: 0.35, y: 0.32, width: 0.30, height: 0.22 };

const FALLBACK_PRODUCTS: CatalogProduct[] = [
  {
    id: 'local-1',
    name: 'Richardson 112 Trucker Hat',
    category: 'Hats',
    category_id: '',
    sku: '112',
    description:
      'The industry-standard trucker. Pre-curved visor, snapback closure. Ready for embroidery, transfer, or leather patches.',
    images: ['/catalog_pictures/hats-112-1.png', '/catalog_pictures/hats-112-2.png'],
    colors: ['Black/White', 'Navy/White', 'Charcoal/White', 'Red/White', 'Heather Grey/Black', 'All Black', 'Camo/Black'],
    sizes: ['OSFA (Adjustable)'],
    slug: 'richardson-112-trucker-hat',
    base_price: 18.0,
    featured: true,
    base_color: 'Black/White',
    image_variants: {
      front: { 'black/white': '/catalog_pictures/hats-112-1.png' },
      side: { 'black/white': '/catalog_pictures/hats-112-2.png' },
    },
    print_areas: {
      front: HAT_FRONT_PRINT_AREA,
      side: { x: 0.45, y: 0.34, width: 0.22, height: 0.18 },
    },
  },
  {
    id: 'local-2',
    name: 'Richardson 6511 Rope Hat',
    category: 'Hats',
    category_id: '',
    sku: '6511',
    description:
      'Retro rope-front trucker with a structured crown. Pairs especially well with leather patches.',
    images: ['/catalog_pictures/hats-6511-1.png', '/catalog_pictures/hats-6511-2.png'],
    colors: ['Black', 'Navy', 'Khaki/White', 'Charcoal/Black', 'White/Navy'],
    sizes: ['OSFA (Adjustable)'],
    slug: 'richardson-6511-rope-hat',
    base_price: 22.0,
    featured: true,
    base_color: 'Black',
    image_variants: {
      front: { black: '/catalog_pictures/hats-6511-1.png' },
      side: { black: '/catalog_pictures/hats-6511-2.png' },
    },
    print_areas: {
      front: HAT_FRONT_PRINT_AREA,
      side: { x: 0.45, y: 0.34, width: 0.22, height: 0.18 },
    },
  },
  {
    id: 'local-3',
    name: 'Gildan 2000 Classic Tee',
    category: 'T-Shirts',
    category_id: '',
    sku: '2000',
    description:
      'Reliable everyday tee. 100% ring-spun cotton, ideal for DTF, screen print, and heat transfer.',
    images: ['/catalog_pictures/shirts-2000-1.png'],
    colors: ['Black', 'White', 'Navy', 'Sport Grey', 'Red', 'Royal Blue', 'Forest Green', 'Charcoal'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    slug: 'gildan-2000-classic-tee',
    base_price: 14.0,
    featured: false,
    base_color: 'White',
    image_variants: {
      front: { white: '/catalog_pictures/shirts-2000-1.png' },
    },
    print_areas: {
      front: TEE_CHEST_PRINT_AREA,
    },
  },
  {
    id: 'local-4',
    name: 'Bella+Canvas 3001 CVC Tee',
    category: 'T-Shirts',
    category_id: '',
    sku: '3001CVC',
    description:
      'Retail-quality fit. CVC cotton/poly blend feels soft straight out of the bag — our DTF favorite.',
    images: ['/catalog_pictures/shirts-3001cvc-1.png'],
    colors: ['Black', 'White', 'Heather Navy', 'Heather Slate', 'Athletic Heather', 'Red', 'True Royal', 'Dark Grey Heather'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    slug: 'bella-canvas-3001-cvc-tee',
    base_price: 18.0,
    featured: true,
    base_color: 'White',
    image_variants: {
      front: { white: '/catalog_pictures/shirts-3001cvc-1.png' },
    },
    print_areas: {
      front: TEE_CHEST_PRINT_AREA,
    },
  },
  {
    id: 'local-5',
    name: 'Gildan 5000 Heavy Cotton Tee',
    category: 'T-Shirts',
    category_id: '',
    sku: '5000',
    description:
      'The workhorse. Heavyweight 5.3oz cotton built to last; widest color and size range in the catalog.',
    images: ['/catalog_pictures/shirts-5000-1.png'],
    colors: ['Black', 'White', 'Navy', 'Red', 'Royal', 'Sport Grey', 'Forest Green', 'Cardinal Red', 'Safety Green'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    slug: 'gildan-5000-heavy-cotton-tee',
    base_price: 12.0,
    featured: false,
    base_color: 'White',
    image_variants: {
      front: { white: '/catalog_pictures/shirts-5000-1.png' },
    },
    print_areas: {
      front: TEE_CHEST_PRINT_AREA,
    },
  },
];

// ─── Categories ───

const CATEGORY_FILTERS: { value: string; label: string; icon: typeof Tag }[] = [
  { value: 'All', label: 'All', icon: Tag },
  { value: 'Hats', label: 'Hats', icon: Layers },
  { value: 'T-Shirts', label: 'T-Shirts', icon: Shirt },
  { value: 'Hoodies', label: 'Hoodies', icon: Shirt },
  { value: 'Accessories', label: 'Accessories', icon: Sparkles },
];

type SortKey = 'featured' | 'name' | 'price-asc' | 'price-desc';

interface CatalogPageProps {
  onNavigateToCart?: () => void;
  onNavigateToMockupWithProduct?: (product: CatalogProduct) => void;
}

// ─── Main ───

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onNavigateToMockupWithProduct,
}) => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('featured');
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabaseProducts = await getAllProducts();
        if (!mounted) return;
        setProducts(
          supabaseProducts && supabaseProducts.length > 0
            ? supabaseProducts
            : FALLBACK_PRODUCTS,
        );
      } catch (err) {
        console.warn('Supabase fetch failed, using local catalog:', err);
        if (mounted) setProducts(FALLBACK_PRODUCTS);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    const sorted = [...result];
    switch (sort) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.base_price - b.base_price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.base_price - a.base_price);
        break;
      default:
        sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return sorted;
  }, [products, activeCategory, searchQuery, sort]);

  return (
    <>
      <CatalogBanner />

      <section className="min-h-[60vh] bg-lsl-cream py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <CatalogFilters
            categories={CATEGORY_FILTERS}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sort={sort}
            onSortChange={setSort}
          />

          <div className="mt-6 flex items-baseline justify-between">
            <p className="font-sans text-sm font-medium text-lsl-graphite">
              {loading
                ? 'Loading…'
                : `${filteredProducts.length} product${
                    filteredProducts.length === 1 ? '' : 's'
                  }`}
            </p>
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              layout
              className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onOpen={() => setSelectedProduct(product)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onNavigateToMockupWithProduct={onNavigateToMockupWithProduct}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Banner ───

function CatalogBanner() {
  return (
    <section className="relative overflow-hidden bg-lsl-ink pt-28 pb-16 text-lsl-cream md:pt-32 md:pb-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #F7F4EE 1px, transparent 1px), linear-gradient(to bottom, #F7F4EE 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage:
            'radial-gradient(ellipse at center, black 35%, transparent 80%)',
        }}
      />
      <div className="pointer-events-none absolute -right-20 -top-12 h-72 w-72 rounded-full bg-lsl-thread/15 blur-[120px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-3 px-6 md:px-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-lsl-cream/20 bg-lsl-cream/10 px-3 py-1 text-xs font-medium text-lsl-cream/80 backdrop-blur-sm">
          <Tag className="h-3 w-3" strokeWidth={1.75} />
          Catalog
        </span>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl lg:text-6xl">
          Premium blanks,
          <br />
          <span className="text-lsl-cream/65">ready for your brand.</span>
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-lsl-cream/70">
          A curated selection of the hats, tees, and accessories we run every week. Don&apos;t see a SKU? Anything on SS Activewear is fair game — just ask.
        </p>
      </div>
    </section>
  );
}

// ─── Filters bar ───

function CatalogFilters({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sort,
  onSortChange,
}: {
  categories: typeof CATEGORY_FILTERS;
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <nav
        aria-label="Filter by category"
        className="no-scrollbar -mx-2 flex items-center gap-2 overflow-x-auto px-2"
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const active = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onCategoryChange(cat.value)}
              aria-pressed={active}
              className={cn(
                'inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-all',
                active
                  ? 'border-lsl-ink bg-lsl-ink text-lsl-cream shadow-lsl-card'
                  : 'border-lsl-stone bg-white text-lsl-graphite hover:border-lsl-ink hover:text-lsl-ink',
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {cat.label}
            </button>
          );
        })}
      </nav>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 md:w-72 md:flex-none">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lsl-graphite"
            strokeWidth={1.75}
          />
          <input
            type="search"
            placeholder="Search by name or SKU"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-full border border-lsl-stone bg-white pl-9 pr-9 text-sm text-lsl-ink placeholder:text-lsl-graphite/70 transition-colors focus:border-lsl-navy focus:outline-none focus:ring-2 focus:ring-lsl-navy/30"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-lsl-graphite transition-colors hover:bg-lsl-stone/60 hover:text-lsl-ink"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
        <label className="hidden md:block">
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="h-10 rounded-full border border-lsl-stone bg-white px-4 text-sm font-medium text-lsl-ink transition-colors focus:border-lsl-navy focus:outline-none focus:ring-2 focus:ring-lsl-navy/30"
          >
            <option value="featured">Featured</option>
            <option value="name">Name (A→Z)</option>
            <option value="price-asc">Price (low → high)</option>
            <option value="price-desc">Price (high → low)</option>
          </select>
        </label>
      </div>
    </div>
  );
}

// ─── Product Card ───

function ProductCard({
  product,
  onOpen,
  index,
}: {
  product: CatalogProduct;
  onOpen: () => void;
  index: number;
}) {
  const { addToCart } = useCart();
  const { openDrawer } = useCartDrawer();
  const primaryImage = product.images?.[0] ?? null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      color: product.colors[0] ?? '—',
      size: product.sizes[0] ?? '—',
      quantity: 1,
      basePrice: product.base_price,
      image: primaryImage,
    });
    toast.success('Added to project', {
      description: product.name,
      action: { label: 'View cart', onClick: openDrawer },
    });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04 }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-lsl-stone bg-white shadow-lsl-card transition-all duration-300 hover:-translate-y-0.5 hover:border-lsl-ink/30 hover:shadow-lsl-lift"
      onClick={onOpen}
    >
      <div className="relative aspect-square overflow-hidden bg-lsl-cream">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-lsl-stone">
            <ShoppingBag className="h-12 w-12" strokeWidth={1.25} />
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-lsl-stone bg-white/95 px-2.5 py-1 font-sans text-xs font-medium text-lsl-ink shadow-lsl-card backdrop-blur-sm">
          {product.category}
        </span>
        {product.featured && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-lsl-thread/40 bg-lsl-thread/15 px-2.5 py-1 font-sans text-xs font-medium text-lsl-thread shadow-lsl-card backdrop-blur-sm">
            <Sparkles className="h-2.5 w-2.5" strokeWidth={2} /> Popular
          </span>
        )}

        <button
          type="button"
          onClick={handleQuickAdd}
          className="absolute bottom-3 right-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-lsl-ink px-4 text-xs font-semibold text-lsl-cream opacity-0 shadow-lsl-lift transition-all duration-300 hover:bg-lsl-navy group-hover:opacity-100 group-focus-within:opacity-100 md:translate-y-1 md:group-hover:translate-y-0"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> Quick add
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {product.brand && (
          <p className="font-sans text-xs font-medium text-lsl-graphite">
            {product.brand}
          </p>
        )}
        <div className="mt-1 flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold leading-tight text-lsl-ink">
            {product.name}
          </h3>
          <span className="font-display text-base font-semibold tabular-nums text-lsl-ink">
            ${product.base_price.toFixed(2)}
          </span>
        </div>
        {(product.style_number || product.item_number || product.sku) && (
          <p className="mt-1 font-sans text-xs text-lsl-graphite">
            {product.style_number
              ? `Style ${product.style_number}`
              : `Item ${product.item_number || product.sku}`}
          </p>
        )}
        <p className="mt-3 text-xs text-lsl-graphite">
          <span className="tabular-nums">{product.colors.length}</span> color
          {product.colors.length === 1 ? '' : 's'} ·{' '}
          <span className="tabular-nums">{product.sizes.length}</span> size
          {product.sizes.length === 1 ? '' : 's'}
        </p>
      </div>
    </motion.article>
  );
}

// ─── Modal ───

function ProductModal({
  product,
  onClose,
  onNavigateToMockupWithProduct,
}: {
  product: CatalogProduct;
  onClose: () => void;
  onNavigateToMockupWithProduct?: (p: CatalogProduct) => void;
}) {
  const { addToCart } = useCart();
  const { openDrawer } = useCartDrawer();

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '');
  const [quantity, setQuantity] = useState(12);

  // Trap ESC.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Per-color gallery — when the admin has uploaded a gallery for this color,
  // show those images and reset the carousel index on color change. Falls back
  // to the legacy flat `images[]` array for products without per-color galleries.
  const allImages = useMemo(() => {
    const perColor = product.images_by_color?.[selectedColor];
    if (perColor && perColor.length > 0) return perColor;
    return product.images ?? [];
  }, [product.images, product.images_by_color, selectedColor]);

  useEffect(() => {
    setCurrentImageIdx(0);
  }, [selectedColor]);

  const primaryImage = allImages[0] ?? null;

  const addonRuleLines = useMemo(() => {
    if (!product.addon_rules) return [] as string[];
    return product.addon_rules
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [product.addon_rules]);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      color: selectedColor,
      size: selectedSize,
      quantity,
      basePrice: product.base_price,
      image: primaryImage,
    });
    toast.success('Added to project', {
      description: `${quantity}× ${product.name} · ${selectedColor} · ${selectedSize}`,
      action: { label: 'View cart', onClick: openDrawer },
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-lsl-ink/55 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-lsl-cream shadow-lsl-lift md:max-h-[88vh] md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-lsl-graphite shadow-lsl-card backdrop-blur-sm transition-colors hover:bg-white hover:text-lsl-ink"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div className="relative flex min-h-[300px] flex-1 items-center justify-center bg-white md:min-h-[520px] md:w-1/2">
          {allImages.length ? (
            <>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIdx}
                  src={allImages[currentImageIdx]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="h-full w-full object-contain p-10 md:p-14"
                />
              </AnimatePresence>
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIdx(
                        (i) => (i - 1 + allImages.length) % allImages.length,
                      )
                    }
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-lsl-stone bg-white/85 text-lsl-graphite shadow-lsl-card backdrop-blur-sm transition-colors hover:bg-white hover:text-lsl-ink"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIdx((i) => (i + 1) % allImages.length)
                    }
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-lsl-stone bg-white/85 text-lsl-graphite shadow-lsl-card backdrop-blur-sm transition-colors hover:bg-white hover:text-lsl-ink"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentImageIdx(i)}
                        aria-label={`Show image ${i + 1}`}
                        className={cn(
                          'h-1.5 rounded-full transition-all',
                          i === currentImageIdx
                            ? 'w-6 bg-lsl-ink'
                            : 'w-1.5 bg-lsl-stone hover:bg-lsl-graphite',
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <ShoppingBag className="h-16 w-16 text-lsl-stone" strokeWidth={1.25} />
          )}
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-7 md:w-1/2 md:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-lsl-stone bg-white px-2.5 py-1 font-sans text-xs font-medium text-lsl-graphite">
              {product.category}
            </span>
            {product.style_number && (
              <span className="font-sans text-xs text-lsl-graphite">
                Style {product.style_number}
              </span>
            )}
            {product.item_number && (
              <span className="font-sans text-xs text-lsl-graphite">
                Item {product.item_number}
              </span>
            )}
            {!product.style_number && !product.item_number && product.sku && (
              <span className="font-sans text-xs text-lsl-graphite">
                SKU {product.sku}
              </span>
            )}
          </div>

          {product.brand && (
            <p className="mt-3 font-sans text-sm font-semibold text-lsl-navy">
              {product.brand}
            </p>
          )}

          <h2
            id="catalog-modal-title"
            className="mt-1 font-display text-3xl font-semibold tracking-tight text-lsl-ink md:text-[2rem]"
          >
            {product.name}
          </h2>

          <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-lsl-ink">
            ${product.base_price.toFixed(2)}{' '}
            <span className="text-sm font-normal text-lsl-graphite">/ unit</span>
          </p>

          {product.description && (
            <p className="mt-5 text-sm leading-relaxed text-lsl-graphite">
              {product.description}
            </p>
          )}

          {product.source_url && (
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-lsl-navy underline-offset-2 hover:underline"
            >
              View this product on the supplier&apos;s site
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {addonRuleLines.length > 0 && (
            <div className="mt-5 rounded-xl border border-lsl-stone bg-white/60 p-4">
              <p className="font-sans text-xs font-medium text-lsl-graphite">
                Add-ons &amp; upcharges
              </p>
              <ul className="mt-2 space-y-1.5">
                {addonRuleLines.map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-lsl-ink"
                  >
                    <span className="text-lsl-thread">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 space-y-5">
            <div>
              <p className="font-sans text-xs font-medium text-lsl-graphite">
                Color · <span className="text-lsl-ink">{selectedColor}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.colors.map((color) => {
                  const active = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                        active
                          ? 'border-lsl-ink bg-lsl-ink text-lsl-cream'
                          : 'border-lsl-stone bg-white text-lsl-ink hover:border-lsl-ink',
                      )}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="font-sans text-xs font-medium text-lsl-graphite">
                Size · <span className="text-lsl-ink">{selectedSize}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.sizes.map((size) => {
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'min-w-[44px] rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        active
                          ? 'border-lsl-navy bg-lsl-navy text-lsl-cream'
                          : 'border-lsl-stone bg-white text-lsl-ink hover:border-lsl-navy',
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="font-sans text-xs font-medium text-lsl-graphite">
                Quantity
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid h-11 w-11 place-items-center rounded-lg border border-lsl-stone text-lsl-graphite transition-colors hover:border-lsl-ink hover:text-lsl-ink"
                >
                  <Minus className="h-4 w-4" strokeWidth={2} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))
                  }
                  className="h-11 w-20 rounded-lg border border-lsl-stone bg-white text-center font-sans text-base tabular-nums text-lsl-ink focus:border-lsl-navy focus:outline-none focus:ring-2 focus:ring-lsl-navy/30"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="grid h-11 w-11 place-items-center rounded-lg border border-lsl-stone text-lsl-graphite transition-colors hover:border-lsl-ink hover:text-lsl-ink"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </button>
                <span className="ml-2 text-sm text-lsl-graphite">
                  ={' '}
                  <span className="font-display font-semibold tabular-nums text-lsl-ink">
                    ${(quantity * product.base_price).toFixed(2)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2.5">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              className="w-full"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} /> Add to project
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
            {onNavigateToMockupWithProduct && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  onClose();
                  onNavigateToMockupWithProduct(product);
                }}
                className="w-full"
              >
                <Sparkles className="h-4 w-4" strokeWidth={1.75} /> Customize in
                Mockup Studio
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── States ───

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-lsl-stone bg-white shadow-lsl-card">
      <div className="aspect-square skeleton" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 rounded-md skeleton" />
        <div className="h-3 w-1/3 rounded-md skeleton" />
        <div className="flex items-center justify-between">
          <div className="h-5 w-1/4 rounded-md skeleton" />
          <div className="h-3 w-1/3 rounded-md skeleton" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-lsl-stone bg-white px-6 py-16 text-center"
    >
      <div className="grid h-14 w-14 place-items-center rounded-full bg-lsl-stone/60 text-lsl-graphite">
        <Search className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-lsl-ink">
          No products match
        </p>
        <p className="mt-1 text-sm text-lsl-graphite">
          Try clearing filters or searching by SKU.
        </p>
      </div>
    </motion.div>
  );
}
