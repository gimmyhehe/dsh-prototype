/**
 * Tiny external store shared by the composer toggle and the preview tab.
 *
 * One module-level snapshot keeps both surfaces in sync without pulling in a
 * state library. Settings persist in localStorage; the generated document is
 * intentionally memory-only so a reload starts from a clean canvas.
 */
import { useSyncExternalStore } from 'react'
import { openPreview } from './controller'
import { renderPrototypeHtml } from './template'
import {
  ACCENTS,
  DEFAULT_ACCENT_ID,
  DEFAULT_RADIUS_ID,
  DEFAULT_THEME_ID,
  RADIUS_OPTIONS,
  THEMES,
  getAccent,
  getRadius,
  getTheme,
} from './themes'

/** Preview viewport presets. */
export type Device = 'desktop' | 'tablet' | 'mobile'

/** Generation lifecycle shown by the panel. */
export type GenerationStatus = 'idle' | 'generating' | 'ready'

/** Complete client-side prototype state. */
export interface PrototypeState {
  /** Whether the composer toggle is on. */
  enabled: boolean
  /** Selected theme id. */
  themeId: string
  /** Selected accent id. */
  accentId: string
  /** Selected radius preset id. */
  radiusId: string
  /** Preview viewport preset. */
  device: Device
  /** Prompt of the current (or last) generation. */
  prompt: string
  /** Generated HTML document; empty before the first generation. */
  html: string
  /** Generation lifecycle. */
  status: GenerationStatus
  /** Epoch ms of the last successful generation. */
  updatedAt: number
  /** Monotonic id used to discard superseded timers. */
  revision: number
}

const SETTINGS_KEY = 'dsh-prototype:settings:v1'

/** The slice persisted across reloads. */
interface PersistedSettings {
  enabled: boolean
  themeId: string
  accentId: string
  radiusId: string
  device: Device
}

/** Empty document state used before the first generation. */
const EMPTY_DOCUMENT = {
  prompt: '',
  html: '',
  status: 'idle' as GenerationStatus,
  updatedAt: 0,
  revision: 0,
}

/**
 * Read persisted settings, validating every value against the catalogue.
 * @returns the settings slice, or `undefined` when storage is empty/invalid.
 */
function loadSettings(): Partial<PersistedSettings> | undefined {
  try {
    if (typeof localStorage === 'undefined') return undefined
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw === null) return undefined
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>
    return {
      enabled: parsed.enabled === true,
      themeId: THEMES.some((theme) => theme.id === parsed.themeId) ? parsed.themeId! : DEFAULT_THEME_ID,
      accentId: ACCENTS.some((accent) => accent.id === parsed.accentId) ? parsed.accentId! : DEFAULT_ACCENT_ID,
      radiusId: RADIUS_OPTIONS.some((option) => option.id === parsed.radiusId) ? parsed.radiusId! : DEFAULT_RADIUS_ID,
      device: parsed.device === 'tablet' || parsed.device === 'mobile' ? parsed.device : 'desktop',
    }
  } catch {
    return undefined
  }
}

const saved = loadSettings()

let state: PrototypeState = {
  enabled: saved?.enabled ?? false,
  themeId: saved?.themeId ?? DEFAULT_THEME_ID,
  accentId: saved?.accentId ?? DEFAULT_ACCENT_ID,
  radiusId: saved?.radiusId ?? DEFAULT_RADIUS_ID,
  device: saved?.device ?? 'desktop',
  ...EMPTY_DOCUMENT,
}

const listeners = new Set<() => void>()

/** Persist the settings slice; storage failures never break the UI. */
function persist(): void {
  try {
    if (typeof localStorage === 'undefined') return
    const settings: PersistedSettings = {
      enabled: state.enabled,
      themeId: state.themeId,
      accentId: state.accentId,
      radiusId: state.radiusId,
      device: state.device,
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Private mode / quota exceeded: keep the in-memory state.
  }
}

/**
 * Read the current snapshot.
 * @returns the current state object.
 */
export function getState(): PrototypeState {
  return state
}

/**
 * Subscribe to state changes.
 * @param listener - change callback.
 * @returns unsubscribe function.
 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Merge a patch into the state, persist settings, and notify subscribers.
 * @param patch - partial state or updater.
 */
export function setState(patch: Partial<PrototypeState> | ((current: PrototypeState) => Partial<PrototypeState>)): void {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  persist()
  for (const listener of listeners) listener()
}

/**
 * Subscribe a component to a slice of the store.
 * @param selector - pure selector over the snapshot.
 * @returns the selected value.
 */
export function usePrototype<T>(selector: (current: PrototypeState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

let generationTimer: ReturnType<typeof setTimeout> | undefined

/**
 * Generate a prototype document for a prompt after a short mock latency.
 *
 * Regeneration is revision-guarded: starting a new run discards the pending
 * result of the previous one, so a fast sequence of theme switches settles on
 * the last choice.
 * @param prompt - user prompt; empty falls back to the sample inside the template.
 * @param delay - artificial latency in milliseconds.
 */
export function generate(prompt: string, delay = 620): void {
  const revision = state.revision + 1
  setState({ status: 'generating', prompt, revision })
  if (generationTimer !== undefined) clearTimeout(generationTimer)
  generationTimer = setTimeout(() => {
    const current = getState()
    if (current.revision !== revision) return
    try {
      const html = renderPrototypeHtml({
        prompt: current.prompt,
        theme: getTheme(current.themeId),
        accent: getAccent(current.accentId).value,
        radius: getRadius(current.radiusId).value,
      })
      setState({ html, status: 'ready', updatedAt: Date.now() })
    } catch (error) {
      console.error('[dsh-prototype] failed to render preview', error)
      setState({ status: 'idle' })
    }
  }, delay)
}

/**
 * Regenerate the current prompt (or the sample when the prompt is empty).
 * @param delay - artificial latency in milliseconds.
 */
export function regenerate(delay = 420): void {
  generate(state.prompt, delay)
}

/** Generate only when nothing has been generated yet. */
export function ensureGenerated(): void {
  if (state.html === '' && state.status !== 'generating') generate(state.prompt)
}

/**
 * Toggle prototype mode and open the preview when it turns on.
 * @param enabled - next enabled state.
 */
export function setEnabled(enabled: boolean): void {
  const wasEnabled = state.enabled
  setState({ enabled })
  if (enabled && !wasEnabled) {
    ensureGenerated()
    openPreview()
  }
}

/**
 * Select a design theme and refresh an existing preview.
 * @param themeId - theme id from the catalogue.
 */
export function selectTheme(themeId: string): void {
  if (themeId === state.themeId) return
  setState({ themeId })
  if (state.html !== '') regenerate(240)
}

/**
 * Select an accent color and refresh an existing preview.
 * @param accentId - accent id from the catalogue.
 */
export function selectAccent(accentId: string): void {
  if (accentId === state.accentId) return
  setState({ accentId })
  if (state.html !== '') regenerate(200)
}

/**
 * Select a corner-radius preset and refresh an existing preview.
 * @param radiusId - radius preset id.
 */
export function selectRadius(radiusId: string): void {
  if (radiusId === state.radiusId) return
  setState({ radiusId })
  if (state.html !== '') regenerate(200)
}

/**
 * Select the preview viewport preset.
 * @param device - viewport preset.
 */
export function selectDevice(device: Device): void {
  setState({ device })
}
