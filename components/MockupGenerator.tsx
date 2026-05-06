import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Upload, Sparkles, ShoppingBag, Maximize2, X, Save, Check, Lock, ChevronDown } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { getAllProducts } from '../lib/supabase';
import { useCart } from './CartContext';
import { PageHero } from './PageHero';
import { MediaPicker, type MediaItem } from './MediaPicker';
import type { CatalogProduct } from '../types';

// ─── Placement options by category slug ───
const PLACEMENT_OPTIONS: Record<string, string[]> = {
    't-shirts': ['Center Chest', 'Left Chest', 'Right Chest', 'Full Back', 'Upper Back', 'Left Sleeve', 'Right Sleeve'],
    'hoodies': ['Center Chest', 'Left Chest', 'Full Back', 'Upper Back', 'Hood', 'Kangaroo Pocket', 'Left Sleeve', 'Right Sleeve'],
    'hats': ['Front Center', 'Front Left', 'Front Right', 'Side Left', 'Side Right', 'Back'],
    'accessories': ['Center', 'Front', 'Back', 'Side'],
};
const DEFAULT_PLACEMENTS = ['Center Chest', 'Left Chest', 'Full Back', 'Left Sleeve', 'Right Sleeve'];

interface MockupGeneratorProps {
    onSwitchToQuote: () => void;
    product?: CatalogProduct | null;
    onNavigateToBuildOrder?: () => void;
}

export const MockupGenerator: React.FC<MockupGeneratorProps> = ({ onSwitchToQuote, product, onNavigateToBuildOrder }) => {
    const [mockupPrompt, setMockupPrompt] = useState('');
    const [mockupImage, setMockupImage] = useState<File | null>(null);
    const [mockupPreview, setMockupPreview] = useState<string | null>(null);
    const [generatedMockup, setGeneratedMockup] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedToMedia, setSavedToMedia] = useState(false);

    // Form states
    const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(product || null);
    const [viewAngle, setViewAngle] = useState('Front View');
    const [logoPlacements, setLogoPlacements] = useState<string[]>(['Center Chest']);
    const [color, setColor] = useState(product?.colors[0] || 'White');

    const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Product catalog for dropdown
    const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);
    
    const { isAuthenticated, user, organization, openAuthModal } = useAuth();
    const { items: cartItems } = useCart();

    // Fetch all products for the dropdown
    useEffect(() => {
        getAllProducts().then((products) => setAllProducts(products as CatalogProduct[]));
    }, []);

    // Update state if product prop changes
    useEffect(() => {
        if (product) {
            setSelectedProduct(product);
            setColor(product.colors[0] || 'White');
        }
    }, [product]);

    // Get category slug for the selected product
    const categorySlug = selectedProduct
        ? allProducts.find(p => p.id === selectedProduct.id)?.category?.toLowerCase().replace(/\s+/g, '-') || ''
        : '';
    const availablePlacements = PLACEMENT_OPTIONS[categorySlug] || DEFAULT_PLACEMENTS;

    // Reset placements when category changes
    useEffect(() => {
        setLogoPlacements(prev => {
            const valid = prev.filter(p => availablePlacements.includes(p));
            return valid.length > 0 ? valid : [availablePlacements[0]];
        });
    }, [categorySlug]);

    const togglePlacement = (placement: string) => {
        setLogoPlacements(prev => {
            if (prev.includes(placement)) {
                return prev.length > 1 ? prev.filter(p => p !== placement) : prev;
            }
            return [...prev, placement];
        });
    };

    // Separate cart products from others for the dropdown
    const cartProductIds = new Set(cartItems.map(ci => ci.productId));
    const inCartProducts = allProducts.filter(p => cartProductIds.has(p.id));
    const otherProducts = allProducts.filter(p => !cartProductIds.has(p.id));
    // Group others by category
    const groupedOthers = otherProducts.reduce<Record<string, CatalogProduct[]>>((acc, p) => {
        const cat = p.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMockupImage(file);
            const reader = new FileReader();
            reader.onload = (ev) => {
                setMockupPreview(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMediaSelect = async (items: MediaItem[]) => {
        if (items.length === 0) return;
        const item = items[0];
        
        try {
            const { data } = await supabase.storage.from('organization-assets').createSignedUrl(item.file_path, 60);
            if (!data?.signedUrl) throw new Error("Could not get image url");
            
            const res = await fetch(data.signedUrl);
            const blob = await res.blob();
            
            const file = new File([blob], item.file_name, { type: item.file_type });
            setMockupImage(file);
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                setMockupPreview(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error(err);
            alert("Failed to load selected media.");
        }
    };

    const handleGenerateClick = () => {
        if (!mockupImage) return;
        if (!isAuthenticated) {
            openAuthModal();
        } else {
            generateMockup();
        }
    };

    const generateMockup = async () => {
        setIsGenerating(true);
        setGeneratedMockup(null);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                alert("Missing API Key in .env.local");
                setIsGenerating(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const base64Image = mockupPreview?.split(',')[1] || '';
            const mimeType = mockupImage?.type || 'image/png';

            const itemName = selectedProduct?.name || 'T-Shirt';
            const prompt = `You are an elite product photography AI for "Left Side Logos". 
        TASK: Create a photorealistic, commercial-grade product mockup.
        PRODUCT: ${color} ${itemName}.
        ANGLE: ${viewAngle}.
        LOGO PLACEMENTS: ${logoPlacements.join(', ')}.
        LOGO: Naturally integrate the uploaded artwork onto the garment at each specified placement. Ensure the logo follows the fabric's curves, wrinkles, and lighting.
        MANDATORY STYLE: The rendered image MUST be large, centered, and take up the full frame. No excessive white space around the product.
        ADDITIONAL DETAILS: ${mockupPrompt}.
        ENVIRONMENT: Professional, minimalist studio with soft directional lighting.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3.1-flash-image-preview',
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ],
                config: {
                    // @ts-ignore
                    imageConfig: {
                        aspectRatio: aspectRatio
                    }
                }
            });

            if (response.candidates && response.candidates[0].content.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        setGeneratedMockup(`data:image/png;base64,${part.inlineData.data}`);
                        break;
                    }
                }
            } else {
                throw new Error("No image generated");
            }
        } catch (error) {
            console.error("Error generating mockup:", error);
            alert("Error generating mockup. See console for details.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveToMedia = async () => {
        if (!generatedMockup || !isAuthenticated || !organization || !user) return;
        setIsSaving(true);
        try {
            const res = await fetch(generatedMockup);
            const blob = await res.blob();

            const baseName = selectedProduct ? selectedProduct.name : 'Mockup';
            const fileName = `${baseName}-Mockup-${Date.now()}.png`.replace(/[^a-zA-Z0-9-.]/g, '-').replace(/-+/g, '-');
            const filePath = `${organization.id}/Mockups/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('organization-assets')
                .upload(filePath, blob, { contentType: 'image/png' });

            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase.from('media_items').insert({
                organization_id: organization.id,
                uploader_id: user.id,
                file_path: filePath,
                file_name: fileName,
                file_type: 'image/png',
                size: blob.size,
                category: 'Mockups',
            });

            if (dbError) throw dbError;

            setSavedToMedia(true);
            setTimeout(() => setSavedToMedia(false), 3000);
        } catch (err) {
            console.error('Failed to save mockup:', err);
            alert('Failed to save mockup. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // If not authenticated, show gate
    if (!isAuthenticated) {
        return (
            <PageHero className="pt-32 pb-20 min-h-[85vh] flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto text-white mb-8 border border-white/20">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-white">Mockup Studio</h1>
                    <p className="text-gray-300 font-light">
                        Our AI-powered visualization engine is an exclusive tool for registered users. Log in or create a free account to start designing.
                    </p>
                    <button
                        onClick={openAuthModal}
                        className="w-full py-4 bg-white text-lsl-black rounded-2xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                        Log In to Access
                    </button>
                    <button
                        onClick={onSwitchToQuote}
                        className="text-sm font-bold text-gray-400 hover:text-white transition-colors pt-4"
                    >
                        Skip to Build Order →
                    </button>
                </div>
            </PageHero>
        );
    }

    return (
        <>
        <PageHero className="pt-32 pb-16">
            <div className="container mx-auto px-4 max-w-7xl">
                <header className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest border border-white/20"
                    >
                        <Sparkles size={12} />
                        AI Powered Visualization
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight">Mockup Studio</h1>
                    <p className="text-gray-300 max-w-xl mx-auto font-light text-lg">
                        {product 
                            ? `Visualizing ${product.name}. Upload your artwork and let our AI handle the rendering with studio precision.`
                            : `Experience our premium apparel library. Upload your artwork and let our AI handle the rendering with studio precision.`
                        }
                    </p>

                    <button
                        onClick={onSwitchToQuote}
                        className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto pt-2 group"
                    >
                        <ShoppingBag size={14} className="group-hover:scale-110 transition-transform" />
                        Interested in pricing? <span className="underline decoration-white/30 underline-offset-4">Jump to Build Your Order</span>
                    </button>
                </header>
            </div>
        </PageHero>

        <div className="bg-[#f4f4f5] py-12 min-h-[60vh]">
            <div className="container mx-auto px-4 max-w-7xl">

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* Controls Panel */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Step 1: Upload */}
                        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">01. Logo Artwork</h3>
                                {mockupPreview && (
                                    <button onClick={() => { setMockupImage(null); setMockupPreview(null); }} className="text-xs text-red-500 hover:underline">Clear</button>
                                )}
                            </div>

                            <div
                                onClick={() => setIsMediaPickerOpen(true)}
                                className={`group relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 ${mockupPreview ? 'border-lsl-blue/20 bg-blue-50/10' : 'border-gray-200 hover:border-lsl-blue/40 hover:bg-gray-50'
                                    }`}
                            >
                                {mockupPreview ? (
                                    <div className="relative h-48 w-full flex items-center justify-center">
                                        <img src={mockupPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                                        <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                            <span className="text-xs font-bold text-lsl-blue uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-lg border border-blue-100">Change Artwork</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-4 py-4">
                                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-lsl-blue group-hover:bg-blue-50 transition-colors">
                                            <Upload size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lsl-black font-display text-lg">Choose Artwork</p>
                                            <p className="text-xs text-gray-400 mt-1">High-res PNG with transparency works best</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Step 2: Scene */}
                        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">02. Scene Configuration</h3>

                            {/* Apparel Type - Product Dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Apparel Type</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                                        className="w-full p-4 bg-gray-50 rounded-2xl text-left font-medium text-sm text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                    >
                                        <span className={selectedProduct ? 'text-gray-900' : 'text-gray-400'}>
                                            {selectedProduct ? selectedProduct.name : 'Select a product...'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${productDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {productDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                className="absolute z-30 top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto"
                                            >
                                                {/* In Cart section */}
                                                {inCartProducts.length > 0 && (
                                                    <>
                                                        <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 flex items-center gap-1.5 sticky top-0">
                                                            <ShoppingBag className="w-3 h-3" /> In Your Cart
                                                        </div>
                                                        {inCartProducts.map(p => (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => { setSelectedProduct(p); setColor(p.colors[0] || 'White'); setProductDropdownOpen(false); }}
                                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${selectedProduct?.id === p.id ? 'bg-lsl-black/5 font-bold' : ''}`}
                                                            >
                                                                <span>{p.name}</span>
                                                                <span className="text-[10px] text-gray-400">{p.category}</span>
                                                            </button>
                                                        ))}
                                                    </>
                                                )}
                                                {/* All other products grouped by category */}
                                                {Object.entries(groupedOthers).map(([cat, products]) => (
                                                    <div key={cat}>
                                                        <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 sticky top-0">
                                                            {cat}
                                                        </div>
                                                        {products.map(p => (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => { setSelectedProduct(p); setColor(p.colors[0] || 'White'); setProductDropdownOpen(false); }}
                                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${selectedProduct?.id === p.id ? 'bg-lsl-black/5 font-bold' : ''}`}
                                                            >
                                                                {p.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ))}
                                                {allProducts.length === 0 && (
                                                    <div className="px-4 py-6 text-sm text-gray-400 text-center">Loading products...</div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Color */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Color</label>
                                    {selectedProduct && selectedProduct.colors.length > 0 ? (
                                        <div className="relative">
                                            <select
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm appearance-none cursor-pointer"
                                            >
                                                {selectedProduct.colors.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            placeholder="e.g. White, Black"
                                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm placeholder:text-gray-300"
                                        />
                                    )}
                                </div>
                                {/* Camera Angle */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Camera Angle</label>
                                    <input
                                        type="text"
                                        value={viewAngle}
                                        onChange={(e) => setViewAngle(e.target.value)}
                                        placeholder="e.g. Front, Flat Lay"
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Logo Placements - Multi-select chips */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Logo Placement(s)</label>
                                <div className="flex flex-wrap gap-2">
                                    {availablePlacements.map((placement) => (
                                        <button
                                            key={placement}
                                            onClick={() => togglePlacement(placement)}
                                            className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${logoPlacements.includes(placement) ? 'bg-lsl-black text-white border-lsl-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                                        >
                                            {placement}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Aspect Ratio */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Aspect Ratio</label>
                                <div className="flex flex-wrap gap-2">
                                    {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map((ratio) => (
                                        <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-4 py-2 text-[10px] font-bold rounded-full border transition-all ${aspectRatio === ratio ? 'bg-lsl-black text-white border-lsl-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Custom Styling Prompt</label>
                                <textarea value={mockupPrompt} onChange={(e) => setMockupPrompt(e.target.value)} placeholder="e.g. Vintage grey wash, cinematic street lighting, minimal environment..." className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-light text-gray-600 h-28 resize-none focus:ring-2 focus:ring-lsl-blue/10 transition-all placeholder:text-gray-300" />
                            </div>
                        </section>

                        <button
                            onClick={handleGenerateClick}
                            disabled={!mockupImage || isGenerating}
                            className="w-full py-5 bg-lsl-black text-white rounded-[2rem] font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {isGenerating ? (
                                <><Loader2 className="animate-spin" size={24} /> Rendering Realism...</>
                            ) : (
                                <><Send size={20} /> Generate Studio Mockup</>
                            )}
                        </button>
                    </div>

                    {/* Result Display */}
                    <div className="lg:col-span-7 h-full flex flex-col space-y-6">
                        <div className={`relative flex-grow bg-white rounded-[3rem] p-4 flex flex-col items-center justify-center min-h-[600px] shadow-sm border border-gray-100 overflow-hidden transition-all duration-700 ${isGenerating ? 'blur-sm grayscale' : ''}`}>
                            {generatedMockup ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <motion.img initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} src={generatedMockup} alt="Generated Mockup" className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl shadow-blue-900/10" />
                                    <div className="absolute top-6 right-6 flex items-center gap-2">
                                        {isAuthenticated && (
                                            <button
                                                onClick={handleSaveToMedia}
                                                disabled={isSaving || savedToMedia}
                                                className={`backdrop-blur-md p-3 rounded-full shadow-lg shadow-black/5 transition-all active:scale-95 flex items-center gap-2 text-sm font-bold ${savedToMedia ? 'bg-green-500 text-white' : 'bg-white/80 hover:bg-white text-lsl-black'}`}
                                            >
                                                {savedToMedia ? (
                                                    <><Check size={18} /> Saved!</>
                                                ) : isSaving ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <><Save size={18} /> Save to Media</>
                                                )}
                                            </button>
                                        )}
                                        <button onClick={() => { setGeneratedMockup(null); setSavedToMedia(false); }} className="bg-white/80 hover:bg-white backdrop-blur-md p-3 rounded-full text-lsl-black shadow-lg shadow-black/5 transition-all active:scale-95">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    {isGenerating ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 border-t-2 border-lsl-blue rounded-full" />
                                                <Sparkles className="text-lsl-blue animate-pulse" size={32} />
                                            </div>
                                            <p className="text-lsl-black font-display font-medium text-xl">Creating Studio Asset</p>
                                            <p className="text-gray-400 text-sm font-light">Synthesizing lighting, texture, and logo placement...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center max-w-xs mx-auto text-center space-y-6">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                                                <Maximize2 size={32} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-300 uppercase tracking-widest text-[10px] mb-2">Live Preview Area</p>
                                                <p className="text-gray-400 text-sm font-light">Once you hit generate, your high-fidelity photorealistic mockup will appear here.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Watermark/Label */}
                            <div className="absolute bottom-8 left-10 flex items-center gap-3 opacity-30 select-none pointer-events-none">
                                <img src="/LSL_Logo.png" className="h-4 grayscale" alt="LSL" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-lsl-black">Mockup Engine v2.1</span>
                            </div>
                        </div>

                        </div>
                    </div>
                </div>
            </div>
        <MediaPicker
            isOpen={isMediaPickerOpen}
            onClose={() => setIsMediaPickerOpen(false)}
            onSelect={handleMediaSelect}
            multiple={false}
            defaultCategory="Brand Assets"
            title="Select Logo Artwork"
        />
        </>
    );
};