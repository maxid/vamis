import { inject, provide, reactive, type InjectionKey } from 'vue'
import { getByPath, setByPathCopy } from './scope'
import type { PlainObject, SchemaObject } from './types'

export interface OverlayState {
  dialog: SchemaObject | null
  drawer: SchemaObject | null
  data: PlainObject
  seq: number
}

export interface OverlayApi {
  state: OverlayState
  openDialog: (schema: SchemaObject, data?: PlainObject) => Promise<PlainObject | false>
  openDrawer: (schema: SchemaObject, data?: PlainObject) => Promise<PlainObject | false>
  closeDialog: (result?: PlainObject | false) => void
  closeDrawer: (result?: PlainObject | false) => void
  /** 对齐 Amis `scoped.closeById`：关掉指定 id 及其之上的嵌套层。 */
  closeById: (id: string) => void
  close: () => void
  /** 浮层里脱离表单的表单项写回当前层 data。对齐 Amis `Dialog.handleFormChange`。 */
  setValue: (name: string, value: unknown) => void
  registerDialogForm: (submit: () => Promise<void>) => void
  unregisterDialogForm: (submit: () => Promise<void>) => void
  submitDialogForm: () => Promise<boolean>
}

export const OverlayKey: InjectionKey<OverlayApi> = Symbol('vamis-overlay')

interface OverlayFrame {
  schema: SchemaObject
  data: PlainObject
  resolve?: (value: PlainObject | false) => void
  submitForm?: () => Promise<void>
}

function overlayPayload(data: PlainObject = {}): PlainObject {
  const out: PlainObject = {}
  for (const [key, value] of Object.entries(data)) {
    if (key === 'event' || key.startsWith('__')) continue
    out[key] = value
  }
  return out
}

function mergeFrame(parent: PlainObject | undefined, incoming: PlainObject = {}): PlainObject {
  return { ...(parent || {}), ...overlayPayload(incoming) }
}

export function createOverlay(): OverlayApi {
  const dialogs: OverlayFrame[] = []
  const drawers: OverlayFrame[] = []
  const state = reactive<OverlayState>({
    dialog: null,
    drawer: null,
    data: {},
    seq: 0,
  })

  function sync() {
    const top = dialogs.at(-1) ?? drawers.at(-1)
    state.dialog = dialogs.at(-1)?.schema ?? null
    state.drawer = drawers.at(-1)?.schema ?? null
    state.data = top?.data ?? {}
  }

  return {
    state,
    openDialog(schema, data = {}) {
      let resolve!: (value: PlainObject | false) => void
      const done = new Promise<PlainObject | false>((r) => {
        resolve = r
      })
      dialogs.push({ schema, data: mergeFrame(dialogs.at(-1)?.data, data), resolve })
      state.seq += 1
      sync()
      return done
    },
    openDrawer(schema, data = {}) {
      let resolve!: (value: PlainObject | false) => void
      const done = new Promise<PlainObject | false>((r) => {
        resolve = r
      })
      drawers.push({ schema, data: mergeFrame(drawers.at(-1)?.data, data), resolve })
      state.seq += 1
      sync()
      return done
    },
    closeDialog(result) {
      const frame = dialogs.pop()
      frame?.resolve?.(result === undefined ? false : result)
      sync()
    },
    closeDrawer(result) {
      const frame = drawers.pop()
      frame?.resolve?.(result === undefined ? false : result)
      sync()
    },
    closeById(id) {
      if (!id) return
      const dialogIndex = dialogs.findIndex((frame) => String(frame.schema.id || '') === id)
      if (dialogIndex >= 0) {
        while (dialogs.length > dialogIndex) dialogs.pop()?.resolve?.(false)
        sync()
        return
      }
      const drawerIndex = drawers.findIndex((frame) => String(frame.schema.id || '') === id)
      if (drawerIndex < 0) return
      while (drawers.length > drawerIndex) drawers.pop()?.resolve?.(false)
      sync()
    },
    close() {
      while (dialogs.length) dialogs.pop()?.resolve?.(false)
      while (drawers.length) drawers.pop()?.resolve?.(false)
      state.data = {}
      sync()
    },
    setValue(name, value) {
      const top = dialogs.at(-1) ?? drawers.at(-1)
      if (!top || !name) return
      if (getByPath(top.data, name) === value) return
      top.data = setByPathCopy(top.data, name, value)
      sync()
    },
    registerDialogForm(submit) {
      const top = dialogs.at(-1)
      if (top) top.submitForm = submit
    },
    unregisterDialogForm(submit) {
      const top = dialogs.at(-1)
      if (top && top.submitForm === submit) top.submitForm = undefined
    },
    async submitDialogForm() {
      const top = dialogs.at(-1)
      if (!top?.submitForm) return false
      await top.submitForm()
      return true
    },
  }
}

export function provideOverlay(): OverlayApi {
  const api = createOverlay()
  provide(OverlayKey, api)
  return api
}

export function useOverlay(): OverlayApi | undefined {
  return inject(OverlayKey, undefined)
}
