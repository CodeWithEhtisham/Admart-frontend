# Admart — Exhibition Story Video (Silent, Looping)

> **Concept:** A social media manager, buried under multi-platform publishing, discovers **Admart** and gets her time back.
> **Format:** Silent · looping · **16:9 · 1080p** · ~75 seconds · runs unattended on a booth Smart TV.
> **Method:** **Hybrid** — Veo3 for the human story (emotion/scenes), **real screen recording** for the product moment. Never let Veo3 fake the UI or render on-screen text.

---

## Why this structure works on a booth TV

- **Silent = emotion + captions carry everything.** A visible before/after arc (stressed → relaxed) reads instantly with no sound.
- **One character** the whole way = viewers bond and understand without words.
- **Real UI in the middle** = credibility. AI-generated fake dashboards kill trust and mangle text.
- **Seamless loop** = a passerby catches a full cycle no matter when they glance.

---

## Global specs

| Setting | Value |
|---|---|
| Aspect / resolution | 16:9 · 1920×1080 (4K if the TV supports it) |
| Length | ~75s, seamless loop |
| Audio | None required (optional soft instrumental bed, muted-safe) |
| Captions | Big bold, high contrast, readable from 3m |
| Pacing | Hold 2–3s per beat; slow cursor in screen recordings |
| Brand name | **Admart** (UI already renamed) |
| Brand look | Dark→warm cinematic, blue `#2563eb` + violet `#7c3aed` accents |

---

## Character (reuse for continuity — the #1 Veo3 pitfall)

Veo3 draws a *different* person each clip unless you force consistency. Do one of:

1. **Best:** generate ONE character reference image, then use **image-to-video** for every human clip.
2. **Minimum:** paste the identical character block into every prompt.

**Character block (paste into every human prompt):**
```
a woman in her late 20s with shoulder-length dark hair in a loose bun,
wearing a mustard-yellow cardigan over a white tee, in a warm modern
home office with a wooden desk, a large monitor, and a small plant
```

**Character reference image prompt** (run in Gemini/Imagen/your image tool, 16:9):
```
Cinematic photorealistic character reference portrait, medium close-up, eye-level:
[character block], friendly approachable neutral-pleasant expression, looking toward camera.
Soft warm morning window light mixed with a subtle cool blue screen glow, gentle rim light,
shallow depth of field, character centered with clean negative space, premium SaaS tech-commercial
look, high detail, natural skin tones. No text.
```

---

## Veo3 global settings (append to every human/brand prompt)

**Style suffix:**
```
dark-to-warm cinematic tech commercial, blue #2563eb / violet #7c3aed accent glow,
shallow depth of field, 4K, smooth camera motion, no watermark,
no readable or distorted text on any screen
```

**Negative prompt (if supported):**
```
blurry, low quality, cartoon, cluttered, harsh white background, illegible text,
distorted faces, extra fingers, watermark, shaky camera, oversaturated
```

---

## One-glance timeline

| Time | Scene | Source | Caption |
|---|---|---|---|
| 0:00–0:06 | 1 · Calm morning | Veo3 | *Meet a social media manager.* |
| 0:06–0:12 | 2 · The demand hits | Veo3 | *"We need this on every platform. Today."* |
| 0:12–0:20 | 3 · Tool chaos | Veo3 | *Edit. Resize. Caption. Schedule. Repeat.* |
| 0:20–0:26 | 4 · Defeat | Veo3 | *4 platforms. 4 formats. Hours gone.* |
| 0:26–0:31 | 5 · Discovery | Veo3 | *Then she found Admart.* |
| 0:31–0:37 | 6 · Describe idea | **Screen rec** | *1 · Describe your idea* |
| 0:37–0:43 | 7 · Format + platforms | **Screen rec** | *2 · Pick format + every platform* |
| 0:43–0:50 | 8 · AI builds it | **Screen rec** | *3 · AI builds it — captions, music, done* |
| 0:50–0:56 | 9 · Publish everywhere | **Screen rec** | *One click. Published everywhere.* |
| 0:56–1:03 | 10 · Relief | Veo3 | *Minutes, not days.* |
| 1:03–1:08 | 11 · Reach | Veo3 | *Create AI videos. Publish everywhere.* |
| 1:08–1:12 | 12 · Logo + QR | Card/Veo3 | *Admart · Start free →* |

→ loops to Scene 1.

---

## Veo3 scenes — full prompts

Each already assumes the **character block** + **style suffix** appended.

### Scene 1 — Calm morning (6s)
```
[character block] entering a tidy home office in soft morning light, setting down a coffee mug
and opening a laptop with a hopeful relaxed expression. Gentle slow push-in, warm cinematic tone,
calm optimistic mood.
```
**Caption:** `Meet a social media manager.`

### Scene 2 — The demand hits (6s)
```
[character block] seated at her desk glancing at her phone as a message notification arrives,
her relaxed smile fading into concern, soft blue screen light on her face. Locked camera with a
subtle push-in, tension building, cinematic.
```
**Caption:** `"We need this on every platform. Today."`

### Scene 3 — Tool chaos (8s)
```
[character block] overwhelmed at her desk, surrounded by many floating translucent app windows and
three smartphones showing mismatched vertical, square, and landscape video crops, rubbing her
temples while a wall clock spins fast behind her. Handheld subtle camera, moody overhead light with
harsh screen glare, overwhelmed frustrated mood.
```
**Caption:** `Edit. Resize. Caption. Schedule. Repeat.`

### Scene 4 — Defeat (6s)
```
[character block] slumping forward with her head resting in her hands, multiple glowing screens
reflecting on her face, papers and coffee cups scattered across the desk. Slow dolly-in, low-key
lighting, discouraged mood.
```
**Caption:** `4 platforms. 4 formats. Hours gone.`

### Scene 5 — Discovery (5s)
```
[character block] lifting her head and noticing a single clean glowing screen on her monitor
emitting a calm blue-violet light, curiosity and hope returning to her face as the surrounding
clutter fades into soft shadow. Slow push-in toward the glow, hopeful turning-point mood. Leave the
monitor screen blank and abstract for a logo overlay.
```
**Caption:** `Then she found Admart.`
*(In the editor, composite the Admart logo onto the glowing monitor.)*

### Scene 10 — Relief (7s)
```
[character block] leaning back in her chair with a relaxed satisfied smile, sipping coffee, the desk
now tidy, warm golden-hour light mixing with soft blue tech glow, her phone lighting up with
notification pings. Slow dolly-in, calm triumphant mood.
```
**Caption:** `Minutes, not days.`

### Scene 11 — Reach (5s)
```
[character block] smiling confidently at her clean desk as four glowing platform icon badges in
cyan, red, pink-purple, and blue light up and float upward around her like rising engagement, warm
celebratory atmosphere. Slow orbital camera, uplifting brand-finale mood.
```
**Caption:** `Create AI videos. Publish everywhere.`

### Scene 12 — Logo + QR end card (4s)
Best built in the **editor** as a static card (crisp logo + real QR). Optional Veo3 backing plate:
```
Abstract dark charcoal background with soft blue-to-violet gradient light particles gently drifting
toward center, clean empty negative space in the middle, premium SaaS end-card, slow subtle motion.
No text.
```
**Overlay in editor:** `Admart` logo · `Create AI Videos. Publish Everywhere.` · **[QR code]** · `Start free →`

---

## Screen-recording scenes (the real product)

**Setup once:**
- `npm run dev` → open `http://localhost:5173` in a clean browser (no bookmarks bar, no extensions), dark theme.
- Record at **1920×1080**, 60fps (OBS Studio or system recorder).
- Pre-create a demo project; pre-decide the prompt text so it reads intentional.
- Move the cursor **slowly**; pause **2s** on each click. The app runs on mock data, so the full flow (progress, result, publish) plays without a backend.

### Scene 6 — Describe your idea (6s) · route `/create`, step **Input**
1. Cursor selects the **Text to Video** tab.
2. Click the prompt field, type: `30-second promo for a smart water bottle, upbeat, young fitness audience`.
3. Hold 2s so it's readable.

**Caption:** `1 · Describe your idea`

### Scene 7 — Format + platforms (6s) · step **Configure**
1. Advance to **Configure**.
2. Pick an **aspect** (16:9 or 9:16), **1080p** resolution, and a **style**.
3. Toggle all four platforms: **TikTok · YouTube · Instagram · Facebook**.

**Caption:** `2 · Pick format + every platform`

### Scene 8 — AI builds it (7s) · step **Enhance** → **Generate** → `/progress`
1. On **Enhance**, toggle captions / voiceover / music ON.
2. Click **Generate**.
3. Cut to `/progress` — let the progress ring animate.

**Caption:** `3 · AI builds it — captions, music, done`

### Scene 9 — Publish everywhere (6s) · `/result` → `/publish`
1. `/result` — preview the generated video.
2. Click **Publish**; on `/publish` show all four accounts connected.
3. Click **Publish now**.

**Caption:** `One click. Published everywhere.`

---

## Caption / subtitle style (silent = this is the narrator)

| Setting | Value |
|---|---|
| Font | Bold sans (Syne / DM Sans Bold) |
| Size | Large — readable from 3m |
| Color | White on a semi-transparent dark bar |
| Position | Lower-third (or centered on story beats) |
| Highlight | Key words in blue `#2563eb` / violet `#7c3aed` |
| Always accent | `Admart`, `AI`, `Publish`, `Free` |

---

## Assembly & export

1. Import all Veo3 clips + the 4 screen recordings into **CapCut / DaVinci Resolve / Premiere**.
2. Lay them out in shot-list order; use **cross-dissolves** between beats (hard cut into the screen-rec block for punch).
3. **Burn in** the captions per the style table.
4. Composite the Admart logo onto the Scene 5 monitor and build the Scene 12 end card.
5. (Optional) add a soft instrumental music bed at low volume.
6. **Make it loop:** match the last frame's tone to Scene 1 (calm) so the cut back is invisible; enable loop/repeat in the TV's media player.
7. Export **1920×1080 H.264 MP4**, high bitrate.

---

## Booth checklist

- [ ] Exported 16:9, plays fullscreen on the actual TV
- [ ] Tested **muted** on the real screen — every caption legible from ~3m
- [ ] Player set to **loop**
- [ ] QR code points to the real Admart URL and scans from phone distance
- [ ] Screen recording shows **Admart** branding (UI renamed — done)
- [ ] Character looks identical across all Veo3 clips (used image-to-video or the character block)

---

## Where to make everything (tool map)

| Step | Do it in | Notes |
|---|---|---|
| 1. Character image | **Gemini app** or **Google AI Studio** (Nano Banana / Imagen) | Paste the character-reference prompt; pick the best of a few. Save as PNG. Alt: Midjourney / Ideogram. |
| 2. Human story clips (scenes 1–5, 10, 11) | **Google Flow** — `labs.google/flow` | Use **Ingredients / Frames-to-Video (image-to-video)** with the character image for consistency. |
| 3. Abstract brand plate / B-roll (scene 12) | **Gemini app** or **Flow** (Veo 3, text-to-video) | No character needed. |
| 4. Product demo (scenes 6–9) | **OBS Studio** (free) — screen recording | Record the real Admart app at 1920×1080. Never AI-generate the UI. |
| 5. Assemble + captions + loop | **CapCut** (easiest) or **DaVinci Resolve** | Burn in captions, cross-dissolves, export 1080p MP4, loop on the TV. |

**Access & credits (verified):**
- Veo 3 is available in the **Gemini app** (Google AI Pro/Ultra), **Google Flow**, **Google AI Studio** (Gemini API), and **Vertex AI**.
- Veo 3 clips **cap at ~8 seconds** — each scene here = one generation.
- **Image-to-video (Frames-to-Video) costs more credits** (~100/gen reported) and **Gemini Pro allows ~3 Veo 3 clips/day**. For ~10 clips, **Google AI Ultra** is the realistic tier.
- Character consistency across clips **only holds** when you drive it from the reference image — always image-to-video for the human scenes.

**Work order:** character image → Flow image-to-video (human clips) → Veo text-to-video (plate) → OBS (product) → CapCut/DaVinci (assemble + captions + loop).
