/** Inline 16px line icons used by the prototype surfaces. */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

/**
 * Base wrapper with shared stroke defaults.
 * @param props - SVG props plus a pixel size.
 * @returns an inline SVG element.
 */
function Icon({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

/** Four-point sparkle; the mode toggle glyph. */
export function SparkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 1.8 9.15 6.1 13.4 7.25 9.15 8.4 8 12.7 6.85 8.4 2.6 7.25 6.85 6.1 8 1.8Z" />
      <path d="M12.9 11.2 13.35 12.7 14.8 13.15 13.35 13.6 12.9 15.1 12.45 13.6 11 13.15 12.45 12.7 12.9 11.2Z" />
    </Icon>
  )
}

/** Downwards chevron for disclosures. */
export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4 6 4 4 4-4" />
    </Icon>
  )
}

/** Overlapping color discs. */
export function PaletteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="6" r="3.1" />
      <circle cx="10" cy="10" r="3.1" />
    </Icon>
  )
}

/** Dismiss a transient surface. */
export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.2 4.2 7.6 7.6M11.8 4.2l-7.6 7.6" />
    </Icon>
  )
}

/** Selection checkmark. */
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m3.4 8.4 3 3 6.2-6.6" />
    </Icon>
  )
}

/** Desktop viewport glyph. */
export function DesktopIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="1.8" y="2.8" width="12.4" height="8.2" rx="1.4" />
      <path d="M6 13.6h4M8 11v2.6" />
    </Icon>
  )
}

/** Tablet viewport glyph. */
export function TabletIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.2" y="1.8" width="9.6" height="12.4" rx="1.5" />
      <path d="M7.4 11.9h1.2" />
    </Icon>
  )
}

/** Phone viewport glyph. */
export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.4" y="1.6" width="7.2" height="12.8" rx="1.8" />
      <path d="M7.3 12.1h1.4" />
    </Icon>
  )
}

/** Circular refresh arrow. */
export function RefreshIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.1 8a5.1 5.1 0 1 1-1.9-4" />
      <path d="M13.2 1.9v3.4h-3.4" />
    </Icon>
  )
}

/** Two overlapping pages. */
export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5.2" y="5.2" width="8.2" height="8.2" rx="1.4" />
      <path d="M10.8 5.2V4A1.4 1.4 0 0 0 9.4 2.6H3.9A1.3 1.3 0 0 0 2.6 3.9v5.5a1.4 1.4 0 0 0 1.4 1.4h1.2" />
    </Icon>
  )
}

/** Downward arrow into a tray. */
export function DownloadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 2.4v7.2M5.2 7l2.8 2.8L10.8 7" />
      <path d="M2.8 11.4v1.2a1.2 1.2 0 0 0 1.2 1.2h8a1.2 1.2 0 0 0 1.2-1.2v-1.2" />
    </Icon>
  )
}

/** Arrow leaving a box. */
export function ExternalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.4 2.6h4v4M13.4 2.6 7.9 8.1" />
      <path d="M12.2 9.7v2.5a1.2 1.2 0 0 1-1.2 1.2H3.8a1.2 1.2 0 0 1-1.2-1.2V5a1.2 1.2 0 0 1 1.2-1.2h2.5" />
    </Icon>
  )
}

/** Right-hand panel glyph. */
export function PanelIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="1.8" y="2.4" width="12.4" height="11.2" rx="1.6" />
      <path d="M9.6 2.4v11.2" />
    </Icon>
  )
}

/** Isometric cube for the empty canvas. */
export function CubeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m8 1.9 5.2 2.8v6.6L8 14.1l-5.2-2.8V4.7L8 1.9Z" />
      <path d="m2.8 4.7 5.2 2.9 5.2-2.9M8 7.6v6.5" />
    </Icon>
  )
}
