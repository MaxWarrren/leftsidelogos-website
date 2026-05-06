import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/ui/animated-hero';
import { Services } from './components/Services';
import { About } from './components/About';
import { Footer } from './components/Footer';

import { MockupGenerator } from './components/MockupGenerator';
import { ContactPage } from './components/ContactPage';
import { BuildOrderPage } from './components/BuildOrderPage';
import { CatalogPage } from './components/CatalogPage';
import { BottomCTA } from './components/BottomCTA';
import { CartProvider } from './components/CartContext';
import { AuthProvider } from './components/AuthContext';
import { CustomerPortal } from './components/portal/CustomerPortal';
import { AuthModal } from './components/AuthModal';
import type { CatalogProduct } from './types';

type Page = 'home' | 'mockup' | 'contact' | 'build-order' | 'catalog' | 'portal';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductForMockup, setSelectedProductForMockup] = useState<CatalogProduct | null>(null);

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
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#f4f4f5] font-sans text-lsl-black selection:bg-lsl-blue selection:text-white flex flex-col">
          <Navbar
            currentPage={currentPage}
            setCurrentPage={navigateTo}
          />
          <AuthModal />

          <main className="flex-grow">
            {currentPage === 'home' && (
              <>
                <Hero onStartDesigning={() => navigateTo('build-order')} />
                <About />
                <Services />
                <BottomCTA onStartDesigning={() => navigateTo('build-order')} />
              </>
            )}

            {currentPage === 'mockup' && (
              <MockupGenerator
                onSwitchToQuote={() => navigateTo('build-order')}
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
      </CartProvider>
    </AuthProvider>
  );
}

export default App;