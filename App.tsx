import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Reviews } from './components/Reviews';
import { TrustedBy } from './components/TrustedBy';
import { CatalogMarquee } from './components/CatalogMarquee';
import { Services } from './components/Services';
import { AreasServed } from './components/AreasServed';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';

import { MockupStudio } from './components/MockupStudio';
import { ContactPage } from './components/ContactPage';
import { BuildOrderPage } from './components/BuildOrderPage';
import { CatalogPage } from './components/CatalogPage';
import { BottomCTA } from './components/BottomCTA';
import { CartProvider } from './components/CartContext';
import { CartDrawerProvider } from './components/CartDrawer';
import { AuthProvider } from './components/AuthContext';
import { CustomerPortal } from './components/portal/CustomerPortal';
import { AuthModal } from './components/AuthModal';
import { MotionProvider } from './components/ui/motion-provider';
import { Toaster } from './components/ui/toaster';
import { usePageMeta, type PageName } from './lib/pageMeta';
import type { CatalogProduct } from './types';

type Page = PageName;

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductForMockup, setSelectedProductForMockup] = useState<CatalogProduct | null>(null);

  usePageMeta(currentPage);

  const navigateTo = (page: Page) => {
    if (page !== 'mockup') {
      setSelectedProductForMockup(null);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToMockupWithProduct = (product: CatalogProduct) => {
    setSelectedProductForMockup(product);
    setCurrentPage('mockup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionProvider>
      <AuthProvider>
        <CartProvider>
          <CartDrawerProvider onCheckout={() => navigateTo('build-order')}>
          <div className="min-h-screen bg-lsl-cream font-sans text-lsl-ink selection:bg-lsl-navy selection:text-lsl-cream flex flex-col">
          <Navbar
            currentPage={currentPage}
            setCurrentPage={navigateTo}
          />
          <AuthModal />

          <main className="flex-grow">
            {currentPage === 'home' && (
              <>
                <Hero
                  onShopCatalog={() => navigateTo('catalog')}
                  onStartProject={() => navigateTo('build-order')}
                />
                <Reviews />
                <TrustedBy />
                <CatalogMarquee onNavigateToCatalog={() => navigateTo('catalog')} />
                <Services />
                <AreasServed />
                <Faq />
                <BottomCTA
                onStartDesigning={() => navigateTo('build-order')}
                onBrowseCatalog={() => navigateTo('catalog')}
              />
              </>
            )}

            {currentPage === 'mockup' && (
              <MockupStudio
                onSwitchToQuote={() => navigateTo('catalog')}
                product={selectedProductForMockup}
                onNavigateToBuildOrder={() => navigateTo('build-order')}
              />
            )}
            {currentPage === 'build-order' && (
              <BuildOrderPage
                onNavigateToMockup={() => navigateTo('mockup')}
                onNavigateToContact={() => navigateTo('contact')}
                onNavigateToCatalog={() => navigateTo('catalog')}
              />
            )}
            {currentPage === 'contact' && (
              <ContactPage />
            )}
            {currentPage === 'catalog' && (
              <CatalogPage
                onNavigateToCart={() => navigateTo('build-order')}
                onNavigateToMockupWithProduct={navigateToMockupWithProduct}
              />
            )}
            {currentPage === 'portal' && (
              <CustomerPortal />
            )}
          </main>
            {currentPage !== 'portal' && <Footer />}
          </div>
          </CartDrawerProvider>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </MotionProvider>
  );
}

export default App;