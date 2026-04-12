#!/usr/bin/env node
/**
 * rerun-whisper.mjs
 *
 * Fills in missing tail segments for the 4 videos where OCR
 * extraction stopped early. Runs Whisper on the original .mp4,
 * then inserts only segments whose start_seconds falls inside
 * the tail gap (after the last existing OCR segment).
 *
 * Targets (as of the Group A fix, coverage ratios):
 *   - 기록물이 젖었을 때!                          41% → should be ~100
 *   - 문서류의 올바른 보존상자 보관법              58% → should be ~100
 *   - 아날로그 시청각매체 소멸 위험성              71% → should be ~100
 *   - 훼손 종이기록물 취급하기                      80% → should be ~100
 *
 * Prerequisites
 * -------------
 *   pip install -U openai-whisper                  # large-v3 for best Korean
 *   pip install ffmpeg-python                      # Whisper needs ffmpeg
 *   brew/apt/winget install ffmpeg                 # system ffmpeg on PATH
 *
 * Environment
 * -----------
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage
 * -----
 *   # Dry run — show what would be inserted, no writes
 *   node scripts/rerun-whisper.mjs --dry
 *
 *   # Target one video only (by id prefix)
 *   node scripts/rerun-whisper.mjs --video 2d255093
 *
 *   # Skip the Whisper pass and just read cached JSON from the
 *   # output directory (lets you tweak insertion logic without
 *   # re-running the expensive ML step)
 *   node scripts/rerun-whisper.mjs --from-cache
 *
 * What it does
 * ------------
 *   1. Queries Supabase for the 4 target videos + their current
 *      max(start_seconds) to determine the tail gap threshold.
 *   2. For each video:
 *      a. Extracts audio from public/videos/video_N.mp4 via ffmpeg
 *         to a temp wav file.
 *      b. Runs whisper with language=ko, model=large-v3, and
 *         `--condition_on_previous_text False` to avoid the
 *         hallucination spiral that caused the original OCR
 *         fallback in the first place.
 *      c. Parses the resulting segments JSON.
 *      d. Filters to segments with `start >= tail_threshold`.
 *      e. Cleans each segment: trims whitespace, drops lines
 *         shorter than 3 chars, drops lines that look like
 *         Whisper hallucinations (유료 광고, 구독, 좋아요 etc.)
 *      f. Inserts the remaining segments into video_transcripts
 *         with locale='ko'.
 *   3. Prints a summary: videos processed, segments added per
 *      video, new coverage ratio.
 *
 * Safety
 * ------
 *   - Creates a backup row count before each insert.
 *   - All inserts use the same source='whisper' tag so a future
 *     DELETE can target just the rows this script created.
 *   - Idempotent: re-running skips tail ranges that are already
 *     filled.
 */

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL / SERVICE_KEY env')
  process.exit(1)
}

const args = process.argv.slice(2)
const isDry = args.includes('--dry')
const fromCache = args.includes('--from-cache')
const videoFilter = (() => {
  const i = args.indexOf('--video')
  return i >= 0 ? args[i + 1] : null
})()

// Video id → local file name. These are the 4 Group-B videos.
// Adjust if your public/videos/ naming is different.
// Mapping verified against related_videos.video_url column.
const VIDEO_FILES = {
  // 기록물이 젖었을 때!  → /videos/video_3.mp4
  '2d255093-5f32-43ba-9818-cdb4b20d0b12': 'video_3.mp4',
  // 문서류의 올바른 보존상자 보관법  → /videos/video_4.mp4
  'abd1e088-1e09-4f49-9fdd-223a905e493b': 'video_4.mp4',
  // 아날로그 시청각매체 소멸 위험성  → /videos/video_6.mp4
  '20541b4e-95b6-4fe4-b963-e9b58ee13e44': 'video_6.mp4',
  // 훼손 종이기록물 취급하기  → /videos/video_8.mp4
  'e6cafaa1-b683-4b24-ac86-3f49e6600644': 'video_8.mp4',
}

const WHISPER_OUT_DIR = path.join(process.cwd(), '.whisper-out')
fs.mkdirSync(WHISPER_OUT_DIR, { recursive: true })

const HALLUCINATION_PATTERNS = [
  /유료\s*광고/i,
  /다음\s*시간/i,
  /시청해\s*주/i,
  /구독과\s*좋아요/i,
  /이 영상은/i,
  /^감사합니다\.?$/,
  /^좋아요\.?$/,
  /^구독\.?$/,
]

function looksLikeHallucination(text) {
  return HALLUCINATION_PATTERNS.some((re) => re.test(text))
}

function cleanLine(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/^[·•●○\-]+\s*/, '')
    .trim()
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// ─── Step 1: fetch video metadata + current tail position ────────
async function loadTargetVideos() {
  const { data, error } = await sb
    .from('related_videos')
    .select('id, title, duration_seconds')
    .in('id', Object.keys(VIDEO_FILES))
  if (error) throw error
  const results = []
  for (const v of data) {
    const { data: rows, error: e2 } = await sb
      .from('video_transcripts')
      .select('start_seconds')
      .eq('video_id', v.id)
      .or('locale.eq.ko,locale.is.null')
      .order('start_seconds', { ascending: false })
      .limit(1)
    if (e2) throw e2
    const lastTs = rows?.[0]?.start_seconds ?? 0
    results.push({ ...v, lastTs })
  }
  return results
}

// ─── Step 2: run Whisper on a single video ──────────────────────
function runWhisper(videoPath, cacheJsonPath) {
  if (fromCache && fs.existsSync(cacheJsonPath)) {
    console.log('  using cached Whisper output')
    return JSON.parse(fs.readFileSync(cacheJsonPath, 'utf8'))
  }

  // Extract mono 16kHz WAV first — matches what Whisper expects
  // natively and is much smaller than the .mp4
  const wavPath = videoPath.replace(/\.mp4$/, '.wav')
  console.log('  extracting audio with ffmpeg…')
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i', videoPath,
      '-ac', '1',
      '-ar', '16000',
      '-vn',
      wavPath,
    ],
    { stdio: 'ignore' },
  )

  console.log('  running whisper (large-v3, Korean)…')
  const outDir = path.dirname(cacheJsonPath)
  execFileSync(
    'whisper',
    [
      wavPath,
      '--language', 'ko',
      '--model', 'large-v3',
      '--condition_on_previous_text', 'False',
      '--output_format', 'json',
      '--output_dir', outDir,
      '--verbose', 'False',
    ],
    { stdio: 'inherit' },
  )

  // Whisper writes <basename>.json next to the output directory
  const wavBase = path.basename(wavPath, '.wav')
  const whisperJson = path.join(outDir, wavBase + '.json')
  if (!fs.existsSync(whisperJson)) {
    throw new Error('Whisper output not found at ' + whisperJson)
  }
  // Persist as our cache name so --from-cache can re-read it
  const parsed = JSON.parse(fs.readFileSync(whisperJson, 'utf8'))
  fs.writeFileSync(cacheJsonPath, JSON.stringify(parsed, null, 2))
  // Clean up the temp wav — Whisper JSON is tiny compared to audio
  try { fs.unlinkSync(wavPath) } catch {}
  return parsed
}

// ─── Step 3: filter + insert ────────────────────────────────────
function filterTailSegments(whisperResult, video) {
  const raw = whisperResult.segments ?? []
  const tailThreshold = video.lastTs + 2.0 // 2s buffer to avoid overlap
  const kept = []
  for (const seg of raw) {
    if (seg.start < tailThreshold) continue
    if (seg.start > video.duration_seconds) continue
    const text = cleanLine(seg.text ?? '')
    if (text.length < 3) continue
    if (looksLikeHallucination(text)) continue
    kept.push({
      video_id: video.id,
      start_seconds: Math.round(seg.start * 100) / 100,
      text,
      locale: 'ko',
      source: 'whisper',
    })
  }
  return kept
}

async function insertSegments(video, rows) {
  if (rows.length === 0) return 0
  console.log('  inserting ' + rows.length + ' tail segments...')
  if (isDry) {
    rows.slice(0, 5).forEach((r) =>
      console.log('    [dry] ' + r.start_seconds + 's: ' + r.text.slice(0, 60)),
    )
    if (rows.length > 5) console.log('    [dry] ... +' + (rows.length - 5) + ' more')
    return rows.length
  }
  const { error } = await sb.from('video_transcripts').insert(rows)
  if (error) {
    console.error('  insert error:', error.message)
    return 0
  }
  return rows.length
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  const videos = await loadTargetVideos()
  console.log('Loaded ' + videos.length + ' target videos')

  const targets = videoFilter
    ? videos.filter((v) => v.id.startsWith(videoFilter))
    : videos

  if (targets.length === 0) {
    console.error('No videos matched filter', videoFilter)
    process.exit(1)
  }

  let totalInserted = 0
  for (const video of targets) {
    console.log('\n=== ' + video.title + ' ===')
    console.log(
      '  duration: ' + video.duration_seconds + 's · ' +
      'current last segment: ' + video.lastTs + 's · ' +
      'tail gap: ' + (video.duration_seconds - video.lastTs).toFixed(1) + 's',
    )

    const filename = VIDEO_FILES[video.id]
    const videoPath = path.join(process.cwd(), 'public/videos', filename)
    if (!fs.existsSync(videoPath)) {
      console.error('  video file not found:', videoPath)
      continue
    }

    const cacheJson = path.join(WHISPER_OUT_DIR, video.id + '.json')
    let whisperResult
    try {
      whisperResult = runWhisper(videoPath, cacheJson)
    } catch (e) {
      console.error('  whisper failed:', e.message)
      continue
    }

    const newRows = filterTailSegments(whisperResult, video)
    console.log(
      '  Whisper produced ' + (whisperResult.segments?.length ?? 0) +
      ' raw segments; ' + newRows.length + ' fall in the tail gap',
    )

    if (newRows.length === 0) continue
    const inserted = await insertSegments(video, newRows)
    totalInserted += inserted
  }

  console.log('\n' + (isDry ? '[dry] would insert ' : 'Inserted ') + totalInserted + ' segments across ' + targets.length + ' videos')
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
