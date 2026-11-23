<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button, VamisCaret } from '@vamis/ui'
import {
  createVamisEvent,
  eventEvalData,
  filterOptionTree,
  isApiOutdated,
  isEffectiveApi,
  requestApi,
  resolveValue,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { useFieldValue } from '../../formContext'
import FormItem from '../FormItem.vue'
import SelectAssociatedPane from './select/SelectAssociatedPane.vue'
import SelectChainedPane from './select/SelectChainedPane.vue'
import {
  dumpJoined,
  flattenOptions,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
  type OptionItem,
} from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const fieldApi = useFieldValue()
const env = useEnv()
const data = useData()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const formApi = useFormApi()
const remoteOptions = ref<unknown[] | null>(null)
const pristine = ref<unknown>(undefined)
const optionNodesOverride = ref<OptionItem[] | null>(null)
const associatedNodesOverride = ref<OptionItem[] | null>(null)
const mode = computed(() => String(props.schema.selectMode || props.schema.mode || 'list'))
const rawOptions = computed(() =>
  normalizeOptions(optionNodesOverride.value ?? remoteOptions.value ?? props.schema.options),
)
const associatedEnvelope = computed(() => {
  const first = rawOptions.value[0] as (OptionItem & {
    leftOptions?: unknown
    leftDefaultValue?: unknown
  }) | undefined
  if (mode.value !== 'associated' || !Array.isArray(first?.leftOptions)) return null
  return {
    leftOptions: normalizeOptions(first.leftOptions),
    leftDefaultValue: first.leftDefaultValue,
    nodes: Array.isArray(first.children) ? normalizeOptions(first.children) : [],
  }
})
const associatedNodes = computed(
  () => associatedNodesOverride.value ?? associatedEnvelope.value?.nodes ?? rawOptions.value,
)
const displayRawOptions = computed(() =>
  mode.value === 'associated' ? associatedNodes.value : rawOptions.value,
)
const options = computed(() => flattenOptions(displayRawOptions.value))
type TreeRow = { key: string; label: string; value?: unknown; depth: number; children: TreeRow[] }
const expandedTree = ref<Set<string>>(new Set())

function buildTree(nodes: any[], depth = 0, prefix = ''): TreeRow[] {
  return (nodes || []).map((node, index) => {
    const key = `${prefix}${index}`
    const children = Array.isArray(node.children) ? buildTree(node.children, depth + 1, `${key}-`) : []
    return { key, label: String(node.label ?? node.value ?? ''), value: node.value, depth, children }
  })
}

const treeRows = computed(() => buildTree(displayRawOptions.value as any[]))
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
function flattenTreeRows(nodes: TreeRow[]): TreeRow[] {
  const out: TreeRow[] = []
  for (const node of nodes) {
    out.push(node)
    if (leftQuery.value.trim() || expandedTree.value.has(node.key)) {
      out.push(...flattenTreeRows(node.children))
    }
  }
  return out
}
const treeShown = computed(() => flattenTreeRows(treeVisible(treeRows.value)))
const name = computed(() => String(props.schema.name || ''))
const joinValues = computed(() => props.schema.joinValues !== false)
const delimiter = computed(() => String(props.schema.delimiter ?? ','))
const pairedMode = computed(() => mode.value === 'chained' || mode.value === 'associated')
function currentValue() {
  return name.value ? fieldApi.getValue(name.value) : props.schema.value
}
const selected = computed(() => parseJoined(currentValue(), true, joinValues.value, delimiter.value))
const searchable = computed(() => props.schema.searchable === true)
const VIRTUAL_ITEM_HEIGHT = 38
const TREE_ITEM_HEIGHT = 32
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
const leftTreeEl = ref<HTMLElement | null>(null)
const leftScrollTop = ref(0)
const rightScrollTop = ref(0)
const leftTableScrollTop = ref(0)
const rightTableScrollTop = ref(0)
const leftTreeScrollTop = ref(0)
const leftViewportHeight = ref(VIRTUAL_VIEWPORT_HEIGHT)
const rightViewportHeight = ref(VIRTUAL_VIEWPORT_HEIGHT)
const leftTableViewportHeight = ref(VIRTUAL_VIEWPORT_HEIGHT)
const rightTableViewportHeight = ref(VIRTUAL_VIEWPORT_HEIGHT)
const leftTreeViewportHeight = ref(VIRTUAL_VIEWPORT_HEIGHT)
const leftQuery = ref('')
const associatedLeftValue = ref<unknown>(undefined)
const associatedLeftOptions = computed(() =>
  associatedEnvelope.value
    ? associatedEnvelope.value.leftOptions
    : normalizeOptions(props.schema.leftOptions),
)
const associatedLeftDefaultValue = computed(() =>
  associatedEnvelope.value
    ? associatedEnvelope.value.leftDefaultValue
    : props.schema.leftDefaultValue,
)
const paneSchema = computed<SchemaObject>(() => ({
  ...props.schema,
  selectMode: mode.value,
  multiple: true,
  checkAll: props.schema.checkAll !== false,
}))
const filteredAssociatedLeftOptions = computed(() =>
  leftQuery.value
    ? filterOptionTree(associatedLeftOptions.value, leftQuery.value)
    : associatedLeftOptions.value,
)
const filteredChainedNodes = computed(() =>
  leftQuery.value
    ? filterOptionTree(displayRawOptions.value, leftQuery.value)
    : displayRawOptions.value,
)
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
const leftTitle = computed(() =>
  String(props.schema.selectTitle ?? props.schema.leftTitle ?? ''),
)
const rightTitle = computed(() =>
  String(props.schema.resultTitle ?? props.schema.rightTitle ?? ''),
)
const searchPlaceholder = computed(() => String(props.schema.searchPlaceholder || '搜索'))

function virtualWindow<T extends { label?: unknown; value?: unknown }>(
  rows: T[],
  scrollTop: number,
  viewportHeight: number,
  targetMode: 'list' | 'table' | 'tree',
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
  const itemHeight = targetMode === 'tree' ? TREE_ITEM_HEIGHT : virtualItemHeight.value
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
const leftTreeWindow = computed(() =>
  virtualWindow(
    treeShown.value,
    leftTreeScrollTop.value,
    leftTreeViewportHeight.value,
    'tree',
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

function onLeftTreeScroll(event: Event) {
  const el = event.currentTarget as HTMLElement
  leftTreeScrollTop.value = el.scrollTop
  if (el.clientHeight > 0) leftTreeViewportHeight.value = el.clientHeight
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
  if (leftTreeEl.value?.clientHeight) {
    leftTreeViewportHeight.value = leftTreeEl.value.clientHeight
  }
}

let listResizeObserver: ResizeObserver | undefined

function selectedOptionItems(values: unknown[]) {
  return values
    .map((value) => options.value.find((item) => optionValuesEqual(item.value, value)))
    .filter((item): item is OptionItem => !!item)
}

function serializeSelected(values: unknown[]) {
  return dumpJoined(values, true, joinValues.value, delimiter.value)
}

function writeRaw(value: unknown) {
  if (name.value) fieldApi.setValue(name.value, value)
}

async function emitTransferEvent(
  eventName: 'change' | 'selectAll',
  value: unknown,
  values: unknown[],
) {
  const items = options.value
  const selectedItems = selectedOptionItems(values)
  const payload = {
    ...data.value,
    value,
    item: selectedItems[0] ?? null,
    items,
    options: items,
    selectedItems,
    ...(name.value ? { [name.value]: value } : {}),
  }
  const event = createVamisEvent(eventName, payload)
  await runOnEvent(props.schema, eventName, {
    env,
    data: eventEvalData(payload, event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  return event
}

async function commitRaw(nextValue: unknown) {
  const values = parseJoined(nextValue, true, joinValues.value, delimiter.value)
  const event = await emitTransferEvent('change', nextValue, values)
  if (event.prevented) return false
  writeRaw(nextValue)
  return true
}

async function commitSelected(values: unknown[]) {
  return commitRaw(serializeSelected(values))
}

function add(value: unknown) {
  if (selected.value.some((item) => optionValuesEqual(item, value))) return
  void commitSelected([...selected.value, value])
}

function remove(value: unknown) {
  void commitSelected(selected.value.filter((item) => !optionValuesEqual(item, value)))
}

function clear() {
  void commitSelected([])
}

function replacePaneSelection(values: unknown[]) {
  void commitSelected(values)
}

function addPaneItems(items?: OptionItem[]) {
  const candidates = items?.length ? flattenOptions(items) : options.value
  const next = [...selected.value]
  for (const item of candidates) {
    if (item.value == null) continue
    if (!next.some((value) => optionValuesEqual(value, item.value))) {
      next.push(item.value)
    }
  }
  void commitSelected(next)
}

function replaceOptionNodes(nodes: OptionItem[]) {
  if (mode.value === 'associated') associatedNodesOverride.value = nodes
  else optionNodesOverride.value = nodes
}

async function addAll(emitSelectAll = true) {
  const values = options.value.map((item) => item.value)
  if (
    values.length > 0 &&
    values.every((value) => selected.value.some((item) => optionValuesEqual(item, value)))
  ) {
    return
  }
  if (emitSelectAll) await emitTransferEvent('selectAll', serializeSelected(values), values)
  await commitSelected(values)
}

function clearSearch(target?: { left?: boolean; right?: boolean }) {
  if (!target || target.left) leftQuery.value = ''
  if (!target || target.right) rightQuery.value = ''
}

async function loadSource() {
  const source = props.schema.source
  if (!source) return
  if (typeof source === 'string' && source.trim().startsWith('$')) {
    const resolved = resolveValue(source, data.value)
    if (Array.isArray(resolved)) {
      remoteOptions.value = resolved
      optionNodesOverride.value = null
      associatedNodesOverride.value = null
      associatedLeftValue.value = undefined
    }
    return
  }
  if (!isEffectiveApi(source, data.value)) return
  try {
    const result = await requestApi(source, { env, data: data.value, reason: 'init' })
    if (result.skipped || !result.ok) return
    const payload = result.data || {}
    const list = Array.isArray(payload) ? payload : payload.options ?? payload.items ?? payload.records ?? payload
    if (Array.isArray(list)) {
      remoteOptions.value = list
      optionNodesOverride.value = null
      associatedNodesOverride.value = null
      associatedLeftValue.value = undefined
    }
  } catch {
    /* 保留空选项 */
  }
}

const scopedApi = {
  id: String(props.schema.id || props.schema.name || ''),
  name: String(props.schema.name || props.schema.id || ''),
  type: 'transfer',
  schema: props.schema,
  reload: () => loadSource(),
  getData: () => ({
    value: currentValue(),
    ...(name.value ? { [name.value]: currentValue() } : {}),
  }),
  setData(values: Record<string, unknown>) {
    const next = Object.prototype.hasOwnProperty.call(values, 'value')
      ? values.value
      : name.value
        ? values[name.value]
        : undefined
    if (next !== undefined) writeRaw(next)
  },
  async doAction(action: unknown) {
    const rec =
      action && typeof action === 'object' && !Array.isArray(action)
        ? (action as {
            actionType?: string
            value?: unknown
            args?: { value?: unknown; left?: boolean; right?: boolean }
          })
        : {}
    const type = String(rec.actionType || '')
    if (type === 'clear') await commitRaw('')
    else if (type === 'reset') {
      await commitRaw(
        pristine.value !== undefined
          ? pristine.value
          : props.schema.resetValue !== undefined
            ? props.schema.resetValue
            : '',
      )
    } else if (type === 'clearSearch') clearSearch(rec.args)
    else if (type === 'selectAll') await addAll(false)
    else if (type === 'setValue') await commitRaw(rec.args?.value ?? rec.value)
    else if (type === 'reload') await loadSource()
  },
}

onMounted(() => {
  pristine.value = currentValue()
  scoped?.register(scopedApi)
  void loadSource()
  void nextTick(() => {
    measureVirtualViewports()
    if (typeof ResizeObserver !== 'undefined') {
      listResizeObserver = new ResizeObserver(measureVirtualViewports)
      if (leftListEl.value) listResizeObserver.observe(leftListEl.value)
      if (rightListEl.value) listResizeObserver.observe(rightListEl.value)
      if (leftTableEl.value) listResizeObserver.observe(leftTableEl.value)
      if (rightTableEl.value) listResizeObserver.observe(rightTableEl.value)
      if (leftTreeEl.value) listResizeObserver.observe(leftTreeEl.value)
    }
  })
})
onBeforeUnmount(() => {
  scoped?.unregister(scopedApi)
  listResizeObserver?.disconnect()
})
watch(
  () => [props.schema.source, data.value] as const,
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
    const leftTree = leftTreeEl.value
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
    if (
      !leftTreeWindow.value.enabled ||
      nextMode !== prevMode ||
      nextLeftLength < prevLeftLength
    ) {
      leftTreeScrollTop.value = 0
      if (leftTree) leftTree.scrollTop = 0
    }
    measureVirtualViewports()
  },
)
</script>

<template>
  <FormItem :schema="schema">
    <div
      class="vamis-transfer grid gap-2 sm:grid-cols-[1fr_auto_1fr]"
      :class="{ 'vamis-transfer--paired': pairedMode }"
    >
      <div class="space-y-1">
        <template v-if="mode === 'associated'">
          <div class="vamis-transfer__pane-title">
            <span>{{ leftTitle || '可选' }}</span>
            <button
              v-if="schema.checkAll !== false"
              type="button"
              class="vamis-transfer__pane-action"
              @click="addAll()"
            >
              全选
            </button>
          </div>
          <input v-if="searchable" v-model="leftQuery" class="vamis-input vamis-transfer__search h-8 w-full rounded-md border px-2" :placeholder="searchPlaceholder" />
          <SelectAssociatedPane
            :schema="paneSchema"
            :left-options="filteredAssociatedLeftOptions"
            :nodes="associatedNodes"
            :selected-values="selected"
            :left-default-value="associatedLeftDefaultValue"
            :option-class-name="schema.optionClassName ? String(schema.optionClassName) : undefined"
            :loading-config="schema.loadingConfig"
            :disabled="disabled"
            v-model:left-value="associatedLeftValue"
            @pick="add($event.value)"
            @toggle="replacePaneSelection"
            @toggle-all="addPaneItems"
            @update:nodes="replaceOptionNodes"
          />
        </template>
        <template v-else-if="mode === 'chained'">
          <p v-if="leftTitle" class="vamis-transfer__title">{{ leftTitle }}</p>
          <input v-if="searchable" v-model="leftQuery" class="vamis-input vamis-transfer__search h-8 w-full rounded-md border px-2" :placeholder="searchPlaceholder" />
          <SelectChainedPane
            :schema="paneSchema"
            :nodes="filteredChainedNodes"
            :selected-values="selected"
            :option-class-name="schema.optionClassName ? String(schema.optionClassName) : undefined"
            :loading-config="schema.loadingConfig"
            :disabled="disabled"
            @pick="add($event.value)"
            @toggle-all="addPaneItems()"
            @update:nodes="replaceOptionNodes"
          />
        </template>
        <template v-else>
        <p v-if="leftTitle" class="vamis-transfer__title">{{ leftTitle }}</p>
        <input v-if="searchable" v-model="leftQuery" class="vamis-input vamis-transfer__search h-8 w-full rounded-md border px-2" :placeholder="searchPlaceholder" />
        <ul
          v-if="mode === 'tree'"
          ref="leftTreeEl"
          class="vamis-transfer__list rounded-md border p-2"
          :class="{ 'is-virtual': leftTreeWindow.enabled }"
          @scroll="onLeftTreeScroll"
        >
          <li
            v-if="leftTreeWindow.lead > 0"
            class="vamis-transfer__virtual-pad"
            :style="{ height: `${leftTreeWindow.lead}px` }"
            aria-hidden="true"
          />
          <li v-for="node in leftTreeWindow.rows" :key="node.key">
            <button
              type="button"
              class="vamis-transfer__item w-full rounded px-2 py-1 text-left"
              :style="{
                paddingLeft: `${8 + node.depth * 12}px`,
                height: `${TREE_ITEM_HEIGHT}px`,
              }"
              :disabled="disabled"
              @click="treeOnClick(node)"
            >
              <VamisCaret v-if="treeExpandable(node)" variant="tree" :open="treeIsExpanded(node)" class="vamis-transfer__tree-caret" />
              {{ node.label }}
            </button>
          </li>
          <li
            v-if="leftTreeWindow.trail > 0"
            class="vamis-transfer__virtual-pad"
            :style="{ height: `${leftTreeWindow.trail}px` }"
            aria-hidden="true"
          />
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
        </template>
      </div>
      <div v-if="!pairedMode" class="flex flex-col justify-center gap-1">
        <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="addAll()">全部 &gt;</Button>
        <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="clear">&lt; 清空</Button>
      </div>
      <div class="space-y-1">
        <div v-if="pairedMode" class="vamis-transfer__pane-title">
          <span>{{ rightTitle || '已选' }}</span>
          <button type="button" class="vamis-transfer__pane-action" @click="clear">清空</button>
        </div>
        <p v-else-if="rightTitle" class="vamis-transfer__title">{{ rightTitle }}</p>
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
