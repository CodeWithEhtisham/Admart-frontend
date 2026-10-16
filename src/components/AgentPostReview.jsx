import { useState } from 'react'
import { PLATFORM_NAMES } from '../utils/agents'
import { TitleCheck } from './AgentRunViews.jsx'

const field =
  'mt-1 w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'
const btn = 'rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary'
const LIMITS = { instagram: 2200, facebook: 5000 }

/** "YYYY-MM-DDTHH:MM" in local time, for <input type="datetime-local">. */
const localInput = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

function Counter({ value, limit }) {
  return (
    <span className={`block text-right font-mono text-[10px] ${value.length > limit ? 'text-danger' : 'text-text-tertiary'}`}>
      {value.length}/{limit}
    </span>
  )
}

/** Cross-poster check-in: one card per platform, then post now or at a chosen time. */
export default function AgentPostReview({ run, busy, onContinue, onDiscard }) {
  const [chosen, setChosen] = useState(() => new Set(run.chosen?.length ? run.chosen : run.platforms))
  const [posts, setPosts] = useState(() => ({
    ...run.posts,
    ...(run.posts.youtube ? { youtube: { ...run.posts.youtube, tags: run.posts.youtube.tags.join(', ') } } : {}),
  }))
  const [when, setWhen] = useState('') // '' = post now
  const set = (platform, patch) => setPosts((prev) => ({ ...prev, [platform]: { ...prev[platform], ...patch } }))
  const toggle = (platform) =>
    setChosen((prev) => {
      const next = new Set(prev)
      if (next.has(platform)) next.delete(platform)
      else next.add(platform)
      return next
    })

  const submit = () => {
    const yt = posts.youtube
    onContinue({
      platforms: [...chosen],
      posts: {
        ...posts,
        ...(yt ? { youtube: { ...yt, tags: yt.tags.split(',').map((t) => t.trim()).filter(Boolean) } } : {}),
      },
      postAt: when ? new Date(when).toISOString() : '',
    })
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-text-secondary">
        Check each post. Untick a platform to skip it. {run.short ? 'Vertical and short: it goes up as a Short and a Reel.' : ''}
      </p>

      {run.platforms.map((platform) => {
        const on = chosen.has(platform)
        const post = posts[platform]
        return (
          <section key={platform} className={`rounded-xl border p-4 ${on ? 'border-border-default bg-surface' : 'border-border-default/50 opacity-60'}`}>
            <label className="flex items-center gap-2 font-semibold">
              <input type="checkbox" checked={on} onChange={() => toggle(platform)} />
              {PLATFORM_NAMES[platform]}
            </label>
            {on && platform === 'youtube' ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px]">
                <div className="space-y-3">
                  <label className="block text-xs text-text-tertiary">
                    Title
                    <input value={post.title} maxLength={100} onChange={(e) => set('youtube', { title: e.target.value })} className={field} />
                    <Counter value={post.title} limit={100} />
                  </label>
                  <TitleCheck run={run} />
                  <label className="block text-xs text-text-tertiary">
                    Description
                    <textarea rows={4} value={post.description} maxLength={5000} onChange={(e) => set('youtube', { description: e.target.value })} className={field} />
                  </label>
                  <label className="block text-xs text-text-tertiary">
                    Tags (comma separated)
                    <input value={post.tags} onChange={(e) => set('youtube', { tags: e.target.value })} className={field} />
                  </label>
                  <label className="block text-xs text-text-tertiary">
                    Who can see it
                    <select value={post.privacy} onChange={(e) => set('youtube', { privacy: e.target.value })} className={field}>
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted (only people with the link)</option>
                      <option value="private">Private (only you)</option>
                    </select>
                  </label>
                </div>
                {run.thumbnailUrl ? (
                  <figure className="text-xs text-text-tertiary">
                    <img src={run.thumbnailUrl} alt="Thumbnail" className="w-full rounded-lg" />
                    <figcaption className="mt-1">Thumbnail (used if your channel allows custom thumbnails)</figcaption>
                  </figure>
                ) : null}
              </div>
            ) : null}
            {on && platform !== 'youtube' ? (
              <label className="mt-3 block text-xs text-text-tertiary">
                Caption
                <textarea
                  rows={5}
                  value={post.caption}
                  maxLength={LIMITS[platform]}
                  onChange={(e) => set(platform, { caption: e.target.value })}
                  className={field}
                />
                <Counter value={post.caption} limit={LIMITS[platform]} />
              </label>
            ) : null}
          </section>
        )
      })}

      <fieldset className="rounded-xl border border-border-default p-4">
        <legend className="px-1 font-semibold">When</legend>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="when" checked={!when} onChange={() => setWhen('')} />
            Post now
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="when"
              checked={Boolean(when)}
              onChange={() => setWhen(localInput(new Date(Date.now() + 60 * 60 * 1000)))}
            />
            At a time
          </label>
          {when ? (
            <input
              type="datetime-local"
              value={when}
              min={localInput(new Date())}
              onChange={(e) => setWhen(e.target.value)}
              className="rounded-lg border border-border-default bg-input px-2 py-1 text-sm"
              aria-label="Post at"
            />
          ) : null}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !chosen.size}
          onClick={submit}
          className="rounded-xl gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {when ? 'Schedule' : 'Post now'} to {[...chosen].map((p) => PLATFORM_NAMES[p]).join(', ') || '…'}
        </button>
        <button type="button" disabled={busy} onClick={onDiscard} className={btn}>
          Discard
        </button>
      </div>
    </div>
  )
}
