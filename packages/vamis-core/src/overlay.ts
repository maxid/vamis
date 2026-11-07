import { inject, provide, reactive, type InjectionKey } from 'vue'
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
  openDrawer: (schema: SchemaObject, data?: PlainObject) => void
  closeDialog: (result?: PlainObject | false) => void
  closeDrawer: () => void
  close: () => void
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
      drawers.push({ schema, data: mergeFrame(drawers.at(-1)?.data, data) })
      state.seq += 1
      sync()
    },
    closeDialog(result) {
      const frame = dialogs.pop()
      frame?.resolve?.(result === undefined ? false : result)
      sync()
    },
    closeDrawer() {
      drawers.pop()
      sync()
    },
    close() {
      while (dialogs.length) dialogs.pop()?.resolve?.(false)
      drawers.length = 0
      state.data = {}
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
