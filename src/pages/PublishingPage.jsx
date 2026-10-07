import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PreviewModal from '../components/PreviewModal.jsx'
import FacebookPostForm from '../components/FacebookPostForm.jsx'
import YoutubeUploadForm from '../components/YoutubeUploadForm.jsx'
import { mediaBlockReason, platformAccepts, PROVIDER_PLACEMENTS } from '../utils/platformMedia.js'
import { getCredits } from '../utils/credits.js'
import {
  boostAsAd,
  getCachedActiveProject,
  listAdAccounts,
  listSocialAccounts,
  publishToAccounts,
} from '../utils/projects.js'
import { Glyphs } from '../components/glyphs'
import { Icon } from '../components/icons'

const ORGANIC_META = [
  { id: 'tiktok', name: 'TikTok', icon: Glyphs.music, color: 'text-tiktok', dot: 'bg-tiktok' },
  { id: 'youtube', name: 'YouTube', icon: Glyphs.play, color: 'text-youtube', dot: 'bg-youtube' },
  { id: 'instagram', name: 'Instagram', icon: Glyphs.camera, color: 'text-instagram', dot: 'bg-instagram' },
  { id: 'facebook', name: 'Facebook', icon: Glyphs.facebook, color: 'text-facebook', dot: 'bg-facebook' },
]

const ADS_PLACEMENT_META = [
  { id: 'tiktok', name: 'TikTok', color: 'text-tiktok', dot: 'bg-tiktok' },
  { id: 'instagram', name: 'Instagram', color: 'text-instagram', dot: 'bg-instagram' },
  { id: 'facebook', name: 'Facebook', color: 'text-facebook', dot: 'bg-facebook' },
  { id: 'snapchat', name: 'Snapchat', color: 'text-snapchat', dot: 'bg-snapchat' },
  { id: 'youtube', name: 'YouTube', color: 'text-youtube', dot: 'bg-youtube' },
]

const ADS_PROVIDER_LABELS = {
  meta: 'Meta Ads (Facebook + Instagram)',
  tiktok: 'TikTok Ads',
  snap: 'Snap Ads',
  google: 'YouTube Ads (Google Ads)',
}

function ChevronLeftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        disabled ? 'cursor-not-allowed bg-elevated opacity-40' : checked ? 'bg-accent-blue' : 'bg-elevated'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function toDatetimeLocal(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function PublishingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const publishAsset = location.state || {}
  const isImage = publishAsset.type === 'image' && Boolean(publishAsset.imageUrl)
  const isVideo = publishAsset.type === 'video' && Boolean(publishAsset.videoUrl)
  const assetTitle = publishAsset.title || (isImage ? 'Untitled image' : 'Untitled video')
  const backTo = isImage ? '/image-gen' : isVideo ? '/video-gen' : '/result'
  const assetKind = isImage ? 'image' : 'video'
  const sourceUrl = isImage ? publishAsset.imageUrl : publishAsset.videoUrl

  const [mode, setMode] = useState('post')
  const [accountsByPlatform, setAccountsByPlatform] = useState({})
  const [adAccounts, setAdAccounts] = useState([])
  const [toggles, setToggles] = useState({
    tiktok: platformAccepts('tiktok', isImage ? 'image' : 'video'),
    youtube: platformAccepts('youtube', isImage ? 'image' : 'video'),
    instagram: true,
    facebook: true,
  })
  const [adsProvider, setAdsProvider] = useState('')
  const [adsPlacements, setAdsPlacements] = useState({})
  const [budget, setBudget] = useState('25')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleAt, setScheduleAt] = useState('')
  // Plan flag from the balance endpoint; null until known (don't hide the button while loading).
  const [canSchedule, setCanSchedule] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [stayAfterToast, setStayAfterToast] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [ytPayload, setYtPayload] = useState(null)
  const [fbPayload, setFbPayload] = useState(null)
  // One caption for every platform that takes one (Facebook, Instagram); YouTube has its own title.
  const [caption, setCaption] = useState(assetTitle)

  const platforms = ORGANIC_META.map((p) => {
    const acc = accountsByPlatform[p.id]
    return {
      ...p,
      connected: Boolean(acc?.connected),
      handle: acc?.handle || acc?.displayName || '',
    }
  })

  const connectedAds = adAccounts.filter((a) => a.connected)
  const canPost = (p) => p.connected && platformAccepts(p.id, assetKind)
  const activeOrganic = platforms.filter((p) => toggles[p.id] && canPost(p))
  const allowedPlacements = (PROVIDER_PLACEMENTS[adsProvider] || []).filter((id) =>
    platformAccepts(id, assetKind),
  )
  const selectedPlacements = allowedPlacements.filter((id) => adsPlacements[id])
  const activeCount = mode === 'post' ? activeOrganic.length : selectedPlacements.length
  const adsReady = connectedAds.length > 0 && Boolean(adsProvider)

  useEffect(() => {
    const projectId = getCachedActiveProject()?.id
    if (!projectId) return
    let cancelled = false
    Promise.all([listSocialAccounts(projectId), listAdAccounts(projectId)])
      .then(([social, ads]) => {
        if (cancelled) return
        const map = {}
        for (const acc of social || []) map[acc.platform] = acc
        setAccountsByPlatform(map)
        const adsList = ads || []
        setAdAccounts(adsList)
        const first = adsList.find((a) => a.connected)
        if (first) setAdsProvider(first.provider)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load connected accounts.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const next = {}
    for (const id of allowedPlacements) next[id] = true
    setAdsPlacements(next)
  }, [adsProvider, assetKind])

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => {
      setShowToast(false)
      if (!stayAfterToast) navigate(isImage ? '/image-gen' : isVideo ? '/video-gen' : '/dashboard')
    }, 1800)
    return () => clearTimeout(t)
  }, [showToast, stayAfterToast, navigate, isImage, isVideo])

  const confirmAction = async (action = 'publish', scheduledAtValue = '') => {
    const projectId = getCachedActiveProject()?.id
    if (!projectId) {
      setError('Select a project first.')
      setShowModal(false)
      setScheduleOpen(false)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      if (mode === 'post') {
        const youtube = {
          ...(ytPayload || {
            title: assetTitle.slice(0, 100),
            description: publishAsset.prompt || '',
            privacyStatus: 'public',
            categoryId: '22',
            madeForKids: false,
            containsSyntheticMedia: true,
          }),
        }
        if (action === 'schedule' && scheduledAtValue) {
          youtube.publishAt = new Date(scheduledAtValue).toISOString()
        }
        const job = await publishToAccounts(projectId, {
          action,
          scheduledAt: action === 'schedule' ? new Date(scheduledAtValue).toISOString() : undefined,
          assetId: publishAsset.assetId || undefined,
          kind: assetKind,
          sourceUrl,
          title: assetTitle,
          platforms: activeOrganic.map((p) => p.id),
          youtube,
          facebook: { caption, pageId: fbPayload?.pageId || '' },
          instagram: { caption },
        })
        if (action === 'draft') {
          setStayAfterToast(true)
          setToastMessage('Saved as draft.')
        } else if (action === 'schedule') {
          setStayAfterToast(false)
          setToastMessage(
            job.status === 'scheduled' || job.status === 'partial'
              ? 'Scheduled. YouTube and Facebook use the platform scheduler.'
              : job.error || 'Could not schedule.',
          )
        } else {
          setStayAfterToast(false)
          setToastMessage(
            job.status === 'succeeded'
              ? `Published to ${activeOrganic.length} platform${activeOrganic.length === 1 ? '' : 's'}.`
              : job.status === 'partial'
                ? 'Published to some platforms. Check failed accounts.'
                : job.error || 'Publish failed.',
          )
        }
      } else {
        await boostAsAd(projectId, {
          assetId: publishAsset.assetId || undefined,
          kind: assetKind,
          sourceUrl,
          title: assetTitle,
          provider: adsProvider,
          placements: selectedPlacements,
          budget,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        })
        setStayAfterToast(false)
        setToastMessage('Boost created.')
      }
      setShowModal(false)
      setScheduleOpen(false)
      setShowToast(true)
    } catch (err) {
      setShowModal(false)
      setScheduleOpen(false)
      setError(err.response?.data?.message || err.response?.data?.error || 'Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    getCredits()
      .then((bal) => {
        const limits = bal?.planDetails?.limits
        if (limits) setCanSchedule(Boolean(limits.can_schedule_publishing))
      })
      .catch(() => {})
  }, [])

  const openSchedule = () => {
    setScheduleAt(toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000)))
    setScheduleOpen(true)
  }

  const footerDisabled = activeCount === 0 || submitting || (mode === 'ad' && !adsReady)

  const adsCopy = useMemo(() => {
    if (!connectedAds.length) return 'Connect an ads account'
    return ADS_PROVIDER_LABELS[adsProvider] || 'Use as ad'
  }, [connectedAds.length, adsProvider])

  const youtubeReady = platforms.some((p) => p.id === 'youtube' && canPost(p))
  const facebookReady = platforms.some((p) => p.id === 'facebook' && canPost(p))
  const isActive = (id) => activeOrganic.some((p) => p.id === id)
  const usesCaption = activeOrganic.some((p) => p.id !== 'youtube')
  const connectedPlatforms = platforms.filter((p) => p.connected)
  const missingPlatforms = platforms.filter((p) => !p.connected)
  const activeNames = activeOrganic.map((p) => p.name).join(', ')
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

  return (
    <div className="relative flex min-h-screen flex-col bg-base font-body text-text-primary lg:h-screen">
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-panel px-4">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition hover:bg-elevated hover:text-text-primary"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Link>
        <span className="h-5 w-px bg-border-default" aria-hidden />
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {isImage ? 'Publish Image' : 'Publish Video'}
        </h1>
      </header>

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row lg:overflow-hidden">
        <aside
          aria-label="Where to publish"
          className="shrink-0 border-b border-border bg-panel lg:flex lg:w-[380px] lg:flex-col lg:border-b-0 lg:border-r"
        >
          <div className="space-y-5 p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-border-default bg-input p-1">
              {[
                ['post', 'Post'],
                ['ad', 'Boost as ad'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={mode === id}
                  onClick={() => setMode(id)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    mode === id ? 'bg-elevated text-text-primary' : 'text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-border-default bg-surface shadow-lg lg:max-w-none">
              <div className={`relative w-full ${isImage ? 'aspect-square' : 'aspect-video'}`}>
                {isImage ? (
                  <img src={publishAsset.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : isVideo ? (
                  <video
                    src={publishAsset.videoUrl}
                    controls
                    className="absolute inset-0 h-full w-full bg-black object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 gradient-bg" />
                )}
                {isImage || isVideo ? (
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="absolute right-2 top-2 z-10 rounded-md border border-white/25 bg-black/50 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition hover:bg-black/70"
                    aria-label="Open fullscreen preview"
                  >
                    Fullscreen
                  </button>
                ) : null}
              </div>
              <p className="p-3 font-heading text-sm font-semibold leading-snug">{assetTitle}</p>
            </div>

            {mode === 'post' ? (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Post to</h2>
                {connectedPlatforms.length === 0 ? (
                  <p className="rounded-xl border border-border bg-input p-3 text-sm text-text-secondary">
                    No accounts connected yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {connectedPlatforms.map((p) => {
                      const blocked = !platformAccepts(p.id, assetKind)
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                            blocked ? 'border-border bg-input/40' : 'border-border-default bg-input'
                          }`}
                        >
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated ${p.color}`}>
                            <Icon className="h-4 w-4">{p.icon}</Icon>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{p.name}</span>
                            <span
                              className="block truncate text-xs text-text-tertiary"
                              title={blocked ? mediaBlockReason(p.id, assetKind) : undefined}
                            >
                              {blocked ? mediaBlockReason(p.id, assetKind) : p.handle}
                            </span>
                          </span>
                          <Toggle
                            label={`Publish to ${p.name}`}
                            checked={Boolean(toggles[p.id]) && !blocked}
                            disabled={blocked}
                            onChange={(v) => setToggles((prev) => ({ ...prev, [p.id]: v }))}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
                {missingPlatforms.length ? (
                  <p className="mt-3 text-xs text-text-tertiary">
                    Not connected: {missingPlatforms.map((p) => p.name).join(', ')}.{' '}
                    <Link to="/social" className="font-medium text-link hover:underline">
                      Connect more →
                    </Link>
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Ads account</h2>
                {!connectedAds.length ? (
                  <div className="rounded-xl border border-border bg-input p-3 text-sm text-text-secondary">
                    Connect an ads account
                    <Link to="/social" className="mt-2 block font-medium text-link hover:underline">
                      Connect ads →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {connectedAds.map((acc) => (
                        <label
                          key={acc.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border-default bg-input px-3 py-2 text-sm"
                        >
                          <input
                            type="radio"
                            name="adsProvider"
                            checked={adsProvider === acc.provider}
                            onChange={() => setAdsProvider(acc.provider)}
                          />
                          <span>{ADS_PROVIDER_LABELS[acc.provider]}</span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                        Placements
                      </h3>
                      <div className="space-y-2">
                        {ADS_PLACEMENT_META.filter((p) => allowedPlacements.includes(p.id)).map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 rounded-xl border border-border-default bg-input px-3 py-2"
                          >
                            <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                            <p className="min-w-0 flex-1 text-sm">{p.name}</p>
                            <Toggle
                              label={`Boost on ${p.name}`}
                              checked={Boolean(adsPlacements[p.id])}
                              onChange={(v) => setAdsPlacements((prev) => ({ ...prev, [p.id]: v }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-base p-4 sm:p-6 lg:min-h-0 lg:overflow-y-auto">
          <section className="mx-auto max-w-5xl space-y-4">
            {error ? (
              <p role="alert" className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            ) : null}

            {mode === 'post' ? (
              <>
                {activeOrganic.length === 0 ? (
                  <div className="rounded-xl border border-border-default bg-panel p-5">
                    <h2 className="font-heading text-lg font-semibold">Choose where to post</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      {connectedPlatforms.length
                        ? 'Turn on at least one account under "Post to".'
                        : 'Connect YouTube, Meta (Facebook + Instagram), TikTok or Snapchat first.'}
                    </p>
                    {!connectedPlatforms.length ? (
                      <Link to="/social" className="mt-3 inline-block text-sm font-medium text-link hover:underline">
                        Open Social Accounts →
                      </Link>
                    ) : null}
                  </div>
                ) : null}

                {usesCaption ? (
                  <label className="block rounded-xl border border-border-default bg-panel p-5">
                    <span className="font-heading text-lg font-semibold">Caption</span>
                    <span className="mt-1 block text-sm text-text-secondary">
                      Used for {activeOrganic.filter((p) => p.id !== 'youtube').map((p) => p.name).join(' and ')}.
                    </span>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows={4}
                      maxLength={2200}
                      className="mt-3 w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
                    />
                  </label>
                ) : null}

                {youtubeReady ? (
                  <div className={isActive('youtube') ? '' : 'hidden'}>
                    <YoutubeUploadForm
                      projectId={getCachedActiveProject()?.id}
                      connected
                      videoUrl={publishAsset.videoUrl}
                      initialTitle={assetTitle}
                      initialDescription={publishAsset.prompt || ''}
                      initialThumbnail={publishAsset.thumbnailUrl || ''}
                      onPayloadChange={setYtPayload}
                      onError={setError}
                    />
                  </div>
                ) : null}

                {facebookReady ? (
                  <div className={isActive('facebook') ? '' : 'hidden'}>
                    <FacebookPostForm
                      projectId={getCachedActiveProject()?.id}
                      connected
                      onPayloadChange={setFbPayload}
                      onError={setError}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <div className="space-y-4 rounded-xl border border-border-default bg-panel p-5">
                {!connectedAds.length ? (
                  <p className="text-sm text-text-secondary">
                    Connect an ads account on Social Accounts, then boost this creative.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-text-secondary">
                      {adsCopy}. Same creative, budget and dates. Custom audiences and reporting come later.
                    </p>
                    <label className="block">
                      <span className="mb-1 block text-xs text-text-tertiary">Daily budget (USD)</span>
                      <input
                        type="number"
                        min="1"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="mb-1 block text-xs text-text-tertiary">Start</span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-text-tertiary">End</span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      <footer className="sticky bottom-0 z-10 flex shrink-0 flex-wrap items-center gap-3 border-t border-border bg-panel px-4 py-3 lg:h-[72px] lg:py-0">
        <p className="text-sm text-text-secondary">
          {mode === 'post' ? (
            <>
              Publishing to{' '}
              <span className="font-semibold text-text-primary">{plural(activeCount, 'platform')}</span>
            </>
          ) : (
            <>
              Boosting on{' '}
              <span className="font-semibold text-text-primary">
                {plural(selectedPlacements.length, 'placement')}
              </span>
            </>
          )}
        </p>
        <div className="ml-auto flex items-center gap-2">
          {mode === 'post' ? (
            <>
              <button
                type="button"
                onClick={() => confirmAction('draft')}
                disabled={footerDisabled}
                className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save draft
              </button>
              {canSchedule === false ? (
                <Link
                  to="/billing"
                  title="Scheduled publishing is included in Plus and Pro"
                  className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  Schedule · <span className="text-violet-text">Plus</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={openSchedule}
                  disabled={footerDisabled}
                  className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Schedule
                </button>
              )}
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={footerDisabled}
            className="rounded-lg gradient-bg px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === 'post' ? 'Publish now' : 'Boost as ad'}
          </button>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-2xl border border-border-default bg-panel p-6 shadow-2xl"
          >
            <h2 id="confirm-title" className="font-heading text-lg font-semibold">
              {mode === 'post' ? 'Confirm Publishing' : 'Confirm boost'}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {mode === 'post'
                ? `Publish this ${assetKind} to ${activeNames}.`
                : `Create a ${ADS_PROVIDER_LABELS[adsProvider] || 'ads'} campaign with this ${assetKind}.`}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmAction()}
                disabled={submitting}
                className="rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? 'Working…' : mode === 'post' ? 'Publish now' : 'Boost as ad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-title"
            className="w-full max-w-md rounded-2xl border border-border-default bg-panel p-6 shadow-2xl"
          >
            <h2 id="schedule-title" className="font-heading text-lg font-semibold">
              Schedule post
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              YouTube and Facebook use each platform's scheduler. Instagram is saved here until auto-publish is
              available.
            </p>
            <label className="mt-4 block text-xs text-text-tertiary">Date and time</label>
            <input
              type="datetime-local"
              min={toDatetimeLocal(new Date())}
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setScheduleOpen(false)}
                className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmAction('schedule', scheduleAt)}
                disabled={submitting || !scheduleAt}
                className="rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? 'Working…' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showToast && (
        <div className="animate-slide-up fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-success/30 bg-panel px-5 py-3 text-sm font-medium text-success-text shadow-xl">
          {toastMessage}
        </div>
      )}

      {showPreview && (
        <PreviewModal
          type={isImage ? 'image' : 'video'}
          src={isImage ? publishAsset.imageUrl : publishAsset.videoUrl}
          title={assetTitle}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
