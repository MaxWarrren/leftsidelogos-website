import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, PhoneCall, CheckCircle2 } from "lucide-react";
import { Button } from "./button";
import { PageHero } from "../PageHero";

interface HeroProps {
  onStartDesigning: () => void;
}

function Hero({ onStartDesigning }: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Sports Team", "Small Business", "Greek Organization", "Local Event", "Corporation", "Club"],
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
    <PageHero fullHeight className="pt-32 pb-16 md:pt-40 md:pb-24 flex items-center justify-center" id="home">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center gap-2 max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold tracking-widest text-white uppercase mb-6"
          >
            <CheckCircle2 size={14} />
            <span>Premium Custom Branding</span>
          </motion.div>

          <div className="flex flex-col items-center w-full">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tighter leading-tight"
            >
              Custom Merchandise For Your
            </motion.h1>

            <div className="relative h-[60px] md:h-[90px] lg:h-[110px] w-full overflow-hidden flex items-center justify-center">
              <AnimatePresence initial={false}>
                <motion.span
                  key={titleNumber}
                  className="absolute text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tighter whitespace-nowrap leading-none flex items-center justify-center"
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
            className="text-base md:text-lg text-gray-300 max-w-2xl font-normal mt-6"
          >
            At Left Side Logos, we bring your logo to life with high-quality custom apparel.
            From embroidery to full-color decals, we handle everything in-house for exceptional results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto"
          >
            <a href="#contact" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-sm font-bold tracking-widest border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-lsl-black transition-all rounded-xl" variant="outline">
                <PhoneCall className="mr-2 w-4 h-4" /> SCHEDULE A DESIGN CALL
              </Button>
            </a>
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-sm font-bold tracking-widest bg-white text-lsl-black hover:bg-gray-100 shadow-xl hover:-translate-y-1 transition-all rounded-xl" onClick={onStartDesigning}>
              GET INSTANT MOCKUPS <MoveRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </PageHero>
  );
}

export { Hero };