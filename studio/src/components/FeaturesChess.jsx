import { ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import BlurText from './BlurText'
import feature1 from '../assets/feature-1.gif'
import feature2 from '../assets/feature-2.gif'

const ROWS = [
  {
    badge: 'AI Lead Screening',
    title: 'Qualify every lead. Even at 2am.',
    body: 'Our AI doesn\'t just text back — it asks the right questions. Job type, urgency, timeline, budget. By the time you wake up, you know exactly who\'s worth calling. Every lead scored, zero effort.',
    button: 'Learn more',
    gif: feature1,
    reverse: false,
    accent: 'text-[#00d0d0]',
  },
  {
    badge: 'Google Reviews',
    title: 'Turn happy customers into 5-star reviews.',
    body: 'After every job, our automation follows up, requests a review, and responds to what comes in — all on autopilot. Watch your Google rating climb while you focus on the work.',
    button: 'See how it works',
    gif: feature2,
    reverse: true,
    accent: 'text-[#f97316]',
  },
]

export default function FeaturesChess() {
  return (
    <section className="py-24 px-8 lg:px-16">
      {/* Header */}
      <div className="text-center mb-20">
        <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-[#00d0d0] font-body inline-block mb-6">
          Capabilities
        </div>
        <BlurText
          text="Pro automation. Zero complexity."
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white justify-center"
          delay={120}
        />
      </div>

      <div className="flex flex-col gap-28 max-w-6xl mx-auto">
        {ROWS.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={`flex flex-col md:flex-row ${row.reverse ? 'md:flex-row-reverse' : ''} items-center gap-12 lg:gap-20`}
          >
            {/* Text side */}
            <div className="flex-1 flex flex-col gap-6">
              <span className={`text-xs font-semibold font-body tracking-widest uppercase ${row.accent}`}>
                {row.badge}
              </span>
              <h3 className="text-3xl md:text-4xl font-heading italic text-white leading-tight">
                {row.title}
              </h3>
              <p className="text-white/60 font-body font-light text-sm md:text-base leading-relaxed max-w-md">
                {row.body}
              </p>
              <button className="liquid-glass-strong rounded-full px-5 py-2.5 flex items-center gap-2 text-white font-body text-sm font-medium w-fit hover:scale-105 transition-transform">
                {row.button} <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* GIF side */}
            <div className="flex-1 w-full">
              <div className="liquid-glass rounded-2xl overflow-hidden">
                <img
                  src={row.gif}
                  alt=""
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
