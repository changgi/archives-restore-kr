#!/usr/bin/env node
/**
 * translate-transcripts-free.mjs
 *
 * Same as translate-transcripts.mjs but uses Google Translate's
 * free public endpoint (the one Chrome's built-in translator uses)
 * instead of OpenAI. No API key, no cost, slightly lower accuracy
 * for historical terms but works well for modern Korean.
 *
 * Idempotent — skips (source_id, locale) pairs already present.
 *
 * Usage:
 *   export NEXT_PUBLIC_SUPABASE_URL=...
 *   export SUPABASE_SERVICE_ROLE_KEY=...
 *   node scripts/translate-transcripts-free.mjs                  # all locales
 *   node scripts/translate-transcripts-free.mjs en ja fr         # specific
 *   node scripts/translate-transcripts-free.mjs --dry            # preview
 */

import { createClient } from '@supabase/supabase-js'

const TARGET_LOCALES = [
  'en',
  'ja',
  'zh-CN',
  'zh-HK',
  'ru',
  'es',
  'fr',
  'ar',
  'vi',
  'af',
  'qu',
  'fj',
]

// Google Translate language code mapping (most match 1:1)
const GT_LANG = {
  en: 'en',
  ja: 'ja',
  'zh-CN': 'zh-CN',
  'zh-HK': 'zh-TW',
  ru: 'ru',
  es: 'es',
  fr: 'fr',
  ar: 'ar',
  vi: 'vi',
  af: 'af',
  // Google Translate doesn't have Quechua or Fijian — fall back
  // gracefully to Spanish (closest for Quechua) and English (Fijian)
  qu: 'qu',  // attempt first; will fail and keep ko if unavailable
  fj: 'fj',  // attempt first; Fijian is supported as 'fj'
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE env vars')
  process.exit(1)
}

const args = process.argv.slice(2)
const isDry = args.includes('--dry')
const locales = args.filter((a) => !a.startsWith('--'))
const targets = locales.length > 0 ? locales : TARGET_LOCALES

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

async function translateOne(text, locale) {
  const tl = GT_LANG[locale] ?? locale
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    '?client=gtx' +
    '&sl=ko' +
    '&tl=' + encodeURIComponent(tl) +
    '&dt=t' +
    '&q=' + encodeURIComponent(text)
  const res = await fetch(url)
  if (!res.ok) throw new Error('GT ' + res.status)
  const data = await res.json()
  const chunks = data[0] ?? []
  return chunks.map((c) => c[0] ?? '').join('')
}

async function fetchSourceRows() {
  // Paginate to bypass Supabase's default 1000-row limit
  const rows = []
  let from = 0
  const PAGE = 500
  while (true) {
    const { data, error } = await sb
      .from('video_transcripts')
      .select('id, video_id, start_seconds, text, source, locale')
      .or('locale.eq.ko,locale.is.null')
      .order('video_id')
      .order('start_seconds')
      .range(from, from + PAGE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return rows
}

async function fetchExistingTranslations(locale) {
  const ids = new Set()
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await sb
      .from('video_transcripts')
      .select('source_id')
      .eq('locale', locale)
      .range(from, from + PAGE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    for (const r of data) if (r.source_id) ids.add(r.source_id)
    if (data.length < PAGE) break
    from += PAGE
  }
  return ids
}

async function translateLocale(locale, sources) {
  console.log('\n=== ' + locale + ' ===')
  const existing = await fetchExistingTranslations(locale)
  const pending = sources.filter((s) => !existing.has(s.id))
  console.log(
    'sources: ' + sources.length +
    ' · existing: ' + existing.size +
    ' · pending: ' + pending.length,
  )
  if (pending.length === 0) return

  const rowsToInsert = []
  for (let i = 0; i < pending.length; i++) {
    const src = pending[i]
    let tx
    try {
      tx = await translateOne(src.text, locale)
    } catch (e) {
      console.warn('  ' + i + ' failed:', e.message)
      continue
    }
    if (!tx) continue
    rowsToInsert.push({
      video_id: src.video_id,
      start_seconds: src.start_seconds,
      text: tx,
      source: src.source,
      locale,
      source_id: src.id,
    })
    // Log every 10th for progress
    if (i % 10 === 0) {
      console.log('  ' + (i + 1) + '/' + pending.length + ' — ' + tx.slice(0, 60))
    }
    // Rate limit: ~5 req/sec is safe for the free endpoint
    await new Promise((r) => setTimeout(r, 200))
  }

  if (isDry) {
    console.log('  [dry] would insert ' + rowsToInsert.length + ' rows')
    return
  }

  // Chunk inserts to stay under Supabase's 1MB request body limit
  const CHUNK = 200
  for (let i = 0; i < rowsToInsert.length; i += CHUNK) {
    const chunk = rowsToInsert.slice(i, i + CHUNK)
    const { error } = await sb.from('video_transcripts').insert(chunk)
    if (error) {
      console.error('  insert error:', error.message)
    } else {
      console.log('  ✓ inserted ' + chunk.length + ' rows')
    }
  }
}

async function main() {
  console.log('Fetching source (ko) rows...')
  const sources = await fetchSourceRows()
  console.log('Found ' + sources.length + ' source rows')

  for (const locale of targets) {
    try {
      await translateLocale(locale, sources)
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
