'use client'

/**
 * AutoTranslate — Chrome-Google-Translate-style DOM walker.
 *
 * When the active locale is NOT Korean, this component:
 *   1. Walks the entire document body and collects visible Korean
 *      text nodes (minus code/script/style/noscript and anything
 *      inside a `data-noauto="true"` element).
 *   2. Sends each unique string to Google Translate's public
 *      endpoint in batches.
 *   3. Replaces the text in-place.
 *   4. Caches every (source, target) pair in localStorage so
 *      revisits are instant.
 *   5. Installs a MutationObserver so dynamically-added content
 *      (modals, route changes, carousel cards, etc.) is also
 *      translated.
 *
 * The Google Translate public endpoint used here is the same one
 * Chrome's built-in translate feature uses. It has no API key and
 * a very generous quota, but is undocumented and could change.
 * Fallback: MyMemory (https://api.mymemory.translated.net) — free,
 * 1000 req/day anonymous.
 */

import { useEffect, useRef } from 'react'
import { useLocale } from './LanguageProvider'

const CACHE_VERSION = 'v1'
const CACHE_KEY_PREFIX = 'ar.tx.' + CACHE_VERSION + '.'
const BATCH_SIZE = 40               // text nodes per API call
const MIN_LEN = 1
const MAX_LEN = 4800                // per-request char budget

// Collect text nodes containing Korean characters
function hasKorean(text: string): boolean {
  return /[\u3131-\u318E\uAC00-\uD7A3]/.test(text)
}

function cacheKey(locale: string, text: string): string {
  // Short hash so we don't blow up localStorage keys with raw strings
  let h = 5381
  for (let i = 0; i < text.length; i++) {
    h = (h * 33) ^ text.charCodeAt(i)
  }
  return CACHE_KEY_PREFIX + locale + '.' + (h >>> 0).toString(36)
}

function readCache(locale: string, text: string): string | null {
  try {
    return localStorage.getItem(cacheKey(locale, text))
  } catch {
    return null
  }
}

function writeCache(locale: string, text: string, translated: string): void {
  try {
    localStorage.setItem(cacheKey(locale, text), translated)
  } catch {
    /* quota exceeded — ignore */
  }
}

/**
 * Google Translate public endpoint (used by Chrome's built-in
 * translator). Returns translated text for a batch of lines joined
 * by a sentinel that GT preserves across the boundary.
 */
async function translateBatch(
  texts: string[],
  targetLang: string,
): Promise<string[]> {
  if (texts.length === 0) return []

  // GT public endpoint is simpler for single strings — batch by
  // concatenating with a delimiter that survives translation.
  const SEP = '\n~¦~\n'
  const joined = texts.join(SEP)

  // Map our locale codes to Google Translate codes
  const gtLang =
    targetLang === 'zh-CN' ? 'zh-CN' :
    targetLang === 'zh-HK' ? 'zh-TW' :
    targetLang

  const url =
    'https://translate.googleapis.com/translate_a/single' +
    '?client=gtx' +
    '&sl=ko' +
    '&tl=' + encodeURIComponent(gtLang) +
    '&dt=t' +
    '&q=' + encodeURIComponent(joined)

  try {
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) throw new Error('GT ' + res.status)
    const data = await res.json()
    // data[0] is an array of [translatedChunk, originalChunk, ...]
    const translated = (data[0] ?? [])
      .map((row: unknown[]) => (row?.[0] as string) ?? '')
      .join('')
    // Split back using the sentinel
    const parts = translated.split(/\n\s*~\s*¦\s*~\s*\n/)
    if (parts.length === texts.length) return parts
    // Occasionally GT drops/rewraps the sentinel — fall back to
    // single-string requests
    throw new Error('sentinel mismatch: ' + parts.length + ' vs ' + texts.length)
  } catch {
    // Fallback: translate each line one at a time
    const out: string[] = []
    for (const text of texts) {
      try {
        const r = await fetch(
          'https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=' +
            encodeURIComponent(gtLang) +
            '&dt=t&q=' +
            encodeURIComponent(text),
        )
        const d = await r.json()
        const t = (d[0] ?? [])
          .map((row: unknown[]) => (row?.[0] as string) ?? '')
          .join('')
        out.push(t || text)
      } catch {
        out.push(text)
      }
    }
    return out
  }
}

/**
 * Walk `root` and collect Korean text nodes, skipping editable
 * content, code-like elements, and opt-out trees marked with
 * `data-noauto="true"`.
 */
function collectNodes(root: Node): Text[] {
  const SKIP_TAGS = new Set([
    'SCRIPT',
    'STYLE',
    'NOSCRIPT',
    'CODE',
    'PRE',
    'KBD',
    'TEXTAREA',
    'INPUT',
    'OPTION',  // we handle FilterBar option translation separately
  ])

  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT
      if (parent.closest('[data-noauto="true"]'))
        return NodeFilter.FILTER_REJECT
      if (parent.isContentEditable) return NodeFilter.FILTER_REJECT
      const raw = (node.textContent ?? '').trim()
      if (raw.length < MIN_LEN) return NodeFilter.FILTER_REJECT
      if (!hasKorean(raw)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  let current: Node | null
  while ((current = walker.nextNode())) {
    nodes.push(current as Text)
  }
  return nodes
}

async function translateNodes(
  nodes: Text[],
  targetLang: string,
  seen: Set<Text>,
): Promise<void> {
  // Filter out already-seen nodes (MutationObserver reentry)
  const fresh = nodes.filter((n) => !seen.has(n))
  if (fresh.length === 0) return
  fresh.forEach((n) => seen.add(n))

  // Bucket by unique source text so duplicate strings (nav links
  // that appear twice etc.) only incur one request each.
  const uniq = new Map<string, Text[]>()
  for (const node of fresh) {
    const raw = (node.textContent ?? '').trim()
    if (!raw) continue
    const bucket = uniq.get(raw) ?? []
    bucket.push(node)
    uniq.set(raw, bucket)
  }

  // Check cache first
  const toTranslate: string[] = []
  const cachedHits: Map<string, string> = new Map()
  for (const src of uniq.keys()) {
    const cached = readCache(targetLang, src)
    if (cached !== null) {
      cachedHits.set(src, cached)
    } else {
      toTranslate.push(src)
    }
  }

  // Apply cached translations first (instant)
  for (const [src, tx] of cachedHits) {
    for (const node of uniq.get(src) ?? []) {
      const orig = node.textContent ?? ''
      const trimmedLen = orig.length - orig.trimStart().length
      const trailLen = orig.length - orig.trimEnd().length
      node.textContent =
        orig.slice(0, trimmedLen) + tx + orig.slice(orig.length - trailLen)
    }
  }

  // Batch the uncached strings
  for (let i = 0; i < toTranslate.length; ) {
    const batch: string[] = []
    let charCount = 0
    while (
      i < toTranslate.length &&
      batch.length < BATCH_SIZE &&
      charCount + toTranslate[i].length < MAX_LEN
    ) {
      batch.push(toTranslate[i])
      charCount += toTranslate[i].length
      i++
    }
    const translated = await translateBatch(batch, targetLang)
    for (let j = 0; j < batch.length; j++) {
      const src = batch[j]
      const tx = translated[j] ?? src
      writeCache(targetLang, src, tx)
      for (const node of uniq.get(src) ?? []) {
        const orig = node.textContent ?? ''
        const trimmedLen = orig.length - orig.trimStart().length
        const trailLen = orig.length - orig.trimEnd().length
        node.textContent =
          orig.slice(0, trimmedLen) + tx + orig.slice(orig.length - trailLen)
      }
    }
  }
}

export default function AutoTranslate() {
  const { locale } = useLocale()
  const seenRef = useRef<Set<Text>>(new Set())

  useEffect(() => {
    // Only translate when not Korean
    if (locale === 'ko' || typeof document === 'undefined') {
      return
    }

    // Reset tracking when locale changes
    seenRef.current = new Set()

    let cancelled = false

    const run = async () => {
      const nodes = collectNodes(document.body)
      if (nodes.length === 0) return
      if (cancelled) return
      await translateNodes(nodes, locale, seenRef.current)
    }

    // Initial pass — defer slightly so React hydration finishes
    const initialTimer = window.setTimeout(run, 150)

    // Watch for DOM mutations (modal open, route change, carousel)
    const observer = new MutationObserver((mutations) => {
      const newNodes: Text[] = []
      for (const mut of mutations) {
        for (const added of mut.addedNodes) {
          if (added.nodeType === Node.TEXT_NODE) {
            const t = added as Text
            const raw = (t.textContent ?? '').trim()
            if (
              raw &&
              hasKorean(raw) &&
              !seenRef.current.has(t) &&
              t.parentElement &&
              !t.parentElement.closest('[data-noauto="true"]')
            ) {
              newNodes.push(t)
            }
          } else if (added.nodeType === Node.ELEMENT_NODE) {
            newNodes.push(...collectNodes(added))
          }
        }
        if (mut.type === 'characterData' && mut.target.nodeType === Node.TEXT_NODE) {
          const t = mut.target as Text
          const raw = (t.textContent ?? '').trim()
          if (raw && hasKorean(raw) && !seenRef.current.has(t)) {
            newNodes.push(t)
          }
        }
      }
      if (newNodes.length > 0) {
        // Debounce a tiny bit to batch consecutive mutations
        window.setTimeout(() => {
          if (!cancelled) translateNodes(newNodes, locale, seenRef.current)
        }, 80)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      cancelled = true
      observer.disconnect()
      window.clearTimeout(initialTimer)
    }
  }, [locale])

  return null
}
