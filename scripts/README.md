# scripts/ — Pipeline scripts for multilingual transcripts + audio

These are **offline** scripts run from a developer machine. They are
not deployed with the app. Both require the Supabase **service role
key** (write access), not the anon key.

## translate-transcripts.mjs

Translates all Korean (`ko`) rows in `video_transcripts` into the 12
other locales supported by the UI. Idempotent — re-running skips rows
that already have a translation for the target locale.

### Prerequisites

```bash
# Environment
export NEXT_PUBLIC_SUPABASE_URL=https://qdhkeiblhqprsghvyoqe.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<your service key>
export OPENAI_API_KEY=<your openai key>
```

### Usage

```bash
# Translate into all 12 target locales
node scripts/translate-transcripts.mjs

# Translate only specific locales
node scripts/translate-transcripts.mjs en ja fr

# Dry run (no DB writes)
node scripts/translate-transcripts.mjs --dry
```

### Cost estimate

- Model: `gpt-4o-mini` ($0.15 per 1M input tokens)
- Scope: 192 segments × 12 locales × ~80 tokens ≈ 184K tokens
- **~$0.03 USD one-time**

### What it does

1. `SELECT * FROM video_transcripts WHERE locale IN ('ko', NULL)`
2. For each target locale, batches 20 lines at a time to OpenAI with
   a translation prompt that preserves proper nouns and historical
   terms.
3. `INSERT INTO video_transcripts` with `locale = <target>` and
   `source_id = <original row id>`.

The LearnClient component automatically filters transcripts by the
current UI locale (with Korean fallback), so once the rows exist the
UI shows the right language without any code changes.

---

## generate-tts.mjs

Generates dubbed audio tracks for every video × locale using the
**translated** transcripts already in Supabase (run
`translate-transcripts.mjs` first).

Two backend options:

### Option A: edge-tts (free, recommended)

Microsoft Neural voices via the open-source `edge-tts` Python CLI.
Free, high-quality, broad language coverage.

```bash
# Install edge-tts
pip install edge-tts

# Install ffmpeg (required for concatenating segment audio)
brew install ffmpeg                # macOS
sudo apt-get install ffmpeg        # Ubuntu
winget install Gyan.FFmpeg         # Windows

# Environment
export NEXT_PUBLIC_SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
export TTS_PROVIDER=edge

# Run
node scripts/generate-tts.mjs                # all locales
node scripts/generate-tts.mjs en ja fr       # specific locales
node scripts/generate-tts.mjs --dry          # preview only
```

### Option B: OpenAI `gpt-4o-mini-tts` (paid, higher quality)

```bash
export TTS_PROVIDER=openai
export OPENAI_API_KEY=...
node scripts/generate-tts.mjs
```

Cost: ~$15 per 1M chars. 192 segments × 13 locales × ~50 chars ≈
120K chars ≈ **$1.80 USD one-time** (gpt-4o-mini-tts tier).

### What it does

For each video × locale:

1. Fetches all translated transcripts for that (video, locale) pair.
2. Synthesizes each segment to its own MP3 via the chosen TTS
   backend.
3. Uses `ffmpeg` to concatenate segments with silence padding
   between them so the timing matches the video's `start_seconds`
   timeline.
4. Uploads the final MP3 to Supabase Storage at
   `audio/dubs/{videoId}/{locale}.mp3`.
5. Upserts a row in `video_audio_tracks` so `getRelatedVideos()`
   picks it up on the next page render.

### Voice mapping

| Locale | edge-tts voice | OpenAI voice |
|---|---|---|
| en | en-US-AriaNeural | alloy |
| ja | ja-JP-NanamiNeural | nova |
| zh-CN | zh-CN-XiaoxiaoNeural | shimmer |
| zh-HK | zh-HK-HiuMaanNeural | shimmer |
| ru | ru-RU-SvetlanaNeural | onyx |
| es | es-ES-ElviraNeural | nova |
| fr | fr-FR-DeniseNeural | nova |
| ar | ar-SA-ZariyahNeural | alloy |
| vi | vi-VN-HoaiMyNeural | shimmer |
| af | af-ZA-AdriNeural | alloy |
| qu | es-PE-CamilaNeural (fallback — no native voice) | alloy |
| fj | en-GB-SoniaNeural (fallback — no native voice) | alloy |

Quechua and Fijian don't have native TTS voices in Azure's catalog,
so they fall back to Spanish (Peruvian) and English (British)
respectively. The transcripts are still translated to those languages
and displayed in the sidebar; only the spoken audio uses a
phonetically-compatible fallback.

---

## Supabase Storage bucket

The TTS script expects a public `audio` bucket. Create it once:

```sql
-- Via Supabase Dashboard → Storage → New bucket
-- Name: audio
-- Public: true (read-only)
```

Or the script will auto-create it on first run if it has service-role
permissions.

---

## Running order

```bash
# 1) Translate all Korean transcripts into all 12 locales
node scripts/translate-transcripts.mjs

# 2) Generate dubbed audio for all (video, locale) pairs
node scripts/generate-tts.mjs

# 3) Deploy front-end
npx vercel --prod
```

The Next.js app reads from the same Supabase project, so as soon as
the rows are inserted the site picks them up on the next page render.
No code changes needed.
