<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Button,
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  VamisClose,
  VamisIcon,
} from '@vamis/ui'
import {
  SchemaRenderer,
  createVamisEvent,
  drawerSizeClass,
  eventEvalData,
  filterTpl,
  isApiOutdated,
  isEffectiveApi,
  overlayContainerFrom,
  overlayFrameStyle,
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
import VamisTooltipLayer from '../../overlay/VamisTooltipLayer.vue'
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
const moreEl = ref<HTMLElement | null>(null)
const overflowTip = ref(false)
let overflowHideTimer: ReturnType<typeof setTimeout> | undefined

const multiple = computed(() => !!props.schema.multiple)
const pickerSchema = computed(() =>
  props.schema.pickerSchema && typeof props.schema.pickerSchema === 'object'
    ? (props.schema.pickerSchema as SchemaObject)
    : null,
)
const embed = computed(() => props.schema.embed === true)
const modalMode = computed(() =>
  props.schema.modalMode === 'drawer' ? 'drawer' : 'dialog',
)
const pickerDrawerClass = computed(() => {
  const size = String(props.schema.modalSize || 'md')
  if (size === 'full') return 'w-full max-w-none'
  return drawerSizeClass({ size })
})
const pickerDrawerStyle = computed(() => {
  const size = String(props.schema.modalSize || 'md')
  if (size === 'full') return { width: '100%', maxWidth: 'none' }
  return overlayFrameStyle({ size }, 'drawer')
})
const maxTagCount = computed(() => {
  const overflow = props.schema.overflowConfig
  const configured =
    overflow && typeof overflow === 'object' && !Array.isArray(overflow)
      ? (overflow as Record<string, unknown>).maxTagCount
      : undefined
  const n = Number(configured ?? props.schema.maxTagCount)
  return Number.isFinite(n) && n >= 0 ? n : 0
})
const displayPosition = computed(() => {
  const overflow = props.schema.overflowConfig
  const configured =
    overflow && typeof overflow === 'object' && !Array.isArray(overflow)
      ? (overflow as Record<string, unknown>).displayPosition
      : undefined
  return Array.isArray(configured)
    ? configured.map((item) => String(item))
    : ['select', 'crud']
})
const overflowConfig = computed(() => {
  const value = props.schema.overflowConfig
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
})
const overlayContainer = computed(() =>
  overlayContainerFrom(
    { popOverContainerSelector: props.schema.popOverContainerSelector },
    env,
  ),
)
const triggerOverflowTooltip = computed(() => {
  const value = overflowConfig.value.overflowTagPopover
  const extra =
    value && typeof value === 'object' && !Array.isArray(value)
      ? { ...(value as Record<string, unknown>) }
      : {}
  delete extra.children
  delete extra.content
  const extraClass =
    extra.tooltipClassName != null ? String(extra.tooltipClassName) : ''
  return {
    placement: 'top',
    showArrow: false,
    enterable: true,
    offset: [0, -5],
    ...extra,
    tooltipClassName: ['vamis-picker-overflow', extraClass]
      .filter(Boolean)
      .join(' '),
  }
})
const crudOverflowTagPopover = computed(() => {
  const value = overflowConfig.value.overflowTagPopoverInCRUD
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
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
    maxTagCount:
      (embed.value || displayPosition.value.includes('crud')) &&
      maxTagCount.value > 0
        ? maxTagCount.value
        : undefined,
    overflowTagPopover:
      (embed.value || displayPosition.value.includes('crud')) &&
      maxTagCount.value > 0
        ? crudOverflowTagPopover.value
        : undefined,
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

const selectedTagItems = computed(() =>
  selected.value.map((value) => {
    const option = pickerOption(value)
    const plainLabel = String(option.label ?? '-')
    const template =
      props.schema.labelTpl != null
        ? String(props.schema.labelTpl).trim()
        : ''
    return {
      option,
      plainLabel,
      labelHtml: template
        ? String(filterTpl(template, option as Record<string, any>))
        : '',
    }
  }),
)

function openPicker() {
  draft.value = [...selected.value]
  open.value = true
}

function showOverflow() {
  if (overflowHideTimer) clearTimeout(overflowHideTimer)
  overflowTip.value = true
}

function hideOverflow() {
  if (overflowHideTimer) clearTimeout(overflowHideTimer)
  overflowHideTimer = setTimeout(() => {
    overflowTip.value = false
  }, 80)
}

const shownTags = computed(() =>
  maxTagCount.value > 0
    ? selectedTagItems.value.slice(0, maxTagCount.value)
    : selectedTagItems.value,
)
const hiddenTags = computed(() =>
  maxTagCount.value > 0
    ? selectedTagItems.value.slice(maxTagCount.value)
    : [],
)
const hiddenCount = computed(() =>
  Math.max(0, selectedTagItems.value.length - shownTags.value.length),
)

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

function removeLastPickerTag() {
  if (!props.disabled && selected.value.length) {
    removePickerTag(selected.value.length - 1)
  }
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (
    event.target instanceof Element &&
    event.target.closest('button, a, input, textarea, select, label')
  ) {
    return
  }
  if (event.key === ' ') {
    event.preventDefault()
    event.stopPropagation()
    openPicker()
  } else if (event.key === 'Backspace' && selected.value.length) {
    event.preventDefault()
    event.stopPropagation()
    removeLastPickerTag()
  }
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
onBeforeUnmount(() => {
  if (overflowHideTimer) clearTimeout(overflowHideTimer)
})
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
      role="combobox"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :tabindex="disabled ? -1 : 0"
      @click="!disabled && openPicker()"
      @keydown="handleTriggerKeydown"
    >
      <div class="vamis-picker__value-wrap">
        <span v-if="!selectedTagItems.length" class="vamis-picker__placeholder">
          {{ schema.placeholder || '请选择' }}
        </span>
        <span
          v-for="(tag, i) in shownTags"
          :key="i"
          class="vamis-picker__tag"
        >
          <button
            v-if="schema.itemClearable !== false"
            type="button"
            class="vamis-picker__tag-remove"
            :aria-label="`移除 ${tag.plainLabel}`"
            @click.stop="removePickerTag(i)"
          >
            <VamisClose />
          </button>
          <span class="vamis-picker__tag-label" @click.stop="clickTag(i)">
            <span v-if="tag.labelHtml" v-html="tag.labelHtml" />
            <template v-else>{{ tag.plainLabel }}</template>
          </span>
        </span>
        <span
          v-if="hiddenCount > 0"
          ref="moreEl"
          class="vamis-picker__more"
          @mouseenter="showOverflow"
          @mouseleave="hideOverflow"
        >
          +{{ hiddenCount }}
        </span>
      </div>
      <button
        v-if="selectedTagItems.length && schema.clearable === true"
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
    <VamisTooltipLayer
      v-if="!embed"
      :show="overflowTip && hiddenCount > 0"
      :target="moreEl"
      :container="overlayContainer"
      :tooltip="triggerOverflowTooltip"
      :data="viewData"
      @enter="showOverflow"
      @leave="hideOverflow"
    >
      <template #body>
        <div class="vamis-picker-overflow__grid">
          <span
            v-for="(tag, index) in hiddenTags"
            :key="`overflow-${index}`"
            class="vamis-picker__tag"
          >
            <span v-if="tag.labelHtml" v-html="tag.labelHtml" />
            <template v-else>{{ tag.plainLabel }}</template>
          </span>
        </div>
      </template>
    </VamisTooltipLayer>
    <SchemaRenderer
      v-if="embed"
      :schema="effectivePickerSchema"
      :extra-data="{ ...viewData, items: rawOptions }"
    />
    <Dialog
      v-if="!embed && modalMode === 'dialog'"
      :open="open"
      @update:open="open = $event"
    >
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
    <Sheet
      v-else-if="!embed"
      :open="open"
      @update:open="open = $event"
    >
      <SheetContent
        class="vamis-picker__drawer"
        :class="pickerDrawerClass"
        :style="pickerDrawerStyle"
        side="right"
        :show-close-button="false"
        @pointer-down-outside.prevent
        @escape-key-down.prevent
      >
        <SheetHeader class="vamis-picker__drawer-header">
          <SheetTitle class="vamis-picker__drawer-title">
            {{ schema.modalTitle || '请选择' }}
          </SheetTitle>
          <DialogCloseButton class="vamis-picker__drawer-close" />
        </SheetHeader>
        <div class="vamis-picker__drawer-body">
          <SchemaRenderer
            :schema="effectivePickerSchema"
            :extra-data="{ ...viewData, items: rawOptions }"
          />
        </div>
        <SheetFooter class="vamis-picker__drawer-footer">
          <Button type="button" variant="outline" @click="open = false">取消</Button>
          <Button type="button" @click="confirm">确认</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </FormItem>
</template>
