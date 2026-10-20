import type { SchemaObject } from '@varmis/core'

export interface PaletteItem {
  type: string
  label: string
  snippet: SchemaObject
}

export interface PaletteGroup {
  title: string
  items: PaletteItem[]
}

export const PALETTE_MIME = 'application/x-varmis-type'

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
    ],
  },
  {
    title: '动作 / 数据',
    items: [
      { type: 'button', label: '按钮', snippet: { type: 'button', label: '按钮', actionType: 'toast', msg: '已点击' } },
      { type: 'button-group', label: '按钮组', snippet: { type: 'button-group', buttons: [{ type: 'button', label: 'A' }, { type: 'button', label: 'B' }] } },
      { type: 'crud', label: 'CRUD', snippet: { type: 'crud', name: 'list', api: '/api/mock2/sample', columns: [{ name: 'id', label: 'ID' }, { name: 'name', label: '名称' }] } },
      { type: 'each', label: '循环', snippet: { type: 'each', source: '${items}', items: { type: 'tpl', tpl: '${name}' } } },
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
