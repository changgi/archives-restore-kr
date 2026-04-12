/**
 * Tiny pub/sub store that tracks AutoTranslate progress so a
 * separate indicator component can subscribe without prop drilling
 * or lifting state up through the provider tree.
 */

export interface TranslateProgress {
  /** True while a scan+translate pass is in flight */
  active: boolean
  /** Total unique strings in the current pass */
  total: number
  /** Strings successfully translated (or cached hits) so far */
  done: number
  /** Locale being translated to, for the indicator label */
  locale: string
}

const initial: TranslateProgress = {
  active: false,
  total: 0,
  done: 0,
  locale: '',
}

let state: TranslateProgress = initial
const listeners = new Set<(state: TranslateProgress) => void>()

function emit(): void {
  for (const cb of listeners) cb(state)
}

export function getProgress(): TranslateProgress {
  return state
}

export function subscribeProgress(
  cb: (state: TranslateProgress) => void,
): () => void {
  listeners.add(cb)
  // Fire once immediately so subscribers see current state
  cb(state)
  return () => {
    listeners.delete(cb)
  }
}

export function beginPass(locale: string, total: number): void {
  state = { active: true, total, done: 0, locale }
  emit()
}

export function bumpDone(delta: number = 1): void {
  if (!state.active) return
  state = { ...state, done: Math.min(state.done + delta, state.total) }
  emit()
}

export function addTotal(delta: number): void {
  if (!state.active) return
  state = { ...state, total: state.total + delta }
  emit()
}

export function endPass(): void {
  state = { ...state, active: false }
  emit()
}
