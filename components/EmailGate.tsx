import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, X } from 'lucide-react';

interface EmailGateProps {
  onSubmit: (email: string) => void;
  onCancel: () => void;
}

export const EmailGate: React.FC<EmailGateProps> = ({ onSubmit, onCancel }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      onSubmit(email);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-lsl-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-lsl-black transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-lsl-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-lsl-blue w-8 h-8" />
          </div>
          <h2 className="text-3xl font-display font-bold text-lsl-black mb-2">Unlock Studio Tools</h2>
          <p className="text-gray-500 mb-8">
            Enter your email to access the Price Estimator and AI Mockup Generator.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lsl-blue/20 outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-lsl-black text-white rounded-xl font-bold text-lg hover:bg-lsl-blue transition-all flex items-center justify-center gap-2"
            >
              Continue to Tools <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-widest font-bold">
            Left Side Logos • Missouri, USA
          </p>
        </div>
      </motion.div>
    </div>
  );
};
