import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';

interface NavbarProps {
  currentPage: 'home' | 'mockup' | 'contact' | 'build-order' | 'catalog';
  setCurrentPage: (page: 'home' | 'mockup' | 'contact' | 'build-order' | 'catalog') => void;
}

const navItems = [
  { name: 'Catalog', href: '#', page: 'catalog' },
  { name: 'Mockup Studio', href: '#', page: 'mockup' },
  { name: 'Build Order', href: '#', page: 'build-order' },
  { name: 'Contact', href: '#', page: 'contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

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

            {/* Cart Icon */}
            <button
              onClick={() => { setCurrentPage('build-order'); window.scrollTo(0, 0); }}
              className={`relative p-2 rounded-full transition-all hover:bg-white/10 ${scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-lsl-blue'}`}
              aria-label="View Cart"
              id="navbar-cart-btn"
            >
              <ShoppingBag size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-lsl-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Mobile: Cart + Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => { setCurrentPage('build-order'); window.scrollTo(0, 0); }}
              className="relative p-2"
              aria-label="View Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-lsl-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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