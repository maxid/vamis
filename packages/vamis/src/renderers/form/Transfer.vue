<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
const VIRTUAL_ITEM_HEIGHT = 38
const VIRTUAL_VIEWPORT_HEIGHT = 258
const VIRTUAL_BUFFER = 3
const virtualThreshold = computed(() => {
  const value = Number(props.schema.virtualThreshold)
  return Number.isFinite(value) && value >= 0 ? value : 100
})
const virtualItemHeight = computed(() => {
  const value = Number(props.schema.itemHeight)
  return Number.isFinite(value) && value > 0 ? value : VIRTUAL_ITEM_HEIGHT
})
const leftListEl = ref<HTMLElement | null>(null)
const rightListEl = ref<HTMLElement | null>(null)
const leftTableEl = ref<HTMLElement | null>(null)
const rightTableEl = ref<HTMLElement | null>(null)
const leftScrollTop = ref(0)
const rightScrollTop = ref(0)
const leftTableScrollTop = ref(0)
const rightTableScrollTop = ref(0)
const leftViewportHeight = ref(VIRTUAL_VIEWPORT_HEIGHT)
const rightViewportHeight = ref(VIRTUAL_VIEWPORT_HEIGHT)
const leftTableViewportHeight = ref(VIRTUAL_VIEWPORT_HEIGHT)
const rightTableViewportHeight = ref(VIRTUAL_VIEWPORT_HEIGHT)
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

function virtualWindow(
  rows: Array<{ label?: unknown; value?: unknown }>,
  scrollTop: number,
  viewportHeight: number,
  targetMode: 'list' | 'table',
) {
  const enabled = mode.value === targetMode && rows.length > virtualThreshold.value
  if (!enabled) {
    return {
      enabled,
      rows,
      start: 0,
      lead: 0,
      trail: 0,
    }
  }
  const itemHeight = virtualItemHeight.value
  const start = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - VIRTUAL_BUFFER,
  )
  const end = Math.min(
    rows.length,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + VIRTUAL_BUFFER,
  )
  return {
    enabled,
    rows: rows.slice(start, end),
    start,
    lead: start * itemHeight,
    trail: Math.max(0, (rows.length - end) * itemHeight),
  }
}

const leftWindow = computed(() =>
  virtualWindow(leftShown.value, leftScrollTop.value, leftViewportHeight.value, 'list'),
)
const rightWindow = computed(() =>
  virtualWindow(rightShown.value, rightScrollTop.value, rightViewportHeight.value, 'list'),
)
const leftTableWindow = computed(() =>
  virtualWindow(
    leftShown.value,
    leftTableScrollTop.value,
    leftTableViewportHeight.value,
    'table',
  ),
)
const rightTableWindow = computed(() =>
  virtualWindow(
    rightShown.value,
    rightTableScrollTop.value,
    rightTableViewportHeight.value,
    'table',
  ),
)

function onLeftScroll(event: Event) {
  const el = event.currentTarget as HTMLElement
  leftScrollTop.value = el.scrollTop
  if (el.clientHeight > 0) leftViewportHeight.value = el.clientHeight
}

function onRightScroll(event: Event) {
  const el = event.currentTarget as HTMLElement
  rightScrollTop.value = el.scrollTop
  if (el.clientHeight > 0) rightViewportHeight.value = el.clientHeight
}

function onLeftTableScroll(event: Event) {
  const el = event.currentTarget as HTMLElement
  leftTableScrollTop.value = el.scrollTop
  if (el.clientHeight > 0) leftTableViewportHeight.value = el.clientHeight
}

function onRightTableScroll(event: Event) {
  const el = event.currentTarget as HTMLElement
  rightTableScrollTop.value = el.scrollTop
  if (el.clientHeight > 0) rightTableViewportHeight.value = el.clientHeight
}

function measureVirtualViewports() {
  if (leftListEl.value?.clientHeight) {
    leftViewportHeight.value = leftListEl.value.clientHeight
  }
  if (rightListEl.value?.clientHeight) {
    rightViewportHeight.value = rightListEl.value.clientHeight
  }
  if (leftTableEl.value?.clientHeight) {
    leftTableViewportHeight.value = leftTableEl.value.clientHeight
  }
  if (rightTableEl.value?.clientHeight) {
    rightTableViewportHeight.value = rightTableEl.value.clientHeight
  }
}

let listResizeObserver: ResizeObserver | undefined

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

onMounted(() => {
  void loadSource()
  void nextTick(() => {
    measureVirtualViewports()
    if (typeof ResizeObserver !== 'undefined') {
      listResizeObserver = new ResizeObserver(measureVirtualViewports)
      if (leftListEl.value) listResizeObserver.observe(leftListEl.value)
      if (rightListEl.value) listResizeObserver.observe(rightListEl.value)
      if (leftTableEl.value) listResizeObserver.observe(leftTableEl.value)
      if (rightTableEl.value) listResizeObserver.observe(rightTableEl.value)
    }
  })
})
onBeforeUnmount(() => listResizeObserver?.disconnect())
watch(
  () => [props.schema.source, props.schema.data] as const,
  (curr, prev) => {
    if (!prev) return
    if (isApiOutdated(prev[0], curr[0], prev[1] || {}, curr[1] || {})) void loadSource()
  },
  { deep: true },
)
watch(
  () => [mode.value, leftShown.value.length, rightShown.value.length] as const,
  async ([nextMode, nextLeftLength, nextRightLength], [prevMode, prevLeftLength, prevRightLength]) => {
    await nextTick()
    const left = leftListEl.value
    const right = rightListEl.value
    const leftTable = leftTableEl.value
    const rightTable = rightTableEl.value
    if (!leftWindow.value.enabled || nextMode !== prevMode || nextLeftLength < prevLeftLength) {
      leftScrollTop.value = 0
      if (left) left.scrollTop = 0
    }
    if (!rightWindow.value.enabled || nextMode !== prevMode || nextRightLength < prevRightLength) {
      rightScrollTop.value = 0
      if (right) right.scrollTop = 0
    }
    if (
      !leftTableWindow.value.enabled ||
      nextMode !== prevMode ||
      nextLeftLength < prevLeftLength
    ) {
      leftTableScrollTop.value = 0
      if (leftTable) leftTable.scrollTop = 0
    }
    if (
      !rightTableWindow.value.enabled ||
      nextMode !== prevMode ||
      nextRightLength < prevRightLength
    ) {
      rightTableScrollTop.value = 0
      if (rightTable) rightTable.scrollTop = 0
    }
    measureVirtualViewports()
  },
)
</script>

<template>
  <FormItem :schema="schema">
    <div class="vamis-transfer grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
      <div class="space-y-1">
        <p v-if="leftTitle" class="vamis-transfer__title">{{ leftTitle }}</p>
        <input v-if="searchable" v-model="leftQuery" class="vamis-input vamis-transfer__search h-8 w-full rounded-md border px-2" :placeholder="searchPlaceholder" />
        <ul v-if="mode === 'tree'" class="vamis-transfer__list max-h-48 overflow-auto rounded-md border p-2">
          <li v-for="node in treeVisible(treeRows)" v-show="treeDisplay(node)" :key="node.key">
            <button
              type="button"
              class="vamis-transfer__item w-full rounded px-2 py-1 text-left"
              :style="{ paddingLeft: `${8 + node.depth * 12}px` }"
              :disabled="disabled"
              @click="treeOnClick(node)"
            >
              <VamisCaret v-if="treeExpandable(node)" variant="tree" :open="treeIsExpanded(node)" class="vamis-transfer__tree-caret" />
              {{ node.label }}
            </button>
          </li>
        </ul>
        <div
          v-else-if="mode === 'table'"
          ref="leftTableEl"
          class="vamis-transfer__table-pane"
          :class="{ 'is-virtual': leftTableWindow.enabled }"
          @scroll="onLeftTableScroll"
        >
          <table class="vamis-transfer__table w-full border-collapse">
            <thead><tr class="border-b"><th class="px-2 py-1 text-left">名称</th><th class="px-2 py-1 text-left">值</th></tr></thead>
            <tbody>
              <tr
                v-if="leftTableWindow.lead > 0"
                class="vamis-transfer__virtual-pad"
                :style="{ height: `${leftTableWindow.lead}px` }"
                aria-hidden="true"
              >
                <td colspan="2" />
              </tr>
              <tr
                v-for="item in leftTableWindow.rows"
                :key="String(item.value)"
                class="vamis-transfer__row cursor-pointer"
                :style="leftTableWindow.enabled ? { height: `${virtualItemHeight}px` } : undefined"
                @click="add(item.value)"
              >
                <td class="px-2 py-1" :style="{ paddingLeft: `${8 + treeDepth(item) * 12}px` }">{{ item.label }}</td>
                <td class="vamis-transfer__value px-2 py-1">{{ item.value }}</td>
              </tr>
              <tr
                v-if="leftTableWindow.trail > 0"
                class="vamis-transfer__virtual-pad"
                :style="{ height: `${leftTableWindow.trail}px` }"
                aria-hidden="true"
              >
                <td colspan="2" />
              </tr>
              <tr v-if="!leftShown.length"><td colspan="2" class="vamis-transfer__empty px-2 py-4 text-center">无候选</td></tr>
            </tbody>
          </table>
        </div>
        <ul
          v-else
          ref="leftListEl"
          class="vamis-transfer__list rounded-md border p-2"
          :class="{ 'is-virtual': leftWindow.enabled }"
          @scroll="onLeftScroll"
        >
        <li
          v-if="leftWindow.lead > 0"
          class="vamis-transfer__virtual-pad"
          :style="{ height: `${leftWindow.lead}px` }"
          aria-hidden="true"
        />
        <li v-for="item in leftWindow.rows" :key="String(item.value)">
          <button
            type="button"
            class="vamis-transfer__item w-full rounded px-2 py-1 text-left"
            :style="{
              paddingLeft: `${8 + treeDepth(item) * 12}px`,
              height: leftWindow.enabled ? `${virtualItemHeight}px` : undefined,
            }"
            :disabled="disabled"
            @click="add(item.value)"
          >
            {{ item.label }}
          </button>
        </li>
        <li
          v-if="leftWindow.trail > 0"
          class="vamis-transfer__virtual-pad"
          :style="{ height: `${leftWindow.trail}px` }"
          aria-hidden="true"
        />
        <li v-if="!leftShown.length" class="vamis-transfer__empty px-2 py-4">无候选</li>
        </ul>
      </div>
      <div class="flex flex-col justify-center gap-1">
        <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="addAll">全部 &gt;</Button>
        <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="clear">&lt; 清空</Button>
      </div>
      <div class="space-y-1">
        <p v-if="rightTitle" class="vamis-transfer__title">{{ rightTitle }}</p>
        <input v-if="searchable" v-model="rightQuery" class="vamis-input vamis-transfer__search h-8 w-full rounded-md border px-2" :placeholder="searchPlaceholder" />
        <div
          v-if="mode === 'table'"
          ref="rightTableEl"
          class="vamis-transfer__table-pane"
          :class="{ 'is-virtual': rightTableWindow.enabled }"
          @scroll="onRightTableScroll"
        >
          <table class="vamis-transfer__table w-full border-collapse">
            <thead><tr class="border-b"><th class="px-2 py-1 text-left">名称</th><th class="px-2 py-1 text-left">值</th></tr></thead>
            <tbody>
              <tr
                v-if="rightTableWindow.lead > 0"
                class="vamis-transfer__virtual-pad"
                :style="{ height: `${rightTableWindow.lead}px` }"
                aria-hidden="true"
              >
                <td colspan="2" />
              </tr>
              <tr
                v-for="item in rightTableWindow.rows"
                :key="String(item.value)"
                class="vamis-transfer__row cursor-pointer"
                :style="rightTableWindow.enabled ? { height: `${virtualItemHeight}px` } : undefined"
                @click="remove(item.value)"
              >
                <td class="px-2 py-1" :style="{ paddingLeft: `${8 + treeDepth(item) * 12}px` }">{{ item.label }}</td>
                <td class="vamis-transfer__value px-2 py-1">{{ item.value }}</td>
              </tr>
              <tr
                v-if="rightTableWindow.trail > 0"
                class="vamis-transfer__virtual-pad"
                :style="{ height: `${rightTableWindow.trail}px` }"
                aria-hidden="true"
              >
                <td colspan="2" />
              </tr>
              <tr v-if="!rightShown.length"><td colspan="2" class="vamis-transfer__empty px-2 py-4 text-center">未选择</td></tr>
            </tbody>
          </table>
        </div>
        <ul
          v-else
          ref="rightListEl"
          class="vamis-transfer__list rounded-md border p-2"
          :class="{ 'is-virtual': rightWindow.enabled }"
          @scroll="onRightScroll"
        >
        <li
          v-if="rightWindow.lead > 0"
          class="vamis-transfer__virtual-pad"
          :style="{ height: `${rightWindow.lead}px` }"
          aria-hidden="true"
        />
        <li v-for="item in rightWindow.rows" :key="String(item.value)">
          <button
            type="button"
            class="vamis-transfer__item w-full rounded px-2 py-1 text-left"
            :style="{
              paddingLeft: `${8 + treeDepth(item) * 12}px`,
              height: rightWindow.enabled ? `${virtualItemHeight}px` : undefined,
            }"
            :disabled="disabled"
            @click="remove(item.value)"
          >
            {{ item.label }}
          </button>
        </li>
        <li
          v-if="rightWindow.trail > 0"
          class="vamis-transfer__virtual-pad"
          :style="{ height: `${rightWindow.trail}px` }"
          aria-hidden="true"
        />
        <li v-if="!rightShown.length" class="vamis-transfer__empty px-2 py-4">未选择</li>
        </ul>
      </div>
    </div>
  </FormItem>
</template>
