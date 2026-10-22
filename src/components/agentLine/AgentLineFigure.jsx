import { useEffect, useRef } from 'react'
import '../iso/iso.css'
import './agentLine.css'
import { GEOMETRY, SVG } from './art'
import { mountAgentLine } from './live'
import { PLATFORMS, STAGES, readoutAt } from './model'

// Stem under each label, staggered so the labels of neighbouring stations don't collide.
const PIN_STEMS = [40, 26, 64, 52, 8, 46, 30, 30]
// Sideways shift of a label off its stem, where two stations sit close together on screen.
const PIN_SHIFT = [34, -46, 0, 0, 0, 0, 0, 0]

export default function AgentLineFigure() {
  const root = useRef(null)
  const stage = useRef(null)
  const readout = useRef(null)

  // The art is written once by the effect, so a re-render of the page never swaps the nodes the loop moves.
  useEffect(() => {
    stage.current.innerHTML = SVG
    return mountAgentLine(stage.current, readout.current, root.current)
  }, [])

  return (
    <div ref={root} className="iso al" data-theme="dark">
      <figure className="iso-figure">
        <div className="iso-plate">
          <div className="iso-plate-corners" aria-hidden="true">
            <span className="iso-plate-corner" data-corner="fig">How an agent works</span>
            <span className="iso-plate-corner" data-corner="title">One run, start to finish</span>
            <span className="iso-plate-corner" data-corner="hint">Hover or tap a step</span>
            <span className="iso-plate-corner" data-corner="readout" ref={readout}>
              {readoutAt(0)}
            </span>
          </div>
          <div className="al-canvas">
            <div
              ref={stage}
              className="iso-stage al-stage"
              tabIndex={0}
              role="slider"
              aria-label="One Admart agent run: arrow keys move from step to step"
              aria-valuemin={0}
              aria-valuemax={30}
              aria-valuenow={0}
            />
            <div className="al-pins">
              {STAGES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className="al-pin"
                  data-stage={i}
                  data-stage-go=""
                  style={{
                    left: `${GEOMETRY.LABELS[i][0]}%`,
                    top: `${GEOMETRY.LABELS[i][1]}%`,
                    '--stem': `${PIN_STEMS[i]}px`,
                    '--shift': `${PIN_SHIFT[i]}px`,
                  }}
                  aria-label={`Step ${i + 1}: ${s.agent}, ${s.title}`}
                >
                  <span className="al-pin-tag">
                    <span className="al-pin-n">{i + 1}</span>
                    <span className="al-pin-name">{s.pin}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <ol className="al-steps">
          {STAGES.map((s, i) => (
            <li key={s.id}>
              <button type="button" className="al-step" data-stage={i} data-stage-go="">
                <span className="al-step-head">
                  <span className="al-pin-n">{i + 1}</span>
                  <span className="al-step-agent">{s.agent}</span>
                </span>
                <span className="al-step-title">{s.title}</span>
                <span className="al-step-text">{s.text}</span>
                {s.id === 'publish' && (
                  <span className="al-step-platforms">
                    {PLATFORMS.map((p) => (
                      <span key={p.id} className="al-swatch" style={{ background: p.color }} title={p.name} />
                    ))}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>
      </figure>
    </div>
  )
}
