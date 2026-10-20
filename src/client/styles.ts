/**
 * One stylesheet injected when the plugin applies.
 *
 * The classes are prefixed (`dshp-`) and only reference public `--dsw-*`
 * theme tokens, so the surfaces follow the app's light/dark theme without a
 * separate theme layer.
 */

const STYLE_ID = 'dsh-prototype-styles'

/** Plugin stylesheet text. */
const CSS = `
/* The host app ships no global \`box-sizing\` reset — only <button> defaults to
   border-box — so every plugin surface opts in explicitly. Without this the
   popover's \`width\` excludes its padding and the theme preview's \`width: 38px\`
   grows to 52px, which inflates the grid's min-content size. */
.dshp-bar, .dshp-bar *, .dshp-bar *::before, .dshp-bar *::after,
.dshp-popover, .dshp-popover *, .dshp-popover *::before, .dshp-popover *::after,
.dshp-panel, .dshp-panel *, .dshp-panel *::before, .dshp-panel *::after {
  box-sizing: border-box;
}

.dshp-bar { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }

.dshp-toggle,
.dshp-theme-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-family: var(--dsw-font-family);
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
}
.dshp-toggle:hover,
.dshp-theme-trigger:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dshp-toggle:focus-visible,
.dshp-theme-trigger:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);
  outline-offset: 2px;
}
.dshp-toggle[data-active="true"] {
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 42%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 11%, transparent);
  color: var(--dsw-alias-brand-primary);
}
.dshp-toggle[data-active="true"]:hover {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 17%, transparent);
}
.dshp-toggle__spark { display: grid; place-items: center; width: 14px; height: 14px; }
.dshp-toggle__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--dsw-alias-brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent);
}
.dshp-theme-trigger { padding: 0 8px 0 9px; }
.dshp-swatch-dot { width: 9px; height: 9px; border-radius: 50%; flex: none; }
.dshp-chevron { width: 10px; height: 10px; opacity: 0.6; flex: none; }

.dshp-popover {
  position: fixed;
  z-index: 1200;
  /* Wide enough for two theme cards (preview + name + one-line tagline). */
  width: 360px;
  max-width: calc(100vw - 24px);
  padding: 14px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 16px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
  box-shadow: var(--dsw-elevation-panel);
}
.dshp-popover__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dshp-popover__title { font-size: 12.5px; font-weight: 650; letter-spacing: 0.01em; }
.dshp-popover__sub { margin-top: 3px; font-size: 10.5px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
.dshp-close {
  display: grid; place-items: center; width: 24px; height: 24px; flex: none;
  border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer;
}
.dshp-close:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }

.dshp-section { margin-top: 14px; }
.dshp-section__label {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  margin-bottom: 8px; font-size: 10.5px; font-weight: 600; color: var(--dsw-alias-label-secondary);
}
.dshp-section__hint { font-weight: 400; color: var(--dsw-alias-label-tertiary); font-size: 10px; }

/* \`minmax(0, 1fr)\` plus the item's \`min-width: 0\` keep the two tracks from
   growing past the popover when a card's content is wide (a nowrap tagline used
   to push the whole grid out of the panel). */
.dshp-theme-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.dshp-theme {
  display: flex; align-items: center; gap: 8px;
  min-width: 0;
  padding: 7px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-primary); text-align: left; cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}
.dshp-theme:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dshp-theme:last-child:nth-child(odd) { grid-column: span 2; }
.dshp-theme[data-selected="true"] {
  border-color: var(--dsw-alias-brand-primary);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-brand-primary);
}
.dshp-theme:focus-visible { outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color); outline-offset: 2px; }
.dshp-theme__preview {
  display: flex; flex-direction: column; justify-content: space-between;
  width: 38px; height: 30px; padding: 6px; border-radius: 6px; flex: none;
  border: 1px solid var(--dsw-alias-border-l1); overflow: hidden;
}
.dshp-theme__bars { display: flex; gap: 2px; }
.dshp-theme__bar { height: 3px; border-radius: 999px; }
.dshp-theme__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.dshp-theme__name { font-size: 11.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dshp-theme__tagline {
  font-size: 9.5px; line-height: 1.4; color: var(--dsw-alias-label-tertiary);
  overflow-wrap: anywhere;
}
.dshp-check { margin-left: auto; color: var(--dsw-alias-brand-primary); flex: none; }

.dshp-swatches { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.dshp-swatch {
  display: grid; place-items: center; width: 26px; height: 26px; padding: 0;
  border: 1px solid transparent; border-radius: 50%; background: transparent; cursor: pointer;
}
.dshp-swatch span { display: block; width: 20px; height: 20px; border-radius: 50%; }
.dshp-swatch[data-selected="true"] {
  border-color: var(--dsw-alias-label-primary);
  box-shadow: 0 0 0 2px var(--dsw-alias-bg-layer-1), 0 0 0 3px var(--dsw-alias-label-primary);
}
.dshp-swatch:focus-visible { outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color); outline-offset: 2px; }

.dshp-seg {
  display: flex; align-items: center; gap: 2px; padding: 2px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: var(--dsw-alias-bg-layer-2);
}
.dshp-seg button {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  min-width: 44px; height: 22px; padding: 0 8px;
  border: 0; border-radius: 6px; background: transparent;
  color: var(--dsw-alias-label-tertiary); font-family: var(--dsw-font-family); font-size: 10.5px; cursor: pointer;
}
.dshp-seg button:hover { color: var(--dsw-alias-label-primary); }
.dshp-seg button[data-selected="true"] {
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);
}

.dshp-popover__foot {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  margin-top: 14px; padding-top: 11px; border-top: 1px solid var(--dsw-alias-border-l2);
}
.dshp-popover__note { font-size: 9.5px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
.dshp-link {
  display: inline-flex; align-items: center; gap: 5px; flex: none;
  border: 0; background: transparent; padding: 2px 0;
  color: var(--dsw-alias-brand-primary); font-family: var(--dsw-font-family); font-size: 10.5px; font-weight: 600; cursor: pointer;
}
.dshp-link:hover { text-decoration: underline; }

.dshp-panel {
  display: flex; flex-direction: column; height: 100%; min-height: 0;
  background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
}
.dshp-panel__head {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  flex-wrap: wrap; padding: 8px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
}
.dshp-panel__id { display: flex; align-items: center; gap: 7px; min-width: 0; flex: 1; }
.dshp-panel__mark {
  display: grid; place-items: center; width: 22px; height: 22px; flex: none;
  border-radius: 7px; background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);
  color: var(--dsw-alias-brand-primary);
}
.dshp-panel__name { font-size: 12px; font-weight: 650; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dshp-status {
  display: inline-flex; align-items: center; gap: 5px; flex: none;
  padding: 3px 7px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-tertiary); font-size: 9.5px; white-space: nowrap;
}
.dshp-status__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--dsw-alias-state-success-primary); }
.dshp-status[data-status="generating"] .dshp-status__dot {
  background: var(--dsw-alias-brand-primary);
  animation: dshp-pulse 1.1s ease-in-out infinite;
}
.dshp-status[data-status="idle"] .dshp-status__dot { background: var(--dsw-alias-label-tertiary); }
.dshp-panel__tools { display: flex; align-items: center; gap: 5px; flex: none; }
.dshp-toolbar-divider { width: 1px; height: 14px; margin: 0 2px; background: var(--dsw-alias-border-l2); }
.dshp-icon-btn {
  display: grid; place-items: center; width: 25px; height: 25px; padding: 0;
  border: 1px solid transparent; border-radius: 7px; background: transparent;
  color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.dshp-icon-btn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dshp-icon-btn:disabled { opacity: 0.42; cursor: default; background: transparent; }
.dshp-icon-btn:focus-visible { outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color); outline-offset: 1px; }
.dshp-icon-btn[data-active="true"] { background: var(--dsw-alias-interactive-bg-active); color: var(--dsw-alias-label-primary); }

.dshp-panel__toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 6px 10px; border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1); flex-wrap: wrap;
}
.dshp-toolbar__group { display: flex; align-items: center; gap: 6px; min-width: 0; }
.dshp-theme-chip {
  display: inline-flex; align-items: center; gap: 5px; max-width: 150px;
  height: 23px; padding: 0 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px;
  background: transparent; color: var(--dsw-alias-label-secondary);
  font-family: var(--dsw-font-family); font-size: 10px; cursor: pointer;
}
.dshp-theme-chip:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.dshp-theme-chip span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dshp-regen {
  display: inline-flex; align-items: center; gap: 5px; height: 23px; padding: 0 9px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px;
  background: transparent; color: var(--dsw-alias-label-secondary);
  font-family: var(--dsw-font-family); font-size: 10px; cursor: pointer;
}
.dshp-regen:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.dshp-regen:disabled { opacity: 0.5; cursor: default; }

.dshp-canvas { position: relative; flex: 1; min-height: 0; display: flex; }
.dshp-stage {
  flex: 1; min-height: 0; display: flex; justify-content: center; align-items: stretch;
  padding: 10px; overflow: auto; background:
    radial-gradient(600px 300px at 50% -10%, color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, transparent), transparent 70%),
    var(--dsw-alias-bg-base);
}
.dshp-frame {
  width: 100%; height: 100%; min-height: 240px; border: 0; border-radius: 10px;
  background: #ffffff; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08), 0 18px 40px -26px rgba(15, 23, 42, 0.45);
}
.dshp-stage[data-device="tablet"] .dshp-frame { width: min(820px, 100%); }
.dshp-stage[data-device="mobile"] .dshp-frame { width: min(390px, 100%); }

.dshp-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 78%, transparent);
  backdrop-filter: blur(3px); z-index: 2; color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
}
.dshp-spinner {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 20%, transparent);
  border-top-color: var(--dsw-alias-brand-primary);
  animation: dshp-spin 0.8s linear infinite;
}
.dshp-empty {
  margin: auto; max-width: 300px; padding: 26px 22px; text-align: center;
  border: 1px dashed var(--dsw-alias-border-l3); border-radius: 14px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 70%, transparent);
}
.dshp-empty__icon {
  display: grid; place-items: center; width: 38px; height: 38px; margin: 0 auto 12px;
  border-radius: 11px; background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);
  color: var(--dsw-alias-brand-primary);
}
.dshp-empty h3 { margin: 0; font-size: 13px; font-weight: 650; }
.dshp-empty p { margin: 7px 0 14px; font-size: 11px; line-height: 1.65; color: var(--dsw-alias-label-tertiary); }
.dshp-cta {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 30px; padding: 0 14px; border: 0; border-radius: 999px;
  background: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-label-primary-foreground);
  font-family: var(--dsw-font-family); font-size: 11.5px; font-weight: 600; cursor: pointer;
}
.dshp-cta:hover { background: var(--dsw-alias-button-primary-hover); }

.dshp-panel__foot {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 6px 11px; border-top: 1px solid var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-tertiary); font-size: 9.5px;
}
.dshp-panel__foot code {
  font-family: var(--dsw-font-markdown-code-font-family); font-size: 9.5px;
  padding: 1px 4px; border-radius: 4px; background: var(--dsw-alias-bg-layer-2);
}
.dshp-foot__meta { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.dshp-foot__meta span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@keyframes dshp-spin { to { transform: rotate(360deg); } }
@keyframes dshp-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 color-mix(in srgb, var(--dsw-alias-brand-primary) 35%, transparent); }
  50% { opacity: 0.55; box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 0%, transparent); }
}
@media (prefers-reduced-motion: reduce) {
  .dshp-spinner { animation: none; }
  .dshp-status[data-status="generating"] .dshp-status__dot { animation: none; }
}
`

/** Inject the plugin stylesheet once per document. */
export function injectStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return
  const tag = document.createElement('style')
  tag.id = STYLE_ID
  tag.dataset.plugin = 'dsh-prototype'
  tag.textContent = CSS
  document.head.appendChild(tag)
}
