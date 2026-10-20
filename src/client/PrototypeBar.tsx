/**
 * Composer-row entry: the prototype mode toggle plus the current-theme chip.
 *
 * Session-scoped slots receive the session standard kit; `useSession` lets us
 * observe local prompt echoes. Any new prompt while the mode is on triggers a
 * (mock) generation and opens the preview tab.
 */
import { useEffect, useRef, useState } from 'react'
import { openPreview } from './controller'
import { ChevronDownIcon, SparkIcon } from './icons'
import { ensureGenerated, generate, setEnabled, usePrototype } from './store'
import { SAMPLE_PROMPT } from './template'
import { getAccent, getTheme } from './themes'
import { ThemePicker } from './ThemePicker'

interface PendingSubmissionLike {
  requestId: string
  text?: string
}

interface SessionLike {
  pendingSubmissions: readonly PendingSubmissionLike[]
}

type PendingSelector = (
  selector: (session: SessionLike) => readonly PendingSubmissionLike[],
) => readonly PendingSubmissionLike[]

/** Props injected by the conversation slot runtime. */
export interface PrototypeBarProps {
  /** Session-scoped selector hook supplied by the slot runtime. */
  useSession?: PendingSelector
}

const NO_PENDING: readonly PendingSubmissionLike[] = []
const useNoSession: PendingSelector = () => NO_PENDING

/**
 * The composer-row toggle and its theme popover.
 * @param props - injected session hook.
 * @returns the mode controls.
 */
export function PrototypeBar({ useSession }: PrototypeBarProps) {
  const enabled = usePrototype((state) => state.enabled)
  const themeId = usePrototype((state) => state.themeId)
  const accentId = usePrototype((state) => state.accentId)
  const [pickerOpen, setPickerOpen] = useState(false)
  const themeTriggerRef = useRef<HTMLButtonElement>(null)
  const seenRef = useRef<Set<string>>(new Set())
  const primedRef = useRef(false)
  const sessionSelector = typeof useSession === 'function' ? useSession : useNoSession
  const pending = sessionSelector((session) => session.pendingSubmissions ?? NO_PENDING)

  useEffect(() => {
    if (!primedRef.current) {
      primedRef.current = true
      for (const item of pending) seenRef.current.add(item.requestId)
      return
    }
    if (!enabled) {
      for (const item of pending) seenRef.current.add(item.requestId)
      return
    }
    for (const item of pending) {
      if (seenRef.current.has(item.requestId)) continue
      seenRef.current.add(item.requestId)
      const prompt = item.text?.trim()
      generate(prompt !== undefined && prompt !== '' ? prompt : SAMPLE_PROMPT)
      openPreview()
    }
  }, [enabled, pending])

  const closePicker = () => setPickerOpen(false)

  const toggle = () => {
    if (enabled) closePicker()
    setEnabled(!enabled)
  }

  const theme = getTheme(themeId)
  const accent = getAccent(accentId)

  return (
    <div className="dshp-bar">
      <button
        type="button"
        className="dshp-toggle"
        data-active={enabled}
        aria-pressed={enabled}
        title={enabled ? '关闭原型创作' : '开启后，任意对话都会生成右侧原型预览'}
        onClick={toggle}
      >
        <span className="dshp-toggle__spark" aria-hidden="true">
          <SparkIcon size={13} />
        </span>
        <span>原型创作</span>
        {enabled ? <span className="dshp-toggle__dot" aria-hidden="true" /> : null}
      </button>

      {enabled ? (
        <button
          ref={themeTriggerRef}
          type="button"
          className="dshp-theme-trigger"
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          title="选择设计主题与主题色"
          onClick={() => {
            ensureGenerated()
            setPickerOpen((open) => !open)
          }}
        >
          <span className="dshp-swatch-dot" style={{ background: accent.value }} aria-hidden="true" />
          <span>{theme.name}</span>
          <ChevronDownIcon className="dshp-chevron" size={10} />
        </button>
      ) : null}

      {enabled && pickerOpen ? <ThemePicker anchorRef={themeTriggerRef} onClose={closePicker} /> : null}
    </div>
  )
}
