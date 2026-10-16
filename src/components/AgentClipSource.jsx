import { useState } from 'react'
import AgentVideoPicker from './AgentVideoPicker.jsx'
import { formatCredits } from '../utils/credits'

const field =
  'mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'

/** Clip Maker input: a YouTube link (with the rights confirmation) or a video from the Library. */
export default function AgentClipSource({ agent, config, projectId, busy, paused, onStart }) {
  const [tab, setTab] = useState('link')
  const [url, setUrl] = useState('')
  const [rights, setRights] = useState(false)
  const tabClass = (on) =>
    `flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${on ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'}`

  const submit = (e) => {
    e.preventDefault()
    onStart({ url: url.trim(), rights })
  }

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label="Video source" className="flex gap-1 rounded-xl border border-border-default bg-surface p-1">
        <button type="button" role="tab" aria-selected={tab === 'link'} onClick={() => setTab('link')} className={tabClass(tab === 'link')}>
          YouTube link
        </button>
        <button type="button" role="tab" aria-selected={tab === 'upload'} onClick={() => setTab('upload')} className={tabClass(tab === 'upload')}>
          Upload / Library
        </button>
      </div>

      {tab === 'link' ? (
        <form onSubmit={submit} className="rounded-2xl border border-border-default bg-surface p-4">
          <label className="block text-sm">
            <span className="font-heading text-[1rem] font-semibold">Make clips</span>
            <span className="mt-1 block text-text-tertiary">Paste a link to a public YouTube video.</span>
            <input
              type="url"
              inputMode="url"
              value={url}
              maxLength={300}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className={field}
            />
          </label>
          <label className="mt-3 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={rights} onChange={(e) => setRights(e.target.checked)} />
            <span className="text-text-secondary">I own this video or have the rights to use it.</span>
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy || paused || !url.trim() || !rights}
              className="rounded-xl gradient-bg px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Checking the video…' : 'Find the best clips'}
            </button>
            <span className="text-xs text-text-tertiary">
              {paused
                ? 'This agent is paused. Resume it to run.'
                : `About ${formatCredits(agent.estimatedCredits)} credits per hour of video. Refunded if it fails.`}
            </span>
          </div>
        </form>
      ) : (
        <AgentVideoPicker
          agent={agent}
          config={config}
          projectId={projectId}
          busy={busy}
          paused={paused}
          onStart={onStart}
          title="Make clips"
          action="Find the best clips"
        />
      )}
    </div>
  )
}
