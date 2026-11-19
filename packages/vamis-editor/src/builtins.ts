import { canInsertChild, registerRenderer, type SchemaObject } from '@vamis/core'
import EventEditorRenderer from './EventEditorRenderer.vue'
import {
  BasePlugin,
  type BaseEventContext,
  type BuildPanelEventContext,
  type ContextMenuEntry,
  type ContextMenuEventContext,
  type PluginInterface,
  type RegionConfig,
  type ToolbarItem,
} from './plugin'
import { registerEditorPlugin } from './manager'
import { paletteGroups } from './palette'
import { fieldsForType } from './panels'

function regionsFor(scaffold: SchemaObject): RegionConfig[] | undefined {
  if (!canInsertChild(scaffold)) return undefined
  const key =
    scaffold.type === 'tabs'
      ? 'tabs'
      : scaffold.type === 'wizard'
        ? 'steps'
        : scaffold.type === 'flex'
          ? 'items'
          : scaffold.type === 'table' || scaffold.type === 'crud'
            ? 'columns'
            : scaffold.type === 'button-group' || scaffold.type === 'button-toolbar'
              ? 'buttons'
              : 'body'
  return [{ key, label: key === 'body' ? '内容区' : key }]
}

function group(title: string, body: SchemaObject[]): SchemaObject {
  return { type: 'collapse', title, body, collapsed: false }
}

function editorTabs(properties: SchemaObject[], appearance?: SchemaObject[]): SchemaObject[] {
  return [
    {
      type: 'tabs',
      tabsMode: 'line',
      tabs: [
        { title: '属性', body: properties },
        {
          title: '外观',
          body: appearance || [
            group('基本样式', [
              { type: 'input-text', name: 'className', label: 'CSS 类名' },
              { type: 'input-text', name: 'style.width', label: '宽度', placeholder: 'auto / 100% / 320px' },
              { type: 'input-text', name: 'style.height', label: '高度', placeholder: 'auto / 240px' },
              { type: 'input-text', name: 'style.background', label: '背景' },
              { type: 'input-text', name: 'style.color', label: '文字颜色' },
            ]),
            group('状态', [
              { type: 'switch', name: 'hidden', label: '隐藏' },
              { type: 'switch', name: 'disabled', label: '禁用' },
              { type: 'input-text', name: 'visibleOn', label: '显隐表达式' },
              { type: 'input-text', name: 'disabledOn', label: '禁用表达式' },
            ]),
          ],
        },
        {
          title: '事件',
          body: [group('事件动作', [{ type: 'event-editor', name: 'onEvent', label: '事件配置' }])],
        },
      ],
    },
  ]
}

function panelFor(type: string): SchemaObject[] {
  const fields = fieldsForType(type).map((field) => ({
    type:
      field.control === 'textarea'
        ? 'textarea'
        : field.control === 'number'
          ? 'input-number'
          : field.control === 'boolean'
            ? 'switch'
            : field.control === 'select'
              ? 'select'
              : 'input-text',
    name: field.key,
    label: field.label,
    options: field.options,
  }))
  return editorTabs([group('基本', [{ type: 'input-text', name: 'type', label: '组件类型' }, ...fields])])
}

function pagePanel(): SchemaObject[] {
  return editorTabs([
    group('基本', [
      {
        type: 'checkboxes',
        name: 'regions',
        label: '区域展示',
        value: ['body', 'toolbar', 'aside', 'header'],
        options: [
          { label: '内容区', value: 'body' },
          { label: '标题栏', value: 'header' },
          { label: '工具栏', value: 'toolbar' },
          { label: '边栏', value: 'aside' },
        ],
      },
      { type: 'input-text', name: 'title', label: '页面标题' },
      { type: 'textarea', name: 'subTitle', label: '副标题' },
      { type: 'input-text', name: 'remark', label: '标题提示', hiddenOn: `!title` },
      { type: 'switch', name: 'asideResizor', label: '边栏宽度可调节', hiddenOn: `regions && !regions.includes('aside')` },
      { type: 'input-number', name: 'asideMinWidth', label: '边栏最小宽度', min: 0, hiddenOn: `regions && !regions.includes('aside')` },
      { type: 'input-number', name: 'asideMaxWidth', label: '边栏最大宽度', min: 0, hiddenOn: `regions && !regions.includes('aside')` },
      { type: 'switch', name: 'asideSticky', label: '边栏固定', value: true, hiddenOn: `regions && !regions.includes('aside')` },
      {
        type: 'button-group-select',
        name: 'asidePosition',
        label: '边栏位置',
        value: 'left',
        options: [{ label: '左', value: 'left' }, { label: '右', value: 'right' }],
        hiddenOn: `regions && !regions.includes('aside')`,
      },
    ]),
    group('数据', [
      { type: 'json', name: 'data', label: '组件静态数据', placeholder: '{ "key": "value" }' },
      { type: 'input-text', name: 'initApi', label: '初始化接口', placeholder: 'http://' },
    ]),
    group('移动端', [
      { type: 'switch', name: 'pullRefresh.disabled', label: '禁用下拉刷新', value: true },
      { type: 'input-text', name: 'pullRefresh.pullingText', label: '下拉文案' },
      { type: 'input-text', name: 'pullRefresh.loosingText', label: '释放文案' },
    ]),
  ])
}

export class PagePlugin extends BasePlugin {
  static id = 'VamisPagePlugin'
  static scene = ['global', 'layout']
  name = '页面'
  description = '页面容器'
  rendererName = 'page'
  scaffold = { type: 'page', body: [] }
  isBaseComponent = true
  disabledRendererPlugin = true
  panelTitle = '页面'
  panelBody = pagePanel()
  regions: RegionConfig[] = [
    { key: 'toolbar', label: '工具栏' },
    { key: 'aside', label: '边栏', placeholder: '边栏内容' },
    { key: 'body', label: '内容区', placeholder: '页面内容' },
  ]
}

function registerPalettePlugins() {
  for (const group of paletteGroups) {
    for (const item of group.items) {
      class PalettePlugin extends BasePlugin {
        static id = `Vamis${item.type.replace(/(^|-)([a-z])/g, (_match, _dash, char: string) => char.toUpperCase())}Plugin`
        static scene = ['global', 'layout']

        constructor(manager: InstanceType<typeof BasePlugin>['manager']) {
          super(manager)
          this.name = item.label
          this.rendererName = item.type
          this.type = item.type
          this.scaffold = item.snippet
          this.previewSchema = item.snippet
          this.description = `${item.label}（${item.type}）`
          this.tags = [group.title === 'Amis 补齐' ? '其他' : group.title]
          this.isBaseComponent = true
          this.regions = regionsFor(item.snippet)
          this.panelTitle = item.label
          this.panelBody = panelFor(item.type)
        }
      }
      registerEditorPlugin(PalettePlugin)
    }
  }
}

export class BasicToolbarPlugin extends BasePlugin {
  static id = 'BasicToolbarPlugin'
  static scene = ['global', 'layout']
  order = -9999

  buildEditorToolbar(context: BaseEventContext, toolbars: ToolbarItem[]) {
    const node = context.node
    if (node.parent && node.moveable) {
      toolbars.push(
        { id: 'move-up', label: '↑', tooltip: '向前移动', order: -30, onClick: () => this.manager.moveUp() },
        { id: 'move-down', label: '↓', tooltip: '向后移动', order: -20, onClick: () => this.manager.moveDown() },
      )
    }
    if (node.info?.plugin.popOverBody || node.info?.plugin.popOverBodyCreator) {
      toolbars.push({
        id: 'edit',
        label: '编辑',
        tooltip: '快速配置',
        order: -10,
        onClick: () => this.manager.openNodePopOverForm(node.id),
      })
    }
    if (node.duplicatable && node.parent) {
      toolbars.push({
        id: 'duplicate',
        label: '复制',
        tooltip: '重复一份',
        order: 900,
        onClick: () => this.manager.duplicate(node.id),
      })
    }
    if (node.removable && node.parent) {
      toolbars.push({
        id: 'delete',
        label: '删除',
        tooltip: '删除',
        order: 999,
        onClick: () => this.manager.del(node.id),
      })
    }
    if (node.info?.scaffoldForm?.canRebuild || node.info?.plugin.scaffoldForm?.canRebuild) {
      toolbars.push({
        id: 'build',
        label: '构建',
        tooltip: `快速构建「${node.info?.plugin.name}」`,
        order: 998,
        onClick: () => this.manager.reScaffold(node.id),
      })
    }
  }

  buildEditorContextMenu(context: ContextMenuEventContext, menus: ContextMenuEntry[]) {
    const node = context.node
    if (node.parent) {
      menus.push(
        { id: 'move-up', label: '向前移动', disabled: !node.moveable, onSelect: () => this.manager.moveUp() },
        { id: 'move-down', label: '向后移动', disabled: !node.moveable, onSelect: () => this.manager.moveDown() },
        '|',
        { id: 'copy', label: '重复一份', disabled: !node.duplicatable, onSelect: () => this.manager.duplicate(node.id) },
        { id: 'copy-config', label: '复制配置', onSelect: () => this.manager.copy(node.id) },
        {
          id: 'cut-config',
          label: '剪切配置',
          disabled: !node.removable,
          onSelect: () => this.manager.cut(node.id),
        },
        {
          id: 'paste-config',
          label: '粘贴配置',
          disabled: !node.replaceable,
          onSelect: () => this.manager.paste(node.id),
        },
        {
          id: 'delete',
          label: '删除',
          disabled: !node.removable,
          className: 'text-destructive',
          onSelect: () => this.manager.del(node.id),
        },
        '|',
      )
    }
    menus.push(
      { id: 'undo', label: '撤销（Undo）', disabled: !this.manager.canUndo, onSelect: () => this.manager.undo() },
      { id: 'redo', label: '重做（Redo）', disabled: !this.manager.canRedo, onSelect: () => this.manager.redo() },
    )
    if (node.info?.regions?.length) {
      menus.push('|')
      for (const region of node.info.regions) {
        menus.push({
          id: `clear-${region.key}`,
          label: `清空${region.label}`,
          onSelect: () => this.manager.emptyRegion(node.id, region.key),
        })
      }
    }
    if (node.info?.scaffoldForm?.canRebuild || node.info?.plugin.scaffoldForm?.canRebuild) {
      menus.push({
        id: 'build',
        label: `快速构建「${node.info?.plugin.name}」`,
        onSelect: () => this.manager.reScaffold(node.id),
      })
    }
  }
}

export class OutlinePlugin extends BasePlugin {
  static id = 'OutlinePlugin'
  buildEditorPanel(context: BuildPanelEventContext, panels: PanelItemLike[]) {
    if (!context.selections.length) return
    panels.push({ key: 'selection', title: '多选操作', body: [] })
  }
}

type PanelItemLike = Parameters<NonNullable<PluginInterface['buildEditorPanel']>>[1][number]

registerRenderer({
  type: 'event-editor',
  name: '事件动作编辑器',
  component: EventEditorRenderer,
})

registerEditorPlugin(BasicToolbarPlugin)
registerEditorPlugin(PagePlugin)
registerPalettePlugins()
