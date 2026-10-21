import type { SchemaObject } from '@vamis/core'

export interface PaletteItem {
  type: string
  label: string
  snippet: SchemaObject
}

export interface PaletteGroup {
  title: string
  items: PaletteItem[]
}

export const PALETTE_MIME = 'application/x-vamis-type'
export const TREE_MIME = 'application/x-vamis-tree-path'

export const paletteGroups: PaletteGroup[] = [
  {
    title: '布局',
    items: [
      { type: 'tpl', label: '文本', snippet: { type: 'tpl', tpl: '文本内容' } },
      { type: 'container', label: '容器', snippet: { type: 'container', body: [] } },
      { type: 'panel', label: '面板', snippet: { type: 'panel', title: '面板', body: [] } },
      { type: 'wrapper', label: '包裹', snippet: { type: 'wrapper', body: [] } },
      { type: 'flex', label: 'Flex', snippet: { type: 'flex', items: [{ type: 'tpl', tpl: '列' }] } },
      { type: 'tabs', label: 'Tabs', snippet: { type: 'tabs', tabs: [{ title: 'Tab 1', body: [{ type: 'tpl', tpl: '内容' }] }] } },
      { type: 'divider', label: '分割线', snippet: { type: 'divider' } },
      { type: 'alert', label: '提示', snippet: { type: 'alert', title: '提示', body: '说明文字' } },
      { type: 'wizard', label: '向导', snippet: { type: 'wizard', steps: [{ title: '步骤 1', body: [{ type: 'tpl', tpl: '第一步' }] }] } },
    ],
  },
  {
    title: '表单',
    items: [
      { type: 'form', label: '表单', snippet: { type: 'form', title: '表单', body: [] } },
      { type: 'input-text', label: '单行文本', snippet: { type: 'input-text', name: 'field', label: '字段' } },
      { type: 'textarea', label: '多行', snippet: { type: 'textarea', name: 'remark', label: '备注' } },
      { type: 'input-number', label: '数字', snippet: { type: 'input-number', name: 'count', label: '数量' } },
      { type: 'select', label: '下拉', snippet: { type: 'select', name: 'status', label: '状态', options: [{ label: '启用', value: 'on' }] } },
      { type: 'checkbox', label: '勾选', snippet: { type: 'checkbox', name: 'agree', label: '同意' } },
      { type: 'switch', label: '开关', snippet: { type: 'switch', name: 'enabled', label: '启用' } },
      { type: 'input-date', label: '日期', snippet: { type: 'input-date', name: 'date', label: '日期' } },
      { type: 'input-date-range', label: '日期区间', snippet: { type: 'input-date-range', name: 'range', label: '区间' } },
      { type: 'combo', label: '组合', snippet: { type: 'combo', name: 'items', label: '组合', multiple: true, items: [{ type: 'input-text', name: 'label', label: '项' }] } },
      { type: 'input-table', label: '表格录入', snippet: { type: 'input-table', name: 'rows', label: '表格', columns: [{ type: 'input-text', name: 'name', label: '名称' }] } },
      { type: 'transfer', label: '穿梭器', snippet: { type: 'transfer', name: 'picked', label: '穿梭', options: [{ label: '甲', value: 'a' }, { label: '乙', value: 'b' }] } },
      { type: 'tree-select', label: '树选择', snippet: { type: 'tree-select', name: 'tree', label: '树', options: [{ label: '华东', children: [{ label: '上海', value: 'sh' }] }] } },
      { type: 'nested-select', label: '级联', snippet: { type: 'nested-select', name: 'region', label: '级联', options: [{ label: '华北', children: [{ label: '北京', value: 'bj' }] }] } },
      { type: 'input-tree', label: '树', snippet: { type: 'input-tree', name: 'dept', label: '部门', options: [{ label: '研发', children: [{ label: '前端', value: 'fe' }] }] } },
      { type: 'input-file', label: '文件', snippet: { type: 'input-file', name: 'file', label: '文件' } },
      { type: 'input-image', label: '图片上传', snippet: { type: 'input-image', name: 'photo', label: '图片' } },
    ],
  },
  {
    title: '展示',
    items: [
      { type: 'image', label: '图片', snippet: { type: 'image', src: 'https://placehold.co/160x90', title: '示意图' } },
      { type: 'nav', label: '导航', snippet: { type: 'nav', stacked: false, links: [{ label: '首页', to: '/' }, { label: '编辑器', to: '/editor' }] } },
      { type: 'breadcrumb', label: '面包屑', snippet: { type: 'breadcrumb', items: [{ label: '首页', href: '/' }, { label: '当前' }] } },
      { type: 'collapse-group', label: '折叠', snippet: { type: 'collapse-group', body: [{ type: 'collapse', title: '分组', body: [{ type: 'tpl', tpl: '内容' }] }] } },
      { type: 'progress', label: '进度', snippet: { type: 'progress', value: 64 } },
      { type: 'status', label: '状态', snippet: { type: 'status', value: 'online' } },
      { type: 'mapping', label: '映射', snippet: { type: 'mapping', name: 'status', map: { online: '在线', offline: '离线' } } },
      { type: 'steps', label: '步骤条', snippet: { type: 'steps', value: 1, steps: [{ title: '填写' }, { title: '确认' }] } },
      { type: 'chart', label: '图表', snippet: { type: 'chart', config: { title: { text: '示例' }, xAxis: { type: 'category', data: ['A', 'B'] }, yAxis: { type: 'value' }, series: [{ type: 'bar', data: [3, 8] }] } } },
    ],
  },
  {
    title: '动作 / 数据',
    items: [
      { type: 'button', label: '按钮', snippet: { type: 'button', label: '按钮', actionType: 'toast', msg: '已点击' } },
      { type: 'button-group', label: '按钮组', snippet: { type: 'button-group', buttons: [{ type: 'button', label: 'A' }, { type: 'button', label: 'B' }] } },
      { type: 'button-toolbar', label: '工具条', snippet: { type: 'button-toolbar', buttons: [{ type: 'button', label: '保存' }, { type: 'button', label: '取消' }] } },
      { type: 'crud', label: 'CRUD', snippet: { type: 'crud', name: 'list', api: '/api/mock2/sample', columns: [{ name: 'id', label: 'ID' }, { name: 'engine', label: '渲染引擎' }, { name: 'browser', label: 'Browser' }] } },
      { type: 'each', label: '循环', snippet: { type: 'each', source: '${items}', items: { type: 'tpl', tpl: '${name}' } } },
      { type: 'search-box', label: '搜索', snippet: { type: 'search-box', name: 'keywords', placeholder: '搜索' } },
      { type: 'dropdown-button', label: '下拉按钮', snippet: { type: 'dropdown-button', label: '更多', buttons: [{ type: 'button', label: '编辑' }] } },
      { type: 'remark', label: '备注', snippet: { type: 'remark', content: '说明' } },
    ],
  },
  {
    title: 'Amis 补齐',
    items: [
      { type: 'property', label: '属性表', snippet: { type: 'property', title: '属性', items: [{ label: '名称', content: '示例' }] } },
      { type: 'input-rating', label: '评分', snippet: { type: 'input-rating', name: 'score', label: '评分' } },
      { type: 'button-group-select', label: '按钮组选择', snippet: { type: 'button-group-select', name: 'level', label: '级别', options: [{ label: '低', value: 'low' }, { label: '高', value: 'high' }] } },
      { type: 'input-city', label: '城市', snippet: { type: 'input-city', name: 'city', label: '城市' } },
      { type: 'uuid', label: 'UUID', snippet: { type: 'uuid', name: 'uid', label: 'UUID' } },
      { type: 'list-select', label: '列表选择', snippet: { type: 'list-select', name: 'item', label: '列表', options: ['A', 'B'] } },
    ],
  },
]

export function snippetByType(type: string): SchemaObject | null {
  for (const group of paletteGroups) {
    const item = group.items.find((entry) => entry.type === type)
    if (item) return JSON.parse(JSON.stringify(item.snippet))
  }
  return { type }
}
