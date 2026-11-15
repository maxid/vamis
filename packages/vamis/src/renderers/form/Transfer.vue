<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Button, VamisCaret } from '@vamis/ui'
import {
  isApiOutdated,
  isEffectiveApi,
  requestApi,
  resolveValue,
  useEnv,
  type SchemaObject,
} from '@vamis/core'
import { useFieldValue, useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import {
  dumpJoined,
  flattenOptions,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
} from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const fieldApi = useFieldValue()
const env = useEnv()
const remoteOptions = ref<unknown[] | null>(null)
const rawOptions = computed(() => normalizeOptions(remoteOptions.value ?? props.schema.options))
const options = computed(() => flattenOptions(rawOptions.value))
type TreeRow = { key: string; label: string; value?: unknown; depth: number; children: TreeRow[] }
const expandedTree = ref<Set<string>>(new Set())

function buildTree(nodes: any[], depth = 0, prefix = ''): TreeRow[] {
  return (nodes || []).map((node, index) => {
    const key = `${prefix}${index}`
    const children = Array.isArray(node.children) ? buildTree(node.children, depth + 1, `${key}-`) : []
    return { key, label: String(node.label ?? node.value ?? ''), value: node.value, depth, children }
  })
}

const treeRows = computed(() => buildTree(rawOptions.value as any[]))
function treeExpandable(node: TreeRow) { return node.children.length > 0 }
function treeIsExpanded(node: TreeRow) { return expandedTree.value.has(node.key) }
function toggleTree(node: TreeRow) {
  const next = new Set(expandedTree.value)
  if (next.has(node.key)) next.delete(node.key)
  else next.add(node.key)
  expandedTree.value = next
}
function treeOnClick(node: TreeRow) {
  if (treeExpandable(node)) toggleTree(node)
  else if (node.value != null) add(node.value)
}
function treeVisible(nodes: TreeRow[]): TreeRow[] {
  const q = leftQuery.value.trim().toLowerCase()
  const out: TreeRow[] = []
  for (const node of nodes) {
    const children = treeVisible(node.children)
    const matches = !q || node.label.toLowerCase().includes(q)
    if (matches) out.push({ ...node, children })
    else if (children.length) out.push({ ...node, children })
  }
  return out
}
function treeDisplay(node: TreeRow): boolean {
  if (leftQuery.value.trim()) return true
  if (node.depth === 0) return true
  const parentKey = node.key.split('-').slice(0, -1).join('-')
  return expandedTree.value.has(parentKey)
}
const selected = computed({
  get: () => parseJoined(props.schema.name ? fieldApi.getValue(props.schema.name) : '', true, props.schema.joinValues !== false),
  set: (values: unknown[]) => props.schema.name && fieldApi.setValue(props.schema.name, dumpJoined(values, true, props.schema.joinValues !== false)),
})
const mode = computed(() => String(props.schema.mode || 'list'))
const searchable = computed(() => props.schema.searchable === true)
const leftQuery = ref('')
function treeDepth(item: { label?: unknown }) {
  if (mode.value !== 'tree') return 0
  return Math.max(0, String(item.label || '').split(' / ').length - 1)
}
const rightQuery = ref('')
function matched(item: { label?: unknown }, query: string) {
  if (!query) return true
  return String(item.label ?? '').toLowerCase().includes(query.toLowerCase())
}
const left = computed(() => options.value.filter((item) => !selected.value.some((value) => optionValuesEqual(value, item.value))))
const right = computed(() => options.value.filter((item) => selected.value.some((value) => optionValuesEqual(value, item.value))))
const leftShown = computed(() => left.value.filter((item) => matched(item, leftQuery.value)))
const rightShown = computed(() => right.value.filter((item) => matched(item, rightQuery.value)))
const leftTitle = computed(() => String(props.schema.leftTitle || ''))
const rightTitle = computed(() => String(props.schema.rightTitle || ''))
const searchPlaceholder = computed(() => String(props.schema.searchPlaceholder || '搜索'))

function add(value: unknown) {
  selected.value = [...selected.value, value]
}
function remove(value: unknown) {
  selected.value = selected.value.filter((item) => !optionValuesEqual(item, value))
}
function addAll() {
  selected.value = options.value.map((item) => item.value)
}
function clear() {
  selected.value = []
}
async function loadSource() {
  const source = props.schema.source
  if (!source) return
  if (typeof source === 'string' && source.trim().startsWith('$')) {
    const resolved = resolveValue(source, props.schema.data || {})
    if (Array.isArray(resolved)) remoteOptions.value = resolved
    return
  }
  if (!isEffectiveApi(source, props.schema.data || {})) return
  try {
    const result = await requestApi(source, { env, data: props.schema.data || {}, reason: 'init' })
    if (result.skipped || !result.ok) return
    const payload = result.data || {}
    const list = Array.isArray(payload) ? payload : payload.options ?? payload.items ?? payload.records ?? payload
    if (Array.isArray(list)) remoteOptions.value = list
  } catch {
    /* 保留空选项 */
  }
}

onMounted(() => void loadSource())
watch(
  () => [props.schema.source, props.schema.data] as const,
  (curr, prev) => {
    if (!prev) return
    if (isApiOutdated(prev[0], curr[0], prev[1] || {}, curr[1] || {})) void loadSource()
  },
  { deep: true },
)
</script>

<template>
  <FormItem :schema="schema">
    <div class="grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
      <div class="space-y-1">
        <p v-if="leftTitle" class="text-xs text-muted-foreground">{{ leftTitle }}</p>
        <input v-if="searchable" v-model="leftQuery" class="vamis-input h-8 w-full rounded-md border px-2 text-sm" :placeholder="searchPlaceholder" />
        <ul v-if="mode === 'tree'" class="max-h-48 overflow-auto rounded-md border p-2 text-sm">
          <li v-for="node in treeVisible(treeRows)" v-show="treeDisplay(node)" :key="node.key">
            <button
              type="button"
              class="w-full rounded px-2 py-1 text-left hover:bg-accent"
              :style="{ paddingLeft: `${8 + node.depth * 12}px` }"
              :disabled="disabled"
              @click="treeOnClick(node)"
            >
              <VamisCaret v-if="treeExpandable(node)" variant="tree" :open="treeIsExpanded(node)" class="vamis-transfer__tree-caret" />
              {{ node.label }}
            </button>
          </li>
        </ul>
        <table v-else-if="mode === 'table'" class="w-full border-collapse text-sm">
          <thead><tr class="border-b"><th class="px-2 py-1 text-left">名称</th><th class="px-2 py-1 text-left">值</th></tr></thead>
          <tbody>
            <tr v-for="item in leftShown" :key="String(item.value)" class="cursor-pointer hover:bg-accent" @click="add(item.value)">
              <td class="px-2 py-1" :style="{ paddingLeft: `${8 + treeDepth(item) * 12}px` }">{{ item.label }}</td>
              <td class="px-2 py-1 text-muted-foreground">{{ item.value }}</td>
            </tr>
            <tr v-if="!leftShown.length"><td colspan="2" class="px-2 py-4 text-center text-xs text-muted-foreground">无候选</td></tr>
          </tbody>
        </table>
        <ul v-else class="max-h-48 overflow-auto rounded-md border p-2 text-sm">
        <li v-for="item in leftShown" :key="String(item.value)">
          <button type="button" class="w-full rounded px-2 py-1 text-left hover:bg-accent" :style="{ paddingLeft: `${8 + treeDepth(item) * 12}px` }" :disabled="disabled" @click="add(item.value)">
            {{ item.label }}
          </button>
        </li>
        <li v-if="!leftShown.length" class="px-2 py-4 text-xs text-muted-foreground">无候选</li>
        </ul>
      </div>
      <div class="flex flex-col justify-center gap-1">
        <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="addAll">全部 &gt;</Button>
        <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="clear">&lt; 清空</Button>
      </div>
      <div class="space-y-1">
        <p v-if="rightTitle" class="text-xs text-muted-foreground">{{ rightTitle }}</p>
        <input v-if="searchable" v-model="rightQuery" class="vamis-input h-8 w-full rounded-md border px-2 text-sm" :placeholder="searchPlaceholder" />
        <table v-if="mode === 'table'" class="w-full border-collapse text-sm">
          <thead><tr class="border-b"><th class="px-2 py-1 text-left">名称</th><th class="px-2 py-1 text-left">值</th></tr></thead>
          <tbody>
            <tr v-for="item in rightShown" :key="String(item.value)" class="cursor-pointer hover:bg-accent" @click="remove(item.value)">
              <td class="px-2 py-1" :style="{ paddingLeft: `${8 + treeDepth(item) * 12}px` }">{{ item.label }}</td>
              <td class="px-2 py-1 text-muted-foreground">{{ item.value }}</td>
            </tr>
            <tr v-if="!rightShown.length"><td colspan="2" class="px-2 py-4 text-center text-xs text-muted-foreground">未选择</td></tr>
          </tbody>
        </table>
        <ul v-else class="max-h-48 overflow-auto rounded-md border p-2 text-sm">
        <li v-for="item in rightShown" :key="String(item.value)">
          <button type="button" class="w-full rounded px-2 py-1 text-left hover:bg-accent" :style="{ paddingLeft: `${8 + treeDepth(item) * 12}px` }" :disabled="disabled" @click="remove(item.value)">
            {{ item.label }}
          </button>
        </li>
        <li v-if="!rightShown.length" class="px-2 py-4 text-xs text-muted-foreground">未选择</li>
        </ul>
      </div>
    </div>
  </FormItem>
</template>
