import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, PhoneCall, CheckCircle2 } from "lucide-react";
import { Button } from "./button";

interface HeroProps {
  onStartDesigning: () => void;
}

function Hero({ onStartDesigning }: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["SPORTS TEAM", "SMALL BUSINESS", "GREEK ORGANIZATION", "LOCAL EVENT", "CORPORATION", "CLUB"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full bg-[#f4f4f5] min-h-[85vh] pt-32 pb-16 md:pt-40 md:pb-24 flex items-center justify-center relative overflow-hidden" id="home">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-lsl-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-lsl-black/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="flex flex-col items-center justify-center text-center gap-2 max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-sans font-bold tracking-widest text-lsl-blue uppercase mb-6"
          >
            <CheckCircle2 size={14} />
            <span>Premium Custom Branding</span>
          </motion.div>

          <div className="flex flex-col items-center w-full">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-lsl-black tracking-tighter leading-tight uppercase"
            >
              CUSTOM MERCHANDISE FOR YOUR
            </motion.h1>

            <div className="relative h-[60px] md:h-[90px] lg:h-[110px] w-full overflow-hidden flex items-center justify-center">
              <AnimatePresence initial={false}>
                <motion.span
                  key={titleNumber}
                  className="absolute text-4xl md:text-6xl lg:text-7xl font-display font-bold uppercase text-lsl-blue tracking-tighter whitespace-nowrap leading-none flex items-center justify-center"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    opacity: { duration: 0.2 }
                  }}
                >
                  {titles[titleNumber]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-lg text-gray-500 max-w-2xl font-sans font-normal mt-6"
          >
            At Left Side Logos, we BRING YOUR LOGO TO LIFE with high-quality custom apparel.
            From embroidery to full-color decals, we handle everything in-house for exceptional results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto"
          >
            <a href="#contact" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-sm font-display font-bold tracking-widest border-2 border-lsl-black bg-transparent text-lsl-black hover:bg-lsl-black hover:text-white transition-all rounded-xl" variant="outline">
                <PhoneCall className="mr-2 w-4 h-4" /> SCHEDULE A DESIGN CALL
              </Button>
            </a>
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-sm font-display font-bold tracking-widest bg-lsl-blue hover:bg-lsl-blue/90 text-white shadow-xl hover:-translate-y-1 transition-all rounded-xl" onClick={onStartDesigning}>
              GET INSTANT MOCKUPS <MoveRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export { Hero };