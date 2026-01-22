import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface BottomCTAProps {
  onStartDesigning: () => void;
}

export const BottomCTA: React.FC<BottomCTAProps> = ({ onStartDesigning }) => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-100 rounded-full blur-[80px] transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-7xl font-display font-bold text-lsl-black mb-6 leading-tight">
            Ready to Wear <br/> Your Brand?
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Stop imagining and start creating. Use our AI-powered design studio to build your custom order and visualize your logo on premium apparel in seconds.
          </p>
          
          <button
            onClick={onStartDesigning}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-lsl-blue text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-lsl-black hover:scale-105 transition-all duration-300"
          >
            <span>Launch Design Studio</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};