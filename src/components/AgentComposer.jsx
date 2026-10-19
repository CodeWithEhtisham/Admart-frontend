import { useEffect, useRef } from 'react'

/**
 * The start bar of an agent page, like a chat input. The page pins its wrapper to the bottom of the canvas column on large screens
 * (sticky only moves inside its parent, so the sticky class belongs on that wrapper).
 * - children: the main row (topic input, or a summary of the choices)
 * - tools: left side of the bottom row (model pickers); actions: right side (estimate + primary button)
 * - panel: richer setup that opens above the bar (inline on small screens); panelOpen / onClosePanel control it
 * Pass onSubmit to render it as a <form>.
 */
export default function AgentComposer({ label, onSubmit, panel, panelOpen, panelId, onClosePanel, tools, actions, children }) {
  const close = useRef(onClosePanel)
  useEffect(() => {
    close.current = onClosePanel
  })
  useEffect(() => {
    if (!panelOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && close.current?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen])

  const Tag = onSubmit ? 'form' : 'section'
  return (
    <Tag aria-label={label} onSubmit={onSubmit} className="relative">
      {panel && panelOpen ? (
        <div
          id={panelId}
          className="glass-card glass-card-blur mb-3 max-h-[60vh] overflow-y-auto rounded-2xl p-4 sm:p-5 lg:absolute lg:inset-x-0 lg:bottom-full lg:bg-panel"
        >
          {panel}
        </div>
      ) : null}
      <div className="glass-card glass-card-blur rounded-2xl p-3 transition-shadow duration-200 focus-within:ai-glow sm:p-4">
        {children}
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">{tools}</div>
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">{actions}</div>
        </div>
      </div>
    </Tag>
  )
}
