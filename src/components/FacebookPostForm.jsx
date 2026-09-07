import { useEffect, useState } from 'react'
import { listFacebookPages } from '../utils/projects.js'

const fieldClass =
  'w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50'

export default function FacebookPostForm({ projectId, connected, initialCaption, onPayloadChange, onError }) {
  const [pages, setPages] = useState([])
  const [pageId, setPageId] = useState('')
  const [caption, setCaption] = useState(initialCaption || '')

  useEffect(() => {
    onPayloadChange?.({ caption, pageId })
  }, [caption, pageId, onPayloadChange])

  useEffect(() => {
    if (!connected || !projectId) return undefined
    let cancelled = false
    listFacebookPages(projectId)
      .then((rows) => {
        if (cancelled) return
        const list = Array.isArray(rows) ? rows : []
        setPages(list)
        setPageId((current) => current || list[0]?.id || '')
      })
      .catch((err) => {
        onError?.(
          err.response?.data?.message ||
            'Could not load Facebook Pages. Reconnect Facebook after turning on publishing.',
        )
      })
    return () => {
      cancelled = true
    }
  }, [connected, projectId])

  return (
    <div className="space-y-4 rounded-xl border border-border-default bg-panel p-5">
      <div>
        <h2 className="font-heading text-lg font-semibold">Facebook settings</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Posts to a Facebook Page you manage. Reconnect Facebook after publishing is turned on.
        </p>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs text-text-tertiary">Page</span>
        <select value={pageId} onChange={(e) => setPageId(e.target.value)} className={fieldClass}>
          {pages.length === 0 ? <option value="">No Pages found</option> : null}
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name || page.id}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-text-tertiary">Caption</span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
          className={fieldClass}
        />
      </label>
    </div>
  )
}
