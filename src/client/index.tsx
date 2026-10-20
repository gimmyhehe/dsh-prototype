/**
 * Browser half: register the composer toggle and the right-Sidebar preview tab.
 *
 * Both registrations are contributions, not a fork of the conversation UI:
 *   - `conversation.input.left` adds the toggle to the composer tool row.
 *   - `sidebar.right.pane.tab` + `ctx.sidebarRightTabs` add a dockable preview.
 */
import { PreviewPanel } from './PreviewPanel'
import { PrototypeBar } from './PrototypeBar'
import { TAB_ID, TAB_KIND, TAB_TITLE, TOGGLE_ID } from './constants'
import { bindPreviewOpener } from './controller'
import { injectStyles } from './styles'

// Exported for the bundle smoke test and for a future host-side harness.
export { PreviewPanel, PrototypeBar }
export { generate as generatePrototype, getState as getPrototypeState } from './store'

export const name = 'dsh-prototype'

/** Services this plugin cannot work without. */
export const inject = ['slots']

/** Minimal structural types for the host surfaces used here. */
interface SlotDefinition {
  name: string
  id?: string
  order?: number
  key?: string
}

interface SlotsService {
  inject(name: string, callback: () => () => void): void
  register(definition: SlotDefinition, component: unknown): () => void
}

interface SidebarRightTabsService {
  register(definition: {
    id: string
    kind: string
    title: (address: string) => string
    keepMounted?: boolean
    guide?: ReadonlyArray<{
      id: string
      order: number
      title: () => string
      description?: () => string
    }>
  }): () => void
}

interface SidebarRightService {
  openTab(kind: string): void
}

interface ClientContext {
  slots: SlotsService
  effect(callback: () => (() => void) | void): void
  inject(dependencies: string[], callback: (scoped: ClientContext) => void): void
  sidebarRight?: SidebarRightService
  sidebarRightTabs?: SidebarRightTabsService
}

/**
 * Register the plugin's browser contributions.
 * @param ctx - Cordis client context with the slot service.
 */
export function apply(ctx: ClientContext): void {
  injectStyles()

  ctx.slots.inject('conversation.input.left', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.left',
        id: TOGGLE_ID,
        order: 40,
      },
      PrototypeBar,
    ),
  )

  ctx.inject(['sidebarRight', 'sidebarRightTabs'], (scoped) => {
    const tabs = scoped.sidebarRightTabs
    const sidebar = scoped.sidebarRight
    if (tabs === undefined || sidebar === undefined) return

    scoped.effect(() =>
      tabs.register({
        id: TAB_ID,
        kind: TAB_KIND,
        title: () => TAB_TITLE,
        keepMounted: true,
        guide: [
          {
            id: TAB_ID,
            order: 60,
            title: () => TAB_TITLE,
            description: () => '查看 AI 生成的原型页面',
          },
        ],
      }),
    )

    scoped.slots.inject('sidebar.right.pane.tab', () =>
      scoped.slots.register(
        {
          name: 'sidebar.right.pane.tab',
          key: TAB_ID,
        },
        PreviewPanel,
      ),
    )

    scoped.effect(() => {
      bindPreviewOpener(() => {
        try {
          sidebar.openTab(TAB_KIND)
        } catch (error) {
          console.warn('[dsh-prototype] unable to open the preview tab', error)
        }
      })
      return () => bindPreviewOpener(null)
    })
  })
}
