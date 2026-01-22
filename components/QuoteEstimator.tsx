import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Plus, Trash2, AlertCircle, Sparkles, ArrowRight, Mail, CheckCircle, ShieldCheck, Calendar } from 'lucide-react';
import { OrderItem } from '../types';

const PRICES: Record<string, number> = {
  'T-Shirt': 18,
  'Hoodie': 30,
  'Sweatshirt': 25,
  'Polo': 45,
  'Quarter Zip': 45,
  'Hat': 20,
  'Beanie': 20,
  'Blanket': 30,
  'Yard Sign': 20,
  'Banner': 50,
  'Decal': 15,
};

const SETUP_FEE_PRICE = 30;

interface QuoteEstimatorProps {
  onSwitchToMockup: () => void;
}

type Step = 'email' | 'disclaimer' | 'builder';

export const QuoteEstimator: React.FC<QuoteEstimatorProps> = ({ onSwitchToMockup }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(localStorage.getItem('lsl_user_email') || '');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState({ type: 'T-Shirt', size: 'M', quantity: 1, color: 'Black' });
  const [includeSetupFee, setIncludeSetupFee] = useState(false);

  const addItem = () => {
    const unitPrice = PRICES[newItem.type];
    const item: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newItem,
      unitPrice
    };
    setItems([...items, item]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    return itemsTotal + (includeSetupFee ? SETUP_FEE_PRICE : 0);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      localStorage.setItem('lsl_user_email', email);
      setStep('disclaimer');
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-[#fcfcfd] relative overflow-hidden">
      {/* Airy Background Decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-12 space-y-4">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-lsl-black tracking-tight">Build Your Order</h1>
          <p className="text-gray-400 max-w-xl mx-auto font-sans font-light text-lg">
            A professional, step-by-step experience to formalize your project and get a precision quote.
          </p>
          <button
            onClick={onSwitchToMockup}
            className="text-xs font-bold text-gray-400 hover:text-lsl-blue transition-colors flex items-center justify-center gap-2 mx-auto pt-2 group"
          >
            <Sparkles size={14} className="group-hover:scale-110 transition-transform" />
            Want to see it first? <span className="underline decoration-blue-200 underline-offset-4">Try Mockup Studio</span>
          </button>
        </header>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 text-center space-y-8"
              >
                <div className="w-20 h-20 bg-blue-50 text-lsl-blue rounded-full flex items-center justify-center mx-auto">
                  <Mail size={36} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold text-lsl-black">Get Started</h2>
                  <p className="text-gray-400 font-light">Enter your email to save your progress and receive your final quote.</p>
                </div>
                <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto space-y-4">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-5 bg-gray-50 border-none rounded-2xl outline-none text-lg text-center font-medium focus:ring-2 focus:ring-lsl-blue/10 transition-all"
                  />
                  <button type="submit" className="w-full py-5 bg-lsl-black text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-[0.98]">
                    Continue to Builder
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'disclaimer' && (
              <motion.div
                key="disclaimer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 space-y-8"
              >
                <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
                  <div className="w-16 h-16 bg-blue-50 text-lsl-blue rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-lsl-black">The LSL Quality Standard</h2>
                    <p className="text-sm text-gray-400 font-light uppercase tracking-widest">Our Commitment to Your Vision</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 py-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="text-lsl-blue shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-bold text-lsl-black">Precision Review</p>
                        <p className="text-sm text-gray-400 font-light">Every design is personally reviewed for stitch density, color accuracy, and alignment.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <CheckCircle className="text-lsl-blue shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-bold text-lsl-black">Dependable Timeline</p>
                        <p className="text-sm text-gray-400 font-light">We value your time. Production timelines are locked in once details are approved.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="text-lsl-blue shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-bold text-lsl-black">In-House Production</p>
                        <p className="text-sm text-gray-400 font-light">We handle every piece in our Missouri facility. No outsourcing, no compromises.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <CheckCircle className="text-lsl-blue shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-bold text-lsl-black">Transparent Pricing</p>
                        <p className="text-sm text-gray-400 font-light">No hidden fees. Your estimate includes setup options and volume scaling.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                  <p className="text-sm text-gray-600 font-light leading-relaxed italic">
                    "We treat each piece as if it's our own. Before production begins, we confirm all details with you to ensure the final product is exactly what you envisioned."
                  </p>
                </div>

                <button
                  onClick={() => setStep('builder')}
                  className="w-full py-5 bg-lsl-blue text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  I Understand, Start Building <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 'builder' && (
              <motion.div
                key="builder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-12 gap-8"
              >
                <div className="md:col-span-4 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Add Product</h3>
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Product Type</label>
                        <select
                          value={newItem.type}
                          onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                          className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm focus:ring-2 focus:ring-lsl-blue/10 transition-all"
                        >
                          {Object.keys(PRICES).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Size</label>
                          <select
                            value={newItem.size}
                            onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm focus:ring-2 focus:ring-lsl-blue/10 transition-all"
                          >
                            {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'One Size'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Color</label>
                          <select
                            value={newItem.color}
                            onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm focus:ring-2 focus:ring-lsl-blue/10 transition-all"
                          >
                            {['Black', 'White', 'Navy', 'Grey', 'Red', 'Royal'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                          className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 text-sm focus:ring-2 focus:ring-lsl-blue/10 transition-all"
                        />
                      </div>
                      <button
                        onClick={addItem}
                        className="w-full py-4 bg-lsl-black text-white rounded-2xl font-bold hover:shadow-lg transition-colors flex items-center justify-center gap-2 mt-2"
                      >
                        <Plus size={18} /> Add to Order
                      </button>
                    </div>
                  </div>

                  <div className="bg-lsl-black p-8 rounded-[2.5rem] shadow-xl text-white">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">LSL Direct Support</h3>
                    <p className="text-sm font-light text-gray-400 mb-6 leading-relaxed">Need custom help with your artwork or a specific project?</p>
                    <a href="#contact" className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-bold text-xs transition-all border border-white/10">
                      <Calendar size={14} /> SCHEDULE CALENDAR LINK
                    </a>
                  </div>
                </div>

                <div className="md:col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col min-h-[600px]">
                  <h3 className="text-xl font-display font-bold mb-8 flex justify-between items-center text-lsl-black">
                    <span>Order Summary</span>
                    <span className="text-xs font-sans font-bold uppercase tracking-widest text-gray-300">{items.length} Products</span>
                  </h3>

                  <div className="flex-grow overflow-auto">
                    {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-200 py-20">
                        <Calculator size={64} className="mb-6 opacity-50" />
                        <p className="font-medium text-lg">Your order is empty</p>
                        <p className="text-sm">Add items on the left to begin your quote.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#fcfcfd] text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                          <tr>
                            <th className="p-4 rounded-l-2xl">Item</th>
                            <th className="p-4">Spec</th>
                            <th className="p-4 text-center">Qty</th>
                            <th className="p-4 text-right">Subtotal</th>
                            <th className="p-4 rounded-r-2xl"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {items.map((item) => (
                            <tr key={item.id} className="group hover:bg-[#fcfcfd] transition-colors">
                              <td className="p-4 font-bold text-lsl-black">{item.type}</td>
                              <td className="p-4 text-xs text-gray-400 font-medium uppercase tracking-wider">{item.color} / {item.size}</td>
                              <td className="p-4 text-center font-medium text-lsl-black">{item.quantity}</td>
                              <td className="p-4 text-right font-bold text-lsl-black">${(item.unitPrice * item.quantity).toFixed(2)}</td>
                              <td className="p-4 text-right">
                                <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="mt-8 p-6 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        id="setupFee"
                        checked={includeSetupFee}
                        onChange={(e) => setIncludeSetupFee(e.target.checked)}
                        className="w-6 h-6 rounded-lg border-gray-200 text-lsl-blue focus:ring-lsl-blue/10"
                      />
                      <div className="select-none cursor-pointer" onClick={() => setIncludeSetupFee(!includeSetupFee)}>
                        <p className="text-sm font-bold text-lsl-black">Include Digitizing / Setup Fee</p>
                        <p className="text-xs text-gray-400 font-light">One-time flat fee ($30.00) for design preparation.</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-400 text-lg">{includeSetupFee ? `$${SETUP_FEE_PRICE.toFixed(2)}` : '$0.00'}</span>
                  </div>

                  <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-yellow-600 bg-yellow-50 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider border border-yellow-100 max-w-sm">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>Estimate excludes sales tax. Final pricing may vary based on design complexity.</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Estimated Total</p>
                      <p className="text-6xl font-display font-bold text-lsl-blue leading-none">${calculateTotal().toFixed(2)}</p>
                    </div>
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