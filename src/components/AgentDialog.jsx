import { useEffect, useRef } from 'react'
import { Glyphs } from './glyphs'
import { Icon } from './icons'

/** Modal shell for agent panels (e.g. Schedule): Escape or the backdrop closes it, focus returns to the opener. */
export default function AgentDialog({ labelledBy, onClose, children }) {
  const ref = useRef(null)
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })
  useEffect(() => {
    const opener = document.activeElement
    ref.current?.focus()
    const onKey = (e) => e.key === 'Escape' && close.current()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:px-4" onClick={() => close.current()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border-default bg-panel p-5 shadow-2xl outline-none sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => close.current()}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-text-tertiary transition-colors duration-200 hover:bg-elevated hover:text-text-primary"
        >
          <Icon className="h-5 w-5">{Glyphs.x}</Icon>
        </button>
        {children}
      </div>
    </div>
  )
}
