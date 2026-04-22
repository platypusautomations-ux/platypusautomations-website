import { useEffect, useRef } from 'react'

/**
 * HlsVideo — video player with HLS.js fallback for Mux streams.
 * Uses native HLS on Safari; hls.js on Chrome/Firefox.
 */
export default function HlsVideo({ src, className, style, desaturate = false }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    let hls = null

    const setup = async () => {
      // Safari native HLS
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src
        video.play().catch(() => {})
        return
      }

      // Chrome / Firefox via hls.js
      const { default: Hls } = await import('hls.js')
      if (!Hls.isSupported()) return

      hls = new Hls({ enableWorker: true })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
      })
    }

    setup()
    return () => { hls?.destroy() }
  }, [src])

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className={className}
      style={{
        ...style,
        ...(desaturate && { filter: 'saturate(0)' }),
      }}
    />
  )
}
