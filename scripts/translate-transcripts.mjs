#!/usr/bin/env node
/**
 * translate-transcripts.mjs
 *
 * Translates all Korean (ko) rows in `video_transcripts` into the
 * 12 additional locales supported by the UI. Writes back into the
 * same table with `locale` + `source_id` populated.
 *
 * Idempotent: if a (source_id, locale) pair already exists, it is
 * updated in place; otherwise a new row is inserted.
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (not anon — needs INSERT)
 *   OPENAI_API_KEY              (for gpt-4o-mini translation)
 *
 * Usage:
 *   node scripts/translate-transcripts.mjs           # all locales
 *   node scripts/translate-transcripts.mjs en ja     # specific locales
 *   node scripts/translate-transcripts.mjs --dry     # preview only
 *
 * Costs (rough, gpt-4o-mini at $0.15/1M input):
 *   192 segments × 12 locales × ~80 tokens = ~184K tokens
 *   ≈ $0.03 USD one-time
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

const LOCALE_NAMES = {
  en: 'English',
  ja: 'Japanese',
  'zh-CN': 'Simplified Chinese',
  'zh-HK': 'Traditional Chinese (Hong Kong)',
  ru: 'Russian',
  es: 'Spanish',
  fr: 'French',
  ar: 'Modern Standard Arabic',
  vi: 'Vietnamese',
  af: 'Afrikaans',
  qu: 'Southern Quechua (Runa Simi)',
  fj: 'Standard Fijian (Bauan)',
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_KEY = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE env vars')
  process.exit(1)
}
if (!OPENAI_KEY) {
  console.error('Missing OPENAI_API_KEY')
  process.exit(1)
}

const args = process.argv.slice(2)
const isDry = args.includes('--dry')
const locales = args.filter((a) => !a.startsWith('--'))
const targets = locales.length > 0 ? locales : TARGET_LOCALES

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

async function fetchSourceRows() {
  const { data, error } = await sb
    .from('video_transcripts')
    .select('id, video_id, start_seconds, text, source, locale')
    .or('locale.eq.ko,locale.is.null')
    .order('video_id')
    .order('start_seconds')
  if (error) throw error
  return data
}

async function fetchExistingTranslations(locale) {
  const { data, error } = await sb
    .from('video_transcripts')
    .select('source_id')
    .eq('locale', locale)
  if (error) throw error
  return new Set((data ?? []).map((r) => r.source_id).filter(Boolean))
}

/**
 * Translate a batch of Korean lines using OpenAI.
 * Preserves order 1:1 so we can re-associate with source IDs by index.
 */
async function translateBatch(lines, locale) {
  const system = `You are a professional translator specializing in historical Korean archive documents. Translate Korean lines into ${LOCALE_NAMES[locale]}. Preserve proper nouns (personal names, place names, organization names) and historical terms accurately. Return a JSON object: { "lines": [ "<translation 1>", "<translation 2>", ... ] } with the same number of lines as input, in the same order. Do not add commentary.`
  const user =
    'Translate these ' +
    lines.length +
    ' lines into ' +
    LOCALE_NAMES[locale] +
    ':\n\n' +
    lines.map((l, i) => `${i + 1}. ${l}`).join('\n')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + OPENAI_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) {
    throw new Error('OpenAI ' + res.status + ': ' + (await res.text()))
  }
  const json = await res.json()
  const content = json.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty OpenAI response')
  const parsed = JSON.parse(content)
  if (!Array.isArray(parsed.lines) || parsed.lines.length !== lines.length) {
    throw new Error(
      'Translation mismatch: expected ' +
        lines.length +
        ' got ' +
        (parsed.lines?.length ?? 'N/A'),
    )
  }
  return parsed.lines
}

async function translateLocale(locale, sources) {
  console.log('\n=== Translating to', locale, '('+LOCALE_NAMES[locale]+') ===')

  const existing = await fetchExistingTranslations(locale)
  const pending = sources.filter((s) => !existing.has(s.id))
  console.log(
    'Sources: ' + sources.length + ' · already translated: ' +
      (sources.length - pending.length) +
      ' · remaining: ' + pending.length,
  )

  if (pending.length === 0) return

  // Batch 20 lines at a time
  const BATCH = 20
  for (let i = 0; i < pending.length; i += BATCH) {
    const chunk = pending.slice(i, i + BATCH)
    const texts = chunk.map((r) => r.text)
    console.log(
      '  Batch ' + Math.floor(i / BATCH + 1) + ' / ' +
        Math.ceil(pending.length / BATCH) + '...',
    )

    let translations
    try {
      translations = await translateBatch(texts, locale)
    } catch (e) {
      console.error('  Batch failed: ', e.message)
      continue
    }

    const rows = chunk.map((src, idx) => ({
      video_id: src.video_id,
      start_seconds: src.start_seconds,
      text: translations[idx],
      source: src.source,
      locale,
      source_id: src.id,
    }))

    if (isDry) {
      console.log('  [dry] would insert ' + rows.length + ' rows')
      rows.slice(0, 3).forEach((r) =>
        console.log('    →', r.text.slice(0, 60)),
      )
      continue
    }

    const { error } = await sb.from('video_transcripts').insert(rows)
    if (error) {
      console.error('  Insert error: ', error.message)
    } else {
      console.log('  ✓ inserted ' + rows.length + ' rows')
    }
  }
}

async function main() {
  console.log('Fetching source (ko) rows...')
  const sources = await fetchSourceRows()
  console.log('Found ' + sources.length + ' source rows')

  for (const locale of targets) {
    if (!LOCALE_NAMES[locale]) {
      console.warn('Unknown locale:', locale, '(skipping)')
      continue
    }
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
