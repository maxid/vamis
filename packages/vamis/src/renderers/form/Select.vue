<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import {
  CALENDAR_PICKER_VISIBLE,
  SELECT_PICKER_ITEM_HEIGHT,
  SchemaRenderer,
  calcSelectOverlayWidth,
  countVisibleTagsByWidth,
  filterTpl,
  isAllSelected,
  isGroupOption,
  overlayIsMobile,
  POPUP_DEFAULT_HEIGHT,
  resolveClassName,
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
import { Pencil, VamisCaret, VamisClear, XIcon } from '@vamis/ui'
import FormItem from '../FormItem.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'
import VamisPopUp from '../../overlay/VamisPopUp.vue'
import VamisTooltipLayer from '../../overlay/VamisTooltipLayer.vue'
import CalendarWheel from '../display/CalendarWheel.vue'
import PickerFade from '../calendar/PickerFade.vue'
import Spinner from '../Spinner.vue'
import { useOptionsControl } from '../../optionsControl'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const schemaRef = toRef(props, 'schema')
const disabledRef = toRef(props, 'disabled')
const data = useData()
const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLElement | null>(null)
const valueEl = ref<HTMLElement | null>(null)
const measureEl = ref<HTMLElement | null>(null)
const overflowEl = ref<HTMLElement | null>(null)
const triggerWidth = ref(0)
const visibleByWidth = ref(Number.POSITIVE_INFINITY)
const overflowTip = ref(false)
const tagTip = ref(false)
const tagTipEl = ref<HTMLElement | null>(null)
const tagTipLabel = ref('')
const creating = ref(false)
const createDraft = ref<Record<string, string>>({})
let foldObserver: ResizeObserver | undefined
let overflowHideTimer: ReturnType<typeof setTimeout> | undefined
let tagTipHideTimer: ReturnType<typeof setTimeout> | undefined

const ctl = useOptionsControl(schemaRef, disabledRef)
const env = useEnv()
const viewportTick = ref(0)
const locked = computed(() => !!props.disabled)
const isMobile = computed(() => {
  viewportTick.value
  return overlayIsMobile(props.schema, env)
})
const pickerHeight = SELECT_PICKER_ITEM_HEIGHT * CALENDAR_PICKER_VISIBLE
const popupHeight = computed(() =>
  selectPopupHeight(
    props.schema.overlay,
    isGroupMenu.value ? POPUP_DEFAULT_HEIGHT : undefined,
  ),
)
const mobileDraft = ref<OptionItem[]>([])
const mobileWheelIndex = ref(0)
const checkAllLabel = computed(() =>
  props.schema.checkAllLabel != null ? String(props.schema.checkAllLabel) : '全选',
)
const addControls = computed(() => (Array.isArray(props.schema.addControls) ? props.schema.addControls : []))
function leafOptions(list: OptionItem[]): OptionItem[] {
  const out: OptionItem[] = []
  for (const item of list) {
    if (Array.isArray(item.children) && item.children.length) out.push(...leafOptions(item.children))
    else out.push(item)
  }
  return out
}
const mobileLeaves = computed(() => leafOptions(ctl.filtered.value))
const mobileWheelOptions = computed((): CalendarPickerOption[] =>
  mobileLeaves.value.map((item, i) => ({
    value: i,
    text: String(item.label ?? item.value ?? ''),
  })),
)
function selectedPool() {
  return isMobile.value && ctl.open.value ? mobileDraft.value : ctl.selected.value
}
const allChecked = computed(() =>
  isAllSelected(selectedPool(), ctl.filtered.value, ctl.config.value.valueField),
)
const menuTpl = computed(() => props.schema.menuTpl as SchemaNode | undefined)
const noResultsText = computed(() =>
  props.schema.noResultsText != null ? String(props.schema.noResultsText) : '未找到任何结果',
)
const optionClassName = computed(() => resolveClassName(props.schema.optionClassName, data.value))
const isGroupMenu = computed(() => {
  const mode = String(props.schema.selectMode || '')
  if (mode === 'group') return true
  return ctl.options.value.some((item) => isGroupOption(item))
})
/** 对齐 Amis：普通单选才走 Picker 滚轮；multiple / selectMode:group 走列表。 */
const useMobileWheel = computed(
  () => isMobile.value && !ctl.config.value.multiple && !isGroupMenu.value,
)
const showSearch = computed(
  () => !!(ctl.config.value.searchable || ctl.autoComplete.value || props.schema.searchApi),
)
const searchPlaceholder = computed(() => {
  if (props.schema.searchPlaceholder != null) return String(props.schema.searchPlaceholder)
  if (isGroupMenu.value) {
    return isMobile.value ? filterTpl(ctl.placeholder.value, data.value) : '请输入关键字'
  }
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
const overlayPlacement = computed(() => selectOverlayPlacement(props.schema.overlay))
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

function scheduleMeasure() {
  void nextTick(measureTags)
}

function toggleOpen() {
  if (locked.value) return
  const next = !ctl.open.value
  ctl.open.value = next
  triggerWidth.value = rootEl.value?.offsetWidth || 0
  if (next && (ctl.autoComplete.value || props.schema.searchApi)) {
    ctl.scheduleAutoComplete(ctl.keyword.value)
  }
}

function closeMenu() {
  ctl.open.value = false
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

function startCreate() {
  creating.value = true
  const labelField = ctl.config.value.labelField || 'label'
  createDraft.value = { [labelField]: '' }
  for (const item of addControls.value) {
    if (item && typeof item === 'object' && (item as SchemaObject).name) {
      createDraft.value[String((item as SchemaObject).name)] = ''
    }
  }
}

async function confirmCreate() {
  const values = { ...createDraft.value }
  const labelField = ctl.config.value.labelField || 'label'
  if (!String(values[labelField] ?? values.label ?? '').trim() && !addControls.value.length) return
  creating.value = false
  await ctl.createOption(values)
  createDraft.value = {}
}

function cancelCreate() {
  creating.value = false
  createDraft.value = {}
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

async function onToggleAll() {
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
  foldObserver = new ResizeObserver(() => measureTags())
  if (valueEl.value) foldObserver.observe(valueEl.value)
  scheduleMeasure()
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
  if (media && onMedia) media.removeEventListener('change', onMedia)
})

watch(
  () => [ctl.selected.value, triggerWidth.value, props.schema.maxTagCount] as const,
  scheduleMeasure,
)

watch(
  () => ctl.open.value,
  (open) => {
    if (open && isMobile.value) syncMobileDraft()
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
        'is-nowrap': ctl.config.value.valuesNoWrap,
        'is-group': isGroupMenu,
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
              v-for="(item, index) in visibleTags"
              :key="`${item.value}-${index}`"
              class="vamis-select__chip"
              @mouseenter="showTagTip($event, item.label)"
              @mouseleave="hideTagTip"
            >
              <span class="vamis-select__chip-label">{{ item.label }}</span>
              <button
                v-if="!locked && !item.disabled"
                type="button"
                class="vamis-select__chip-close"
                aria-label="移除"
                @mousedown.prevent
                @click="removeTag(item, $event)"
              >×</button>
            </span>
            <span
              v-if="restTags.length"
              ref="overflowEl"
              class="vamis-select__chip vamis-select__overflow"
              @mouseenter="showOverflow"
              @mouseleave="hideOverflow"
            >+ {{ restTags.length }} ...</span>
          </template>
          <span v-else-if="ctl.selected.value[0]" class="vamis-select__single">{{ ctl.selected.value[0].label }}</span>
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
            <span class="vamis-select__chip-label">{{ item.label }}</span>
            <button v-if="!locked && !item.disabled" type="button" class="vamis-select__chip-close">×</button>
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
          <VamisCaret class="vamis-select__caret" :open="!isMobile && ctl.open.value" />
        </span>
      </div>
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
            >
              <span class="vamis-select__chip-label">{{ item.label }}</span>
              <button
                v-if="!locked && !item.disabled"
                type="button"
                class="vamis-select__chip-close"
                aria-label="移除"
                @mousedown.prevent
                @click="removeTag(item, $event)"
              >×</button>
            </span>
          </div>
        </template>
      </VamisTooltipLayer>
      <VamisPopUp
        v-if="isMobile"
        :show="ctl.open.value"
        :height="popupHeight"
        :container="ctl.overlayContainer.value"
        @cancel="closeMenu"
        @confirm="confirmMobile"
      >
        <div
          v-if="showSearch"
          class="vamis-select__search"
          :class="isGroupMenu ? 'vamis-select__search--sheet' : 'vamis-select__search--line'"
        >
          <div class="vamis-select__search-inner">
            <svg
              v-if="!isGroupMenu"
              class="vamis-select__search-icon"
              viewBox="0 0 18 18"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M2 8c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6Zm16 8.586L14.314 12.9A7.955 7.955 0 0 0 16 8a8 8 0 1 0-8 8 7.955 7.955 0 0 0 4.9-1.686L16.586 18 18 16.586Z"
              />
            </svg>
            <input
              :value="ctl.keyword.value"
              class="vamis-select__search-input"
              :placeholder="searchPlaceholder"
              @input="ctl.keyword.value = ($event.target as HTMLInputElement).value"
            >
            <button
              v-if="ctl.keyword.value"
              type="button"
              class="vamis-select__search-clear"
              aria-label="清除检索"
              @click="clearSearch"
            >×</button>
            <svg
              v-else-if="isGroupMenu"
              class="vamis-select__search-icon"
              viewBox="0 0 18 18"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M2 8c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6Zm16 8.586L14.314 12.9A7.955 7.955 0 0 0 16 8a8 8 0 1 0-8 8 7.955 7.955 0 0 0 4.9-1.686L16.586 18 18 16.586Z"
              />
            </svg>
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
                class="vamis-select__item-label"
                :schema="menuTpl"
                :extra-data="menuData(mobileLeaves[index], index, checked)"
              />
              <template v-else>{{ item.text }}</template>
            </template>
          </CalendarWheel>
          <PickerFade class="vamis-picker-fade" />
          <div class="vamis-popup__frame" :style="{ height: `${SELECT_PICKER_ITEM_HEIGHT}px` }" />
        </div>
        <div v-else class="vamis-select__popover vamis-select__popover--sheet">
          <button
            v-if="ctl.config.value.checkAll && ctl.config.value.multiple"
            type="button"
            class="vamis-select__checkall"
            @click="onToggleAll()"
          >
            <span class="vamis-select__check" :class="{ 'is-checked': allChecked }">
              <svg v-if="allChecked" viewBox="0 0 16 16" aria-hidden="true">
                <path fill="currentColor" d="M6.4 11.2 3.2 8l1.05-1.05L6.4 9.1l5.35-5.35L12.8 4.8z" />
              </svg>
            </span>
            <span>{{ checkAllLabel }}</span>
          </button>
          <div class="vamis-select__list">
            <template v-for="(opt, index) in ctl.filtered.value" :key="'m-' + String(opt.value ?? opt.label) + '-' + index">
              <div v-if="isGroupOption(opt)" class="vamis-select__group">
                <div class="vamis-select__group-label">{{ opt.label }}</div>
                <div
                  v-for="(child, ci) in opt.children"
                  :key="'m-' + String(child.value) + '-' + ci"
                  role="option"
                  class="vamis-select__item vamis-select__item--child"
                  :class="[optionClassName, { 'is-active': isSelected(child.value), 'is-disabled': child.disabled || locked, 'has-tpl': !!menuTpl }]"
                  @click="onPick(child)"
                >
                  <span
                    v-if="ctl.config.value.multiple"
                    class="vamis-select__check"
                    :class="{ 'is-checked': isSelected(child.value) }"
                  >
                    <svg v-if="isSelected(child.value)" viewBox="0 0 16 16" aria-hidden="true">
                      <path fill="currentColor" d="M6.4 11.2 3.2 8l1.05-1.05L6.4 9.1l5.35-5.35L12.8 4.8z" />
                    </svg>
                  </span>
                  <SchemaRenderer
                    v-if="menuTpl != null"
                    class="vamis-select__item-label"
                    :schema="menuTpl"
                    :extra-data="menuData(child, ci)"
                  />
                  <span v-else class="vamis-select__item-label">{{ child.label }}</span>
                </div>
              </div>
              <div
                v-else
                role="option"
                class="vamis-select__item"
                :class="[optionClassName, { 'is-active': isSelected(opt.value), 'is-disabled': opt.disabled || locked, 'has-tpl': !!menuTpl }]"
                @click="onPick(opt)"
              >
                <span
                  v-if="ctl.config.value.multiple"
                  class="vamis-select__check"
                  :class="{ 'is-checked': isSelected(opt.value) }"
                >
                  <svg v-if="isSelected(opt.value)" viewBox="0 0 16 16" aria-hidden="true">
                    <path fill="currentColor" d="M6.4 11.2 3.2 8l1.05-1.05L6.4 9.1l5.35-5.35L12.8 4.8z" />
                  </svg>
                </span>
                <SchemaRenderer
                  v-if="menuTpl != null"
                  class="vamis-select__item-label"
                  :schema="menuTpl"
                  :extra-data="menuData(opt, index)"
                />
                <span v-else class="vamis-select__item-label">{{ opt.label }}</span>
              </div>
            </template>
            <div v-if="!ctl.filtered.value.length" class="vamis-select__empty">{{ noResultsText }}</div>
          </div>
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
        <div class="vamis-select__popover" :style="popoverStyle">
          <div
            v-if="showSearch"
            class="vamis-select__search"
            :class="isGroupMenu ? 'vamis-select__search--box' : 'vamis-select__search--line'"
            @mousedown.stop
          >
            <div class="vamis-select__search-inner">
              <svg
                v-if="!isGroupMenu"
                class="vamis-select__search-icon"
                viewBox="0 0 18 18"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M2 8c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6Zm16 8.586L14.314 12.9A7.955 7.955 0 0 0 16 8a8 8 0 1 0-8 8 7.955 7.955 0 0 0 4.9-1.686L16.586 18 18 16.586Z"
                />
              </svg>
              <input
                :value="ctl.keyword.value"
                class="vamis-select__search-input"
                :placeholder="searchPlaceholder"
                @input="ctl.keyword.value = ($event.target as HTMLInputElement).value"
              >
              <button
                v-if="ctl.keyword.value"
                type="button"
                class="vamis-select__search-clear"
                aria-label="清除检索"
                @mousedown.prevent
                @click="clearSearch"
              >×</button>
              <svg
                v-else-if="isGroupMenu"
                class="vamis-select__search-icon"
                viewBox="0 0 18 18"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M2 8c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6Zm16 8.586L14.314 12.9A7.955 7.955 0 0 0 16 8a8 8 0 1 0-8 8 7.955 7.955 0 0 0 4.9-1.686L16.586 18 18 16.586Z"
                />
              </svg>
            </div>
          </div>
          <button
            v-if="ctl.config.value.checkAll && ctl.config.value.multiple"
            type="button"
            class="vamis-select__checkall"
            @mousedown.prevent
            @click.stop="onToggleAll()"
          >
            <span class="vamis-select__check" :class="{ 'is-checked': allChecked }">
              <svg v-if="allChecked" viewBox="0 0 16 16" aria-hidden="true">
                <path fill="currentColor" d="M6.4 11.2 3.2 8l1.05-1.05L6.4 9.1l5.35-5.35L12.8 4.8z" />
              </svg>
            </span>
            <span>{{ checkAllLabel }}</span>
          </button>
          <div class="vamis-select__list">
            <template v-for="(opt, index) in ctl.filtered.value" :key="String(opt.value ?? opt.label) + '-' + index">
              <div v-if="isGroupOption(opt)" class="vamis-select__group">
                <div class="vamis-select__group-label">{{ opt.label }}</div>
                <div
                  v-for="(child, ci) in opt.children"
                  :key="String(child.value) + '-' + ci"
                  role="option"
                  class="vamis-select__item vamis-select__item--child"
                  :class="[optionClassName, { 'is-active': isSelected(child.value), 'is-disabled': child.disabled || locked, 'has-tpl': !!menuTpl }]"
                  :title="child.label"
                  @mousedown.prevent
                  @click.stop="onPick(child)"
                >
                  <span
                    v-if="ctl.config.value.multiple"
                    class="vamis-select__check"
                    :class="{ 'is-checked': isSelected(child.value) }"
                  >
                    <svg v-if="isSelected(child.value)" viewBox="0 0 16 16" aria-hidden="true">
                      <path fill="currentColor" d="M6.4 11.2 3.2 8l1.05-1.05L6.4 9.1l5.35-5.35L12.8 4.8z" />
                    </svg>
                  </span>
                  <SchemaRenderer
                    v-if="menuTpl != null"
                    class="vamis-select__item-label"
                    :schema="menuTpl"
                    :extra-data="menuData(child, ci)"
                  />
                  <span v-else class="vamis-select__item-label">{{ child.label }}</span>
                </div>
              </div>
              <div
                v-else
                role="option"
                class="vamis-select__item"
                :class="[optionClassName, { 'is-active': isSelected(opt.value), 'is-disabled': opt.disabled || locked, 'has-tpl': !!menuTpl }]"
                :title="opt.label"
                @mousedown.prevent
                  @click.stop="onPick(opt)"
              >
                <span
                  v-if="ctl.config.value.multiple"
                  class="vamis-select__check"
                  :class="{ 'is-checked': isSelected(opt.value) }"
                >
                  <svg v-if="isSelected(opt.value)" viewBox="0 0 16 16" aria-hidden="true">
                    <path fill="currentColor" d="M6.4 11.2 3.2 8l1.05-1.05L6.4 9.1l5.35-5.35L12.8 4.8z" />
                  </svg>
                </span>
                <SchemaRenderer
                  v-if="menuTpl != null"
                  class="vamis-select__item-label"
                  :schema="menuTpl"
                  :extra-data="menuData(opt, index)"
                />
                <span v-else class="vamis-select__item-label">{{ opt.label }}</span>
                <span
                  v-if="ctl.config.value.editable || ctl.config.value.removable"
                  class="vamis-select__item-ops"
                >
                  <button
                    v-if="ctl.config.value.editable"
                    type="button"
                    class="vamis-select__item-op"
                    aria-label="编辑"
                    :disabled="!!opt.disabled || locked"
                    @mousedown.prevent
                    @click="onEdit(opt, $event)"
                  >
                    <Pencil />
                  </button>
                  <button
                    v-if="ctl.config.value.removable"
                    type="button"
                    class="vamis-select__item-op"
                    aria-label="删除"
                    :disabled="!!opt.disabled || locked"
                    @mousedown.prevent
                    @click="onDelete(opt, $event)"
                  >
                    <XIcon />
                  </button>
                </span>
              </div>
            </template>
            <div v-if="ctl.loading.value && !ctl.filtered.value.length" class="vamis-select__loading">
              <Spinner :schema="{ type: 'spinner', show: true, size: 'sm' }" />
            </div>
            <div v-else-if="!ctl.filtered.value.length" class="vamis-select__empty">{{ noResultsText }}</div>
          </div>
          <div v-if="ctl.config.value.creatable" class="vamis-select__create">
            <button
              v-if="!creating"
              type="button"
              class="vamis-select__create-btn"
              :disabled="locked"
              @mousedown.prevent
              @click.stop="startCreate"
            >
              {{ ctl.createLabel.value }}
            </button>
            <div v-else class="vamis-select__create-form" @mousedown.stop>
              <template v-if="addControls.length">
                <input
                  v-for="item in addControls"
                  :key="String((item as SchemaObject).name)"
                  class="vamis-select__create-input"
                  :placeholder="String((item as SchemaObject).label || (item as SchemaObject).placeholder || (item as SchemaObject).name || '')"
                  :value="createDraft[String((item as SchemaObject).name)]"
                  @input="createDraft[String((item as SchemaObject).name)] = ($event.target as HTMLInputElement).value"
                >
              </template>
              <input
                v-else
                class="vamis-select__create-input"
                placeholder="请输入名称"
                :value="createDraft[ctl.config.value.labelField || 'label']"
                @input="createDraft[ctl.config.value.labelField || 'label'] = ($event.target as HTMLInputElement).value"
              >
              <div class="vamis-select__create-actions">
                <button type="button" class="vamis-select__create-btn" @click="confirmCreate">确定</button>
                <button type="button" class="vamis-select__create-btn is-muted" @click="cancelCreate">取消</button>
              </div>
            </div>
          </div>
        </div>
      </VamisOverlay>
    </div>
  </FormItem>
</template>
