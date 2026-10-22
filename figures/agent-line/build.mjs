// Builds the static art of the agent-line figure into src/components/agentLine/art.js.
// Run after changing the geometry: node figures/agent-line/build.mjs
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as k from '../../src/components/iso/iso-kit.mjs'
import {
  BELT, DROP, HEIGHT, MAILBOX_X, MAILBOX_YS, PACKET, PLATE, PLATFORMS, SHUTTLE_X, START_X, STATIONS, WIDTH,
} from '../../src/components/agentLine/model.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '../../src/components/agentLine/art.js')

const AZIMUTH = 54
const P = k.fitProjection(
  [...k.boxCorners(PLATE, -17, 0), [STATIONS.render, 0, 150], [START_X, 0, 80], [MAILBOX_X, 70, 36], [-214, 70, 0]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: AZIMUTH },
)

const at = (point) => k.iso(point, P)
const S = (paths, style) => k.solidSvg(paths, style)
const L = (d, style) => k.lineSvg(d, style)
const D = (points, style) => k.dotsSvg(points, style)
const slab = (x0, y0, x1, y1, z, h, steps = 3, bevel = 0.5, r = 1) =>
  k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z, h, P, steps, bevel)
const depth = ([x, y]) => k.depthOf([x, y, 0], P)
const byDepth = (points) => [...points].sort((a, b) => depth(a) - depth(b))
// A rectangle drawn on the +x face (x fixed) or the +y face (y fixed): a door, a panel, a slot.
const onFaceX = (x, y0, y1, z0, z1) => k.pathOf([at([x, y0, z0]), at([x, y1, z0]), at([x, y1, z1]), at([x, y0, z1])], true)
const onFaceY = (y, x0, x1, z0, z1) => k.pathOf([at([x0, y, z0]), at([x1, y, z0]), at([x1, y, z1]), at([x0, y, z1])], true)
const halo = (plan, z, h, blur = 0) =>
  `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}"${blur ? ` style="filter:blur(${blur}px)"` : ''}/>`

// ── Base ──────────────────────────────────────────────────────────────────────
function base() {
  const out = [halo(PLATE, -17, 12)]
  for (const [x, y] of byDepth(k.corners(PLATE, 26))) {
    out.push(S(k.cylinder(x, y, 8, -17, 1.6, P, 28), { tone: 'lo' }))
    out.push(S(k.cylinder(x, y, 6.2, -15.4, 3.4, P, 28), { tone: 'mid' }))
  }
  out.push(S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), { tone: 'mid' }))
  out.push(L(k.planOutline(k.insetPlan(PLATE, 6), 0, P), { tone: 'lo' }))
  const screws = k.corners(PLATE, 11)
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(''), { tone: 'lo' }))
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }))
  // Ruler strip along the front edge, under the belt's travel.
  const strip = { x: -160, y: PLATE.y + PLATE.d - 17, w: 210, d: 7, r: 1 }
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: 'lo', crease: 'none' }))
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 5, 5, strip.y + 0.8, 0.6, [2, 3.8], P)
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }))
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }))
  // Label plate, front left: the only engraved words.
  const label = { x: 60, y: PLATE.y + PLATE.d - 24, w: 34, d: 16, r: 1.2 }
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: 'lo', crease: 'none' }))
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P), { tone: 'faint' }))
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4, label.y + 7], 0.8, P, 'x'), 'ADMART', { size: 3.2, tone: 'mid' }))
  ;[[12, 9], [9, 12.4]].forEach(([len, y]) =>
    out.push(L(k.lineOnTop([label.x + 4, label.y + y], [label.x + 4 + len, label.y + y], 0.8, P), { tone: 'lo', free: true })))
  out.push(D([at([label.x + label.w - 3, label.y + 3, 0.8]), at([label.x + label.w - 3, label.y + label.d - 3, 0.8])], { size: 0.4 }))
  return out.join('')
}

// ── Autopilot: a schedule dial that trips the hopper ─────────────────────────
const DIAL = [-214, 46]
const DIAL_R = 13
const DIAL_TOP = 26
const TRIP = 0.78 // of a turn: where the trip cam sits (Mon 09:00)

function needleAt(turn) {
  const a = turn * TRIP * Math.PI * 2
  const [x, y] = DIAL
  return k.lineOnTop(
    [x - Math.sin(a) * 2.6, y + Math.cos(a) * 2.6],
    [x + Math.sin(a) * (DIAL_R - 3.4), y - Math.cos(a) * (DIAL_R - 3.4)],
    DIAL_TOP + 0.2,
    P,
  )
}

function autopilot() {
  const out = []
  const [x, y] = DIAL
  const ped = { x: x - 16, y: y - 15, w: 32, d: 30, r: 2 }
  out.push(halo(ped, 0, 0.1, 3))
  out.push(S(k.slabOf(ped, 0, 18, P, 4, 0.8), { tone: 'mid' }))
  out.push(L(k.planOutline(k.insetPlan(ped, 3), 18, P, 4), { tone: 'faint' }))
  out.push(D(k.corners(ped, 3.4).map(([px, py]) => at([px, py, 18])), { size: 0.4 }))
  // Vent slots on the front face of the pedestal.
  out.push(L([0, 1, 2, 3].map((i) => onFaceY(ped.y + ped.d, x - 11 + i * 6, x - 7 + i * 6, 5, 12)).join(''), { tone: 'lo' }))
  out.push(S(k.cylinder(x, y, DIAL_R, 18, DIAL_TOP - 18, P, 64, 0.7), { tone: 'hi', crease: 'lo' }))
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 3, DIAL_TOP, 72, P, 0.3), { tone: 'lo' }))
  out.push(L(k.sideArc(x, y, DIAL_R, DIAL_TOP - 3, P, 40), { tone: 'faint' }))
  out.push(L(k.ring(x, y, DIAL_R - 2, DIAL_TOP, P, 56), { tone: 'lo' }))
  const ticks = k.radialTicks(x, y, DIAL_R - 2.6, 28, 4, DIAL_TOP, [1, 2.4], P)
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }))
  // Trip cam on the rim at Mon 09:00.
  const a = TRIP * Math.PI * 2
  const cam = [x + Math.sin(a) * (DIAL_R + 1.4), y - Math.cos(a) * (DIAL_R + 1.4)]
  out.push(S(k.cylinder(cam[0], cam[1], 1.8, DIAL_TOP - 4, 4.4, P, 16), { tone: 'hi' }))
  out.push(L(k.ring(x, y, 1.4, DIAL_TOP, P, 14), { tone: 'mid' }))
  return out.join('')
}

// ── Trend Finder: a scanning antenna that feeds new topics into the hopper ────
const RADAR = { x: -168, y: 46, mast: 42 }

// The antenna bar at an angle (live.js draws it the same way every frame).
function antennaAt(angle) {
  const { x, y, mast } = RADAR
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const corner = (u, v) => [x + u * c - v * s, y + u * s + v * c]
  const bar = [corner(-14, -2), corner(14, -2), corner(14, 2), corner(-14, 2)]
  const tip = corner(12, 0)
  return (
    S(k.extrude(bar, mast + 3, 2.4, P), { tone: 'hi', crease: 'lo' }) +
    S(k.cylinder(tip[0], tip[1], 2.2, mast + 5.4, 2.4, P, 16), { tone: 'mid' })
  )
}

function trendFinder() {
  const { x, y, mast } = RADAR
  const out = []
  const con = { x: x - 16, y: y - 15, w: 32, d: 28, r: 2 }
  out.push(halo(con, 0, 0.1, 3))
  out.push(S(k.slabOf(con, 0, 14, P, 4, 0.8), { tone: 'mid', inner: L(k.sideSeam(con, 5, P, 4), { tone: 'faint' }) }))
  out.push(L(k.planOutline(k.insetPlan(con, 3), 14, P, 4), { tone: 'faint' }))
  out.push(D(k.corners(con, 3.4).map(([px, py]) => at([px, py, 14])), { size: 0.4 }))
  // A small scope on the top face, and a lamp that lights while it scans.
  out.push(L(k.ring(x - 7, y + 6, 5, 14, P, 32), { tone: 'lo' }))
  out.push(L(k.ring(x - 7, y + 6, 2.6, 14, P, 24), { tone: 'faint' }))
  out.push(S(k.cylinder(x + 9, y + 7, 2.4, 14, 2, P, 16), { tone: 'mid' }))
  out.push(`<g data-part="radar-lamp" opacity="0">${S(k.cylinder(x + 9, y + 7, 2.4, 14, 2, P, 16), { tone: 'hi', lit: true })}</g>`)
  // Mast with a collar, then the turning head.
  out.push(S(k.cylinder(x, y, 4, 14, 3, P, 24, 0.3), { tone: 'mid' }))
  out.push(S(k.cylinder(x, y, 2, 17, mast - 17, P, 18), { tone: 'mid', crease: 'none' }))
  out.push(L([30, 44].map((z) => k.sideArc(x, y, 2, z, P, 12)).join(''), { tone: 'faint' }))
  out.push(S(k.cylinder(x, y, 3.4, mast, 3, P, 24, 0.3), { tone: 'mid' }))
  return out.join('')
}

// Feed wire from the Trend Finder console, under the belt, to the hopper column: each topic it finds joins the queue.
function trendWire() {
  const { x, y } = RADAR
  const [cx, cy] = HOPPER.col
  return k.wireSvg(at([x - 8, y - 15, 2]), at([cx + 3, cy + 7, 2]), { via: [at([x - 8, cy + 7, 2])], tone: 'mid' })
}

// ── Hopper: a magazine of topic cards over the belt ───────────────────────────
const HOPPER = { col: [-190, -36], top: 86 }
const MAG = { x: START_X - 12, y: -11, w: 24, d: 22 }
const MAG_Z = BELT.top + DROP + PACKET.h + 2 // bottom of the magazine

function hopperBack() {
  const out = []
  const [cx, cy] = HOPPER.col
  out.push(S(slab(cx - 7, cy - 7, cx + 7, cy + 7, 0, 4, 3, 0.5, 1.6), { tone: 'mid' }))
  out.push(S(slab(cx - 4, cy - 4, cx + 4, cy + 4, 4, HOPPER.top - 4, 3, 0.4, 1), { tone: 'mid' }))
  out.push(D(k.corners({ x: cx - 7, y: cy - 7, w: 14, d: 14 }, 2).map(([px, py]) => at([px, py, 4])), { size: 0.4 }))
  // Arm from the column over the belt to the magazine.
  out.push(S(slab(cx - 3, cy - 3, cx + 3, MAG.y + 4, MAG_Z - 4, 4, 2, 0.4), { tone: 'mid' }))
  // Magazine back rails.
  for (const [x, y] of [[MAG.x, MAG.y], [MAG.x + MAG.w - 2, MAG.y]])
    out.push(S(slab(x, y, x + 2, y + 2, MAG_Z - 4, 30, 2, 0), { tone: 'mid', crease: 'none' }))
  return out.join('')
}

function hopperCards() {
  const out = []
  // Lip the bottom card rests on: two prongs, so the bottom card can fall between them.
  for (const x of [MAG.x, MAG.x + MAG.w - 3])
    out.push(S(slab(x, MAG.y, x + 3, MAG.y + MAG.d, MAG_Z - 2, 2, 2, 0.3), { tone: 'mid' }))
  for (let i = 0; i < 5; i++) {
    const z = MAG_Z + i * 3.4
    out.push(S(slab(START_X - 9, -8, START_X + 9, 8, z, 3, 2, 0.4), { tone: i === 4 ? 'hi' : 'mid', crease: 'lo' }))
  }
  // The topic Trend Finder just found, landing on top of the stack.
  out.push(`<g data-part="trend-card" opacity="0">${S(slab(START_X - 9, -8, START_X + 9, 8, MAG_Z + 5 * 3.4, 3, 2, 0.4), { tone: 'hi', lit: true, crease: 'lo' })}</g>`)
  return out.join('')
}

function hopperFront() {
  const out = []
  for (const [x, y] of [[MAG.x, MAG.y + MAG.d - 2], [MAG.x + MAG.w - 2, MAG.y + MAG.d - 2]])
    out.push(S(slab(x, y, x + 2, y + 2, MAG_Z - 4, 30, 2, 0), { tone: 'mid', crease: 'none' }))
  // Top band tying the four rails.
  out.push(S(slab(MAG.x - 1, MAG.y - 1, MAG.x + MAG.w + 1, MAG.y + MAG.d + 1, MAG_Z + 24, 2, 2, 0.4), { tone: 'mid' }))
  out.push(L(k.planOutline({ x: MAG.x + 2, y: MAG.y + 2, w: MAG.w - 4, d: MAG.d - 4, r: 0.6 }, MAG_Z + 26, P, 2), { tone: 'lo' }))
  return out.join('')
}

// ── Belt ──────────────────────────────────────────────────────────────────────
const LEGS = [-218, -112, -2, 104]

function beltBack() {
  const out = [halo({ x: BELT.x0, y: -18, w: BELT.x1 - BELT.x0, d: 36, r: 4 }, 0, 0.1, 4)]
  for (const x of LEGS) out.push(S(slab(x - 3, -17, x + 3, -11, 0, 14, 2, 0.3), { tone: 'lo' }))
  out.push(S(slab(BELT.x0, -16, BELT.x1, -12, 14, 8, 3, 0.4), { tone: 'mid' }))
  out.push(S(slab(BELT.x0 + 2, -12, BELT.x1 - 2, 12, 16, 4, 6, 0, 6), { tone: 'lo', crease: 'faint' }))
  return out.join('')
}

const SLAT_GAP = 9
export function slatsAt(offset) {
  const out = []
  const shift = ((offset % SLAT_GAP) + SLAT_GAP) % SLAT_GAP
  for (let x = BELT.x0 + 8 + shift; x < BELT.x1 - 6; x += SLAT_GAP) out.push(k.lineOnTop([x, -12, 0], [x, 12], BELT.top, P))
  return out.join('')
}

function beltFront() {
  const out = []
  out.push(S(slab(BELT.x0, 12, BELT.x1, 16, 14, 8, 3, 0.4), { tone: 'mid' }))
  // Bolts along the front beam.
  out.push(D(LEGS.map((x) => at([x, 16, 18])), { size: 0.45 }))
  out.push(L(k.sideSeam({ x: BELT.x0, y: 12, w: BELT.x1 - BELT.x0, d: 4, r: 1 }, 16, P, 3), { tone: 'faint' }))
  for (const x of LEGS) out.push(S(slab(x - 3, 11, x + 3, 17, 0, 14, 2, 0.3), { tone: 'lo' }))
  // Drive motor at the far end of the belt.
  out.push(S(k.cylinder(BELT.x0 + 150, 24, 6, 0, 16, P, 28, 0.4), { tone: 'mid' }))
  out.push(L(k.knurl(BELT.x0 + 150, 24, 6, 3, 12, 24, P), { tone: 'lo' }))
  out.push(S(slab(BELT.x0 + 147, 16, BELT.x0 + 153, 21, 10, 4, 2, 0.3), { tone: 'mid' }))
  return out.join('')
}

// ── The packet: the post being made, built at the origin and moved ────────────
function packet() {
  const plan = { x: -PACKET.w / 2, y: -PACKET.d / 2, w: PACKET.w, d: PACKET.d, r: 1.2 }
  const h = PACKET.h
  const out = []
  out.push(`<g data-part="packet-plain">${S(k.slabOf(plan, 0, h, P, 3, 0.6), { tone: 'hi', crease: 'lo' })}</g>`)
  out.push(`<g data-part="packet-done" opacity="0">${S(k.slabOf(plan, 0, h, P, 3, 0.6), { tone: 'hi', lit: true, crease: 'lo' })}</g>`)
  // Script: a sheet with rule lines.
  out.push(`<g data-part="sheet" opacity="0">${S(slab(-7.5, -6, 1.5, 6, h, 0.6, 2, 0), { tone: 'hi', crease: 'none' })}${L(
    [-4, -1.5, 1, 3.5].map((y, i) => k.lineOnTop([-6, y], [-6 + [7, 5.5, 6.5, 4][i], y], h + 0.6, P)).join(''),
    { tone: 'lo', free: true },
  )}</g>`)
  // Voice: a speaker grille.
  out.push(`<g data-part="voice" opacity="0">${S(k.cylinder(5, -3, 2.4, h, 0.8, P, 20), { tone: 'mid' })}${D(
    [[5, -3], [4, -3.8], [6, -2.2], [6, -3.8], [4, -2.2]].map(([px, py]) => at([px, py, h + 0.8])),
    { size: 0.3, tone: 'lo' },
  )}</g>`)
  // Visuals: a framed image tile.
  out.push(`<g data-part="image" opacity="0">${S(slab(2.5, 1.5, 7.5, 6.5, h, 0.5, 2, 0, 0.6), { tone: 'mid', crease: 'none' })}${L(
    k.onTop([[3, 6], [4.6, 3.6], [5.6, 4.8], [7, 2.6]], h + 0.5, P),
    { tone: 'hi' },
  )}</g>`)
  return out.join('')
}

// ── Script writer: a press that stamps the script onto the packet ─────────────
const COL_Y = -34
const HEAD_REST = 46
const HEAD_DOWN = BELT.top + PACKET.h + 0.6

function column(x, top, armZ, reach = 4) {
  const out = []
  out.push(halo({ x: x - 8, y: COL_Y - 8, w: 16, d: 16, r: 2 }, 0, 0.1, 2))
  out.push(S(slab(x - 8, COL_Y - 8, x + 8, COL_Y + 8, 0, 4, 3, 0.5, 2), { tone: 'mid' }))
  out.push(D(k.corners({ x: x - 8, y: COL_Y - 8, w: 16, d: 16 }, 2.4).map(([px, py]) => at([px, py, 4])), { size: 0.4 }))
  out.push(S(slab(x - 4, COL_Y - 4, x + 4, COL_Y + 4, 4, top - 4, 3, 0.4), { tone: 'mid', inner: L(k.sideSeam({ x: x - 4, y: COL_Y - 4, w: 8, d: 8, r: 1 }, 20, P, 3), { tone: 'faint' }) }))
  out.push(S(slab(x - 5, COL_Y - 5, x + 5, reach, armZ, 6, 3, 0.5), { tone: 'mid' }))
  out.push(D([at([x, COL_Y + 1, armZ + 6]), at([x, reach - 3, armZ + 6])], { size: 0.45 }))
  return out.join('')
}

function scriptHead() {
  const x = STATIONS.script
  const out = []
  // Guide rod through the arm, then the head with its stamp face.
  out.push(S(k.cylinder(x, 0, 1.8, HEAD_REST + 12, 50, P, 16), { tone: 'mid', crease: 'none' }))
  out.push(S(slab(x - 9, -8, x + 9, 8, HEAD_REST + 3, 9, 3, 0.6, 1.4), { tone: 'mid' }))
  out.push(L(onFaceY(8, x - 6, x + 6, HEAD_REST + 5, HEAD_REST + 10), { tone: 'lo' }))
  out.push(S(slab(x - 7.5, -6, x + 1.5, 6, HEAD_REST, 3, 2, 0.3), { tone: 'hi', crease: 'lo' }))
  out.push(S(k.cylinder(x, 0, 3, HEAD_REST + 12, 2, P, 20), { tone: 'mid' }))
  return out.join('')
}

// ── Voice booth: a microphone on a boom, with a level meter ───────────────────
const MIC = { x: STATIONS.voice, z: 44 }

function voiceStand() {
  const x = MIC.x
  const out = []
  out.push(halo({ x: x - 11, y: -55, w: 22, d: 22, r: 11 }, 0, 0.1, 2))
  out.push(S(k.cylinder(x, -44, 11, 0, 3, P, 40, 0.5), { tone: 'mid' }))
  out.push(S(k.cylinder(x, -44, 2.4, 3, 68, P, 20), { tone: 'mid', crease: 'none' }))
  out.push(L([24, 46].map((z) => k.sideArc(x, -44, 2.4, z, P, 12)).join(''), { tone: 'faint' }))
  out.push(S(k.cylinder(x, -44, 3.4, 66, 5, P, 20), { tone: 'mid' }))
  out.push(L(k.knurl(x, -44, 3.4, 66, 71, 16, P), { tone: 'lo' }))
  out.push(S(slab(x - 1.6, -44, x + 1.6, 1.6, 68, 3, 2, 0.3), { tone: 'mid' }))
  // Level meter console with eight LEDs.
  const con = { x: x - 20, y: -76, w: 40, d: 14, r: 1.6 }
  out.push(S(k.slabOf(con, 0, 9, P, 3, 0.6), { tone: 'mid' }))
  out.push(L(k.planOutline(k.insetPlan(con, 2), 9, P, 3), { tone: 'faint' }))
  for (let i = 0; i < 8; i++) {
    const lx = con.x + 5 + i * 4
    out.push(`<g data-vu="${i}">${S(slab(lx, con.y + 4, lx + 2.6, con.y + 10, 9, 1.2, 2, 0, 0.4), { tone: 'mid', crease: 'none' })}</g>`)
  }
  return out.join('')
}

function voiceMic() {
  const x = MIC.x
  const out = []
  out.push(S(slab(x - 1.4, -1.4, x + 1.4, 1.4, MIC.z + 14, 68 - MIC.z - 14, 2, 0), { tone: 'mid', crease: 'none' }))
  out.push(S(k.cylinder(x, 0, 6, MIC.z, 14, P, 36, 0.4), { tone: 'hi', crease: 'lo' }))
  out.push(L(k.knurl(x, 0, 6, MIC.z + 2, MIC.z + 12, 26, P, 0.6), { tone: 'lo' }))
  out.push(L(k.sideArc(x, 0, 6, MIC.z + 7, P, 24), { tone: 'mid' }))
  out.push(L(k.ring(x, 0, 4.4, MIC.z + 14, P, 28), { tone: 'lo' }))
  out.push(`<g data-part="mic-level" opacity="0">${L(k.sideArc(x, 0, 6, MIC.z + 7, P, 24), { tone: 'lit' })}${L(k.ring(x, 0, 4.4, MIC.z + 14, P, 28), { tone: 'lit' })}</g>`)
  return out.join('')
}

// ── Camera: shoots an image for every scene ───────────────────────────────────
const CAM = { x: STATIONS.visuals, z: 60 }

function cameraBody() {
  const x = CAM.x
  const out = []
  out.push(S(slab(x - 2, -4, x + 2, 0, CAM.z + 14, 10, 2, 0.3), { tone: 'mid' }))
  out.push(S(slab(x - 11, -9, x + 11, 9, CAM.z + 4, 10, 3, 0.6, 1.6), { tone: 'mid' }))
  out.push(L(k.sideSeam({ x: x - 11, y: -9, w: 22, d: 18, r: 1.6 }, CAM.z + 7, P, 3), { tone: 'faint' }))
  out.push(S(slab(x + 3, -7, x + 9, -1, CAM.z + 14, 3, 2, 0.3), { tone: 'mid' }))
  out.push(S(k.cylinder(x, 2, 5, CAM.z - 4, 8, P, 32, 0.4), { tone: 'mid' }))
  out.push(L(k.knurl(x, 2, 5, CAM.z - 2, CAM.z + 3, 24, P), { tone: 'lo' }))
  out.push(`<g data-part="flash" opacity="0">${S(k.cylinder(x, 2, 5, CAM.z - 4, 8, P, 32), { tone: 'hi', lit: true })}${S(slab(x + 3, -7, x + 9, -1, CAM.z + 14, 3, 2, 0.3), { tone: 'hi', lit: true })}</g>`)
  return out.join('')
}

// ── Render hood: lowers over the packet and bakes it into a video ─────────────
const HOOD = { x: STATIONS.render, rest: 52, down: BELT.top + 1, h: 26 }

function renderHood() {
  const x = HOOD.x
  const z = HOOD.rest
  const out = []
  out.push(S(k.cylinder(x, 0, 2.4, z + HOOD.h, 72, P, 18), { tone: 'mid', crease: 'none' }))
  out.push(S(slab(x - 15, -15, x + 15, 15, z, HOOD.h, 4, 0.8, 3), { tone: 'mid' }))
  out.push(L(k.sideSeam({ x: x - 15, y: -15, w: 30, d: 30, r: 3 }, z + 4, P, 4), { tone: 'faint' }))
  out.push(L(k.planOutline({ x: x - 11, y: -11, w: 22, d: 22, r: 2 }, z + HOOD.h, P, 3), { tone: 'lo' }))
  out.push(S(k.cylinder(x, 0, 4, z + HOOD.h, 2, P, 20), { tone: 'mid' }))
  const vents = [0, 1, 2, 3].map((i) => onFaceY(15, x - 10 + i * 6, x - 7 + i * 6, z + 9, z + 21)).join('')
  out.push(L(vents, { tone: 'lo' }))
  out.push(`<g data-part="glow" opacity="0">${L(vents, { tone: 'red' })}</g>`)
  out.push(L([0, 1, 2].map((i) => onFaceX(15 + x, -9 + i * 6, -6 + i * 6, z + 9, z + 21)).join(''), { tone: 'lo' }))
  return out.join('')
}

// ── Review gate: a bar that only lifts when you approve ───────────────────────
const GATE = { x: STATIONS.gate, bar: BELT.top + 2 }

function gatePost() {
  const x = GATE.x
  const out = []
  out.push(S(slab(x - 7, -36, x + 7, -22, 0, 4, 3, 0.5, 1.6), { tone: 'mid' }))
  out.push(S(slab(x - 4, -33, x + 4, -25, 4, 58, 3, 0.4), { tone: 'mid' }))
  out.push(L(onFaceY(-25, x - 1.2, x + 1.2, 18, 58), { tone: 'lo' }))
  out.push(S(k.cylinder(x, -29, 3.4, 62, 4, P, 20, 0.3), { tone: 'mid' }))
  out.push(`<g data-part="lamp" opacity="0">${S(k.cylinder(x, -29, 3.4, 62, 4, P, 20, 0.3), { tone: 'hi', lit: true })}</g>`)
  return out.join('')
}

function gateBar() {
  const x = GATE.x
  const out = []
  out.push(S(slab(x - 3, -26, x + 3, 15, GATE.bar, 5, 2, 0.4), { tone: 'hi', crease: 'lo' }))
  out.push(L([-12, -5, 2, 9].map((y) => k.segment([x + 3, y, GATE.bar], [x + 3, y + 3.5, GATE.bar + 5], P)).join(''), { tone: 'lo' }))
  return out.join('')
}

function approveButton() {
  const x = GATE.x
  const out = []
  const ped = { x: x - 11, y: 30, w: 22, d: 18, r: 2 }
  out.push(halo(ped, 0, 0.1, 2))
  out.push(S(k.slabOf(ped, 0, 14, P, 3, 0.7), { tone: 'mid' }))
  out.push(L(k.sideSeam(ped, 4, P, 3), { tone: 'faint' }))
  out.push(D(k.corners(ped, 3).map(([px, py]) => at([px, py, 14])), { size: 0.4 }))
  out.push(S(k.cylinder(x, 39, 6.4, 14, 1.4, P, 32), { tone: 'lo' }))
  return out.join('')
}

function buttonCap() {
  const x = GATE.x
  return `${S(k.cylinder(x, 39, 4.6, 15.4, 3, P, 28, 0.4), { tone: 'hi', crease: 'lo' })}<g data-part="button-lit" opacity="0">${S(k.cylinder(x, 39, 4.6, 15.4, 3, P, 28, 0.4), { tone: 'hi', lit: true })}</g>`
}

// ── Publishing: a shuttle on a cross rail and a mailbox for each platform ─────
function crossRail() {
  const out = []
  for (const x of [SHUTTLE_X - 12, SHUTTLE_X + 8]) {
    out.push(S(slab(x, -78, x + 4, 78, 0, 3, 3, 0.4), { tone: 'mid' }))
    out.push(D([at([x + 2, -74, 3]), at([x + 2, 74, 3])], { size: 0.4 }))
  }
  for (const y of [-84 + 2, 78]) out.push(S(slab(SHUTTLE_X - 15, y, SHUTTLE_X + 15, y + 4, 0, 7, 3, 0.5), { tone: 'mid' }))
  // Bridge plate from the end of the belt onto the shuttle.
  out.push(S(slab(BELT.x1, -10, SHUTTLE_X - 16, 10, BELT.top - 2, 2, 2, 0.3), { tone: 'lo' }))
  return out.join('')
}

function shuttle() {
  const x = SHUTTLE_X
  const out = [halo({ x: x - 14, y: -13, w: 28, d: 26, r: 3 }, 3, 0.1, 3)]
  for (const bx of [x - 12, x + 8])
    for (const by of [-11, 7]) out.push(S(slab(bx - 1, by, bx + 5, by + 4, 3, 4, 2, 0.3), { tone: 'lo' }))
  out.push(S(slab(x - 14, -12, x + 14, 12, 7, BELT.top - 9, 4, 0.6, 2), { tone: 'mid' }))
  out.push(L(k.sideSeam({ x: x - 14, y: -12, w: 28, d: 24, r: 2 }, 12, P, 4), { tone: 'faint' }))
  out.push(S(slab(x - 12, -10, x + 12, 10, BELT.top - 2, 2, 3, 0.4), { tone: 'lo' }))
  out.push(L([-6, 0, 6].map((y) => k.lineOnTop([x - 12, y], [x + 12, y], BELT.top, P)).join(''), { tone: 'faint' }))
  return out.join('')
}

function mailbox(y, i) {
  const x = MAILBOX_X
  const out = [halo({ x: x - 14, y: y - 10, w: 28, d: 20, r: 3 }, 0, 0.1, 2)]
  out.push(S(slab(x - 13, y - 9, x + 13, y + 9, 0, 3, 3, 0.5, 2), { tone: 'lo' }))
  out.push(S(slab(x - 12, y - 8, x + 12, y + 8, 3, 11, 4, 0.6, 2), { tone: 'mid', inner: L(k.sideSeam({ x: x - 12, y: y - 8, w: 24, d: 16, r: 2 }, 7, P, 4), { tone: 'faint' }) }))
  out.push(S(slab(x - 12.6, y - 8.6, x + 12.6, y + 8.6, 14, 2, 4, 0.6, 2.4), { tone: 'mid' }))
  // Slot the copy drops through, and the door on the near end with its latch.
  out.push(L(k.planOutline({ x: x - 7, y: y - 1.6, w: 14, d: 3.2, r: 1.4 }, 16, P, 3), { tone: 'lo' }))
  out.push(L(onFaceX(x + 12, y - 5.5, y + 5.5, 4.5, 12), { tone: 'lo' }))
  out.push(S(slab(x + 12, y - 1, x + 13.6, y + 1, 7.4, 1.6, 2, 0.2), { tone: 'mid' }))
  // Flag mast on the near side, at the back end.
  out.push(S(slab(x - 11, y + 8, x - 8.6, y + 10.4, 3, 30, 2, 0), { tone: 'mid', crease: 'none' }))
  out.push(S(k.cylinder(x - 9.8, y + 9.2, 1.6, 33, 1.2, P, 12), { tone: 'mid' }))
  out.push(
    `<g data-part="flag-${i}">${S(slab(x - 8.6, y + 8.6, x + 2, y + 9.8, 16, 6, 2, 0), { tone: 'mid', crease: 'none' })}<g class="al-flag" style="--flag:${PLATFORMS[i].color}" opacity="0">${S(slab(x - 8.6, y + 8.6, x + 2, y + 9.8, 16, 6, 2, 0), { tone: 'hi', crease: 'none' })}</g></g>`,
  )
  return out.join('')
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    'An agent run drawn as a conveyor. A schedule dial trips a hopper that drops a topic card onto a belt. The card passes a script press, a microphone, a camera and a render hood, picking up a script, a voice and images, then waits at a gate until you press the approve button. A shuttle then carries it along five mailboxes, YouTube, Instagram, Facebook, TikTok and Snapchat, and raises each one\'s flag as the post goes out.',
  body: [
    base(),
    autopilot(),
    `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needleAt(0)}" style="stroke-width:1.1"/>`,
    trendWire(),
    hopperBack(),
    column(STATIONS.script, 82, 76),
    voiceStand(),
    column(CAM.x, 90, CAM.z + 24),
    column(HOOD.x, 118, 112),
    gatePost(),
    beltBack(),
    `<path data-part="slats" class="iso-line" data-tone="lo" d="${slatsAt(0)}"/>`,
    hopperCards(),
    `<g data-slot="belt"></g>`,
    `<g data-part="packet" transform="${k.translateAlong(P, [START_X, 0, BELT.top + DROP])}" opacity="0">${packet()}</g>`,
    beltFront(),
    trendFinder(),
    `<g data-part="antenna">${antennaAt(0)}</g>`,
    hopperFront(),
    `<g data-part="head">${scriptHead()}</g>`,
    voiceMic(),
    cameraBody(),
    `<g data-part="hood">${renderHood()}</g>`,
    `<g data-part="bar">${gateBar()}</g>`,
    approveButton(),
    `<g data-part="button">${buttonCap()}</g>`,
    crossRail(),
    `<g data-sort="right">`,
    `<g data-part="shuttle" data-key="${SHUTTLE_X}">${shuttle()}</g>`,
    ...MAILBOX_YS.map((y, i) => `<g data-mailbox="${i}">${mailbox(y, i)}</g>`),
    `<g data-part="copy" opacity="0">${S(slab(-6, -5, 6, 5, 0, 2, 2, 0.3), { tone: 'hi', lit: true })}</g>`,
    `</g>`,
  ],
})

// Where each station's label pins onto the drawing, as a share of the viewBox (stage order of STAGES).
const LABEL_AT = [
  [RADAR.x, RADAR.y, RADAR.mast + 6],
  [-214, 46, 30],
  [STATIONS.script, COL_Y, 84],
  [MIC.x, -44, 73],
  [CAM.x, COL_Y, 92],
  [HOOD.x, COL_Y, 120],
  [GATE.x, -29, 67],
  [MAILBOX_X - 10, MAILBOX_YS[0] + 9, 34],
]
const LABELS = LABEL_AT.map((point) => {
  const [x, y] = at(point)
  return [Math.round((x / WIDTH) * 1000) / 10, Math.round((y / HEIGHT) * 1000) / 10]
})

const geometry = {
  P,
  LABELS,
  RADAR,
  DIAL,
  DIAL_R,
  DIAL_TOP,
  TRIP,
  SLAT_GAP,
  HEAD_TRAVEL: HEAD_REST - HEAD_DOWN,
  HOOD_TRAVEL: HOOD.rest - HOOD.down,
  BAR_TRAVEL: 30,
}

writeFileSync(
  OUT,
  `// Generated by figures/agent-line/build.mjs: do not edit by hand.\nexport const GEOMETRY = ${JSON.stringify(geometry)}\nexport const SVG = ${JSON.stringify(svg)}\n`,
)
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(0)} KB)`)
