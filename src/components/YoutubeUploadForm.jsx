import { useEffect, useRef, useState } from 'react'
import { listYoutubePlaylists, suggestYoutubeCopy } from '../utils/projects.js'
import { uploadLibraryMedia } from '../utils/library.js'

const STEPS = [
  { id: 'details', label: 'Details' },
  { id: 'elements', label: 'Video elements' },
  { id: 'checks', label: 'Checks' },
  { id: 'visibility', label: 'Visibility' },
]

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

function StudioLater({ title, children }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-3 py-3">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="mt-1 text-xs text-text-muted">{children}</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
        YouTube Studio after publish
      </p>
    </div>
  )
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
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState((initialTitle || '').slice(0, 100))
  const [description, setDescription] = useState(initialDescription || '')
  const [tags, setTags] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [category, setCategory] = useState('22')
  const [thumbnail, setThumbnail] = useState(initialThumbnail || '')
  const [thumbBusy, setThumbBusy] = useState(false)
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
  const [publishAt, setPublishAt] = useState('')
  const [recordingDate, setRecordingDate] = useState('')
  const [suggestBusy, setSuggestBusy] = useState(false)

  const onPayloadChangeRef = useRef(onPayloadChange)
  onPayloadChangeRef.current = onPayloadChange

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
    const scheduled = Boolean(publishAt) && !Number.isNaN(new Date(publishAt).getTime())
    onPayloadChangeRef.current({
      title,
      description,
      tags,
      privacyStatus: scheduled ? 'private' : privacy,
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
      publishAt: scheduled ? new Date(publishAt).toISOString() : undefined,
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
    publishAt,
    recordingDate,
    playlistId,
  ])

  const stepId = STEPS[step].id

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
    <div className="space-y-4">
      <ol className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => setStep(i)}
              className={`w-full rounded-lg px-1 py-2 ${
                i === step ? 'bg-elevated text-text-primary' : 'text-text-muted'
              }`}
            >
              <span
                className={`mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                  i === step ? 'border-text-primary' : 'border-border'
                }`}
              >
                {i + 1}
              </span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      {stepId === 'details' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Details</p>
            <button
              type="button"
              onClick={suggestCopy}
              disabled={suggestBusy || !projectId}
              className="rounded-lg border border-border-default px-3 py-1.5 text-xs font-semibold text-text-secondary disabled:opacity-50"
            >
              {suggestBusy ? 'Suggesting…' : 'Suggest with AI'}
            </button>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-tertiary">Title (required)</label>
            <input
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
            />
            <p className="mt-1 text-right font-mono text-[10px] text-text-muted">{title.length}/100</p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-tertiary">Description</label>
            <textarea
              rows={5}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video"
              className={`${fieldClass} resize-y`}
            />
            <p className="mt-1 text-right font-mono text-[10px] text-text-muted">{description.length}/5000</p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-tertiary">Thumbnail</label>
            {thumbnail ? (
              <img src={thumbnail} alt="" className="mb-2 h-24 w-auto rounded-lg border border-border-default object-cover" />
            ) : videoUrl ? (
              <video src={videoUrl} className="mb-2 h-24 w-auto rounded-lg border border-border-default object-cover" muted />
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-xs text-text-secondary"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                setThumbBusy(true)
                onError?.('')
                try {
                  const asset = await uploadLibraryMedia(file)
                  setThumbnail(asset?.sourceUrl || asset?.thumbnailUrl || '')
                } catch (err) {
                  onError?.(err.response?.data?.message || 'Could not upload thumbnail.')
                } finally {
                  setThumbBusy(false)
                }
              }}
            />
            <p className="mt-1 text-xs text-text-muted">
              {thumbBusy ? 'Uploading…' : 'Upload file. Select-from-video and A/B tests stay in Studio.'}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-tertiary">Playlists</label>
            <select value={playlistId} onChange={(e) => setPlaylistId(e.target.value)} className={fieldClass}>
              <option value="">Select</option>
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.title || pl.id}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 rounded-lg border border-border px-3 py-3">
            <p className="text-sm font-medium">Audience</p>
            <p className="text-xs text-text-muted">Is this video made for kids? (required)</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="ytKids" checked={kids === 'yes'} onChange={() => setKids('yes')} />
              Yes, it&apos;s made for kids
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="ytKids" checked={kids === 'no'} onChange={() => setKids('no')} />
              No, it&apos;s not made for kids
            </label>
          </div>

          <StudioLater title="Age restriction (advanced)">
            Restrict to viewers over 18. YouTube does not allow this on the upload API.
          </StudioLater>

          <div className="space-y-2 rounded-lg border border-border px-3 py-3">
            <p className="text-sm font-medium">Paid promotion</p>
            <p className="text-xs text-text-muted">
              If you accepted anything of value from a third party to make your video, you must let us know.
              We&apos;ll show viewers a message that tells them your video contains paid promotion.
            </p>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={paidPromotion}
                onChange={(e) => setPaidPromotion(e.target.checked)}
              />
              My video contains paid promotion like a product placement, sponsorship, or endorsement
            </label>
          </div>

          <div className="space-y-2 rounded-lg border border-border px-3 py-3">
            <p className="text-sm font-medium">Altered content</p>
            <p className="text-xs text-text-muted">
              Was AI used to generate or edit your content in any of the following ways? Realistic sounds or
              visuals that were made or edited with AI.
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-text-muted">
              <li>Makes a real person appear to say or do something they didn&apos;t say or do</li>
              <li>Alters footage of a real event or place</li>
              <li>Generates a realistic-looking scene that didn&apos;t actually occur</li>
            </ul>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="ytAi" checked={synthetic === 'yes'} onChange={() => setSynthetic('yes')} />
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="ytAi" checked={synthetic === 'no'} onChange={() => setSynthetic('no')} />
              No
            </label>
          </div>

          <StudioLater title="Collaboration">Invite a collaborator so the video can appear on another channel.</StudioLater>
          <StudioLater title="Automatic chapters">Allow automatic chapters, or add timestamps in the description.</StudioLater>
          <StudioLater title="Featured places">Allow automatic places for restaurants and shops shown in the video.</StudioLater>
          <StudioLater title="Automatic concepts">Allow automatic concepts in the description.</StudioLater>

          <div>
            <label className="mb-1 block text-xs text-text-tertiary">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value.slice(0, 500))}
              placeholder="Add tag"
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-text-muted">Enter a comma after each tag. {tags.length}/500</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-text-tertiary">Video language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={fieldClass}>
                {LANGUAGES.map((l) => (
                  <option key={l.id || 'select'} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <StudioLater title="Caption certification">None. Upload captions in Studio after the video is live.</StudioLater>
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-tertiary">Recording date</label>
            <input type="date" value={recordingDate} onChange={(e) => setRecordingDate(e.target.value)} className={fieldClass} />
          </div>
          <StudioLater title="Video location">Searchable filming location is set in Studio.</StudioLater>

          <div>
            <label className="mb-1 block text-xs text-text-tertiary">License</label>
            <select value={license} onChange={(e) => setLicense(e.target.value)} className={fieldClass}>
              <option value="youtube">Standard YouTube License</option>
              <option value="creativeCommon">Creative Commons — Attribution</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={embeddable} onChange={(e) => setEmbeddable(e.target.checked)} />
            Allow embedding
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Publish to subscriptions feed and notify subscribers
          </label>

          <StudioLater title="Shorts remixing">
            Allow video and audio remixing, audio only, or don&apos;t allow remixing.
          </StudioLater>

          <div>
            <label className="mb-1 block text-xs text-text-tertiary">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-text-muted">Add your video to a category so viewers can find it more easily.</p>
          </div>
          {category === '20' ? (
            <StudioLater title="Game title (optional)">Game title is not on the upload API. Set it in Studio.</StudioLater>
          ) : null}

          <StudioLater title="Comments and ratings">
            Comments on/hold/off, moderation, who can comment, and sort order. Like counts below are live.
          </StudioLater>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={publicStats} onChange={(e) => setPublicStats(e.target.checked)} />
            Show how many viewers like this video
          </label>
        </div>
      ) : null}

      {stepId === 'elements' ? (
        <div className="space-y-3">
          <div>
            <h3 className="font-heading text-base font-semibold">Video elements</h3>
            <p className="mt-1 text-sm text-text-muted">
              Use cards and an end screen to show viewers related videos, websites, and calls to action.
            </p>
          </div>
          <StudioLater title="Subtitles">Reach a broader audience by adding subtitles to your video.</StudioLater>
          <StudioLater title="End screen">Promote related content at the end of your video.</StudioLater>
          <StudioLater title="Cards">Promote related content during your video.</StudioLater>
        </div>
      ) : null}

      {stepId === 'checks' ? (
        <div className="space-y-3">
          <h3 className="font-heading text-base font-semibold">Checks</h3>
          <p className="text-sm text-text-muted">
            YouTube checks the video for copyright and other issues after upload. Admart cannot run those checks
            here.
          </p>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-3 text-sm">
            <span>Copyright</span>
            <span className="text-text-muted">Runs on YouTube</span>
          </div>
        </div>
      ) : null}

      {stepId === 'visibility' ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading text-base font-semibold">Visibility</h3>
            <p className="mt-1 text-sm text-text-muted">Choose when to publish and who can see your video.</p>
          </div>
          <div className="space-y-2 rounded-lg border border-border px-3 py-3">
            <p className="text-sm font-medium">Save or publish</p>
            {[
              ['private', 'Private', 'Only you and people you choose can watch your video.'],
              ['unlisted', 'Unlisted', 'Anyone with the video link can watch your video.'],
              ['public', 'Public', 'Everyone can watch your video.'],
            ].map(([id, label, hint]) => (
              <label key={id} className="flex cursor-pointer items-start gap-2 rounded-lg p-1 text-sm">
                <input
                  type="radio"
                  name="ytPrivacy"
                  className="mt-1"
                  checked={!publishAt && privacy === id}
                  onChange={() => {
                    setPrivacy(id)
                    if (id !== 'private') setPublishAt('')
                  }}
                />
                <span>
                  <span className="block font-medium">{label}</span>
                  <span className="text-xs text-text-muted">{hint}</span>
                </span>
              </label>
            ))}
            <StudioLater title="Set as instant Premiere">Premieres are not on the upload API.</StudioLater>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-tertiary">Schedule</label>
            <input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => {
                const next = e.target.value
                setPublishAt(next)
                if (next) setPrivacy('private')
              }}
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-text-muted">Select a date to make your video public. Stays private until then.</p>
          </div>
          <div className="rounded-lg border border-border bg-input px-3 py-3 text-xs text-text-muted">
            <p className="font-medium text-text-primary">Before you publish</p>
            <p className="mt-2">Do kids appear in this video? Follow YouTube policies that protect minors.</p>
            <p className="mt-1">Looking for overall content guidance? Follow Community Guidelines.</p>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end gap-2 pt-1">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-lg border border-border-default px-3 py-1.5 text-sm text-text-secondary"
          >
            Back
          </button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded-lg bg-elevated px-3 py-1.5 text-sm font-semibold"
          >
            Next
          </button>
        ) : null}
      </div>
    </div>
  )
}
