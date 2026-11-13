<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@vamis/ui'
import {
  SchemaRenderer,
  isApiOutdated,
  isEffectiveApi,
  requestApi,
  resolveValue,
  useData,
  useEnv,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import {
  dumpJoined,
  flattenOptions,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
  type OptionItem,
} from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const env = useEnv()
const viewData = useData()
const scoped = useScoped()
const remoteOptions = ref<unknown[] | null>(null)
const open = ref(false)
const keyword = ref('')
const pickerPage = ref(1)
const draft = ref<unknown[]>([])

const multiple = computed(() => !!props.schema.multiple)
const pickerSchema = computed(() => (props.schema.pickerSchema && typeof props.schema.pickerSchema === 'object' ? (props.schema.pickerSchema as SchemaObject) : null))
const embed = computed(() => props.schema.embed === true)
const maxTagCount = computed(() => {
  const n = Number(props.schema.maxTagCount)
  return Number.isFinite(n) && n >= 0 ? n : 0
})
const joinValues = computed(() => props.schema.joinValues !== false)
const labelField = computed(() => String(props.schema.labelField || 'label'))
const valueField = computed(() => String(props.schema.valueField || 'value'))

const rawOptions = computed(() => normalizeOptions(remoteOptions.value ?? props.schema.options))
const options = computed(() =>
  flattenOptions(rawOptions.value).map((item) => ({
    ...item,
    label: String((item as any)[labelField.value] ?? item.label),
    value: (item as any)[valueField.value] ?? item.value,
  })),
)
type PickerRow =
  | { kind: 'group'; label: string; depth: number }
  | { kind: 'option'; label: string; value: unknown; depth: number; option: OptionItem }
const allRows = computed<PickerRow[]>(() => {
  const out: PickerRow[] = []
  const walk = (nodes: any[], depth: number) => {
    for (const node of nodes || []) {
      const children = Array.isArray(node.children) ? node.children : []
      if (children.length) {
        out.push({ kind: 'group', label: String(node[labelField.value] ?? node.label ?? ''), depth })
        walk(children, depth + 1)
      } else {
        out.push({
          kind: 'option',
          label: String(node[labelField.value] ?? node.label ?? ''),
          value: node[valueField.value] ?? node.value,
          depth,
          option: node,
        })
      }
    }
  }
  walk(rawOptions.value as any[], 0)
  return out
})

const selected = computed({
  get: () =>
    parseJoined(props.schema.name ? form?.getValue(props.schema.name) : '', multiple.value, joinValues.value),
  set: (values: unknown[]) => {
    if (!props.schema.name) return
    form?.setValue(props.schema.name, dumpJoined(values, multiple.value, joinValues.value))
  },
})

const perPage = computed(() => {
  const n = Number(props.schema.perPage)
  return Number.isFinite(n) && n > 0 ? n : 10
})
const filteredRows = computed<PickerRow[]>(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return allRows.value
  const out: PickerRow[] = []
  let pendingGroup: PickerRow | null = null
  let groupIncluded = false
  for (const row of allRows.value) {
    if (row.kind === 'group') {
      pendingGroup = row
      groupIncluded = false
      continue
    }
    const matched = row.label.toLowerCase().includes(q) || String(row.value).toLowerCase().includes(q)
    if (!matched) continue
    if (pendingGroup && !groupIncluded) {
      out.push(pendingGroup)
      groupIncluded = true
    }
    out.push(row)
  }
  return out
})
const filtered = filteredRows
const pagedRows = computed(() => {
  const start = (pickerPage.value - 1) * perPage.value
  return filteredRows.value.slice(start, start + perPage.value)
})
const pagedOptions = pagedRows
const lastPage = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / perPage.value)))

const selectedLabels = computed(() =>
  selected.value.map((value) => options.value.find((item) => optionValuesEqual(item.value, value))?.label || String(value)),
)

function isChecked(option: OptionItem) {
  return draft.value.some((item) => optionValuesEqual(item, option.value))
}

function toggle(option: OptionItem, checked: boolean) {
  if (!multiple.value) {
    draft.value = checked ? [option.value] : []
    return
  }
  const next = draft.value.filter((item) => !optionValuesEqual(item, option.value))
  draft.value = checked ? [...next, option.value] : next
}

watch(keyword, () => { pickerPage.value = 1 })

function openPicker() {
  draft.value = [...selected.value]
  keyword.value = ''
  pickerPage.value = 1
  open.value = true
}

const shownLabels = computed(() => (maxTagCount.value > 0 ? selectedLabels.value.slice(0, maxTagCount.value) : selectedLabels.value))
const hiddenCount = computed(() => Math.max(0, selectedLabels.value.length - shownLabels.value.length))

function commitInline(option: OptionItem, checked: boolean) {
  if (!multiple.value) selected.value = checked ? [option.value] : []
  else selected.value = checked ? [...selected.value.filter((v) => !optionValuesEqual(v, option.value)), option.value] : selected.value.filter((v) => !optionValuesEqual(v, option.value))
}

function confirm() {
  if (pickerSchema.value) {
    const key = String(pickerSchema.value.id || pickerSchema.value.name || '')
    const nested = key ? scoped?.getComponentById(key) : undefined
    const nestedData = nested?.getData?.() as Record<string, any> | undefined
    const items = nestedData?.selectedItems
    if (Array.isArray(items)) {
      draft.value = items
        .map((item: any) => (item && typeof item === 'object' ? item[valueField.value] ?? item.value : item))
        .filter((item) => item != null)
    } else if (nestedData && typeof nestedData === 'object') {
      const raw = nestedData[valueField.value]
      if (raw != null) draft.value = Array.isArray(raw) ? raw : [raw]
    }
  }
  selected.value = [...draft.value]
  open.value = false
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
    const list = Array.isArray(payload)
      ? payload
      : payload.options ?? payload.items ?? payload.records ?? payload
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
    <div class="flex flex-wrap items-center gap-2">
      <Badge v-for="(label, i) in shownLabels" :key="i" variant="secondary">{{ label }}</Badge>
      <Badge v-if="hiddenCount > 0" variant="outline">+{{ hiddenCount }}</Badge>
      <span v-if="!selectedLabels.length" class="text-sm text-muted-foreground">{{ schema.placeholder || '请选择' }}</span>
      <Button v-if="!embed" type="button" size="sm" variant="outline" :disabled="disabled" @click="openPicker">选择</Button>
      <Button v-if="selectedLabels.length && schema.clearable !== false" type="button" size="sm" variant="ghost" :disabled="disabled" @click="clear">清除</Button>
    </div>
    <ul v-if="embed" class="max-h-64 w-full space-y-1 overflow-auto rounded-md border p-2">
      <template v-for="(row, i) in pagedRows" :key="i">
        <li v-if="row.kind === 'group'" class="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground" :style="{ paddingLeft: `${8 + row.depth * 12}px` }">{{ row.label }}</li>
        <li v-else>
          <label class="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent" :style="{ paddingLeft: `${8 + row.depth * 12}px` }">
            <Checkbox :model-value="selected.some((v) => optionValuesEqual(v, row.value))" @update:model-value="commitInline(row.option, $event === true)" />
            <span>{{ row.label }}</span>
          </label>
        </li>
      </template>
    </ul>
    <Dialog v-if="!embed" :open="open" @update:open="open = $event">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ schema.modalTitle || schema.label || '请选择' }}</DialogTitle>
        </DialogHeader>
        <SchemaRenderer
          v-if="pickerSchema"
          :schema="pickerSchema"
          :extra-data="{ ...viewData, items: options }"
        />
        <Input v-else v-model="keyword" placeholder="筛选" class="mb-2" />
        <ul v-if="!pickerSchema" class="max-h-64 space-y-1 overflow-auto rounded-md border p-2">
          <template v-for="(row, i) in pagedRows" :key="i">
            <li v-if="row.kind === 'group'" class="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground" :style="{ paddingLeft: `${8 + row.depth * 12}px` }">{{ row.label }}</li>
            <li v-else>
              <label class="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent" :style="{ paddingLeft: `${8 + row.depth * 12}px` }">
                <Checkbox :model-value="isChecked(row.option)" @update:model-value="toggle(row.option, $event === true)" />
                <span>{{ row.label }}</span>
              </label>
            </li>
          </template>
          <li v-if="!filteredRows.length" class="px-2 py-6 text-center text-xs text-muted-foreground">暂无选项</li>
        </ul>
        <div v-if="!pickerSchema && lastPage > 1" class="mt-2 flex items-center justify-end gap-2 text-xs">
          <button type="button" class="rounded border px-2 py-1 disabled:opacity-40" :disabled="pickerPage <= 1" @click="pickerPage -= 1">上一页</button>
          <span>{{ pickerPage }} / {{ lastPage }}</span>
          <button type="button" class="rounded border px-2 py-1 disabled:opacity-40" :disabled="pickerPage >= lastPage" @click="pickerPage += 1">下一页</button>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="open = false">取消</Button>
          <Button type="button" @click="confirm">确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </FormItem>
</template>
