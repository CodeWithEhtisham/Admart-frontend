import { useEffect, useState } from 'react'

const fieldClass =
  'w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50'

export default function InstagramPostForm({ initialCaption, onPayloadChange }) {
  const [caption, setCaption] = useState(initialCaption || '')

  useEffect(() => {
    onPayloadChange?.({ caption })
  }, [caption, onPayloadChange])

  return (
    <div className="space-y-4 rounded-xl border border-border-default bg-panel p-5">
      <div>
        <h2 className="font-heading text-lg font-semibold">Instagram settings</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Posts to the connected Professional account. Reconnect Instagram after publishing is turned
          on. Instagram must be able to download the file from a public URL.
        </p>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs text-text-tertiary">Caption</span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
          maxLength={2200}
          className={fieldClass}
        />
      </label>
    </div>
  )
}
