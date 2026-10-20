/**
 * Late-bound bridge to the right Sidebar.
 *
 * The sidebar services are optional from this plugin's point of view: the
 * composer toggle still works without them. `apply` binds the opener once the
 * services are available and unbinds it on disposal.
 */

/** Opens (or focuses) the prototype preview tab. */
export type PreviewOpener = () => void

let opener: PreviewOpener | null = null

/**
 * Bind the current preview opener.
 * @param next - opener callback, or `null` to unbind.
 */
export function bindPreviewOpener(next: PreviewOpener | null): void {
  opener = next
}

/** Open the preview tab, if the right Sidebar is available. */
export function openPreview(): void {
  opener?.()
}

/**
 * Report whether the preview can be opened.
 * @returns true once the opener is bound.
 */
export function canOpenPreview(): boolean {
  return opener !== null
}
