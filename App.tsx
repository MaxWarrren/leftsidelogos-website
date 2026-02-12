import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/ui/animated-hero';
import { Services } from './components/Services';
import { About } from './components/About';
import { Footer } from './components/Footer';

import { MockupGenerator } from './components/MockupGenerator';
import { ContactPage } from './components/ContactPage';
import { BuildOrderPage } from './components/BuildOrderPage';
import { BottomCTA } from './components/BottomCTA';

type Page = 'home' | 'mockup' | 'contact' | 'build-order';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
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
          <BuildOrderPage />
        )}
        {currentPage === 'contact' && (
          <ContactPage />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;