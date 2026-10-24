import type { SchemaObject } from '@vamis/core'
import { toPageYaml } from './page'
import type { CatalogGroup, CatalogLeaf, ComponentDef, ComponentRole } from './types'

const OPTIONS = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' },
]

const TREE_OPTIONS = [
  {
    label: '华东',
    children: [
      { label: '上海', value: 'sh' },
      { label: '杭州', value: 'hz' },
    ],
  },
  { label: '华北', children: [{ label: '北京', value: 'bj' }] },
]

const OPTION_TYPES = new Set([
  'select',
  'multi-select',
  'checkboxes',
  'radios',
  'radio',
  'nested-select',
  'tree-select',
  'input-tree',
  'list-select',
  'picker',
  'transfer',
  'transfer-picker',
  'tabs-transfer',
  'tabs-transfer-picker',
  'chained-select',
  'button-group-select',
  'input-tag',
  'chart-radios',
])

function fieldName(type: string) {
  return type.replace(/-/g, '_')
}

function tpl(text: string): SchemaObject {
  return { type: 'tpl', tpl: text }
}

function defaultSnippet(def: ComponentDef, role: ComponentRole): SchemaObject {
  if (def.snippet) return def.snippet
  if (role === 'item') {
    const base: SchemaObject = {
      type: def.type,
      name: fieldName(def.type),
      label: def.label.replace(/\s.+$/, '') || def.label,
    }
    if (OPTION_TYPES.has(def.type)) {
      base.options = def.type.includes('tree') || def.type.includes('nested') || def.type.includes('chained')
        ? TREE_OPTIONS
        : OPTIONS
    }
    return base
  }
  if (role === 'form') {
    return {
      type: 'form',
      title: def.label,
      mode: 'horizontal',
      api: '/api/mock2/form/saveForm',
      body: [
        { type: 'input-text', name: 'name', label: '名称', required: true },
        { type: 'input-email', name: 'email', label: '邮箱' },
      ],
    }
  }
  return { type: def.type }
}

function toLeaf(def: ComponentDef): CatalogLeaf {
  const role: ComponentRole = def.role ?? 'widget'
  const snippet = defaultSnippet(def, role)
  const subTitle = def.subTitle ?? (def.type.startsWith('_') ? undefined : `type: ${def.type}`)
  const yaml =
    role === 'root'
      ? toPageYaml({ name: def.type, title: def.label, subTitle, data: def.data, spec: snippet })
      : toPageYaml({
          name: def.type,
          title: def.label,
          subTitle,
          data: def.data,
          body:
            role === 'item'
              ? [
                  {
                    type: 'form',
                    title: def.label,
                    mode: 'horizontal',
                    api: '/api/mock2/form/saveForm',
                    body: [snippet],
                  },
                ]
              : [snippet],
        })

  return {
    id: `component:${def.type}`,
    label: def.label,
    type: def.type.startsWith('_') ? undefined : def.type,
    yaml,
    searchable: `${def.label} ${def.type}`.toLowerCase(),
    kind: 'component',
  }
}

function group(id: string, label: string, items: ComponentDef[]): CatalogGroup {
  return { id, label, children: items.map(toLeaf) }
}

const LAYOUT: ComponentDef[] = [
  {
    type: 'page',
    label: 'Page 页面',
    role: 'root',
    snippet: {
      type: 'page',
      title: 'Page 页面',
      subTitle: '最外层页面容器',
      body: [tpl('页面正文'), { type: 'divider' }, tpl('可继续嵌套其它组件')],
    },
  },
  {
    type: 'container',
    label: 'Container 容器',
    snippet: { type: 'container', body: [tpl('Container 包裹的内容')] },
  },
  {
    type: 'collapse-group',
    label: 'Collapse 折叠器',
    snippet: {
      type: 'collapse-group',
      body: [
        { type: 'collapse', title: '第一节', body: [tpl('折叠内容 A')] },
        { type: 'collapse', title: '第二节', body: [tpl('折叠内容 B')] },
      ],
    },
  },
  { type: 'divider', label: 'Divider 分割线' },
  {
    type: 'flex',
    label: 'Flex 布局',
    snippet: {
      type: 'flex',
      justify: 'space-between',
      items: [tpl('左'), tpl('中'), tpl('右')],
    },
  },
  {
    type: 'grid',
    label: 'Grid 水平分栏',
    snippet: {
      type: 'grid',
      columns: [
        { md: 6, body: [tpl('左栏 span 6')] },
        { md: 6, body: [tpl('右栏 span 6')] },
      ],
    },
  },
  {
    type: 'grid-2d',
    label: 'Grid 2D 布局',
    snippet: {
      type: 'grid-2d',
      cols: 12,
      gap: 8,
      rowHeight: 48,
      grids: [
        { x: 1, y: 1, w: 6, h: 1, body: [tpl('A')] },
        { x: 7, y: 1, w: 6, h: 1, body: [tpl('B')] },
      ],
    },
  },
  {
    type: 'hbox',
    label: 'HBox 布局',
    snippet: {
      type: 'hbox',
      gap: 'sm',
      columns: [tpl('左栏'), tpl('中栏'), tpl('右栏')],
    },
  },
  {
    type: 'pagination',
    label: 'Pagination 分页',
    snippet: { type: 'pagination', total: 80, perPage: 10, value: 1 },
  },
  {
    type: 'pagination-wrapper',
    label: 'PaginationWrapper 分页容器',
    data: {
      rows: [
        { engine: 'Trident', version: '7' },
        { engine: 'Gecko', version: '1.8' },
        { engine: 'Webkit', version: '522' },
        { engine: 'Presto', version: '2.1' },
      ],
    },
    snippet: {
      type: 'pagination-wrapper',
      inputName: 'rows',
      outputName: 'rows',
      perPage: 2,
      body: {
        type: 'table',
        source: '${rows}',
        columns: [
          { name: 'engine', label: '引擎' },
          { name: 'version', label: '版本' },
        ],
      },
    },
  },
  {
    type: 'panel',
    label: 'Panel 面板',
    snippet: { type: 'panel', title: '面板', body: [tpl('面板正文')] },
  },
  {
    type: 'tabs',
    label: 'Tabs 选项卡',
    snippet: {
      type: 'tabs',
      tabs: [
        { title: 'Tab 1', body: [tpl('第一页')] },
        { title: 'Tab 2', body: [tpl('第二页')] },
      ],
    },
  },
  {
    type: 'wrapper',
    label: 'Wrapper 包裹容器',
    snippet: { type: 'wrapper', body: [tpl('Wrapper 仅包一层')] },
  },
  {
    type: 'portlet',
    label: 'Portlet 门户栏目',
    snippet: {
      type: 'portlet',
      tabs: [
        { title: '概览', body: [tpl('栏目 A')] },
        { title: '明细', body: [tpl('栏目 B')] },
      ],
    },
  },
  {
    type: 'switch-container',
    label: 'switch-container 状态容器',
    data: { env: 'prod' },
    snippet: {
      type: 'switch-container',
      items: [
        { visibleOn: '${env === "prod"}', body: [tpl('当前环境：生产')] },
        { visibleOn: '${env === "dev"}', body: [tpl('当前环境：开发')] },
      ],
    },
  },
]

const FEATURE: ComponentDef[] = [
  {
    type: 'action',
    label: 'Action 行为按钮',
    snippet: { type: 'action', label: 'Toast', actionType: 'toast', msg: 'Action 已点击' },
  },
  {
    type: 'app',
    label: 'App 多页应用',
    role: 'root',
    snippet: {
      type: 'app',
      brandName: '泵站监控',
      pages: [
        { label: '概览', isDefaultPage: true, schema: tpl('当前为概览页') },
        { label: '设备', schema: tpl('设备列表') },
      ],
    },
  },
  {
    type: 'button',
    label: 'Button 按钮',
    snippet: { type: 'button', label: '按钮', actionType: 'toast', msg: '已点击' },
  },
  {
    type: 'button-group',
    label: 'ButtonGroup 按钮组',
    snippet: {
      type: 'button-group',
      buttons: [
        { type: 'button', label: 'A' },
        { type: 'button', label: 'B' },
      ],
    },
  },
  {
    type: 'breadcrumb',
    label: 'Breadcrumb 面包屑',
    snippet: {
      type: 'breadcrumb',
      items: [{ label: '首页', href: '/' }, { label: '当前' }],
    },
  },
  {
    type: 'custom',
    label: 'Custom 自定义组件',
    snippet: { type: 'custom', html: '<strong>custom 占位</strong>（不执行 onMount JS）' },
  },
  {
    type: 'dropdown-button',
    label: 'DropDownButton 下拉按钮',
    snippet: {
      type: 'dropdown-button',
      label: '更多',
      buttons: [
        { type: 'button', label: '编辑', actionType: 'toast', msg: '编辑' },
        { type: 'button', label: '删除', actionType: 'toast', msg: '删除' },
      ],
    },
  },
  {
    type: 'service',
    label: 'Service 功能型容器',
    snippet: {
      type: 'service',
      api: '/api/mock2/form/initData',
      body: [tpl('Service 已请求 initData')],
    },
  },
  {
    type: 'nav',
    label: 'Nav 导航',
    snippet: {
      type: 'nav',
      stacked: false,
      links: [
        { label: 'Playground', to: '/', active: true },
        { label: '编辑器', to: '/editor' },
      ],
    },
  },
  {
    type: 'anchor-nav',
    label: 'AnchorNav 锚点导航',
    snippet: {
      type: 'anchor-nav',
      links: [
        { title: '第一节', href: '#s1', body: [tpl('第一节内容')] },
        { title: '第二节', href: '#s2', body: [tpl('第二节内容')] },
      ],
    },
  },
  {
    type: 'tooltip-wrapper',
    label: 'TooltipWrapper 文字提示容器',
    snippet: {
      type: 'tooltip-wrapper',
      content: '悬停查看说明',
      body: tpl('悬停我'),
    },
  },
  {
    type: 'popover',
    label: 'PopOver 弹出提示',
    subTitle: '属性 popOver，不是独立 type',
    snippet: {
      type: 'static',
      label: '状态',
      name: 'status',
      value: '在线',
      popOver: { body: { type: 'tpl', tpl: '这是 popOver 内容（字段属性）' } },
    },
  },
]

const INPUT: ComponentDef[] = [
  { type: 'form', label: 'Form 表单', role: 'form' },
  {
    type: '_formitem',
    label: 'FormItem 表单项通用',
    role: 'form',
    subTitle: '契约页，不是业务 type',
    snippet: {
      type: 'form',
      title: 'FormItem 通用能力',
      mode: 'horizontal',
      body: [
        { type: 'input-text', name: 'required', label: '必填', required: true, description: '通用 label / required / description' },
        { type: 'input-text', name: 'disabled', label: '禁用', disabled: true, value: '不可改' },
      ],
    },
  },
  {
    type: 'control',
    label: 'Control 表单项包裹',
    role: 'item',
    snippet: {
      type: 'control',
      label: '包裹',
      body: { type: 'input-text', name: 'wrapped', placeholder: '被 control 包裹' },
    },
  },
  {
    type: '_options',
    label: 'Options 选择器表单项',
    role: 'form',
    subTitle: '契约页：source / joinValues 等',
    snippet: {
      type: 'form',
      title: 'Options 契约',
      mode: 'horizontal',
      body: [
        {
          type: 'select',
          name: 'remote',
          label: '远程',
          source: '/api/mock2/options',
          joinValues: true,
        },
        { type: 'select', name: 'local', label: '本地', options: OPTIONS, multiple: true },
      ],
    },
  },
  {
    type: 'input-array',
    label: 'InputArray 数组输入框',
    role: 'item',
    snippet: {
      type: 'input-array',
      name: 'items',
      label: '数组',
      items: { type: 'input-text', name: 'label', placeholder: '项' },
    },
  },
  {
    type: 'button-toolbar',
    label: 'ButtonToolbar 按钮工具栏',
    snippet: {
      type: 'button-toolbar',
      buttons: [
        { type: 'button', label: '保存', level: 'primary', actionType: 'toast', msg: '保存' },
        { type: 'button', label: '取消', actionType: 'toast', msg: '取消' },
      ],
    },
  },
  { type: 'button-group-select', label: 'ButtonGroupSelect 按钮点选', role: 'item' },
  { type: 'chained-select', label: 'ChainedSelect 链式下拉框', role: 'item' },
  { type: 'checkbox', label: 'Checkbox 勾选框', role: 'item' },
  { type: 'checkboxes', label: 'Checkboxes 复选框', role: 'item' },
  { type: 'input-city', label: 'InputCity 城市选择器', role: 'item' },
  { type: 'input-color', label: 'InputColor 颜色选择器', role: 'item' },
  {
    type: 'combo',
    label: 'Combo 组合',
    role: 'item',
    snippet: {
      type: 'combo',
      name: 'items',
      label: '组合',
      multiple: true,
      items: [
        { type: 'input-text', name: 'label', label: '项' },
        { type: 'input-number', name: 'count', label: '数量' },
      ],
    },
  },
  {
    type: 'condition-builder',
    label: 'ConditionBuilder 条件组合',
    role: 'item',
    snippet: {
      type: 'condition-builder',
      name: 'condition',
      label: '条件',
      fields: [
        { name: 'status', label: '状态', type: 'select', options: OPTIONS },
        { name: 'name', label: '名称', type: 'text' },
      ],
    },
  },
  { type: 'input-date', label: 'InputDate 日期选择器', role: 'item' },
  { type: 'input-datetime', label: 'InputDatetime 日期时间', role: 'item' },
  { type: 'input-month', label: 'InputMonth 月份选择器', role: 'item' },
  { type: 'input-date-range', label: 'InputDateRange 日期范围', role: 'item' },
  { type: 'input-datetime-range', label: 'InputDatetimeRange 日期时间范围', role: 'item' },
  { type: 'input-month-range', label: 'InputMonthRange 月份范围', role: 'item' },
  { type: 'input-kv', label: 'InputKV 键值对', role: 'item' },
  { type: 'input-kvs', label: 'InputKVS 键值对象', role: 'item' },
  { type: 'input-formula', label: 'InputFormula 公式编辑器', role: 'item' },
  {
    type: 'diff-editor',
    label: 'DiffEditor 对比编辑器',
    role: 'item',
    snippet: {
      type: 'diff-editor',
      name: 'diff',
      label: '对比',
      lhs: 'old line\nvalue',
      rhs: 'new line\nvalue',
    },
  },
  {
    type: 'editor',
    label: 'Editor 代码编辑器',
    role: 'item',
    snippet: { type: 'editor', name: 'code', label: '代码', language: 'json', value: '{ "ok": true }' },
  },
  {
    type: 'fieldset',
    label: 'FieldSet 表单项集合',
    role: 'item',
    snippet: {
      type: 'fieldset',
      title: '基本信息',
      body: [
        { type: 'input-text', name: 'title', label: '标题' },
        { type: 'textarea', name: 'desc', label: '说明' },
      ],
    },
  },
  { type: 'input-excel', label: 'InputExcel Excel 解析', role: 'item' },
  { type: 'input-file', label: 'InputFile 文件上传', role: 'item' },
  {
    type: 'formula',
    label: 'Formula 公式',
    role: 'item',
    snippet: { type: 'formula', name: 'sum', label: '公式', formula: '1 + 2' },
  },
  {
    type: 'group',
    label: 'Group 表单项组',
    role: 'item',
    snippet: {
      type: 'group',
      label: '组',
      body: [
        { type: 'input-text', name: 'first', label: '姓' },
        { type: 'input-text', name: 'last', label: '名' },
      ],
    },
  },
  { type: 'hidden', label: 'Hidden 隐藏字段', role: 'item', snippet: { type: 'hidden', name: 'token', value: 'hidden-id' } },
  { type: 'input-image', label: 'InputImage 图片', role: 'item' },
  {
    type: 'input-group',
    label: 'InputGroup 输入框组合',
    role: 'item',
    snippet: {
      type: 'input-group',
      label: '组合输入',
      body: [
        { type: 'input-text', name: 'host', placeholder: 'host' },
        { type: 'input-text', name: 'port', placeholder: 'port' },
      ],
    },
  },
  { type: 'list-select', label: 'ListSelect 选择器', role: 'item' },
  { type: 'location-picker', label: 'LocationPicker 地理位置', role: 'item' },
  { type: 'uuid', label: 'UUID 随机 ID', role: 'item' },
  {
    type: 'matrix-checkboxes',
    label: 'MatrixCheckboxes 矩阵勾选',
    role: 'item',
    snippet: {
      type: 'matrix-checkboxes',
      name: 'matrix',
      label: '矩阵',
      columns: [{ label: '周一' }, { label: '周二' }],
      rows: [{ label: '早班' }, { label: '晚班' }],
    },
  },
  { type: 'nested-select', label: 'NestedSelect 级联选择器', role: 'item' },
  { type: 'input-number', label: 'InputNumber 数字输入', role: 'item' },
  { type: 'input-password', label: 'InputPassword 密码', role: 'item' },
  { type: 'picker', label: 'Picker 列表选择器', role: 'item' },
  { type: 'input-quarter', label: 'InputQuarter 季度', role: 'item' },
  { type: 'input-quarter-range', label: 'InputQuarterRange 季度范围', role: 'item' },
  { type: 'radio', label: 'Radio 单选框', role: 'item' },
  { type: 'radios', label: 'Radios 单选框', role: 'item' },
  { type: 'chart-radios', label: 'ChartRadios 图表单选框', role: 'item' },
  { type: 'input-rating', label: 'InputRating 评分', role: 'item' },
  { type: 'input-range', label: 'InputRange 滑块', role: 'item' },
  { type: 'input-repeat', label: 'InputRepeat 重复频率', role: 'item' },
  { type: 'input-rich-text', label: 'InputRichText 富文本', role: 'item' },
  { type: 'select', label: 'Select 下拉框', role: 'item' },
  {
    type: 'input-sub-form',
    label: 'InputSubForm 子表单',
    role: 'item',
    snippet: {
      type: 'input-sub-form',
      name: 'child',
      label: '子表单',
      form: {
        title: '子表单',
        body: [{ type: 'input-text', name: 'title', label: '标题' }],
      },
    },
  },
  { type: 'switch', label: 'Switch 开关', role: 'item' },
  { type: 'static', label: 'Static 静态展示', role: 'item', snippet: { type: 'static', name: 'status', label: '状态', value: '在线' } },
  {
    type: 'input-table',
    label: 'InputTable 表格',
    role: 'item',
    snippet: {
      type: 'input-table',
      name: 'rows',
      label: '表格',
      columns: [
        { type: 'input-text', name: 'name', label: '名称' },
        { type: 'input-number', name: 'qty', label: '数量' },
      ],
    },
  },
  { type: 'input-tag', label: 'InputTag 标签选择器', role: 'item' },
  { type: 'input-text', label: 'InputText 输入框', role: 'item' },
  { type: 'textarea', label: 'Textarea 多行输入框', role: 'item' },
  { type: 'input-time', label: 'InputTime 时间', role: 'item' },
  { type: 'input-time-range', label: 'InputTimeRange 时间范围', role: 'item' },
  { type: 'transfer', label: 'Transfer 穿梭器', role: 'item' },
  { type: 'transfer-picker', label: 'TransferPicker 穿梭选择器', role: 'item' },
  {
    type: 'tabs-transfer',
    label: 'TabsTransfer 组合穿梭器',
    role: 'item',
    snippet: {
      type: 'tabs-transfer',
      name: 'picked',
      label: '组合穿梭',
      options: [
        { label: '设备', children: OPTIONS },
        { label: '人员', children: [{ label: '张三', value: 'zhang' }] },
      ],
    },
  },
  { type: 'tabs-transfer-picker', label: 'TabsTransferPicker', role: 'item' },
  { type: 'input-tree', label: 'InputTree 树形选择框', role: 'item' },
  { type: 'tree-select', label: 'TreeSelect 树形选择器', role: 'item' },
  { type: 'input-year', label: 'InputYear 年输入', role: 'item' },
  { type: 'input-year-range', label: 'InputYearRange 年份范围', role: 'item' },
  {
    type: 'json-schema',
    label: 'JsonSchema',
    role: 'item',
    snippet: {
      type: 'json-schema',
      name: 'schema',
      label: 'JSON Schema',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', title: '标题' },
          count: { type: 'number', title: '数量' },
          on: { type: 'boolean', title: '启用' },
        },
      },
    },
  },
  { type: 'json-schema-editor', label: 'JsonSchema Editor', role: 'item' },
  { type: 'input-signature', label: 'InputSignature 签名面板', role: 'item' },
  { type: 'input-verification-code', label: 'InputVerificationCode 验证码', role: 'item' },
]

const DISPLAY: ComponentDef[] = [
  {
    type: 'crud',
    label: 'CRUD 增删改查',
    snippet: {
      type: 'crud',
      name: 'list',
      api: '/api/mock2/sample',
      perPage: 5,
      columns: [
        { name: 'id', label: 'ID' },
        { name: 'engine', label: '渲染引擎' },
        { name: 'browser', label: 'Browser' },
      ],
    },
  },
  {
    type: 'table',
    label: 'Table 表格',
    data: {
      items: [
        { id: 1, name: '泵房-A' },
        { id: 2, name: '闸门-B' },
      ],
    },
    snippet: {
      type: 'table',
      source: '${items}',
      columns: [
        { name: 'id', label: 'ID' },
        { name: 'name', label: '名称' },
      ],
    },
  },
  { type: 'table2', label: 'Table2 表格' },
  { type: 'table-view', label: 'Table View 表格视图' },
  { type: 'calendar', label: 'Calendar 日历日程' },
  {
    type: 'card',
    label: 'Card 卡片',
    snippet: { type: 'card', header: { title: '泵房-A', subTitle: '在线' }, body: [tpl('卡片正文')] },
  },
  {
    type: 'cards',
    label: 'Cards 卡片组',
    data: {
      items: [
        { name: '泵房-A', status: 'online' },
        { name: '闸门-B', status: 'offline' },
      ],
    },
    snippet: {
      type: 'cards',
      source: '${items}',
      card: { header: { title: '${name}' }, body: [tpl('${status}')] },
    },
  },
  {
    type: 'carousel',
    label: 'Carousel 轮播图',
    snippet: {
      type: 'carousel',
      options: [
        { image: 'https://placehold.co/640x180/png?text=A' },
        { image: 'https://placehold.co/640x180/png?text=B' },
      ],
    },
  },
  {
    type: 'chart',
    label: 'Chart 图表',
    snippet: {
      type: 'chart',
      config: {
        title: { text: '示例' },
        xAxis: { type: 'category', data: ['A', 'B', 'C'] },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [3, 8, 5] }],
      },
    },
  },
  { type: 'code', label: 'Code 代码高亮', snippet: { type: 'code', language: 'json', value: '{ "ok": true }' } },
  { type: 'color', label: 'Color 颜色', snippet: { type: 'color', value: '#3b82f6' } },
  {
    type: 'date',
    label: 'Date 日期时间',
    snippet: {
      type: 'flex',
      items: [
        { type: 'date', value: '2026-10-21' },
        { type: 'datetime', value: '2026-10-21 10:30:00' },
        { type: 'time', value: '10:30:00' },
        { type: 'month', value: '2026-10' },
      ],
    },
  },
  {
    type: 'each',
    label: 'Each 循环渲染器',
    data: { items: [{ name: '甲' }, { name: '乙' }] },
    snippet: { type: 'each', source: '${items}', items: tpl('${name}') },
  },
  { type: 'html', label: 'Html', snippet: { type: 'html', html: '<em>html 直通</em>' } },
  { type: 'icon', label: 'Icon 图标', snippet: { type: 'icon', icon: 'fa fa-home' } },
  { type: 'iframe', label: 'iFrame', snippet: { type: 'iframe', src: 'https://example.com', height: 240 } },
  { type: 'image', label: 'Image 图片', snippet: { type: 'image', src: 'https://placehold.co/160x90', title: '示意图' } },
  {
    type: 'images',
    label: 'Images 图片集',
    snippet: {
      type: 'images',
      options: ['https://placehold.co/80x80/png?text=1', 'https://placehold.co/80x80/png?text=2'],
    },
  },
  {
    type: 'grid-nav',
    label: 'GridNav 宫格导航',
    snippet: {
      type: 'grid-nav',
      options: [
        { icon: 'fa fa-home', text: '首页', badge: 2 },
        { icon: 'fa fa-cog', text: '设置' },
      ],
    },
  },
  { type: 'json', label: 'Json', data: { payload: { pump: 'A-12', online: true } }, snippet: { type: 'json', source: '${payload}' } },
  { type: 'link', label: 'Link 链接', snippet: { type: 'link', href: '/', body: '返回首页' } },
  {
    type: 'list',
    label: 'List 列表',
    data: { items: [{ title: '泵房-A' }, { title: '闸门-B' }] },
    snippet: { type: 'list', source: '${items}', listItem: { title: '${title}' } },
  },
  { type: 'log', label: 'Log 实时日志', snippet: { type: 'log', source: '启动\n同步完成\n告警已确认' } },
  {
    type: 'mapping',
    label: 'Mapping 映射',
    data: { status: 'online' },
    snippet: { type: 'mapping', name: 'status', map: { online: '在线', offline: '离线' } },
  },
  { type: 'number', label: 'Number 展示', snippet: { type: 'number', value: 12345.6 } },
  { type: 'markdown', label: 'Markdown 渲染', snippet: { type: 'markdown', value: '## Markdown\n- 列表项' } },
  { type: 'office-viewer', label: 'OfficeViewer Word 渲染', snippet: { type: 'office-viewer', src: '/demo.docx' } },
  {
    type: 'office-viewer-excel',
    label: 'OfficeViewer Excel 渲染',
    snippet: { type: 'office-viewer', src: '/demo.xlsx', excelOptions: {} },
  },
  { type: 'pdf-viewer', label: 'PDFViewer 渲染', snippet: { type: 'pdf-viewer', src: '/demo.pdf' } },
  { type: 'progress', label: 'Progress 进度条', snippet: { type: 'progress', value: 64 } },
  {
    type: 'steps',
    label: 'Steps 步骤条',
    snippet: { type: 'steps', value: 1, steps: [{ title: '填写' }, { title: '确认' }, { title: '完成' }] },
  },
  {
    type: 'property',
    label: 'Property 属性表',
    snippet: {
      type: 'property',
      title: '属性',
      items: [
        { label: '名称', content: '泵房-A' },
        { label: '状态', content: '在线' },
      ],
    },
  },
  { type: 'qrcode', label: 'QRCode 二维码', snippet: { type: 'qrcode', value: 'vamis' } },
  { type: 'barcode', label: 'BarCode 条形码', snippet: { type: 'barcode', value: '123456789012' } },
  { type: 'remark', label: 'Remark 标记', snippet: { type: 'remark', content: '说明文字' } },
  { type: 'search-box', label: 'SearchBox 搜索框', snippet: { type: 'search-box', name: 'keywords', placeholder: '搜索' } },
  {
    type: 'sparkline',
    label: 'Sparkline 走势图',
    data: { spark: [3, 5, 2, 4, 1, 8, 3, 7] },
    snippet: { type: 'sparkline', name: 'spark' },
  },
  { type: 'status', label: 'Status 状态', snippet: { type: 'status', value: 'online' } },
  { type: 'tpl', label: 'Tpl 模板', snippet: tpl('Hello ${name|default:vamis}') },
  { type: 'tag', label: 'Tag 标签', snippet: { type: 'tag', label: '在线', color: 'success' } },
  { type: 'video', label: 'Video 视频', snippet: { type: 'video', src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' } },
  {
    type: 'timeline',
    label: 'Timeline 时间轴',
    snippet: {
      type: 'timeline',
      items: [
        { time: '2019-02-07', title: '数据开发' },
        { time: '2019-02-08', title: '上线' },
      ],
    },
  },
  { type: 'shape', label: 'Shape 形状', snippet: { type: 'shape', shapeType: 'circle' } },
  { type: 'slider', label: 'Slider 滑动条', snippet: { type: 'slider', value: 40 } },
]

const FEEDBACK: ComponentDef[] = [
  { type: 'alert', label: 'Alert 提示', snippet: { type: 'alert', title: '提示', body: '说明文字', level: 'info' } },
  {
    type: 'dialog',
    label: 'Dialog 对话框',
    snippet: {
      type: 'button',
      label: '打开对话框',
      actionType: 'dialog',
      dialog: { title: '对话框', body: { type: 'tpl', tpl: 'Dialog 内容' } },
    },
  },
  {
    type: 'drawer',
    label: 'Drawer 抽屉',
    snippet: {
      type: 'button',
      label: '打开抽屉',
      actionType: 'drawer',
      drawer: { title: '抽屉', body: { type: 'tpl', tpl: 'Drawer 内容' } },
    },
  },
  { type: 'spinner', label: 'Spinner 加载中', snippet: { type: 'spinner', show: true } },
  {
    type: 'toast',
    label: 'Toast 轻提示',
    subTitle: '动作 actionType: toast，不是独立 type',
    snippet: { type: 'button', label: '弹出 Toast', actionType: 'toast', msg: '轻提示' },
  },
]

const OTHER: ComponentDef[] = [
  { type: 'avatar', label: 'Avatar 头像', snippet: { type: 'avatar', src: 'https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg' } },
  { type: 'audio', label: 'Audio 音频', snippet: { type: 'audio', src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3' } },
  {
    type: 'tasks',
    label: 'Tasks 任务操作集合',
    data: {
      tasks: [
        { title: '巡检', status: 'success' },
        { title: '告警', status: 'pending' },
      ],
    },
    snippet: { type: 'tasks', name: 'tasks' },
  },
  {
    type: 'badge',
    label: 'Badge 角标',
    subTitle: '属性 badge，不是独立 type',
    snippet: {
      type: 'grid-nav',
      options: [
        { icon: 'fa fa-bell', text: '消息', badge: 3 },
        { icon: 'fa fa-user', text: '我的' },
      ],
    },
  },
  {
    type: 'wizard',
    label: 'Wizard 向导',
    snippet: {
      type: 'wizard',
      steps: [
        { title: '步骤 1', body: [{ type: 'input-text', name: 'name', label: '名称' }] },
        { title: '步骤 2', body: [tpl('确认提交')] },
      ],
    },
  },
  { type: 'web-component', label: 'Web Component', snippet: { type: 'web-component', tag: 'div', props: { class: 'text-sm' } } },
  {
    type: 'amis',
    label: 'amis 渲染器',
    snippet: { type: 'amis', schema: { type: 'tpl', tpl: '内层 schema' } },
  },
]

export const componentGroups: CatalogGroup[] = [
  group('layout', '布局', LAYOUT),
  group('feature', '功能', FEATURE),
  group('input', '数据输入', INPUT),
  group('display', '数据展示', DISPLAY),
  group('feedback', '反馈', FEEDBACK),
  group('other', '其他', OTHER),
]

export const componentLeaves: CatalogLeaf[] = componentGroups.flatMap((item) => item.children)
