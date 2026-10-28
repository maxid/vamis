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
  openDialog: (schema: SchemaObject, data?: PlainObject) => void
  openDrawer: (schema: SchemaObject, data?: PlainObject) => void
  closeDialog: () => void
  closeDrawer: () => void
  close: () => void
}

export const OverlayKey: InjectionKey<OverlayApi> = Symbol('vamis-overlay')

interface OverlayFrame {
  schema: SchemaObject
  data: PlainObject
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
      dialogs.push({ schema, data: mergeFrame(dialogs.at(-1)?.data, data) })
      state.seq += 1
      sync()
    },
    openDrawer(schema, data = {}) {
      drawers.push({ schema, data: mergeFrame(drawers.at(-1)?.data, data) })
      state.seq += 1
      sync()
    },
    closeDialog() {
      dialogs.pop()
      sync()
    },
    closeDrawer() {
      drawers.pop()
      sync()
    },
    close() {
      dialogs.length = 0
      drawers.length = 0
      state.data = {}
      sync()
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
