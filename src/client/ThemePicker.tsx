/** Anchored theme picker: theme cards, accent swatches, radius presets. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { createPortal } from 'react-dom'
import { openPreview } from './controller'
import { CheckIcon, CloseIcon, PanelIcon } from './icons'
import { selectAccent, selectRadius, selectTheme, usePrototype } from './store'
import { ACCENTS, RADIUS_OPTIONS, THEMES, getAccent } from './themes'

/** Props for the theme popover. */
export interface ThemePickerProps {
  /** Trigger element used for anchoring and click-outside detection. */
  anchorRef: RefObject<HTMLElement>
  /** Close the popover. */
  onClose: () => void
}

interface Position {
  left: number
  top: number
}

/**
 * Fixed-position popover that flips above or below the composer trigger.
 * @param props - anchor ref and close callback.
 * @returns the popover portal.
 */
export function ThemePicker({ anchorRef, onClose }: ThemePickerProps) {
  const themeId = usePrototype((state) => state.themeId)
  const accentId = usePrototype((state) => state.accentId)
  const radiusId = usePrototype((state) => state.radiusId)
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<Position | null>(null)

  const place = useCallback(() => {
    const anchor = anchorRef.current
    const panel = panelRef.current
    if (anchor === null || panel === null) return
    const rect = anchor.getBoundingClientRect()
    const width = panel.offsetWidth
    const height = panel.offsetHeight
    const margin = 10
    const gap = 8
    let left = rect.left + rect.width / 2 - width / 2
    left = Math.min(Math.max(margin, left), window.innerWidth - margin - width)
    let top = rect.top - height - gap
    if (top < margin) {
      top = Math.min(rect.bottom + gap, window.innerHeight - margin - height)
    }
    setPosition({ left, top: Math.max(margin, top) })
  }, [anchorRef])

  useLayoutEffect(() => {
    place()
    panelRef.current?.focus({ preventScroll: true })
  }, [place])

  useEffect(() => {
    const onViewportChange = () => place()
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [place])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (target === null) return
      if (panelRef.current?.contains(target) === true) return
      if (anchorRef.current?.contains(target) === true) return
      onClose()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
      anchorRef.current?.focus({ preventScroll: true })
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [anchorRef, onClose])

  const accent = getAccent(accentId)

  return createPortal(
    <div
      ref={panelRef}
      className="dshp-popover"
      role="dialog"
      aria-label="原型设计主题"
      tabIndex={-1}
      style={{
        left: position?.left ?? -9999,
        top: position?.top ?? -9999,
      }}
    >
      <div className="dshp-popover__head">
        <div>
          <div className="dshp-popover__title">设计主题</div>
          <div className="dshp-popover__sub">主题决定页面气质，主题色决定强调。</div>
        </div>
        <button type="button" className="dshp-close" aria-label="关闭主题设置" onClick={onClose}>
          <CloseIcon size={13} />
        </button>
      </div>

      <div className="dshp-section">
        <div className="dshp-section__label">
          <span>主题</span>
          <span className="dshp-section__hint">{THEMES.length} 套</span>
        </div>
        <div className="dshp-theme-grid" role="radiogroup" aria-label="设计主题">
          {THEMES.map((theme) => {
            const selected = theme.id === themeId
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${theme.name}：${theme.tagline}`}
                className="dshp-theme"
                data-selected={selected}
                onClick={() => selectTheme(theme.id)}
              >
                <span
                  className="dshp-theme__preview"
                  style={{ background: theme.tokens.bg, borderColor: theme.tokens.border }}
                  aria-hidden="true"
                >
                  <span className="dshp-theme__bars">
                    <span
                      className="dshp-theme__bar"
                      style={{ width: 16, background: theme.tokens.text, opacity: 0.72 }}
                    />
                    <span className="dshp-theme__bar" style={{ width: 8, background: accent.value }} />
                  </span>
                  <span
                    style={{
                      display: 'block',
                      height: 9,
                      borderRadius: 3,
                      background: theme.tokens.surfaceAlt,
                      border: `1px solid ${theme.tokens.border}`,
                    }}
                  />
                </span>
                <span className="dshp-theme__text">
                  <span className="dshp-theme__name">{theme.name}</span>
                  <span className="dshp-theme__tagline">{theme.tagline}</span>
                </span>
                {selected ? <CheckIcon className="dshp-check" size={12} /> : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="dshp-section">
        <div className="dshp-section__label">
          <span>主题色</span>
          <span className="dshp-section__hint">{accent.name}</span>
        </div>
        <div className="dshp-swatches" role="radiogroup" aria-label="主题色">
          {ACCENTS.map((option) => {
            const selected = option.id === accentId
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={option.name}
                title={option.name}
                className="dshp-swatch"
                data-selected={selected}
                onClick={() => selectAccent(option.id)}
              >
                <span style={{ background: option.value }} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="dshp-section">
        <div className="dshp-section__label">
          <span>圆角</span>
          <span className="dshp-section__hint">{RADIUS_OPTIONS.find((option) => option.id === radiusId)?.value ?? 14}px</span>
        </div>
        <div className="dshp-seg" role="radiogroup" aria-label="圆角">
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={option.id === radiusId}
              data-selected={option.id === radiusId}
              onClick={() => selectRadius(option.id)}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <div className="dshp-popover__foot">
        <div className="dshp-popover__note">开启后，发送任意消息都会刷新右侧原型。</div>
        <button
          type="button"
          className="dshp-link"
          onClick={() => {
            openPreview()
            onClose()
          }}
        >
          <PanelIcon size={12} />
          打开预览
        </button>
      </div>
    </div>,
    document.body,
  )
}
