import { reactive } from 'vue'
import {
  canInsertChild,
  childCollections,
  cloneSchema,
  ensureArray,
  getNodeAt,
  getParentInfo,
  getRenderers,
  insertKeyFor,
  isAncestorPath,
  joinPath,
  moveAt,
  removeAt,
  resolveRenderer,
  setByPathCopy,
  type RendererConfig,
  type SchemaObject,
} from '@vamis/core'
import {
  BasePlugin,
  createEvent,
  type ActiveEventContext,
  type BaseEventContext,
  type BuildPanelEventContext,
  type ChangeEventContext,
  type ContextMenuEntry,
  type ContextMenuEventContext,
  type DeleteEventContext,
  type DragEventContext,
  type InsertEventContext,
  type MoveEventContext,
  type PanelItem,
  type PluginClass,
  type PluginEvent,
  type PluginEventListener,
  type PluginInterface,
  type RegionConfig,
  type RendererInfo,
  type RendererInfoResolveEventContext,
  type ReplaceEventContext,
  type ScaffoldForm,
  type SelectionEventContext,
  type SubRendererInfo,
  type ToolbarItem,
} from './plugin'
import { JSONPipeIn, JSONPipeOut, camelize, guid, reGenerateID, schemaLabel } from './util'

export type PluginRegistration =
  | PluginClass
  | [PluginClass, Record<string, unknown> | (() => Record<string, unknown>)]

const builtInPlugins: PluginRegistration[] = []

export function registerEditorPlugin(klass: PluginClass) {
  klass.scene = Array.from(new Set(['global', ...(klass.scene || ['global'])]))
  klass.id = klass.id || klass.name || guid()
  const index = builtInPlugins.findIndex((entry) => {
    const current = Array.isArray(entry) ? entry[0] : entry
    return current === klass || current.id === klass.id
  })
  if (index < 0) {
    builtInPlugins.push(klass)
    return
  }
  const current = Array.isArray(builtInPlugins[index]) ? builtInPlugins[index][0] : builtInPlugins[index]
  if ((klass.priority || 0) > (current.priority || 0)) builtInPlugins.splice(index, 1, klass)
}

export function unRegisterEditorPlugin(id: string) {
  const index = builtInPlugins.findIndex((entry) => (Array.isArray(entry) ? entry[0] : entry).id === id)
  if (index >= 0) builtInPlugins.splice(index, 1)
}

export function getEditorPlugins(options: { scene?: string } = {}): PluginRegistration[] {
  const scene = options.scene || 'global'
  return builtInPlugins.filter((entry) => (Array.isArray(entry) ? entry[0] : entry).scene?.includes(scene))
}

export interface EditorManagerConfig extends PluginEventListener {
  onChange?: (value: SchemaObject) => void
  preview?: boolean
  autoFocus?: boolean
  isMobile?: boolean
  theme?: string
  scene?: string
  disableBultinPlugin?: boolean
  disableBuiltinPlugin?: boolean
  disablePluginList?: string[] | ((id: string, plugin: PluginClass) => boolean)
  plugins?: PluginRegistration[]
  isHiddenProps?: (key: string) => boolean
}

export interface EditorNode {
  id: string
  path: string
  schemaPath: string
  schema: SchemaObject
  label: string
  type: string
  info?: RendererInfo
  parent?: EditorNode
  region?: string
  index: number
  children: EditorNode[]
  removable: boolean
  draggable: boolean
  moveable: boolean
  duplicatable: boolean
  replaceable: boolean
}

export interface ScaffoldRequest {
  form: ScaffoldForm
  value: SchemaObject
  subRenderer?: SubRendererInfo | RendererInfo
  targetId: string
  region: string
  beforeId?: string
  mode: 'insert' | 'replace'
}

interface ManagerState {
  schema: SchemaObject
  activeId: string
  selections: string[]
  availableRenderers: SubRendererInfo[]
  panels: PanelItem[]
  toolbars: ToolbarItem[]
  contextMenu: { id: string; region: string; x: number; y: number; menus: ContextMenuEntry[] } | null
  scaffoldRequest: ScaffoldRequest | null
  quickEditId: string
  version: number
}

function registrationParts(registration: PluginRegistration): [PluginClass, Record<string, unknown>] {
  if (!Array.isArray(registration)) return [registration, {}]
  const options = typeof registration[1] === 'function' ? registration[1]() : registration[1]
  return [registration[0], options || {}]
}

function defaultRegion(schema: SchemaObject): RegionConfig {
  return { key: insertKeyFor(schema), label: '内容区' }
}

export class EditorManager {
  readonly id = guid()
  readonly plugins: PluginInterface[] = []
  readonly state: ManagerState
  readonly config: EditorManagerConfig
  private nodes = new Map<string, EditorNode>()
  private undoStack: SchemaObject[] = []
  private redoStack: SchemaObject[] = []
  private clipboardData: SchemaObject | null = null
  private listeners: Array<{ type: string; fn: (event: PluginEvent<any>) => unknown }> = []

  constructor(config: EditorManagerConfig = {}, schema: SchemaObject = { type: 'page', body: [] }) {
    this.config = config
    const registrations = [
      ...(config.disableBultinPlugin || config.disableBuiltinPlugin ? [] : getEditorPlugins({ scene: config.scene })),
      ...(config.plugins || []),
    ]
    for (const registration of registrations) {
      const [Plugin, options] = registrationParts(registration)
      const id = Plugin.id || Plugin.name
      if (
        Array.isArray(config.disablePluginList)
          ? config.disablePluginList.includes(id)
          : config.disablePluginList?.(id, Plugin)
      ) {
        continue
      }
      const plugin = new Plugin(this, options)
      Object.assign(plugin, options)
      this.plugins.push(plugin)
    }
    this.plugins.sort((a, b) => (a.order || 0) - (b.order || 0))
    this.state = reactive({
      schema: JSONPipeIn(cloneSchema(schema)),
      activeId: '',
      selections: [],
      availableRenderers: [],
      panels: [],
      toolbars: [],
      contextMenu: null,
      scaffoldRequest: null,
      quickEditId: '',
      version: 0,
    }) as ManagerState
    this.refreshNodes()
    this.buildRenderers()
    if (config.autoFocus !== false && this.state.schema.$$id) this.setActiveId(this.state.schema.$$id)
  }

  get schema(): SchemaObject {
    return this.state.schema
  }

  get activeId(): string {
    return this.state.activeId
  }

  get activeNode(): EditorNode | undefined {
    return this.getNodeById(this.state.activeId)
  }

  get canUndo(): boolean {
    void this.state.version
    return this.undoStack.length > 0
  }

  get canRedo(): boolean {
    void this.state.version
    return this.redoStack.length > 0
  }

  get value(): SchemaObject {
    return JSONPipeOut(this.state.schema, this.config.isHiddenProps)
  }

  on(type: string, fn: (event: PluginEvent<any>) => unknown): () => void {
    this.listeners.push({ type, fn })
    return () => this.off(type, fn)
  }

  off(type: string, fn: (event: PluginEvent<any>) => unknown) {
    this.listeners = this.listeners.filter((listener) => listener.type !== type || listener.fn !== fn)
  }

  trigger<T extends { data?: any; [key: string]: any }>(type: string, context: T): PluginEvent<T> {
    const event = createEvent(type, context)
    const method = camelize(/^(?:before|after)/.test(type) ? type : `on-${type}`)
    const listeners = this.listeners.filter((listener) => listener.type === type).map((listener) => listener.fn)
    for (const plugin of this.plugins) {
      const handler = (plugin as unknown as Record<string, unknown>)[method]
      if (typeof handler === 'function') listeners.push(handler.bind(plugin))
    }
    const configured = (this.config as unknown as Record<string, unknown>)[method]
    if (typeof configured === 'function') listeners.push(configured as (event: PluginEvent<T>) => unknown)

    const promises: Promise<unknown>[] = []
    for (const listener of listeners) {
      const result = listener(event)
      if (result === false) {
        event.preventDefault()
        event.stopPropagation()
      } else if (result && typeof (result as Promise<unknown>).then === 'function') {
        promises.push(result as Promise<unknown>)
      } else if (result !== undefined) {
        event.setData(result)
      }
      if (event.stoped) break
    }
    if (promises.length) event.pending = Promise.all(promises)
    return event
  }

  init() {
    this.trigger('init', { data: this })
  }

  setSchema(schema: SchemaObject, record = false) {
    if (record) this.pushHistory()
    this.state.schema = JSONPipeIn(cloneSchema(schema))
    this.refreshNodes()
    if (this.state.activeId && !this.nodes.has(this.state.activeId)) {
      this.state.activeId = this.state.schema.$$id || ''
    }
    this.rebuild()
    this.state.version += 1
  }

  private pushHistory() {
    this.undoStack.push(cloneSchema(this.state.schema))
    if (this.undoStack.length > 100) this.undoStack.shift()
    this.redoStack = []
    this.state.version += 1
  }

  private commit(next: SchemaObject, activeId?: string) {
    this.pushHistory()
    this.state.schema = next
    this.refreshNodes()
    if (activeId !== undefined) this.state.activeId = activeId
    if (this.state.activeId && !this.nodes.has(this.state.activeId)) {
      this.state.activeId = this.state.schema.$$id || ''
    }
    this.rebuild()
    this.emitChange()
  }

  private emitChange() {
    this.state.version += 1
    this.config.onChange?.(this.value)
  }

  undo() {
    if (this.config.onUndo) {
      this.config.onUndo()
      return
    }
    const previous = this.undoStack.pop()
    if (!previous) return
    this.redoStack.push(cloneSchema(this.state.schema))
    this.state.schema = previous
    this.refreshNodes()
    if (!this.nodes.has(this.state.activeId)) this.state.activeId = this.state.schema.$$id || ''
    this.rebuild()
    this.emitChange()
  }

  redo() {
    if (this.config.onRedo) {
      this.config.onRedo()
      return
    }
    const next = this.redoStack.pop()
    if (!next) return
    this.undoStack.push(cloneSchema(this.state.schema))
    this.state.schema = next
    this.refreshNodes()
    if (!this.nodes.has(this.state.activeId)) this.state.activeId = this.state.schema.$$id || ''
    this.rebuild()
    this.emitChange()
  }

  getNodeById(id: string): EditorNode | undefined {
    return this.nodes.get(id)
  }

  getNodeByPath(path: string): EditorNode | undefined {
    const schema = getNodeAt(this.state.schema, path)
    return schema.$$id ? this.nodes.get(schema.$$id) : undefined
  }

  getSchema(id: string): SchemaObject {
    const node = this.getNodeById(id)
    if (!node) throw new Error(`Unknown editor node: ${id}`)
    return node.schema
  }

  private refreshNodes() {
    this.nodes.clear()
    const visit = (schema: SchemaObject, path: string, parent?: EditorNode, region = '', index = 0) => {
      const id = String(schema.$$id || '')
      if (!id) return
      const renderer = resolveRenderer(schema.type, schema)
      const node: EditorNode = {
        id,
        path,
        schemaPath: path,
        schema,
        label: schemaLabel(schema),
        type: schema.type || 'object',
        parent,
        region,
        index,
        children: [],
        removable: path !== '',
        draggable: path !== '',
        moveable: path !== '',
        duplicatable: path !== '',
        replaceable: true,
      }
      if (renderer) node.info = this.getEditorInfo(renderer, path, schema) || undefined
      if (node.info) {
        node.removable = node.info.removable ?? node.removable
        node.draggable = node.info.draggable ?? node.draggable
        node.moveable = node.info.movable ?? node.moveable
        node.duplicatable = node.info.duplicatable ?? node.duplicatable
        node.replaceable = node.info.replaceable ?? node.replaceable
      }
      this.nodes.set(id, node)
      parent?.children.push(node)
      for (const collection of childCollections(schema)) {
        collection.nodes.forEach((child, childIndex) => {
          if (child && typeof child === 'object') {
            visit(child as SchemaObject, joinPath(path, collection.key, childIndex), node, collection.key, childIndex)
          }
        })
      }
    }
    visit(this.state.schema, '')
  }

  getEditorInfo(
    renderer: RendererConfig,
    path: string,
    schema: SchemaObject,
  ): RendererInfo | null | undefined {
    const context: RendererInfoResolveEventContext = {
      renderer,
      path,
      schemaPath: path,
      schema,
      data: null,
    }
    const before = this.trigger('before-resolve-editor-info', context)
    if (before.prevented) return before.context.data
    let info: RendererInfo | null = null
    for (const plugin of this.plugins) {
      const result = plugin.getRendererInfo?.(context)
      if (!result || !result.name) continue
      info = {
        ...result,
        name: result.name,
        id: String(schema.$$id),
        type: schema.type || renderer.type,
        plugin,
        renderer,
        schemaPath: path,
      }
      break
    }
    const after = this.trigger('after-resolve-editor-info', { ...context, data: info })
    return after.context.data
  }

  buildEventContext(idOrNode: string | EditorNode): BaseEventContext {
    const node = typeof idOrNode === 'string' ? this.getNodeById(idOrNode) : idOrNode
    if (!node) throw new Error(`Unknown editor node: ${String(idOrNode)}`)
    return {
      node,
      id: node.id,
      info: node.info as RendererInfo,
      path: node.path,
      schemaPath: node.schemaPath,
      schema: node.schema,
      data: '',
    }
  }

  setActiveId(id: string) {
    if (this.state.activeId === id) return
    this.state.activeId = id
    this.state.selections = []
    this.rebuild()
    const node = this.getNodeById(id)
    if (node) {
      const context: ActiveEventContext = { ...this.buildEventContext(node), active: true }
      this.trigger('active', context)
    }
  }

  setActivePath(path: string) {
    const node = this.getNodeByPath(path)
    if (node) this.setActiveId(node.id)
  }

  toggleSelection(id: string) {
    const selections = this.state.selections.length
      ? [...this.state.selections]
      : this.state.activeId
        ? [this.state.activeId]
        : []
    const index = selections.indexOf(id)
    if (index >= 0) selections.splice(index, 1)
    else selections.push(id)
    this.setSelection(selections, id)
  }

  setSelection(selections: string[], id = selections[0]) {
    if (!id || !this.getNodeById(id)) return
    const context: SelectionEventContext = {
      ...this.buildEventContext(id),
      selections: selections.filter((item) => this.getNodeById(item)).map((item) => this.buildEventContext(item)),
      data: [...selections],
    }
    const event = this.trigger('selection-change', context)
    if (event.prevented) return
    if (event.context.data.length <= 1) this.setActiveId(event.context.data[0] || id)
    else {
      this.state.selections = event.context.data
      this.rebuild()
    }
  }

  buildToolbars(): ToolbarItem[] {
    const toolbars: ToolbarItem[] = []
    const node = this.activeNode
    if (node) {
      const context = this.buildEventContext(node)
      for (const plugin of this.plugins) plugin.buildEditorToolbar?.(context, toolbars)
      this.trigger('build-toolbars', { ...context, data: toolbars })
    }
    this.state.toolbars = toolbars.sort((a, b) => (a.order || 0) - (b.order || 0))
    return this.state.toolbars
  }

  buildPanels(id = this.state.activeId): PanelItem[] {
    let panels: PanelItem[] = []
    const node = this.getNodeById(id)
    if (node) {
      const context: BuildPanelEventContext = {
        ...this.buildEventContext(node),
        data: panels,
        selections: this.state.selections.map((item) => this.buildEventContext(item)),
      }
      for (const plugin of this.plugins) plugin.buildEditorPanel?.(context, panels)
      this.trigger('build-panels', context)
      panels = context.data || panels
    }
    this.state.panels = panels.sort((a, b) => (a.order || 0) - (b.order || 0))
    return this.state.panels
  }

  buildRenderers(): SubRendererInfo[] {
    const renderers: SubRendererInfo[] = []
    const active = this.activeNode || this.getNodeById(String(this.state.schema.$$id))
    const context = active ? { ...this.buildEventContext(active), region: '' } : null
    for (const plugin of this.plugins) {
      const result = plugin.buildSubRenderers?.(
        context as BaseEventContext & { region?: string },
        renderers,
        getRenderers(),
      )
      if (!result) continue
      for (const item of Array.isArray(result) ? result : [result]) {
        if (!item.name || item.disabledRendererPlugin) continue
        renderers.push({
          ...item,
          name: item.name,
          id: guid(),
          plugin,
          parent: this.activeNode?.info,
          order: item.order || plugin.order || 0,
        } as SubRendererInfo)
      }
    }
    this.state.availableRenderers = renderers.sort((a, b) => a.order - b.order)
    return this.state.availableRenderers
  }

  rebuild() {
    this.buildRenderers()
    this.buildToolbars()
    this.buildPanels()
  }

  panelChangeValue(value: SchemaObject, _diff?: unknown[], id = this.state.activeId) {
    const node = this.getNodeById(id)
    if (!node) return false
    const context: ChangeEventContext = { ...this.buildEventContext(node), value, diff: _diff }
    const event = this.trigger('before-update', context)
    if (event.prevented) return false
    const next = cloneSchema(this.state.schema)
    const target = getNodeAt(next, node.path)
    for (const key of Object.keys(target)) delete target[key]
    Object.assign(target, cloneSchema(event.context.value))
    this.commit(next, id)
    this.trigger('after-update', { ...context, schema: this.getSchema(id) })
    return true
  }

  updateField(id: string, field: string, value: unknown) {
    const schema = cloneSchema(this.getSchema(id))
    if (field.includes('.') || field.includes('[')) {
      const next = setByPathCopy(schema, field, value)
      return this.panelChangeValue(next, undefined, id)
    }
    if (value === undefined) delete schema[field]
    else schema[field] = value
    return this.panelChangeValue(schema, undefined, id)
  }

  private accept(target: EditorNode, region: string, json: SchemaObject, sourceId = ''): boolean {
    const config = target.info?.regions?.find((item) => item.key === region)
    const source = sourceId ? this.getNodeById(sourceId) : undefined
    if (config?.accept && !config.accept(json, target, source)) return false
    const context: DragEventContext = {
      mode: sourceId ? 'move' : 'copy',
      sourceType: sourceId ? 'schema' : 'subrenderer',
      sourceId,
      data: json,
      targetId: target.id,
      targetRegion: region,
    }
    return !this.trigger('dnd-accept', context).prevented
  }

  addChild(
    id: string,
    region: string,
    json: SchemaObject,
    beforeId?: string,
    subRenderer?: SubRendererInfo | RendererInfo,
  ): EditorNode | null {
    const target = this.getNodeById(id)
    if (!target) return null
    const child = JSONPipeIn(cloneSchema(json), true)
    if (!this.accept(target, region, child)) return null
    const collection = ensureArray(target.schema, region)
    const beforeIndex = beforeId
      ? collection.findIndex((item) => item && typeof item === 'object' && item.$$id === beforeId)
      : -1
    const context: InsertEventContext = {
      ...this.buildEventContext(target),
      region,
      beforeId,
      index: beforeIndex,
      data: child,
      subRenderer,
    }
    const event = this.trigger('before-insert', context)
    if (event.prevented) return null
    const next = cloneSchema(this.state.schema)
    const nextTarget = getNodeAt(next, target.path)
    const nextCollection = ensureArray(nextTarget, region)
    const index = beforeIndex < 0 ? nextCollection.length : beforeIndex
    nextCollection.splice(index, 0, event.context.data)
    const childId = String(event.context.data.$$id || '')
    this.commit(next, childId)
    this.trigger('after-insert', context)
    return this.getNodeById(childId) || null
  }

  addElem(
    rendererOrSchema: string | SchemaObject | SubRendererInfo,
    options: { skipScaffold?: boolean; activeChild?: boolean } = {},
  ) {
    const subRenderer =
      typeof rendererOrSchema === 'string'
        ? this.state.availableRenderers.find((item) => item.id === rendererOrSchema || item.rendererName === rendererOrSchema)
        : 'plugin' in rendererOrSchema && 'id' in rendererOrSchema
          ? (rendererOrSchema as SubRendererInfo)
          : undefined
    const schema = cloneSchema(
      (subRenderer?.scaffold || (typeof rendererOrSchema === 'object' ? rendererOrSchema : { type: rendererOrSchema })) as SchemaObject,
    )
    if (subRenderer?.type && !schema.type) schema.type = subRenderer.type

    let target = this.activeNode
    if (!target) target = this.getNodeById(String(this.state.schema.$$id))
    if (!target) return null
    let beforeId: string | undefined
    if (!canInsertChild(target.schema) && !target.info?.regions?.length && target.parent) {
      const siblings = ensureArray(target.parent.schema, target.region || insertKeyFor(target.parent.schema))
      const next = siblings[target.index + 1]
      beforeId = next && typeof next === 'object' ? next.$$id : undefined
      target = target.parent
    }
    const region = target.info?.regions?.[0]?.key || defaultRegion(target.schema).key
    if (subRenderer?.scaffoldForm && !options.skipScaffold) {
      this.state.scaffoldRequest = {
        form: subRenderer.scaffoldForm,
        value: schema,
        subRenderer,
        targetId: target.id,
        region,
        beforeId,
        mode: 'insert',
      }
      return null
    }
    return this.addChild(target.id, region, schema, beforeId, subRenderer)
  }

  completeScaffold(values: Record<string, unknown>) {
    const request = this.state.scaffoldRequest
    if (!request) return
    const schema = request.form.pipeOut?.(values) || ({ ...request.value, ...values } as SchemaObject)
    this.state.scaffoldRequest = null
    if (request.mode === 'replace') this.replaceChild(request.targetId, schema, request.subRenderer)
    else this.addChild(request.targetId, request.region, schema, request.beforeId, request.subRenderer)
  }

  cancelScaffold() {
    this.state.scaffoldRequest = null
  }

  reScaffold(id = this.state.activeId) {
    const node = this.getNodeById(id)
    const form = node?.info?.scaffoldForm || node?.info?.plugin.scaffoldForm
    if (!node || !form) return
    this.state.scaffoldRequest = {
      form,
      value: cloneSchema(node.schema),
      subRenderer: node.info,
      targetId: id,
      region: node.region || '',
      mode: 'replace',
    }
  }

  openNodePopOverForm(id: string) {
    if (this.getNodeById(id)) this.state.quickEditId = id
  }

  closeNodePopOverForm() {
    this.state.quickEditId = ''
  }

  moveUp() {
    return this.moveBy(-1)
  }

  moveDown() {
    return this.moveBy(1)
  }

  private moveBy(direction: -1 | 1) {
    const node = this.activeNode
    if (!node?.parent || !node.moveable) return false
    const siblings = ensureArray(node.parent.schema, node.region || '')
    const target = siblings[node.index + direction]
    const context: MoveEventContext = {
      ...this.buildEventContext(node.parent),
      sourceId: node.id,
      direction: direction === -1 ? 'up' : 'down',
      beforeId: target && typeof target === 'object' ? target.$$id : undefined,
      region: node.region || '',
    }
    const event = this.trigger('before-move', context)
    if (event.prevented) return false
    const next = cloneSchema(this.state.schema)
    moveAt(next, node.path, direction)
    this.commit(next, node.id)
    this.trigger('after-move', context)
    this.trigger('after-update', context)
    return true
  }

  move(id: string, region: string, sourceId: string, beforeId?: string): boolean {
    const target = this.getNodeById(id)
    const source = this.getNodeById(sourceId)
    if (!target || !source || source.id === target.id || isAncestorPath(source.path, target.path)) return false
    if (!this.accept(target, region, source.schema, sourceId)) return false
    const context: MoveEventContext = {
      ...this.buildEventContext(target),
      region,
      sourceId,
      beforeId,
    }
    const event = this.trigger('before-move', context)
    if (event.prevented) return false

    const next = cloneSchema(this.state.schema)
    const nextSource = getNodeAt(next, source.path)
    const sourceInfo = getParentInfo(next, source.path)
    if (!sourceInfo) return false
    const sourceCollection = ensureArray(sourceInfo.parent, sourceInfo.key)
    sourceCollection.splice(sourceInfo.index, 1)
    const nextTarget = getNodeAt(next, target.path)
    const targetCollection = ensureArray(nextTarget, region)
    let index = beforeId
      ? targetCollection.findIndex((item) => item && typeof item === 'object' && item.$$id === beforeId)
      : -1
    if (sourceInfo.parent === nextTarget && sourceInfo.key === region && sourceInfo.index < index) index -= 1
    targetCollection.splice(index < 0 ? targetCollection.length : index, 0, nextSource)
    this.commit(next, sourceId)
    this.trigger('after-move', context)
    return true
  }

  moveTo(id: string, region: string, sourceId: string, beforeId?: string): boolean {
    return this.move(id, region, sourceId, beforeId)
  }

  del(ids: string | string[]) {
    const list = (Array.isArray(ids) ? ids : [ids]).filter((id) => this.getNodeById(id)?.path)
    if (!list.length) return false
    const first = this.getNodeById(list[0])!
    const context: DeleteEventContext = {
      ...this.buildEventContext(first),
      data: Array.isArray(ids) ? [...list] : [],
    }
    const event = this.trigger('before-delete', context)
    if (event.prevented) return false
    const targets = event.context.data?.length ? event.context.data : list
    const next = cloneSchema(this.state.schema)
    const paths = targets
      .map((id) => this.getNodeById(id)?.path)
      .filter((path): path is string => !!path)
      .sort((a, b) => b.localeCompare(a))
    let selected = first.parent?.id || ''
    for (const path of paths) selected = removeAt(next, path) ? selected : selected
    this.commit(next, selected)
    this.trigger('after-delete', context)
    return true
  }

  duplicate(ids: string | string[]) {
    const list = Array.isArray(ids) ? ids : [ids]
    let duplicated: EditorNode | null = null
    for (const id of list) {
      const node = this.getNodeById(id)
      if (!node?.parent || !node.duplicatable) continue
      const siblings = ensureArray(node.parent.schema, node.region || '')
      const next = siblings[node.index + 1]
      duplicated = this.addChild(
        node.parent.id,
        node.region || insertKeyFor(node.parent.schema),
        reGenerateID(node.schema),
        next && typeof next === 'object' ? next.$$id : undefined,
      )
    }
    return duplicated
  }

  copy(id = this.state.activeId) {
    const node = this.getNodeById(id)
    if (node) this.clipboardData = JSONPipeOut(cloneSchema(node.schema), false)
  }

  cut(id = this.state.activeId) {
    this.copy(id)
    this.del(id)
  }

  paste(id = this.state.activeId, region?: string) {
    if (!this.clipboardData) return null
    const node = this.getNodeById(id)
    if (!node) return null
    const schema = reGenerateID(this.clipboardData)
    if (region) return this.addChild(id, region, schema)
    this.replaceChild(id, schema)
    return null
  }

  replaceChild(id: string, json: SchemaObject, subRenderer?: SubRendererInfo | RendererInfo): boolean {
    const node = this.getNodeById(id)
    if (!node?.replaceable) return false
    const replacement = JSONPipeIn(cloneSchema(json), true)
    const context: ReplaceEventContext = {
      ...this.buildEventContext(node),
      data: replacement,
      subRenderer,
      region: node.region,
    }
    const event = this.trigger('before-replace', context)
    if (event.prevented || !event.context.data) return false
    const next = cloneSchema(this.state.schema)
    if (!node.path) {
      this.commit(event.context.data, String(event.context.data.$$id || ''))
    } else {
      const info = getParentInfo(next, node.path)
      if (!info) return false
      ensureArray(info.parent, info.key)[info.index] = event.context.data
      this.commit(next, String(event.context.data.$$id || ''))
    }
    this.trigger('after-replace', context)
    return true
  }

  emptyRegion(id: string, region: string) {
    const node = this.getNodeById(id)
    if (!node) return
    const next = cloneSchema(this.state.schema)
    getNodeAt(next, node.path)[region] = []
    this.commit(next, id)
  }

  openContextMenu(id: string, region: string, position: { x: number; y: number; clientX?: number; clientY?: number; target?: HTMLElement }) {
    const node = this.getNodeById(id)
    if (!node) return
    const context: ContextMenuEventContext = {
      ...this.buildEventContext(node),
      region,
      selections: this.state.selections.map((item) => this.buildEventContext(item)),
      data: [],
      clientX: position.clientX,
      clientY: position.clientY,
      target: position.target,
    }
    const menus = this.buildContextMenus(context)
    if (!menus.length) return
    this.state.contextMenu = { id, region, x: position.x, y: position.y, menus }
  }

  buildContextMenus(context: ContextMenuEventContext): ContextMenuEntry[] {
    for (const plugin of this.plugins) plugin.buildEditorContextMenu?.(context, context.data)
    this.trigger('build-context-menus', context)
    return context.data
  }

  closeContextMenu() {
    this.state.contextMenu = null
  }

  dispose() {
    for (const plugin of this.plugins) plugin.dispose?.()
    this.listeners = []
    this.trigger('dispose', { data: this })
  }
}
