
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowRight, X } from 'lucide-react';
import { OrderBuilder } from './OrderBuilder';

export const BuildOrderPage: React.FC = () => {
    const [isOrderOpen, setIsOrderOpen] = useState(true);

    return (
        <div className={`min-h-screen bg-[#fcfcfd] relative overflow-hidden flex flex-col items-center pt-32 pb-20 transition-all duration-700 ${isOrderOpen ? 'justify-start' : 'justify-center'}`}>
            {/* Airy Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 max-w-4xl w-full">
                {/* Header Section */}
                <motion.header
                    layout
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-12 space-y-4"
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-lsl-blue text-[10px] font-bold uppercase tracking-widest border border-blue-100"
                    >
                        <MessageSquare size={12} />
                        Let's Get Started
                    </motion.div>
                    <motion.h1
                        layout="position"
                        className="text-5xl md:text-6xl font-display font-bold text-lsl-black tracking-tight"
                    >
                        Tell us what you need.
                    </motion.h1>
                    <motion.p
                        layout="position"
                        className="text-gray-400 max-w-xl mx-auto font-sans font-light text-lg"
                    >
                        We've streamlined our process. Launch our guided order builder below to get your project moving.
                    </motion.p>
                </motion.header>

                <div className="w-full flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        {!isOrderOpen ? (
                            <motion.div
                                key="button"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                                className="text-center"
                            >
                                <button
                                    onClick={() => setIsOrderOpen(true)}
                                    className="group relative inline-flex items-center gap-3 px-10 py-5 bg-lsl-black text-white rounded-[2rem] font-bold text-xl tracking-wide hover:shadow-2xl hover:scale-105 transition-all duration-300"
                                >
                                    <span>Start Custom Order</span>
                                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <ArrowRight size={18} />
                                    </div>
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 50, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 50, scale: 0.98 }}
                                transition={{
                                    duration: 0.6,
                                    ease: [0.22, 1, 0.36, 1],
                                    opacity: { duration: 0.4 }
                                }}
                                className="w-full relative"
                            >
                                {/* Form Container */}
                                <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden relative">
                                    {/* Inline Header/Close */}
                                    <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-lsl-black text-white rounded-full flex items-center justify-center font-bold text-[8px]">
                                                LSL
                                            </div>
                                            <span className="font-display font-bold text-sm text-lsl-black">Order Builder</span>
                                        </div>
                                        <button
                                            onClick={() => setIsOrderOpen(false)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="p-2">
                                        <OrderBuilder className="!min-h-0 !pt-8 !pb-20 !bg-transparent" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
