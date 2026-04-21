import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ShoppingBag, ChevronLeft, ChevronRight, Tag, Ruler, Palette, ArrowRight, Minus, Plus, Check } from 'lucide-react';
import { getAllProducts } from '../lib/sanity';
import { urlFor } from '../lib/sanity';
import { useCart } from './CartContext';
import type { CatalogProduct } from '../types';

// ─── Fallback Products (using existing local images) ───
const FALLBACK_PRODUCTS: CatalogProduct[] = [
  {
    _id: 'local-1',
    name: 'Richardson 112 Trucker Hat',
    category: 'Hats',
    sku: '112',
    description: 'The industry-standard trucker hat. Pre-curved visor with adjustable snapback. Perfect for embroidery, heat transfer, and leather patches. A fan favorite for its comfort and clean profile.',
    images: [],
    localImages: ['/catalog_pictures/hats-112-1.png', '/catalog_pictures/hats-112-2.png'],
    colors: ['Black/White', 'Navy/White', 'Charcoal/White', 'Red/White', 'Heather Grey/Black', 'All Black', 'Camo/Black'],
    sizes: ['OSFA (Adjustable)'],
    basePrice: 18.00,
    featured: true,
  },
  {
    _id: 'local-2',
    name: 'Richardson 6511 Rope Hat',
    category: 'Hats',
    sku: '6511',
    description: 'Classic rope-front trucker hat with retro vibes. Structured crown with snapback closure. Great for embroidery and leather patch applications. Gives any brand an elevated, vintage look.',
    images: [],
    localImages: ['/catalog_pictures/hats-6511-1.png', '/catalog_pictures/hats-6511-2.png'],
    colors: ['Black', 'Navy', 'Khaki/White', 'Charcoal/Black', 'White/Navy'],
    sizes: ['OSFA (Adjustable)'],
    basePrice: 22.00,
    featured: true,
  },
  {
    _id: 'local-3',
    name: 'Gildan 2000 Classic Tee',
    category: 'T-Shirts',
    sku: '2000',
    description: 'A reliable everyday tee with a classic fit. 100% ring-spun cotton for softness and durability. Ideal for DTF prints, screen printing, and heat transfer. Budget-friendly without sacrificing quality.',
    images: [],
    localImages: ['/catalog_pictures/shirts-2000-1.png'],
    colors: ['Black', 'White', 'Navy', 'Sport Grey', 'Red', 'Royal Blue', 'Forest Green', 'Charcoal'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    basePrice: 14.00,
    featured: false,
  },
  {
    _id: 'local-4',
    name: 'Bella+Canvas 3001 CVC Tee',
    category: 'T-Shirts',
    sku: '3001CVC',
    description: 'Premium retail-quality tee with a modern, fitted silhouette. CVC blend (cotton/polyester) delivers an incredibly soft hand feel. Perfect for DTF and heat transfer — your go-to when quality matters.',
    images: [],
    localImages: ['/catalog_pictures/shirts-3001cvc-1.png'],
    colors: ['Black', 'White', 'Heather Navy', 'Heather Slate', 'Athletic Heather', 'Red', 'True Royal', 'Dark Grey Heather'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    basePrice: 18.00,
    featured: true,
  },
  {
    _id: 'local-5',
    name: 'Gildan 5000 Heavy Cotton Tee',
    category: 'T-Shirts',
    sku: '5000',
    description: 'The workhorse tee — heavyweight 5.3oz cotton built to last. Wide color range and consistent sizing make it the industry standard for custom prints. Great for events, crews, and bulk orders.',
    images: [],
    localImages: ['/catalog_pictures/shirts-5000-1.png'],
    colors: ['Black', 'White', 'Navy', 'Red', 'Royal', 'Sport Grey', 'Forest Green', 'Cardinal Red', 'Safety Green'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    basePrice: 12.00,
    featured: false,
  },
];

const ALL_CATEGORIES = ['All', 'Hats', 'T-Shirts', 'Hoodies', 'Accessories'];

// ─── Category Icons ───
const categoryIcons: Record<string, string> = {
  'All': '🏷️',
  'Hats': '🧢',
  'T-Shirts': '👕',
  'Hoodies': '🧥',
  'Accessories': '✨',
};

interface CatalogPageProps {
  onNavigateToCart?: () => void;
}

// ─── Product Card ───
const ProductCard: React.FC<{ product: CatalogProduct; onClick: () => void; index: number }> = ({ product, onClick, index }) => {
  const primaryImage = product.localImages?.[0]
    || (product.images?.[0] ? urlFor(product.images[0]).width(600).url() : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      layout
      className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag className="w-16 h-16" />
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-lsl-black/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
          {product.category}
        </div>
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-lsl-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
            Popular
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-bold text-lg text-gray-900 leading-tight group-hover:text-lsl-blue transition-colors">
            {product.name}
          </h3>
        </div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">SKU: {product.sku}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-display font-bold text-lsl-blue">
            ${product.basePrice.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {product.colors.length} colors · {product.sizes.length} sizes
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Product Detail Modal ───
const ProductModal: React.FC<{
  product: CatalogProduct;
  onClose: () => void;
  onNavigateToCart?: () => void;
}> = ({ product, onClose, onNavigateToCart }) => {
  const { addToCart } = useCart();
  const allImages = product.localImages?.length
    ? product.localImages
    : product.images?.map(img => urlFor(img).width(800).url()) || [];

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const primaryImage = allImages[0] || null;

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      color: selectedColor,
      size: selectedSize,
      quantity,
      basePrice: product.basePrice,
      image: primaryImage,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
    setQuantity(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image Gallery */}
          <div className="md:w-1/2 relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none min-h-[300px] md:min-h-[500px] flex items-center justify-center">
            {allImages.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIdx}
                    src={allImages[currentImageIdx]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-contain p-8 md:p-12"
                  />
                </AnimatePresence>
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIdx(i => (i - 1 + allImages.length) % allImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIdx(i => (i + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                    {/* Image Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIdx(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIdx ? 'bg-lsl-blue w-6' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <ShoppingBag className="w-20 h-20 text-gray-300" />
            )}
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                {product.category}
              </span>
              <span className="text-xs text-gray-400 font-medium">SKU: {product.sku}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3">
              {product.name}
            </h2>

            <p className="text-3xl font-display font-bold text-lsl-blue mb-6">
              ${product.basePrice.toFixed(2)}
              <span className="text-sm font-sans font-normal text-gray-400 ml-2">per unit</span>
            </p>

            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-8 text-sm">
                {product.description}
              </p>
            )}

            {/* Colors */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Color — {selectedColor}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedColor === color
                        ? 'bg-lsl-black text-white border-lsl-black'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Size — {selectedSize}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                      selectedSize === size
                        ? 'bg-lsl-blue text-white border-lsl-blue'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-lsl-blue'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Quantity
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-lsl-blue hover:text-lsl-blue transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 text-center rounded-xl border-2 border-gray-200 font-bold text-lg focus:border-lsl-blue focus:outline-none transition-colors"
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-lsl-blue hover:text-lsl-blue transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-400 ml-2">
                  = <span className="font-bold text-gray-700">${(quantity * product.basePrice).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={addedFeedback}
                className={`w-full group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 ${
                  addedFeedback
                    ? 'bg-green-500 text-white shadow-green-500/20'
                    : 'bg-lsl-blue text-white hover:shadow-xl hover:bg-lsl-black'
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              {onNavigateToCart && (
                <button
                  onClick={() => { onClose(); onNavigateToCart(); }}
                  className="w-full py-3 text-center text-sm font-semibold text-gray-400 hover:text-lsl-blue transition-colors"
                >
                  View Cart & Build Order →
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Skeleton Loader ───
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-100" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-100 rounded w-1/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  </div>
);

// ─── Main Catalog Page ───
export const CatalogPage: React.FC<CatalogPageProps> = ({ onNavigateToCart }) => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  // Fetch products from Sanity, fallback to local data
  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      try {
        const sanityProducts = await getAllProducts();
        if (mounted) {
          if (sanityProducts && sanityProducts.length > 0) {
            setProducts(sanityProducts);
          } else {
            // Use fallback local data if Sanity has no products yet
            setProducts(FALLBACK_PRODUCTS);
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn('Sanity fetch failed, using local catalog data:', err);
        if (mounted) {
          setProducts(FALLBACK_PRODUCTS);
          setLoading(false);
        }
      }
    }
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  return (
    <>
      {/* Hero Banner */}
      <section className="relative pt-32 pb-20 bg-white overflow-hidden border-b border-gray-100">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lsl-blue/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-1.5 bg-lsl-blue/10 text-lsl-blue text-xs font-bold uppercase tracking-[0.2em] rounded-full mb-6 border border-lsl-blue/20">
              <Tag className="w-3 h-3 inline mr-2 -mt-0.5" />
              Product Catalog
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-4 leading-tight">
              Premium <span className="text-lsl-blue">Blanks</span> for<br />
              Your Custom Designs
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
              Browse our curated selection of high-quality apparel and accessories. Every item is ready for your custom branding.
            </p>
            {/* Cart floating indicator */}
            {cartCount > 0 && onNavigateToCart && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onNavigateToCart}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-lsl-blue text-white rounded-full font-bold text-sm hover:bg-lsl-black hover:shadow-lg transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                View Cart ({cartCount} items)
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-12 bg-[#f4f4f5] min-h-[60vh]">
        <div className="container mx-auto px-4">

          {/* Search + Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10"
          >
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-lsl-black text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{categoryIcons[cat]}</span>
                  <span>{cat}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lsl-blue/30 focus:border-lsl-blue transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Results count */}
          <div className="mb-6 text-sm text-gray-400 font-medium">
            {loading ? 'Loading...' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-gray-400 mb-2">No products found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your search or filter.</p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onNavigateToCart={onNavigateToCart}
          />
        )}
      </AnimatePresence>
    </>
  );
};
