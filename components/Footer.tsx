import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Mail, MapPin, Phone } from 'lucide-react';

const columnVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.42, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const Footer: React.FC = () => {
  return (
    <footer
      id="contact"
      className="relative isolate overflow-hidden bg-lsl-ink text-lsl-cream/80"
    >
      <StitchPattern />

      <div className="absolute right-[-20%] bottom-[-20%] -z-10 h-[600px] w-[600px] rounded-full bg-lsl-navy/30 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-12 md:px-10 md:pt-32">
        <div className="grid gap-14 md:grid-cols-12 md:gap-10">
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={columnVariants}
            className="md:col-span-5"
          >
            <div className="flex items-center gap-3">
              <img
                src="/LSL_Logo.png"
                alt=""
                className="h-10 w-auto object-contain brightness-0 invert"
              />
              <span className="font-display text-2xl font-semibold tracking-tight text-lsl-cream">
                Left Side Logos
              </span>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-lsl-cream/75">
              Premium embroidery, screen printing, and full-service custom merch — made in Missouri, delivered to your team.
            </p>

            <div className="mt-8 flex gap-3">
              <SocialLink
                href="https://facebook.com/leftsidelogos"
                label="Facebook"
              >
                <Facebook className="h-4 w-4" strokeWidth={1.75} />
              </SocialLink>
              <SocialLink
                href="mailto:leftsidelogos@gmail.com"
                label="Email Left Side Logos"
              >
                <Mail className="h-4 w-4" strokeWidth={1.75} />
              </SocialLink>
            </div>
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={columnVariants}
            className="md:col-span-3"
          >
            <h4 className="font-sans text-[11px] uppercase tracking-[0.22em] text-lsl-cream/60">
              Workshop
            </h4>
            <div className="mt-5 space-y-4 text-sm">
              <a
                href="https://maps.google.com/?q=29+West+Industrial+Dr,+O%27Fallon,+MO+63366"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-lsl-cream/80 transition-colors hover:text-lsl-cream"
              >
                <MapPin
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-lsl-thread"
                  strokeWidth={1.75}
                />
                <span className="leading-snug">
                  29 West Industrial Dr.
                  <br />
                  O&apos;Fallon, MO 63366
                </span>
              </a>
              <a
                href="tel:+13145835431"
                className="flex items-center gap-3 text-lsl-cream/80 transition-colors hover:text-lsl-cream"
              >
                <Phone
                  className="h-4 w-4 text-lsl-thread"
                  strokeWidth={1.75}
                />
                <span className="font-sans tabular-nums">314-583-5431</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            custom={2}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={columnVariants}
            className="md:col-span-4"
          >
            <h4 className="font-sans text-[11px] uppercase tracking-[0.22em] text-lsl-cream/60">
              Hours
            </h4>
            <ul className="mt-5 space-y-2 text-sm">
              <HoursRow day="Monday – Friday" hours="9:00 – 4:30" />
              <HoursRow day="Saturday" hours="Closed" muted />
              <HoursRow day="Sunday" hours="Closed" muted />
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-lsl-cream/10 pt-8 text-[11px] uppercase tracking-[0.22em] text-lsl-cream/50 md:flex-row"
        >
          <p>
            © {new Date().getFullYear()} Left Side Logos · Missouri Born &amp; Raised
          </p>
          <div className="flex gap-8">
            <a
              href="#"
              className="transition-colors hover:text-lsl-cream"
            >
              Privacy
            </a>
            <a
              href="#"
              className="transition-colors hover:text-lsl-cream"
            >
              Terms
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

function HoursRow({
  day,
  hours,
  muted = false,
}: {
  day: string;
  hours: string;
  muted?: boolean;
}) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-lsl-cream/10 pb-2">
      <span className="text-lsl-cream/75">{day}</span>
      <span
        className={
          muted
            ? 'font-sans text-xs text-lsl-cream/40'
            : 'font-sans text-xs tabular-nums text-lsl-cream'
        }
      >
        {hours}
      </span>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="grid h-10 w-10 place-items-center rounded-full border border-lsl-cream/15 bg-white/[0.03] text-lsl-cream/80 transition-all hover:-translate-y-0.5 hover:border-lsl-thread/60 hover:bg-lsl-thread/10 hover:text-lsl-thread"
    >
      {children}
    </a>
  );
}

// Diagonal stitch / weave SVG, very low opacity — adds tactile depth to the footer.
function StitchPattern() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 opacity-[0.05]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, #F7F4EE 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, #F7F4EE 0 1px, transparent 1px 14px)',
        backgroundSize: '28px 28px',
      }}
    />
  );
}
