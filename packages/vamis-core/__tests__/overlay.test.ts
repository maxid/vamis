import { describe, expect, it } from 'vitest'
import { createOverlay } from '../src/overlay'

describe('overlay stack', () => {
  it('pushes nested dialogs and pops on closeDialog', () => {
    const api = createOverlay()
    api.openDialog({ title: '外' }, { a: 1 })
    expect(api.state.dialog?.title).toBe('外')
    expect(api.state.data).toEqual({ a: 1 })
    api.openDialog({ title: '内' }, { b: 2 })
    expect(api.state.dialog?.title).toBe('内')
    expect(api.state.data).toEqual({ a: 1, b: 2 })
    api.closeDialog()
    expect(api.state.dialog?.title).toBe('外')
    api.closeDialog()
    expect(api.state.dialog).toBeNull()
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
})
