
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Upload, Loader2, Sparkles, X, Mail, Maximize2, Send, ShoppingBag, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Cal, { getCalApi } from "@calcom/embed-react";
import { cn } from '../lib/utils';

// --- Types ---

type UseCase = 'Company / Team' | 'Event' | 'Brand / Merch' | 'School / Club' | 'Other';
type ServiceInterest = 'Upfront Bulk Order' | 'Merchandise Website';
type QuantityRange = '10-49' | '50-99' | '100-249' | '250-499' | '500+';
type Timeline = 'Flexible' | '2–3 weeks' | 'ASAP';
type DecorationType = 'Screen print' | 'Embroidery' | 'DTG' | 'Not sure';

interface OrderDraft {
    useCase: UseCase | null;
    serviceInterests: ServiceInterest[];
    quantityRange: QuantityRange | null;
    timeline: Timeline | null;
    selectedItemTypes: string[];
    selectedBrands: string[];
    customItemType: string;
    customBrand: string;
    selectedColors: string[];
    customColor: string;
    decorationType: DecorationType | null; // Keep for backward compat or transition if needed, but we'll use selectedDecorationTypes
    selectedDecorationTypes: DecorationType[];
    priceEstimate: string | null;
    wantsMockup: boolean | null;
    logoFile: File | null; // Note: Files cannot be persisted in localStorage easily
    logoPreviewUrl: string | null;
    mockupImageUrl: string | null;
    mockupPrompt: string;
    viewAngle: string;
    aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    contact: {
        email: string;
        name: string;
        company: string;
    };
}

// --- Data ---
const ITEM_TYPES = ['T-Shirts', 'Polos', 'Quarter-zips', 'Hoodies', 'Sweatshirts', 'Hats', 'Jackets', 'Vests', 'Sweatpants', 'Shorts', 'Bags', 'Accessories', 'Safety/Workwear'];
const BRANDS = ['Nike', 'Adidas', 'The North Face', 'Carhartt', 'Under Armour', 'Columbia', 'Champion', 'TravisMathew', 'Patagonia', 'Bella+Canvas', 'Next Level', 'Gildan', 'Comfort Colors', 'Richardson', 'Hanes', 'Flexfit'];
const COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff', border: true },
    { name: 'Navy', hex: '#1a237e' },
    { name: 'Heather Grey', hex: '#9e9e9e' },
    { name: 'Red', hex: '#c62828' },
    { name: 'Royal Blue', hex: '#1565c0' },
    { name: 'Forest Green', hex: '#2e7d32' },
    { name: 'Charcoal', hex: '#424242' },
    { name: 'Maroon', hex: '#800000' },
    { name: 'Safety Green', hex: '#E7F538' },
];

export const OrderBuilder: React.FC<{ className?: string }> = ({ className }) => {
    // State
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showCalModal, setShowCalModal] = useState(false);

    const defaultDraft: OrderDraft = {
        useCase: null,
        serviceInterests: [],
        quantityRange: null,
        timeline: null,
        selectedItemTypes: [],
        selectedBrands: [],
        customItemType: '',
        customBrand: '',
        selectedColors: [],
        customColor: '',
        decorationType: null,
        selectedDecorationTypes: [],
        priceEstimate: null,
        wantsMockup: null,
        logoFile: null,
        logoPreviewUrl: null,
        mockupImageUrl: null,
        mockupPrompt: '',
        viewAngle: 'Front View',
        aspectRatio: '1:1',
        contact: { email: '', name: '', company: '' }
    };

    const [orderDraft, setOrderDraft] = useState<OrderDraft>(defaultDraft);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('lsl_order_draft');
        const savedStep = localStorage.getItem('lsl_order_step');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // exclude file objects as they don't serialize
                setOrderDraft({ ...defaultDraft, ...parsed, logoFile: null, logoPreviewUrl: null });
            } catch (e) { console.error(e); }
        }
        if (savedStep) {
            setStep(parseInt(savedStep));
        }
    }, []);

    useEffect(() => {
        // Save state on change, excluding non-serializable fields if needed (though simple JSON.stringify handles basic objs)
        const toSave = { ...orderDraft, logoFile: null, logoPreviewUrl: null, mockupImageUrl: null }; // Avoid saving huge base64 strings if desired, keeping mockup for now if url is short
        localStorage.setItem('lsl_order_draft', JSON.stringify(toSave));
        localStorage.setItem('lsl_order_step', step.toString());
    }, [orderDraft, step]);

    // --- Helpers ---
    const nextStep = () => {
        setDirection(1);
        setStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setDirection(-1);
        setStep(prev => prev - 1);
    };

    const updateDraft = (updates: Partial<OrderDraft>) => {
        setOrderDraft(prev => ({ ...prev, ...updates }));
    };

    // Toggle Helpers
    const toggleItem = (list: string[], item: string, key: 'selectedItemTypes' | 'selectedBrands' | 'selectedColors' | 'serviceInterests' | 'selectedDecorationTypes') => {
        const current = [...list];
        if (current.includes(item)) {
            updateDraft({ [key]: current.filter(i => i !== item) });
        } else {
            updateDraft({ [key]: [...current, item] });
        }
    };


    // --- Logic for Steps ---

    // Step 8: Price Estimate Calc
    useEffect(() => {
        if (step === 8) { // Confirmed Step 8
            // Estimate logic per item type
            const activeItemTypes = [...orderDraft.selectedItemTypes];
            if (orderDraft.customItemType) activeItemTypes.push(orderDraft.customItemType);

            if (activeItemTypes.length === 0) {
                updateDraft({ priceEstimate: "Select items to see pricing" });
                return;
            }

            // Base prices dummy map
            const bases: Record<string, number> = {
                'T-Shirts': 12, 'Polos': 25, 'Quarter-zips': 45, 'Hoodies': 35, 'Hats': 15, 'Jackets': 60, 'Bags': 10
            };

            const brandMultiplier = orderDraft.selectedBrands.includes('Nike') || orderDraft.selectedBrands.includes('The North Face') ? 1.5 : 1.0;

            let qtyDiscount = 1.0;
            if (orderDraft.quantityRange === '500+') qtyDiscount = 0.6;
            else if (orderDraft.quantityRange === '250-499') qtyDiscount = 0.7;
            else if (orderDraft.quantityRange === '100-249') qtyDiscount = 0.8;
            else if (orderDraft.quantityRange === '50-99') qtyDiscount = 0.9;

            const estimates = activeItemTypes.map(type => {
                const base = bases[type] || 20; // Default 20
                const finalMin = Math.round(base * brandMultiplier * qtyDiscount);
                const finalMax = Math.round((base + 5) * brandMultiplier * qtyDiscount);
                return `${type}: $${finalMin}–$${finalMax}`;
            });

            updateDraft({ priceEstimate: estimates.join('  •  ') });
        }
    }, [step, orderDraft.selectedItemTypes, orderDraft.customItemType, orderDraft.selectedBrands, orderDraft.quantityRange]);


    // Mockup Generation Logic 
    const generateMockup = async () => {
        if (!orderDraft.logoFile) return;

        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
            const reader = new FileReader();
            reader.readAsDataURL(orderDraft.logoFile);
            reader.onload = async () => {
                const base64Image = (reader.result as string).split(',')[1];

                // Dynamic prompt based on selections
                const itemType = orderDraft.selectedItemTypes[0] || orderDraft.customItemType || "Apparel";
                const color = orderDraft.selectedColors[0] || "White";

                const prompt = `Create a photorealistic product mockup.
             PRODUCT: ${itemType} in ${color}.
             ANGLE: ${orderDraft.viewAngle}.
             LOGO: Place the uploaded logo naturally on the product.
             STYLE: Professional studio photography, centered, 4k.
             DETAILS: ${orderDraft.mockupPrompt}.
             `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: orderDraft.logoFile?.type || 'image/png',
                                    data: base64Image
                                }
                            }
                        ]
                    },
                    config: {
                        imageConfig: { aspectRatio: orderDraft.aspectRatio }
                    }
                });

                if (response.candidates && response.candidates[0].content.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            updateDraft({ mockupImageUrl: `data:image/png;base64,${part.inlineData.data}` });
                            break;
                        }
                    }
                }
                setIsGenerating(false);
            };
        } catch (e) {
            console.error("Mockup generation failed", e);
            setIsGenerating(false);
        }
    };


    // --- Render Steps ---

    const renderStep = () => {
        switch (step) {
            case 1: // Use Case
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold text-lsl-black">What are these items for?</h2>
                        <div className="grid gap-3">
                            {(['Company / Team', 'Event', 'Brand / Merch', 'School / Club', 'Other'] as UseCase[]).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => { updateDraft({ useCase: opt }); nextStep(); }}
                                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all group flex items-center justify-between ${orderDraft.useCase === opt ? 'border-lsl-blue bg-blue-50/30' : 'border-gray-100 hover:border-lsl-blue hover:bg-blue-50/30'
                                        }`}
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-lsl-blue text-lg">{opt}</span>
                                    <ChevronRight className={`transition-opacity text-lsl-blue ${orderDraft.useCase === opt ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 2: // Service Selection
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold text-lsl-black">What services are you looking for?</h2>
                        <p className="text-gray-500 -mt-2">You can select both.</p>
                        <div className="grid gap-4">
                            {(['Upfront Bulk Order', 'Merchandise Website'] as ServiceInterest[]).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleItem(orderDraft.serviceInterests, opt, 'serviceInterests')}
                                    className={`w-full text-left p-8 rounded-[2rem] border-2 transition-all group flex items-center justify-between ${orderDraft.serviceInterests.includes(opt) ? 'border-lsl-blue bg-blue-50/30' : 'border-gray-100 hover:border-lsl-blue hover:bg-blue-50/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${orderDraft.serviceInterests.includes(opt) ? 'border-lsl-blue bg-lsl-blue' : 'border-gray-200'}`}>
                                            {orderDraft.serviceInterests.includes(opt) && <Check size={14} className="text-white" />}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-700 text-xl block">{opt}</span>
                                            <span className="text-sm text-gray-400 font-medium">
                                                {opt === 'Upfront Bulk Order' ? 'Standard production run for your team or event' : 'Setup a custom store for your fans or employees to buy directly'}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className={`transition-opacity text-lsl-blue ${orderDraft.serviceInterests.includes(opt) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={orderDraft.serviceInterests.length === 0}
                            onClick={nextStep}
                            className="w-full py-5 bg-lsl-black text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all mt-4"
                        >
                            Continue
                        </button>
                    </div>
                );
            case 3: // Quantity
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold text-lsl-black">How many items do you need?</h2>
                        <div className="grid gap-3">
                            {(['10-49', '50-99', '100-249', '250-499', '500+'] as QuantityRange[]).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => { updateDraft({ quantityRange: opt }); nextStep(); }}
                                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all group ${orderDraft.quantityRange === opt ? 'border-lsl-blue bg-blue-50/30' : 'border-gray-100 hover:border-lsl-blue hover:bg-blue-50/30'
                                        }`}
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-lsl-blue text-lg">{opt} items</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 4: // Timeline
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold text-lsl-black">When do you need them?</h2>
                        <div className="grid gap-3">
                            {(['Flexible', '2–3 weeks', 'ASAP'] as Timeline[]).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => { updateDraft({ timeline: opt }); nextStep(); }}
                                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all group ${orderDraft.timeline === opt ? 'border-lsl-blue bg-blue-50/30' : 'border-gray-100 hover:border-lsl-blue hover:bg-blue-50/30'
                                        }`}
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-lsl-blue text-lg">{opt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 5: // Product Selection (Updated)
                const canContinueProd = orderDraft.selectedItemTypes.length > 0 || orderDraft.customItemType.length > 0;
                return (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-lsl-black mb-4">What products are you interested in?</h2>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                                <ShoppingBag className="text-lsl-blue shrink-0 mt-1" size={20} />
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    We use <a href="https://www.ssactivewear.com/" target="_blank" rel="noopener noreferrer" className="text-lsl-blue font-bold hover:underline">SS Activewear</a> as our primary supplier. Any item available on their site can be ordered through us.
                                </p>
                            </div>
                        </div>

                        {/* Item Types */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Garment Types</h3>
                            <div className="flex flex-wrap gap-3">
                                {ITEM_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => toggleItem(orderDraft.selectedItemTypes, type, 'selectedItemTypes')}
                                        className={`px-6 py-3 rounded-full border-2 font-bold transition-all ${orderDraft.selectedItemTypes.includes(type)
                                            ? 'bg-lsl-black text-white border-lsl-black'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-lsl-blue'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                                <input
                                    type="text"
                                    placeholder="Other..."
                                    value={orderDraft.customItemType}
                                    onChange={(e) => updateDraft({ customItemType: e.target.value })}
                                    className="px-6 py-3 rounded-full border-2 border-gray-200 outline-none focus:border-lsl-blue min-w-[120px]"
                                />
                            </div>
                        </div>

                        {/* Brands */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Preferred Brands (Optional)</h3>
                            <div className="flex flex-wrap gap-3">
                                {BRANDS.map(brand => (
                                    <button
                                        key={brand}
                                        onClick={() => toggleItem(orderDraft.selectedBrands, brand, 'selectedBrands')}
                                        className={`px-6 py-3 rounded-full border-2 font-bold transition-all ${orderDraft.selectedBrands.includes(brand)
                                            ? 'bg-blue-50 text-lsl-blue border-lsl-blue'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-lsl-blue'
                                            }`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                                <input
                                    type="text"
                                    placeholder="Other..."
                                    value={orderDraft.customBrand}
                                    onChange={(e) => updateDraft({ customBrand: e.target.value })}
                                    className="px-6 py-3 rounded-full border-2 border-gray-200 outline-none focus:border-lsl-blue min-w-[120px]"
                                />
                            </div>
                        </div>

                        <button
                            disabled={!canContinueProd}
                            onClick={nextStep}
                            className="w-full py-5 bg-lsl-black text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                        >
                            Continue
                        </button>
                    </div>
                );
            case 6: // Colors (Renumbered from 5 duplicate)
                const canContinueColorRenamed = orderDraft.selectedColors.length > 0 || orderDraft.customColor.length > 0;
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold text-lsl-black">What colors do you need?</h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {COLORS.map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => toggleItem(orderDraft.selectedColors, c.name, 'selectedColors')}
                                    className={`group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 bg-white ${orderDraft.selectedColors.includes(c.name) ? 'border-lsl-blue ring-2 ring-blue-50' : 'border-gray-100 hover:border-lsl-blue'
                                        }`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-full shadow-sm ${c.border ? 'border border-gray-200' : ''}`}
                                        style={{ backgroundColor: c.hex }}
                                    />
                                    <div className="text-center">
                                        <span className="text-sm font-bold text-gray-700 block">{c.name}</span>
                                        {orderDraft.selectedColors.includes(c.name) && <Check size={14} className="mx-auto mt-1 text-lsl-blue" />}
                                    </div>
                                    <ChevronRight className={`transition-opacity text-lsl-blue ${orderDraft.selectedColors.includes(c.name) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </div>

                        <div className="pt-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Custom Color / Code</label>
                            <input
                                type="text"
                                placeholder="e.g. Cardinal Red, PMS 123C"
                                value={orderDraft.customColor}
                                onChange={(e) => updateDraft({ customColor: e.target.value })}
                                className="w-full p-4 rounded-2xl border-2 border-gray-200 outline-none focus:border-lsl-blue"
                            />
                        </div>

                        <button
                            disabled={!canContinueColorRenamed}
                            onClick={nextStep}
                            className="w-full py-5 bg-lsl-black text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                        >
                            Continue
                        </button>
                    </div>
                );

            case 7: // Decoration (Updated to Multi-select)
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold text-lsl-black">How will this be decorated?</h2>
                        <p className="text-gray-500 -mt-2">Select all that apply.</p>
                        <div className="grid gap-4">
                            {(['Screen print', 'Embroidery', 'DTG', 'Not sure'] as DecorationType[]).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleItem(orderDraft.selectedDecorationTypes, opt, 'selectedDecorationTypes')}
                                    className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all group flex items-center justify-between ${orderDraft.selectedDecorationTypes.includes(opt) ? 'border-lsl-blue bg-blue-50/30' : 'border-gray-100 hover:border-lsl-blue hover:bg-blue-50/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${orderDraft.selectedDecorationTypes.includes(opt) ? 'border-lsl-blue bg-lsl-blue' : 'border-gray-200'}`}>
                                            {orderDraft.selectedDecorationTypes.includes(opt) && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="font-bold text-gray-700 text-lg">{opt}</span>
                                    </div>
                                    <ChevronRight className={`transition-opacity text-lsl-blue ${orderDraft.selectedDecorationTypes.includes(opt) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={orderDraft.selectedDecorationTypes.length === 0}
                            onClick={nextStep}
                            className="w-full py-5 bg-lsl-black text-white rounded-[1.5rem] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all mt-4"
                        >
                            Continue
                        </button>
                    </div>
                );

            case 8: // Price Estimate (Updated logic above, view here)
                return (
                    <div className="space-y-8 text-center pt-8">
                        <h2 className="text-2xl font-display font-medium text-gray-500">Estimated Price Range</h2>

                        <div className="space-y-4">
                            {orderDraft.priceEstimate?.split('  •  ').map((est, i) => (
                                <div key={i} className="text-3xl md:text-4xl font-bold text-lsl-black tracking-tight border-b border-gray-100 pb-4">
                                    {est}
                                </div>
                            ))}
                        </div>

                        <p className="text-sm text-gray-400 max-w-xs mx-auto">Estimates include branding. Final pricing confirmed after design review.</p>

                        <button onClick={nextStep} className="w-full py-5 bg-lsl-blue text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all">
                            Continue
                        </button>
                    </div>
                );

            case 9: // Mockup Decision
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold text-lsl-black">Would you like to see a mockup?</h2>
                        <div className="grid gap-4">
                            <button
                                onClick={() => { updateDraft({ wantsMockup: true }); nextStep(); }}
                                className="w-full p-8 rounded-[2rem] bg-lsl-black text-white text-left hover:shadow-2xl transition-all group relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <span className="block text-xl font-bold mb-1">Yes, open the studio</span>
                                        <span className="text-white/60 text-sm">Visualize your logo on the product instantly</span>
                                    </div>
                                    <Sparkles className="text-yellow-300" />
                                </div>
                            </button>

                            <button
                                onClick={() => { updateDraft({ wantsMockup: false }); setStep(11); /* Skip to contact (was 10) */ }}
                                className="w-full p-6 rounded-[2rem] border-2 border-gray-100 text-gray-600 font-medium hover:bg-gray-50 transition-all"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                );
            case 10: // Full Mockup Studio
                const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const url = URL.createObjectURL(file);
                        updateDraft({ logoFile: file, logoPreviewUrl: url });
                    }
                };

                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-display font-bold text-lsl-black">Mockup Studio</h2>
                            <button onClick={() => nextStep()} className="text-sm text-gray-400 hover:text-black underline">Skip</button>
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">View</label>
                                <select
                                    value={orderDraft.viewAngle}
                                    onChange={(e) => updateDraft({ viewAngle: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-medium"
                                >
                                    <option>Front View</option><option>Back View</option><option>Model</option><option>Flat Lay</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Format</label>
                                <select
                                    value={orderDraft.aspectRatio}
                                    onChange={(e) => updateDraft({ aspectRatio: e.target.value as any })}
                                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-medium"
                                >
                                    <option value="1:1">Square (1:1)</option><option value="4:3">Standard (4:3)</option><option value="16:9">Wide (16:9)</option>
                                </select>
                            </div>
                        </div>

                        {/* Upload & Preview */}
                        <div
                            className={`border-2 border-dashed rounded-[2rem] min-h-[300px] flex flex-col transition-all overflow-hidden relative ${orderDraft.mockupImageUrl ? 'border-none p-0' : 'p-6'
                                } ${orderDraft.logoPreviewUrl && !orderDraft.mockupImageUrl ? 'border-lsl-blue bg-blue-50/10' : 'border-gray-200'}`}
                        >
                            {orderDraft.mockupImageUrl ? (
                                <div className="relative group/image">
                                    <img src={orderDraft.mockupImageUrl} className="w-full rounded-[2rem]" alt="AI Render" />
                                    <button
                                        onClick={() => updateDraft({ mockupImageUrl: null })}
                                        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover/image:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-lsl-blue">AI Generated</div>
                                </div>
                            ) : (
                                <>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

                                    {/* Has Logo but no generation yet */}
                                    {orderDraft.logoPreviewUrl ? (
                                        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                                            <div className="h-32 w-32 relative">
                                                <img src={orderDraft.logoPreviewUrl} className="w-full h-full object-contain" alt="Logo" />
                                                <button onClick={() => updateDraft({ logoFile: null, logoPreviewUrl: null })} className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1"><X size={12} /></button>
                                            </div>
                                            <textarea
                                                placeholder="Add styling notes (e.g. vintage texture, cinematic lighting)..."
                                                value={orderDraft.mockupPrompt}
                                                onChange={(e) => updateDraft({ mockupPrompt: e.target.value })}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs h-20 resize-none"
                                            />
                                            <button
                                                onClick={generateMockup}
                                                disabled={isGenerating}
                                                className="w-full py-3 bg-lsl-black text-white rounded-xl font-bold flex items-center justify-center gap-2"
                                            >
                                                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                                Generate
                                            </button>
                                        </div>
                                    ) : (
                                        <div onClick={() => fileInputRef.current?.click()} className="flex-grow flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 rounded-xl transition-colors">
                                            <Upload className="mb-4 text-gray-300" size={32} />
                                            <p className="font-bold text-gray-500">Upload Logo</p>
                                            <p className="text-xs text-gray-400 mt-2 text-center px-4">Click to select artwork for your mockup</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <button
                            onClick={nextStep}
                            className="w-full py-5 bg-lsl-black text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            Finish & Contact Info <ArrowRight size={18} />
                        </button>
                    </div>
                );

            case 11: // Contact Info
                const isValidEmail = orderDraft.contact.email.includes('@') && orderDraft.contact.email.includes('.');

                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold text-lsl-black">Where should we send your estimate?</h2>

                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email (required)"
                                value={orderDraft.contact.email}
                                onChange={e => updateDraft({ contact: { ...orderDraft.contact, email: e.target.value } })}
                                className="w-full p-5 rounded-2xl border-none bg-gray-50 focus:ring-2 focus:ring-lsl-blue/20 outline-none font-medium"
                            />
                            <input
                                type="text"
                                placeholder="Name (optional)"
                                value={orderDraft.contact.name}
                                onChange={e => updateDraft({ contact: { ...orderDraft.contact, name: e.target.value } })}
                                className="w-full p-5 rounded-2xl border-none bg-gray-50 focus:ring-2 focus:ring-lsl-blue/20 outline-none font-medium"
                            />
                            <input
                                type="text"
                                placeholder="Company (optional)"
                                value={orderDraft.contact.company}
                                onChange={e => updateDraft({ contact: { ...orderDraft.contact, company: e.target.value } })}
                                className="w-full p-5 rounded-2xl border-none bg-gray-50 focus:ring-2 focus:ring-lsl-blue/20 outline-none font-medium"
                            />
                        </div>

                        <button
                            disabled={!isValidEmail}
                            onClick={() => {
                                // Clear storage on submit
                                localStorage.removeItem('lsl_order_draft');
                                localStorage.removeItem('lsl_order_step');
                                nextStep();
                            }}
                            className="w-full py-5 bg-lsl-blue text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                        >
                            Submit Request
                        </button>
                    </div>
                );

            case 12: // Confirmation (General + Cal.com)
                return (
                    <div className="text-center space-y-8 pt-8 relative">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={40} strokeWidth={3} />
                        </div>

                        <h2 className="text-4xl font-display font-bold text-lsl-black">Request Received!</h2>
                        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                            We've received your project details. Our team will review your requirements and follow up via email shortly with a formal quote and next steps.
                        </p>

                        <div className="grid gap-3 max-w-xs mx-auto">
                            <button
                                onClick={() => setShowCalModal(true)}
                                className="w-full py-4 bg-lsl-black text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                            >
                                Schedule a Live Design Call
                            </button>
                            <button onClick={() => window.location.reload()} className="w-full py-4 text-gray-500 font-bold hover:text-lsl-black transition-colors">
                                Back to Home
                            </button>
                        </div>

                        {/* Cal Modal */}
                        <AnimatePresence>
                            {showCalModal && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[100] bg-white/50 backdrop-blur-md flex items-center justify-center p-4 lg:p-10"
                                >
                                    <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden relative border border-gray-200">
                                        <button
                                            onClick={() => setShowCalModal(false)}
                                            className="absolute top-4 right-4 z-50 bg-white p-2 rounded-full shadow-md text-black"
                                        >
                                            <X size={20} />
                                        </button>
                                        <Cal
                                            namespace="test-live"
                                            calLink="brad-gunn-q42thj/test-live"
                                            style={{ width: "100%", height: "100%", overflow: "scroll" }}
                                            config={{ "layout": "month_view" }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );

            default:
                return null;
        }
    };

    const totalSteps = 12;

    // --- Main Layout ---
    return (
        <div className={cn("min-h-screen bg-white pt-24 pb-20 px-4 md:px-8", className)}>
            <div className="max-w-2xl mx-auto">

                {/* Header / Nav */}
                <div className="mb-12 flex items-center justify-between">
                    {step > 1 && step < 12 ? (
                        <button onClick={prevStep} className="p-2 -ml-2 text-gray-400 hover:text-lsl-black">
                            <ChevronLeft />
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 12 && (
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-300">
                            Step {step} of {totalSteps}
                        </div>
                    )}

                    <div />
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        initial={{ x: direction * 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * -50, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>

            </div>
        </div>
    );
};
