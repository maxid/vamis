import type { VNode } from 'vue'
import type { RendererConfig, SchemaCollection, SchemaObject } from '@vamis/core'
import type { EditorManager, EditorNode } from './manager'

export interface RegionConfig {
  key: string
  label: string
  placeholder?: string
  preferTag?: string
  optional?: boolean
  memberImmutable?: boolean
  accept?: (json: SchemaObject, node: EditorNode, dragNode?: EditorNode) => boolean
  hiddenOn?: (schema: SchemaObject) => boolean
}

export interface InlineEditableElement {
  match: string
  key: string
  mode?: 'plain-text' | 'rich-text'
}

export interface ScaffoldForm {
  title?: string
  body: SchemaObject[]
  controls?: SchemaObject[]
  mode?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  canSkip?: boolean
  canRebuild?: boolean
  pipeIn?: (value: SchemaObject) => Record<string, unknown>
  pipeOut?: (value: Record<string, unknown>) => SchemaObject
}

export interface RendererScaffoldInfo {
  name: string
  icon?: string
  pluginIcon?: string
  searchKeywords?: string
  description?: string
  docLink?: string
  previewSchema?: SchemaObject
  tags?: string | string[]
  type?: string
  scaffold?: SchemaObject
}

export interface RendererInfo extends RendererScaffoldInfo {
  id: string
  type: string
  plugin: PluginInterface
  renderer: RendererConfig
  schemaPath: string
  rendererName?: string
  $schema?: string
  isBaseComponent?: boolean
  disabledRendererPlugin?: boolean
  scaffolds?: Array<Partial<RendererScaffoldInfo>>
  regions?: RegionConfig[]
  patchContainers?: string[]
  inlineEditableElements?: InlineEditableElement[]
  scaffoldForm?: ScaffoldForm
  editable?: boolean
  removable?: boolean
  draggable?: boolean
  movable?: boolean
  replaceable?: boolean
  duplicatable?: boolean
  memberImmutable?: boolean | string[]
  typeMutable?: boolean
}

export type BasicRendererInfo = Partial<
  Omit<RendererInfo, 'id' | 'type' | 'plugin' | 'renderer' | 'schemaPath'>
>

export interface SubRendererInfo extends RendererScaffoldInfo {
  id: string
  plugin: PluginInterface
  parent?: RendererInfo
  order: number
  scaffoldForm?: ScaffoldForm
  isBaseComponent?: boolean
  disabledRendererPlugin?: boolean
  rendererName?: string
}

export type BasicSubRenderInfo = Partial<Omit<SubRendererInfo, 'id' | 'plugin' | 'order'>> & {
  order?: number
}

export interface ToolbarItem {
  id?: string
  label?: string
  order?: number
  icon?: string
  iconSvg?: string
  tooltip?: string
  disabled?: boolean
  onClick?: (event: MouseEvent) => void
}

export interface ContextMenuItem {
  id?: string
  label?: string
  icon?: string
  disabled?: boolean
  className?: string
  children?: ContextMenuItem[]
  onSelect?: (data?: unknown) => void
}

export type ContextMenuEntry = ContextMenuItem | '|'

export interface PanelProps {
  node: EditorNode
  value: SchemaObject
  manager: EditorManager
  readonly?: boolean
}

export interface PanelItem {
  key: string
  title?: string
  icon?: string
  pluginIcon?: string
  order?: number
  position?: 'left' | 'right'
  body?: SchemaCollection
  render?: (props: PanelProps) => VNode
  menus?: ContextMenuEntry[]
}

export type BasicPanelItem = PanelItem

export interface EventContext {
  data?: any
  [key: string]: any
}

export interface BaseEventContext extends EventContext {
  node: EditorNode
  id: string
  info: RendererInfo
  path: string
  schemaPath: string
  schema: SchemaObject
}

export interface RendererInfoResolveEventContext extends EventContext {
  renderer: RendererConfig
  path: string
  schemaPath: string
  schema: SchemaObject
  data?: RendererInfo | null
}

export interface ActiveEventContext extends Partial<BaseEventContext> {
  active?: boolean
}

export interface InsertEventContext extends BaseEventContext {
  region: string
  beforeId?: string
  index: number
  data: SchemaObject
  subRenderer?: SubRendererInfo | RendererInfo
}

export interface ReplaceEventContext extends BaseEventContext {
  data: SchemaObject
  subRenderer?: SubRendererInfo | RendererInfo
  region?: string
}

export interface MoveEventContext extends BaseEventContext {
  region: string
  sourceId: string
  beforeId?: string
  direction?: 'up' | 'down'
}

export interface DeleteEventContext extends BaseEventContext {
  data?: string[]
}

export interface ChangeEventContext extends BaseEventContext {
  value: SchemaObject
  diff?: unknown[]
}

export interface DragEventContext extends EventContext {
  mode: 'move' | 'copy'
  sourceType: 'schema' | 'subrenderer' | string
  sourceId: string
  data: SchemaObject
  targetId?: string
  targetRegion?: string
}

export interface BuildPanelEventContext extends BaseEventContext {
  data: BasicPanelItem[]
  selections: BaseEventContext[]
}

export interface ContextMenuEventContext extends BaseEventContext {
  region: string
  selections: BaseEventContext[]
  data: ContextMenuEntry[]
  clientX?: number
  clientY?: number
  target?: HTMLElement
}

export interface SelectionEventContext extends BaseEventContext {
  selections: BaseEventContext[]
  data: string[]
}

export interface PreventClickEventContext extends EventContext {
  data: MouseEvent
}

export type PluginEvent<T extends EventContext = EventContext> = {
  context: T
  type: string
  prevented: boolean
  stoped: boolean
  preventDefault: () => void
  stopPropagation: () => void
  setData: (data: any) => void
  pending?: Promise<unknown>
  readonly data?: any
}

export function createEvent<T extends EventContext>(type: string, context: T): PluginEvent<T> {
  const event: PluginEvent<T> = {
    context,
    type,
    prevented: false,
    stoped: false,
    preventDefault() {
      event.prevented = true
    },
    stopPropagation() {
      event.stoped = true
    },
    setData(data) {
      event.context.data = data
    },
    get data() {
      return event.context.data
    },
  }
  return event
}

export interface PluginEventListener {
  onInit?: (event: PluginEvent<EventContext & { data: EditorManager }>) => void
  onActive?: (event: PluginEvent<ActiveEventContext>) => void
  beforeInsert?: (event: PluginEvent<InsertEventContext>) => false | void
  afterInsert?: (event: PluginEvent<InsertEventContext>) => void
  beforeUpdate?: (event: PluginEvent<ChangeEventContext>) => false | void
  afterUpdate?: (event: PluginEvent<ChangeEventContext>) => void
  beforeReplace?: (event: PluginEvent<ReplaceEventContext>) => false | void
  afterReplace?: (event: PluginEvent<ReplaceEventContext>) => void
  beforeMove?: (event: PluginEvent<MoveEventContext>) => false | void
  afterMove?: (event: PluginEvent<MoveEventContext>) => void
  beforeDelete?: (event: PluginEvent<DeleteEventContext>) => false | void
  afterDelete?: (event: PluginEvent<DeleteEventContext>) => void
  beforeResolveEditorInfo?: (event: PluginEvent<RendererInfoResolveEventContext>) => false | void
  afterResolveEditorInfo?: (event: PluginEvent<RendererInfoResolveEventContext>) => void
  onDndAccept?: (event: PluginEvent<DragEventContext>) => false | void
  onBuildPanels?: (event: PluginEvent<BuildPanelEventContext>) => void
  onBuildContextMenus?: (event: PluginEvent<ContextMenuEventContext>) => void
  onBuildToolbars?: (event: PluginEvent<BuildPanelEventContext>) => void
  onSelectionChange?: (event: PluginEvent<SelectionEventContext>) => false | void
  onPreventClick?: (event: PluginEvent<PreventClickEventContext>) => false | void
  onUndo?: () => void
  onRedo?: () => void
  onSave?: () => void
  onPreview?: (preview: boolean) => void
}

export interface PluginInterface extends PluginEventListener, Partial<BasicRendererInfo> {
  readonly manager: EditorManager
  order?: number
  scene?: string[]
  rendererName?: string
  panelIcon?: string
  panelTitle?: string
  panelBody?: SchemaObject[]
  panelControls?: SchemaObject[]
  panelDefinitions?: Record<string, SchemaObject>
  panelSubmitOnChange?: boolean
  panelBodyCreator?: (context: BaseEventContext) => SchemaCollection
  panelControlsCreator?: (context: BaseEventContext) => SchemaObject[]
  popOverBody?: SchemaObject[]
  popOverBodyCreator?: (context: BaseEventContext) => SchemaObject[]
  getRendererInfo?: (context: RendererInfoResolveEventContext) => BasicRendererInfo | void
  buildEditorToolbar?: (context: BaseEventContext, toolbars: ToolbarItem[]) => void
  buildEditorContextMenu?: (context: ContextMenuEventContext, menus: ContextMenuEntry[]) => void
  buildEditorPanel?: (context: BuildPanelEventContext, panels: BasicPanelItem[]) => void
  buildSubRenderers?: (
    context: BaseEventContext & { region?: string },
    subRenderers: SubRendererInfo[],
    renderers: RendererConfig[],
  ) => BasicSubRenderInfo | BasicSubRenderInfo[] | void
  dispose?: () => void
}

export type PluginClass = {
  new (manager: EditorManager, options?: Record<string, unknown>): PluginInterface
  id?: string
  priority?: number
  scene?: string[]
}

export abstract class BasePlugin implements PluginInterface {
  static scene = ['global']
  static id?: string
  static priority?: number

  name?: string
  rendererName?: string
  order?: number
  scene?: string[]
  icon?: string
  pluginIcon?: string
  searchKeywords?: string
  description?: string
  docLink?: string
  previewSchema?: SchemaObject
  tags?: string | string[]
  type?: string
  scaffold?: SchemaObject
  scaffolds?: Array<Partial<RendererScaffoldInfo>>
  $schema?: string
  isBaseComponent?: boolean
  disabledRendererPlugin?: boolean
  regions?: RegionConfig[]
  patchContainers?: string[]
  inlineEditableElements?: InlineEditableElement[]
  scaffoldForm?: ScaffoldForm
  editable?: boolean
  removable?: boolean
  draggable?: boolean
  movable?: boolean
  replaceable?: boolean
  duplicatable?: boolean
  memberImmutable?: boolean | string[]
  typeMutable?: boolean
  panelIcon?: string
  panelTitle?: string
  panelBody?: SchemaObject[]
  panelControls?: SchemaObject[]
  panelDefinitions?: Record<string, SchemaObject>
  panelSubmitOnChange?: boolean
  panelBodyCreator?: (context: BaseEventContext) => SchemaCollection
  panelControlsCreator?: (context: BaseEventContext) => SchemaObject[]
  popOverBody?: SchemaObject[]
  popOverBodyCreator?: (context: BaseEventContext) => SchemaObject[]

  constructor(readonly manager: EditorManager) {}

  getRendererInfo({ renderer, schema }: RendererInfoResolveEventContext): BasicRendererInfo | void {
    if (
      !schema.$$id ||
      !this.name ||
      !this.rendererName ||
      (this.rendererName !== renderer.type && this.rendererName !== schema.type)
    ) {
      return
    }
    return {
      name: this.name,
      regions: this.regions,
      patchContainers: this.patchContainers,
      inlineEditableElements: this.inlineEditableElements,
      $schema: this.$schema,
      scaffoldForm: this.scaffoldForm,
      disabledRendererPlugin: this.disabledRendererPlugin,
      isBaseComponent: this.isBaseComponent,
      rendererName: this.rendererName,
      editable: this.editable,
      removable: this.removable,
      draggable: this.draggable,
      movable: this.movable,
      replaceable: this.replaceable,
      duplicatable: this.duplicatable,
      memberImmutable: this.memberImmutable,
      typeMutable: this.typeMutable,
    }
  }

  buildEditorPanel(context: BuildPanelEventContext, panels: BasicPanelItem[]) {
    if (context.selections.length || !context.info || context.info.plugin !== this) return
    const body = this.panelBodyCreator
      ? this.panelBodyCreator(context)
      : this.panelBody || this.panelControlsCreator?.(context) || this.panelControls
    if (!body) return
    panels.push({
      key: 'config',
      icon: this.panelIcon || this.icon,
      pluginIcon: this.pluginIcon,
      title: this.panelTitle || '设置',
      body,
    })
  }

  buildSubRenderers(): BasicSubRenderInfo | BasicSubRenderInfo[] | void {
    if (Array.isArray(this.scaffolds)) {
      return this.scaffolds.map((scaffold) => ({
        ...scaffold,
        name: scaffold.name || this.name,
        icon: scaffold.icon || this.icon,
        pluginIcon: this.pluginIcon,
        description: scaffold.description || this.description,
        previewSchema: scaffold.previewSchema || this.previewSchema,
        tags: scaffold.tags || this.tags,
        docLink: scaffold.docLink || this.docLink,
        type: scaffold.type || this.type,
        scaffold: scaffold.scaffold || this.scaffold,
        scaffoldForm: this.scaffoldForm,
        isBaseComponent: this.isBaseComponent,
        rendererName: this.rendererName,
      }))
    }
    if (!this.name || !this.description) return
    return {
      searchKeywords: this.searchKeywords,
      name: this.name,
      icon: this.icon,
      pluginIcon: this.pluginIcon,
      description: this.description,
      previewSchema: this.previewSchema,
      tags: this.tags,
      docLink: this.docLink,
      type: this.type,
      scaffold: this.scaffold,
      scaffoldForm: this.scaffoldForm,
      disabledRendererPlugin: this.disabledRendererPlugin,
      isBaseComponent: this.isBaseComponent,
      rendererName: this.rendererName,
    }
  }

  getPlugin(rendererNameOrClass: string | PluginClass): PluginInterface | undefined {
    return this.manager.plugins.find((plugin) =>
      typeof rendererNameOrClass === 'string'
        ? plugin.rendererName === rendererNameOrClass
        : plugin instanceof rendererNameOrClass,
    )
  }
}

export abstract class LayoutBasePlugin extends BasePlugin {}
