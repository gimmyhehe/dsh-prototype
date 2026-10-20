/**
 * Self-contained HTML document generator for the preview panel.
 *
 * This is deliberately a deterministic template rather than a model call: the
 * scaffold's job is to prove the end-to-end UI (toggle → submit → right-side
 * preview), not to generate real designs yet. Swap `renderPrototypeHtml` for
 * the model/tool result when the host half gains a real generation pipeline.
 */
import type { PrototypeTheme } from './themes'

/** Everything the template needs to render one prototype. */
export interface PrototypeDocumentInput {
  /** Latest user prompt (may be empty for the welcome sample). */
  prompt: string
  theme: PrototypeTheme
  /** Accent color as a `#rrggbb` string. */
  accent: string
  /** Corner radius in pixels. */
  radius: number
}

/** Prompt used when the user enables the mode before typing anything. */
export const SAMPLE_PROMPT = '为一场产品设计分享会创建报名落地页，包含活动信息与预约表单'

/**
 * Escape text for HTML text nodes and quoted attributes.
 * @param value - raw text.
 * @returns escaped text.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * Shorten a prompt for display without cutting a surrogate pair.
 * @param value - raw prompt.
 * @param max - maximum characters.
 * @returns the trimmed one-line summary.
 */
export function summarizePrompt(value: string, max = 72): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return `${Array.from(normalized).slice(0, max).join('')}…`
}

/**
 * Convert `#rrggbb` (or `#rgb`) to an `rgba()` string.
 * @param hex - color literal.
 * @param alpha - 0..1 opacity.
 * @returns CSS color.
 */
export function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3
    ? normalized.split('').map((part) => part + part).join('')
    : normalized.padEnd(6, '0').slice(0, 6)
  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Pick a readable foreground for an arbitrary accent color.
 * @param hex - accent color.
 * @returns black-ish or white-ish text color.
 */
export function contrastText(hex: string): string {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3
    ? normalized.split('').map((part) => part + part).join('')
    : normalized.padEnd(6, '0').slice(0, 6)
  const channels = [0, 2, 4].map((offset) => {
    const value = Number.parseInt(full.slice(offset, offset + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
  return luminance > 0.52 ? '#0b1020' : '#ffffff'
}

/** CSS for the generated document; tokens are injected as custom properties. */
const DOCUMENT_CSS = `
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  min-height: 100vh;
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background:
    radial-gradient(980px 540px at 84% -12%, var(--accent-soft), transparent 62%),
    radial-gradient(720px 420px at -8% 18%, var(--accent-soft-2), transparent 58%),
    var(--bg);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
a { color: inherit; text-decoration: none; }
button, input, select { font: inherit; }
.page { width: min(1180px, 100%); margin: 0 auto; padding: 22px 32px 48px; }
.nav { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 6px 0 42px; }
.brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.brand-mark {
  display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px;
  background: var(--text); color: var(--bg); font-weight: 800; font-size: 14px; letter-spacing: -0.04em;
}
.brand-name { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; }
.brand-tag {
  font-size: 9.5px; letter-spacing: 0.16em; color: var(--muted); border: 1px solid var(--border);
  padding: 4px 7px; border-radius: 999px; white-space: nowrap;
}
.nav-links { display: flex; align-items: center; gap: 22px; color: var(--muted); font-size: 13px; }
.nav-links a:hover { color: var(--text); }
.nav-cta {
  border: 1px solid var(--border); background: var(--surface); color: var(--text);
  border-radius: 999px; padding: 9px 16px; font-size: 12.5px; font-weight: 600; cursor: pointer;
}
.nav-cta:hover { border-color: var(--accent); color: var(--accent); }
.hero { display: grid; grid-template-columns: minmax(0, 1.04fr) minmax(330px, 0.96fr); gap: 52px; align-items: center; }
.eyebrow {
  display: inline-flex; align-items: center; gap: 8px; font-size: 11.5px; font-weight: 650;
  letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase;
}
.pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
h1 {
  margin: 18px 0 0; font-size: clamp(38px, 4.7vw, 60px); line-height: 1.06;
  letter-spacing: -0.038em; font-weight: 680;
}
h1 em { font-style: normal; color: var(--accent); }
.lede { max-width: 47ch; margin: 22px 0 0; color: var(--muted); font-size: 15.5px; line-height: 1.75; }
.brief {
  margin-top: 26px; padding: 15px 17px; border: 1px solid var(--border); border-left: 3px solid var(--accent);
  border-radius: 0 var(--radius) var(--radius) 0; background: var(--surface); max-width: 52ch;
}
.brief-label { display: block; font-size: 10px; letter-spacing: 0.12em; color: var(--muted); text-transform: uppercase; }
.brief p { margin: 6px 0 0; font-size: 13px; line-height: 1.6; color: var(--text); }
.meta-row { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 26px; }
.meta {
  display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--border);
  background: var(--surface); border-radius: 999px; padding: 7px 12px; font-size: 11.5px; color: var(--muted);
}
.meta b { color: var(--accent); font-size: 10px; letter-spacing: 0.08em; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); }
.signup { padding: 26px; }
.signup-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.signup-kicker { font-size: 9.5px; letter-spacing: 0.16em; color: var(--muted); }
.signup-count { font-size: 11px; color: var(--accent); background: var(--accent-soft); border-radius: 999px; padding: 4px 9px; }
.signup h2 { margin: 0; font-size: 22px; letter-spacing: -0.02em; }
.signup .sub { margin: 8px 0 20px; color: var(--muted); font-size: 12.5px; line-height: 1.65; }
.field { display: block; margin-bottom: 13px; }
.label { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; font-size: 11.5px; color: var(--muted); }
.input {
  width: 100%; border: 1px solid var(--border); background: var(--surface-alt); color: var(--text);
  border-radius: calc(var(--radius) * 0.58); padding: 10px 12px; font-size: 13px; outline: none;
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
.input::placeholder { color: var(--muted); opacity: 0.72; }
.input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
select.input { appearance: none; }
.segmented { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.seg {
  border: 1px solid var(--border); border-radius: calc(var(--radius) * 0.58); padding: 9px 10px;
  text-align: center; font-size: 12.5px; color: var(--muted); background: var(--surface-alt);
}
.seg.active { background: var(--text); color: var(--bg); border-color: var(--text); }
.btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  border: 0; margin-top: 5px; padding: 12px 16px; border-radius: calc(var(--radius) * 0.58);
  background: var(--accent); color: var(--accent-fg); font-size: 13.5px; font-weight: 700; cursor: pointer;
  transition: filter 140ms ease, transform 140ms ease;
}
.btn-primary:hover { filter: brightness(1.06); transform: translateY(-1px); }
.fine { margin: 12px 0 0; color: var(--muted); font-size: 10.5px; line-height: 1.6; text-align: center; }
.features { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 58px; }
.feature { padding: 22px; }
.feature .num { font-size: 10px; letter-spacing: 0.16em; color: var(--accent); font-weight: 700; }
.feature h3 { margin: 12px 0 8px; font-size: 15.5px; letter-spacing: -0.01em; }
.feature p { margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.7; }
.showcase {
  margin-top: 18px; padding: 28px; display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 30px; align-items: center; overflow: hidden;
}
.showcase h2 { margin: 12px 0 0; font-size: clamp(22px, 2.4vw, 30px); line-height: 1.2; letter-spacing: -0.025em; }
.showcase p { margin: 12px 0 0; color: var(--muted); font-size: 12.5px; line-height: 1.7; max-width: 38ch; }
.art {
  border: 1px solid var(--border); border-radius: calc(var(--radius) * 0.8); background: var(--surface-alt);
  overflow: hidden; box-shadow: 0 18px 40px -24px var(--accent-soft-strong);
}
.art-bar { display: flex; gap: 5px; padding: 10px 12px; border-bottom: 1px solid var(--border); background: var(--surface); }
.art-bar i { width: 7px; height: 7px; border-radius: 50%; background: var(--border); }
.art-bar i:first-child { background: var(--accent); }
.art-body { padding: 16px; display: grid; grid-template-columns: 1fr 1.05fr; gap: 12px; }
.art-col { display: grid; gap: 8px; align-content: start; }
.art-block { height: 8px; border-radius: 999px; background: var(--border); opacity: 0.9; }
.art-block.accent { background: var(--accent); opacity: 0.85; }
.art-block.strong { background: var(--text); opacity: 0.75; }
.w90 { width: 90%; } .w75 { width: 75%; } .w60 { width: 60%; } .w45 { width: 45%; }
.art-panel { border: 1px solid var(--border); border-radius: calc(var(--radius) * 0.5); background: var(--surface); padding: 10px; display: grid; gap: 7px; }
.art-pill { height: 16px; border-radius: 999px; background: var(--accent-soft); }
footer {
  display: flex; align-items: center; justify-content: space-between; gap: 18px;
  margin-top: 44px; padding-top: 18px; border-top: 1px solid var(--border);
  color: var(--muted); font-size: 11px;
}
footer b { color: var(--text); font-weight: 600; }
@media (max-width: 900px) {
  .page { padding: 18px 20px 40px; }
  .nav-links { display: none; }
  .hero { grid-template-columns: 1fr; gap: 30px; }
  .features { grid-template-columns: 1fr; margin-top: 34px; }
  .showcase { grid-template-columns: 1fr; }
  h1 { font-size: clamp(34px, 9vw, 46px); }
}
@media (max-width: 560px) {
  .brand-tag { display: none; }
  .nav-cta { padding: 8px 12px; }
  .signup { padding: 20px; }
  .art-body { grid-template-columns: 1fr; }
  footer { flex-direction: column; align-items: flex-start; gap: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
`

/**
 * Render the complete HTML document shown in the preview iframe.
 * @param input - prompt, theme, accent, and radius.
 * @returns a standalone HTML document.
 */
export function renderPrototypeHtml(input: PrototypeDocumentInput): string {
  const { prompt, theme, accent, radius } = input
  const tokens = theme.tokens
  const promptSummary = summarizePrompt(prompt || SAMPLE_PROMPT)
  const accentSoft = withAlpha(accent, theme.mode === 'dark' ? 0.2 : 0.11)
  const accentSoft2 = withAlpha(accent, theme.mode === 'dark' ? 0.1 : 0.06)
  const accentFg = contrastText(accent)
  const modeLabel = theme.mode === 'dark' ? '深色' : '浅色'
  const dateLabel = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(summarizePrompt(prompt || SAMPLE_PROMPT, 28))} · 原型预览</title>
<style>
:root {
  --bg: ${tokens.bg};
  --surface: ${tokens.surface};
  --surface-alt: ${tokens.surfaceAlt};
  --text: ${tokens.text};
  --muted: ${tokens.muted};
  --border: ${tokens.border};
  --accent: ${accent};
  --accent-fg: ${accentFg};
  --accent-soft: ${accentSoft};
  --accent-soft-2: ${accentSoft2};
  --accent-soft-strong: ${withAlpha(accent, 0.38)};
  --radius: ${radius}px;
  --shadow: ${tokens.shadow};
}
${DOCUMENT_CSS}
</style>
</head>
<body>
<div class="page">
  <header class="nav">
    <div class="brand">
      <span class="brand-mark">P</span>
      <span class="brand-name">Prototype Lab</span>
      <span class="brand-tag">AI GENERATED</span>
    </div>
    <nav class="nav-links" aria-label="主导航">
      <a href="#features">能力</a>
      <a href="#showcase">主题</a>
      <a href="#signup">体验</a>
    </nav>
    <button class="nav-cta" type="button">打开工作台</button>
  </header>

  <main>
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow"><span class="pulse"></span>AI 原型 · 实时生成</span>
        <h1>让每一个想法，<br /><em>先被看见。</em></h1>
        <p class="lede">这是一版根据你的描述生成的可交互落地页。它包含真实的内容层级、表单与响应式布局，可以直接用来对齐产品方向。</p>
        <div class="brief">
          <span class="brief-label">需求摘要</span>
          <p>「${escapeHtml(promptSummary)}」</p>
        </div>
        <div class="meta-row">
          <span class="meta"><b>01</b> ${escapeHtml(theme.name)}主题</span>
          <span class="meta"><b>02</b> ${escapeHtml(modeLabel)}模式</span>
          <span class="meta"><b>03</b> 自适应布局</span>
        </div>
      </div>

      <aside class="card signup" id="signup">
        <div class="signup-head">
          <span class="signup-kicker">EARLY ACCESS</span>
          <span class="signup-count">剩余 38 席</span>
        </div>
        <h2>预约产品体验</h2>
        <p class="sub">留下联系方式，我们会为你开通原型预览空间，并同步第一版设计稿。</p>
        <form onsubmit="return false">
          <label class="field">
            <span class="label">姓名</span>
            <input class="input" type="text" placeholder="例如：林知夏" autocomplete="name" />
          </label>
          <label class="field">
            <span class="label">工作邮箱</span>
            <input class="input" type="email" placeholder="name@example.com" autocomplete="email" />
          </label>
          <label class="field">
            <span class="label">团队规模</span>
            <select class="input">
              <option>1 - 10 人</option>
              <option>11 - 50 人</option>
              <option>51 - 200 人</option>
              <option>200 人以上</option>
            </select>
          </label>
          <div class="field">
            <span class="label">参与方式</span>
            <div class="segmented">
              <span class="seg active">线上体验</span>
              <span class="seg">线下工作坊</span>
            </div>
          </div>
          <button class="btn-primary" type="button">提交预约 <span aria-hidden="true">→</span></button>
          <p class="fine">提交即表示同意我们通过邮件发送本次产品体验邀请。</p>
        </form>
      </aside>
    </section>

    <section class="features" id="features">
      <article class="card feature">
        <span class="num">01 / BRIEF</span>
        <h3>一句话生成结构</h3>
        <p>描述产品、受众与目标，立即得到包含导航、主视觉与转化表单的页面骨架。</p>
      </article>
      <article class="card feature">
        <span class="num">02 / THEME</span>
        <h3>主题与主题色</h3>
        <p>设计主题决定气质，主题色决定强调。切换后整页同步刷新，无需重新描述。</p>
      </article>
      <article class="card feature">
        <span class="num">03 / HANDOFF</span>
        <h3>可交付的 HTML</h3>
        <p>预览就是一整份自包含 HTML，可复制、下载或继续交给模型迭代。</p>
      </article>
    </section>

    <section class="card showcase" id="showcase">
      <div class="showcase-copy">
        <span class="eyebrow">LIVE CANVAS</span>
        <h2>主题、主题色、圆角，随时切换。</h2>
        <p>当前预览：${escapeHtml(theme.name)} · ${escapeHtml(theme.tagline)} · ${radius}px 圆角。</p>
      </div>
      <div class="art" aria-hidden="true">
        <div class="art-bar"><i></i><i></i><i></i></div>
        <div class="art-body">
          <div class="art-col">
            <span class="art-block accent w60"></span>
            <span class="art-block strong w90"></span>
            <span class="art-block strong w75"></span>
            <span class="art-block w90"></span>
            <span class="art-block w60"></span>
          </div>
          <div class="art-panel">
            <span class="art-pill"></span>
            <span class="art-block w75"></span>
            <span class="art-block w90"></span>
            <span class="art-pill"></span>
            <span class="art-block w45"></span>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <span><b>Prototype Lab</b> · 由 dsh-prototype 生成</span>
    <span>${dateLabel} · 仅用于原型预览</span>
  </footer>
</div>
</body>
</html>
`
}
