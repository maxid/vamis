import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createOverlay } from '../src/overlay'

describe('overlay stack', () => {
  it('pushes nested dialogs and pops on closeDialog', () => {
    const api = createOverlay()
    api.openDialog({ title: '外' }, { a: 1 })
    expect(api.state.dialog?.title).toBe('外')
    expect(api.state.data).toEqual({ a: 1 })
    expect(api.state.seq).toBe(1)
    api.openDialog({ title: '内' }, { b: 2 })
    expect(api.state.dialog?.title).toBe('内')
    expect(api.state.data).toEqual({ a: 1, b: 2 })
    api.closeDialog()
    expect(api.state.dialog?.title).toBe('外')
    expect(api.state.data).toEqual({ a: 1 })
    api.closeDialog()
    expect(api.state.dialog).toBeNull()
    expect(api.state.data).toEqual({})
  })

  it('does not keep previous dialog fields after close', () => {
    const api = createOverlay()
    api.openDialog({ title: 'A' }, { browser: 'Internet Explorer 4.0', version: '4', event: { type: 'click' }, __rendererData: { x: 1 } })
    expect(api.state.data).toEqual({ browser: 'Internet Explorer 4.0', version: '4' })
    api.closeDialog()
    api.openDialog({ title: 'B' }, { browser: 'Internet Explorer 7', version: '7' })
    expect(api.state.data).toEqual({ browser: 'Internet Explorer 7', version: '7' })
    expect(api.state.data).not.toHaveProperty('event')
    expect(api.state.data).not.toHaveProperty('__rendererData')
  })

  it('pushes nested drawers independently of dialogs', () => {
    const api = createOverlay()
    api.openDrawer({ title: '右' })
    api.openDrawer({ title: '再一层' })
    expect(api.state.drawer?.title).toBe('再一层')
    api.closeDrawer()
    expect(api.state.drawer?.title).toBe('右')
    api.close()
    expect(api.state.drawer).toBeNull()
    expect(api.state.dialog).toBeNull()
    expect(api.state.data).toEqual({})
  })

  it('remounts overlay body when seq changes', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const host = readFileSync(resolve(here, '../../vamis/src/OverlayHost.vue'), 'utf8')
    expect(host).toContain('overlay?.state.seq')
  })
})
