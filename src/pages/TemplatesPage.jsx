import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import { formatCredits, quoteCredits } from '../utils/credits.js'
import {
  clearPendingTemplateUse,
  getPendingTemplateUse,
  getTemplate,
  listTemplates,
  recordTemplateUse,
  setPendingTemplateUse,
} from '../utils/templates.js'

const MEDIA_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
]

const MODEL_OPTIONS = [
  { id: 'all', label: 'All models' },
  { id: 'GPT Image', label: 'GPT Image' },
  { id: 'Nanobanana Pro', label: 'Nanobanana Pro' },
  { id: 'Midjourney', label: 'Midjourney' },
  { id: 'Z Image Turbo', label: 'Z Image Turbo' },
  { id: 'Seedance', label: 'Seedance' },
  { id: 'other', label: 'Other' },
]

const SORT_OPTIONS = [
  { id: 'trending', label: 'Featured' },
  { id: 'uses', label: 'Most used' },
  { id: 'new', label: 'Newest' },
]

const CATEGORY_LABELS = { ad: 'Ad', reel: 'Reel', story: 'Story', product: 'Product', announce: 'Announcement', carousel: 'Carousel' }
const MEDIA_LABELS = Object.fromEntries(MEDIA_OPTIONS.map((item) => [item.id, item.label]))
const SORT_LABELS = Object.fromEntries(SORT_OPTIONS.map((item) => [item.id, item.label]))
const BRACKET_PLACEHOLDER_RE = /\[([^[\n\]]{1,80})\]/g
const HANDLEBARS_PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g

function normalizeFieldKey(key) {
  return String(key || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
}

function humanizeKey(key) {
  return normalizeFieldKey(key)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function normalizeTemplate(raw) {
  const config = raw?.templateConfig || raw?.template_config || {}
  const isVideo = Boolean(raw?.isVideo ?? raw?.is_video ?? config.kind === 'video')
  const prompt = config.prompt || config.promptTemplate || config.prompt_template || ''
  const negativePrompt = config.negativePrompt || config.negative_prompt || ''
  const settings =
    config.settings && typeof config.settings === 'object'
      ? config.settings
      : normalizeSettingsFromSource(config, raw)
  const quickFields = normalizeQuickFields(config)
  const sourceModelName =
    config.sourceModelName || config.source_model_name || config.sourceModel || config.source_model || ''
  const modelName = config.modelName || config.model_name || sourceModelName || config.model || 'Default model'
  return {
    id: String(raw?.id || ''),
    title: raw?.title || 'Untitled template',
    category: raw?.category || 'ad',
    format: raw?.format || (isVideo ? 'video' : 'image'),
    isVideo,
    kind: isVideo ? 'video' : 'image',
    previewUrl: raw?.previewUrl || raw?.preview_url || '',
    templateConfig: config,
    description: config.description || raw?.description || '',
    prompt,
    negativePrompt,
    capability: config.capability || (isVideo ? 'textToVideo' : 'textToImage'),
    model: config.model || '',
    modelName,
    sourceModelName,
    sourceUrl: config.sourceUrl || config.source_url || '',
    settings,
    quickFields,
    tags: Array.isArray(config.tags) ? config.tags : [],
    requiresSourceImage: Boolean(config.requiresSourceImage),
    usesCount: Number(raw?.usesCount ?? raw?.uses_count ?? 0),
    usesLast7d: Number(raw?.usesLast7d ?? raw?.uses_last_7d ?? 0),
    trending: Boolean(raw?.trending),
    estimatedCredits: raw?.estimatedCredits || config.estimatedCredits || null,
    createdAt: raw?.createdAt || raw?.created_at || null,
    author: config.author || null,
    videoUrl: config.videoUrl || '',
    source: config.source || '',
  }
}

function normalizeSettingsFromSource(config, raw) {
  const params = config.parameters || {}
  const out = {
    aspectRatio: raw?.aspectRatio || raw?.aspect_ratio || config.aspectRatio || config.aspect_ratio || '1:1',
    resolution: '1K',
    numImages: 1,
  }
  if (params.inference_steps != null) out.numInferenceSteps = Number(params.inference_steps)
  if (params.guidance_scale != null) out.guidanceScale = Number(params.guidance_scale)
  if (params.seed != null && params.seed !== 'random') out.seed = Number(params.seed)
  return out
}

function normalizeQuickFields(config) {
  const fields = new Map()
  const addField = (field = {}) => {
    const rawKey = field.rawKey || field.key
    const key = normalizeFieldKey(field.key)
    if (!key) return
    const current = fields.get(key) || {}
    fields.set(key, {
      key,
      rawKey,
      label: field.label || current.label || humanizeKey(key),
      placeholder: field.placeholder || field.default || current.placeholder || '',
      defaultValue: field.defaultValue ?? field.default ?? field.value ?? current.defaultValue ?? '',
      type: field.type || current.type || 'text',
    })
  }

  if (Array.isArray(config.quickFields)) {
    config.quickFields.forEach(addField)
  }
  if (Array.isArray(config.variables)) {
    config.variables.forEach((variable) =>
      addField({
        key: variable.key,
        rawKey: variable.key,
        label: variable.label,
        placeholder: variable.default,
        defaultValue: variable.default,
        type: variable.type,
      })
    )
  }
  return [...fields.values()]
}

function initialFieldValues(template) {
  const values = {}
  ;(template.quickFields || []).forEach((field) => {
    const value = field.defaultValue ?? field.default ?? ''
    values[field.key] = value
    if (field.rawKey) values[field.rawKey] = value
  })
  return values
}

function applyTemplateValues(prompt, values) {
  const lookup = (key) => {
    const normalized = normalizeFieldKey(key)
    const candidates = [key, normalized, String(key).toUpperCase(), String(key).toLowerCase()]
    for (const candidate of candidates) {
      const value = values?.[candidate]
      if (value && String(value).trim()) return String(value).trim()
    }
    return null
  }

  return String(prompt || '')
    .replace(BRACKET_PLACEHOLDER_RE, (match, key) => lookup(key) || match)
    .replace(HANDLEBARS_PLACEHOLDER_RE, (match, key) => lookup(key) || match)
}

function formatCount(value) {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '0'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

function isVideoUrl(url) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url || ''))
}

function aspectClass(aspect) {
  const value = String(aspect || '').toLowerCase()
  if (value.includes('9:16')) return 'aspect-[9/16]'
  if (value.includes('16:9')) return 'aspect-video'
  if (value.includes('4:5')) return 'aspect-[4/5]'
  if (value.includes('3:4')) return 'aspect-[3/4]'
  if (value.includes('4:3')) return 'aspect-[4/3]'
  return 'aspect-square'
}

function MediaPreview({ template, large = false }) {
  const previewUrl = template.previewUrl
  const isVideo = template.isVideo
  const hasVideo = Boolean(template.videoUrl || isVideoUrl(previewUrl))
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  const togglePlay = useCallback((event) => {
    event?.stopPropagation?.()
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }, [])

  const renderPreview = () => {
    if (isVideo && hasVideo) {
      return (
        <video
          ref={videoRef}
          key={template.videoUrl || previewUrl}
          src={template.videoUrl || previewUrl}
          poster={isVideoUrl(previewUrl) ? undefined : previewUrl}
          muted
          playsInline
          loop
          controls={large}
          preload={large ? 'auto' : 'metadata'}
          className="h-full w-full object-cover"
          onMouseEnter={(e) => {
            if (large) return
            setPlaying(true)
            e.currentTarget.play().catch(() => {})
          }}
          onMouseLeave={(e) => {
            if (large) return
            setPlaying(false)
            e.currentTarget.pause()
            e.currentTarget.currentTime = 0
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          autoPlay={large}
        />
      )
    }
    return <img src={previewUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
  }

  return (
    <div className={`relative w-full overflow-hidden bg-surface ${aspectClass(template.settings?.aspectRatio)}`}>
      {(hasVideo || previewUrl) ? (
        renderPreview()
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="font-heading text-lg font-bold text-text-primary">{template.title}</p>
          <p className="text-xs uppercase tracking-wide text-text-muted">{template.kind}</p>
        </div>
      )}

      <div className="absolute left-3 top-3">
        <span className="rounded-md border border-white/10 bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {template.modelName}
        </span>
      </div>

      {isVideo && hasVideo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            role="button"
            tabIndex={-1}
            title={playing ? 'Pause' : 'Play'}
            onClick={large ? undefined : togglePlay}
            className={`pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/55 text-sm text-white backdrop-blur-sm transition ${
              playing ? 'scale-90 opacity-0' : 'opacity-100'
            }`}
          >
            {playing && !large ? '❚❚' : '▶'}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-black/60 to-transparent p-2.5">
        {!large && (
          <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white/90">
            {template.kind}
          </span>
        )}
        {large && template.author?.name && (
          <a
            href={template.sourceUrl || '#'}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white/90 backdrop-blur-sm hover:text-white"
          >
            by {template.author.name}
          </a>
        )}
      </div>
    </div>
  )
}

function TemplateCard({ template, onOpen }) {
  return (
    <article className="mb-5 break-inside-avoid overflow-hidden rounded-xl border border-border-default bg-panel transition hover:-translate-y-0.5 hover:border-accent-blue/45 hover:shadow-lg">
      <button type="button" onClick={() => onOpen(template)} className="block w-full text-left">
        <MediaPreview template={template} />
        <div className="space-y-2.5 p-4">
          <h3 className="line-clamp-3 font-heading text-sm font-semibold leading-snug text-text-primary">
            {template.title}
          </h3>
          <div className="flex items-center justify-between gap-2 text-xs text-text-tertiary">
            {template.author?.name ? (
              <span className="flex min-w-0 items-center gap-1.5">
                {template.author.avatar ? (
                  <img
                    src={template.author.avatar}
                    alt=""
                    loading="lazy"
                    className="h-4 w-4 rounded-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <span className="inline-block h-4 w-4 rounded-full bg-accent-blue/25" />
                )}
                <span className="truncate">{template.author.name}</span>
              </span>
            ) : (
              <span>{CATEGORY_LABELS[template.category] || template.category}</span>
            )}
            <span className="flex items-center gap-1.5">
              <span>{formatCount(template.usesCount || 0)}</span>
              <span className="opacity-70">likes</span>
            </span>
          </div>
        </div>
      </button>
    </article>
  )
}

function TemplateSkeleton() {
  return (
    <div className="mb-5 break-inside-avoid overflow-hidden rounded-xl border border-border-default bg-panel">
      <div className="aspect-square animate-shimmer bg-elevated" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-shimmer rounded bg-elevated" />
        <div className="h-8 w-full animate-shimmer rounded bg-elevated" />
      </div>
    </div>
  )
}

function SettingInput({ name, value, onChange }) {
  const isNumber = typeof value === 'number' || name === 'numImages' || ['duration', 'seed'].includes(name)
  return (
    <label className="block">
      <span className="text-xs font-medium capitalize text-text-tertiary">{name}</span>
      <input
        type={isNumber ? 'number' : 'text'}
        min={isNumber ? 1 : undefined}
        value={value ?? ''}
        onChange={(e) => onChange(name, isNumber ? Number(e.target.value || 1) : e.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-border-default bg-input px-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/25"
      />
    </label>
  )
}

export default function TemplatesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const [media, setMedia] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')
  const [sort, setSort] = useState('trending')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  const [templates, setTemplates] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [totalCount, setTotalCount] = useState(0)
  const [imageCount, setImageCount] = useState(0)
  const [videoCount, setVideoCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState(null)
  const [fieldValues, setFieldValues] = useState({})
  const [draftPrompt, setDraftPrompt] = useState('')
  const [draftNegativePrompt, setDraftNegativePrompt] = useState('')
  const [draftSettings, setDraftSettings] = useState({})
  const [liveQuote, setLiveQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [usingTemplate, setUsingTemplate] = useState(false)
  const [resumeHandled, setResumeHandled] = useState(false)
  const modalRef = useRef(null)

  const fetchTemplates = useCallback(
    async ({ cursor = null, append = false } = {}) => {
      const params = {
        sort,
        cursor: cursor || undefined,
      }
      if (media !== 'all') params.media = media
      if (modelFilter !== 'all') params.model = modelFilter
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim()

      setError('')
      if (append) setLoadingMore(true)
      else setLoading(true)

      try {
        const payload = await listTemplates(params)
        const items = (payload.items || []).map(normalizeTemplate)
        setTemplates((current) => (append ? [...current, ...items] : items))
        setNextCursor(payload.nextCursor || null)
        setTotalCount(Number(payload.count || items.length))
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || 'Template library could not be loaded.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [debouncedSearch, media, modelFilter, sort]
  )

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  useEffect(() => {
    if (loading) return
    setImageCount(templates.filter((item) => !item.isVideo).length)
    setVideoCount(templates.filter((item) => item.isVideo).length)
  }, [loading, templates])

  const openTemplate = useCallback((rawTemplate, resume = null) => {
    const template = normalizeTemplate(rawTemplate)
    const values = resume?.values || initialFieldValues(template)
    const prompt = resume?.prompt || applyTemplateValues(template.prompt, values)
    setSelected(template)
    setFieldValues(values)
    setDraftPrompt(prompt)
    setDraftNegativePrompt(resume?.negativePrompt ?? template.negativePrompt)
    setDraftSettings({ ...template.settings, ...(resume?.settings || {}) })
    setLiveQuote(null)
    setModalError('')
  }, [])

  useEffect(() => {
    if (resumeHandled || loading) return
    const params = new URLSearchParams(location.search)
    const pending = getPendingTemplateUse()
    const resumeId = params.get('resumeTemplate') || pending?.id
    if (!resumeId) return

    let cancelled = false
    const existing = templates.find((template) => template.id === resumeId)
    const resumeTemplate = async () => {
      setResumeHandled(true)
      try {
        if (existing) {
          openTemplate(existing, pending)
        } else {
          const detail = await getTemplate(resumeId)
          if (!cancelled) openTemplate(detail, pending)
        }
        clearPendingTemplateUse()
      } catch (err) {
        console.error(err)
      }
    }
    resumeTemplate()
    return () => {
      cancelled = true
    }
  }, [loading, location.search, openTemplate, resumeHandled, templates])

  useEffect(() => {
    if (!selected) return
    if (!authLoaded || !isSignedIn) {
      setLiveQuote(null)
      return
    }

    let cancelled = false
    setQuoteLoading(true)
    quoteCredits({
      kind: selected.kind,
      capability: selected.capability,
      model: selected.model,
      settings: draftSettings,
    })
      .then((quote) => {
        if (!cancelled) setLiveQuote(quote)
      })
      .catch(() => {
        if (!cancelled) setLiveQuote(null)
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authLoaded, draftSettings, isSignedIn, selected])

  const filterSummary = [
    MEDIA_LABELS[media],
    modelFilter === 'all' ? null : modelFilter,
    SORT_LABELS[sort],
  ].filter(Boolean)

  const updateFieldValue = (key, value) => {
    const field = selected?.quickFields?.find((item) => item.key === key)
    const next = { ...fieldValues, [key]: value }
    if (field?.rawKey) next[field.rawKey] = value
    setFieldValues(next)
    setDraftPrompt(applyTemplateValues(selected?.prompt || '', next))
  }

  const updateSetting = (key, value) => {
    setDraftSettings((current) => ({ ...current, [key]: value }))
  }

  const resetSelectedPrompt = () => {
    if (!selected) return
    const values = initialFieldValues(selected)
    setFieldValues(values)
    setDraftPrompt(applyTemplateValues(selected.prompt, values))
    setDraftNegativePrompt(selected.negativePrompt)
    setDraftSettings(selected.settings)
  }

  const useSelectedTemplate = async () => {
    if (!selected || !draftPrompt.trim()) return
    setUsingTemplate(true)
    setModalError('')
    try {
      const payload = await recordTemplateUse(selected.id)
      clearPendingTemplateUse()
      const serverConfig = payload.templateConfig || selected.templateConfig || {}
      const kind = serverConfig.kind || selected.kind
      navigate(kind === 'video' ? '/video-gen' : '/image-gen', {
        state: {
          template: {
            ...serverConfig,
            id: selected.id,
            title: selected.title,
            kind,
            capability: serverConfig.capability || selected.capability,
            model: serverConfig.model || selected.model,
            sourceModel: serverConfig.sourceModel || selected.sourceModelName || selected.model,
            sourceModelName: serverConfig.sourceModelName || selected.sourceModelName || selected.modelName,
            prompt: draftPrompt,
            negativePrompt: draftNegativePrompt,
            settings: draftSettings,
            creditEstimate: selectedCredit(),
            requiresSourceImage: selected.requiresSourceImage,
          },
        },
      })
    } catch (err) {
      if (err.response?.status === 401) {
        setPendingTemplateUse({
          id: selected.id,
          prompt: draftPrompt,
          negativePrompt: draftNegativePrompt,
          settings: draftSettings,
          values: fieldValues,
          returnTo: `/templates?resumeTemplate=${selected.id}`,
        })
        navigate('/auth')
        return
      }
      console.error(err)
      setModalError(err.response?.data?.message || 'Could not open this template. Please try again.')
    } finally {
      setUsingTemplate(false)
    }
  }

  const selectedCredit = () => liveQuote?.credits || selected?.estimatedCredits

  const clearFilters = () => {
    setMedia('all')
    setModelFilter('all')
    setSearch('')
    setSort('trending')
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-base">
        <Topbar title="Templates" />

        <main className="space-y-6 p-7">
          <section className="relative overflow-hidden rounded-2xl border border-border-default bg-panel px-6 py-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-blue/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent-violet/15 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent-blue">
                  Meigen.ai Prompt Gallery
                </p>
                <h1 className="mt-2 font-heading text-3xl font-bold text-text-primary">
                  Find a prompt, personalize it, and generate
                </h1>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Community image and video prompts with their models. Edit the placeholders, check the credit
                  estimate, then open the generator.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[380px]">
                <div className="rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="font-heading text-2xl font-bold">{formatCount(totalCount)}</p>
                  <p className="text-xs text-text-tertiary">Templates</p>
                </div>
                <div className="rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="font-heading text-2xl font-bold">{formatCount(videoCount)}</p>
                  <p className="text-xs text-text-tertiary">Videos</p>
                </div>
                <div className="rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="font-heading text-2xl font-bold">{formatCount(imageCount)}</p>
                  <p className="text-xs text-text-tertiary">Images</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-xl border border-border-default bg-panel p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex flex-wrap gap-2">
                  {MEDIA_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMedia(item.id)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        media === item.id
                          ? 'bg-accent-blue text-white'
                          : 'border border-border-default bg-surface text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-[180px_160px_minmax(220px,1fr)] lg:ml-auto">
                  <select
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                    className="h-11 rounded-lg border border-border-default bg-input px-3 text-sm text-text-primary outline-none focus:border-accent-blue"
                    aria-label="Filter by model"
                  >
                    {MODEL_OPTIONS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-11 rounded-lg border border-border-default bg-input px-3 text-sm text-text-primary outline-none focus:border-accent-blue"
                    aria-label="Sort templates"
                  >
                    {SORT_OPTIONS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search prompt, topic, style..."
                    className="h-11 rounded-lg border border-border-default bg-input px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-blue"
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-text-tertiary">
                <span>{filterSummary.join(' / ')}</span>
                <span>{templates.length} shown{nextCursor ? ` of ${totalCount}` : ''}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => fetchTemplates()}
                    className="rounded-lg border border-error/40 px-3 py-1.5 font-semibold transition hover:bg-error/10"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5">
              {loading ? (
                <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 2xl:columns-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <TemplateSkeleton key={index} />
                  ))}
                </div>
              ) : templates.length === 0 ? (
                <div className="rounded-xl border border-border-default bg-panel p-12 text-center">
                  <h2 className="font-heading text-xl font-semibold text-text-primary">No templates found</h2>
                  <p className="mt-2 text-sm text-text-secondary">Try another filter or search term.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 2xl:columns-4">
                    {templates.map((template) => (
                      <TemplateCard key={template.id} template={template} onOpen={openTemplate} />
                    ))}
                  </div>

                  {nextCursor && (
                    <div className="mt-2 flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => fetchTemplates({ cursor: nextCursor, append: true })}
                        disabled={loadingMore}
                        className="rounded-lg border border-border-default bg-panel px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:border-accent-blue/45 disabled:opacity-60"
                      >
                        {loadingMore ? 'Loading...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-modal-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSelected(null)
          }}
        >
          <div
            ref={modalRef}
            className="mx-auto grid max-h-[calc(100vh-2rem)] w-full max-w-6xl grid-rows-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-xl border border-border-default bg-panel shadow-2xl lg:grid-cols-[minmax(0,1fr)_440px] lg:grid-rows-[minmax(0,1fr)]"
          >
            <div className="min-h-0 overflow-y-auto border-b border-border-default p-5 lg:border-b-0 lg:border-r">
              <MediaPreview template={selected} large />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs text-text-tertiary">Model</p>
                  <p className="mt-1 break-words text-sm font-semibold text-text-primary">{selected.modelName}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs text-text-tertiary">Capability</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{selected.capability}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs text-text-tertiary">Estimated credits</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-accent-blue">
                    {quoteLoading ? 'Checking...' : `${formatCredits(selectedCredit())} cr`}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-surface p-3">
                <p className="text-xs font-semibold uppercase text-text-muted">Generator model id</p>
                <p className="mt-1 break-all font-mono text-xs text-text-secondary">{selected.model}</p>
              </div>

              {selected.author?.name && (
                <div className="mt-3 rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs font-semibold uppercase text-text-muted">Source</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    {selected.author.avatar && (
                      <img
                        src={selected.author.avatar}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <span className="font-medium text-text-primary">{selected.author.name}</span>
                    {selected.author.username && <span>@{selected.author.username}</span>}
                    {selected.sourceUrl && (
                      <a
                        href={selected.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto rounded-md border border-border px-2 py-1 font-semibold text-accent-blue transition hover:bg-accent-blue/10"
                      >
                        View original
                      </a>
                    )}
                  </div>
                </div>
              )}

              {selected.requiresSourceImage && (
                <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
                  <p className="font-semibold text-warning">Source image needed in the generator</p>
                  <p className="mt-1 text-text-secondary">
                    The prompt will open with this template, then upload your image there.
                  </p>
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-accent-blue">
                      {CATEGORY_LABELS[selected.category] || selected.category} · {selected.format}
                    </p>
                    <h2 id="template-modal-title" className="mt-1 font-heading text-2xl font-bold text-text-primary">
                      {selected.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded-lg border border-border-default bg-surface px-3 py-1.5 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
                  >
                    Close
                  </button>
                </div>

                {selected.quickFields.length > 0 && (
                  <div className="rounded-lg border border-border-default bg-surface p-4">
                    <p className="text-sm font-semibold text-text-primary">Personalize the template</p>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                      Fill in your keywords, names and details — they are inserted into the prompt below.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {selected.quickFields.map((field) => (
                        <label key={field.key} className="block">
                          <span className="text-xs font-medium text-text-tertiary">{field.label}</span>
                          <input
                            type="text"
                            value={fieldValues[field.key] || ''}
                            onChange={(e) => updateFieldValue(field.key, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            className="mt-1 h-10 w-full rounded-lg border border-border-default bg-input px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/25"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <label className="block">
                  <span className="text-sm font-semibold text-text-primary">Editable Prompt</span>
                  <textarea
                    value={draftPrompt}
                    onChange={(e) => setDraftPrompt(e.target.value)}
                    rows={9}
                    className="mt-2 w-full resize-y rounded-lg border border-border-default bg-input px-4 py-3 text-sm leading-6 text-text-primary outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/25"
                  />
                </label>

                {(selected.negativePrompt || draftNegativePrompt) && (
                  <label className="block">
                    <span className="text-sm font-semibold text-text-primary">Negative Prompt</span>
                    <textarea
                      value={draftNegativePrompt}
                      onChange={(e) => setDraftNegativePrompt(e.target.value)}
                      rows={3}
                      className="mt-2 w-full resize-y rounded-lg border border-border-default bg-input px-4 py-3 text-sm leading-6 text-text-primary outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/25"
                    />
                  </label>
                )}

                <div className="rounded-lg border border-border-default bg-surface p-4">
                  <p className="text-sm font-semibold text-text-primary">Settings</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {Object.keys(draftSettings).length ? (
                      Object.entries(draftSettings).map(([key, value]) => (
                        <SettingInput key={key} name={key} value={value} onChange={updateSetting} />
                      ))
                    ) : (
                      <p className="text-sm text-text-secondary">Default generator settings</p>
                    )}
                  </div>
                </div>

                {liveQuote?.creditsAfter != null && (
                  <div className="rounded-lg border border-accent-blue/30 bg-accent-blue/10 p-4 text-sm">
                    <p className="font-semibold text-accent-blue">Live credit check</p>
                    <p className="mt-1 text-text-secondary">
                      Cost {formatCredits(liveQuote.credits)} cr. After generation: {formatCredits(liveQuote.creditsAfter)} cr.
                    </p>
                  </div>
                )}

                {modalError && (
                  <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">{modalError}</div>
                )}
              </div>

              <div className="space-y-3 border-t border-border-default p-5">
                <button
                  type="button"
                  onClick={useSelectedTemplate}
                  disabled={!draftPrompt.trim() || usingTemplate}
                  className="flex w-full items-center justify-center rounded-lg bg-accent-blue py-3 text-sm font-semibold text-white transition hover:bg-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {usingTemplate
                    ? 'Opening...'
                    : `Generate with ${selected.modelName || 'this template'}`}
                </button>
                <button
                  type="button"
                  onClick={resetSelectedPrompt}
                  className="w-full rounded-lg border border-border-default bg-surface py-3 text-sm font-semibold text-text-primary transition hover:border-accent-blue/45"
                >
                  Reset Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
