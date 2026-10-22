// Moves the agent-line figure: an idle tour through one run, pointer scrubbing, arrow keys between stages.
import { cylinder, depthOf, extrude, iso, lineOnTop, solidSvg, translateAlong } from '../iso/iso-kit.mjs'
import { GEOMETRY as G } from './art'
import { BELT, LOOP, MAILBOX_X, MAILBOX_YS, PLATFORMS, SHUTTLE_X, STAGES, STEPS, STOPS, poseAt, readoutAt, stageAt } from './model'

const P = G.P
const IDLE_MS = 4000

function needleAt(turn) {
  const a = turn * G.TRIP * Math.PI * 2
  const [x, y] = G.DIAL
  return lineOnTop(
    [x - Math.sin(a) * 2.6, y + Math.cos(a) * 2.6],
    [x + Math.sin(a) * (G.DIAL_R - 3.4), y - Math.cos(a) * (G.DIAL_R - 3.4)],
    G.DIAL_TOP + 0.2,
    P,
  )
}

// The Trend Finder antenna at an angle, as figures/agent-line/build.mjs draws it.
function antennaAt(angle) {
  const { x, y, mast } = G.RADAR
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const corner = (u, v) => [x + u * c - v * s, y + u * s + v * c]
  const bar = [corner(-14, -2), corner(14, -2), corner(14, 2), corner(-14, 2)]
  const tip = corner(12, 0)
  return (
    solidSvg(extrude(bar, mast + 3, 2.4, P), { tone: 'hi', crease: 'lo' }) +
    solidSvg(cylinder(tip[0], tip[1], 2.2, mast + 5.4, 2.4, P, 16), { tone: 'mid' })
  )
}

function slatsAt(offset) {
  const out = []
  const shift = ((offset % G.SLAT_GAP) + G.SLAT_GAP) % G.SLAT_GAP
  for (let x = BELT.x0 + 8 + shift; x < BELT.x1 - 6; x += G.SLAT_GAP) out.push(lineOnTop([x, -12, 0], [x, 12], BELT.top, P))
  return out.join('')
}

// When a station starts working: the stage it does its job in, past the walk to it.
const STAGE_START = STAGES.map((s) => STEPS.find((step) => step.id === s.steps.find((id) => !id.startsWith('to-'))).from + 0.01)

export function mountAgentLine(stage, readout, root) {
  const marks = [...root.querySelectorAll('[data-stage]')]
  let active = -2
  const svg = stage.querySelector('svg')
  const part = (name) => svg.querySelector(`[data-part="${name}"]`)
  const el = {
    needle: part('needle'),
    antenna: part('antenna'),
    radarLamp: part('radar-lamp'),
    trendCard: part('trend-card'),
    slats: part('slats'),
    packet: part('packet'),
    plain: part('packet-plain'),
    done: part('packet-done'),
    sheet: part('sheet'),
    voice: part('voice'),
    image: part('image'),
    head: part('head'),
    mic: part('mic-level'),
    flash: part('flash'),
    hood: part('hood'),
    glow: part('glow'),
    bar: part('bar'),
    lamp: part('lamp'),
    button: part('button'),
    buttonLit: part('button-lit'),
    shuttle: part('shuttle'),
    copy: part('copy'),
  }
  const vu = [...svg.querySelectorAll('[data-vu] > .iso-solid')]
  const flags = PLATFORMS.map((_, i) => part(`flag-${i}`))
  const flagColors = flags.map((f) => f.querySelector('.al-flag'))
  const beltSlot = svg.querySelector('[data-slot="belt"]')
  const right = svg.querySelector('[data-sort="right"]')
  const mailboxes = [...right.querySelectorAll('[data-mailbox]')].map((node, i) => ({
    node,
    key: depthOf([MAILBOX_X, MAILBOX_YS[i], 0], P),
  }))
  const still = matchMedia('(prefers-reduced-motion: reduce)')

  let t = 0
  let target = 0
  let touring = !still.matches
  let visible = false
  let frame = 0
  let last = 0
  let idle = 0
  let order = ''
  let lastAngle = null
  const set = (node, name, value) => {
    if (node.getAttribute(name) !== value) node.setAttribute(name, value)
  }
  const fade = (node, value) => set(node, 'opacity', String(Math.round(value * 100) / 100))

  function place(pose) {
    // The packet rides the belt, then the shuttle: it is drawn in whichever slot it physically sits in.
    const shuttleKey = depthOf([SHUTTLE_X, pose.shuttleY, 0], P)
    const items = [{ node: el.shuttle, key: shuttleKey }, ...mailboxes].sort((a, b) => a.key - b.key)
    const next = `${pose.onShuttle}:${pose.copyAt}:${items.map((i) => i.node.dataset.mailbox ?? 's').join('')}`
    if (next === order) return
    order = next
    for (const item of items) {
      right.appendChild(item.node)
      if (item.node === el.shuttle && pose.onShuttle) right.appendChild(el.packet)
      // The copy passes over the mailbox it drops into, so it is drawn just after it.
      if (item.node.dataset.mailbox === String(pose.copyAt)) right.appendChild(el.copy)
    }
    if (!pose.onShuttle) beltSlot.after(el.packet)
  }

  function draw() {
    const pose = poseAt(t)
    // The antenna turns all the time; only redraw it when it has moved enough to see.
    const angle = Math.round(pose.antenna * 120) / 120
    if (angle !== lastAngle) {
      lastAngle = angle
      el.antenna.innerHTML = antennaAt(angle)
    }
    fade(el.radarLamp, pose.scanning ? 0.6 + 0.4 * Math.sin(t * 14) : 0)
    fade(el.trendCard, pose.found)
    set(el.needle, 'd', needleAt(pose.dial))
    set(el.slats, 'd', slatsAt(pose.belt))
    set(el.packet, 'transform', translateAlong(P, [pose.x, pose.y, pose.z]))
    fade(el.packet, pose.shown)
    fade(el.plain, 1 - pose.done)
    fade(el.done, pose.done)
    fade(el.sheet, pose.sheet)
    fade(el.voice, pose.voice)
    fade(el.image, pose.image)
    set(el.head, 'transform', translateAlong(P, [0, 0, -G.HEAD_TRAVEL * pose.head]))
    fade(el.mic, pose.mic)
    vu.forEach((node, i) => {
      const on = pose.mic * (0.75 + 0.25 * Math.sin(t * 23 + i)) * vu.length > i
      if (on !== node.hasAttribute('data-lit')) node.toggleAttribute('data-lit', on)
    })
    fade(el.flash, pose.flash)
    set(el.hood, 'transform', translateAlong(P, [0, 0, -G.HOOD_TRAVEL * pose.hood]))
    fade(el.glow, pose.glow)
    set(el.bar, 'transform', translateAlong(P, [0, 0, G.BAR_TRAVEL * pose.bar]))
    fade(el.lamp, pose.waiting ? 0.5 + 0.5 * Math.sin(t * 6) : pose.bar)
    set(el.button, 'transform', translateAlong(P, [0, 0, -1.6 * pose.approve]))
    fade(el.buttonLit, Math.max(pose.approve, pose.waiting ? 0.35 : 0))
    set(el.shuttle, 'transform', translateAlong(P, [0, pose.shuttleY, 0]))
    // A copy slides off the shuttle over the mailbox, then drops through its slot.
    const copyX = SHUTTLE_X + (MAILBOX_X - SHUTTLE_X) * pose.copy
    set(el.copy, 'transform', translateAlong(P, [copyX, pose.shuttleY, BELT.top + 2 - 6 * pose.sink]))
    fade(el.copy, pose.copyAt >= 0 ? 1 - pose.sink : 0)
    flags.forEach((flag, i) => {
      set(flag, 'transform', translateAlong(P, [0, 0, 11 * pose.flags[i]]))
      fade(flagColors[i], pose.flags[i])
    })
    place(pose)
    // Light the label on the machine and the step in the guide for the station at work.
    const now = stageAt(t)
    if (now !== active) {
      active = now
      marks.forEach((node) => node.toggleAttribute('data-active', Number(node.dataset.stage) === now))
    }
    const text = readoutAt(t)
    if (readout && readout.textContent !== text) readout.textContent = text
    set(stage, 'aria-valuenow', String(Math.round(t * 10) / 10))
    set(stage, 'aria-valuetext', text)
  }

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60
    last = now
    if (touring) target += dt
    t = still.matches ? target : t + (target - t) * (1 - Math.exp(-dt / 0.22))
    if (Math.abs(target - t) < 0.001) t = target
    draw()
    frame = visible && (touring || t !== target) ? requestAnimationFrame(tick) : 0
  }
  const run = () => {
    if (!frame && visible) {
      last = 0
      frame = requestAnimationFrame(tick)
    }
  }
  const steer = (next) => {
    if (touring) {
      t %= LOOP
      target = t
    }
    touring = false
    target = Math.min(LOOP - 0.01, Math.max(0, next))
    clearTimeout(idle)
    idle = setTimeout(() => {
      touring = !still.matches
      run()
    }, IDLE_MS)
    run()
  }

  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting
      if (visible) run()
    },
    { rootMargin: '120px 0px' },
  )
  observer.observe(stage)

  const onMove = (event) => {
    if (event.pointerType === 'touch') return
    const box = svg.getBoundingClientRect()
    // Scrub by where the pointer sits over the machine, left (schedule) to right (mailboxes).
    const from = iso([BELT.x0, 0, 0], P)[0] / svg.viewBox.baseVal.width
    const to = iso([MAILBOX_X, 0, 0], P)[0] / svg.viewBox.baseVal.width
    const share = Math.min(1, Math.max(0, ((event.clientX - box.left) / box.width - from) / (to - from)))
    steer(share * LOOP)
  }
  const onKey = (event) => {
    const now = touring ? t % LOOP : target
    let to = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') to = STOPS.find((s) => s > now + 0.05) ?? STOPS[0]
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') to = [...STOPS].reverse().find((s) => s < now - 0.05) ?? STOPS[STOPS.length - 1]
    if (event.key === 'Home') to = STOPS[0]
    if (event.key === 'End') to = STOPS[STOPS.length - 1]
    if (to === null) return
    event.preventDefault()
    steer(to)
  }
  const onPick = (event) => {
    const pick = event.target.closest('[data-stage-go]')
    if (pick) steer(STAGE_START[Number(pick.dataset.stage)])
  }
  stage.addEventListener('pointermove', onMove)
  stage.addEventListener('keydown', onKey)
  root.addEventListener('click', onPick)

  // Reduced motion: one still pose with every stage done and every flag up.
  if (still.matches) target = t = STOPS[STOPS.length - 1] + 1.2
  draw()

  return () => {
    cancelAnimationFrame(frame)
    clearTimeout(idle)
    observer.disconnect()
    stage.removeEventListener('pointermove', onMove)
    stage.removeEventListener('keydown', onKey)
    root.removeEventListener('click', onPick)
  }
}
