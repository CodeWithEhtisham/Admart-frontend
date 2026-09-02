import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PreviewModal from '../components/PreviewModal.jsx'
import YoutubeUploadForm from '../components/YoutubeUploadForm.jsx'
import { mediaBlockReason, platformAccepts, PROVIDER_PLACEMENTS } from '../utils/platformMedia.js'
import {
  boostAsAd,
  getCachedActiveProject,
  listAdAccounts,
  listSocialAccounts,
  publishToAccounts,
} from '../utils/projects.js'

const ORGANIC_META = [
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'text-tiktok', dot: 'bg-tiktok' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'text-youtube', dot: 'bg-youtube' },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'text-instagram', dot: 'bg-instagram' },
  { id: 'facebook', name: 'Facebook', icon: 'f', color: 'text-facebook', dot: 'bg-facebook' },
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

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
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

export default function PublishingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const publishAsset = location.state || {}
  const isImage = publishAsset.type === 'image' && Boolean(publishAsset.imageUrl)
  const isVideo = publishAsset.type === 'video' && Boolean(publishAsset.videoUrl)
  const assetTitle =
    publishAsset.title ||
    (isImage ? 'Untitled image' : isVideo ? 'Untitled video' : 'Summer Product Launch — Cinematic Showcase 2024')
  const backTo = isImage ? '/image-gen' : isVideo ? '/video-gen' : '/result'
  const assetKind = isImage ? 'image' : 'video'
  const sourceUrl = isImage ? publishAsset.imageUrl : publishAsset.videoUrl

  const [mode, setMode] = useState('post')
  const [accountsByPlatform, setAccountsByPlatform] = useState({})
  const [adAccounts, setAdAccounts] = useState([])
  const [selectedId, setSelectedId] = useState(isImage ? 'instagram' : 'youtube')
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
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [ytPayload, setYtPayload] = useState(null)

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
      navigate(isImage ? '/image-gen' : isVideo ? '/video-gen' : '/dashboard')
    }, 1800)
    return () => clearTimeout(t)
  }, [showToast, navigate, isImage, isVideo])

  const confirmAction = async () => {
    const projectId = getCachedActiveProject()?.id
    if (!projectId) {
      setError('Select a project first.')
      setShowModal(false)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      if (mode === 'post') {
        const job = await publishToAccounts(projectId, {
          assetId: publishAsset.assetId || undefined,
          kind: assetKind,
          sourceUrl,
          title: assetTitle,
          platforms: activeOrganic.map((p) => p.id),
          youtube: ytPayload || {
            title: assetTitle.slice(0, 100),
            description: publishAsset.prompt || '',
            privacyStatus: 'public',
            categoryId: '22',
            madeForKids: false,
            containsSyntheticMedia: true,
          },
        })
        setToastMessage(
          job.status === 'succeeded'
            ? `Published to ${activeOrganic.length} platform${activeOrganic.length === 1 ? '' : 's'}.`
            : job.status === 'partial'
              ? 'Published to some platforms. Check failed accounts.'
              : job.error || 'Publish failed.',
        )
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
        setToastMessage('Boost created.')
      }
      setShowModal(false)
      setShowToast(true)
    } catch (err) {
      setShowModal(false)
      setError(err.response?.data?.message || err.response?.data?.error || 'Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const footerDisabled = activeCount === 0 || submitting || (mode === 'ad' && !adsReady)

  const adsCopy = useMemo(() => {
    if (!connectedAds.length) return 'Connect an ads account'
    return ADS_PROVIDER_LABELS[adsProvider] || 'Use as ad'
  }, [connectedAds.length, adsProvider])

  const selected = platforms.find((p) => p.id === selectedId) || platforms[0]
  const youtubeReady = platforms.some((p) => p.id === 'youtube' && canPost(p))

  return (
    <div className="relative flex h-screen min-h-0 flex-col bg-base font-body text-text-primary">
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-panel px-4">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition hover:bg-elevated hover:text-text-primary"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Link>
        <span className="h-5 w-px bg-border-default" aria-hidden />
        <h1 className="font-heading text-base font-semibold tracking-tight">
          {isImage ? 'Publish Image' : 'Publish Video'}
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-[300px] shrink-0 flex-col border-r border-border bg-panel">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
            <div className="overflow-hidden rounded-xl border border-border-default bg-surface shadow-lg">
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
                  <>
                    <div className="absolute inset-0 gradient-bg" />
                    <div className="absolute inset-0 bg-linear-to-t from-base/90 via-transparent to-transparent" />
                  </>
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
              <div className="p-3">
                <p className="font-heading text-sm font-semibold leading-snug">{assetTitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-xl border border-border-default bg-input p-1">
              <button
                type="button"
                onClick={() => setMode('post')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  mode === 'post' ? 'bg-elevated text-text-primary' : 'text-text-muted'
                }`}
              >
                Post to accounts
              </button>
              <button
                type="button"
                onClick={() => setMode('ad')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  mode === 'ad' ? 'bg-elevated text-text-primary' : 'text-text-muted'
                }`}
              >
                Use as ad
              </button>
            </div>
          </div>
        </aside>

        <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-panel">
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {mode === 'post' ? (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Platforms</h2>
                <div className="space-y-2">
                  {platforms.map((p) => {
                    const mediaBlocked = !platformAccepts(p.id, assetKind)
                    const disabled = !p.connected || mediaBlocked
                    const hint = mediaBlocked
                      ? mediaBlockReason(p.id, assetKind)
                      : !p.connected
                        ? 'Not connected'
                        : p.handle
                    const selectedRow = selectedId === p.id
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${
                          selectedRow
                            ? 'border-accent-blue/50 bg-elevated'
                            : disabled
                              ? 'border-border bg-input/40 opacity-60'
                              : 'border-border-default bg-input'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(p.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-elevated text-base ${p.color}`}>
                            {p.icon}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{p.name}</span>
                            <span className="block truncate text-[11px] text-text-muted">{hint}</span>
                          </span>
                        </button>
                        <Toggle
                          checked={Boolean(toggles[p.id]) && !disabled}
                          disabled={disabled}
                          onChange={(v) => {
                            setToggles((prev) => ({ ...prev, [p.id]: v }))
                            if (v) setSelectedId(p.id)
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Ads account</h2>
                {!connectedAds.length ? (
                  <div className="rounded-xl border border-border bg-input p-3 text-sm text-text-secondary">
                    Connect an ads account
                    <Link to="/social" className="mt-2 block font-medium text-accent-blue hover:underline">
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

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-base p-6">
          <section className="mx-auto max-w-2xl space-y-4">
            {error ? (
              <p className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
            ) : null}

            {mode === 'post' ? (
              <>
                {youtubeReady ? (
                  <div className={selected?.id === 'youtube' ? '' : 'hidden'}>
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

                {selected?.id !== 'youtube' || !youtubeReady ? (
                  <div className="rounded-xl border border-border-default bg-panel p-5">
                    <h2 className="font-heading text-lg font-semibold">{selected?.name} settings</h2>
                    {!selected?.connected ? (
                      <p className="mt-2 text-sm text-text-secondary">
                        Connect {selected?.name} in Social Accounts, then come back to publish.
                        <Link to="/social" className="mt-2 block font-medium text-accent-blue hover:underline">
                          Open Social Accounts →
                        </Link>
                      </p>
                    ) : !platformAccepts(selected.id, assetKind) ? (
                      <p className="mt-2 text-sm text-text-secondary">{mediaBlockReason(selected.id, assetKind)}</p>
                    ) : (
                      <p className="mt-2 text-sm text-text-secondary">
                        Caption and visibility use {selected.name} defaults for this first publish. Toggle it on in
                        Platforms to include it.
                      </p>
                    )}
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
                    <label className="block text-xs text-text-tertiary">Daily budget (USD)</label>
                    <input
                      type="number"
                      min="1"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-text-tertiary">Start</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-text-tertiary">End</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      <footer className="flex h-[72px] shrink-0 items-center gap-3 border-t border-border bg-panel px-4">
        <p className="text-sm text-text-secondary">
          {mode === 'post' ? (
            <>
              Publishing to <span className="font-semibold text-text-primary">{activeCount}</span> platforms
            </>
          ) : (
            <>
              Boosting on <span className="font-semibold text-text-primary">{selectedPlacements.length}</span> placements
            </>
          )}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={footerDisabled}
            className="rounded-lg gradient-bg px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === 'post' ? 'Publish Now' : 'Boost as ad'}
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
                ? `Publish this ${assetKind} to the selected accounts.`
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
                onClick={confirmAction}
                disabled={submitting}
                className="rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? 'Working…' : mode === 'post' ? 'Publish Now' : 'Boost as ad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="animate-slide-up fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-success/30 bg-panel px-5 py-3 text-sm font-medium text-success shadow-xl">
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
