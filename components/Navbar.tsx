import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, LogOut, Building2 } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { isAuthenticated, profile, organization, openAuthModal, signOut, isLoading } = useAuth();

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}
      >
        <div
          className={`flex items-center justify-between px-8 md:px-12 lg:px-16 py-3 transition-all duration-300 ${scrolled
            ? 'bg-lsl-black/70 backdrop-blur-md shadow-lg border-b border-white/5'
            : ''
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
              className="h-10 w-auto object-contain brightness-200 contrast-125 transition-all duration-300"
            />
            <span className="font-display font-bold text-xl tracking-tighter text-white">
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
                className={`text-sm font-medium transition-colors hover:text-white ${currentPage === item.page && item.page !== 'home' ? 'text-white font-bold' : 'text-gray-400'}`}
              >
                {item.name}
              </a>
            ))}

            {/* Cart Icon */}
            <button
              onClick={() => { setCurrentPage('build-order'); window.scrollTo(0, 0); }}
              className="relative p-2 rounded-full transition-all hover:bg-white/10 text-gray-400 hover:text-white"
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
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-white text-lsl-black text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all bg-white/10 hover:bg-white/20 text-white"
                  id="navbar-user-btn"
                >
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate">
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name}</p>
                        <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
                        {organization && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Building2 className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 truncate">{organization.name}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setCurrentPage('portal');
                          window.scrollTo(0, 0);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Portal
                      </button>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border border-white/30 text-white hover:bg-white hover:text-lsl-black"
                id="navbar-login-btn"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile: Cart + Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => { setCurrentPage('build-order'); window.scrollTo(0, 0); }}
              className="relative p-2 text-white"
              aria-label="View Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-white text-lsl-black text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-white"
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
              className="text-2xl font-display font-bold tracking-wide hover:text-gray-300 transition-colors"
            >
              {item.name}
            </a>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => { setMobileMenuOpen(false); signOut(); }}
              className="text-lg font-display font-bold tracking-wide text-red-400 hover:text-red-300 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
              className="text-lg font-display font-bold tracking-wide text-gray-400 hover:text-white transition-colors"
            >
              Log In / Sign Up
            </button>
          )}
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8">
            <X size={32} />
          </button>
        </motion.div>
      )}
    </>
  );
};