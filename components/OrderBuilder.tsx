
import React, { useState, useRef, useEffect } from 'react';
import { Check, Upload, Loader2, Sparkles, X, Calendar, ShoppingBag, ChevronDown, ChevronUp, Minus, Plus, Trash2, Tag } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from './CartContext';
import type { GroupedCartItem } from '../types';

// --- Types ---

type UseCase = 'Company / Team' | 'Event' | 'Brand / Merch' | 'School / Club' | 'Other';
type ServiceInterest = 'Upfront Bulk Order' | 'Merchandise Website';
type Timeline = 'Flexible' | '2–3 weeks' | 'ASAP';
type DecorationType = 'Screen print' | 'Embroidery' | 'DTG' | 'Not sure';

interface OrderDraft {
    useCase: UseCase | null;
    serviceInterests: ServiceInterest[];
    timeline: Timeline | null;
    selectedDecorationTypes: DecorationType[];
    logoPlacement: string;
    wantsMockup: boolean | null;
    logoFiles: File[];
    logoPreviewUrls: string[];
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

// --- Section wrapper ---

const Section: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="space-y-6">
        <div className="flex items-baseline gap-3">
            <span className="text-xs font-bold tracking-widest text-gray-300">{number}</span>
            <h2 className="text-xl font-display font-bold text-lsl-black">{title}</h2>
        </div>
        <div className="border-t border-gray-100 pt-6">
            {children}
        </div>
    </div>
);

// --- Chip (single-select option card) ---

const Chip: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode }> = ({ selected, onClick, children }) => (
    <button
        onClick={onClick}
        className={cn(
            'px-6 py-3 rounded-2xl border-2 font-bold text-left transition-all',
            selected
                ? 'border-lsl-blue bg-blue-50/30 text-lsl-blue'
                : 'border-gray-100 text-gray-700 hover:border-lsl-blue hover:bg-blue-50/20'
        )}
    >
        {children}
    </button>
);

// --- Pill toggle button ---

const Pill: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode }> = ({ selected, onClick, children }) => (
    <button
        onClick={onClick}
        className={cn(
            'px-5 py-2.5 rounded-full border-2 font-bold text-sm transition-all',
            selected
                ? 'bg-lsl-black text-white border-lsl-black'
                : 'bg-white text-gray-600 border-gray-200 hover:border-lsl-blue'
        )}
    >
        {children}
    </button>
);

// --- Cart Item Card (collapsible) ---

const CartItemCard: React.FC<{
    group: GroupedCartItem;
    onUpdateQuantity: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
}> = ({ group, onUpdateQuantity, onRemove }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden transition-all hover:border-gray-200">
            {/* Collapsed header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 p-4 text-left"
            >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {group.image ? (
                        <img src={group.image} alt={group.productName} className="w-full h-full object-contain p-1.5" />
                    ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-gray-900 truncate">{group.productName}</h3>
                    <p className="text-xs text-gray-400 font-medium">
                        SKU: {group.sku} · {group.category} · {group.variants.length} variant{group.variants.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Summary */}
                <div className="text-right shrink-0">
                    <p className="font-display font-bold text-lsl-blue">${group.subtotal.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{group.totalQuantity} items</p>
                </div>

                {/* Chevron */}
                <div className="shrink-0 text-gray-300">
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </button>

            {/* Expanded variant rows */}
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr_1fr_120px_40px] gap-3 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                        <span>Color</span>
                        <span>Size</span>
                        <span className="text-center">Qty</span>
                        <span></span>
                    </div>
                    {group.variants.map((v) => (
                        <div key={v.id} className="grid grid-cols-[1fr_1fr_120px_40px] gap-3 px-5 py-3 items-center border-t border-gray-100/80">
                            <span className="text-sm font-medium text-gray-700 truncate">{v.color}</span>
                            <span className="text-sm font-medium text-gray-700">{v.size}</span>
                            <div className="flex items-center justify-center gap-1">
                                <button
                                    onClick={() => onUpdateQuantity(v.id, v.quantity - 1)}
                                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-lsl-blue hover:text-lsl-blue transition-colors"
                                >
                                    <Minus size={12} />
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    value={v.quantity}
                                    onChange={(e) => onUpdateQuantity(v.id, Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-12 h-7 text-center rounded-lg border border-gray-200 text-sm font-bold focus:border-lsl-blue focus:outline-none"
                                />
                                <button
                                    onClick={() => onUpdateQuantity(v.id, v.quantity + 1)}
                                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-lsl-blue hover:text-lsl-blue transition-colors"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                            <button
                                onClick={() => onRemove(v.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

export const OrderBuilder: React.FC<{ className?: string; onNavigateToMockup?: () => void; onNavigateToContact?: () => void; onNavigateToCatalog?: () => void }> = ({ className, onNavigateToMockup, onNavigateToContact, onNavigateToCatalog }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { items: cartItems, getGroupedItems, getCartTotal, getCartCount, updateQuantity, removeFromCart, clearCart } = useCart();

    const groupedItems = getGroupedItems();
    const cartTotal = getCartTotal();
    const cartCount = getCartCount();

    const defaultDraft: OrderDraft = {
        useCase: null,
        serviceInterests: [],
        timeline: null,
        selectedDecorationTypes: [],
        logoPlacement: '',
        wantsMockup: null,
        logoFiles: [],
        logoPreviewUrls: [],
        mockupImageUrl: null,
        mockupPrompt: '',
        viewAngle: 'Front View',
        aspectRatio: '1:1',
        contact: { email: '', name: '', company: '' },
    };

    const [orderDraft, setOrderDraft] = useState<OrderDraft>(defaultDraft);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Persist draft to localStorage (excluding non-serializable fields)
    useEffect(() => {
        const saved = localStorage.getItem('lsl_order_draft');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setOrderDraft({ ...defaultDraft, ...parsed, logoFiles: [], logoPreviewUrls: [], mockupImageUrl: null });
            } catch (e) { console.error(e); }
        }
    }, []);

    useEffect(() => {
        const toSave = { ...orderDraft, logoFiles: [], logoPreviewUrls: [], mockupImageUrl: null };
        localStorage.setItem('lsl_order_draft', JSON.stringify(toSave));
    }, [orderDraft]);

    const updateDraft = (updates: Partial<OrderDraft>) => {
        setOrderDraft(prev => ({ ...prev, ...updates }));
    };

    const toggleItem = (list: string[], item: string, key: 'serviceInterests' | 'selectedDecorationTypes') => {
        const current = [...list];
        if (current.includes(item)) {
            updateDraft({ [key]: current.filter(i => i !== item) });
        } else {
            updateDraft({ [key]: [...current, item] });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).slice(0, 3 - orderDraft.logoFiles.length);
            const newUrls = newFiles.map(file => URL.createObjectURL(file));
            updateDraft({
                logoFiles: [...orderDraft.logoFiles, ...newFiles],
                logoPreviewUrls: [...orderDraft.logoPreviewUrls, ...newUrls],
            });
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...orderDraft.logoFiles];
        const newUrls = [...orderDraft.logoPreviewUrls];
        newFiles.splice(index, 1);
        newUrls.splice(index, 1);
        updateDraft({ logoFiles: newFiles, logoPreviewUrls: newUrls });
    };

    const handleSubmit = async () => {
        setIsGenerating(true);
        try {
            const SUPABASE_URL = 'https://fijepyoxxfjjyynuwdmr.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpamVweW94eGZqanl5bnV3ZG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTIyMzgsImV4cCI6MjA4NDc4ODIzOH0.o5X3y3GXDana12791HpvyBAMlnta1Gil9TodMPErWiY';
            const STORAGE_BUCKET = 'leads-attachments';

            const uploadFile = async (file: File | Blob, fileName: string): Promise<string | null> => {
                const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                try {
                    const res = await fetch(
                        `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${safeName}`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                                'apikey': SUPABASE_ANON_KEY,
                            },
                            body: file,
                        }
                    );
                    if (!res.ok) {
                        console.error('Upload failed:', await res.text());
                        return null;
                    }
                    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${safeName}`;
                } catch (err) {
                    console.error('Upload error:', err);
                    return null;
                }
            };

            // Upload logo files
            const fileUrls: string[] = [];
            for (const file of orderDraft.logoFiles) {
                if (file && file.size > 0) {
                    const url = await uploadFile(file, file.name);
                    if (url) fileUrls.push(url);
                }
            }

            // Upload mockup if present
            if (orderDraft.mockupImageUrl) {
                try {
                    const mockupRes = await fetch(orderDraft.mockupImageUrl);
                    const blob = await mockupRes.blob();
                    const url = await uploadFile(blob, 'mockup_generated.png');
                    if (url) fileUrls.push(url);
                } catch (err) {
                    console.warn('Mockup upload failed:', err);
                }
            }

            // Build cart breakdown for webhook
            const cartBreakdown = groupedItems.map(g => ({
                product: g.productName,
                sku: g.sku,
                category: g.category,
                basePrice: g.basePrice,
                totalQuantity: g.totalQuantity,
                subtotal: g.subtotal,
                variants: g.variants.map(v => ({
                    color: v.color,
                    size: v.size,
                    quantity: v.quantity,
                })),
            }));

            const payload = {
                contact: {
                    name: orderDraft.contact.name,
                    email: orderDraft.contact.email,
                    company: orderDraft.contact.company,
                },
                order: {
                    useCase: orderDraft.useCase,
                    serviceInterests: orderDraft.serviceInterests,
                    timeline: orderDraft.timeline,
                    decorationTypes: orderDraft.selectedDecorationTypes,
                    logoPlacement: orderDraft.logoPlacement || null,
                    items: cartBreakdown,
                    totalItems: cartCount,
                    totalEstimate: cartTotal,
                },
                meta: {
                    submittedAt: new Date().toISOString(),
                    source: 'website_order_builder',
                    fileUrls,
                },
            };

            const WEBHOOK_ID = '76e4d8b0-e9eb-4dad-85e7-115c1d453a99';
            const WEBHOOK_BASE = 'https://n8n.maxwellwarren.dev';
            const PRODUCTION_URL = `${WEBHOOK_BASE}/webhook/${WEBHOOK_ID}`;
            const TEST_URL = `${WEBHOOK_BASE}/webhook-test/${WEBHOOK_ID}`;

            const sendToWebhook = async (url: string) => {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(`Webhook responded with ${res.status}`);
                return res;
            };

            try {
                await sendToWebhook(PRODUCTION_URL);
            } catch (prodError) {
                console.warn('Production webhook failed, trying test webhook...', prodError);
                await sendToWebhook(TEST_URL);
            }

            localStorage.removeItem('lsl_order_draft');
            clearCart();
            setIsSubmitted(true);
        } catch (e: any) {
            console.error('Submission failed', e);
            alert(`Something went wrong: ${e.message || 'Please check your connection.'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const isValidEmail = orderDraft.contact.email.includes('@') && orderDraft.contact.email.includes('.');

    // --- Confirmation Screen ---
    if (isSubmitted) {
        return (
            <div className={cn("min-h-screen bg-white pt-24 pb-20 px-4 md:px-8", className)}>
                <div className="max-w-2xl mx-auto text-center space-y-8 pt-16">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                        <Check size={40} strokeWidth={3} />
                    </div>
                    <h2 className="text-4xl font-display font-bold text-lsl-black">Request Received!</h2>
                    <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                        We've received your project details. Our team will review your requirements and follow up via email shortly with a formal quote and next steps.
                    </p>
                    <div className="grid gap-3 max-w-xs mx-auto">
                        <button
                            onClick={() => {
                                setIsSubmitted(false);
                                setOrderDraft(defaultDraft);
                            }}
                            className="w-full py-4 bg-lsl-black text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                        >
                            Start New Order
                        </button>
                        <button
                            onClick={onNavigateToContact}
                            className="w-full py-4 bg-lsl-blue text-white rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            Schedule Live Design Call <Calendar size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Form ---
    return (
        <div className={cn("min-h-screen bg-white pt-24 pb-20 px-4 md:px-8", className)}>
            <div className="max-w-2xl mx-auto space-y-16">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-display font-bold text-lsl-black">Build Your Order</h1>
                    <p className="text-gray-400 mt-2">Fill out what you know — our team will handle the rest.</p>
                </div>

                {/* 01 — What's This For */}
                <Section number="01" title="What's this for?">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Use Case</p>
                            <div className="flex flex-wrap gap-3">
                                {(['Company / Team', 'Event', 'Brand / Merch', 'School / Club', 'Other'] as UseCase[]).map(opt => (
                                    <Chip
                                        key={opt}
                                        selected={orderDraft.useCase === opt}
                                        onClick={() => updateDraft({ useCase: opt })}
                                    >
                                        {opt}
                                    </Chip>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Service (select all that apply)</p>
                            <div className="grid gap-3">
                                {([
                                    { value: 'Upfront Bulk Order', desc: 'Standard production run for your team or event' },
                                    { value: 'Merchandise Website', desc: 'Setup a custom store for your fans or employees to buy directly' },
                                ] as { value: ServiceInterest; desc: string }[]).map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => toggleItem(orderDraft.serviceInterests, opt.value, 'serviceInterests')}
                                        className={cn(
                                            'w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4',
                                            orderDraft.serviceInterests.includes(opt.value)
                                                ? 'border-lsl-blue bg-blue-50/30'
                                                : 'border-gray-100 hover:border-lsl-blue hover:bg-blue-50/20'
                                        )}
                                    >
                                        <div className={cn(
                                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                                            orderDraft.serviceInterests.includes(opt.value) ? 'border-lsl-blue bg-lsl-blue' : 'border-gray-200'
                                        )}>
                                            {orderDraft.serviceInterests.includes(opt.value) && <Check size={12} className="text-white" />}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-800 block">{opt.value}</span>
                                            <span className="text-sm text-gray-400">{opt.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Timeline</p>
                            <div className="flex flex-wrap gap-3">
                                {(['Flexible', '2–3 weeks', 'ASAP'] as Timeline[]).map(opt => (
                                    <Chip
                                        key={opt}
                                        selected={orderDraft.timeline === opt}
                                        onClick={() => updateDraft({ timeline: opt })}
                                    >
                                        {opt}
                                    </Chip>
                                ))}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 02 — Your Items (Cart) */}
                <Section number="02" title="Your Items">
                    {groupedItems.length === 0 ? (
                        <div className="text-center py-12 space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                <ShoppingBag className="w-8 h-8 text-gray-300" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-gray-400 text-lg">Your cart is empty</h3>
                                <p className="text-sm text-gray-400 mt-1">Browse our catalog to add products to your order.</p>
                            </div>
                            {onNavigateToCatalog && (
                                <button
                                    onClick={onNavigateToCatalog}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-lsl-blue text-white rounded-full font-bold text-sm hover:bg-lsl-black transition-all"
                                >
                                    <Tag size={16} />
                                    Browse Catalog
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {groupedItems.map(group => (
                                <CartItemCard
                                    key={group.productId}
                                    group={group}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeFromCart}
                                />
                            ))}
                            {/* Cart summary bar */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
                                <div>
                                    <span className="text-sm font-bold text-gray-500">{cartCount} items</span>
                                    {onNavigateToCatalog && (
                                        <button onClick={onNavigateToCatalog} className="text-sm text-lsl-blue font-bold ml-3 hover:underline">
                                            + Add more
                                        </button>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Est. Total</span>
                                    <p className="text-xl font-display font-bold text-lsl-blue">${cartTotal.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* SS Activewear Callout - moved here */}
                            <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 flex items-start gap-3 mt-4">
                                <ShoppingBag className="text-lsl-blue shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    We use <a href="https://www.ssactivewear.com/" target="_blank" rel="noopener noreferrer" className="text-lsl-blue font-bold hover:underline">SS Activewear</a> as our primary supplier. Any item available on their site can be ordered through us.
                                </p>
                            </div>
                        </div>
                    )}
                </Section>

                {/* 03 — Logos */}
                <Section number="03" title="Upload Your Logos">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">Upload up to 3 logo files. PNG or SVG preferred.</p>
                        <div className="grid grid-cols-3 gap-4">
                            {orderDraft.logoPreviewUrls.map((url, i) => (
                                <div key={i} className="relative aspect-square bg-white rounded-xl border border-gray-200 p-2 flex items-center justify-center">
                                    <img src={url} className="w-full h-full object-contain" alt={`Logo ${i + 1}`} />
                                    <button
                                        onClick={() => removeFile(i)}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {orderDraft.logoFiles.length < 3 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-lsl-blue hover:text-lsl-blue hover:bg-blue-50/10 transition-all"
                                >
                                    <Upload size={22} />
                                    <span className="text-xs font-bold mt-2">Add Logo</span>
                                </button>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />

                        <div className="bg-blue-50/50 rounded-2xl p-5 flex items-start gap-3 border border-blue-100">
                            <Sparkles size={18} className="text-lsl-blue shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-lsl-blue text-sm">Want to preview your logo on a product?</p>
                                <p className="text-sm text-gray-500 mt-0.5">Try our Mockup Studio to visualize before ordering.</p>
                                <button
                                    onClick={() => onNavigateToMockup && onNavigateToMockup()}
                                    className="text-sm font-bold text-lsl-blue hover:underline mt-1"
                                >
                                    Open Mockup Studio &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 04 — Contact Info */}
                <Section number="04" title="Your Info">
                    <div className="space-y-3">
                        <input
                            type="email"
                            placeholder="Email (required)"
                            value={orderDraft.contact.email}
                            onChange={e => updateDraft({ contact: { ...orderDraft.contact, email: e.target.value } })}
                            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-lsl-blue outline-none font-medium"
                        />
                        <input
                            type="text"
                            placeholder="Name (optional)"
                            value={orderDraft.contact.name}
                            onChange={e => updateDraft({ contact: { ...orderDraft.contact, name: e.target.value } })}
                            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-lsl-blue outline-none font-medium"
                        />
                        <input
                            type="text"
                            placeholder="Company (optional)"
                            value={orderDraft.contact.company}
                            onChange={e => updateDraft({ contact: { ...orderDraft.contact, company: e.target.value } })}
                            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-lsl-blue outline-none font-medium"
                        />
                    </div>
                </Section>

                {/* Submit */}
                <button
                    disabled={!isValidEmail || isGenerating}
                    onClick={handleSubmit}
                    className="w-full py-5 bg-lsl-blue text-white rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : 'Submit Request'}
                </button>

            </div>
        </div>
    );
};
