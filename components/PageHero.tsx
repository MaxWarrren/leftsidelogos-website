import React from 'react';

interface PageHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

/**
 * Shared hero background wrapper with the dark workshop photo.
 * Use fullHeight={true} only on the homepage hero.
 */
export const PageHero: React.FC<PageHeroProps> = ({ children, className = '', fullHeight = false, ...rest }) => {
  return (
    <div className={`w-full relative overflow-hidden ${fullHeight ? 'min-h-screen' : ''} ${className}`} {...rest}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-lsl-black/80 via-lsl-black/70 to-lsl-black/90" />
      </div>

      {/* Dot pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
