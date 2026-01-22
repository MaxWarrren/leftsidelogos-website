import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, MessageSquare, PenTool, FileCheck, PackageCheck } from 'lucide-react';

// --- 3D Icons ---

const IconHeat = () => (
  <div className="relative w-16 h-16 md:w-20 md:h-20" style={{ perspective: '500px' }}>
    <div className="absolute inset-0 bg-orange-500 rounded-xl shadow-lg transform translate-z-0 opacity-20"></div>
    <div className="absolute inset-2 bg-gradient-to-tr from-red-500 to-orange-400 rounded-lg shadow-xl" style={{ transform: 'translateZ(20px)' }}>
      <div className="w-8 h-10 bg-white/20 blur-sm rounded-full absolute top-2 right-2"></div>
    </div>
    <div className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-[10px] md:text-xs shadow-md border border-white/20" style={{ transform: 'translateZ(40px) rotate(12deg)' }}>
      HEAT
    </div>
  </div>
);

const IconDTF = () => (
  <div className="relative w-16 h-16 md:w-20 md:h-20" style={{ perspective: '500px' }}>
    <div className="absolute inset-0 bg-gray-800 rounded-md flex flex-col justify-between py-1 px-2 shadow-xl transform rotate-[-5deg]">
      <div className="flex justify-between gap-1">
        {[...Array(4)].map((_, i) => <div key={i} className="w-2 h-1.5 md:w-3 md:h-2 bg-white rounded-sm"></div>)}
      </div>
      <div className="flex justify-between gap-1">
        {[...Array(4)].map((_, i) => <div key={i} className="w-2 h-1.5 md:w-3 md:h-2 bg-white rounded-sm"></div>)}
      </div>
    </div>
    <div className="absolute inset-3 md:inset-4 bg-white shadow-lg flex items-center justify-center overflow-hidden border border-gray-200" style={{ transform: 'translateZ(30px) rotate(5deg)' }}>
      <div className="grid grid-cols-2 grid-rows-2 w-full h-full opacity-80">
        <div className="bg-cyan-400"></div>
        <div className="bg-magenta-400"></div>
        <div className="bg-yellow-400"></div>
        <div className="bg-black"></div>
      </div>
    </div>
  </div>
);

const IconEmbroidery = () => (
  <div className="relative w-16 h-16 md:w-20 md:h-20" style={{ perspective: '500px' }}>
    <div className="absolute inset-0 rounded-full border-4 border-lsl-blue shadow-xl bg-white/50"></div>
    <div className="absolute inset-2 rounded-full border-2 border-dashed border-lsl-grey flex items-center justify-center overflow-hidden">
      <div className="absolute w-full h-0.5 bg-lsl-blue rotate-45"></div>
      <div className="absolute w-full h-0.5 bg-lsl-blue -rotate-45"></div>
      <div className="absolute w-full h-0.5 bg-lsl-blue rotate-90"></div>
      <div className="absolute w-full h-0.5 bg-lsl-blue"></div>
    </div>
    <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-lsl-black rounded-full shadow-lg border-2 border-white flex items-center justify-center" style={{ transform: 'translateZ(50px)' }}>
      <div className="w-1 h-3 md:h-4 bg-gray-400 rounded-full"></div>
    </div>
  </div>
);

const IconLeather = () => (
  <div className="relative w-16 h-16 md:w-20 md:h-20" style={{ perspective: '500px' }}>
    <div className="absolute inset-1 bg-[#8B4513] rounded-xl shadow-2xl flex items-center justify-center border-2 border-[#5D2E0C]">
      <div className="absolute inset-1 border-2 border-dashed border-[#D2B48C] rounded-lg opacity-70"></div>
      <div className="text-[#D2B48C] font-display font-bold text-lg md:text-xl tracking-tighter opacity-90" style={{ transform: 'translateZ(10px)' }}>LSL</div>
    </div>
  </div>
);

const IconAcrylic = () => (
  <div className="relative w-16 h-16 md:w-20 md:h-20" style={{ perspective: '500px' }}>
    <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg shadow-xl opacity-90 transform rotate-45 border border-white/40"></div>
    <div className="absolute inset-2 bg-gradient-to-br from-white/40 to-transparent rounded-lg transform rotate-45 backdrop-blur-sm border-t border-l border-white/60" style={{ transform: 'translateZ(20px)' }}></div>
    <div className="absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow-md" style={{ transform: 'translateZ(40px)' }}>
      3D
    </div>
  </div>
);

const IconBox = () => (
  <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center" style={{ perspective: '500px' }}>
    <div className="relative w-10 h-10 md:w-12 md:h-12" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg) rotateY(30deg)' }}>
      <div className="absolute inset-0 bg-lsl-blue border border-white/20" style={{ transform: 'translateZ(24px)' }}></div>
      <div className="absolute inset-0 bg-lsl-black border border-white/20" style={{ transform: 'translateZ(-24px) rotateY(180deg)' }}></div>
      <div className="absolute inset-0 bg-blue-700 w-10 h-10 md:w-12 md:h-12 border border-white/20" style={{ transform: 'translateX(-24px) rotateY(-90deg)' }}></div>
      <div className="absolute inset-0 bg-blue-600 w-10 h-10 md:w-12 md:h-12 border border-white/20" style={{ transform: 'translateX(24px) rotateY(90deg)' }}></div>
      <div className="absolute inset-0 bg-blue-400 w-10 h-10 md:w-12 md:h-12 border border-white/20" style={{ transform: 'translateY(-24px) rotateX(90deg)' }}></div>
      <div className="absolute inset-0 bg-blue-900 w-10 h-10 md:w-12 md:h-12 shadow-xl" style={{ transform: 'translateY(24px) rotateX(-90deg)' }}></div>
    </div>
  </div>
);

const services = [
  { icon: <IconHeat />, title: "Heat Transfer", desc: "Bold designs" },
  { icon: <IconDTF />, title: "Direct to Film", desc: "Full-color durability" },
  { icon: <IconEmbroidery />, title: "Embroidery", desc: "Classic stitching" },
  { icon: <IconLeather />, title: "Leather Patches", desc: "Premium branding" },
  { icon: <IconAcrylic />, title: "Acrylic Patches", desc: "Modern looks" },
  { icon: <IconBox />, title: "Fulfillment", desc: "We pack & ship" }
];

const timelineSteps = [
  {
    id: 1,
    title: "Build Order",
    desc: "Use our Design Studio to build your quote & get an AI Mockup instantly.",
    icon: <MousePointerClick className="w-6 h-6 text-white" />
  },
  {
    id: 2,
    title: "Onboarding",
    desc: "Connect with our design team to discuss your brand vision & needs.",
    icon: <MessageSquare className="w-6 h-6 text-white" />
  },
  {
    id: 3,
    title: "Design",
    desc: "We refine artwork and specifications. You approve every detail.",
    icon: <PenTool className="w-6 h-6 text-white" />
  },
  {
    id: 4,
    title: "Invoice",
    desc: "Finalize order quantities and process secure payment.",
    icon: <FileCheck className="w-6 h-6 text-white" />
  },
  {
    id: 5,
    title: "Production",
    desc: "Production begins. Average turnaround is 2-3 weeks.",
    icon: <PackageCheck className="w-6 h-6 text-white" />
  }
];

export const Services: React.FC = () => {
  // Rotator Logic
  const [rotation, setRotation] = useState(0);
  const cardCount = services.length;
  const radius = 280;
  const anglePerCard = 360 / cardCount;

  // Timeline State
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Auto-rotate effect
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setRotation(prev => prev - 0.2); // Smooth slow rotation
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleCardClick = (index: number) => {
    // Snap to card on click
    const target = -(index * anglePerCard);
    setRotation(target);
  };

  return (
    <section id="services" className="py-24 bg-[#f4f4f5] relative overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-lsl-black mb-4">Our Capabilities</h2>
          <p className="text-gray-500 text-lg font-sans font-light">Interact with our service offerings below.</p>
        </div>

        {/* Rotator Container */}
        <div
          className="flex justify-center items-center h-[400px] md:h-[500px] w-full relative z-20 mb-32"
          style={{ perspective: '1200px' }}
        >
          <motion.div
            className="relative w-[180px] h-[240px] md:w-[220px] md:h-[280px]"
            style={{
              transformStyle: 'preserve-3d',
              rotateY: rotation
            }}
          >
            {services.map((service, index) => {
              const angle = index * anglePerCard;
              return (
                <div
                  key={index}
                  onClick={() => handleCardClick(index)}
                  className="absolute inset-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white transition-colors"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'visible',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="transform scale-90 md:scale-100" style={{ transform: 'translateZ(20px)' }}>
                    {service.icon}
                  </div>
                  <div className="text-center" style={{ transform: 'translateZ(10px)' }}>
                    <h3 className="text-lg md:text-xl font-display font-bold text-gray-800">{service.title}</h3>
                    <p className="text-xs text-gray-400 font-sans font-medium uppercase tracking-wider">{service.desc}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
          {/* Floor Shadow */}
          <div className="absolute bottom-10 w-[300px] h-[40px] bg-black/10 blur-3xl rounded-[100%] pointer-events-none transform translate-y-32 rotate-x-90"></div>
        </div>


        {/* --- Process Timeline --- */}
        <div className="max-w-6xl mx-auto pt-12 pb-24 md:pb-32">
          <div className="text-center mb-16">
            <span className="text-lsl-blue font-sans font-bold tracking-[0.2em] uppercase text-sm">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-lsl-black mt-2">The Production Process</h2>
          </div>

          <div className="relative">
            {/* Horizontal Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 hidden md:block rounded-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative z-10">
              {timelineSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="relative flex flex-col items-center group"
                  onMouseEnter={() => setActiveStep(step.id)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  {/* Dot / Icon Container */}
                  <motion.div
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-20 cursor-pointer
                                    ${activeStep === step.id
                        ? 'bg-lsl-blue border-lsl-blue shadow-lg scale-110'
                        : 'bg-lsl-black border-white shadow-md'
                      }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.icon}
                  </motion.div>

                  {/* Label */}
                  <div className="mt-4 text-center">
                    <h4 className={`font-display font-bold text-lg transition-colors ${activeStep === step.id ? 'text-lsl-blue' : 'text-gray-800'}`}>
                      {step.title}
                    </h4>
                  </div>

                  {/* Pop-up Detail Card */}
                  <motion.div
                    className="absolute top-24 w-64 bg-white p-6 rounded-xl shadow-2xl border border-gray-100 z-30 pointer-events-none md:pointer-events-auto"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{
                      opacity: activeStep === step.id ? 1 : 0,
                      y: activeStep === step.id ? 0 : 10,
                      scale: activeStep === step.id ? 1 : 0.9
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Triangle Arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100"></div>

                    <span className="text-xs font-sans font-bold text-gray-400 uppercase tracking-wider mb-2 block">Step 0{step.id}</span>
                    <p className="text-sm text-gray-600 leading-relaxed font-sans font-light">
                      {step.desc}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};