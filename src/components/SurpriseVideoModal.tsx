import { useEffect, useRef, useState } from 'react'

/** Plays only after the player clicks the surprise bar, so browser autoplay rules are respected. */
export default function SurpriseVideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const [missing, setMissing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const video = videoRef.current
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current() }
    window.addEventListener('keydown', key)
    return () => { window.removeEventListener('keydown', key); video?.pause() } // no audio after closing
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-navy/80 p-4" role="dialog" aria-modal="true" aria-label="Surprise video">
      <div className="card w-full max-w-2xl p-3">
        <div className="mb-2 flex justify-end"><button onClick={onClose} className="btn btn-red py-1 text-base" aria-label="Close video">✕ Close</button></div>
        {missing ? (
          <p className="p-8 text-center text-lg">The surprise video hasn't been added yet. Check back soon!</p>
        ) : (
          

<video
  ref={videoRef}
  src={src}
  controls
  autoPlay
  muted={false}
  playsInline
  preload="auto"
  onLoadedMetadata={(e) => {
    const video = e.currentTarget;
    video.muted = false;
    video.volume = 1;
  }}
  onError={(e) => {
    console.error("Surprise video error:", e.currentTarget.error);
    setMissing(true);
  }}
  className="max-h-[70vh] w-full rounded-xl bg-black"
/>


        )}
      </div>
    </div>
  )
}
