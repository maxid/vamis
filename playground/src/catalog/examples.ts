import { jsonToIr, yamlFromIr } from '@vamis/core'
import { yamlSamples } from '../samples'
import amisForm from '../examples/amis-form.json?raw'
import type { CatalogGroup, CatalogLeaf } from './types'

interface ExampleRef {
  file: string
  label: string
  yaml?: string
}

interface ExampleGroupDef {
  id: string
  label: string
  items: ExampleRef[]
}

const yamlByFile = new Map(yamlSamples.map((item) => [item.file, item]))

const amisFormYaml = yamlFromIr(jsonToIr(JSON.parse(amisForm)))

/** 对齐 amis-r/examples/components/Example.jsx 侧栏分类，叶子用现有 playground yaml。 */
const EXAMPLE_DEFS: ExampleGroupDef[] = [
  {
    id: 'page',
    label: '页面',
    items: [{ file: 'form-page.yaml', label: '表单页面' }],
  },
  {
    id: 'form',
    label: '表单',
    items: [
      { file: 'validation-page.yaml', label: '表单验证' },
      { file: 'combo-form.yaml', label: '组合类型' },
      { file: 'pickers-page.yaml', label: '穿梭器与树选择' },
      { file: 'form-extra.yaml', label: '表单扩展控件' },
      { file: 'amis-semantic.yaml', label: '表单语义加深' },
      { file: 'amis-form.json', label: 'Amis JSON 表单', yaml: amisFormYaml },
    ],
  },
  {
    id: 'crud',
    label: '增删改查',
    items: [
      { file: 'crud-page.yaml', label: '表格模式' },
      { file: 'crud-extra.yaml', label: 'CRUD 进阶' },
    ],
  },
  {
    id: 'event',
    label: '事件动作机制',
    items: [{ file: 'events-page.yaml', label: '刷新与筛选联动' }],
  },
  {
    id: 'wizard',
    label: '向导',
    items: [{ file: 'wizard-page.yaml', label: '向导分步表单' }],
  },
  {
    id: 'layout',
    label: '排版',
    items: [{ file: 'layout-extra.yaml', label: '布局与导航' }],
  },
  {
    id: 'display',
    label: '展示',
    items: [
      { file: 'widgets-page.yaml', label: '展示类控件' },
      { file: 'display-extra.yaml', label: '展示与富媒体' },
    ],
  },
  {
    id: 'rest',
    label: '其他',
    items: [{ file: 'amis-rest.yaml', label: 'Amis 补齐控件' }],
  },
]

function toLeaf(item: ExampleRef): CatalogLeaf | null {
  const yaml = item.yaml ?? yamlByFile.get(item.file)?.yaml
  if (!yaml) return null
  const id = item.file.replace(/\.(ya?ml|json)$/i, '')
  return {
    id: `example:${id}`,
    label: item.label,
    yaml,
    searchable: `${item.label} ${item.file}`.toLowerCase(),
    kind: 'example',
  }
}

export const exampleGroups: CatalogGroup[] = EXAMPLE_DEFS.map((group) => ({
  id: group.id,
  label: group.label,
  children: group.items.map(toLeaf).filter((item): item is CatalogLeaf => item != null),
})).filter((group) => group.children.length > 0)

const categorized = new Set(
  EXAMPLE_DEFS.flatMap((group) => group.items.map((item) => item.file)),
)

const leftover = yamlSamples.filter((item) => !categorized.has(item.file))
if (leftover.length) {
  exampleGroups.push({
    id: 'more',
    label: '未分组',
    children: leftover.map((item) => ({
      id: `example:${item.id}`,
      label: item.label,
      yaml: item.yaml,
      searchable: `${item.label} ${item.file}`.toLowerCase(),
      kind: 'example' as const,
    })),
  })
}

export const exampleLeaves: CatalogLeaf[] = exampleGroups.flatMap((item) => item.children)

export const defaultExample = exampleLeaves.find((item) => item.id === 'example:form-page') || exampleLeaves[0]
