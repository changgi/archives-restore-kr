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
 */

import { useEffect, useRef } from 'react'
import { useLocale } from './LanguageProvider'

const CACHE_VERSION = 'v1'
const CACHE_KEY_PREFIX = 'ar.tx.' + CACHE_VERSION + '.'
const BATCH_SIZE = 30               // text nodes per API call
const MIN_LEN = 1
const MAX_LEN = 4800                // per-request char budget
const RESCAN_DEBOUNCE_MS = 400      // coalesce bursts of mutations into one pass

// Attributes whose value should be translated when visible to users
const TRANSLATABLE_ATTRS = [
  'placeholder',
  'title',
  'alt',
  'aria-label',
  'aria-placeholder',
  'aria-description',
] as const

// Collect text nodes containing Korean characters
function hasKorean(text: string): boolean {
  return /[\uAC00-\uD7A3]/.test(text)
}

function cacheKey(locale: string, text: string): string {
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

  const SEP = '\n~¦~\n'
  const joined = texts.join(SEP)

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
    const translated = (data[0] ?? [])
      .map((row: unknown[]) => (row?.[0] as string) ?? '')
      .join('')
    const parts = translated.split(/\n\s*~\s*¦\s*~\s*\n/)
    if (parts.length === texts.length) return parts
    throw new Error('sentinel mismatch')
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

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'CODE',
  'PRE',
  'KBD',
  'TEXTAREA',
  'INPUT',
])

/**
 * Walk the whole document, collecting every Korean text node AND
 * every Korean attribute value, in a single linear DOM pass.
 * Fast path — single TreeWalker + one getAttribute check per
 * element per attr. Called only on the initial pass and the debounced
 * rescan; never per mutation.
 */
function scanEverything(root: HTMLElement): {
  texts: Text[]
  attrs: { el: Element; attr: string; value: string }[]
} {
  const texts: Text[] = []
  const attrs: { el: Element; attr: string; value: string }[] = []

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        // Element pass — record translatable attrs, then descend.
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element
          if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT
          if (el.closest('[data-noauto="true"]'))
            return NodeFilter.FILTER_REJECT
          for (const attr of TRANSLATABLE_ATTRS) {
            const v = el.getAttribute(attr)
            if (v && hasKorean(v)) {
              attrs.push({ el, attr, value: v })
            }
          }
          return NodeFilter.FILTER_SKIP // descend into children
        }
        // Text pass — record Korean text nodes.
        const parent = (node as Text).parentElement
        if (!parent) return NodeFilter.FILTER_REJECT
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT
        if (parent.isContentEditable) return NodeFilter.FILTER_REJECT
        const raw = (node.textContent ?? '').trim()
        if (raw.length < MIN_LEN) return NodeFilter.FILTER_REJECT
        if (!hasKorean(raw)) return NodeFilter.FILTER_REJECT
        return NodeFilter.FILTER_ACCEPT
      },
    },
  )
  let current: Node | null
  while ((current = walker.nextNode())) {
    if (current.nodeType === Node.TEXT_NODE) texts.push(current as Text)
  }
  return { texts, attrs }
}

/**
 * Apply a cached-or-fetched translation to every text node and
 * attribute target sharing the same raw source text.
 */
function applyTranslation(
  tx: string,
  textBucket: Text[],
  attrBucket: { el: Element; attr: string; value: string }[],
): void {
  for (const node of textBucket) {
    const orig = node.textContent ?? ''
    const leading = orig.length - orig.trimStart().length
    const trailing = orig.length - orig.trimEnd().length
    node.textContent =
      orig.slice(0, leading) + tx + orig.slice(orig.length - trailing)
  }
  for (const target of attrBucket) {
    try {
      target.el.setAttribute(target.attr, tx)
    } catch {
      /* ignore */
    }
  }
}

async function translateCollected(
  nodes: Text[],
  attrs: { el: Element; attr: string; value: string }[],
  targetLang: string,
  seenNodes: WeakSet<Text>,
  seenAttrs: WeakMap<Element, Set<string>>,
  cancelled: { v: boolean },
): Promise<void> {
  // Filter out already-seen targets
  const freshNodes = nodes.filter((n) => !seenNodes.has(n))
  const freshAttrs: { el: Element; attr: string; value: string }[] = []
  for (const a of attrs) {
    let done = seenAttrs.get(a.el)
    if (done?.has(a.attr)) continue
    if (!done) {
      done = new Set()
      seenAttrs.set(a.el, done)
    }
    done.add(a.attr)
    freshAttrs.push(a)
  }
  if (freshNodes.length === 0 && freshAttrs.length === 0) return
  freshNodes.forEach((n) => seenNodes.add(n))

  // Bucket by unique source text across BOTH text nodes and attributes
  const textBuckets = new Map<string, Text[]>()
  const attrBuckets = new Map<string, { el: Element; attr: string; value: string }[]>()
  for (const node of freshNodes) {
    const raw = (node.textContent ?? '').trim()
    if (!raw) continue
    ;(textBuckets.get(raw) ?? textBuckets.set(raw, []).get(raw)!).push(node)
  }
  for (const target of freshAttrs) {
    const raw = target.value.trim()
    if (!raw) continue
    ;(attrBuckets.get(raw) ?? attrBuckets.set(raw, []).get(raw)!).push(target)
  }

  const allKeys = new Set<string>([
    ...textBuckets.keys(),
    ...attrBuckets.keys(),
  ])
  if (allKeys.size === 0) return

  // Cache-first
  const toTranslate: string[] = []
  const cachedHits = new Map<string, string>()
  for (const src of allKeys) {
    const cached = readCache(targetLang, src)
    if (cached !== null) {
      cachedHits.set(src, cached)
    } else {
      toTranslate.push(src)
    }
  }

  // Apply cached translations instantly
  for (const [src, tx] of cachedHits) {
    if (cancelled.v) return
    applyTranslation(
      tx,
      textBuckets.get(src) ?? [],
      attrBuckets.get(src) ?? [],
    )
  }

  // Batch the uncached strings
  for (let i = 0; i < toTranslate.length; ) {
    if (cancelled.v) return
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
    if (cancelled.v) return
    for (let j = 0; j < batch.length; j++) {
      const src = batch[j]
      const tx = translated[j] ?? src
      writeCache(targetLang, src, tx)
      applyTranslation(
        tx,
        textBuckets.get(src) ?? [],
        attrBuckets.get(src) ?? [],
      )
    }
  }
}

export default function AutoTranslate() {
  const { locale } = useLocale()
  const seenNodesRef = useRef<WeakSet<Text>>(new WeakSet())
  const seenAttrsRef = useRef<WeakMap<Element, Set<string>>>(new WeakMap())

  useEffect(() => {
    // Only translate when not Korean
    if (locale === 'ko' || typeof document === 'undefined') {
      return
    }

    // Reset tracking on locale change
    seenNodesRef.current = new WeakSet()
    seenAttrsRef.current = new WeakMap()

    const cancelled = { v: false }
    let inFlight = false
    let pending = false
    let rescanTimer: number | null = null

    /**
     * Do one full-document scan + translation pass. Serialized so
     * we never have two rescans racing. If another rescan is
     * requested while one is in flight, we remember it and run
     * once after the current one finishes.
     */
    const rescan = async () => {
      if (cancelled.v) return
      if (inFlight) {
        pending = true
        return
      }
      inFlight = true
      try {
        const { texts, attrs } = scanEverything(document.body)
        await translateCollected(
          texts,
          attrs,
          locale,
          seenNodesRef.current,
          seenAttrsRef.current,
          cancelled,
        )
      } finally {
        inFlight = false
      }
      if (pending && !cancelled.v) {
        pending = false
        // Chain the next pass on the next microtask
        queueMicrotask(rescan)
      }
    }

    const scheduleRescan = () => {
      if (rescanTimer !== null) window.clearTimeout(rescanTimer)
      rescanTimer = window.setTimeout(rescan, RESCAN_DEBOUNCE_MS)
    }

    // Initial pass
    const initialTimer = window.setTimeout(rescan, 150)

    // The observer is intentionally "dumb" — it just schedules a
    // rescan whenever the DOM changes. This avoids the feedback
    // loop that happens if we try to be clever about which subtree
    // changed, and it avoids repeatedly re-scanning the same
    // elements because the seen-sets guard every target.
    const observer = new MutationObserver((mutations) => {
      // Only schedule a rescan if the mutation wasn't caused by our
      // own setAttribute / textContent calls. Quick test: if every
      // mutation has a target whose current state has NO Korean,
      // we skip — that means we already handled it.
      let hasUnhandled = false
      for (const mut of mutations) {
        if (mut.type === 'childList' && mut.addedNodes.length > 0) {
          hasUnhandled = true
          break
        }
        if (mut.type === 'characterData') {
          const t = mut.target as Text
          if (hasKorean(t.textContent ?? '')) {
            hasUnhandled = true
            break
          }
        }
        if (mut.type === 'attributes') {
          const el = mut.target as Element
          const attr = mut.attributeName
          if (!attr) continue
          const v = el.getAttribute(attr)
          if (v && hasKorean(v)) {
            hasUnhandled = true
            break
          }
        }
      }
      if (hasUnhandled) scheduleRescan()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRS as unknown as string[],
    })

    return () => {
      cancelled.v = true
      observer.disconnect()
      window.clearTimeout(initialTimer)
      if (rescanTimer !== null) window.clearTimeout(rescanTimer)
    }
  }, [locale])

  return null
}
