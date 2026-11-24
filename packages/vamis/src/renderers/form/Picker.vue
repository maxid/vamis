<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Button,
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
const draft = ref<unknown[]>([])

const multiple = computed(() => !!props.schema.multiple)
const pickerSchema = computed(() =>
  props.schema.pickerSchema && typeof props.schema.pickerSchema === 'object'
    ? (props.schema.pickerSchema as SchemaObject)
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
const selected = computed({
  get: () =>
    parseJoined(
      props.schema.name ? fieldApi.getValue(props.schema.name) : '',
      multiple.value,
      joinValues.value,
    ),
  set: (values: unknown[]) => {
    if (!props.schema.name) return
    void commitPickerValues(values)
  },
})
const effectivePickerSchema = computed<SchemaObject>(() => {
  const custom = pickerSchema.value || {}
  const source = props.schema.source
  const sourceIsVariable =
    typeof source === 'string' && source.trim().startsWith('$')
  const columns = Array.isArray(custom.columns) && custom.columns.length
    ? custom.columns
    : [{ name: labelField.value, label: '选项' }]
  return {
    mode: 'list',
    ...custom,
    type: 'crud',
    name: String(
      custom.name ||
        custom.id ||
        `${String(props.schema.name || 'picker')}PickerCRUD`,
    ),
    pickerMode: true,
    multiple: multiple.value,
    checkOnItemClick: true,
    keepItemSelectionOnPageChange: true,
    labelField: labelField.value,
    valueField: valueField.value,
    primaryField: valueField.value,
    value: embed.value ? selected.value : draft.value,
    __pickerOnSelect: embed.value ? handleEmbedSelection : undefined,
    columns,
    source: source
      ? sourceIsVariable
        ? source
        : custom.source
      : custom.source ?? '$items',
    api: source && !sourceIsVariable ? source : custom.api,
    perPage: props.schema.perPage,
  }
})

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

function handleEmbedSelection(items: unknown[]) {
  void commitPickerValues(items)
}

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

function openPicker() {
  draft.value = [...selected.value]
  open.value = true
}

const shownLabels = computed(() => (maxTagCount.value > 0 ? selectedLabels.value.slice(0, maxTagCount.value) : selectedLabels.value))
const hiddenLabels = computed(() =>
  maxTagCount.value > 0 ? selectedLabels.value.slice(maxTagCount.value) : [],
)
const hiddenCount = computed(() => Math.max(0, selectedLabels.value.length - shownLabels.value.length))

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
  const key = String(
    effectivePickerSchema.value.id ||
      effectivePickerSchema.value.name ||
      '',
  )
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
    <SchemaRenderer
      v-if="embed"
      :schema="effectivePickerSchema"
      :extra-data="{ ...viewData, items: rawOptions }"
    />
    <Dialog v-if="!embed" :open="open" @update:open="open = $event">
      <DialogContent class="vamis-picker__dialog" :show-close-button="false">
        <DialogHeader class="vamis-picker__dialog-header">
          <DialogTitle>{{ schema.modalTitle || '请选择' }}</DialogTitle>
          <DialogCloseButton class="vamis-picker__dialog-close" />
        </DialogHeader>
        <div class="vamis-picker__dialog-body">
          <SchemaRenderer
            :schema="effectivePickerSchema"
            :extra-data="{ ...viewData, items: rawOptions }"
          />
        </div>
        <DialogFooter class="vamis-picker__dialog-footer">
          <Button type="button" variant="outline" @click="open = false">取消</Button>
          <Button type="button" @click="confirm">确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </FormItem>
</template>
