
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Image as ImageIcon, Plus, Trash2, Send, Loader2, Upload, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { OrderItem } from '../types';

// Pricing Constants based on average of provided ranges
const PRICES: Record<string, number> = {
  'T-Shirt': 18,        // Range: $16-$20
  'Hoodie': 30,         // Range: $25-$35
  'Sweatshirt': 25,     // Range: $20-$30
  'Polo': 45,           // Range: $25-$65
  'Quarter Zip': 45,    // Range: $25-$70
  'Hat': 20,            // Range: $16-$25
  'Beanie': 20,         // Range: $16-$25
  'Blanket': 30,        // Estimate
  'Yard Sign': 20,      // Estimate
  'Banner': 50,         // Estimate
  'Decal': 15,          // Range: $5-$25
};

const SETUP_FEE_PRICE = 30; // Avg of $20-$40

export const DesignStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quote' | 'mockup'>('quote');

  // --- Quote State ---
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState({ type: 'T-Shirt', size: 'M', quantity: 1, color: 'Black' });
  const [includeSetupFee, setIncludeSetupFee] = useState(false);

  // --- Mockup State ---
  const [mockupPrompt, setMockupPrompt] = useState('');
  const [mockupImage, setMockupImage] = useState<File | null>(null);
  const [mockupPreview, setMockupPreview] = useState<string | null>(null);
  const [generatedMockup, setGeneratedMockup] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itemType, setItemType] = useState('T-Shirt');
  const [viewAngle, setViewAngle] = useState('Front View');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Quote Handlers ---
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

  // --- Mockup Handlers ---
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

  const generateMockup = async () => {
    if (!mockupImage) return;
    setIsGenerating(true);
    setGeneratedMockup(null);

    try {
        // Initialize Gemini with the current API key
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Convert image to base64 string without data prefix
        const base64Image = mockupPreview?.split(',')[1] || '';

        const prompt = `Generate a high-quality, photorealistic product mockup of a ${itemType}.
        View Angle: ${viewAngle}.
        Details: ${mockupPrompt}.
        Task: Apply the provided logo/design onto the ${itemType} naturally. 
        The logo should look like it is printed on the fabric, following the folds and lighting of the garment.
        Background: Neutral studio background.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt },
                    { 
                        inlineData: {
                            mimeType: mockupImage.type,
                            data: base64Image
                        }
                    }
                ]
            }
        });

        // Iterate through response parts to find the generated image
        let foundImage = false;
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64Str = part.inlineData.data;
                    // Fix: Use backticks for template literal to correctly interpolate the base64 string
                    setGeneratedMockup(`data:image/png;base64,${base64Str}`);
                    foundImage = true;
                    break;
                }
            }
        }
        
        if (!foundImage) {
            console.warn("No image found in response", response);
        }

    } catch (error) {
        console.error("Error generating mockup:", error);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen container mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-display font-bold text-lsl-black mb-4">Design Studio</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Build your order quote or visualize your brand on our products using AI.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-12">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
          <button
            onClick={() => setActiveTab('quote')}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === 'quote' 
                ? 'bg-lsl-black text-white shadow-md' 
                : 'text-gray-500 hover:text-lsl-black hover:bg-gray-50'
            }`}
          >
            <Calculator size={18} /> Price Estimator
          </button>
          <button
            onClick={() => setActiveTab('mockup')}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === 'mockup' 
                ? 'bg-lsl-blue text-white shadow-md' 
                : 'text-gray-500 hover:text-lsl-blue hover:bg-blue-50'
            }`}
          >
            <ImageIcon size={18} /> AI Mockup
          </button>
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'quote' ? (
          /* --- Quote Estimator UI --- */
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Form */}
            <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit">
              <h3 className="text-xl font-display font-bold mb-6">Add Items</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select 
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lsl-black/20 outline-none"
                  >
                    {Object.keys(PRICES).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <select 
                        value={newItem.size}
                        onChange={(e) => setNewItem({...newItem, size: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    >
                        {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'One Size'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <select 
                        value={newItem.color}
                        onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    >
                        {['Black', 'White', 'Navy', 'Grey', 'Red', 'Royal Blue', 'Forest Green'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input 
                        type="number" 
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    />
                </div>

                <button 
                    onClick={addItem}
                    className="w-full py-3 bg-lsl-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                    <Plus size={18} /> Add to Quote
                </button>
              </div>
            </div>

            {/* List */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col min-h-[500px]">
              <h3 className="text-xl font-display font-bold mb-6 flex justify-between items-center">
                <span>Current Estimate</span>
                <span className="text-sm font-sans font-normal text-gray-500">{items.length} items</span>
              </h3>

              <div className="flex-grow overflow-auto">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                        <Calculator size={48} className="mb-4" />
                        <p>No items added yet</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="p-3 rounded-l-lg">Item</th>
                                <th className="p-3">Details</th>
                                <th className="p-3 text-center">Qty</th>
                                <th className="p-3 text-right">Est. Price</th>
                                <th className="p-3 rounded-r-lg"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-medium">{item.type}</td>
                                    <td className="p-3 text-sm text-gray-500">{item.color}, {item.size}</td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-right">${(item.unitPrice * item.quantity).toFixed(2)}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
              </div>

              {/* Setup Fee Toggle */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="setupFee" 
                        checked={includeSetupFee}
                        onChange={(e) => setIncludeSetupFee(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-lsl-black focus:ring-lsl-blue"
                      />
                      <label htmlFor="setupFee" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Include New Logo Setup Fee ($20-$40)
                        <span className="block text-xs text-gray-400 font-normal">One-time fee for customizing or modifying new logos.</span>
                      </label>
                  </div>
                  <span className="font-bold text-gray-700">{includeSetupFee ? `$${SETUP_FEE_PRICE.toFixed(2)}` : '$0.00'}</span>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6 flex flex-col items-end gap-2">
                  <div className="text-right">
                      <p className="text-sm text-gray-500">Estimated Total</p>
                      <p className="text-4xl font-bold text-lsl-blue">${calculateTotal().toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-md text-xs">
                      <AlertCircle size={14} />
                      <span>Prices are approximate estimates. Final invoice may vary based on specific artwork requirements.</span>
                  </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- AI Mockup UI --- */
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Controls */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-display font-bold mb-4">1. Upload Logo</h3>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                            mockupPreview ? 'border-lsl-blue bg-blue-50/50' : 'border-gray-300 hover:border-lsl-blue hover:bg-gray-50'
                        }`}
                    >
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            className="hidden" 
                        />
                        {mockupPreview ? (
                            <div className="relative h-40 w-full flex items-center justify-center">
                                <img src={mockupPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg text-white font-medium">
                                    Change Image
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <Upload size={32} className="mb-2" />
                                <p>Click to upload logo (PNG/JPG)</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-display font-bold mb-4">2. Configure Mockup</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                            <select 
                                value={itemType}
                                onChange={(e) => setItemType(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            >
                                <option>T-Shirt</option>
                                <option>Hoodie</option>
                                <option>Sweatshirt</option>
                                <option>Polo</option>
                                <option>Quarter Zip</option>
                                <option>Hat</option>
                                <option>Beanie</option>
                                <option>Tote Bag</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">View / Angle</label>
                            <select 
                                value={viewAngle}
                                onChange={(e) => setViewAngle(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            >
                                <option>Front View</option>
                                <option>Back View</option>
                                <option>Flat Lay</option>
                                <option>Model Wearing</option>
                                <option>Close Up Detail</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                        <textarea
                            value={mockupPrompt}
                            onChange={(e) => setMockupPrompt(e.target.value)}
                            placeholder="E.g., Black fabric, logo on left chest, vintage lighting..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none h-24 resize-none"
                        />
                    </div>
                </div>

                <button
                    onClick={generateMockup}
                    disabled={!mockupImage || isGenerating}
                    className="w-full py-4 bg-gradient-to-r from-lsl-black to-gray-800 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin" /> Rendering...
                        </>
                    ) : (
                        <>
                            <Send size={20} /> Generate Mockup
                        </>
                    )}
                </button>
            </div>

            {/* Output */}
            <div className="bg-gray-900 rounded-2xl p-4 flex items-center justify-center min-h-[500px] relative overflow-hidden">
                {generatedMockup ? (
                    <img src={generatedMockup} alt="Generated Mockup" className="max-w-full max-h-full rounded-lg shadow-2xl" />
                ) : (
                    <div className="text-center text-gray-600">
                        {isGenerating ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <div className="w-16 h-16 bg-gray-800 rounded-full mb-4"></div>
                                <p>Nano Banana is working...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <ImageIcon size={48} className="mb-4 opacity-50" />
                                <p>Generated mockup will appear here</p>
                            </div>
                        )}
                    </div>
                )}
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
                    Powered by Gemini
                </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
