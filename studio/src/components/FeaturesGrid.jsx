import { Zap, MessageSquare, Star, Shield } from 'lucide-react'
import { motion } from 'motion/react'
import BlurText from './BlurText'

const FEATURES = [
  {
    icon: Zap,
    title: '45-Second Response',
    body: 'Faster than any competitor can answer. The first business to respond wins the job — now that\'s always you.',
    color: 'text-[#f97316]',
    bg: 'bg-[#f97316]/10',
  },
  {
    icon: MessageSquare,
    title: 'Sounds Like You',
    body: 'The AI is trained to match your tone and your trade. Every message feels personal because it is.',
    color: 'text-[#00d0d0]',
    bg: 'bg-[#008080]/10',
  },
  {
    icon: Star,
    title: '5-Star Review Engine',
    body: 'Automated review requests, responses, and social posts. Your reputation grows while you sleep.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    icon: Shield,
    title: 'No Tech Required',
    body: 'We set everything up. You approve a demo, we go live. No logins, no dashboards, no headaches.',
    color: 'text-white/70',
    bg: 'bg-white/5',
  },
]

export default function FeaturesGrid() {
  return (
    <section className="py-24 px-8 lg:px-16">
      <div className="text-center mb-14">
        <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-[#00d0d0] font-body inline-block mb-6">
          Why Platypus
        </div>
        <BlurText
          text="The difference is everything."
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white justify-center"
          delay={120}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {FEATURES.map(({ icon: Icon, title, body, color, bg }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
            className="liquid-glass rounded-2xl p-6 flex flex-col gap-5 hover:scale-[1.02] transition-transform"
          >
            <div
              className={`liquid-glass-strong rounded-full w-11 h-11 flex items-center justify-center ${bg}`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <h3 className="font-body font-semibold text-white text-base leading-snug">{title}</h3>
            <p className="text-white/55 font-body font-light text-sm leading-relaxed">{body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
