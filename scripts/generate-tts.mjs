#!/usr/bin/env node
/**
 * generate-tts.mjs
 *
 * Generates dubbed audio tracks for each video × locale using the
 * translated transcripts already in Supabase. The dubbed audio is
 * written to Supabase Storage under the `audio/` bucket and recorded
 * in `video_audio_tracks`.
 *
 * Two TTS backends supported (set via TTS_PROVIDER env var):
 *
 *   TTS_PROVIDER=openai   (paid, best quality, fewer languages)
 *     Uses OpenAI's gpt-4o-mini-tts @ $15/1M chars.
 *     ~120K chars × 13 locales ≈ $25 one-time.
 *
 *   TTS_PROVIDER=edge     (free, good quality, broad language coverage)
 *     Shells out to Python's `edge-tts` CLI (Microsoft neural voices).
 *     Install: pip install edge-tts
 *
 * This script is designed to run OFFLINE on a developer machine with
 * the Supabase service key and ffmpeg installed. It does NOT run in
 * the browser or on Vercel.
 *
 * Usage:
 *   TTS_PROVIDER=edge node scripts/generate-tts.mjs           # all
 *   TTS_PROVIDER=edge node scripts/generate-tts.mjs en ja     # specific
 *   node scripts/generate-tts.mjs --dry                       # preview
 *
 * Prerequisites:
 *   - Python 3 with `edge-tts` installed (for edge provider)
 *   - ffmpeg on PATH (concatenates per-segment MP3s and applies timing)
 *   - Supabase Storage bucket `audio` created and public read-allowed
 */

import { createClient } from '@supabase/supabase-js'
import { execFileSync, execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const EDGE_VOICES = {
  en: 'en-US-AriaNeural',
  ja: 'ja-JP-NanamiNeural',
  'zh-CN': 'zh-CN-XiaoxiaoNeural',
  'zh-HK': 'zh-HK-HiuMaanNeural',
  ru: 'ru-RU-SvetlanaNeural',
  es: 'es-ES-ElviraNeural',
  fr: 'fr-FR-DeniseNeural',
  ar: 'ar-SA-ZariyahNeural',
  vi: 'vi-VN-HoaiMyNeural',
  af: 'af-ZA-AdriNeural',
  // Quechua and Fijian aren't in Azure's catalog; fall back to Spanish / English
  qu: 'es-PE-CamilaNeural',
  fj: 'en-GB-SoniaNeural',
}

const OPENAI_VOICES = {
  en: 'alloy',
  ja: 'nova',
  'zh-CN': 'shimmer',
  'zh-HK': 'shimmer',
  ru: 'onyx',
  es: 'nova',
  fr: 'nova',
  ar: 'alloy',
  vi: 'shimmer',
  af: 'alloy',
  qu: 'alloy',
  fj: 'alloy',
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_KEY = process.env.OPENAI_API_KEY
const PROVIDER = process.env.TTS_PROVIDER || 'edge'
const BUCKET = 'audio'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE env vars')
  process.exit(1)
}
if (PROVIDER === 'openai' && !OPENAI_KEY) {
  console.error('OPENAI_API_KEY required for openai provider')
  process.exit(1)
}

const args = process.argv.slice(2)
const isDry = args.includes('--dry')
const localeArgs = args.filter((a) => !a.startsWith('--'))
const targetLocales = localeArgs.length > 0 ? localeArgs : Object.keys(EDGE_VOICES)

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// ─── Backends ─────────────────────────────────────────────────────

async function synthesizeSegment_edge(text, locale, outFile) {
  const voice = EDGE_VOICES[locale]
  if (!voice) throw new Error('No edge voice for ' + locale)
  execFileSync('edge-tts', [
    '--voice', voice,
    '--text', text,
    '--write-media', outFile,
  ], { stdio: 'ignore' })
}

async function synthesizeSegment_openai(text, locale, outFile) {
  const voice = OPENAI_VOICES[locale] || 'alloy'
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + OPENAI_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice,
      input: text,
      response_format: 'mp3',
    }),
  })
  if (!res.ok) throw new Error('OpenAI TTS ' + res.status + ': ' + (await res.text()))
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(outFile, buf)
}

async function synthesize(text, locale, outFile) {
  if (PROVIDER === 'openai') return synthesizeSegment_openai(text, locale, outFile)
  return synthesizeSegment_edge(text, locale, outFile)
}

// ─── Core flow ────────────────────────────────────────────────────

async function fetchVideosWithTranscripts(locale) {
  const { data, error } = await sb
    .from('related_videos')
    .select(`
      id,
      title,
      duration_seconds,
      video_transcripts ( id, start_seconds, text, locale )
    `)
  if (error) throw error

  return data.map((v) => ({
    id: v.id,
    title: v.title,
    duration: v.duration_seconds,
    segments: (v.video_transcripts ?? [])
      .filter((t) => t.locale === locale)
      .sort((a, b) => a.start_seconds - b.start_seconds),
  }))
}

async function buildDubForVideo(video, locale) {
  if (video.segments.length === 0) {
    console.log('  No ' + locale + ' transcripts for "' + video.title + '" — skipping')
    return null
  }

  const work = path.join(os.tmpdir(), 'tts_' + video.id + '_' + locale)
  fs.mkdirSync(work, { recursive: true })

  // 1) Synthesize each segment to its own MP3
  const segmentFiles = []
  for (let i = 0; i < video.segments.length; i++) {
    const seg = video.segments[i]
    const file = path.join(work, 'seg_' + i + '.mp3')
    try {
      await synthesize(seg.text, locale, file)
      segmentFiles.push({ file, seg })
    } catch (e) {
      console.warn('    segment ' + i + ' failed:', e.message)
    }
  }
  if (segmentFiles.length === 0) return null

  // 2) Build a silence pad before each segment so audio lines up with
  //    the video timeline (start_seconds). ffmpeg filter_complex.
  const listFile = path.join(work, 'concat.txt')
  const parts = []
  let prevEnd = 0
  for (const { file, seg } of segmentFiles) {
    const gap = Math.max(0, seg.start_seconds - prevEnd)
    if (gap > 0.05) {
      const silenceFile = path.join(work, 'sil_' + parts.length + '.mp3')
      execSync(
        'ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t ' +
          gap.toFixed(3) +
          ' -q:a 9 -acodec libmp3lame ' +
          JSON.stringify(silenceFile),
        { stdio: 'ignore' },
      )
      parts.push(silenceFile)
    }
    parts.push(file)
    // Rough estimate: 1 second per 15 characters
    prevEnd = seg.start_seconds + seg.text.length / 15
  }

  fs.writeFileSync(
    listFile,
    parts.map((p) => "file '" + p.replace(/'/g, "'\\''") + "'").join('\n'),
  )

  // 3) Concat into final mp3
  const finalFile = path.join(work, 'final.mp3')
  execSync(
    'ffmpeg -y -f concat -safe 0 -i ' +
      JSON.stringify(listFile) +
      ' -c copy ' + JSON.stringify(finalFile),
    { stdio: 'ignore' },
  )
  return finalFile
}

async function uploadAudio(video, locale, localFile) {
  const remotePath = 'dubs/' + video.id + '/' + locale + '.mp3'
  const buf = fs.readFileSync(localFile)
  const { error: upErr } = await sb.storage
    .from(BUCKET)
    .upload(remotePath, buf, {
      contentType: 'audio/mpeg',
      upsert: true,
    })
  if (upErr) throw upErr

  const { data: publicUrl } = sb.storage.from(BUCKET).getPublicUrl(remotePath)

  const { error: dbErr } = await sb.from('video_audio_tracks').upsert(
    {
      video_id: video.id,
      locale,
      audio_url: publicUrl.publicUrl,
      voice_name: PROVIDER === 'edge' ? EDGE_VOICES[locale] : OPENAI_VOICES[locale],
      file_size_bytes: buf.length,
    },
    { onConflict: 'video_id,locale' },
  )
  if (dbErr) throw dbErr
  return publicUrl.publicUrl
}

async function processLocale(locale) {
  console.log('\n=== ' + locale + ' (' + PROVIDER + ') ===')
  const videos = await fetchVideosWithTranscripts(locale)
  for (const video of videos) {
    console.log('  ' + video.title)
    if (isDry) {
      console.log('    [dry] would synthesize ' + video.segments.length + ' segments')
      continue
    }
    try {
      const finalFile = await buildDubForVideo(video, locale)
      if (!finalFile) continue
      const url = await uploadAudio(video, locale, finalFile)
      console.log('    ✓ uploaded → ' + url)
    } catch (e) {
      console.error('    Failed:', e.message)
    }
  }
}

async function main() {
  // Ensure bucket exists
  if (!isDry) {
    const { data: buckets } = await sb.storage.listBuckets()
    if (!buckets?.some((b) => b.name === BUCKET)) {
      console.log('Creating bucket', BUCKET)
      await sb.storage.createBucket(BUCKET, { public: true })
    }
  }

  for (const locale of targetLocales) {
    if (!EDGE_VOICES[locale]) {
      console.warn('Skipping unknown locale:', locale)
      continue
    }
    try {
      await processLocale(locale)
    } catch (e) {
      console.error('Locale ' + locale + ' failed:', e.message)
    }
  }
  console.log('\nDone.')
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
