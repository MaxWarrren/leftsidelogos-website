
import React, { useState, useRef, useEffect } from 'react';
import { Check, Upload, Loader2, Sparkles, X, Calendar, ShoppingBag, ChevronDown, ChevronUp, Minus, Plus, Trash2, Tag, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { MediaPicker, type MediaItem } from './MediaPicker';
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
    logoMedia: MediaItem[];
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
                <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden bg-white">
                    {group.mockupUrl ? (
                        <img src={group.mockupUrl} alt={group.productName} className="w-full h-full object-cover" />
                    ) : group.image ? (
                        <img src={group.image} alt={group.productName} className="w-full h-full object-contain p-1.5" />
                    ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                    )}
                    {group.mockupUrl && (
                        <div className="absolute top-0 right-0 bg-white/80 backdrop-blur-sm rounded-bl-lg p-0.5">
                            <Sparkles className="w-3 h-3 text-lsl-blue" />
                        </div>
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
    const { isAuthenticated, user, profile, organization, openAuthModal } = useAuth();

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
        logoMedia: [],
        mockupImageUrl: null,
        mockupPrompt: '',
        viewAngle: 'Front View',
        aspectRatio: '1:1',
        contact: { email: '', name: '', company: '' },
    };

    const [orderDraft, setOrderDraft] = useState<OrderDraft>(defaultDraft);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

    // Persist draft to localStorage (excluding non-serializable fields)
    useEffect(() => {
        const saved = localStorage.getItem('lsl_order_draft');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setOrderDraft({ ...defaultDraft, ...parsed, logoMedia: [], mockupImageUrl: null });
            } catch (e) { console.error(e); }
        }
    }, []);

    useEffect(() => {
        const toSave = { ...orderDraft, logoMedia: [], mockupImageUrl: null };
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

    const handleMediaSelect = (items: MediaItem[]) => {
        // limit to 3 total
        const remainingSlots = 3 - orderDraft.logoMedia.length;
        if (remainingSlots <= 0) return;
        const newItems = items.slice(0, remainingSlots);
        updateDraft({ logoMedia: [...orderDraft.logoMedia, ...newItems] });
    };

    const removeFile = (index: number) => {
        const newMedia = [...orderDraft.logoMedia];
        newMedia.splice(index, 1);
        updateDraft({ logoMedia: newMedia });
    };

    const handleSubmit = async () => {
        if (!isAuthenticated || !organization) {
            openAuthModal();
            return;
        }

        setIsGenerating(true);
        try {
            // Include selected media item URLs
            const fileUrls: string[] = [];
            for (const media of orderDraft.logoMedia) {
                const { data: urlData } = supabase.storage
                    .from('organization-assets')
                    .getPublicUrl(media.file_path);
                fileUrls.push(urlData.publicUrl);
            }

            // Upload mockup if present
            if (orderDraft.mockupImageUrl) {
                try {
                    const mockupRes = await fetch(orderDraft.mockupImageUrl);
                    const blob = await mockupRes.blob();
                    const safeName = `${Date.now()}-mockup.png`;
                    const filePath = `order-attachments/${organization.id}/${safeName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('leads-attachments')
                        .upload(filePath, blob);

                    if (!uploadError) {
                        const { data: urlData } = supabase.storage
                            .from('leads-attachments')
                            .getPublicUrl(filePath);
                        fileUrls.push(urlData.publicUrl);
                    }
                } catch (err) {
                    console.warn('Mockup upload failed:', err);
                }
            }

            // Build cart breakdown for order details
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

            // Generate order name
            const orderName = `${organization.name} - Website Order`;

            // Build description from preferences
            const descParts = [];
            if (orderDraft.useCase) descParts.push(`Use case: ${orderDraft.useCase}`);
            if (orderDraft.serviceInterests.length) descParts.push(`Services: ${orderDraft.serviceInterests.join(', ')}`);
            if (orderDraft.timeline) descParts.push(`Timeline: ${orderDraft.timeline}`);
            if (orderDraft.selectedDecorationTypes.length) descParts.push(`Decoration: ${orderDraft.selectedDecorationTypes.join(', ')}`);
            if (orderDraft.logoPlacement) descParts.push(`Placement: ${orderDraft.logoPlacement}`);

            const { error } = await supabase.from('orders').insert({
                organization_id: organization.id,
                name: orderName,
                status: 'pending',
                timeline_step: 1,
                price: cartTotal,
                details: cartBreakdown,
                description: descParts.join('\n'),
                source: 'website',
                submitted_by: user?.id,
                attachments: fileUrls,
            });

            if (error) {
                throw new Error(error.message);
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
        <>
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
                            {orderDraft.logoMedia.map((media, i) => (
                                <div key={i} className="relative aspect-square bg-white rounded-xl border border-gray-200 p-2 flex items-center justify-center overflow-hidden">
                                    <StoragePreviewImage path={media.file_path} alt={media.file_name} />
                                    <button
                                        onClick={() => removeFile(i)}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200 z-10"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {orderDraft.logoMedia.length < 3 && (
                                <button
                                    onClick={() => setIsMediaPickerOpen(true)}
                                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-lsl-blue hover:text-lsl-blue hover:bg-blue-50/10 transition-all"
                                >
                                    <Upload size={22} />
                                    <span className="text-xs font-bold mt-2">Add Media</span>
                                </button>
                            )}
                        </div>

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

                {/* 04 — Account Info */}
                <Section number="04" title="Your Account">
                    {isAuthenticated && profile ? (
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-lsl-blue flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">{profile.full_name?.charAt(0) || '?'}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{profile.full_name}</p>
                                    <p className="text-sm text-gray-400">{profile.email}</p>
                                </div>
                            </div>
                            {organization && (
                                <p className="text-sm text-gray-500 pl-[52px]">Org: <span className="font-semibold">{organization.name}</span></p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                                <LogIn className="w-8 h-8 text-lsl-blue" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-gray-700 text-lg">Log in to submit your order</h3>
                                <p className="text-sm text-gray-400 mt-1">Create a free account to track orders and manage your projects.</p>
                            </div>
                            <button
                                onClick={openAuthModal}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-lsl-blue text-white rounded-full font-bold text-sm hover:bg-lsl-black transition-all"
                            >
                                <LogIn size={16} />
                                Log In / Sign Up
                            </button>
                        </div>
                    )}
                </Section>

                {/* Submit */}
                <button
                    disabled={!isAuthenticated || !organization || isGenerating}
                    onClick={handleSubmit}
                    className="w-full py-5 bg-lsl-blue text-white rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : !isAuthenticated ? 'Log in to Submit' : 'Submit Order'}
                </button>

            </div>
        </div>
        
        <MediaPicker
            isOpen={isMediaPickerOpen}
            onClose={() => setIsMediaPickerOpen(false)}
            onSelect={handleMediaSelect}
            multiple={true}
            defaultCategory="Brand Assets"
            title="Select Media"
        />
        </>
    );
};

// Helper component
function StoragePreviewImage({ path, alt }: { path: string, alt?: string }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const getUrl = async () => {
            const { data } = await supabase.storage.from('organization-assets').createSignedUrl(path, 3600);
            if (data?.signedUrl) setUrl(data.signedUrl);
        };
        getUrl();
    }, [path]);

    if (!url) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-gray-300" /></div>;

    return <img src={url} className="w-full h-full object-contain" alt={alt || "Preview"} />;
}
