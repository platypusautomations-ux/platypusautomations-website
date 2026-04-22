import { motion } from 'motion/react'
import { ArrowUpRight, MessageSquare } from 'lucide-react'
import BlurText from './BlurText'

export default function Testimonials() {
  return (
    <section className="py-24 px-8 lg:px-16">
      <div className="text-center mb-14">
        <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-[#00d0d0] font-body inline-block mb-6">
          Early Access
        </div>
        <BlurText
          text="Be the first in your trade."
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white justify-center"
          delay={120}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-3xl mx-auto"
      >
        <div className="liquid-glass rounded-2xl p-10 md:p-14 text-center flex flex-col items-center gap-6">
          <div className="liquid-glass-strong rounded-full w-14 h-14 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-[#008080]" />
          </div>
          <p className="text-white/70 font-body font-light text-base md:text-lg italic leading-relaxed max-w-xl">
            "We're actively onboarding our first clients in Hampton Roads. If you're a local service
            business and you want to be among the first — this is your window."
          </p>
          <div>
            <p className="text-white font-body font-medium text-sm">Tim</p>
            <p className="text-white/45 font-body font-light text-xs mt-0.5">
              Founder, Platypus Automations LLC — Chesapeake, VA
            </p>
          </div>
          <a
            href="tel:+18664797462"
            className="cta-orange rounded-full px-6 py-3 flex items-center gap-2 text-white font-body text-sm font-semibold hover:scale-105 transition-transform mt-2"
          >
            Claim Your Spot <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </section>
  )
}
