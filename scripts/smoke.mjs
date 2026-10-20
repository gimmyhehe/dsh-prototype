/**
 * Headless smoke test for the built client bundle.
 *
 * It evaluates `lib/client.js` under a minimal `window.__ModuleLoader__`
 * shim, registers the plugin against a fake Cordis context, and renders both
 * surfaces with react-dom/server. This catches loader-envelope mistakes,
 * registration-shape mistakes, and render-time crashes without a browser.
 *
 * Run `npm run build && npm run smoke`.
 */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import React from 'react'
import { renderToString } from 'react-dom/server'

const ROOT = dirname(fileURLToPath(import.meta.url))
const BUNDLE = resolve(ROOT, '../lib/client.js')
const requireFromHere = createRequire(import.meta.url)

/** Minimal DOM surface needed by the style injector. */
const fakeDocument = {
  head: { appendChild() {} },
  body: { appendChild() {} },
  getElementById() {
    return null
  },
  createElement() {
    return {
      dataset: {},
      style: {},
      textContent: '',
      id: '',
      appendChild() {},
      remove() {},
      select() {},
      click() {},
    }
  },
}

Object.defineProperty(globalThis, 'document', { value: fakeDocument, configurable: true })

let factory = null
globalThis.window = {
  __ModuleLoader__: {
    load(record) {
      assert.equal(record.id, 'dsh-prototype', 'bundle id must match the package name')
      factory = record.factory
    },
  },
}

const source = await readFile(BUNDLE, 'utf8')
vm.runInThisContext(source, { filename: BUNDLE })
assert.ok(factory !== null, 'bundle registered a module factory')

const exports = factory((specifier) => {
  if (specifier === 'react') return React
  if (specifier === 'react/jsx-runtime') return requireFromHere('react/jsx-runtime')
  if (specifier === 'react-dom') return requireFromHere('react-dom')
  throw new Error(`unexpected external: ${specifier}`)
})

assert.equal(exports.name, 'dsh-prototype')
assert.deepEqual(exports.inject, ['slots'])
assert.equal(typeof exports.apply, 'function')

const injections = []
const registrations = []
const tabDefinitions = []
const openedTabs = []
const effects = []

const slots = {
  inject(name, callback) {
    injections.push({ name, callback })
  },
  register(definition, component) {
    registrations.push({ definition, component })
    return () => {}
  },
}

const scoped = {
  slots,
  effect(callback) {
    effects.push(callback)
    const dispose = callback()
    if (typeof dispose === 'function') effects.push(dispose)
  },
  inject(_dependencies, callback) {
    callback(scoped)
  },
  sidebarRightTabs: {
    register(definition) {
      tabDefinitions.push(definition)
      return () => {}
    },
  },
  sidebarRight: {
    openTab(kind) {
      openedTabs.push(kind)
    },
  },
}

exports.apply({
  slots,
  effect(callback) {
    effects.push(callback)
    const dispose = callback()
    if (typeof dispose === 'function') effects.push(dispose)
  },
  inject(_dependencies, callback) {
    callback(scoped)
  },
})

for (const entry of injections) entry.callback()

const toggle = registrations.find((entry) => entry.definition.name === 'conversation.input.left')
const preview = registrations.find((entry) => entry.definition.name === 'sidebar.right.pane.tab')
assert.ok(toggle, 'registered the composer toggle')
assert.ok(preview, 'registered the preview tab body')
assert.equal(tabDefinitions.length, 1, 'registered exactly one tab type')
assert.equal(tabDefinitions[0].kind, 'prototype')
assert.equal(tabDefinitions[0].id, 'dsh-prototype:preview')

const emptyScreen = renderToString(
  React.createElement(toggle.component, {
    useSession: (selector) => selector({ pendingSubmissions: [] }),
  }),
)
assert.ok(emptyScreen.includes('原型创作'), 'toggle renders its label')

const emptyPreview = renderToString(React.createElement(preview.component, {}))
assert.ok(emptyPreview.includes('还没有生成原型'), 'preview renders its empty state')

exports.generatePrototype('为一款 AI 笔记应用生成官网首页', 0)
await new Promise((resolvePromise) => setTimeout(resolvePromise, 30))

const state = exports.getPrototypeState()
assert.equal(state.status, 'ready', 'generation completed')
assert.ok(state.html.length > 2000, 'generated a full document')
assert.ok(state.html.startsWith('<!doctype html>'), 'document starts with a doctype')
assert.ok(state.html.includes('为一款 AI 笔记应用生成官网首页'), 'prompt appears in the document')
assert.ok(state.html.includes('#2563eb'), 'accent color is applied')
assert.ok(state.html.includes('#ffffff'), 'theme background is applied')

const readyPreview = renderToString(React.createElement(preview.component, {}))
assert.ok(!readyPreview.includes('还没有生成原型'), 'preview leaves the empty state')
assert.ok(readyPreview.includes('原型预览'), 'preview renders its toolbar')

console.log('dsh-prototype smoke test passed')
console.log(`  toggle entries: ${registrations.length}`)
console.log(`  generated bytes: ${state.html.length}`)
