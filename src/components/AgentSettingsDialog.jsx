import { useEffect, useState } from 'react'
import AgentStylePicker from './AgentStylePicker.jsx'

const field =
  'mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'

/** Change an agent's niche, voice & style and check-ins after it has started. Applies to the next run. */
export default function AgentSettingsDialog({ deployment, onClose, onSave }) {
  const agent = deployment.agent
  const video = agent?.inputKind === 'video'
  const [config, setConfig] = useState(() => ({ ...(deployment.config || {}) }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (patch) => setConfig((prev) => ({ ...prev, ...patch }))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const save = async () => {
    setBusy(true)
    setError('')
    try {
      await onSave({ config: { ...config, niche: (config.niche || '').trim() } })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the settings.')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-default bg-panel p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-title" className="font-heading text-lg font-semibold">
          {deployment.name} settings
        </h2>
        <p className="mt-1 text-xs text-text-tertiary">Changes apply to the next run.</p>

        <div className="mt-5 space-y-5 text-sm">
          {agent?.kind === 'large' && !video ? (
            <label className="block">
              <span className="text-text-tertiary">What is your channel about?</span>
              <input maxLength={300} value={config.niche || ''} onChange={(e) => set({ niche: e.target.value })} className={field} />
            </label>
          ) : null}

          <AgentStylePicker agent={agent || {}} value={config} onChange={set} />

          {agent?.clipLengths?.length ? (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(config.checkpoints || 'all') === 'all'}
                onChange={(e) => set({ checkpoints: e.target.checked ? 'all' : 'final' })}
              />
              Let me pick and trim the clips before they are made
            </label>
          ) : null}

          {agent?.review ? (
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(config.checkpoints || 'all') === 'all'}
                  onChange={(e) => set({ checkpoints: e.target.checked ? 'all' : 'final' })}
                />
                {video ? 'Let me review the cuts before the video is made' : 'Let me check each step (idea, script, pictures)'}
              </label>
              {video ? (
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={config.captions !== false} onChange={(e) => set({ captions: e.target.checked })} />
                  Burn in captions
                </label>
              ) : null}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={video ? Boolean(config.music) : config.music !== false}
                  onChange={(e) => set({ music: e.target.checked })}
                />
                Background music
              </label>
              {agent.styles?.length ? (
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={config.stock !== false} onChange={(e) => set({ stock: e.target.checked })} />
                  Use free stock video where it fits
                </label>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
