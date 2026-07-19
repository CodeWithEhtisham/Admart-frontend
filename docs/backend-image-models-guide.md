# Backend Guide — fal.ai Image Models (Allow-list & Wiring)

> Audience: **backend team**  
> Purpose: Make every model the frontend offers actually work end-to-end  
> Related: [`backend-image-generation.md`](./backend-image-generation.md) (full API), [`frontend-image-generation.md`](../frontend-image-generation.md)  
> Frontend source of truth: `src/utils/imageGeneration.js`

---

## 1. Why this guide exists

Frontend calls **your** API only. You call **fal.ai** with `FAL_KEY`.

If the FE sends a model id that is **not** on your per-capability allow-list, the user sees:

```text
Model not allowed for edit: openai/gpt-image-2/edit
```

That message is from **your backend**, not from fal.

| Check | Result |
| ----- | ------ |
| Model on [fal.ai](https://fal.ai/models/openai/gpt-image-2/edit)? | Yes — HTTP 200 |
| FE sending correct id? | Yes — `openai/gpt-image-2/edit` |
| BE allow-list includes it? | **No** (this is the bug) |

**Fix:** add the exact id string to the allow-list for that capability. Do not prefix with `fal-ai/` for OpenAI partner models.

---

## 2. Mental model

```
FE picker  →  POST /api/projects/:id/images/jobs { capability, model, … }
                    ↓
              validate capability
                    ↓
              model ∈ ALLOW_LIST[capability]   ←── you control this
                    ↓
              map camelCase → fal input
                    ↓
              fal.subscribe(model, input) / queue.submit(model, input)
```

Rules:

1. Allow-list keys = **exact fal endpoint ids** (as used in `fal.subscribe("…")`).
2. Partner models use their own namespace: `openai/…`, not `fal-ai/openai/…`.
3. Edit endpoints usually end with `/edit`. Text-to-image endpoints do not.
4. Reject unknown models with `400` and a clear message FE can show.

Suggested error body:

```json
{
  "message": "Model not allowed for edit: openai/gpt-image-2/edit",
  "code": "MODEL_NOT_ALLOWED",
  "capability": "edit",
  "model": "openai/gpt-image-2/edit"
}
```

---

## 3. Copy-paste allow-lists (recommended)

Use these sets so FE and BE stay in sync. Update both when you add a model.

```python
# Example Django / Python — adapt to your stack

IMAGE_MODEL_ALLOWLIST = {
    "textToImage": {
        "fal-ai/flux/dev",
        "fal-ai/flux/schnell",
        "fal-ai/nano-banana-2",
        "fal-ai/nano-banana-pro",
        "fal-ai/ideogram/v3",
        "openai/gpt-image-2",          # partner — NOT fal-ai/openai/…
    },
    "edit": {
        "fal-ai/nano-banana-2/edit",
        "fal-ai/nano-banana-pro/edit",
        "fal-ai/flux-pro/kontext",
        "openai/gpt-image-2/edit",     # ← ADD THIS (fixes current error)
    },
    "multiEdit": {
        "fal-ai/nano-banana-2/edit",
        "fal-ai/nano-banana-pro/edit",
        "openai/gpt-image-2/edit",
    },
    "upscale": {
        "fal-ai/esrgan",
        "fal-ai/seedvr/upscale/image",
        "fal-ai/topaz/upscale/image",
        "fal-ai/recraft/upscale/crisp",
        "fal-ai/ideogram/upscale",
    },
    "removeBackground": {
        "fal-ai/birefnet/v2",          # preferred default
        "fal-ai/birefnet",
        "fal-ai/bria/background/remove",
    },
}

DEFAULT_MODELS = {
    "textToImage": "fal-ai/flux/dev",
    "edit": "fal-ai/nano-banana-2/edit",
    "multiEdit": "fal-ai/nano-banana-pro/edit",
    "upscale": "fal-ai/esrgan",
    "removeBackground": "fal-ai/birefnet/v2",
}


def resolve_model(capability: str, model: str | None) -> str:
    allowed = IMAGE_MODEL_ALLOWLIST.get(capability)
    if not allowed:
        raise ValueError(f"Unknown capability: {capability}")
    resolved = model or DEFAULT_MODELS[capability]
    if resolved not in allowed:
        raise PermissionError(
            f"Model not allowed for {capability}: {resolved}"
        )
    return resolved
```

### Immediate fix for the reported bug

Add **exactly**:

```text
openai/gpt-image-2/edit
```

to `IMAGE_MODEL_ALLOWLIST["edit"]` (and `"multiEdit"` if you support multi-image with it).

Then tell frontend to re-enable GPT Image 2 Edit in the picker.

---

## 4. Verified fal endpoint ids (checked July 2026)

All of these returned **HTTP 200** on `https://fal.ai/models/<id>/api`:

### Text to image

| Label | Endpoint id | Docs |
| ----- | ----------- | ---- |
| Flux Dev | `fal-ai/flux/dev` | [link](https://fal.ai/models/fal-ai/flux/dev/api) |
| Flux Schnell | `fal-ai/flux/schnell` | [link](https://fal.ai/models/fal-ai/flux/schnell/api) |
| Nano Banana 2 | `fal-ai/nano-banana-2` | [link](https://fal.ai/models/fal-ai/nano-banana-2/api) |
| Nano Banana Pro | `fal-ai/nano-banana-pro` | [link](https://fal.ai/models/fal-ai/nano-banana-pro/api) |
| Ideogram V3 | `fal-ai/ideogram/v3` | [link](https://fal.ai/models/fal-ai/ideogram/v3/api) |
| GPT Image 2 | `openai/gpt-image-2` | [link](https://fal.ai/models/openai/gpt-image-2/api) |

### Edit

| Label | Endpoint id | Docs |
| ----- | ----------- | ---- |
| Nano Banana 2 Edit | `fal-ai/nano-banana-2/edit` | [link](https://fal.ai/models/fal-ai/nano-banana-2/edit/api) |
| Nano Banana Pro Edit | `fal-ai/nano-banana-pro/edit` | [link](https://fal.ai/models/fal-ai/nano-banana-pro/edit/api) |
| Flux Kontext Pro | `fal-ai/flux-pro/kontext` | [link](https://fal.ai/models/fal-ai/flux-pro/kontext/api) |
| GPT Image 2 Edit | `openai/gpt-image-2/edit` | [link](https://fal.ai/models/openai/gpt-image-2/edit/api) |

### Upscale

| Label | Endpoint id |
| ----- | ----------- |
| ESRGAN | `fal-ai/esrgan` |
| SeedVR2 | `fal-ai/seedvr/upscale/image` |
| Topaz | `fal-ai/topaz/upscale/image` |
| Recraft Crisp | `fal-ai/recraft/upscale/crisp` |
| Ideogram Upscale | `fal-ai/ideogram/upscale` |

### Remove background

| Label | Endpoint id |
| ----- | ----------- |
| BiRefNet v2 | `fal-ai/birefnet/v2` |
| BiRefNet | `fal-ai/birefnet` |
| Bria RMBG | `fal-ai/bria/background/remove` |

### Do **not** use (404 / wrong)

| Wrong id | Why |
| -------- | --- |
| `fal-ai/openai/gpt-image-2` | 404 — use `openai/gpt-image-2` |
| `fal-ai/openai/gpt-image-2/edit` | 404 — use `openai/gpt-image-2/edit` |
| `fal-ai/flux/kontext/pro` | 404 — use `fal-ai/flux-pro/kontext` |
| `fal-ai/flux-pro/kontext/pro` | 404 — use `fal-ai/flux-pro/kontext` |

---

## 5. How to call fal (server-side only)

### Env

```bash
FAL_KEY=...          # secret — never expose to Vite / browser
```

### Python example

```python
import fal_client

def submit_image_job(model: str, fal_input: dict) -> str:
    """Returns fal request_id. Run in a worker — do not block the HTTP request."""
    handler = fal_client.submit(model, arguments=fal_input)
    return handler.request_id

def fetch_image_result(model: str, request_id: str) -> dict:
    return fal_client.result(model, request_id)
```

### Node example

```js
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

const { request_id } = await fal.queue.submit("openai/gpt-image-2/edit", {
  input: {
    prompt: "Replace background with soft beige studio",
    image_urls: ["https://your-cdn.com/upload.png"],
  },
});
```

**Never** put `FAL_KEY` in frontend env.

---

## 6. Minimal fal input examples

### Text to image — Flux

```json
{
  "prompt": "Matte black water bottle on marble",
  "image_size": "square_hd",
  "num_images": 1,
  "output_format": "png"
}
```

Model: `fal-ai/flux/dev`  
Map FE `aspectRatio: "1:1"` → `image_size: "square_hd"`.

### Text to image — Nano Banana

```json
{
  "prompt": "…",
  "aspect_ratio": "1:1",
  "resolution": "1K",
  "num_images": 1,
  "output_format": "png"
}
```

Model: `fal-ai/nano-banana-2`

### Edit — GPT Image 2

```json
{
  "prompt": "Replace the background with a soft beige studio backdrop",
  "image_urls": ["https://cdn.example.com/product.png"],
  "image_size": "auto",
  "num_images": 1,
  "output_format": "png"
}
```

Model: **`openai/gpt-image-2/edit`**  
FE field `imageUrls` → fal `image_urls`.

### Remove BG — BiRefNet v2

```json
{
  "image_url": "https://cdn.example.com/product.jpg"
}
```

Model: `fal-ai/birefnet/v2`  
(Confirm exact field names on the fal model page — some rembg tools use `image_url` singular.)

---

## 7. Create-job checklist (backend)

On `POST /api/projects/:projectId/images/jobs`:

1. [ ] Auth JWT + project ownership  
2. [ ] Validate `capability` ∈ `textToImage | edit | multiEdit | upscale | removeBackground`  
3. [ ] Resolve `model` (request or default)  
4. [ ] **`model` ∈ allow-list for that capability** ← missing step caused the bug  
5. [ ] Validate prompt / `imageUrls` per capability  
6. [ ] Map camelCase → fal snake_case (see full API doc §7)  
7. [ ] Check credits → `402` if insufficient  
8. [ ] Persist job `queued`, submit to fal in worker  
9. [ ] Poll/webhook → `running` → `succeeded` / `failed`  
10. [ ] Copy fal result URLs to your CDN; return durable URLs in `images[]`

---

## 8. Optional: expose catalog to FE

So the FE does not hardcode models:

```
GET /api/images/models
```

or

```
GET /api/projects/:projectId/images/models
```

Response:

```json
{
  "textToImage": [
    { "id": "fal-ai/flux/dev", "label": "Flux Dev", "family": "flux", "default": true },
    { "id": "openai/gpt-image-2", "label": "GPT Image 2", "family": "openai", "default": false }
  ],
  "edit": [
    { "id": "fal-ai/nano-banana-2/edit", "label": "Nano Banana 2 Edit", "default": true },
    { "id": "openai/gpt-image-2/edit", "label": "GPT Image 2 Edit", "default": false }
  ],
  "multiEdit": [ … ],
  "upscale": [ … ],
  "removeBackground": [ … ]
}
```

**Rule:** only return models that are on your allow-list. FE will then never offer a blocked model.

---

## 9. How to add a new fal model (process)

1. Open the model page on fal → copy **Endpoint ID** from the API tab.  
2. Confirm `https://fal.ai/models/<id>/api` returns 200.  
3. Add id to the correct capability allow-list.  
4. Implement field mapping for that family’s inputs.  
5. Add credit cost.  
6. (Optional) Return it from `GET …/images/models`.  
7. Tell FE to add the same id to `src/utils/imageGeneration.js` (or rely on the catalog endpoint).

---

## 10. Smoke tests

```bash
# 1) Text to image (Flux)
curl -s -X POST "$API/api/projects/$PID/images/jobs" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"capability":"textToImage","model":"fal-ai/flux/dev","prompt":"red apple on white","aspectRatio":"1:1","numImages":1}'

# 2) Edit (Nano) — should succeed if upload URL is public
curl -s -X POST "$API/api/projects/$PID/images/jobs" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"capability":"edit","model":"fal-ai/nano-banana-2/edit","prompt":"make sky sunset","imageUrls":["https://…/in.png"]}'

# 3) Edit (GPT) — must NOT return "Model not allowed" after allow-list fix
curl -s -X POST "$API/api/projects/$PID/images/jobs" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"capability":"edit","model":"openai/gpt-image-2/edit","prompt":"soft beige background","imageUrls":["https://…/in.png"]}'
```

Poll:

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/api/projects/$PID/images/jobs/$JOB_ID"
```

Expect `status` → `succeeded` and non-empty `images[].url`.

---

## 11. Frontend sync after you fix allow-list

Once `openai/gpt-image-2/edit` is allowed:

1. FE re-adds it to `EDIT_MODELS` in `src/utils/imageGeneration.js`  
2. FE re-adds it to Create wizard `IMAGE_EDIT_MODELS`  
3. Users can pick **GPT Image 2 Edit** again  

Until then, FE **hides** that option so users do not hit the 400.

---

## 12. Security reminders

- [ ] `FAL_KEY` server-only  
- [ ] Allow-list every model before calling fal  
- [ ] Scope jobs to project ownership  
- [ ] SSRF-safe `imageUrls` (prefer your upload CDN only)  
- [ ] Do not forward unknown client fields blindly into fal  

---

## 13. Quick reference — FE ↔ BE

| FE capability | Typical models FE may send |
| ------------- | -------------------------- |
| `textToImage` | `fal-ai/flux/dev`, `fal-ai/nano-banana-2`, `openai/gpt-image-2`, … |
| `edit` | `fal-ai/nano-banana-2/edit`, `fal-ai/flux-pro/kontext`, `openai/gpt-image-2/edit` |
| `multiEdit` | `fal-ai/nano-banana-pro/edit`, … |
| `upscale` | `fal-ai/esrgan`, … |
| `removeBackground` | `fal-ai/birefnet/v2`, … |

Full request/response shapes: [`backend-image-generation.md`](./backend-image-generation.md).

---

*Last verified against fal.ai model pages: July 2026.*
