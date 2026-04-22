import { ArrowUpRight } from 'lucide-react'
import HlsVideo from './HlsVideo'
import BlurText from './BlurText'

const HLS_URL =
  'https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8'

const STEPS = [
  {
    num: '01',
    title: 'You miss a call',
    body: 'A potential customer calls after hours, during a job, or when you can\'t pick up.',
  },
  {
    num: '02',
    title: 'AI texts back in 45 sec',
    body: 'Our system fires a personalized text to the lead — before they call the next guy on Google.',
  },
  {
    num: '03',
    title: 'Lead gets qualified',
    body: 'The AI has a real two-way conversation: job type, urgency, location — all captured automatically.',
  },
  {
    num: '04',
    title: 'You get the handoff',
    body: 'You\'re notified with a complete summary. Just show up and close.',
  },
]

export default function StartSection() {
  return (
    <section className="relative" style={{ minHeight: '700px' }}>
      {/* HLS video background */}
      <HlsVideo
        src={HLS_URL}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#000810]/60 pointer-events-none" />

      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-[1]"
        style={{ height: '200px', background: 'linear-gradient(to bottom, #000810, transparent)' }}
      />
      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
        style={{ height: '200px', background: 'linear-gradient(to top, #000810, transparent)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 lg:px-16 py-36">
        <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-[#00d0d0] font-body mb-6">
          How It Works
        </div>

        <BlurText
          text="Miss a call. Land the job."
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight justify-center text-white mb-4"
          delay={150}
        />

        <p className="text-white/60 font-body font-light text-sm md:text-base max-w-md mb-16 leading-relaxed">
          From missed call to qualified lead — fully automated. While you're on the job,
          Platypus is working the phones.
        </p>

        {/* Process steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full mb-12">
          {STEPS.map(({ num, title, body }) => (
            <div key={num} className="liquid-glass rounded-2xl p-6 text-left flex flex-col gap-3">
              <span className="text-[#008080] font-body font-semibold text-xs tracking-widest">
                {num}
              </span>
              <h3 className="text-white font-body font-semibold text-base leading-tight">{title}</h3>
              <p className="text-white/55 font-body font-light text-xs leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <a
          href="tel:+18664797462"
          className="cta-orange rounded-full px-6 py-3 flex items-center gap-2 text-white font-body text-sm font-semibold hover:scale-105 transition-transform"
        >
          Start Your Free Trial <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  )
}
