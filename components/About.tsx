import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mapping the local images stored in the public directory
// These match the functions: Hats, Koozies/Promo, Hoodies, Shirts, and Decals
const IMAGES = [
  "/AboutUs-1.jpg",
  "/AboutUs-2.jpg",
  "/AboutUs-3.jpg",
  "/AboutUs-4.jpg",
  "/AboutUs-5.jpg"
];

export const About: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-16">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2 relative h-[500px] w-full"
          >
            {/* Image Composition with Smooth Transitions */}
            <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500 bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIdx}
                  src={IMAGES[currentIdx]}
                  alt={`LSL Portfolio Piece ${currentIdx + 1}`}
                  initial={{ opacity: 0, filter: 'blur(10px)', scale: 1.1 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
                  transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to high-quality placeholder if local images aren't found
                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000`;
                  }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-lsl-black/40 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-display font-bold text-lg tracking-wider uppercase drop-shadow-lg">
                  Real Projects, Real Quality
                </p>
              </div>
            </div>
            {/* Background Frame decoration for 3D depth */}
            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-lsl-blue/20 rounded-2xl -z-0 hidden md:block"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2 space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-lsl-black leading-tight">
              Crafting <span className="text-lsl-blue">Professional</span> <br />
              Identity Since 2023
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed">
              At Left Side Logos, we specialize in high-quality custom apparel and promotional merchandise designed to bring your vision to life. From premium hats and T-shirts to custom yard signs and banners, we handle every step of the process in-house to ensure exceptional quality and professional results.
            </p>

            <p className="text-gray-600 text-lg leading-relaxed">
              We believe custom work should be personal and dependable. By reviewing every design with precision and confirming every detail before production begins, we deliver service you can trust. Whether you're outfitting a team or promoting your business, we’re dedicated to creating products you'll be proud to share.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Satisfied Customer" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500">
                Over <span className="text-lsl-black font-bold">10,000+ orders fulfilled</span>
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-8">
              <div>
                <span className="block text-2xl font-display font-bold text-lsl-blue">100%</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">In-House</span>
              </div>
              <div>
                <span className="block text-2xl font-display font-bold text-lsl-blue">Fast</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Turnaround</span>
              </div>
              <div>
                <span className="block text-2xl font-display font-bold text-lsl-blue">No Minimums</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">On Select Items</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};