import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: 'home' | 'mockup' | 'contact';
  setCurrentPage: (page: 'home' | 'mockup' | 'contact') => void;
}

const navItems = [
  { name: 'Home', href: '#home', page: 'home' },
  { name: 'About', href: '#about', page: 'home' },
  { name: 'Mockup Studio', href: '#', page: 'mockup' },
  { name: 'Contact', href: '#', page: 'contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 50);
  });

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (item.page === 'home') {
      if (currentPage !== 'home') {
        setCurrentPage('home');
        setTimeout(() => {
          const element = document.querySelector(item.href);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
          else window.scrollTo(0, 0);
        }, 100);
      } else {
        const element = document.querySelector(item.href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo(0, 0);
      }
    } else {
      setCurrentPage(item.page as any);
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: -100 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 transition-all duration-300 ${scrolled ? 'py-2' : 'py-6'}`}
      >
        <div
          className={`relative flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-md transition-all duration-300 ${scrolled
            ? 'bg-lsl-black/80 text-white shadow-lg w-full max-w-4xl border border-white/10'
            : 'bg-white/50 text-lsl-black w-full max-w-5xl border border-white/40'
            }`}
        >
          {/* Logo Image */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, { name: 'Home', href: '#home', page: 'home' })}
            className="flex items-center gap-3 group"
          >
            <img
              src="/LSL_Logo.png"
              alt="Left Side Logos"
              className={`h-10 w-auto object-contain transition-all duration-300 ${scrolled ? 'brightness-200 contrast-125' : ''}`}
            />
            <span className={`font-display font-bold text-xl tracking-tighter ${scrolled ? 'text-white' : 'text-lsl-black'}`}>
              Left Side Logos
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`text-sm font-medium transition-colors hover:text-lsl-blue ${currentPage === item.page && item.page !== 'home' ? 'text-lsl-blue font-bold' : ''
                  } ${scrolled ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-40 bg-lsl-black/95 text-white flex flex-col items-center justify-center space-y-8 md:hidden"
        >
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className="text-2xl font-display font-bold tracking-wide hover:text-lsl-blue transition-colors"
            >
              {item.name}
            </a>
          ))}
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8">
            <X size={32} />
          </button>
        </motion.div>
      )}
    </>
  );
};