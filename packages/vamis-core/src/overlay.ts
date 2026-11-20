import { inject, provide, reactive, type InjectionKey } from 'vue'
import { getByPath, setByPathCopy } from './scope'
import type { PlainObject, SchemaObject } from './types'
import { dataMapping } from './utils/data-mapping'

export interface OverlayLayerState {
  key: number
  schema: SchemaObject
  data: PlainObject
  loading: boolean
  error: string
}

export interface OverlayState {
  dialog: SchemaObject | null
  drawer: SchemaObject | null
  dialogs?: OverlayLayerState[]
  drawers?: OverlayLayerState[]
  data: PlainObject
  seq: number
}

export interface OverlaySubmitResult {
  found: boolean
  ok: boolean
}

export interface OverlayApi {
  state: OverlayState
  openDialog: (schema: SchemaObject, data?: PlainObject) => Promise<PlainObject | false>
  openDrawer: (schema: SchemaObject, data?: PlainObject) => Promise<PlainObject | false>
  closeDialog: (result?: PlainObject | false) => void
  closeDrawer: (result?: PlainObject | false) => void
  closeDialogByKey?: (key: number, result?: PlainObject | false) => void
  closeDrawerByKey?: (key: number, result?: PlainObject | false) => void
  /** 对齐 Amis `scoped.closeById`：关掉指定 id 及其之上的嵌套层。 */
  closeById: (id: string) => void
  close: () => void
  /** 浮层里脱离表单的表单项写回当前层 data。对齐 Amis `Dialog.handleFormChange`。 */
  setValue: (name: string, value: unknown) => void
  setValueAt?: (key: number, name: string, value: unknown) => void
  setData?: (values: PlainObject, replace?: boolean) => void
  setDataAt?: (key: number, values: PlainObject, replace?: boolean) => void
  setDialogStatus?: (key: number, status: { loading?: boolean; error?: string }) => void
  beginDialogFormLoading?: (key: number) => () => void
  hasDialogForm?: (key: number) => boolean
  getActiveDialogKey?: () => number | undefined
  registerDialogForm: (
    submit: (close?: boolean) => Promise<boolean | void> | boolean | void,
    beginLoading?: () => () => void,
  ) => number | void
  unregisterDialogForm: (submit: (close?: boolean) => Promise<boolean | void> | boolean | void) => void
  submitDialogForm: () => Promise<boolean>
  submitDialogFormResult?: (close?: boolean) => Promise<OverlaySubmitResult>
}

export const OverlayKey: InjectionKey<OverlayApi> = Symbol('vamis-overlay')

interface OverlayFrame {
  key: number
  schema: SchemaObject
  data: PlainObject
  loading: boolean
  error: string
  resolve?: (value: PlainObject | false) => void
  submitForm?: (close?: boolean) => Promise<boolean | void> | boolean | void
  beginFormLoading?: () => () => void
}

function overlayPayload(data: PlainObject = {}): PlainObject {
  const out: PlainObject = {}
  for (const [key, value] of Object.entries(data)) {
    if (key === 'event' || key.startsWith('__')) continue
    out[key] = value
  }
  return out
}

function frameData(schema: SchemaObject, parent: PlainObject | undefined, incoming: PlainObject = {}): PlainObject {
  const base = { ...(parent || {}), ...overlayPayload(incoming) }
  const mapped =
    schema.data && typeof schema.data === 'object' && !Array.isArray(schema.data)
      ? dataMapping(schema.data, base)
      : null
  return mapped && typeof mapped === 'object' && !Array.isArray(mapped)
    ? { ...base, ...(mapped as PlainObject) }
    : base
}

function layerState(frame: OverlayFrame): OverlayLayerState {
  return {
    key: frame.key,
    schema: frame.schema,
    data: frame.data,
    loading: frame.loading,
    error: frame.error,
  }
}

export function createOverlay(): OverlayApi {
  const dialogs: OverlayFrame[] = []
  const drawers: OverlayFrame[] = []
  const state = reactive<OverlayState>({
    dialog: null,
    drawer: null,
    dialogs: [],
    drawers: [],
    data: {},
    seq: 0,
  })

  function sync() {
    state.dialog = dialogs.at(-1)?.schema ?? null
    state.drawer = drawers.at(-1)?.schema ?? null
    state.dialogs = dialogs.map(layerState)
    state.drawers = drawers.map(layerState)
    const top = [...dialogs, ...drawers].sort((a, b) => b.key - a.key)[0]
    state.data = top?.data ?? {}
  }

  function closeAt(
    frames: OverlayFrame[],
    key: number,
    result?: PlainObject | false,
  ) {
    const index = frames.findIndex((frame) => frame.key === key)
    if (index < 0) return
    while (frames.length > index) {
      const frame = frames.pop()
      frame?.resolve?.(frame.key === key ? (result === undefined ? false : result) : false)
    }
    sync()
  }

  function findFrame(key: number): OverlayFrame | undefined {
    return dialogs.find((frame) => frame.key === key) ?? drawers.find((frame) => frame.key === key)
  }

  async function submitTopDialog(close = true): Promise<OverlaySubmitResult> {
    const top = dialogs.at(-1)
    if (!top?.submitForm) return { found: false, ok: false }
    const result = await top.submitForm(close)
    return { found: true, ok: result !== false }
  }

  return {
    state,
    openDialog(schema, data = {}) {
      let resolve!: (value: PlainObject | false) => void
      const done = new Promise<PlainObject | false>((r) => {
        resolve = r
      })
      state.seq += 1
      dialogs.push({
        key: state.seq,
        schema,
        data: frameData(schema, dialogs.at(-1)?.data, data),
        loading: false,
        error: '',
        resolve,
      })
      sync()
      return done
    },
    openDrawer(schema, data = {}) {
      let resolve!: (value: PlainObject | false) => void
      const done = new Promise<PlainObject | false>((r) => {
        resolve = r
      })
      state.seq += 1
      drawers.push({
        key: state.seq,
        schema,
        data: frameData(schema, drawers.at(-1)?.data, data),
        loading: false,
        error: '',
        resolve,
      })
      sync()
      return done
    },
    closeDialog(result) {
      const frame = dialogs.pop()
      frame?.resolve?.(result === undefined ? false : result)
      sync()
    },
    closeDialogByKey(key, result) {
      closeAt(dialogs, key, result)
    },
    closeDrawerByKey(key, result) {
      closeAt(drawers, key, result)
    },
    closeDrawer(result) {
      const frame = drawers.pop()
      frame?.resolve?.(result === undefined ? false : result)
      sync()
    },
    closeById(id) {
      if (!id) return
      const matches = (frame: OverlayFrame) =>
        String(frame.schema.id || '') === id || String(frame.schema.name || '') === id
      const dialogIndex = dialogs.findIndex(matches)
      if (dialogIndex >= 0) {
        while (dialogs.length > dialogIndex) dialogs.pop()?.resolve?.(false)
        sync()
        return
      }
      const drawerIndex = drawers.findIndex(matches)
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
    setValueAt(key, name, value) {
      const frame = findFrame(key)
      if (!frame || !name) return
      if (getByPath(frame.data, name) === value) return
      frame.data = setByPathCopy(frame.data, name, value)
      sync()
    },
    setData(values, replace = false) {
      const top = dialogs.at(-1) ?? drawers.at(-1)
      if (!top) return
      top.data = replace ? overlayPayload(values) : { ...top.data, ...overlayPayload(values) }
      sync()
    },
    setDataAt(key, values, replace = false) {
      const frame = findFrame(key)
      if (!frame) return
      frame.data = replace ? overlayPayload(values) : { ...frame.data, ...overlayPayload(values) }
      sync()
    },
    setDialogStatus(key, status) {
      const frame = dialogs.find((item) => item.key === key)
      if (!frame) return
      if (typeof status.loading === 'boolean') frame.loading = status.loading
      if (typeof status.error === 'string') frame.error = status.error
      sync()
    },
    beginDialogFormLoading(key) {
      return findFrame(key)?.beginFormLoading?.() ?? (() => {})
    },
    hasDialogForm(key) {
      return !!findFrame(key)?.beginFormLoading
    },
    getActiveDialogKey() {
      return dialogs.at(-1)?.key
    },
    registerDialogForm(submit, beginLoading) {
      const top = dialogs.at(-1)
      if (!top) return
      top.submitForm = submit
      top.beginFormLoading = beginLoading
      return top.key
    },
    unregisterDialogForm(submit) {
      const bound = [...dialogs].reverse().find((frame) => frame.submitForm === submit)
      if (bound) {
        bound.submitForm = undefined
        bound.beginFormLoading = undefined
      }
    },
    async submitDialogForm() {
      return (await submitTopDialog()).found
    },
    async submitDialogFormResult(close = true) {
      return submitTopDialog(close)
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
