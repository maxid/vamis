<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  VamisClose,
  VamisIcon,
} from '@vamis/ui'
import {
  SchemaRenderer,
  createVamisEvent,
  eventEvalData,
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
import { useFieldValue, useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import {
  flattenOptions,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
  type OptionItem,
} from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const fieldApi = useFieldValue()
const env = useEnv()
const viewData = useData()
const scoped = useScoped()
const overlay = useOverlay()
const formApi = useFormApi()
const scope = useScope()
const remoteOptions = ref<unknown[] | null>(null)
const pickedOptions = ref<OptionItem[]>([])
const open = ref(false)
const keyword = ref('')
const pickerPage = ref(1)
const draft = ref<unknown[]>([])

const multiple = computed(() => !!props.schema.multiple)
const pickerSchema = computed(() =>
  props.schema.pickerSchema && typeof props.schema.pickerSchema === 'object'
    ? (props.schema.pickerSchema as SchemaObject)
    : null,
)
const resolvedPickerSchema = computed<SchemaObject | null>(() =>
  pickerSchema.value
    ? {
        checkOnItemClick: true,
        pickerMode: true,
        keepItemSelectionOnPageChange: true,
        ...pickerSchema.value,
        labelField,
        valueField,
      }
    : null,
)
const embed = computed(() => props.schema.embed === true)
const maxTagCount = computed(() => {
  const n = Number(props.schema.maxTagCount)
  return Number.isFinite(n) && n >= 0 ? n : 0
})
const joinValues = computed(() => props.schema.joinValues !== false)
const extractValue = computed(() => props.schema.extractValue === true)
const labelField = computed(() => String(props.schema.labelField || 'label'))
const valueField = computed(() => String(props.schema.valueField || 'value'))

const rawOptions = computed(() => {
  const base = normalizeOptions(
    remoteOptions.value ?? props.schema.options,
    labelField.value,
    valueField.value,
  )
  const out = [...base]
  for (const item of pickedOptions.value) {
    if (
      !out.some((existing) =>
        optionValuesEqual(existing.value, item.value, valueField.value),
      )
    ) {
      out.push(item)
    }
  }
  return out
})
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
    parseJoined(props.schema.name ? fieldApi.getValue(props.schema.name) : '', multiple.value, joinValues.value),
  set: (values: unknown[]) => {
    if (!props.schema.name) return
    void commitPickerValues(values)
  },
})

function pickerValue(value: unknown) {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    valueField.value in value
  ) {
    return (value as Record<string, unknown>)[valueField.value]
  }
  return value
}

function pickerOption(value: unknown): OptionItem {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return normalizeOptions([value], labelField.value, valueField.value)[0]
  }
  return (
    options.value.find((item) =>
      optionValuesEqual(item.value, value, valueField.value),
    ) ?? {
      label: String(value ?? ''),
      value,
      [valueField.value]: value,
    }
  )
}

function serializePickerValue(values: unknown[]): unknown {
  const items = values.map(pickerOption)
  if (!multiple.value) {
    if (!items.length) return ''
    if (extractValue.value) return pickerValue(items[0]) ?? ''
    if (!joinValues.value) return items[0]
    return pickerValue(items[0]) ?? ''
  }
  if (extractValue.value) return items.map((item) => pickerValue(item))
  if (!joinValues.value) return items
  return items
    .map((item) => pickerValue(item))
    .join(String(props.schema.delimiter || ','))
}

async function dispatchPickerEvent(
  name: 'change' | 'itemClick',
  payload: Record<string, unknown>,
  native?: Event,
) {
  const full = { ...viewData.value, ...payload }
  const event = createVamisEvent(name, full, native)
  await runOnEvent(props.schema, name, {
    env,
    data: eventEvalData(full, event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  return event
}

async function commitPickerValues(values: unknown[]) {
  if (!props.schema.name) return false
  const items = values.map(pickerOption)
  const value = serializePickerValue(values)
  const event = await dispatchPickerEvent('change', {
    value,
    option: multiple.value ? items : items[0],
    selectedItems: multiple.value ? items : items[0],
    items,
  })
  if (event.prevented) return false
  fieldApi.setValue(props.schema.name, value)
  return true
}

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
  selected.value.map((value) => {
    const hit = options.value.find((item) =>
      optionValuesEqual(item.value, value, valueField.value),
    )
    if (hit) return hit.label
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return String(
        (value as Record<string, unknown>)[labelField.value] ??
          (value as Record<string, unknown>).label ??
          pickerValue(value) ??
          '',
      )
    }
    return String(value)
  }),
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
const hiddenLabels = computed(() =>
  maxTagCount.value > 0 ? selectedLabels.value.slice(maxTagCount.value) : [],
)
const hiddenCount = computed(() => Math.max(0, selectedLabels.value.length - shownLabels.value.length))

function commitInline(option: OptionItem, checked: boolean) {
  if (!multiple.value) selected.value = checked ? [option.value] : []
  else selected.value = checked ? [...selected.value.filter((v) => !optionValuesEqual(v, option.value)), option.value] : selected.value.filter((v) => !optionValuesEqual(v, option.value))
}

function mergePickedOptions(items: unknown[]) {
  const normalized = normalizeOptions(
    items,
    labelField.value,
    valueField.value,
  )
  const next = [...pickedOptions.value]
  for (const item of normalized) {
    if (
      !next.some((existing) =>
        optionValuesEqual(existing.value, item.value, valueField.value),
      )
    ) {
      next.push(item)
    }
  }
  pickedOptions.value = next
}

async function confirm() {
  if (pickerSchema.value) {
    const key = String(pickerSchema.value.id || pickerSchema.value.name || '')
    const nested = key ? scoped?.getComponentById(key) : undefined
    const nestedData = nested?.getData?.() as Record<string, any> | undefined
    const items = nestedData?.selectedItems
    if (Array.isArray(items)) {
      const picked = items.filter((item) => item != null)
      mergePickedOptions(picked)
      draft.value =
        !joinValues.value && !extractValue.value
          ? picked
          : picked.map((item) => pickerValue(item))
    } else if (nestedData && typeof nestedData === 'object') {
      const raw = nestedData[valueField.value]
      if (raw != null) draft.value = Array.isArray(raw) ? raw : [raw]
    }
  }
  const committed = await commitPickerValues([...draft.value])
  if (committed) open.value = false
}

function clear() {
  const reset = props.schema.resetValue
  selected.value =
    reset === undefined
      ? []
      : parseJoined(
          reset,
          multiple.value,
          joinValues.value,
          String(props.schema.delimiter || ','),
        )
}

function clickTag(index: number) {
  const value = selected.value[index]
  if (value === undefined) return
  void dispatchPickerEvent('itemClick', {
    item: pickerOption(value),
  })
}

function removePickerTag(index: number) {
  const next = selected.value.filter((_, itemIndex) => itemIndex !== index)
  void commitPickerValues(next)
}
async function loadSource() {
  const source = props.schema.source
  if (!source) return
  if (typeof source === 'string' && source.trim().startsWith('$')) {
    const resolved = resolveValue(source, viewData.value)
    if (Array.isArray(resolved)) remoteOptions.value = resolved
    return
  }
  if (!isEffectiveApi(source, viewData.value)) return
  try {
    const result = await requestApi(source, {
      env,
      data: viewData.value,
      reason: 'init',
    })
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
  () => [props.schema.source, viewData.value] as const,
  (curr, prev) => {
    if (!prev) return
    if (isApiOutdated(prev[0], curr[0], prev[1] || {}, curr[1] || {})) void loadSource()
  },
  { deep: true },
)
</script>

<template>
  <FormItem :schema="schema">
    <div
      v-if="!embed"
      class="vamis-picker__control"
      :class="{ 'is-disabled': disabled }"
      @click="!disabled && openPicker()"
    >
      <div class="vamis-picker__value-wrap">
        <span v-if="!selectedLabels.length" class="vamis-picker__placeholder">
          {{ schema.placeholder || '请选择' }}
        </span>
        <span
          v-for="(label, i) in shownLabels"
          :key="i"
          class="vamis-picker__tag"
        >
          <button
            type="button"
            class="vamis-picker__tag-remove"
            :aria-label="`移除 ${label}`"
            @click.stop="removePickerTag(i)"
          >
            <VamisClose />
          </button>
          <span class="vamis-picker__tag-label" @click.stop="clickTag(i)">
            {{ label }}
          </span>
        </span>
        <span
          v-if="hiddenCount > 0"
          class="vamis-picker__more"
          :title="hiddenLabels.join('、')"
        >
          +{{ hiddenCount }}
        </span>
      </div>
      <button
        v-if="selectedLabels.length && schema.clearable === true"
        type="button"
        class="vamis-picker__clear"
        :disabled="disabled"
        aria-label="清除"
        @click.stop="clear"
      >
        <VamisIcon name="input-clear" />
      </button>
      <button
        type="button"
        data-picker-open
        class="vamis-picker__btn"
        :disabled="disabled"
        aria-label="打开选择器"
        @click.stop="openPicker"
      >
        <VamisIcon name="window-restore" />
      </button>
    </div>
    <ul v-if="embed" class="max-h-64 w-full space-y-1 overflow-auto rounded-md border p-2">
      <template v-for="(row, i) in pagedRows" :key="i">
        <li v-if="row.kind === 'group'" class="vamis-picker__group px-2 pt-2 pb-1" :style="{ paddingLeft: `${8 + row.depth * 12}px` }">{{ row.label }}</li>
        <li v-else>
          <label class="vamis-picker__item flex items-center gap-2 rounded px-2 py-1.5" :style="{ paddingLeft: `${8 + row.depth * 12}px` }">
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
          v-if="resolvedPickerSchema"
          :schema="resolvedPickerSchema"
          :extra-data="{ ...viewData, items: options }"
        />
        <Input v-else v-model="keyword" placeholder="筛选" class="mb-2" />
        <ul v-if="!pickerSchema" class="max-h-64 space-y-1 overflow-auto rounded-md border p-2">
          <template v-for="(row, i) in pagedRows" :key="i">
            <li v-if="row.kind === 'group'" class="vamis-picker__group px-2 pt-2 pb-1" :style="{ paddingLeft: `${8 + row.depth * 12}px` }">{{ row.label }}</li>
            <li v-else>
              <label class="vamis-picker__item flex items-center gap-2 rounded px-2 py-1.5" :style="{ paddingLeft: `${8 + row.depth * 12}px` }">
                <Checkbox :model-value="isChecked(row.option)" @update:model-value="toggle(row.option, $event === true)" />
                <span>{{ row.label }}</span>
              </label>
            </li>
          </template>
          <li v-if="!filteredRows.length" class="vamis-picker__empty px-2 py-6 text-center">暂无选项</li>
        </ul>
        <div v-if="!pickerSchema && lastPage > 1" class="vamis-picker__pager mt-2 flex items-center justify-end gap-2">
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
