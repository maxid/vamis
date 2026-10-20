export type PropControl = 'text' | 'textarea' | 'number' | 'boolean' | 'select'
export type EventActionType = 'toast' | 'ajax' | 'dialog' | 'drawer' | 'setValue' | 'reload'

export interface PropField {
  key: string
  label: string
  control: PropControl
  options?: { label: string; value: string }[]
}

const INPUT_TEXT_FIELDS: PropField[] = [
  { key: 'name', label: 'name', control: 'text' },
  { key: 'label', label: 'label', control: 'text' },
  { key: 'placeholder', label: 'placeholder', control: 'text' },
  { key: 'description', label: 'description', control: 'text' },
  { key: 'required', label: 'required', control: 'boolean' },
  { key: 'disabled', label: 'disabled', control: 'boolean' },
  { key: 'validations', label: 'validations', control: 'text' },
]

export const typeProps: Record<string, PropField[]> = {
  page: [
    { key: 'title', label: 'title', control: 'text' },
    { key: 'subTitle', label: 'subTitle', control: 'text' },
    { key: 'initApi', label: 'initApi', control: 'text' },
    { key: 'asideResizor', label: 'asideResizor', control: 'boolean' },
  ],
  form: [
    { key: 'title', label: 'title', control: 'text' },
    { key: 'name', label: 'name', control: 'text' },
    { key: 'api', label: 'api', control: 'text' },
    { key: 'initApi', label: 'initApi', control: 'text' },
    {
      key: 'mode',
      label: 'mode',
      control: 'select',
      options: [
        { label: 'normal', value: 'normal' },
        { label: 'horizontal', value: 'horizontal' },
        { label: 'inline', value: 'inline' },
      ],
    },
    { key: 'submitText', label: 'submitText', control: 'text' },
    { key: 'wrapWithPanel', label: 'wrapWithPanel', control: 'boolean' },
    { key: 'reset', label: 'reset', control: 'boolean' },
  ],
  'input-text': INPUT_TEXT_FIELDS,
  'input-email': INPUT_TEXT_FIELDS,
  'input-password': INPUT_TEXT_FIELDS,
  'input-url': INPUT_TEXT_FIELDS,
  textarea: INPUT_TEXT_FIELDS,
  select: [
    { key: 'name', label: 'name', control: 'text' },
    { key: 'label', label: 'label', control: 'text' },
    { key: 'placeholder', label: 'placeholder', control: 'text' },
    { key: 'source', label: 'source', control: 'text' },
    { key: 'multiple', label: 'multiple', control: 'boolean' },
    { key: 'searchable', label: 'searchable', control: 'boolean' },
    { key: 'clearable', label: 'clearable', control: 'boolean' },
    { key: 'joinValues', label: 'joinValues', control: 'boolean' },
  ],
  table: [
    { key: 'title', label: 'title', control: 'text' },
    { key: 'source', label: 'source', control: 'text' },
    { key: 'affixHeader', label: 'affixHeader', control: 'boolean' },
  ],
  crud: [
    { key: 'name', label: 'name', control: 'text' },
    { key: 'api', label: 'api', control: 'text' },
    { key: 'source', label: 'source', control: 'text' },
    { key: 'perPage', label: 'perPage', control: 'number' },
    { key: 'syncLocation', label: 'syncLocation', control: 'boolean' },
    { key: 'alwaysShowPagination', label: 'alwaysShowPagination', control: 'boolean' },
  ],
  wizard: [
    { key: 'name', label: 'name', control: 'text' },
    { key: 'api', label: 'api', control: 'text' },
    { key: 'mode', label: 'mode', control: 'select', options: [
      { label: 'horizontal', value: 'horizontal' },
      { label: 'vertical', value: 'vertical' },
    ] },
    { key: 'startStep', label: 'startStep', control: 'number' },
  ],
  image: [
    { key: 'src', label: 'src', control: 'text' },
    { key: 'title', label: 'title', control: 'text' },
    { key: 'caption', label: 'caption', control: 'text' },
    { key: 'name', label: 'name', control: 'text' },
  ],
  collapse: [
    { key: 'title', label: 'title / header', control: 'text' },
    { key: 'header', label: 'header', control: 'text' },
    { key: 'collapsed', label: 'collapsed', control: 'boolean' },
    { key: 'active', label: 'active', control: 'boolean' },
  ],
  'collapse-group': [
    { key: 'accordion', label: 'accordion', control: 'boolean' },
    { key: 'activeKey', label: 'activeKey', control: 'text' },
  ],
  nav: [
    { key: 'stacked', label: 'stacked', control: 'boolean' },
    {
      key: 'mode',
      label: 'mode',
      control: 'select',
      options: [
        { label: 'horizontal', value: 'horizontal' },
        { label: 'vertical', value: 'vertical' },
      ],
    },
  ],
  transfer: [
    { key: 'name', label: 'name', control: 'text' },
    { key: 'label', label: 'label', control: 'text' },
    { key: 'searchable', label: 'searchable', control: 'boolean' },
    { key: 'joinValues', label: 'joinValues', control: 'boolean' },
    { key: 'source', label: 'source', control: 'text' },
  ],
  'tree-select': [
    { key: 'name', label: 'name', control: 'text' },
    { key: 'label', label: 'label', control: 'text' },
    { key: 'multiple', label: 'multiple', control: 'boolean' },
    { key: 'searchable', label: 'searchable', control: 'boolean' },
    { key: 'joinValues', label: 'joinValues', control: 'boolean' },
    { key: 'placeholder', label: 'placeholder', control: 'text' },
  ],
  'nested-select': [
    { key: 'name', label: 'name', control: 'text' },
    { key: 'label', label: 'label', control: 'text' },
    { key: 'placeholder', label: 'placeholder', control: 'text' },
    { key: 'onlyLeaf', label: 'onlyLeaf', control: 'boolean' },
  ],
  chart: [
    { key: 'name', label: 'name', control: 'text' },
    { key: 'api', label: 'api', control: 'text' },
    { key: 'height', label: 'height', control: 'text' },
  ],
  progress: [
    { key: 'name', label: 'name', control: 'text' },
    { key: 'value', label: 'value', control: 'number' },
    { key: 'showLabel', label: 'showLabel', control: 'boolean' },
  ],
  mapping: [
    { key: 'name', label: 'name', control: 'text' },
    { key: 'value', label: 'value', control: 'text' },
  ],
  cards: [
    { key: 'source', label: 'source', control: 'text' },
    { key: 'title', label: 'title', control: 'text' },
  ],
  list: [
    { key: 'source', label: 'source', control: 'text' },
    { key: 'placeholder', label: 'placeholder', control: 'text' },
  ],
}

const COLUMN_FIELDS: PropField[] = [
  { key: 'name', label: 'column name', control: 'text' },
  { key: 'label', label: 'column label', control: 'text' },
  { key: 'type', label: 'column type', control: 'text' },
  { key: 'sortable', label: 'sortable', control: 'boolean' },
  { key: 'searchable', label: 'searchable', control: 'boolean' },
]

const ALIAS_PANEL: Record<string, string> = {
  'static-table': 'table',
  'multi-select': 'select',
}

function isColumnLike(type: string | undefined, schema?: Record<string, unknown> | null): boolean {
  if (!schema) return false
  if (type === 'operation') return true
  return !type && typeof schema.name === 'string' && (schema.label != null || schema.sortable != null)
}

export function fieldsForType(type?: string, schema?: Record<string, unknown> | null): PropField[] {
  if (type) {
    const mapped = ALIAS_PANEL[type] || type
    if (typeProps[mapped]) return typeProps[mapped]
  }
  if (isColumnLike(type, schema)) return COLUMN_FIELDS
  return []
}
