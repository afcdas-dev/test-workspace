---
name: motion-design
description: >
  Motion design creation skill powered by fal.ai. Trigger this skill whenever the user asks to create motion design, animate a logo, make a video from an image, create an animated ad, turn a product into motion, or says anything like "make a motion", "motion design", "animate this", "make a video from my logo", "animated brand", "motion graphics", "brand motion", "kinetic graphics", "promo video", "ad video". Always use this skill. Don't try to handle motion design requests without it.
---

# Motion Design Skill (fal.ai)

You are guiding the user through a full motion design creation flow using the fal.ai API. Follow each step in order. Be concise and direct. Speak in the same language the user is using.

---

## STEP 0 — Determine the flow type

Before anything else, identify which workflow applies:

**classicMD** — standard ads, brand promos, service presentations, logo reveals, general atmospheric content.
**highMD** — sports promos, tech product launches, music teasers, AI capability demos, fashion drops. Prioritizes extreme camera speed, aggressive cuts, peak dynamics. Realistic people are replaced by silhouettes, chrome elements, or 3D abstract figures.

If the user's request makes the flow obvious, proceed silently. If ambiguous, ask:

> "Which style fits your project better?"

Options:
- **Classic Motion** — smooth transitions, elegant typography, cinematic feel
- **Hyper / Kinetic** — fast cuts, extreme dynamics, aggressive transitions, CGI energy

---

## STEP 0.5 — fal.ai API key setup (required, first run)

This skill runs entirely on the fal.ai API. Before any generation:

1. Check whether a fal API key is already available in the session (env var `FAL_KEY`).
2. If not, ask the user:

> "I need your fal.ai API key to generate images and video. You can create one at https://fal.ai/dashboard/keys. Paste it here."

3. Once provided, export it for the session:

```bash
export FAL_KEY="<user_provided_key>"
```

4. Verify the key works with a lightweight request before proceeding (e.g. submit a status check or a minimal request; if it returns 401, tell the user the key is invalid and ask again).

**Never proceed to generation without a working key. Never print the key back to the user or include it in any output file.**

### How to call fal.ai (used in all later steps)

All generation uses the fal queue API via `curl`:

**Submit a job:**
```bash
curl -s -X POST "https://queue.fal.run/<MODEL_ID>" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '<JSON_INPUT>'
```
This returns a `request_id` and status/response URLs.

**Poll status:**
```bash
curl -s "https://queue.fal.run/<MODEL_ID>/requests/<REQUEST_ID>/status" \
  -H "Authorization: Key $FAL_KEY"
```
Poll every 5-10 seconds until status is `COMPLETED`. Video jobs can take 1-5 minutes.

**Fetch result:**
```bash
curl -s "https://queue.fal.run/<MODEL_ID>/requests/<REQUEST_ID>" \
  -H "Authorization: Key $FAL_KEY"
```
The result JSON contains output URLs (`images[].url` or `video.url`). Download the file with `curl -o`, save it to `/mnt/user-data/outputs/`, and present it to the user with `present_files`.

---

## STEP 1 — Brief intake (single message, all at once)

Ask all intake questions in **one message** using `ask_user_input_v0`. Do not split into multiple questions.

Questions to ask simultaneously:

1. **Do you have existing assets?**
   - Yes — I'll upload a logo / product photo / reference
   - No — help me create the visual

2. **Video duration:**
   - 5 sec — teaser / logo sting
   - 10 sec — standard post / stories
   - 15 sec — promo / product video

3. **Frame format:**
   - 16:9 — horizontal (YouTube, website)
   - 9:16 — vertical (Reels, TikTok, Stories)
   - 1:1 — square (Feed)

4. **Mood / style:** *(free input)*
   Example prompts: energetic, minimalist, luxury, technological, atmospheric, aggressive, cinematic

5. **Brand name / product name and tagline** *(if any)*

6. **Number of storyboard frames:**
   - 6 frames — standard
   - 8 frames — detailed
   - 9 frames — maximum coverage

Save all answers before proceeding.

---

## STEP 2 — Asset handling

### If user HAS assets:

Ask them to upload the file directly in chat. Accept PNG, JPG, SVG, or any image.

Once uploaded, the file is available at `/mnt/user-data/uploads/`. To pass it to fal.ai, convert it to a base64 data URI (fal accepts data URIs anywhere an `image_url` is expected):

```bash
IMG_B64=$(base64 -w 0 /mnt/user-data/uploads/<file>)
DATA_URI="data:image/png;base64,$IMG_B64"
```

If the file is SVG, rasterize it to PNG first (e.g. with `rsvg-convert` or ImageMagick) before encoding. Then proceed to **STEP 3**.

### If user has NO assets:

Generate a base visual with a fal.ai image model. Construct a prompt from their brief: brand name, mood, style, color palette, aspect ratio.

Model priority (verify availability at https://fal.ai/models if a call 404s):
1. `fal-ai/nano-banana` (text-to-image, strong text rendering for brand names)
2. `fal-ai/flux-pro/v1.1-ultra`
3. `fal-ai/flux/dev`

Example input JSON:
```json
{
  "prompt": "<constructed prompt>",
  "aspect_ratio": "<16:9 | 9:16 | 1:1>"
}
```

Download the result image, save to outputs, and show it to the user.

Ask: "Does this image work or would you like changes?" — if changes needed, regenerate with adjusted prompt. Once approved, proceed.

---

## STEP 3 — Generate the Storyboard

This is the core creative step. Generate a storyboard with N frames (where N = the count chosen in Step 1: 6, 8, or 9).

**Each frame must:**
- Be visually consistent with the approved asset / generated image
- Represent a distinct moment in time (opening → build → climax → resolution → logo lock)
- Show camera position, subject state, motion blur / freeze where relevant
- Include a 2-4 word text caption burned into the frame (scene label, not subtitle)

**For classicMD frames:** smooth compositions, elegant typography zones, cinematic lighting.
**For highMD frames:** peak-action freeze frames — frozen splashes, shattered elements, material stretch, aggressive camera angles, neon contrast.

**Generation approach:**

Make **one** call to an image-editing model that accepts a reference image, generating a **single storyboard sheet** — one image containing all N panels arranged in a grid. Do NOT generate N separate images.

Model priority:
1. `fal-ai/nano-banana/edit` (reference image + prompt)
2. `fal-ai/flux-pro/kontext` (image editing with reference)

Input JSON shape:
```json
{
  "prompt": "<storyboard prompt below>",
  "image_urls": ["<DATA_URI or approved image URL>"]
}
```

Construct the prompt as:
```
Storyboard sheet with [N] sequential panels in a grid layout, each panel labeled "Frame 1", "Frame 2", etc. Panel 1: [scene description]. Panel 2: [scene description]. ... Panel N: [logo lock / brand name]. Each panel shows: [camera angle], [motion state], [mood/lighting]. Visual style: [cinematic/kinetic]. Consistent color palette throughout. Clean storyboard design, thin border between panels, [aspect ratio per panel].
```

Download the generated sheet, save to outputs, present it.

Then present the storyboard summary:

---
**Storyboard — [Brand Name]**
🎬 Frame 1: [brief scene description]
✨ Frame 2: [brief scene description]
... (all frames)
🏁 Frame N: [logo lock / CTA]

**Mood:** [mood]
**Motion:** [motion description — e.g. spiral flythrough, match-cut, slow push]
**Ending:** [how the video ends]
---

Ask:
> "How does the storyboard look? Approve or any changes?"

Options:
- **Approve ✅** — proceed to STEP 4
- **Changes needed** — ask what to change, regenerate the storyboard sheet with corrections, repeat approval

---

## STEP 4 — Generate the Video

Once the storyboard is approved, generate the final video with a fal.ai video model, image-to-video, using the brand asset as the start frame.

Model priority (verify current IDs at https://fal.ai/models, search "seedance" / "kling" / "veo"):
1. `fal-ai/bytedance/seedance/v1/pro/image-to-video`
2. `fal-ai/kling-video/v2.1/pro/image-to-video`
3. `fal-ai/minimax/hailuo-02/pro/image-to-video`

**Construct the video generation prompt** combining:
- Approved storyboard narrative (scene sequence)
- Flow type (classicMD / highMD)
- Duration from Step 1
- Aspect ratio from Step 1
- Mood and style from Step 1
- Brand name / slogan for logo lock at the end

**classicMD prompt template:**
```
[Style]: smooth motion design, [scene flow from storyboard], elegant transitions, [mood] atmosphere, cinematic camera movement, [duration]s, brand reveal at end: [brand name], [aspect ratio]
```

**highMD prompt template:**
```
[Style]: high-intensity kinetic motion, [scene flow from storyboard], extreme camera speed, aggressive match-cuts, peak-action freeze frames, [mood] CGI aesthetic, neon contrast, [duration]s, hard stop logo lock: [brand name], [aspect ratio]
```

**For highMD:** the final seconds must be a static hold on the brand name / logo — build this into the prompt explicitly. Scale proportionally: ~1 sec for 5s clips, ~2 sec for 10s clips, ~2-3 sec for 15s clips.

Input JSON shape (adjust field names to the chosen model's schema):
```json
{
  "prompt": "<constructed video prompt>",
  "image_url": "<DATA_URI of original asset, or URL of approved base image>",
  "duration": "<5 | 10>",
  "aspect_ratio": "<16:9 | 9:16 | 1:1>"
}
```

If the model caps duration below the requested length (most cap at 5-10s), generate the longest supported clip and tell the user; offer to generate an extension clip and stitch with `ffmpeg` if 15s was requested.

Poll until `COMPLETED`, download `video.url` with `curl -o`, save the .mp4 to `/mnt/user-data/outputs/`, and present it with `present_files`.

---

## STEP 5 — Review & Iterate

When the video renders, present it and ask:

> "Done! 🎬 What do you think?"

Options:
- **Love it, downloading ✅** — done
- **Want a different edit** — regenerate with adjusted prompt (keep same storyboard)
- **Want a different style** — go back to Step 1 with new style/mood
- **Make another version** — generate a second version in parallel with slight prompt variation

---

## Notes & Rules

- **This skill uses fal.ai only.** Never call Higgsfield or any other provider's tools, even if a Higgsfield connector is available.
- **API key first:** Step 0.5 is mandatory on first run. No generation without a verified `FAL_KEY`. Never echo the key or write it into any output file.
- **All calls via curl** against `https://queue.fal.run/<MODEL_ID>` with `Authorization: Key $FAL_KEY`. Submit → poll → fetch result → download output → present file.
- **Always ask all intake questions at once** in Step 1 — never split into multiple rounds.
- **Model IDs drift.** If a call returns 404, check https://fal.ai/models for the current endpoint ID before retrying. Fall back down the priority list.
- **Storyboard = one image** — a single grid sheet with all N panels, generated in one call. Never generate N separate images.
- **No moodboard step** — go directly from brief to storyboard.
- **highMD rule:** no realistic humans — only silhouettes, chrome figures, 3D abstract shapes.
- **highMD rule:** logo lock duration is proportional to clip length (~1s / ~2s / ~2-3s for 5s / 10s / 15s clips), built into the prompt.
- **classicMD logo:** can appear as opener, closer, or both — ask if not specified.
- **Language:** always match the user's language.
- If the user asks about cost, point them to their fal.ai dashboard billing page; there is no in-chat balance tool.
- If generation fails — show the API error briefly and offer retry with adjusted parameters. On 401, re-ask for the key. On 429, wait and retry.
