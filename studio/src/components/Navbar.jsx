import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import logoIcon from '../assets/logo-icon.png'

const NAV_LINKS = ['Home', 'Services', 'Results', 'Process', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <img src={logoIcon} alt="Platypus Automations" className="h-10 w-10 object-contain" />
          <span
            className="hidden sm:block font-body font-semibold text-sm tracking-wide text-white/90 group-hover:text-white transition-colors"
          >
            Platypus Automations
          </span>
        </a>

        {/* Center pill nav — desktop */}
        <div className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1 gap-0.5">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="px-3 py-2 text-sm font-medium text-white/80 font-body hover:text-white transition-colors rounded-full"
            >
              {link}
            </a>
          ))}
          <a
            href="tel:+18664797462"
            className="flex items-center gap-1.5 bg-[#f97316] text-white rounded-full px-3.5 py-1.5 text-sm font-semibold font-body hover:bg-orange-400 transition-colors ml-1"
          >
            Book a Call <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden liquid-glass rounded-full p-2.5 text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#000810]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              onClick={() => setMobileOpen(false)}
              className="text-3xl font-heading italic text-white hover:text-[#008080] transition-colors"
            >
              {link}
            </a>
          ))}
          <a
            href="tel:+18664797462"
            className="mt-4 flex items-center gap-2 cta-orange text-white rounded-full px-8 py-4 text-lg font-semibold font-body"
          >
            Book a Call <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>
      )}
    </>
  )
}
