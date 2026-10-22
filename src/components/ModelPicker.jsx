import { useEffect, useRef, useState } from 'react'
import { formatCredits } from '../utils/credits.js'

function ChevronDown({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-text-muted transition ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const defaultCost = (credits) => `From ${formatCredits(credits)} cr`

/**
 * Model dropdown with credits per option.
 * compact: one short trigger (title + cost on top, model name below) for toolbars; title is the visible caption.
 * dropUp: on lg screens the list opens upwards (for a bar pinned to the bottom of the screen).
 */
export default function ModelPicker({ models, value, onChange, costsByModel = {}, formatCost = defaultCost, label, compact = false, dropUp = false }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const selected = models.find((m) => m.id === value) || models[0]

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Keyed by ids: a page refresh hands over an equal but new array, which must not close an open list.
  const catalogKey = models.map((m) => m.id).join('|')
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close the popover when the model catalog changes.
    setOpen(false)
  }, [catalogKey])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-label={label ? `${label}: ${selected?.label || 'Select model'}` : undefined}
        aria-expanded={open}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border bg-input text-left transition-colors duration-200 ${
          compact ? 'min-h-[44px] px-3 py-1.5' : 'px-3 py-2.5'
        } ${
          open
            ? 'border-accent-blue ring-1 ring-accent-blue'
            : 'border-border-default hover:border-accent-blue/50'
        }`}
      >
        {compact ? (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs text-text-tertiary">
              {label}
              {costsByModel[selected?.id]?.credits ? ` · ${formatCost(costsByModel[selected.id].credits)}` : ''}
            </p>
            <p className="truncate text-sm font-semibold text-text-primary">{selected?.label || 'Select model'}</p>
          </div>
        ) : (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">
            {selected?.label || 'Select model'}
          </p>
          {selected?.strength ? (
            <p className="mt-0.5 truncate text-[11px] text-text-tertiary">{selected.strength}</p>
          ) : selected?.family ? (
            <p className="mt-0.5 truncate text-[11px] capitalize text-text-tertiary">
              {selected.family}
            </p>
          ) : null}
          {costsByModel[selected?.id]?.credits ? (
            <p className="mt-0.5 text-[11px] text-text-tertiary">
              {formatCost(costsByModel[selected.id].credits)}
            </p>
          ) : null}
        </div>
        )}
        <ChevronDown open={open} />
      </button>

      {open ? (
        <ul
          role="listbox"
          className={`absolute left-0 right-0 z-40 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border-default bg-panel p-1 shadow-xl shadow-black/40 ${
            compact ? 'min-w-[260px]' : ''
          } ${dropUp ? 'lg:bottom-full lg:mb-1.5 lg:mt-0' : ''}`}
        >
          {models.map((m) => {
            const active = m.id === value
            const isNew = m.isNew || m.source === 'provider'
            const locked = m.requiredPlan // { id, name }: the plan that unlocks this model
            return (
              <li key={m.id} role="option" aria-selected={active} aria-disabled={locked ? 'true' : undefined}>
                <button
                  type="button"
                  disabled={Boolean(locked)}
                  title={locked ? `Needs the ${locked.name} plan` : undefined}
                  onClick={() => {
                    onChange(m.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                    locked
                      ? 'cursor-not-allowed text-text-tertiary'
                      : active
                        ? 'cursor-pointer bg-accent-blue/15 text-link'
                        : 'cursor-pointer text-text-secondary hover:bg-elevated hover:text-text-primary'
                  }`}
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      active ? 'bg-accent-blue' : 'bg-text-muted/50'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <span>{m.label}</span>
                      {isNew ? (
                        <span className="rounded bg-accent-blue/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-link">
                          New
                        </span>
                      ) : null}
                      {locked ? (
                        <span className="inline-flex items-center gap-1 rounded border border-border-default px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <rect x="5" y="11" width="14" height="10" rx="2" />
                            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                          </svg>
                          {locked.name} plan
                        </span>
                      ) : null}
                    </span>
                    {m.strength ? (
                      <span
                        className={`mt-0.5 block text-[11px] ${
                          active ? 'text-link/80' : 'text-text-tertiary'
                        }`}
                      >
                        {m.strength}
                      </span>
                    ) : null}
                    {costsByModel[m.id]?.credits ? (
                      <span
                        className={`mt-1 block font-mono text-[11px] ${
                          active ? 'text-link/80' : 'text-text-tertiary'
                        }`}
                      >
                        {formatCost(costsByModel[m.id].credits)}
                      </span>
                    ) : m.pricing?.admartUnitPrice ? (
                      <span className="mt-1 block font-mono text-[11px] text-text-muted">
                        ~{formatCredits(m.pricing.admartUnitPrice)} cr
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
