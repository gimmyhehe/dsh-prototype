/** Theme and accent catalogue for the prototype preview. */

/** Light or dark base surface family. */
export type ThemeMode = 'light' | 'dark'

/** Colors and shape a generated prototype inherits. */
export interface ThemeTokens {
  /** Page background. */
  bg: string
  /** Cards and elevated surfaces. */
  surface: string
  /** Secondary surface (inputs, nested panels). */
  surfaceAlt: string
  /** Primary text. */
  text: string
  /** Secondary text. */
  muted: string
  /** Hairline borders. */
  border: string
  /** Corner radius in pixels. */
  radius: number
  /** Card shadow. */
  shadow: string
}

/** One selectable design theme. */
export interface PrototypeTheme {
  id: string
  /** Display name in the picker. */
  name: string
  /** One-line description. */
  tagline: string
  mode: ThemeMode
  tokens: ThemeTokens
}

/** One selectable accent color. */
export interface AccentOption {
  id: string
  name: string
  value: string
}

/** One selectable corner-radius preset. */
export interface RadiusOption {
  id: string
  name: string
  value: number
}

/** Themes shown in the picker, in display order. */
export const THEMES: readonly PrototypeTheme[] = [
  {
    id: 'minimal',
    name: '极简白',
    tagline: '克制留白，适合产品官网',
    mode: 'light',
    tokens: {
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f6f7f9',
      text: '#0f172a',
      muted: '#64748b',
      border: '#e5e8ef',
      radius: 16,
      shadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 24px 48px -28px rgba(15, 23, 42, 0.28)',
    },
  },
  {
    id: 'midnight',
    name: '深空黑',
    tagline: '深色画布，适合开发者工具',
    mode: 'dark',
    tokens: {
      bg: '#0a0c12',
      surface: '#12151d',
      surfaceAlt: '#171b25',
      text: '#f1f4f9',
      muted: '#98a2b7',
      border: '#242a36',
      radius: 16,
      shadow: '0 1px 2px rgba(0, 0, 0, 0.42), 0 28px 56px -30px rgba(0, 0, 0, 0.85)',
    },
  },
  {
    id: 'sand',
    name: '暖砂',
    tagline: '温暖纸感，适合内容与活动',
    mode: 'light',
    tokens: {
      bg: '#faf6ef',
      surface: '#fffdf9',
      surfaceAlt: '#f3ebdd',
      text: '#2a2118',
      muted: '#7b6a55',
      border: '#e7dccb',
      radius: 18,
      shadow: '0 1px 2px rgba(64, 44, 22, 0.05), 0 24px 48px -28px rgba(64, 44, 22, 0.28)',
    },
  },
  {
    id: 'neon',
    name: '赛博',
    tagline: '高对比霓虹，适合 AI 产品',
    mode: 'dark',
    tokens: {
      bg: '#070912',
      surface: '#101428',
      surfaceAlt: '#151a33',
      text: '#eef2ff',
      muted: '#8f98c9',
      border: '#262c4d',
      radius: 12,
      shadow: '0 1px 2px rgba(0, 0, 0, 0.5), 0 30px 60px -30px rgba(79, 70, 229, 0.55)',
    },
  },
  {
    id: 'mono',
    name: '墨白',
    tagline: '黑白编辑感，适合品牌展示',
    mode: 'light',
    tokens: {
      bg: '#f4f4f2',
      surface: '#ffffff',
      surfaceAlt: '#ecece8',
      text: '#111111',
      muted: '#6b6b66',
      border: '#dcdcd7',
      radius: 8,
      shadow: '0 1px 2px rgba(0, 0, 0, 0.05), 0 22px 44px -30px rgba(0, 0, 0, 0.32)',
    },
  },
] as const

/** Accent swatches shown under the theme grid. */
export const ACCENTS: readonly AccentOption[] = [
  { id: 'blue', name: '深蓝', value: '#2563eb' },
  { id: 'indigo', name: '靛紫', value: '#6366f1' },
  { id: 'emerald', name: '翠绿', value: '#10b981' },
  { id: 'violet', name: '紫罗兰', value: '#8b5cf6' },
  { id: 'orange', name: '活力橙', value: '#f97316' },
  { id: 'amber', name: '琥珀', value: '#f59e0b' },
  { id: 'rose', name: '玫瑰', value: '#f43f5e' },
  { id: 'ink', name: '墨黑', value: '#111827' },
] as const

/** Corner-radius presets. */
export const RADIUS_OPTIONS: readonly RadiusOption[] = [
  { id: 'sharp', name: '利落', value: 8 },
  { id: 'soft', name: '柔和', value: 14 },
  { id: 'round', name: '圆润', value: 22 },
] as const

/** Default theme id. */
export const DEFAULT_THEME_ID = 'minimal'

/** Default accent id. */
export const DEFAULT_ACCENT_ID = 'blue'

/** Default radius preset id. */
export const DEFAULT_RADIUS_ID = 'soft'

/**
 * Resolve a theme id to a theme, falling back to the default.
 * @param id - theme id.
 * @returns the matching theme or the first theme.
 */
export function getTheme(id: string): PrototypeTheme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0]!
}

/**
 * Resolve an accent id to an accent, falling back to the default.
 * @param id - accent id.
 * @returns the matching accent or the first accent.
 */
export function getAccent(id: string): AccentOption {
  return ACCENTS.find((accent) => accent.id === id) ?? ACCENTS[0]!
}

/**
 * Resolve a radius id to a radius preset.
 * @param id - radius id.
 * @returns the matching preset or the default preset.
 */
export function getRadius(id: string): RadiusOption {
  return RADIUS_OPTIONS.find((option) => option.id === id) ?? RADIUS_OPTIONS[1]!
}
