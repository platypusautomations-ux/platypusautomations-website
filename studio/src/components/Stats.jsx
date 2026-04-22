import HlsVideo from './HlsVideo'
import BlurText from './BlurText'

const HLS_URL =
  'https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8'

const STATS = [
  { value: '45s', label: 'Average response time' },
  { value: '24/7', label: 'Lead coverage' },
  { value: '3×', label: 'More leads captured' },
  { value: '5 days', label: 'Time to go live' },
]

export default function Stats() {
  return (
    <section className="relative py-36">
      {/* Desaturated video background */}
      <HlsVideo
        src={HLS_URL}
        className="absolute inset-0 w-full h-full object-cover"
        desaturate
      />
      <div className="absolute inset-0 bg-[#000810]/55 pointer-events-none" />

      {/* Gradient fades */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-[1]"
        style={{ height: '200px', background: 'linear-gradient(to bottom, #000810, transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
        style={{ height: '200px', background: 'linear-gradient(to top, #000810, transparent)' }}
      />

      <div className="relative z-10 px-8 lg:px-16 max-w-5xl mx-auto">
        {/* Section header above card */}
        <div className="text-center mb-12">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-[#00d0d0] font-body inline-block mb-6">
            By the Numbers
          </div>
          <BlurText
            text="Results that speak for themselves."
            className="text-4xl md:text-5xl font-heading italic text-white justify-center"
            delay={130}
          />
        </div>

        <div className="liquid-glass rounded-3xl p-12 md:p-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-2">
                <span className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white">
                  {value}
                </span>
                <span className="text-white/55 font-body font-light text-sm leading-snug">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
