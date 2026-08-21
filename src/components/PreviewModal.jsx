import { useEffect } from 'react'

export default function PreviewModal({ type, src, title, onClose, onDownload }) {
  useEffect(() => {
    if (!src) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [src, onClose])

  if (!src) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Fullscreen preview'}
    >
      <div
        className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="truncate text-sm text-white/80">{title || 'Preview'}</p>
        <div className="flex shrink-0 items-center gap-2">
          {onDownload ? (
            <button
              type="button"
              onClick={onDownload}
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              Download
            </button>
          ) : (
            <a
              href={src}
              download
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              Download
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <div
        className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8"
        onClick={onClose}
      >
        {type === 'video' ? (
          <video
            src={src}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full rounded-lg bg-black shadow-2xl"
          />
        ) : (
          <img
            src={src}
            alt={title || 'Preview'}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}
      </div>
    </div>
  )
}
