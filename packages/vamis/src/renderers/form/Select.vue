<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import {
  CALENDAR_PICKER_VISIBLE,
  SELECT_PICKER_ITEM_HEIGHT,
  SchemaRenderer,
  calcSelectOverlayWidth,
  countVisibleTagsByWidth,
  filterTpl,
  flattenOptionMenuRows,
  getSelectedOptions,
  highlightTextMatches,
  isAllSelected,
  isGroupOption,
  normalizeOptions,
  overlayIsMobile,
  POPUP_DEFAULT_HEIGHT,
  resolveClassName,
  selectableOptions,
  selectOverlayPlacement,
  selectPopupHeight,
  toggleAllOptions,
  toggleOption,
  useData,
  useEnv,
  type CalendarPickerOption,
  type OptionItem,
  type SchemaNode,
  type SchemaObject,
} from '@vamis/core'
import { VamisCaret, VamisClear, VamisIcon, VamisClose } from '@vamis/ui'
import FormItem from '../FormItem.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'
import VamisPopUp from '../../overlay/VamisPopUp.vue'
import VamisTooltipLayer from '../../overlay/VamisTooltipLayer.vue'
import CalendarWheel from '../display/CalendarWheel.vue'
import PickerFade from '../calendar/PickerFade.vue'
import Spinner from '../Spinner.vue'
import { useOptionsControl } from '../../optionsControl'
import SelectAssociatedPane from './select/SelectAssociatedPane.vue'
import SelectChainedPane from './select/SelectChainedPane.vue'
import SelectTablePane from './select/SelectTablePane.vue'
import SelectTreePane from './select/SelectTreePane.vue'

const props = defineProps<{
  schema: SchemaObject
  disabled?: boolean
  value?: unknown
}>()
const emit = defineEmits<{
  valueChange: [value: unknown]
}>()
const schemaRef = toRef(props, 'schema')
const disabledRef = toRef(props, 'disabled')
const data = useData()
const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLElement | null>(null)
const valueEl = ref<HTMLElement | null>(null)
const measureEl = ref<HTMLElement | null>(null)
const overflowEl = ref<HTMLElement | null>(null)
const searchInputEl = ref<HTMLInputElement | null>(null)
const triggerWidth = ref(0)
const visibleByWidth = ref(Number.POSITIVE_INFINITY)
const overflowTip = ref(false)
const tagTip = ref(false)
const tagTipEl = ref<HTMLElement | null>(null)
const tagTipLabel = ref('')
let foldObserver: ResizeObserver | undefined
let overflowHideTimer: ReturnType<typeof setTimeout> | undefined
let tagTipHideTimer: ReturnType<typeof setTimeout> | undefined
let searchFocusTimer: ReturnType<typeof setTimeout> | undefined
const SEARCH_FOCUS_DELAY = 500

const ctl = useOptionsControl(
  schemaRef,
  disabledRef,
  props.value !== undefined
    ? {
        value: () => props.value,
        onChange: (value) => emit('valueChange', value),
      }
    : undefined,
)
const env = useEnv()
const viewportTick = ref(0)
const locked = computed(() => !!props.disabled)
const isMobile = computed(() => {
  viewportTick.value
  return overlayIsMobile(props.schema, env)
})
const pickerHeight = SELECT_PICKER_ITEM_HEIGHT * CALENDAR_PICKER_VISIBLE
const selectMode = computed(() => String(props.schema.selectMode || ''))
const searchResultMode = computed(() =>
  String(props.schema.searchResultMode || selectMode.value),
)
const activeSelectMode = computed(() =>
  ctl.searchResults.value !== null ? searchResultMode.value : selectMode.value,
)
const isAssociatedMenu = computed(() => activeSelectMode.value === 'associated')
const isChainedMenu = computed(() => activeSelectMode.value === 'chained')
const isTableMenu = computed(() => activeSelectMode.value === 'table')
const isTreeMenu = computed(() => activeSelectMode.value === 'tree')
const isTransferMenu = computed(() =>
  ['list', 'group', 'table', 'tree', 'chained', 'associated'].includes(
    activeSelectMode.value,
  ),
)
const popupHeight = computed(() =>
  selectPopupHeight(
    props.schema.overlay,
    isTransferMenu.value
      ? POPUP_DEFAULT_HEIGHT
      : undefined,
  ),
)
const mobileDraft = ref<OptionItem[]>([])
const mobileWheelIndex = ref(0)
const checkAllLabel = computed(() =>
  props.schema.checkAllLabel != null ? String(props.schema.checkAllLabel) : '全选',
)
function leafOptions(list: OptionItem[]): OptionItem[] {
  const out: OptionItem[] = []
  for (const item of list) {
    if (Array.isArray(item.children)) out.push(...leafOptions(item.children))
    else out.push(item)
  }
  return out
}

function selectOptionLabelText(label: unknown, missing = false): string {
  if (missing || label == null) return '-'
  const type = typeof label
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return String(label)
  }
  if (label && typeof label === 'object' && !Array.isArray(label)) {
    const record = label as Record<string, unknown>
    for (const key of ['__title', 'label', Object.keys(record)[0]]) {
      if (key && typeof record[key] === 'string') return record[key]
    }
  }
  return 'invalid label'
}

function optionLabelText(option: OptionItem): string {
  return selectOptionLabelText(
    option.label,
    option.__labelMissing === true,
  )
}

const mobileLeaves = computed(() => leafOptions(ctl.filtered.value))
const mobileWheelOptions = computed((): CalendarPickerOption[] =>
  mobileLeaves.value.map((item, i) => ({
    value: i,
    text: optionLabelText(item),
  })),
)
function selectedPool() {
  return isMobile.value && ctl.open.value ? mobileDraft.value : ctl.selected.value
}
const treeSelectedValues = computed(() => selectedPool().map((item) => item.value))
const tableSelectedValues = computed(() => selectedPool().map((item) => item.value))
const tableOptions = computed(() =>
  isTableMenu.value ? ctl.filteredCandidates.value : ctl.filtered.value,
)
const tablePaneSchema = computed(() =>
  isTableMenu.value &&
  ctl.searchResults.value !== null &&
  Array.isArray(props.schema.searchResultColumns)
    ? { ...props.schema, columns: props.schema.searchResultColumns }
    : props.schema,
)
const allChecked = computed(() =>
  isAllSelected(selectedPool(), ctl.filtered.value, ctl.config.value.valueField),
)
const checkAllPartial = computed(() => {
  if (allChecked.value) return false
  const selected = selectedPool()
  const valueField = ctl.config.value.valueField
  return selectableOptions(ctl.filtered.value).some((option) =>
    isAllSelected(selected, [option], valueField),
  )
})
const menuTpl = computed(() => props.schema.menuTpl as SchemaNode | undefined)
const noResultsText = computed(() =>
  props.schema.noResultsText != null ? String(props.schema.noResultsText) : '未找到任何结果',
)
const associatedSourceMeta = computed(() => {
  const first = ctl.options.value[0]
  return first && Array.isArray(first.leftOptions) ? first : undefined
})
const associatedLeftOptions = computed(() =>
  normalizeOptions(
    associatedSourceMeta.value?.leftOptions ?? props.schema.leftOptions,
    String(props.schema.labelField || 'label'),
    String(props.schema.valueField || 'value'),
  ),
)
const associatedRightOptions = computed(() =>
  normalizeOptions(
    associatedSourceMeta.value?.children ?? ctl.options.value,
    String(props.schema.labelField || 'label'),
    String(props.schema.valueField || 'value'),
  ),
)
const associatedLeftDefaultValue = computed(
  () => associatedSourceMeta.value?.leftDefaultValue ?? props.schema.leftDefaultValue,
)
function replaceAssociatedRightNodes(nodes: OptionItem[]) {
  const meta = associatedSourceMeta.value
  ctl.replaceOptions(meta ? [{ ...meta, children: nodes }] : nodes)
}
const associatedLeftValue = ref<unknown>(undefined)
const associatedResetToken = ref(0)
watch(
  () => associatedLeftDefaultValue.value,
  (value) => {
    if (associatedLeftValue.value == null || associatedLeftValue.value === '') {
      associatedLeftValue.value = value
    }
  },
  { immediate: true },
)
const optionClassName = computed(() => resolveClassName(props.schema.optionClassName, data.value))
const mobileClassName = computed(() =>
  resolveClassName(props.schema.mobileClassName, data.value),
)
const isGroupMenu = computed(() => {
  if (activeSelectMode.value === 'group') return true
  if (
    isTreeMenu.value ||
    isTableMenu.value ||
    isChainedMenu.value ||
    isAssociatedMenu.value
  ) return false
  return ctl.options.value.some((item) => isGroupOption(item))
})
const isTransferSearch = computed(
  () => isTransferMenu.value || isGroupMenu.value,
)
const focusSearchable = computed(
  () => ctl.config.value.searchable || !!ctl.autoComplete.value,
)
/** 对齐 Amis VirtualList：固定视口 266，行高默认 32；组头与子项共用行窗口。 */
const VIRTUAL_BUFFER = 4
const VIRTUAL_MAX_HEIGHT = 266
const virtualListEl = ref<HTMLElement | null>(null)
const virtualScrollTop = ref(0)
const menuRows = computed(() =>
  flattenOptionMenuRows(ctl.filtered.value as OptionItem[]),
)
const virtualRowCount = computed(() =>
  isGroupMenu.value ? menuRows.value.length : ctl.filtered.value.length,
)
const virtualThreshold = computed(() => {
  if (!isGroupMenu.value) return ctl.config.value.virtualThreshold
  const configured = Number(props.schema.virtualThreshold)
  return Number.isFinite(configured) && configured >= 0 ? configured : 1000
})
const itemHeight = computed(() => ctl.config.value.itemHeight)
const virtualEnabled = computed(
  () =>
    !isMobile.value &&
    !isTableMenu.value &&
    !isChainedMenu.value &&
    !isAssociatedMenu.value &&
    virtualRowCount.value > virtualThreshold.value,
)
const virtualViewportHeight = computed(() => {
  const count = virtualRowCount.value
  return count > 8 ? VIRTUAL_MAX_HEIGHT : Math.max(count, 1) * itemHeight.value
})
const virtualStart = computed(() => {
  if (!virtualEnabled.value) return 0
  const count = virtualRowCount.value
  if (!count) return 0
  return Math.min(
    Math.max(0, Math.floor(virtualScrollTop.value / itemHeight.value) - VIRTUAL_BUFFER),
    count - 1,
  )
})
const virtualEnd = computed(() => {
  const count = virtualRowCount.value
  if (!virtualEnabled.value) return count
  return Math.min(
    count,
    Math.ceil((virtualScrollTop.value + virtualViewportHeight.value) / itemHeight.value) + VIRTUAL_BUFFER,
  )
})
const visibleMenuRows = computed(() =>
  virtualEnabled.value
    ? menuRows.value.slice(virtualStart.value, virtualEnd.value)
    : menuRows.value,
)
const virtualPadTop = computed(() => (virtualEnabled.value ? virtualStart.value * itemHeight.value : 0))
const virtualPadBottom = computed(() =>
  virtualEnabled.value ? Math.max(0, (virtualRowCount.value - virtualEnd.value) * itemHeight.value) : 0,
)
function onVirtualScroll(event: Event) {
  if (!virtualEnabled.value) return
  virtualScrollTop.value = (event.currentTarget as HTMLElement).scrollTop
}
function resetVirtualScroll() {
  virtualScrollTop.value = 0
  if (virtualListEl.value) virtualListEl.value.scrollTop = 0
}
watch(
  () => ctl.keyword.value,
  () => nextTick(resetVirtualScroll),
)
watch(
  () => ctl.open.value,
  (open) => {
    if (open) nextTick(resetVirtualScroll)
  },
)
watch(
  () => [ctl.config.value.virtualThreshold, ctl.config.value.itemHeight] as const,
  () => nextTick(resetVirtualScroll),
)
watch(
  () => menuRows.value.length,
  () => {
    if (!virtualEnabled.value) return
    void nextTick(() => {
      const el = virtualListEl.value
      if (!el) return
      const max = Math.max(0, virtualRowCount.value * itemHeight.value - virtualViewportHeight.value)
      if (el.scrollTop > max) {
        el.scrollTop = max
        virtualScrollTop.value = max
      }
    })
  },
)
/** 对齐 Amis：普通单选才走 Picker 滚轮；multiple / selectMode:group 走列表。 */
const useMobileWheel = computed(
  () =>
    isMobile.value &&
    !ctl.config.value.multiple &&
    !ctl.config.value.creatable &&
    !isGroupMenu.value &&
    !isTreeMenu.value &&
    !isTableMenu.value &&
    !isChainedMenu.value &&
    !isAssociatedMenu.value &&
    !isTransferMenu.value,
)
/** 普通多选移动端：右侧勾，不要左侧勾选盒（分组仍走 GroupedSelection）。 */
const useMobileTick = computed(
  () =>
    isMobile.value &&
    !!ctl.config.value.multiple &&
    !isGroupMenu.value &&
    !isTreeMenu.value &&
    !isTableMenu.value &&
    !isChainedMenu.value &&
    !isAssociatedMenu.value &&
    !isTransferMenu.value,
)
const showSearch = computed(
  () => !!(ctl.config.value.searchable || ctl.autoComplete.value || props.schema.searchApi),
)
const searchPlaceholder = computed(() => {
  if (props.schema.searchPlaceholder != null) return String(props.schema.searchPlaceholder)
  if (isTransferSearch.value) return filterTpl(ctl.placeholder.value, data.value)
  return '搜索'
})
const visibleTags = computed(() => {
  if (!ctl.config.value.multiple) return []
  const cap = Number.isFinite(visibleByWidth.value) ? visibleByWidth.value : ctl.selected.value.length
  return ctl.selected.value.slice(0, Math.max(0, cap))
})
const restTags = computed(() => {
  if (!ctl.config.value.multiple) return []
  return ctl.selected.value.slice(visibleTags.value.length)
})
const overflowTooltip = computed(() => {
  const pop = props.schema.overflowTagPopover
  const extra =
    pop && typeof pop === 'object' && !Array.isArray(pop) ? { ...(pop as Record<string, unknown>) } : {}
  delete extra.children
  delete extra.content
  const extraClass = extra.tooltipClassName != null ? String(extra.tooltipClassName) : ''
  return {
    placement: 'auto',
    showArrow: false,
    enterable: true,
    ...extra,
    tooltipClassName: ['vamis-select-overflow', extraClass].filter(Boolean).join(' '),
  }
})
const tagTooltip = computed(() => ({
  content: tagTipLabel.value,
  placement: 'top',
  showArrow: true,
}))
const foldTags = computed(() => {
  const maxTag = Number(props.schema.maxTagCount)
  return Number.isFinite(maxTag) && maxTag > 0
})
const showValuesNoWrap = computed(
  () =>
    ctl.config.value.multiple &&
    ctl.config.value.valuesNoWrap &&
    !foldTags.value,
)
const valuesNoWrapText = computed(() =>
  ctl.selected.value.map((item) => optionLabelText(item)).join(' + '),
)
const valuesNoWrapSummary = computed(
  () => `已选择(${ctl.selected.value.length})`,
)
const overlayPlacement = computed(() => selectOverlayPlacement(props.schema.overlay))
const triggerSpinnerSchema = computed<SchemaObject>(() => ({
  type: 'spinner',
  show: ctl.loading.value,
  icon: 'reload',
  size: 'sm',
  spinnerClassName: 'vamis-select__spinner',
  loadingConfig: props.schema.loadingConfig,
}))
const controlSpinnerSchema = computed<SchemaObject>(() => ({
  type: 'spinner',
  show: props.schema.loading === true,
  overlay: true,
  loadingConfig: props.schema.loadingConfig,
}))
const popoverStyle = computed(() => {
  const width = calcSelectOverlayWidth(props.schema.overlay, triggerWidth.value)
  if (width != null) return { width: typeof width === 'number' ? `${width}px` : width }
  return { minWidth: triggerWidth.value ? `${triggerWidth.value}px` : undefined }
})

function measureTags() {
  const wrap = valueEl.value
  const measure = measureEl.value
  if (!wrap || !measure || !ctl.config.value.multiple) {
    visibleByWidth.value = Number.POSITIVE_INFINITY
    return
  }
  if (!wrap.clientWidth) return
  const maxTag = Number(props.schema.maxTagCount)
  if (!(Number.isFinite(maxTag) && maxTag > 0)) {
    visibleByWidth.value = Number.POSITIVE_INFINITY
    return
  }
  const chips = Array.from(measure.querySelectorAll('[data-fold-chip]')) as HTMLElement[]
  const more = measure.querySelector('[data-fold-more]') as HTMLElement | null
  visibleByWidth.value = countVisibleTagsByWidth({
    containerWidth: wrap.clientWidth,
    itemWidths: chips.map((el) => el.offsetWidth),
    moreWidth: more?.offsetWidth || 30,
    maxVisibleCount: Number.isFinite(maxTag) && maxTag > 0 ? maxTag : undefined,
  })
}

function syncTriggerWidth() {
  triggerWidth.value = rootEl.value?.offsetWidth || 0
}

function scheduleMeasure() {
  void nextTick(measureTags)
}

function toggleOpen() {
  if (locked.value) return
  const next = !ctl.open.value
  ctl.open.value = next
  syncTriggerWidth()
  if (next && (ctl.autoComplete.value || props.schema.searchApi)) {
    ctl.scheduleAutoComplete(ctl.keyword.value)
  }
}

function closeMenu() {
  ctl.open.value = false
}

function scheduleSearchFocus() {
  if (searchFocusTimer) clearTimeout(searchFocusTimer)
  searchFocusTimer = setTimeout(() => {
    searchFocusTimer = undefined
    if (
      !ctl.open.value ||
      !focusSearchable.value ||
      locked.value
    ) return
    searchInputEl.value?.focus()
  }, SEARCH_FOCUS_DELAY)
}

function onSearchBlur() {
  if (!ctl.open.value || !focusSearchable.value) return
  scheduleSearchFocus()
}

function clearSearch(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  ctl.keyword.value = ''
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

function showTagTip(event: Event, label: unknown) {
  const text = label == null ? '' : String(label)
  if (!text) return
  if (tagTipHideTimer) {
    clearTimeout(tagTipHideTimer)
    tagTipHideTimer = undefined
  }
  tagTipEl.value = event.currentTarget as HTMLElement
  tagTipLabel.value = text
  tagTip.value = true
}

function hideTagTip() {
  if (tagTipHideTimer) clearTimeout(tagTipHideTimer)
  tagTipHideTimer = setTimeout(() => {
    tagTip.value = false
  }, 300)
}

function keepTagTip() {
  if (tagTipHideTimer) {
    clearTimeout(tagTipHideTimer)
    tagTipHideTimer = undefined
  }
  tagTip.value = true
}

function removeTag(item: OptionItem, event: Event) {
  event.preventDefault()
  event.stopPropagation()
  if (locked.value || item.disabled) return
  void ctl.toggle(item)
}

async function onAdd(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  ctl.open.value = false
  await ctl.openAddDialog()
}

function isSelected(value: unknown) {
  return selectedPool().some((item) => String(item.value) === String(value))
}

function syncMobileDraft() {
  mobileDraft.value = [...ctl.selected.value]
  const cur = ctl.selected.value[0]
  const idx = cur
    ? mobileLeaves.value.findIndex((item) => String(item.value) === String(cur.value))
    : 0
  mobileWheelIndex.value = idx < 0 ? 0 : idx
}

function onWheelIndex(index: number) {
  mobileWheelIndex.value = index
  const item = mobileLeaves.value[index]
  mobileDraft.value = item ? [item] : []
}

function onPick(item: OptionItem) {
  if (item.disabled || locked.value) return
  if (isMobile.value) {
    if (ctl.config.value.multiple) {
      mobileDraft.value = toggleOption(item, mobileDraft.value, ctl.config.value)
      return
    }
    mobileDraft.value = [item]
    return
  }
  void ctl.toggle(item)
}

async function onToggleAll(pool?: OptionItem[]) {
  if (isAssociatedMenu.value) {
    const candidates = pool ?? []
    if (isMobile.value) {
      mobileDraft.value = toggleAllOptions(
        mobileDraft.value,
        candidates,
        ctl.config.value.valueField,
      )
      return
    }
    await ctl.commit(
      toggleAllOptions(ctl.selected.value, candidates, ctl.config.value.valueField),
    )
    return
  }
  if (isChainedMenu.value) {
    const pool = leafOptions(ctl.filtered.value)
    if (isMobile.value) {
      mobileDraft.value = toggleAllOptions(
        mobileDraft.value,
        pool,
        ctl.config.value.valueField,
      )
      return
    }
    await ctl.commit(
      toggleAllOptions(ctl.selected.value, pool, ctl.config.value.valueField),
    )
    return
  }
  if (isTableMenu.value) {
    const pool = ctl.filteredCandidates.value
    if (isMobile.value) {
      mobileDraft.value = toggleAllOptions(
        mobileDraft.value,
        pool,
        ctl.config.value.valueField,
      )
      return
    }
    await ctl.commit(
      toggleAllOptions(ctl.selected.value, pool, ctl.config.value.valueField),
    )
    return
  }
  if (isMobile.value) {
    const pool =
      ctl.config.value.checkAllBySearch !== false && ctl.keyword.value.trim()
        ? ctl.filtered.value
        : ctl.options.value
    mobileDraft.value = toggleAllOptions(mobileDraft.value, pool, ctl.config.value.valueField)
    return
  }
  await ctl.toggleAll()
}

async function onTreeToggle(values: unknown[]) {
  const selectedItems = getSelectedOptions(
    values,
    [...ctl.filtered.value, ...ctl.options.value],
    ctl.config.value,
  )
  if (isMobile.value) {
    mobileDraft.value = selectedItems
    return
  }
  await ctl.commit(selectedItems)
  if (!ctl.config.value.multiple) closeMenu()
}

async function confirmMobile() {
  if (useMobileWheel.value) {
    const item = mobileLeaves.value[mobileWheelIndex.value] ?? mobileLeaves.value[0]
    await ctl.commit(item ? [item] : [])
  } else {
    await ctl.commit(mobileDraft.value)
  }
  closeMenu()
}

function menuData(opt: OptionItem, index: number, checked?: boolean) {
  return { ...opt, checked: checked ?? isSelected(opt.value), index }
}

function optionLabelParts(option: OptionItem, disabled = false) {
  const text = optionLabelText(option)
  return disabled
    ? [{ text, matched: false }]
    : highlightTextMatches(text, ctl.keyword.value)
}

async function onEdit(opt: OptionItem, event: Event) {
  event.preventDefault()
  event.stopPropagation()
  ctl.open.value = false
  await ctl.editOption(opt)
}

async function onDelete(opt: OptionItem, event: Event) {
  event.preventDefault()
  event.stopPropagation()
  ctl.open.value = false
  await ctl.deleteOption(opt)
}

let media: MediaQueryList | undefined
let onMedia: (() => void) | undefined

onMounted(() => {
  foldObserver = new ResizeObserver(() => {
    syncTriggerWidth()
    measureTags()
  })
  if (rootEl.value) foldObserver.observe(rootEl.value)
  if (valueEl.value) foldObserver.observe(valueEl.value)
  scheduleMeasure()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', syncTriggerWidth)
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    media = window.matchMedia('(max-width: 768px)')
    onMedia = () => {
      viewportTick.value += 1
    }
    media.addEventListener('change', onMedia)
  }
})

onBeforeUnmount(() => {
  foldObserver?.disconnect()
  if (overflowHideTimer) clearTimeout(overflowHideTimer)
  if (tagTipHideTimer) clearTimeout(tagTipHideTimer)
  if (searchFocusTimer) clearTimeout(searchFocusTimer)
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', syncTriggerWidth)
  }
  if (media && onMedia) media.removeEventListener('change', onMedia)
})

watch(
  () => [ctl.selected.value, triggerWidth.value, props.schema.maxTagCount] as const,
  scheduleMeasure,
)

watch(
  () => ctl.open.value,
  (open) => {
    if (searchFocusTimer) {
      clearTimeout(searchFocusTimer)
      searchFocusTimer = undefined
    }
    if (!open) return
    if (isAssociatedMenu.value) {
      associatedLeftValue.value = associatedLeftDefaultValue.value
      associatedResetToken.value += 1
    }
    if (isMobile.value) syncMobileDraft()
    scheduleSearchFocus()
  },
)

watch(
  () => ctl.filtered.value,
  () => {
    if (!useMobileWheel.value || !ctl.open.value) return
    const cur = mobileDraft.value[0]
    const idx = cur
      ? mobileLeaves.value.findIndex((item) => String(item.value) === String(cur.value))
      : 0
    mobileWheelIndex.value = idx < 0 ? 0 : idx
    if (idx < 0 && mobileLeaves.value[0]) mobileDraft.value = [mobileLeaves.value[0]]
  },
)
</script>

<template>
  <FormItem :schema="schema">
    <div
      ref="rootEl"
      class="vamis-select"
      :class="{
        'is-opened': ctl.open.value,
        'is-disabled': locked,
        'is-multiple': ctl.config.value.multiple,
        'is-fold': foldTags,
        'is-nowrap': showValuesNoWrap,
        'is-group': isGroupMenu,
        'is-tree': isTreeMenu,
        'is-table': isTableMenu,
        'is-chained': isChainedMenu,
        'is-associated': isAssociatedMenu,
        'is-mobile': isMobile,
      }"
    >
      <div
        ref="triggerEl"
        class="vamis-select__input"
        :class="{ 'is-focused': ctl.open.value }"
        @click="toggleOpen"
      >
        <div ref="valueEl" class="vamis-select__value">
          <template v-if="ctl.config.value.multiple && ctl.selected.value.length">
            <span
              v-if="showValuesNoWrap"
              class="vamis-select__nowrap-values"
            >{{ valuesNoWrapText }}</span>
            <template v-else>
              <span
                v-for="(item, index) in visibleTags"
                :key="`${item.value}-${index}`"
                class="vamis-select__chip"
                :class="{
                  'is-invalid':
                    schema.showInvalidMatch === true && item.__unmatched === true,
                }"
                @mouseenter="showTagTip($event, optionLabelText(item))"
                @mouseleave="hideTagTip"
              >
                <span class="vamis-select__chip-label">{{ optionLabelText(item) }}</span>
                <button
                  v-if="!locked && !item.disabled"
                  type="button"
                  class="vamis-select__chip-close"
                  aria-label="移除"
                  @mousedown.prevent
                  @click="removeTag(item, $event)"
                ><VamisClose /></button>
              </span>
              <span
                v-if="restTags.length"
                ref="overflowEl"
                class="vamis-select__chip vamis-select__overflow"
                @mouseenter="showOverflow"
                @mouseleave="hideOverflow"
              >+ {{ restTags.length }} ...</span>
            </template>
          </template>
          <span
            v-else-if="ctl.selected.value[0]"
            class="vamis-select__single"
            :class="{
              'is-invalid':
                schema.showInvalidMatch === true &&
                ctl.selected.value[0].__unmatched === true,
            }"
          >{{ optionLabelText(ctl.selected.value[0]) }}</span>
          <span v-else class="vamis-select__placeholder">{{ filterTpl(ctl.placeholder.value, data) }}</span>
        </div>
        <div
          v-if="ctl.config.value.multiple && foldTags"
          ref="measureEl"
          class="vamis-select__value-measure"
          aria-hidden="true"
        >
          <span
            v-for="(item, index) in ctl.selected.value"
            :key="`m-${item.value}-${index}`"
            class="vamis-select__chip"
            data-fold-chip
          >
            <span class="vamis-select__chip-label">{{ optionLabelText(item) }}</span>
            <button v-if="!locked && !item.disabled" type="button" class="vamis-select__chip-close"><VamisClose /></button>
          </span>
          <span class="vamis-select__chip vamis-select__overflow" data-fold-more>+ 00 ...</span>
        </div>
        <span class="vamis-select__suffix">
          <button
            v-if="schema.clearable && ctl.hasValue.value && !locked"
            type="button"
            class="vamis-select__clear"
            aria-label="清除"
            @mousedown.prevent
            @click.stop="ctl.clear()"
          >
            <VamisClear />
          </button>
          <Spinner :schema="triggerSpinnerSchema" />
          <VamisCaret class="vamis-select__caret" :open="!isMobile && ctl.open.value" />
        </span>
      </div>
      <Spinner :schema="controlSpinnerSchema" />
      <VamisTooltipLayer
        :show="tagTip && !!tagTipLabel"
        :target="tagTipEl"
        :container="ctl.overlayContainer.value"
        :tooltip="tagTooltip"
        :data="data"
        @enter="keepTagTip"
        @leave="hideTagTip"
      />
      <VamisTooltipLayer
        :show="overflowTip && restTags.length > 0"
        :target="overflowEl"
        :container="ctl.overlayContainer.value"
        :tooltip="overflowTooltip"
        :data="data"
        @enter="showOverflow"
        @leave="hideOverflow"
      >
        <template #body>
          <div class="vamis-select-overflow__grid">
            <span
              v-for="(item, index) in restTags"
              :key="`rest-${item.value}-${index}`"
              class="vamis-select__chip"
              :class="{
                'is-invalid':
                  schema.showInvalidMatch === true && item.__unmatched === true,
              }"
            >
              <span class="vamis-select__chip-label">{{ optionLabelText(item) }}</span>
              <button
                v-if="!locked && !item.disabled"
                type="button"
                class="vamis-select__chip-close"
                aria-label="移除"
                @mousedown.prevent
                @click="removeTag(item, $event)"
              ><VamisClose /></button>
            </span>
          </div>
        </template>
      </VamisTooltipLayer>
      <VamisPopUp
        v-if="isMobile"
        :show="ctl.open.value"
        :height="popupHeight"
        :container="ctl.overlayContainer.value"
        :panel-class-name="mobileClassName"
        @cancel="closeMenu"
        @confirm="confirmMobile"
      >
        <div
          v-if="showSearch"
          class="vamis-select__search"
          :class="isTransferSearch ? 'vamis-select__search--sheet' : 'vamis-select__search--line'"
        >
          <div class="vamis-select__search-inner">
            <VamisIcon name="search" v-if="!isTransferSearch" class="vamis-select__search-icon" />
            <input
              ref="searchInputEl"
              :value="ctl.keyword.value"
              class="vamis-select__search-input"
              :placeholder="searchPlaceholder"
              @input="ctl.keyword.value = ($event.target as HTMLInputElement).value"
              @blur="onSearchBlur"
            >
            <button
              v-if="ctl.keyword.value"
              type="button"
              class="vamis-select__search-clear"
              aria-label="清除检索"
              @click="clearSearch"
            ><VamisClose /></button>
            <VamisIcon name="search" v-else-if="isTransferSearch" class="vamis-select__search-icon" />
          </div>
        </div>
        <div
          v-if="useMobileWheel"
          class="vamis-popup__picker"
          :style="{ height: `${pickerHeight}px` }"
        >
          <CalendarWheel
            :model-value="mobileWheelIndex"
            :options="mobileWheelOptions"
            :item-height="SELECT_PICKER_ITEM_HEIGHT"
            @update:model-value="onWheelIndex"
          >
            <template #default="{ item, index, checked }">
              <SchemaRenderer
                v-if="menuTpl != null && mobileLeaves[index]"
                class="vamis-select__wheel-label"
                :schema="menuTpl"
                :extra-data="menuData(mobileLeaves[index], index, checked)"
              />
              <template v-else>{{ item.text }}</template>
            </template>
          </CalendarWheel>
          <PickerFade class="vamis-picker-fade" />
          <div class="vamis-popup__frame" :style="{ height: `${SELECT_PICKER_ITEM_HEIGHT}px` }" />
        </div>
        <div
          v-else
          class="vamis-select__popover vamis-select__popover--sheet"
          :class="{
            'is-tick': useMobileTick,
            'is-transfer': isTransferMenu,
            'is-creatable': ctl.config.value.creatable,
            'is-group': isGroupMenu,
            'is-tree': isTreeMenu,
            'is-table': isTableMenu,
            'is-chained': isChainedMenu,
            'is-associated': isAssociatedMenu,
          }"
        >
          <SelectAssociatedPane
            v-if="isAssociatedMenu"
            :schema="schema"
            :left-options="associatedLeftOptions"
            :nodes="associatedRightOptions"
            :selected-values="treeSelectedValues"
            :option-class-name="optionClassName"
            :loading-config="schema.loadingConfig"
            :reset-token="associatedResetToken"
            v-model:left-value="associatedLeftValue"
            :left-default-value="associatedLeftDefaultValue"
            :disabled="locked"
            @pick="onPick"
            @toggle="onTreeToggle"
            @toggle-all="onToggleAll"
            @update:nodes="replaceAssociatedRightNodes"
          />
          <SelectTreePane
            v-else-if="isTreeMenu"
            :schema="schema"
            :nodes="ctl.options.value"
            :visible-nodes="ctl.filtered.value"
            :selected-values="treeSelectedValues"
            :value="ctl.rawValue.value"
            :disabled="locked"
            :query="ctl.keyword.value"
            :loading-config="schema.loadingConfig"
            @update:nodes="ctl.replaceOptions"
            @toggle="onTreeToggle"
          />
          <SelectTablePane
            v-else-if="isTableMenu"
            :schema="tablePaneSchema"
            :nodes="tableOptions"
            :selected-values="tableSelectedValues"
            :disabled="locked"
            :query="ctl.keyword.value"
            @pick="onPick"
            @toggle-all="onToggleAll"
          />
          <SelectChainedPane
            v-else-if="isChainedMenu"
            :schema="schema"
            :nodes="ctl.filtered.value"
            :selected-values="treeSelectedValues"
            :option-class-name="optionClassName"
            :loading-config="schema.loadingConfig"
            :disabled="locked"
            @pick="onPick"
            @toggle-all="onToggleAll"
            @update:nodes="ctl.replaceOptions"
          />
          <template v-else>
            <div v-if="ctl.config.value.creatable" class="vamis-select__create">
              <button
                type="button"
                class="vamis-select__create-btn"
                :disabled="locked"
                @click="onAdd"
              >
                {{ ctl.createLabel.value }}
              </button>
            </div>
            <div
              v-if="ctl.config.value.multiple && ctl.config.value.valuesNoWrap"
              class="vamis-select__values-summary"
            >
              {{ valuesNoWrapSummary }}
            </div>
            <button
              v-if="ctl.config.value.checkAll && ctl.config.value.multiple"
              type="button"
              class="vamis-select__checkall"
              @click="onToggleAll()"
            >
              <span
                class="vamis-select__check"
                :class="{ 'is-checked': allChecked, 'is-partial': checkAllPartial }"
              >
                <VamisIcon name="menu-check" v-if="allChecked" />
                <VamisIcon name="checkbox-partial" v-else-if="checkAllPartial" />
              </span>
              <span>{{ checkAllLabel }}</span>
            </button>
            <div class="vamis-select__list">
              <template
                v-for="row in menuRows"
                :key="`mobile-${row.kind}-${row.index}`"
              >
                <div
                  v-if="row.kind === 'group'"
                  class="vamis-select__group"
                >
                  <div class="vamis-select__item-label vamis-select__group-label">
                    {{ optionLabelText(row.option) }}
                  </div>
                </div>
                <div
                  v-else
                  role="option"
                  class="vamis-select__item"
                  :class="[
                    optionClassName,
                    {
                      'vamis-select__item--child': row.depth > 0,
                      'is-active': isSelected(row.option.value),
                      'is-disabled': row.option.disabled || locked,
                      'has-tpl': !!menuTpl,
                    },
                  ]"
                  @click="onPick(row.option)"
                >
                  <span
                    v-if="row.depth > 0 && ctl.config.value.multiple"
                    class="vamis-select__check"
                    :class="{ 'is-checked': isSelected(row.option.value) }"
                  >
                    <VamisIcon
                      name="menu-check"
                      v-if="isSelected(row.option.value)"
                    />
                  </span>
                  <span
                    v-else-if="useMobileTick && isSelected(row.option.value)"
                    class="vamis-select__mcheck"
                    aria-hidden="true"
                  >
                    <VamisIcon name="check" />
                  </span>
                  <span
                    v-else-if="!useMobileTick && ctl.config.value.multiple"
                    class="vamis-select__check"
                    :class="{ 'is-checked': isSelected(row.option.value) }"
                  >
                    <VamisIcon
                      name="menu-check"
                      v-if="isSelected(row.option.value)"
                    />
                  </span>
                  <SchemaRenderer
                    v-if="menuTpl != null"
                    class="vamis-select__item-label"
                    :schema="menuTpl"
                    :extra-data="menuData(row.option, row.index)"
                  />
                  <span v-else class="vamis-select__item-label">
                    <span
                      v-for="(part, partIndex) in optionLabelParts(row.option, row.option.disabled)"
                      :key="partIndex"
                      :class="{ 'is-matched': part.matched }"
                    >{{ part.text }}</span>
                  </span>
                </div>
              </template>
              <div v-if="!ctl.filtered.value.length" class="vamis-select__empty">{{ noResultsText }}</div>
            </div>
          </template>
        </div>
      </VamisPopUp>
      <VamisOverlay
        v-else
        :show="ctl.open.value"
        :target="triggerEl"
        :container="ctl.overlayContainer.value"
        :gap="4"
        :placement="overlayPlacement"
        @outside="closeMenu"
      >
        <div
          class="vamis-select__popover"
          :class="{
            'is-virtual': virtualEnabled,
            'is-transfer': isTransferMenu,
            'is-creatable': ctl.config.value.creatable,
            'is-group': isGroupMenu,
            'is-tree': isTreeMenu,
            'is-table': isTableMenu,
            'is-chained': isChainedMenu,
            'is-associated': isAssociatedMenu,
          }"
          :style="popoverStyle"
        >
          <div
            v-if="showSearch"
            class="vamis-select__search"
            :class="isTransferSearch ? 'vamis-select__search--box' : 'vamis-select__search--line'"
            @mousedown.stop
          >
            <div class="vamis-select__search-inner">
              <VamisIcon name="search" v-if="!isTransferSearch" class="vamis-select__search-icon" />
              <input
                ref="searchInputEl"
                :value="ctl.keyword.value"
                class="vamis-select__search-input"
                :placeholder="searchPlaceholder"
                @input="ctl.keyword.value = ($event.target as HTMLInputElement).value"
                @blur="onSearchBlur"
              >
              <button
                v-if="ctl.keyword.value"
                type="button"
                class="vamis-select__search-clear"
                aria-label="清除检索"
                @mousedown.prevent
                @click="clearSearch"
              ><VamisClose /></button>
              <VamisIcon name="search" v-else-if="isTransferSearch" class="vamis-select__search-icon" />
            </div>
          </div>
          <SelectAssociatedPane
            v-if="isAssociatedMenu"
            :schema="schema"
            :left-options="associatedLeftOptions"
            :nodes="associatedRightOptions"
            :selected-values="treeSelectedValues"
            :option-class-name="optionClassName"
            :loading-config="schema.loadingConfig"
            :reset-token="associatedResetToken"
            v-model:left-value="associatedLeftValue"
            :left-default-value="associatedLeftDefaultValue"
            :disabled="locked"
            @pick="onPick"
            @toggle="onTreeToggle"
            @toggle-all="onToggleAll"
            @update:nodes="replaceAssociatedRightNodes"
          />
          <SelectTreePane
            v-else-if="isTreeMenu"
            :schema="schema"
            :nodes="ctl.options.value"
            :visible-nodes="ctl.filtered.value"
            :selected-values="treeSelectedValues"
            :value="ctl.rawValue.value"
            :disabled="locked"
            :query="ctl.keyword.value"
            :loading-config="schema.loadingConfig"
            @update:nodes="ctl.replaceOptions"
            @toggle="onTreeToggle"
          />
          <SelectTablePane
            v-else-if="isTableMenu"
            :schema="tablePaneSchema"
            :nodes="tableOptions"
            :selected-values="tableSelectedValues"
            :disabled="locked"
            :query="ctl.keyword.value"
            @pick="onPick"
            @toggle-all="onToggleAll"
          />
          <SelectChainedPane
            v-else-if="isChainedMenu"
            :schema="schema"
            :nodes="ctl.filtered.value"
            :selected-values="treeSelectedValues"
            :option-class-name="optionClassName"
            :loading-config="schema.loadingConfig"
            :disabled="locked"
            @pick="onPick"
            @toggle-all="onToggleAll"
            @update:nodes="ctl.replaceOptions"
          />
          <template v-else>
            <div v-if="ctl.config.value.creatable" class="vamis-select__create">
              <button
                type="button"
                class="vamis-select__create-btn"
                :disabled="locked"
                @mousedown.prevent
                @click="onAdd"
              >
                {{ ctl.createLabel.value }}
              </button>
            </div>
            <div
              v-if="ctl.config.value.multiple && ctl.config.value.valuesNoWrap"
              class="vamis-select__values-summary"
            >
              {{ valuesNoWrapSummary }}
            </div>
            <button
              v-if="ctl.config.value.checkAll && ctl.config.value.multiple"
              type="button"
              class="vamis-select__checkall"
              @mousedown.prevent
              @click.stop="onToggleAll()"
            >
              <span
                class="vamis-select__check"
                :class="{ 'is-checked': allChecked, 'is-partial': checkAllPartial }"
              >
                <VamisIcon name="menu-check" v-if="allChecked" />
                <VamisIcon name="checkbox-partial" v-else-if="checkAllPartial" />
              </span>
              <span>{{ checkAllLabel }}</span>
            </button>
            <div
              ref="virtualListEl"
              class="vamis-select__list"
              :class="{ 'is-virtual': virtualEnabled }"
              :style="virtualEnabled ? { height: virtualViewportHeight + 'px' } : undefined"
              @scroll="onVirtualScroll"
            >
              <div
                v-if="virtualPadTop > 0"
                class="vamis-select__virtual-pad"
                :style="{ height: virtualPadTop + 'px' }"
                aria-hidden="true"
              />
              <template
                v-for="row in visibleMenuRows"
                :key="`${row.kind}-${row.index}`"
              >
                <div
                  v-if="row.kind === 'group'"
                  class="vamis-select__group"
                  :style="virtualEnabled ? { height: itemHeight + 'px' } : undefined"
                >
                  <div class="vamis-select__item-label vamis-select__group-label">
                    {{ optionLabelText(row.option) }}
                  </div>
                </div>
                <div
                  v-else
                  role="option"
                  class="vamis-select__item"
                  :class="[
                    optionClassName,
                    {
                      'vamis-select__item--child': row.depth > 0,
                      'is-active': isSelected(row.option.value),
                      'is-disabled': row.option.disabled || locked,
                      'has-tpl': !!menuTpl,
                    },
                  ]"
                  :style="virtualEnabled ? { height: itemHeight + 'px' } : undefined"
                  :title="optionLabelText(row.option)"
                  @mousedown.prevent
                  @click.stop="onPick(row.option)"
                >
                  <span
                    v-if="ctl.config.value.multiple"
                    class="vamis-select__check"
                    :class="{ 'is-checked': isSelected(row.option.value) }"
                  >
                    <VamisIcon
                      name="menu-check"
                      v-if="isSelected(row.option.value)"
                    />
                  </span>
                  <SchemaRenderer
                    v-if="menuTpl != null"
                    class="vamis-select__item-label"
                    :schema="menuTpl"
                    :extra-data="menuData(row.option, row.index)"
                  />
                  <span v-else class="vamis-select__item-label">
                    <span
                      v-for="(part, partIndex) in optionLabelParts(row.option, row.option.disabled)"
                      :key="partIndex"
                      :class="{ 'is-matched': part.matched }"
                    >{{ part.text }}</span>
                  </span>
                  <span
                    v-if="row.depth === 0 && (ctl.config.value.editable || ctl.config.value.removable)"
                    class="vamis-select__item-ops"
                  >
                    <button
                      v-if="ctl.config.value.editable"
                      type="button"
                      class="vamis-select__item-op"
                      aria-label="编辑"
                      :disabled="!!row.option.disabled || locked"
                      @mousedown.prevent
                      @click="onEdit(row.option, $event)"
                    >
                      <VamisIcon name="pencil" />
                    </button>
                    <button
                      v-if="ctl.config.value.removable"
                      type="button"
                      class="vamis-select__item-op"
                      aria-label="删除"
                      :disabled="!!row.option.disabled || locked"
                      @mousedown.prevent
                      @click="onDelete(row.option, $event)"
                    >
                      <VamisIcon name="close" />
                    </button>
                  </span>
                </div>
              </template>
              <div
                v-if="virtualPadBottom > 0"
                class="vamis-select__virtual-pad"
                :style="{ height: virtualPadBottom + 'px' }"
                aria-hidden="true"
              />
              <div v-if="ctl.loading.value && !ctl.filtered.value.length" class="vamis-select__loading">
                <Spinner :schema="{ type: 'spinner', show: true, size: 'sm' }" />
              </div>
              <div v-else-if="!ctl.filtered.value.length" class="vamis-select__empty">{{ noResultsText }}</div>
            </div>
          </template>
        </div>
      </VamisOverlay>
    </div>
  </FormItem>
</template>
