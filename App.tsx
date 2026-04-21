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

type Page = 'home' | 'mockup' | 'contact' | 'build-order' | 'catalog';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#f4f4f5] font-sans text-lsl-black selection:bg-lsl-blue selection:text-white flex flex-col">
        <Navbar
          currentPage={currentPage}
          setCurrentPage={navigateTo}
        />

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
            <MockupGenerator onSwitchToQuote={() => navigateTo('build-order')} />
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
            />
          )}
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;