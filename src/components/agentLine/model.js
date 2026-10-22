// The agent line: one Admart agent run as a conveyor, from the Autopilot schedule to a post on each platform.
// Pure (no DOM): the build script draws the rest pose from it and the live figure moves every part with poseAt(t).
// Stages follow the YouTube Shorts Creator recipe (agents/registry.py) and the publishers in projects/publish.py.

export const WIDTH = 640
export const HEIGHT = 330

// World layout, about 1 unit per px of the real machine: x along the belt, y across it, z up.
export const PLATE = { x: -252, y: -84, w: 476, d: 168, r: 10 }
export const BELT = { x0: -228, x1: 112, y: 12, top: 20 } // belt runs between y = -12 and 12
export const PACKET = { w: 18, d: 16, h: 8 }
export const START_X = -205
export const DROP = 22 // the topic card falls this far from the hopper onto the belt
export const STATIONS = { script: -140, voice: -84, visuals: -28, render: 30, gate: 82 }
export const GATE_STOP = STATIONS.gate - 17 // the packet waits here for your approval
export const SHUTTLE_X = 140
export const MAILBOX_X = 188
export const MAILBOX_YS = [-60, -30, 0, 30, 60]

// The platforms Admart publishes to, in the order the shuttle visits them.
export const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', color: '#ff4444' },
  { id: 'instagram', name: 'Instagram', color: '#e6683c' },
  { id: 'facebook', name: 'Facebook', color: '#1877f2' },
  { id: 'tiktok', name: 'TikTok', color: '#00f2ea' },
  { id: 'snapchat', name: 'Snapchat', color: '#fffc00' },
]

const MOVE = 1.1 // seconds between two stations
const WORK = 1.5 // seconds at a station
const POST = 1.6 // seconds per platform: shuttle over, copy in, flag up

// Each stage: [start, end] in seconds of the loop, and what the readout says.
const STEPS = []
let clock = 0
const step = (id, seconds, label) => {
  STEPS.push({ id, from: clock, to: clock + seconds, label })
  clock += seconds
}
step('trends', 2.6, 'Trend Finder · a rising topic in your niche, added to your queue')
step('schedule', 2.2, 'Autopilot · Mon 09:00 · topic taken from your queue')
step('to-script', MOVE, 'Moving to the script writer')
step('script', WORK, 'Script · hook, scenes and title written')
step('to-voice', MOVE, 'Moving to the voice booth')
step('voice', WORK, 'Voice · narration recorded')
step('to-visuals', MOVE, 'Moving to the camera')
step('visuals', WORK, 'Visuals · an image for every scene')
step('to-render', MOVE, 'Moving to the render hood')
step('render', 1.7, 'Render · 9:16 video with captions')
step('to-gate', MOVE, 'Waiting for your approval')
step('review', 2.0, 'Review · nothing posts until you approve')
step('to-shuttle', 1.4, 'Approved · on its way to publish')
PLATFORMS.forEach((p, i) => step(`post-${i}`, POST, `Publishing · ${PLATFORMS.slice(0, i + 1).map((q) => q.name).join(' · ')}`))
step('done', 1.8, 'Posted to 5 platforms')
step('reset', 1.5, 'Next run on the schedule')

export const LOOP = clock
export { STEPS }

// The eight stations, as the labels on the machine and the guide under it name them.
// `steps` are the loop stages during which a station is the one at work.
export const STAGES = [
  {
    id: 'trends',
    agent: 'Trend Finder',
    pin: 'Trend Finder',
    title: 'Finds what is trending',
    text: 'Scans your niche for topics rising this week, with sources and a ready hook, and adds the best one to your topic queue.',
    steps: ['trends'],
  },
  {
    id: 'schedule',
    agent: 'Autopilot',
    pin: 'Autopilot',
    title: 'Starts on your schedule',
    text: 'At the day and time you set, it takes the next topic from the queue and hands it to the Shorts Creator.',
    steps: ['schedule', 'reset'],
  },
  {
    id: 'script',
    agent: 'Script Writer',
    pin: 'Script Writer',
    title: 'Writes the script',
    text: 'A hook, scenes with narration and image ideas, plus the title, description and tags.',
    steps: ['to-script', 'script'],
  },
  {
    id: 'voice',
    agent: 'Voiceover',
    pin: 'Voiceover',
    title: 'Records the voice',
    text: 'A natural narrator reads the script in the voice and pace you picked.',
    steps: ['to-voice', 'voice'],
  },
  {
    id: 'visuals',
    agent: 'Shorts Creator',
    pin: 'Images',
    title: 'Makes the images',
    text: 'An AI image for every scene, in your chosen style, with captions timed to the voice.',
    steps: ['to-visuals', 'visuals'],
  },
  {
    id: 'render',
    agent: 'Shorts Creator',
    pin: 'Render',
    title: 'Renders the video',
    text: 'Images, voice and captions are put together into a vertical 9:16 video.',
    steps: ['to-render', 'render'],
  },
  {
    id: 'review',
    agent: 'You',
    pin: 'You approve',
    title: 'You approve it',
    text: 'The finished video waits for you. Nothing is posted until you check it and press approve.',
    steps: ['to-gate', 'review'],
  },
  {
    id: 'publish',
    agent: 'Publisher',
    pin: 'Publisher',
    title: 'Posts everywhere',
    text: 'It posts to every account you connected: YouTube, Instagram, Facebook, TikTok and Snapchat.',
    steps: ['to-shuttle', ...PLATFORMS.map((_, i) => `post-${i}`), 'done'],
  },
]

export function stageAt(t) {
  const id = stepAt(((t % LOOP) + LOOP) % LOOP).id
  return STAGES.findIndex((s) => s.steps.includes(id))
}

// Where the keyboard and the readout stop: the start of each working stage.
export const STOPS = STEPS.filter((s) => !s.id.startsWith('to-') && s.id !== 'reset').map((s) => s.from + 0.01)

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const ease = (v) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}
const span = (s, t) => (t - s.from) / (s.to - s.from)
const byId = Object.fromEntries(STEPS.map((s) => [s.id, s]))
// 0 → 1 → 0 over a stage: a tool that comes down and goes back up.
const press = (s, t) => {
  const p = span(s, t)
  if (p <= 0 || p >= 1) return 0
  return ease(p / 0.35) * (1 - ease((p - 0.65) / 0.35))
}

export function stepAt(t) {
  return STEPS.find((s) => t >= s.from && t < s.to) || STEPS[STEPS.length - 1]
}

export function poseAt(raw) {
  const t = ((raw % LOOP) + LOOP) % LOOP
  const now = stepAt(t)
  const after = (id) => t >= byId[id].from + (byId[id].to - byId[id].from) / 2

  // Packet travel along the belt, then on the shuttle.
  const legs = [
    ['to-script', START_X, STATIONS.script],
    ['to-voice', STATIONS.script, STATIONS.voice],
    ['to-visuals', STATIONS.voice, STATIONS.visuals],
    ['to-render', STATIONS.visuals, STATIONS.render],
    ['to-gate', STATIONS.render, GATE_STOP],
    ['to-shuttle', GATE_STOP, SHUTTLE_X],
  ]
  let x = START_X
  for (const [id, a, b] of legs) {
    const s = byId[id]
    if (t >= s.to) x = b
    else if (t >= s.from) {
      x = a + (b - a) * ease(span(s, t))
      break
    } else break
  }

  // Autopilot: the needle sweeps to the trip mark, then the next topic card drops onto the belt.
  const sched = byId.schedule
  const dial = ease(span(sched, t) / 0.6)
  const drop = ease((span(sched, t) - 0.62) / 0.3)

  // The shuttle visits each mailbox; at each it pushes a copy in and the flag goes up.
  let shuttleY = 0
  let copy = 0 // 0 = on the shuttle, 1 = inside the mailbox
  let sink = 0 // 1 = through the slot
  let copyAt = -1 // the mailbox a copy is sliding into, or -1
  const flags = PLATFORMS.map((_, i) => {
    const s = byId[`post-${i}`]
    const p = span(s, t)
    if (p >= 0 && p < 1) {
      const fromY = i === 0 ? 0 : MAILBOX_YS[i - 1]
      shuttleY = fromY + (MAILBOX_YS[i] - fromY) * ease(p / 0.4)
      copy = ease((p - 0.42) / 0.2)
      sink = ease((p - 0.62) / 0.1)
      copyAt = p >= 0.4 && p < 0.72 ? i : -1
    }
    return ease((p - 0.68) / 0.22)
  })
  const reset = byId.reset
  const back = ease(span(reset, t))
  if (t >= byId['post-4'].to) shuttleY = MAILBOX_YS[4] * (1 - back)
  const flagsDown = 1 - back

  const review = byId.review
  const approve = press({ from: review.from + 1.0, to: review.from + 1.6 }, t)
  const barUp = ease((t - (review.from + 1.35)) / 0.6) * (1 - ease((t - (byId['to-shuttle'].from + 1.0)) / 0.5))

  // Trend Finder: the antenna turns slowly, sweeps fast while it scans, and a new topic card lands on the stack.
  const trends = byId.trends
  const scan = ease(span(trends, t) / 0.75)
  const found = ease((span(trends, t) - 0.72) / 0.2) * (1 - ease(span(reset, t)))

  return {
    t,
    step: now,
    antenna: t * 0.35 + scan * Math.PI * 4,
    scanning: now.id === 'trends' && span(trends, t) < 0.8,
    found,
    x,
    y: x >= SHUTTLE_X ? shuttleY : 0,
    z: BELT.top + DROP * (1 - drop),
    shown: (t < reset.from ? 1 : 1 - back) * (t < sched.from + 0.62 * (sched.to - sched.from) ? 0 : 1),
    onShuttle: x >= SHUTTLE_X - 0.5,
    belt: x < BELT.x1 ? x : BELT.x1,
    dial,
    head: press(byId.script, t),
    sheet: after('script') ? 1 : 0,
    mic: now.id === 'voice' ? Math.sin(span(now, t) * Math.PI) : 0,
    voice: after('voice') ? 1 : 0,
    flash: now.id === 'visuals' ? press({ from: now.from + 0.5, to: now.from + 0.9 }, t) : 0,
    image: after('visuals') ? 1 : 0,
    hood: press(byId.render, t),
    glow: now.id === 'render' ? Math.sin(clamp01((span(now, t) - 0.25) / 0.5) * Math.PI) : 0,
    done: after('render') ? 1 : 0,
    waiting: now.id === 'to-gate' || (now.id === 'review' && t < review.from + 1.0),
    approve,
    bar: barUp,
    shuttleY,
    copy,
    sink,
    copyAt,
    flags: flags.map((f, i) => (t >= byId[`post-${i}`].from ? f * flagsDown : 0)),
  }
}

export function readoutAt(t) {
  return stepAt(((t % LOOP) + LOOP) % LOOP).label
}
