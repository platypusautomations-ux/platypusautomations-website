import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

/**
 * BlurText — animates text word-by-word with a gaussian blur dissolve.
 * Uses IntersectionObserver to trigger on scroll into view.
 * Each word transitions: blur(10px) → blur(5px) → blur(0px) with opacity + y stagger.
 */
export default function BlurText({
  text,
  className = '',
  delay = 100,
  direction = 'bottom',
}) {
  const words = text.split(' ')
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const yStart = direction === 'bottom' ? 50 : -50
  const yMid   = direction === 'bottom' ? -5  : 5

  return (
    <div ref={ref} className={`flex flex-wrap gap-x-[0.35em] gap-y-1 ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: 'blur(10px)', opacity: 0, y: yStart }}
          animate={
            inView
              ? {
                  filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
                  opacity: [0, 0.5, 1],
                  y: [yStart, yMid, 0],
                }
              : {}
          }
          transition={{
            delay: i * (delay / 1000),
            duration: 0.7,
            ease: 'easeOut',
            times: [0, 0.5, 1],
          }}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}
