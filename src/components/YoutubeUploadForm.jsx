import { useEffect, useRef, useState } from 'react'
import { listYoutubePlaylists, suggestYoutubeCopy } from '../utils/projects.js'
import { listLibraryAssets, uploadLibraryMedia } from '../utils/library.js'

const LANGUAGES = [
  { id: '', label: 'Select' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'hi', label: 'Hindi' },
  { id: 'ur', label: 'Urdu' },
  { id: 'ar', label: 'Arabic' },
  { id: 'ja', label: 'Japanese' },
  { id: 'ko', label: 'Korean' },
  { id: 'zh', label: 'Chinese' },
  { id: 'id', label: 'Indonesian' },
  { id: 'tr', label: 'Turkish' },
]

const CATEGORIES = [
  { id: '22', label: 'People & Blogs' },
  { id: '24', label: 'Entertainment' },
  { id: '26', label: 'Howto & Style' },
  { id: '28', label: 'Science & Technology' },
  { id: '27', label: 'Education' },
  { id: '10', label: 'Music' },
  { id: '17', label: 'Sports' },
  { id: '23', label: 'Comedy' },
  { id: '20', label: 'Gaming' },
  { id: '1', label: 'Film & Animation' },
  { id: '19', label: 'Travel & Events' },
  { id: '2', label: 'Autos & Vehicles' },
  { id: '15', label: 'Pets & Animals' },
  { id: '25', label: 'News & Politics' },
  { id: '29', label: 'Nonprofits & Activism' },
]

const fieldClass =
  'w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50'

const VIDEO_FRAMES = [
  { id: 'frame-1', fraction: 0.12, label: 'Frame 1' },
  { id: 'frame-2', fraction: 0.5, label: 'Frame 2' },
  { id: 'frame-3', fraction: 0.82, label: 'Frame 3' },
]

function VideoFrameTile({ src, fraction, selected, label, onClick }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !src) return undefined
    const seek = () => {
      const duration = el.duration || 1
      el.currentTime = Math.min(Math.max(duration * fraction, 0.05), Math.max(duration - 0.08, 0.05))
    }
    el.addEventListener('loadedmetadata', seek)
    if (el.readyState >= 1) seek()
    return () => el.removeEventListener('loadedmetadata', seek)
  }, [src, fraction])
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative aspect-video overflow-hidden rounded-xl border text-left ${
        selected ? 'border-accent-blue ring-2 ring-accent-blue/40' : 'border-border-default hover:border-accent-blue/40'
      }`}
    >
      <video ref={ref} src={src} className="h-full w-full object-cover" muted playsInline preload="metadata" />
      <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
        {label}
      </span>
      {selected ? (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-accent-blue px-1.5 py-0.5 text-[10px] font-bold text-white">
          Selected
        </span>
      ) : null}
    </button>
  )
}

function grabVideoFrame(src, fraction) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    const fail = () => {
      video.remove()
      reject(new Error('Could not grab a still from this video. Upload a file or pick from library.'))
    }
    video.addEventListener('error', fail)
    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration || 1
      const time = Math.min(Math.max(duration * fraction, 0.05), Math.max(duration - 0.08, 0.05))
      video.addEventListener(
        'seeked',
        () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth || 1280
            canvas.height = video.videoHeight || 720
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
            canvas.toBlob((blob) => {
              video.remove()
              if (!blob) return fail()
              resolve(new File([blob], `youtube-thumb-${Math.round(time)}s.jpg`, { type: 'image/jpeg' }))
            }, 'image/jpeg', 0.86)
          } catch {
            fail()
          }
        },
        { once: true },
      )
      video.currentTime = time
    })
    video.src = src
  })
}

export default function YoutubeUploadForm({
  projectId,
  connected,
  videoUrl,
  initialTitle,
  initialDescription,
  initialThumbnail,
  onPayloadChange,
  onError,
}) {
  const [title, setTitle] = useState((initialTitle || '').slice(0, 100))
  const [description, setDescription] = useState(initialDescription || '')
  const [tags, setTags] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [category, setCategory] = useState('22')
  const [thumbnail, setThumbnail] = useState(initialThumbnail && initialThumbnail !== videoUrl ? initialThumbnail : '')
  const [thumbBusy, setThumbBusy] = useState(false)
  const [pickedThumbs, setPickedThumbs] = useState(() =>
    initialThumbnail && initialThumbnail !== videoUrl
      ? [{ id: 'poster', url: initialThumbnail, label: 'From video' }]
      : [],
  )
  const [frameUrls, setFrameUrls] = useState({})
  const [selectedId, setSelectedId] = useState(() =>
    initialThumbnail && initialThumbnail !== videoUrl ? 'poster' : '',
  )
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [libraryItems, setLibraryItems] = useState([])
  const [libraryBusy, setLibraryBusy] = useState(false)
  const thumbFileRef = useRef(null)
  const [playlists, setPlaylists] = useState([])
  const [playlistId, setPlaylistId] = useState('')
  const [kids, setKids] = useState('no')
  const [synthetic, setSynthetic] = useState('yes')
  const [paidPromotion, setPaidPromotion] = useState(false)
  const [language, setLanguage] = useState('')
  const [license, setLicense] = useState('youtube')
  const [embeddable, setEmbeddable] = useState(true)
  const [publicStats, setPublicStats] = useState(true)
  const [notify, setNotify] = useState(true)
  const [recordingDate, setRecordingDate] = useState('')
  const [suggestBusy, setSuggestBusy] = useState(false)

  const onPayloadChangeRef = useRef(onPayloadChange)
  onPayloadChangeRef.current = onPayloadChange

  const applyThumb = (id, url) => {
    setSelectedId(id)
    setThumbnail(url || '')
  }

  const uploadThumbnailFile = async (file, id, label) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      onError?.('Thumbnail must be a JPG, PNG, or WebP under 2 MB.')
      return
    }
    setThumbBusy(true)
    onError?.('')
    try {
      const asset = await uploadLibraryMedia(file, projectId)
      const url = asset?.sourceUrl || asset?.thumbnailUrl || ''
      if (!url) throw new Error('Upload did not return a URL.')
      const row = { id: id || `up:${asset.id || url}`, url, label: label || 'Uploaded' }
      setPickedThumbs((prev) => [row, ...prev.filter((item) => item.id !== row.id)])
      applyThumb(row.id, url)
    } catch (err) {
      onError?.(err.response?.data?.message || err.message || 'Could not upload thumbnail.')
    } finally {
      setThumbBusy(false)
    }
  }

  const pickVideoFrame = async (spot) => {
    setSelectedId(spot.id)
    if (frameUrls[spot.id]) {
      setThumbnail(frameUrls[spot.id])
      return
    }
    if (!videoUrl) return
    setThumbBusy(true)
    onError?.('')
    try {
      const file = await grabVideoFrame(videoUrl, spot.fraction)
      const asset = await uploadLibraryMedia(file, projectId)
      const url = asset?.sourceUrl || asset?.thumbnailUrl || ''
      if (!url) throw new Error('Could not save that video frame.')
      setFrameUrls((prev) => ({ ...prev, [spot.id]: url }))
      setThumbnail(url)
    } catch (err) {
      setThumbnail('')
      onError?.(err.response?.data?.message || err.message || 'Could not grab a still from this video.')
    } finally {
      setThumbBusy(false)
    }
  }

  const openLibraryPicker = async () => {
    setLibraryOpen(true)
    setLibraryBusy(true)
    try {
      const res = await listLibraryAssets('image', { projectId, limit: 60 })
      setLibraryItems(
        (res.items || [])
          .filter((a) => a.mediaType === 'image')
          .map((a) => ({ id: a.id, url: a.sourceUrl || a.thumbnailUrl || '', title: a.title }))
          .filter((row) => row.url && !/\.(mp4|webm|mov|m4v)(\?|$)/i.test(row.url)),
      )
    } catch {
      setLibraryItems([])
      onError?.('Could not load library images.')
    } finally {
      setLibraryBusy(false)
    }
  }

  const pickFromLibrary = (row) => {
    const id = `lib:${row.id}`
    setPickedThumbs((prev) => [{ id, url: row.url, label: 'Library' }, ...prev.filter((item) => item.id !== id)])
    applyThumb(id, row.url)
    setLibraryOpen(false)
  }

  useEffect(() => {
    if (!libraryOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setLibraryOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [libraryOpen])

  useEffect(() => {
    if (!projectId || !connected) return
    let cancelled = false
    listYoutubePlaylists(projectId)
      .then((rows) => {
        if (!cancelled) setPlaylists(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!cancelled) setPlaylists([])
      })
    return () => {
      cancelled = true
    }
  }, [projectId, connected])

  useEffect(() => {
    onPayloadChangeRef.current({
      title,
      description,
      tags,
      privacyStatus: privacy,
      thumbnailUrl: thumbnail || undefined,
      categoryId: category,
      language: language || undefined,
      license,
      embeddable,
      publicStatsViewable: publicStats,
      madeForKids: kids === 'yes',
      containsSyntheticMedia: synthetic === 'yes',
      notifySubscribers: notify,
      paidPromotion,
      recordingDate: recordingDate || undefined,
      playlistId: playlistId || undefined,
    })
  }, [
    title,
    description,
    tags,
    privacy,
    thumbnail,
    category,
    language,
    license,
    embeddable,
    publicStats,
    kids,
    synthetic,
    notify,
    paidPromotion,
    recordingDate,
    playlistId,
  ])

  const suggestCopy = async () => {
    if (!projectId || suggestBusy) return
    setSuggestBusy(true)
    onError?.('')
    try {
      const data = await suggestYoutubeCopy(projectId, {
        title,
        prompt: description || initialDescription || title,
      })
      if (data.title) setTitle(data.title.slice(0, 100))
      if (data.description != null) setDescription(String(data.description).slice(0, 5000))
      if (Array.isArray(data.tags)) setTags(data.tags.join(', ').slice(0, 500))
      if (data.categoryId && CATEGORIES.some((c) => c.id === data.categoryId)) setCategory(data.categoryId)
      if (data.language && LANGUAGES.some((l) => l.id === data.language)) setLanguage(data.language)
    } catch (err) {
      onError?.(err.response?.data?.message || 'Could not suggest YouTube copy.')
    } finally {
      setSuggestBusy(false)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-border-default bg-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">YouTube</h2>
          <p className="mt-1 text-sm text-text-secondary">Uploads to your connected channel.</p>
        </div>
        <button
          type="button"
          onClick={suggestCopy}
          disabled={suggestBusy || !projectId}
          className="shrink-0 rounded-lg border border-border-default px-3 py-1.5 text-xs font-semibold text-text-secondary disabled:opacity-50"
        >
          {suggestBusy ? 'Suggesting…' : 'Suggest with AI'}
        </button>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs text-text-tertiary">Title (required)</span>
        <input
          type="text"
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
        />
        <span className="mt-1 block text-right font-mono text-[10px] text-text-tertiary">{title.length}/100</span>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-text-tertiary">Description</span>
        <textarea
          rows={4}
          maxLength={5000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell viewers about your video"
          className={`${fieldClass} resize-y`}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-1 text-xs text-text-tertiary">Visibility</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              ['public', 'Public'],
              ['unlisted', 'Unlisted'],
              ['private', 'Private'],
            ].map(([id, label]) => (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input type="radio" name="ytPrivacy" checked={privacy === id} onChange={() => setPrivacy(id)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-xs text-text-tertiary">Made for kids? (required)</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="ytKids" checked={kids === 'yes'} onChange={() => setKids('yes')} />
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="ytKids" checked={kids === 'no'} onChange={() => setKids('no')} />
              No
            </label>
          </div>
        </fieldset>
      </div>

      <details className="rounded-lg border border-border">
        <summary className="cursor-pointer px-3 py-2.5 text-sm font-medium">
          More YouTube options
          <span className="ml-2 text-xs font-normal text-text-tertiary">thumbnail, playlist, tags, category…</span>
        </summary>
        <div className="space-y-4 border-t border-border px-3 py-4">
          <div>
            <p className="mb-2 block text-xs text-text-tertiary">Thumbnail</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {videoUrl
                ? VIDEO_FRAMES.map((spot) =>
                    frameUrls[spot.id] ? (
                      <button
                        key={spot.id}
                        type="button"
                        onClick={() => applyThumb(spot.id, frameUrls[spot.id])}
                        className={`relative aspect-video overflow-hidden rounded-xl border text-left ${
                          selectedId === spot.id
                            ? 'border-accent-blue ring-2 ring-accent-blue/40'
                            : 'border-border-default hover:border-accent-blue/40'
                        }`}
                      >
                        <img src={frameUrls[spot.id]} alt="" className="h-full w-full object-cover" />
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                          {spot.label}
                        </span>
                        {selectedId === spot.id ? (
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-accent-blue px-1.5 py-0.5 text-[10px] font-bold text-white">
                            Selected
                          </span>
                        ) : null}
                      </button>
                    ) : (
                      <VideoFrameTile
                        key={spot.id}
                        src={videoUrl}
                        fraction={spot.fraction}
                        selected={selectedId === spot.id}
                        label={spot.label}
                        onClick={() => pickVideoFrame(spot)}
                      />
                    ),
                  )
                : null}
              {pickedThumbs.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => applyThumb(tile.id, tile.url)}
                  className={`relative aspect-video overflow-hidden rounded-xl border text-left ${
                    selectedId === tile.id
                      ? 'border-accent-blue ring-2 ring-accent-blue/40'
                      : 'border-border-default hover:border-accent-blue/40'
                  }`}
                >
                  <img src={tile.url} alt="" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    {tile.label}
                  </span>
                  {selectedId === tile.id ? (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-accent-blue px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Selected
                    </span>
                  ) : null}
                </button>
              ))}
              <button
                type="button"
                onClick={() => thumbFileRef.current?.click()}
                disabled={thumbBusy || !projectId}
                className="flex aspect-video flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-default bg-input px-3 text-center text-sm font-semibold text-text-secondary hover:border-accent-blue/40 hover:text-text-primary disabled:opacity-50"
              >
                <span className="text-lg leading-none">+</span>
                {thumbBusy ? 'Uploading…' : 'Upload file'}
              </button>
              <button
                type="button"
                onClick={openLibraryPicker}
                disabled={!projectId}
                className="flex aspect-video flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-default bg-input px-3 text-center text-sm font-semibold text-text-secondary hover:border-accent-blue/40 hover:text-text-primary disabled:opacity-50"
              >
                From library
              </button>
            </div>
            <input
              ref={thumbFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                uploadThumbnailFile(file, '', 'Uploaded')
              }}
            />
            {libraryOpen ? (
              <div
                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
                onClick={() => setLibraryOpen(false)}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="library-thumb-title"
                  className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-2xl border border-border-default bg-panel p-5 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 id="library-thumb-title" className="font-heading text-lg font-semibold">
                        Choose from library
                      </h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        Images only. Click one to use it as the thumbnail.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLibraryOpen(false)}
                      className="rounded-lg border border-border-default px-3 py-1.5 text-sm text-text-secondary"
                    >
                      Close
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {libraryBusy ? (
                      <p className="py-10 text-center text-sm text-text-muted">Loading images…</p>
                    ) : libraryItems.length === 0 ? (
                      <p className="py-10 text-center text-sm text-text-muted">
                        No images in this project library yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {libraryItems.map((row) => (
                          <button
                            key={row.id}
                            type="button"
                            onClick={() => pickFromLibrary(row)}
                            className="overflow-hidden rounded-xl border border-border-default text-left transition hover:border-accent-blue/50"
                            title={row.title}
                          >
                            <span className="block aspect-square overflow-hidden bg-input">
                              <img src={row.url} alt="" className="h-full w-full object-cover" />
                            </span>
                            <span className="block truncate px-2 py-1.5 text-xs text-text-secondary">{row.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            <p className="mt-2 text-xs text-text-muted">
              {thumbBusy
                ? 'Saving thumbnail…'
                : 'Frames are stills from this video. Or upload a file / pick an image from the library. 16:9, under 2 MB.'}
            </p>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-text-tertiary">Playlist</span>
            <select value={playlistId} onChange={(e) => setPlaylistId(e.target.value)} className={fieldClass}>
              <option value="">None</option>
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.title || pl.id}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="text-sm font-medium">Altered or synthetic content</legend>
            <p className="mt-1 text-xs text-text-tertiary">
              Realistic people, places or events made or changed with AI. YouTube shows a label to viewers.
            </p>
            <div className="mt-1 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="ytAi" checked={synthetic === 'yes'} onChange={() => setSynthetic('yes')} />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="ytAi" checked={synthetic === 'no'} onChange={() => setSynthetic('no')} />
                No
              </label>
            </div>
          </fieldset>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={paidPromotion}
              onChange={(e) => setPaidPromotion(e.target.checked)}
            />
            Contains paid promotion (product placement, sponsorship or endorsement)
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-text-tertiary">Tags (comma separated)</span>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value.slice(0, 500))}
              placeholder="Add tag"
              className={fieldClass}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-text-tertiary">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-text-tertiary">Video language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={fieldClass}>
                {LANGUAGES.map((l) => (
                  <option key={l.id || 'select'} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-text-tertiary">Recording date</span>
              <input
                type="date"
                value={recordingDate}
                onChange={(e) => setRecordingDate(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-text-tertiary">License</span>
              <select value={license} onChange={(e) => setLicense(e.target.value)} className={fieldClass}>
                <option value="youtube">Standard YouTube License</option>
                <option value="creativeCommon">Creative Commons — Attribution</option>
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Notify subscribers
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={embeddable} onChange={(e) => setEmbeddable(e.target.checked)} />
            Allow embedding
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={publicStats} onChange={(e) => setPublicStats(e.target.checked)} />
            Show like count
          </label>
          <p className="text-xs text-text-tertiary">
            Subtitles, end screens, cards and comment settings are set in YouTube Studio after publishing.
          </p>
        </div>
      </details>
    </div>
  )
}
