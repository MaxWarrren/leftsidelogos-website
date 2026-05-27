import React, { useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion';
import { Building2, LogOut, Menu, ShoppingBag, User, X } from 'lucide-react';

import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useCartDrawer } from './CartDrawer';
import { cn } from '../lib/utils';

type Page = 'home' | 'mockup' | 'contact' | 'build-order' | 'catalog' | 'portal';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems: { name: string; page: Page }[] = [
  { name: 'Catalog', page: 'catalog' },
  { name: 'Mockup Studio', page: 'mockup' },
  { name: 'Build Order', page: 'build-order' },
  { name: 'Contact', page: 'contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
}) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { isAuthenticated, profile, organization, openAuthModal, signOut } =
    useAuth();
  const { openDrawer } = useCartDrawer();

  // Transparent over the dark hero; cream surface elsewhere or when scrolled.
  const overHero = currentPage === 'home' && !scrolled;

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 200) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 24);
  });

  const goHome = () => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const goTo = (page: Page) => {
    setMobileMenuOpen(false);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        variants={{ visible: { y: 0 }, hidden: { y: '-110%' } }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            'transition-colors duration-300 ease-out',
            overHero
              ? 'bg-transparent'
              : 'border-b border-lsl-stone/70 bg-lsl-cream/85 backdrop-blur-md',
          )}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-[72px] md:px-10">
            <button
              type="button"
              onClick={goHome}
              className="group flex items-center gap-3"
              aria-label="Left Side Logos — home"
            >
              <img
                src="/LSL_Logo.png"
                alt=""
                className={cn(
                  'h-9 w-auto object-contain transition-all duration-300',
                  overHero
                    ? 'brightness-0 invert'
                    : 'brightness-0',
                )}
              />
              <span
                className={cn(
                  'hidden font-display text-lg font-semibold tracking-tight sm:inline',
                  overHero ? 'text-lsl-cream' : 'text-lsl-ink',
                )}
              >
                Left Side Logos
              </span>
            </button>

            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const active = currentPage === item.page;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => goTo(item.page)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative px-3 py-2 text-sm font-medium transition-colors duration-200',
                      overHero
                        ? active
                          ? 'text-lsl-cream'
                          : 'text-lsl-cream/70 hover:text-lsl-cream'
                        : active
                          ? 'text-lsl-ink'
                          : 'text-lsl-graphite hover:text-lsl-ink',
                    )}
                  >
                    {item.name}
                    {active && (
                      <motion.span
                        layoutId="nav-active-underline"
                        className={cn(
                          'absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full',
                          overHero ? 'bg-lsl-cream' : 'bg-lsl-navy',
                        )}
                        transition={{
                          type: 'spring',
                          stiffness: 320,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}

              <div className="mx-3 h-6 w-px bg-current opacity-15" />

              <CartButton
                count={cartCount}
                onClick={openDrawer}
                overHero={overHero}
              />

              {isAuthenticated ? (
                <UserMenu
                  open={userMenuOpen}
                  setOpen={setUserMenuOpen}
                  overHero={overHero}
                  profile={profile}
                  organization={organization}
                  onPortal={() => goTo('portal')}
                  onSignOut={signOut}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal()}
                  className={cn(
                    'ml-2 h-9 rounded-full px-4 text-sm font-semibold transition-all',
                    overHero
                      ? 'border border-lsl-cream/40 text-lsl-cream hover:bg-lsl-cream hover:text-lsl-ink'
                      : 'border border-lsl-ink/15 text-lsl-ink hover:border-lsl-ink hover:bg-lsl-ink hover:text-lsl-cream',
                  )}
                >
                  Log in
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 md:hidden">
              <CartButton
                count={cartCount}
                onClick={openDrawer}
                overHero={overHero}
              />
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                className={cn(
                  'grid h-10 w-10 place-items-center rounded-md transition-colors',
                  overHero
                    ? 'text-lsl-cream hover:bg-white/10'
                    : 'text-lsl-ink hover:bg-lsl-stone/60',
                )}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col bg-lsl-ink/95 px-6 pt-24 text-lsl-cream backdrop-blur-sm md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.06 + i * 0.04,
                    duration: 0.28,
                    ease: 'easeOut',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => goTo(item.page)}
                    aria-current={currentPage === item.page ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center justify-between border-b border-lsl-cream/10 py-5 text-left font-display text-3xl font-semibold transition-colors',
                      currentPage === item.page
                        ? 'text-lsl-cream'
                        : 'text-lsl-cream/70 hover:text-lsl-cream',
                    )}
                  >
                    {item.name}
                    {currentPage === item.page && (
                      <span className="text-xs font-sans font-semibold text-lsl-thread">
                        Now
                      </span>
                    )}
                  </button>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto pb-12">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-lsl-cream/70 hover:text-lsl-cream"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full rounded-full border border-lsl-cream/40 py-4 text-base font-semibold text-lsl-cream hover:bg-lsl-cream hover:text-lsl-ink"
                >
                  Log in / Sign up
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function CartButton({
  count,
  onClick,
  overHero,
}: {
  count: number;
  onClick: () => void;
  overHero: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
      className={cn(
        'relative grid h-10 w-10 place-items-center rounded-md transition-colors',
        overHero
          ? 'text-lsl-cream hover:bg-white/10'
          : 'text-lsl-ink hover:bg-lsl-stone/60',
      )}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className={cn(
              'absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full px-1 font-sans text-[10px] font-semibold tabular-nums',
              overHero
                ? 'bg-lsl-cream text-lsl-ink'
                : 'bg-lsl-navy text-lsl-cream',
            )}
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function UserMenu({
  open,
  setOpen,
  overHero,
  profile,
  organization,
  onPortal,
  onSignOut,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  overHero: boolean;
  profile: any;
  organization: any;
  onPortal: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
          overHero
            ? 'bg-white/10 text-lsl-cream hover:bg-white/15'
            : 'bg-lsl-stone/50 text-lsl-ink hover:bg-lsl-stone',
        )}
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-lsl-navy text-lsl-cream">
          <User className="h-3.5 w-3.5" />
        </span>
        <span className="max-w-[100px] truncate text-xs font-semibold">
          {profile?.full_name?.split(' ')[0] ?? 'Account'}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-lsl-stone bg-white shadow-lsl-lift"
            onMouseLeave={() => setOpen(false)}
          >
            <div className="border-b border-lsl-stone px-4 py-3">
              <p className="truncate text-sm font-semibold text-lsl-ink">
                {profile?.full_name}
              </p>
              <p className="truncate text-xs text-lsl-graphite">
                {profile?.email}
              </p>
              {organization && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-lsl-graphite">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{organization.name}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onPortal();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-lsl-ink transition-colors hover:bg-lsl-cream"
            >
              <User className="h-4 w-4" /> My Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
