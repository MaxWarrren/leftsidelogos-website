
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Cal, { getCalApi } from "@calcom/embed-react";
import { PageHero } from './PageHero';

export const ContactPage: React.FC = () => {
    useEffect(() => {
        (async function () {
            const cal = await getCalApi({ "namespace": "test-live" });
            cal("ui", { "hideEventTypeDetails": false, "layout": "month_view" });
        })();
    }, []);

    return (
        <>
        <PageHero className="pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl w-full">
                {/* Header Section */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
                        <MessageSquare size={12} />
                        Get in Touch
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight">
                        Schedule a Call
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto font-light text-lg">
                        Book a time with our design team to discuss your project.
                    </p>
                </motion.header>
            </div>
        </PageHero>

        <div className="bg-[#f4f4f5] py-12">
            <div className="container mx-auto px-4 max-w-4xl w-full">

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 p-4"
                >
                    <Cal
                        namespace="test-live"
                        calLink="brad-gunn-q42thj/test-live"
                        style={{ width: "100%", height: "100%", minHeight: "600px", overflow: "scroll" }}
                        config={{ layout: 'month_view' }}
                    />
                </motion.div>
            </div>
        </div>
        </>
    );
};
