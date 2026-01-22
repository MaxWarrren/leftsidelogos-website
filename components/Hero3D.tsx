import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Hero3DProps {
  onStartDesigning: () => void;
}

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

export const Hero3D: React.FC<Hero3DProps> = ({ onStartDesigning }) => {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, 150]);

  // Rotator Logic
  const [rotation, setRotation] = useState(0);
  const cardCount = services.length;
  // Radius for 3D placement
  const radius = 280;
  const anglePerCard = 360 / cardCount;

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
    <section id="home" className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#f4f4f5] pt-24 pb-12">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-lsl-blue rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-lsl-black rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 z-10 grid lg:grid-cols-2 gap-8 items-center h-full">

        {/* Left Side: Text Content */}
        <motion.div
          style={{ y: yText }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8 text-center lg:text-left flex flex-col justify-center order-2 lg:order-1"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center justify-center lg:justify-start gap-3"
          >
            <span className="h-[2px] w-8 bg-lsl-blue hidden lg:block"></span>
            <span className="text-lsl-blue font-bold text-sm md:text-base tracking-[0.2em] uppercase">
              Premium Custom Branding
            </span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl xl:text-9xl font-display font-bold text-lsl-black leading-[0.9] tracking-tighter">
            WEAR <br />
            YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lsl-blue via-lsl-blue to-black">
              IDENTITY.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
            Elevate your team's presence with high-fidelity apparel. From corporate swag to streetwear lines, we engineer quality into every stitch.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-6">
            <button
              onClick={onStartDesigning}
              className="px-10 py-5 bg-lsl-black text-white rounded-none border-2 border-lsl-black font-display font-bold text-lg tracking-wide hover:bg-transparent hover:text-lsl-black transition-all duration-300 shadow-xl"
            >
              START YOUR ORDER
            </button>
            <a
              href="#services"
              className="px-10 py-5 bg-transparent text-lsl-black border-2 border-lsl-black rounded-none font-display font-bold text-lg tracking-wide hover:bg-lsl-black hover:text-white transition-all duration-300 flex items-center justify-center"
            >
              OUR PROCESS
            </a>
          </div>
        </motion.div>

        {/* Right Side: 3D Service Rotator */}
        <div
          className="order-1 lg:order-2 flex justify-center items-center h-[500px] w-full relative z-20"
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
                    <p className="text-xs text-gray-500 font-medium">{service.desc}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
          {/* Floor Shadow */}
          <div className="absolute bottom-10 w-[300px] h-[40px] bg-black/20 blur-3xl rounded-[100%] pointer-events-none transform translate-y-32 rotate-x-90"></div>
        </div>

      </div>
    </section>
  );
};