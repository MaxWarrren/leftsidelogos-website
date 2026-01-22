
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Shirt, Send, Loader2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SloganGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateIdeas = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setIdeas([]);

    try {
      // Initialize Gemini with the required model and configuration
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const systemPrompt = `You are a creative merchandise branding expert for "Left Side Logos". 
      The user will provide a business type, event, or concept. 
      You must generate 3 short, punchy, and creative slogans or merchandise concepts suitable for t-shirt printing.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          // Use responseSchema for robust structured output
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
            setIdeas(parsed);
        }
      }
    } catch (error) {
      console.error("Error generating slogans:", error);
      setIdeas(["Creative spark temporarily unavailable. Try again!", "Your Brand, Your Way", "Wear the Future"]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="ai-studio" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-lsl-blue/5 rounded-bl-full"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
             <Sparkles className="text-lsl-blue w-6 h-6" />
             <span className="text-lsl-blue font-bold tracking-wider uppercase text-sm">AI Design Studio</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-lsl-black mb-4">
            Need Inspiration?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Not sure what to put on your next batch of company hoodies? Describe your vibe, and our AI Design Consultant will generate catchy concepts in seconds.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-gray-50 rounded-2xl p-2 shadow-inner border border-gray-200">
           <div className="relative flex items-center">
             <div className="absolute left-4 text-gray-400">
               <Shirt size={24} />
             </div>
             <input
               type="text"
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="E.g., A coffee shop for developers, 5k charity run, retro gaming club..."
               className="w-full pl-14 pr-32 py-4 bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lsl-blue/20 shadow-sm text-lg"
               onKeyDown={(e) => e.key === 'Enter' && generateIdeas()}
             />
             <button
               onClick={generateIdeas}
               disabled={loading || !prompt.trim()}
               className="absolute right-2 top-2 bottom-2 bg-lsl-black text-white px-6 rounded-lg font-bold hover:bg-lsl-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" size={20} /> : <span className="flex items-center gap-2">Generate <Send size={16}/></span>}
             </button>
           </div>
        </div>

        {/* Results Grid */}
        <div className="max-w-4xl mx-auto mt-12">
            <AnimatePresence>
                {ideas.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid md:grid-cols-3 gap-6"
                  >
                    {ideas.map((idea, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-lsl-blue transition-all duration-300 flex flex-col items-center text-center justify-center min-h-[200px]"
                      >
                         <h3 className="font-display text-2xl font-bold text-gray-800 mb-2 leading-tight">"{idea}"</h3>
                         <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">Concept {idx + 1}</p>
                         
                         <button 
                            onClick={() => copyToClipboard(idea, idx)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-lsl-blue transition-colors opacity-0 group-hover:opacity-100"
                         >
                            {copiedIndex === idx ? <Check size={18} /> : <Copy size={18} />}
                         </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
