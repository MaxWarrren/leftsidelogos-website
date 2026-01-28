import React from 'react';
import { Facebook, Mail, Phone, MapPin, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-[#0c0c0d] text-gray-500 py-24 border-t border-white/5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-3 gap-16 mb-20">

          {/* Logo & Intro */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 font-display font-bold text-2xl tracking-tighter text-white">
              <img
                src="/LSL_Logo.png"
                alt="Left Side Logos"
                className="h-10 w-auto object-contain brightness-200 contrast-125"
              />
              <span>Left Side Logos</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm font-light">
              We bring brands to life through premium embroidery and silk-screen printing. Quality Missouri craftsmanship, delivered with dependable precision since 2023.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-lsl-blue hover:text-white transition-all border border-white/5">
                <Facebook size={20} />
              </a>
              <a href="mailto:leftsidelogos@gmail.com" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-lsl-blue hover:text-white transition-all border border-white/5">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-8">
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-6">HQ Location</h4>
              <div className="flex items-start gap-4">
                <MapPin size={18} className="mt-1 text-lsl-blue opacity-50" />
                <span className="text-sm">29 West Industrial Dr.<br />O’fallon, MO 63366</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-6">Direct Line</h4>
              <div className="flex items-center gap-4">
                <Phone size={18} className="text-lsl-blue opacity-50" />
                <span className="text-sm">314-583-5431</span>
              </div>
            </div>
          </div>

          {/* Service Hours */}
          <div className="space-y-8">
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-6">Service Hours</h4>
            <ul className="space-y-3 text-sm font-light">
              <li className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Monday - Friday</span>
                <span className="text-white font-medium">9:00 - 4:30</span>
              </li>
              <li className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Saturday</span>
                <span className="text-gray-600">Closed</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Sunday</span>
                <span className="text-gray-600">Closed</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-bold uppercase tracking-[0.2em]">
          <p className="text-gray-700">&copy; {new Date().getFullYear()} Left Side Logos. Missouri Born & Raised.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};