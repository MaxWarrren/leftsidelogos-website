
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Cal, { getCalApi } from "@calcom/embed-react";

export const ContactPage: React.FC = () => {
    useEffect(() => {
        (async function () {
            const cal = await getCalApi({});
            cal("ui", { "styles": { "branding": { "brandColor": "#000000" } }, "hideEventTypeDetails": false, "layout": "month_view" });
        })();
    }, []);

    return (
        <div className="min-h-screen bg-[#fcfcfd] relative overflow-hidden flex flex-col items-center pt-32 pb-20">
            {/* Airy Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 max-w-4xl w-full">
                {/* Header Section */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-lsl-blue text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                        <MessageSquare size={12} />
                        Get in Touch
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-lsl-black tracking-tight">
                        Schedule a Call
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto font-sans font-light text-lg">
                        Book a time with our design team to discuss your project.
                    </p>
                </motion.header>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 p-4"
                >
                    <Cal
                        calLink="leftsidelogos/30min"
                        style={{ width: "100%", height: "100%", minHeight: "600px" }}
                        config={{ layout: 'month_view' }}
                    />
                </motion.div>
            </div>
        </div>
    );
};
