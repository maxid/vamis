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
    expect(api.state.dialogs?.map((layer) => layer.schema.title)).toEqual(['外', '内'])
    expect(api.state.data).toEqual({ a: 1, b: 2 })
    api.closeDialog()
    expect(api.state.dialog?.title).toBe('外')
    expect(api.state.dialogs).toHaveLength(1)
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

  it('resolves openDrawer when waitForAction callers close with values', async () => {
    const api = createOverlay()
    const pending = api.openDrawer({ title: '右' }, { name: 'Ada' })
    api.closeDrawer({ name: 'Bob' })
    await expect(pending).resolves.toEqual({ name: 'Bob' })
    expect(api.state.drawer).toBeNull()
  })

  it('resolves openDialog when closeDialog passes form values', async () => {
    const api = createOverlay()
    const pending = api.openDialog({ title: '编辑选项' }, { label: 'A' })
    let submitted = false
    api.registerDialogForm(async (close = true) => {
      submitted = close
      api.closeDialog({ label: 'AA', value: 'a' })
      return true
    })
    expect(await api.submitDialogForm()).toBe(true)
    expect(submitted).toBe(true)
    await expect(pending).resolves.toEqual({ label: 'AA', value: 'a' })
    expect(api.state.dialog).toBeNull()
  })

  it('closeById pops the target dialog and nested children', () => {
    const api = createOverlay()
    api.openDialog({ id: 'dialog_002', title: '父' })
    api.openDialog({ title: '子弹窗' })
    api.closeById('dialog_002')
    expect(api.state.dialog).toBeNull()
    expect(api.state.drawer).toBeNull()
  })

  it('closeByName also closes nested dialogs', () => {
    const api = createOverlay()
    api.openDialog({ name: 'dialog_1', title: '父' })
    api.openDialog({ title: '子' })
    api.closeById('dialog_1')
    expect(api.state.dialog).toBeNull()
  })

  it('resolves false when the dialog is cancelled', async () => {
    const api = createOverlay()
    const pending = api.openDialog({ title: '编辑选项' })
    expect(await api.submitDialogForm()).toBe(false)
    api.closeDialog()
    await expect(pending).resolves.toBe(false)
  })

  it('remounts overlay body when seq changes', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const host = readFileSync(resolve(here, '../../vamis/src/OverlayHost.vue'), 'utf8')
    expect(host).toContain('overlay?.state.seq')
    expect(host).toContain('RowValueHost')
    expect(host).toContain('setValue')
  })

  it('writes loose form items into the current overlay frame', () => {
    const api = createOverlay()
    api.openDialog({ title: '编辑' }, { version: '4' })
    api.setValue('version', '5')
    expect(api.state.data).toEqual({ version: '5' })
    api.openDialog({ title: '内层' }, { label: 'A' })
    api.setValue('label', 'B')
    expect(api.state.data).toEqual({ version: '5', label: 'B' })
    api.closeDialog()
    expect(api.state.data).toEqual({ version: '5' })
  })

  it('maps dialog data and keeps frame-local values for stacked dialogs', () => {
    const api = createOverlay()
    api.openDialog(
      { title: '外', data: { mapped: '${name}' } },
      { name: 'Vamis', nested: { value: 1 } },
    )
    const outerKey = api.state.dialogs?.[0]?.key
    expect(api.state.data).toEqual({ name: 'Vamis', nested: { value: 1 }, mapped: 'Vamis' })
    api.openDialog({ title: '内' }, { child: true })
    const innerKey = api.state.dialogs?.[1]?.key
    expect(outerKey).toBeTypeOf('number')
    expect(innerKey).toBeTypeOf('number')
    api.setValueAt?.(outerKey!, 'name', 'Changed')
    expect(api.state.dialogs?.[0]?.data.name).toBe('Changed')
    expect(api.state.data.child).toBe(true)
    api.setDataAt?.(innerKey!, { child: false, extra: 1 })
    expect(api.state.data).toMatchObject({ child: false, extra: 1, name: 'Vamis' })
    api.closeDialogByKey?.(innerKey!)
    expect(api.state.dialogs).toHaveLength(1)
    expect(api.state.data.name).toBe('Changed')
  })

  it('reports dialog form submit success separately from form existence', async () => {
    const api = createOverlay()
    api.openDialog({ title: '编辑' })
    expect(await api.submitDialogFormResult?.(false)).toEqual({ found: false, ok: false })
    api.registerDialogForm(async () => false)
    expect(await api.submitDialogFormResult?.(false)).toEqual({ found: true, ok: false })
    api.registerDialogForm(async () => true)
    expect(await api.submitDialogFormResult?.(true)).toEqual({ found: true, ok: true })
  })
})
