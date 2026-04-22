import { ArrowUpRight, Phone } from 'lucide-react'
import HlsVideo from './HlsVideo'
import BlurText from './BlurText'

const HLS_URL =
  'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8'

export default function CtaFooter() {
  return (
    <section className="relative pt-36 pb-0">
      {/* HLS video background */}
      <HlsVideo
        src={HLS_URL}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#000810]/65 pointer-events-none" />

      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-[1]"
        style={{ height: '200px', background: 'linear-gradient(to bottom, #000810, transparent)' }}
      />

      {/* CTA content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 lg:px-16 pb-24">
        <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-[#00d0d0] font-body mb-8">
          Free Strategy Call
        </div>

        <BlurText
          text="Your first missed call was already answered."
          className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white justify-center leading-none max-w-3xl mb-6"
          delay={110}
        />

        <p className="text-white/60 font-body font-light text-sm md:text-base max-w-md mb-10 leading-relaxed">
          Book a free 20-minute call. We'll show you exactly what Platypus can do for your
          business — no fluff, no commitment, just real numbers.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <a
            href="tel:+18664797462"
            className="cta-orange rounded-full px-7 py-3.5 flex items-center gap-2 text-white font-body text-sm font-semibold hover:scale-105 transition-transform"
          >
            <Phone className="w-4 h-4" /> Book a Free Call
          </a>
          <button className="liquid-glass-strong rounded-full px-7 py-3.5 flex items-center gap-2 text-white font-body text-sm font-medium hover:scale-105 transition-transform">
            View Services <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Trust note */}
        <p className="mt-8 text-white/30 font-body font-light text-xs">
          +1 (866) 479-7462 · platypusautomations@gmail.com · Chesapeake, VA
        </p>
      </div>

      {/* Footer bar */}
      <div className="relative z-10 border-t border-white/10 px-8 lg:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/35 text-xs font-body">
          © 2026 Platypus Automations LLC. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {['Privacy', 'Terms', 'Contact'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-white/35 text-xs font-body hover:text-white/70 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
