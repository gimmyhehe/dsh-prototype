/**
 * Host half of dsh-prototype.
 *
 * The scaffold is deliberately browser-only: the composer toggle, theme picker
 * and preview panel all live in `lib/client.js`. A host half is still required
 * because the web profile loads every enabled plugin through its Node entry.
 *
 * Where the real feature will go:
 *   - `ctx.systemPrompt.section()`: teach the model when to emit a complete
 *     HTML document instead of prose.
 *   - a tool such as `prototype_write`: persist the document and return a
 *     resource address the client can open.
 *   - a remote service: expose the generated artifact to the preview panel.
 *
 * @see ./README.md
 */

export const name = 'dsh-prototype'

/**
 * No host-side behavior yet; the client half owns the prototype UI.
 * @param ctx - Cordis host context (unused by the scaffold).
 */
export function apply(ctx) {
  void ctx
}
