import { motion } from 'motion/react'
import { ArrowUpRight, Play } from 'lucide-react'
import BlurText from './BlurText'

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4'

const VERTICALS = ['HVAC', 'Plumbing', 'Roofing', 'Junk Removal', 'Landscaping']

export default function Hero() {
  return (
    <section className="relative overflow-visible" style={{ height: '1000px' }}>
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero_bg.jpeg"
        className="absolute left-0 w-full h-auto object-contain z-0 pointer-events-none"
        style={{ top: '20%' }}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* Subtle dark veil */}
      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />

      {/* Bottom gradient fade into page */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: '350px',
          background: 'linear-gradient(to bottom, transparent, #000810)',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ paddingTop: '150px', height: '1000px' }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="liquid-glass rounded-full px-1 py-1 flex items-center gap-2 mb-8"
        >
          <span className="bg-[#008080] text-white rounded-full px-3 py-1 text-xs font-semibold font-body">
            Hampton Roads
          </span>
          <span className="text-white/80 text-sm font-body pr-2">
            AI-powered automation for local service businesses.
          </span>
        </motion.div>

        {/* Main heading */}
        <BlurText
          text="Stop Missing Leads. Start Closing Jobs."
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white justify-center max-w-3xl mb-6"
          delay={100}
          direction="bottom"
          style={{ lineHeight: '0.85', letterSpacing: '-0.04em' }}
        />

        {/* Subtext */}
        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-sm md:text-base text-white/70 font-body font-light leading-relaxed max-w-lg mb-10"
        >
          Every missed call is a job that goes to your competitor. Platypus Automations texts
          back in 45 seconds, qualifies the lead, and hands it to you — day or night.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          <a
            href="tel:+18664797462"
            className="cta-orange rounded-full px-6 py-3 flex items-center gap-2 text-white font-body text-sm font-semibold hover:scale-105 transition-transform"
          >
            Book a Free Call <ArrowUpRight className="w-4 h-4" />
          </a>
          <button className="flex items-center gap-2 text-white/70 font-body text-sm font-light hover:text-white transition-colors">
            <span className="flex items-center justify-center w-8 h-8 liquid-glass rounded-full mr-1">
              <Play className="w-3.5 h-3.5 fill-white text-white" />
            </span>
            See How It Works
          </button>
        </motion.div>

        {/* Verticals bar — pushed to bottom */}
        <div className="mt-auto pb-10 pt-12 flex flex-col items-center gap-4 w-full">
          <div className="liquid-glass rounded-full px-3.5 py-1.5 text-xs font-medium text-white/60 font-body">
            Built for local service businesses
          </div>
          <div className="flex items-center flex-wrap justify-center gap-8 md:gap-14">
            {VERTICALS.map((v) => (
              <span key={v} className="text-2xl md:text-3xl font-heading italic text-white/80">
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
