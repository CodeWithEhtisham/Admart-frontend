import { formatCredits } from '../utils/credits'
import AgentCaptionsSelect from './AgentCaptionsSelect.jsx'
import AgentLanguageSelect from './AgentLanguageSelect.jsx'
import AgentLengthVoiceSelect from './AgentLengthVoiceSelect.jsx'
import AgentModelSelect from './AgentModelSelect.jsx'
import { primaryButton, secondaryButton } from './AgentBits.jsx'

/** "Make a Short about this": the Shorts agent's models, language, subtitles, length and voice, then start. Used by Trend Finder and the Growth Report. */
export default function AgentMakeShort({ shorts, topic, busy, onStart, onCancel, saveModels, saveConfig }) {
  return (
    <div className="mt-3 space-y-3 rounded-xl border border-accent-violet/40 bg-accent-violet/5 p-3">
      <p className="text-sm font-medium">Make a Short about this</p>
      <AgentModelSelect deployment={shorts} onSave={saveModels} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <AgentLanguageSelect deployment={shorts} onSave={saveConfig} />
        <AgentCaptionsSelect deployment={shorts} onSave={saveConfig} />
        <AgentLengthVoiceSelect deployment={shorts} onSave={saveConfig} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={primaryButton} disabled={Boolean(busy)} onClick={() => onStart(topic)}>
          {busy === topic ? 'Starting…' : 'Start the Short'}
        </button>
        <button type="button" className={secondaryButton} disabled={Boolean(busy)} onClick={onCancel}>
          Cancel
        </button>
        {shorts.estimatedCredits ? (
          <span className="text-xs text-text-tertiary">About {formatCredits(shorts.estimatedCredits)} credits. Refunded if it fails.</span>
        ) : null}
      </div>
    </div>
  )
}
