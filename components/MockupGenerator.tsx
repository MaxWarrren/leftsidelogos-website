import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Send, Loader2, Upload, Sparkles, ShoppingBag, Maximize2, X, Mail } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface MockupGeneratorProps {
    onSwitchToQuote: () => void;
}

export const MockupGenerator: React.FC<MockupGeneratorProps> = ({ onSwitchToQuote }) => {
    const [mockupPrompt, setMockupPrompt] = useState('');
    const [mockupImage, setMockupImage] = useState<File | null>(null);
    const [mockupPreview, setMockupPreview] = useState<string | null>(null);
    const [generatedMockup, setGeneratedMockup] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Changed to text inputs
    const [itemType, setItemType] = useState('T-Shirt');
    const [viewAngle, setViewAngle] = useState('Front View');
    const [logoPlacement, setLogoPlacement] = useState('Center Chest');
    const [color, setColor] = useState('White');

    const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [email, setEmail] = useState(localStorage.getItem('lsl_user_email') || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleGenerateClick = () => {
        if (!mockupImage) return;
        if (!email) {
            setShowEmailModal(true);
        } else {
            generateMockup();
        }
    };

    const generateMockup = async () => {
        setIsGenerating(true);
        setGeneratedMockup(null);
        setShowEmailModal(false);

        try {
            const base64Image = mockupPreview?.split(',')[1] || '';
            const mimeType = mockupImage?.type || 'image/png';

            const prompt = `You are an elite product photography AI for "Left Side Logos". 
        TASK: Create a photorealistic, commercial-grade product mockup.
        PRODUCT: ${color} ${itemType}.
        ANGLE: ${viewAngle}.
        LOGO PLACEMENT: ${logoPlacement}.
        LOGO: Naturally integrate the uploaded artwork onto the garment. Ensure the logo follows the fabric's curves, wrinkles, and lighting.
        MANDATORY STYLE: The rendered image MUST be large, centered, and take up the full frame. No excessive white space around the product.
        ADDITIONAL DETAILS: ${mockupPrompt}.
        ENVIRONMENT: Professional, minimalist studio with soft directional lighting.`;

            // Call Portal API
            const response = await fetch('http://localhost:3000/api/mockup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    imageBase64: base64Image,
                    aspectRatio,
                    mimeType
                })
            });

            const data = await response.json();

            if (data.success && data.image) {
                setGeneratedMockup(data.image);
            } else {
                console.error("Generation failed:", data.error);
                alert("Failed to generate mockup. Please try again.");
            }

        } catch (error) {
            console.error("Error generating mockup:", error);
            alert("Error connecting to generation service.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            localStorage.setItem('lsl_user_email', email);
            generateMockup();
        }
    };

    return (
        <div className="pt-32 pb-20 min-h-screen bg-[#fcfcfd] relative overflow-hidden">
            {/* Airy Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 max-w-7xl">
                <header className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-lsl-blue text-[10px] font-bold uppercase tracking-widest border border-blue-100"
                    >
                        <Sparkles size={12} />
                        AI Powered Visualization
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-lsl-black tracking-tight">Mockup Studio</h1>
                    <p className="text-gray-400 max-w-xl mx-auto font-sans font-light text-lg">
                        Experience our premium apparel library. Upload your artwork and let our AI handle the rendering with studio precision.
                    </p>

                    <button
                        onClick={onSwitchToQuote}
                        className="text-xs font-bold text-gray-400 hover:text-lsl-blue transition-colors flex items-center justify-center gap-2 mx-auto pt-2 group"
                    >
                        <ShoppingBag size={14} className="group-hover:scale-110 transition-transform" />
                        Interested in pricing? <span className="underline decoration-blue-200 underline-offset-4">Jump to Build Your Order</span>
                    </button>
                </header>

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
                                onClick={() => fileInputRef.current?.click()}
                                className={`group relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 ${mockupPreview ? 'border-lsl-blue/20 bg-blue-50/10' : 'border-gray-200 hover:border-lsl-blue/40 hover:bg-gray-50'
                                    }`}
                            >
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Apparel Type</label>
                                    <input
                                        type="text"
                                        value={itemType}
                                        onChange={(e) => setItemType(e.target.value)}
                                        placeholder="e.g. T-Shirt, Hoodie"
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm focus:ring-2 focus:ring-lsl-blue/10 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Camera Angle</label>
                                    <input
                                        type="text"
                                        value={viewAngle}
                                        onChange={(e) => setViewAngle(e.target.value)}
                                        placeholder="e.g. Front, Flat Lay"
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm focus:ring-2 focus:ring-lsl-blue/10 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Colors</label>
                                    <input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="e.g. White, Black, Navy"
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm focus:ring-2 focus:ring-lsl-blue/10 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Logo Placement</label>
                                    <input
                                        type="text"
                                        value={logoPlacement}
                                        onChange={(e) => setLogoPlacement(e.target.value)}
                                        placeholder="e.g. Center Chest, Left Pocket"
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm focus:ring-2 focus:ring-lsl-blue/10 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Aspect Ratio</label>
                                <div className="flex flex-wrap gap-2">
                                    {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map((ratio) => (
                                        <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-4 py-2 text-[10px] font-bold rounded-full border transition-all ${aspectRatio === ratio ? 'bg-lsl-blue text-white border-lsl-blue' : 'bg-white text-gray-500 border-gray-200 hover:border-lsl-blue/40'}`}>
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
                    <div className="lg:col-span-7 h-full flex flex-col">
                        <div className={`relative flex-grow bg-white rounded-[3rem] p-4 flex flex-col items-center justify-center min-h-[600px] shadow-sm border border-gray-100 overflow-hidden transition-all duration-700 ${isGenerating ? 'blur-sm grayscale' : ''}`}>
                            {generatedMockup ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <motion.img initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} src={generatedMockup} alt="Generated Mockup" className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl shadow-blue-900/10" />
                                    <button onClick={() => setGeneratedMockup(null)} className="absolute top-6 right-6 bg-white/80 hover:bg-white backdrop-blur-md p-3 rounded-full text-lsl-black shadow-lg shadow-black/5 transition-all active:scale-95">
                                        <X size={20} />
                                    </button>
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

            {/* Email Collection Modal */}
            <AnimatePresence>
                {showEmailModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEmailModal(false)} className="absolute inset-0 bg-lsl-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
                            <button onClick={() => setShowEmailModal(false)} className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition-colors"><X size={20} /></button>

                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-blue-50 text-lsl-blue rounded-full flex items-center justify-center mx-auto">
                                    <Mail size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-display font-bold text-lsl-black mb-2">Almost there!</h2>
                                    <p className="text-gray-500 font-light text-sm">Where should we save your generated mockups?</p>
                                </div>

                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-lsl-blue/10 transition-all text-center"
                                        autoFocus
                                    />
                                    <button type="submit" className="w-full py-4 bg-lsl-blue text-white rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95">
                                        Start Generating
                                    </button>
                                    <p className="text-[10px] text-gray-400 font-medium px-4 leading-relaxed">By continuing, you'll receive your renders via email and be notified about special offers from Left Side Logos. No spam, ever.</p>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};