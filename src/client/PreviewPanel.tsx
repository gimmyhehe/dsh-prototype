/**
 * Right-Sidebar tab body: a device-aware iframe over the generated document
 * plus toolbar actions (theme, viewport, regenerate, copy, download, open).
 */
import { useRef, useState } from 'react'
import {
  CheckIcon,
  CopyIcon,
  CubeIcon,
  DesktopIcon,
  DownloadIcon,
  ExternalIcon,
  PhoneIcon,
  RefreshIcon,
  SparkIcon,
  TabletIcon,
} from './icons'
import { regenerate, selectDevice, setEnabled, usePrototype } from './store'
import { getAccent, getRadius, getTheme } from './themes'
import { ThemePicker } from './ThemePicker'
import type { Device } from './store'

const DEVICES: ReadonlyArray<{ id: Device; label: string; icon: typeof DesktopIcon }> = [
  { id: 'desktop', label: '桌面', icon: DesktopIcon },
  { id: 'tablet', label: '平板', icon: TabletIcon },
  { id: 'mobile', label: '手机', icon: PhoneIcon },
]

/**
 * Copy text through the async clipboard API, falling back to a hidden textarea.
 * @param text - text to copy.
 * @returns whether the copy succeeded.
 */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard !== undefined) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the legacy path.
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

/**
 * Trigger a browser download of the generated document.
 * @param html - standalone HTML document.
 */
function downloadHtml(html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'prototype.html'
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

/** The preview tab body. */
export function PreviewPanel() {
  const state = usePrototype((snapshot) => snapshot)
  const theme = getTheme(state.themeId)
  const accent = getAccent(state.accentId)
  const [copied, setCopied] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const themeChipRef = useRef<HTMLButtonElement>(null)

  const generating = state.status === 'generating'
  const statusText = generating ? '生成中' : state.html === '' ? '待生成' : '已生成'
  const updatedLabel = state.updatedAt === 0
    ? '尚未生成'
    : `更新于 ${new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date(state.updatedAt))}`
  const deviceLabel = DEVICES.find((device) => device.id === state.device)?.label ?? '桌面'

  const onCopy = async () => {
    if (state.html === '') return
    if (await copyText(state.html)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }

  const onOpenExternal = () => {
    if (state.html === '') return
    const blob = new Blob([state.html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  return (
    <div className="dshp-panel">
      <header className="dshp-panel__head">
        <div className="dshp-panel__id">
          <span className="dshp-panel__mark" aria-hidden="true">
            <SparkIcon size={12} />
          </span>
          <span className="dshp-panel__name">原型预览</span>
          <span className="dshp-status" data-status={state.status}>
            <span className="dshp-status__dot" aria-hidden="true" />
            {statusText}
          </span>
        </div>
        <div className="dshp-panel__tools">
          {DEVICES.map((device) => {
            const Icon = device.icon
            return (
              <button
                key={device.id}
                type="button"
                className="dshp-icon-btn"
                data-active={state.device === device.id}
                title={`${device.label}视图`}
                aria-label={`${device.label}视图`}
                aria-pressed={state.device === device.id}
                onClick={() => selectDevice(device.id)}
              >
                <Icon size={13} />
              </button>
            )
          })}
          <span className="dshp-toolbar-divider" aria-hidden="true" />
          <button
            type="button"
            className="dshp-icon-btn"
            title="重新生成"
            aria-label="重新生成"
            disabled={generating}
            onClick={() => regenerate()}
          >
            <RefreshIcon size={13} />
          </button>
          <button
            type="button"
            className="dshp-icon-btn"
            title={copied ? '已复制 HTML' : '复制 HTML'}
            aria-label={copied ? '已复制 HTML' : '复制 HTML'}
            disabled={state.html === ''}
            onClick={onCopy}
          >
            {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
          </button>
          <button
            type="button"
            className="dshp-icon-btn"
            title="下载 HTML"
            aria-label="下载 HTML"
            disabled={state.html === ''}
            onClick={() => downloadHtml(state.html)}
          >
            <DownloadIcon size={13} />
          </button>
          <button
            type="button"
            className="dshp-icon-btn"
            title="在新窗口打开"
            aria-label="在新窗口打开"
            disabled={state.html === ''}
            onClick={onOpenExternal}
          >
            <ExternalIcon size={13} />
          </button>
        </div>
      </header>

      <div className="dshp-panel__toolbar">
        <div className="dshp-toolbar__group">
          <button
            ref={themeChipRef}
            type="button"
            className="dshp-theme-chip"
            title="切换设计主题"
            aria-haspopup="dialog"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((open) => !open)}
          >
            <span className="dshp-swatch-dot" style={{ background: accent.value }} aria-hidden="true" />
            <span>{theme.name}</span>
            <span style={{ color: 'var(--dsw-alias-label-tertiary)' }}>· {accent.name}</span>
          </button>
          <span className="dshp-section__hint">{theme.mode === 'dark' ? '深色' : '浅色'} · {getRadius(state.radiusId).value}px 圆角</span>
        </div>
        <div className="dshp-toolbar__group">
          <span className="dshp-section__hint">{state.prompt === '' ? '示例内容' : '最近一次对话'}</span>
          <button type="button" className="dshp-regen" disabled={generating} onClick={() => regenerate()}>
            <RefreshIcon size={11} />
            重新生成
          </button>
        </div>
      </div>

      <div className="dshp-canvas">
        {state.html !== '' ? (
          <div className="dshp-stage" data-device={state.device}>
            <iframe
              className="dshp-frame"
              title="生成的 HTML 原型预览"
              srcDoc={state.html}
              sandbox="allow-forms allow-popups"
            />
          </div>
        ) : (
          <div className="dshp-stage">
            <div className="dshp-empty">
              <span className="dshp-empty__icon" aria-hidden="true">
                <CubeIcon size={19} />
              </span>
              <h3>还没有生成原型</h3>
              <p>开启原型创作后，在对话框里发送任意内容，这里会展示生成的 HTML 页面。</p>
              <button
                type="button"
                className="dshp-cta"
                onClick={() => {
                  if (state.enabled) regenerate(320)
                  else setEnabled(true)
                }}
              >
                {state.enabled ? '立即生成' : '开启原型创作'}
              </button>
            </div>
          </div>
        )}
        {generating ? (
          <div className="dshp-overlay" role="status" aria-live="polite">
            <span className="dshp-spinner" aria-hidden="true" />
            <span>正在根据你的描述生成原型…</span>
          </div>
        ) : null}
      </div>

      <footer className="dshp-panel__foot">
        <span className="dshp-foot__meta">
          <code>prototype.html</code>
          <span>·</span>
          <span>{theme.name}</span>
          <span>·</span>
          <span>{deviceLabel}</span>
        </span>
        <span>{updatedLabel} · 模拟预览</span>
      </footer>

      {pickerOpen ? <ThemePicker anchorRef={themeChipRef} onClose={() => setPickerOpen(false)} /> : null}
    </div>
  )
}
