import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, MessageSquare, PenTool, FileCheck, PackageCheck, Flame, Printer, Scissors, Layers, Box, Package } from 'lucide-react';

const services = [
  {
    icon: Flame,
    title: "Heat Transfer",
    desc: "Durable vinyl transfers pressed onto garments for bold, vibrant graphics that last wash after wash.",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: Printer,
    title: "Direct to Film",
    desc: "Full-color prints with incredible detail and durability. Perfect for complex designs and photographic artwork.",
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    icon: Scissors,
    title: "Embroidery",
    desc: "Classic thread stitching for a premium, textured finish. Ideal for polos, hats, and professional wear.",
    color: "from-lsl-blue to-blue-700",
    bgColor: "bg-blue-50",
    iconColor: "text-lsl-blue",
  },
  {
    icon: Layers,
    title: "Leather Patches",
    desc: "Laser-engraved genuine leather patches for an elevated, rugged aesthetic on hats and outerwear.",
    color: "from-amber-700 to-amber-900",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-700",
  },
  {
    icon: Box,
    title: "Acrylic Patches",
    desc: "Modern, dimensional patches with a sleek look. Combine materials and finishes for unique branding.",
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: Package,
    title: "Fulfillment",
    desc: "We handle packing and shipping directly to your team, customers, or event. Hands-off from order to doorstep.",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const timelineSteps = [
  {
    id: 1,
    title: "Build Order",
    desc: "Use our Design Studio to build your quote & get an AI Mockup instantly.",
    icon: <MousePointerClick className="w-6 h-6 text-white" />
  },
  {
    id: 2,
    title: "Onboarding",
    desc: "Connect with our design team to discuss your brand vision & needs.",
    icon: <MessageSquare className="w-6 h-6 text-white" />
  },
  {
    id: 3,
    title: "Design",
    desc: "We refine artwork and specifications. You approve every detail.",
    icon: <PenTool className="w-6 h-6 text-white" />
  },
  {
    id: 4,
    title: "Invoice",
    desc: "Finalize order quantities and process secure payment.",
    icon: <FileCheck className="w-6 h-6 text-white" />
  },
  {
    id: 5,
    title: "Production",
    desc: "Production begins. Average turnaround is 2-3 weeks.",
    icon: <PackageCheck className="w-6 h-6 text-white" />
  }
];

export const Services: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section id="services" className="py-24 bg-[#f4f4f5] relative overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-lsl-blue font-bold tracking-[0.2em] uppercase text-xs">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-lsl-black mt-3 mb-4">Our Capabilities</h2>
          <p className="text-gray-400 text-lg font-light max-w-xl mx-auto">Everything you need to bring your brand to life — all handled in-house.</p>
        </div>

        {/* Static Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto mb-32">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${service.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <service.icon className={`w-6 h-6 ${service.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* --- Process Timeline --- */}
        <div className="max-w-6xl mx-auto pt-12 pb-24 md:pb-32">
          <div className="text-center mb-16">
            <span className="text-lsl-blue font-bold tracking-[0.2em] uppercase text-xs">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-lsl-black mt-3">The Production Process</h2>
          </div>

          <div className="relative">
            {/* Horizontal Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 hidden md:block rounded-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative z-10">
              {timelineSteps.map((step) => (
                <div
                  key={step.id}
                  className="relative flex flex-col items-center group"
                  onMouseEnter={() => setActiveStep(step.id)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  {/* Dot / Icon Container */}
                  <motion.div
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-20 cursor-pointer
                                    ${activeStep === step.id
                        ? 'bg-lsl-blue border-lsl-blue shadow-lg scale-110'
                        : 'bg-lsl-black border-white shadow-md'
                      }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.icon}
                  </motion.div>

                  {/* Label */}
                  <div className="mt-4 text-center">
                    <h4 className={`font-bold text-lg transition-colors ${activeStep === step.id ? 'text-lsl-blue' : 'text-gray-800'}`}>
                      {step.title}
                    </h4>
                  </div>

                  {/* Pop-up Detail Card */}
                  <motion.div
                    className="absolute top-24 w-64 bg-white p-6 rounded-xl shadow-2xl border border-gray-100 z-30 pointer-events-none md:pointer-events-auto"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{
                      opacity: activeStep === step.id ? 1 : 0,
                      y: activeStep === step.id ? 0 : 10,
                      scale: activeStep === step.id ? 1 : 0.9
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Triangle Arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100"></div>

                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Step 0{step.id}</span>
                    <p className="text-sm text-gray-600 leading-relaxed font-light">
                      {step.desc}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};