<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { VamisIcon } from '@vamis/ui'
import {
  SchemaRenderer,
  flattenVisibleOptions,
  hasTreeAbility,
  highlightTextMatches,
  optionValuesEqual,
  resolveIcon,
  type ResolvedIcon,
  type OptionItem,
  type SchemaNode,
} from '@vamis/core'
import Spinner from '../Spinner.vue'
import IconMark from '../IconMark.vue'

const props = withDefaults(defineProps<{
  nodes: OptionItem[]
  checked: (item: OptionItem) => boolean
  selected?: (item: OptionItem) => boolean
  partial?: (item: OptionItem) => boolean
  expanded: (item: OptionItem) => boolean
  deferring: (item: OptionItem) => boolean
  deferField?: string
  loadingConfig?: { root?: string; show?: boolean }
  disabled?: boolean
  outline?: boolean
  showIcon?: boolean
  multiple?: boolean
  showRadio?: boolean
  query?: string
  virtualThreshold?: number
  creatable?: boolean
  editable?: boolean
  removable?: boolean
  rootCreatable?: boolean
  isAdding?: boolean
  addingParent?: OptionItem | null
  editingItem?: OptionItem | null
  draftLabel?: string
  createTip?: string
  editTip?: string
  removeTip?: string
  rootCreateTip?: string
  itemActions?: SchemaNode | SchemaNode[]
  menuTpl?: SchemaNode
  iconField?: string
  enableDefaultIcon?: boolean
  nodeBehavior?: string[]
  checkDisabled?: (item: OptionItem) => boolean
}>(), {
  deferField: 'defer',
  iconField: 'icon',
  showIcon: true,
  enableDefaultIcon: true,
  nodeBehavior: () => ['check'],
  partial: () => false,
  query: '',
  createTip: '添加子节点',
  editTip: '编辑该节点',
  removeTip: '移除该节点',
  rootCreateTip: '添加一级节点',
  checkDisabled: () => false,
})

const emit = defineEmits<{
  pick: [item: OptionItem]
  expand: [item: OptionItem]
  add: [item: OptionItem | null]
  edit: [item: OptionItem]
  remove: [item: OptionItem]
  confirm: []
  cancel: []
  'update:draftLabel': [value: string]
}>()

const inputEl = ref<HTMLInputElement | HTMLInputElement[] | null>(null)
const treeEl = ref<HTMLElement | null>(null)
const rows = computed(() => flattenVisibleOptions(props.nodes, props.expanded))
const virtualThreshold = computed(() =>
  typeof props.virtualThreshold === 'number' && Number.isFinite(props.virtualThreshold)
    ? props.virtualThreshold
    : 0,
)
const virtualCandidate = computed(
  () => virtualThreshold.value > 0 && rows.value.length > virtualThreshold.value,
)
const virtualItemHeight = ref(0)
const virtualScrollTop = ref(0)
const virtualMeasuredViewport = ref(0)
const virtualProbeEl = ref<HTMLElement | null>(null)
let virtualMeasureTimer: ReturnType<typeof setTimeout> | undefined
let virtualMeasureFrame = 0
let virtualProbeObserver: ResizeObserver | undefined
const virtualThresholdViewport = computed(
  () => virtualItemHeight.value * Math.min(rows.value.length, virtualThreshold.value),
)
const virtualViewport = computed(() =>
  virtualMeasuredViewport.value > 0
    ? virtualMeasuredViewport.value
    : virtualThresholdViewport.value,
)
const virtualEnabled = computed(
  () => virtualCandidate.value && virtualItemHeight.value > 0,
)
const virtualStart = computed(() => {
  if (!virtualEnabled.value) return 0
  return Math.max(
    0,
    Math.floor(virtualScrollTop.value / virtualItemHeight.value) - 3,
  )
})
const virtualEnd = computed(() => {
  if (!virtualEnabled.value) return rows.value.length
  return Math.min(
    rows.value.length,
    Math.ceil(
      (virtualScrollTop.value + virtualViewport.value) / virtualItemHeight.value,
    ) + 3,
  )
})
const renderRows = computed(() => {
  if (!virtualCandidate.value) return rows.value
  if (!virtualEnabled.value) return rows.value.slice(0, 1)
  return rows.value.slice(virtualStart.value, virtualEnd.value)
})
const virtualPadTop = computed(() =>
  virtualEnabled.value ? virtualStart.value * virtualItemHeight.value : 0,
)
const virtualPadBottom = computed(() =>
  virtualEnabled.value
    ? (rows.value.length - virtualEnd.value) * virtualItemHeight.value
    : 0,
)
const showCheck = computed(() => props.multiple || props.showRadio)
const itemActionSchemas = computed<SchemaNode[]>(() =>
  Array.isArray(props.itemActions)
    ? props.itemActions
    : props.itemActions
      ? [props.itemActions]
      : [],
)
const addingRoot = computed(() => props.isAdding && props.addingParent == null)
const busy = computed(() => props.isAdding || !!props.editingItem)
const deferSpinnerSchema = computed(() => ({
  type: 'spinner',
  show: true,
  size: 'sm',
  loadingConfig: props.loadingConfig,
}))

function canExpand(node: OptionItem) {
  return !!node.children?.length || !!node[props.deferField]
}

function sameItem(a: OptionItem | null | undefined, b: OptionItem) {
  return !!a && (a === b || optionValuesEqual(a.value, b.value))
}

function isEditing(item: OptionItem) {
  return sameItem(props.editingItem, item)
}

function isAddingChild(item: OptionItem) {
  return !!props.isAdding && sameItem(props.addingParent, item)
}

function showAdd(item: OptionItem) {
  return (
    props.creatable &&
    hasTreeAbility(item, 'creatable') &&
    !(item[props.deferField] && !item.loaded)
  )
}

function showEdit(item: OptionItem) {
  return props.editable && hasTreeAbility(item, 'editable')
}

function showRemove(item: OptionItem) {
  return props.removable && hasTreeAbility(item, 'removable')
}

function checkLocked(item: OptionItem) {
  return props.disabled || !!item.disabled || !!props.checkDisabled(item)
}

function markClass(item: OptionItem) {
  const mixed = props.partial(item)
  const on = props.checked(item)
  return {
    'is-checked': on && !mixed,
    'is-partial': mixed,
    'is-disabled': checkLocked(item),
  }
}

function isSelected(item: OptionItem) {
  return props.selected ? props.selected(item) : props.checked(item)
}

function onPick(item: OptionItem) {
  if (checkLocked(item) || busy.value) return
  emit('pick', item)
}

function onNodeClick(item: OptionItem) {
  if (checkLocked(item) || busy.value) return
  const behaviors = Array.isArray(props.nodeBehavior) ? props.nodeBehavior : []
  if (behaviors.includes('unfold') && canExpand(item)) emit('expand', item)
  if (behaviors.includes('check')) emit('pick', item)
}

function onDraft(event: Event) {
  emit('update:draftLabel', (event.target as HTMLInputElement).value)
}

function measureVirtualRow(el: unknown) {
  if (!virtualCandidate.value || virtualEnabled.value || !(el instanceof HTMLElement)) return
  virtualProbeEl.value = el
  measureVirtualRowHeight()
  if (virtualItemHeight.value > 0) return
  virtualProbeObserver?.disconnect()
  if (typeof ResizeObserver !== 'undefined') {
    virtualProbeObserver = new ResizeObserver(measureVirtualRowHeight)
    virtualProbeObserver.observe(el)
  }
  if (virtualMeasureTimer) clearTimeout(virtualMeasureTimer)
  virtualMeasureTimer = setTimeout(measureVirtualRowHeight, 0)
  if (typeof requestAnimationFrame !== 'undefined') {
    if (virtualMeasureFrame) cancelAnimationFrame(virtualMeasureFrame)
    virtualMeasureFrame = requestAnimationFrame(measureVirtualRowHeight)
  }
}

function measureVirtualRowHeight() {
  const el = virtualProbeEl.value
  if (!el || !virtualCandidate.value || virtualEnabled.value) return
  const height = el.offsetHeight
  if (height <= 0) return
  virtualItemHeight.value = height
  virtualProbeObserver?.disconnect()
  virtualProbeObserver = undefined
  if (virtualMeasureTimer) clearTimeout(virtualMeasureTimer)
  virtualMeasureTimer = undefined
  if (virtualMeasureFrame) cancelAnimationFrame(virtualMeasureFrame)
  virtualMeasureFrame = 0
}

function onVirtualScroll(event: Event) {
  if (!virtualEnabled.value) return
  const tree = event.currentTarget as HTMLElement
  virtualScrollTop.value = tree.scrollTop
  if (tree.clientHeight > 0) virtualMeasuredViewport.value = tree.clientHeight
}

let virtualResizeObserver: ResizeObserver | undefined

function measureVirtualViewport() {
  const height = treeEl.value?.clientHeight ?? 0
  if (height > 0) virtualMeasuredViewport.value = height
}

watch(virtualEnabled, async (enabled) => {
  virtualResizeObserver?.disconnect()
  virtualResizeObserver = undefined
  if (!enabled) {
    virtualMeasuredViewport.value = 0
    return
  }
  await nextTick()
  measureVirtualViewport()
  if (typeof ResizeObserver !== 'undefined' && treeEl.value) {
    virtualResizeObserver = new ResizeObserver(measureVirtualViewport)
    virtualResizeObserver.observe(treeEl.value)
  }
})

watch(
  () =>
    [
      rows.value.length,
      virtualCandidate.value,
      virtualItemHeight.value,
      virtualViewport.value,
    ] as const,
  ([nextLength], [previousLength]) => {
    const tree = treeEl.value
    if (!virtualEnabled.value) {
      virtualScrollTop.value = 0
      if (tree) tree.scrollTop = 0
      return
    }
    const maxScrollTop = Math.max(
      0,
      rows.value.length * virtualItemHeight.value - virtualViewport.value,
    )
    const nextScrollTop =
      nextLength < previousLength
        ? Math.min(virtualScrollTop.value, maxScrollTop)
        : virtualScrollTop.value
    virtualScrollTop.value = nextScrollTop
    if (tree && tree.scrollTop !== nextScrollTop) tree.scrollTop = nextScrollTop
  },
)

onBeforeUnmount(() => {
  virtualResizeObserver?.disconnect()
  virtualProbeObserver?.disconnect()
  if (virtualMeasureTimer) clearTimeout(virtualMeasureTimer)
  if (virtualMeasureFrame) cancelAnimationFrame(virtualMeasureFrame)
})

function actionData(item: OptionItem, index: number) {
  return {
    ...item,
    index,
    multiple: !!props.multiple,
    checked: props.checked(item),
    disabled: checkLocked(item),
  }
}

function customNodeIcon(item: OptionItem): ResolvedIcon {
  const value = props.iconField ? item[props.iconField] : undefined
  return resolveIcon(value)
}

const emptyIcon = (icon: ResolvedIcon) => icon.kind === 'empty'

watch(
  () => [props.isAdding, props.editingItem],
  () => {
    void nextTick(() => {
      const current = Array.isArray(inputEl.value) ? inputEl.value[0] : inputEl.value
      if (current && typeof current.focus === 'function') current.focus()
    })
  },
)
</script>

<template>
  <div
    ref="treeEl"
    class="vamis-tree"
    :class="{ 'is-outline': outline, 'is-virtual': virtualEnabled }"
    :style="virtualEnabled ? { height: virtualViewport + 'px' } : undefined"
    @scroll="onVirtualScroll"
  >
    <ul class="vamis-tree__list">
      <li v-if="creatable && rootCreatable" class="vamis-tree__item">
        <a
          class="vamis-tree__add-top"
          :class="{ 'is-disabled': disabled || busy }"
          @click="!(disabled || busy) && emit('add', null)"
        >
          <VamisIcon name="plus" />
          <span>{{ rootCreateTip }}</span>
        </a>
      </li>
      <li v-if="addingRoot" class="vamis-tree__item">
        <div class="vamis-tree__label">
          <div class="vamis-tree__item-input">
            <input
              ref="inputEl"
              class="vamis-tree__native"
              :value="draftLabel"
              placeholder="请输入"
              @input="onDraft"
              @keydown.enter.prevent="emit('confirm')"
              @keydown.esc.prevent="emit('cancel')"
            >
            <a class="vamis-tree__input-action" aria-label="取消" @click="emit('cancel')">
              <VamisIcon name="close" />
            </a>
            <a class="vamis-tree__input-action" aria-label="确认" @click="emit('confirm')">
              <VamisIcon name="check" />
            </a>
          </div>
        </div>
      </li>
      <li
        v-if="virtualPadTop > 0"
        class="vamis-tree__virtual-pad"
        :style="{ height: virtualPadTop + 'px' }"
        aria-hidden="true"
      />
      <template v-for="(row, index) in renderRows" :key="`${index}:${String(row.item.value)}`">
        <li
          :ref="virtualCandidate && !virtualEnabled ? measureVirtualRow : undefined"
          class="vamis-tree__item"
          :class="{ 'is-child': row.depth > 0, 'is-leaf': !canExpand(row.item) }"
          :style="{ '--tree-depth': row.depth }"
        >
          <div
            v-if="isEditing(row.item)"
            class="vamis-tree__label"
          >
            <i
              v-if="showCheck"
              class="vamis-tree__check vamis-checkbox__mark"
              :class="markClass(row.item)"
              aria-hidden="true"
            >
              <VamisIcon name="checkbox-check" class="vamis-checkbox__icon vamis-checkbox__icon--check" />
              <VamisIcon name="checkbox-partial" class="vamis-checkbox__icon vamis-checkbox__icon--partial" />
            </i>
            <div class="vamis-tree__item-input">
              <input
                ref="inputEl"
                class="vamis-tree__native"
                :value="draftLabel"
                placeholder="请输入"
                @input="onDraft"
                @keydown.enter.prevent="emit('confirm')"
                @keydown.esc.prevent="emit('cancel')"
              >
              <a class="vamis-tree__input-action" aria-label="取消" @click.stop="emit('cancel')">
                <VamisIcon name="close" />
              </a>
              <a class="vamis-tree__input-action" aria-label="确认" @click.stop="emit('confirm')">
                <VamisIcon name="check" />
              </a>
            </div>
          </div>
          <div
            v-else
            class="vamis-tree__label"
            :class="{
              'is-disabled': checkLocked(row.item),
              'is-checked': isSelected(row.item),
            }"
          >
            <div
              v-if="canExpand(row.item)"
              class="vamis-tree__arrow"
              role="button"
              :tabindex="disabled || row.item.disabled ? -1 : 0"
              :aria-label="expanded(row.item) ? '收起' : '展开'"
              @click.stop="emit('expand', row.item)"
              @keydown.enter.prevent="emit('expand', row.item)"
              @keydown.space.prevent="emit('expand', row.item)"
            >
              <Spinner v-if="deferring(row.item)" :schema="deferSpinnerSchema" />
              <span v-else class="vamis-tree__arrow-icon" :class="{ 'is-folded': !expanded(row.item) }">
                <VamisIcon name="down-arrow-bold" />
              </span>
            </div>
            <span v-else class="vamis-tree__arrow-placeholder" aria-hidden="true" />
            <i
              v-if="showCheck"
              class="vamis-tree__check vamis-checkbox__mark"
              :class="markClass(row.item)"
              role="checkbox"
              :aria-checked="partial(row.item) ? 'mixed' : checked(row.item)"
              :aria-disabled="checkLocked(row.item) ? 'true' : undefined"
              @click.stop="onPick(row.item)"
            >
              <VamisIcon name="checkbox-check" class="vamis-checkbox__icon vamis-checkbox__icon--check" />
              <VamisIcon name="checkbox-partial" class="vamis-checkbox__icon vamis-checkbox__icon--partial" />
            </i>
            <div
              class="vamis-tree__content"
              :class="{ 'is-checked': isSelected(row.item) }"
              role="button"
              :tabindex="checkLocked(row.item) ? -1 : 0"
              @click="onNodeClick(row.item)"
              @keydown.enter.prevent="onNodeClick(row.item)"
              @keydown.space.prevent="onNodeClick(row.item)"
            >
              <span v-if="showIcon" class="vamis-tree__node-icon" aria-hidden="true">
                <IconMark
                  v-if="!emptyIcon(customNodeIcon(row.item))"
                  :icon="customNodeIcon(row.item)"
                />
                <VamisIcon
                  v-else-if="enableDefaultIcon"
                  :name="canExpand(row.item) ? 'folder' : 'file'"
                />
              </span>
              <span class="vamis-tree__text" :title="row.item.label">
                <div v-if="menuTpl" class="vamis-tree__menu-tpl">
                  <SchemaRenderer
                    :schema="menuTpl"
                    :extra-data="actionData(row.item, index)"
                  />
                </div>
                <template v-else-if="query">
                  <span
                    v-for="(part, partIndex) in highlightTextMatches(row.item.label, query)"
                    :key="partIndex"
                    :class="{ 'is-matched': part.matched }"
                  >{{ part.text }}</span>
                </template>
                <template v-else>{{ row.item.label }}</template>
              </span>
              <div
                v-if="
                  !disabled &&
                  (showAdd(row.item) ||
                    showEdit(row.item) ||
                    showRemove(row.item) ||
                    itemActionSchemas.length)
                "
                class="vamis-tree__icons"
                @click.stop
              >
                <a
                  v-if="showAdd(row.item)"
                  class="vamis-tree__icon-btn"
                  :aria-label="createTip"
                  @click="emit('add', row.item)"
                >
                  <VamisIcon name="plus" />
                </a>
                <a
                  v-if="showRemove(row.item)"
                  class="vamis-tree__icon-btn"
                  :aria-label="removeTip"
                  @click="emit('remove', row.item)"
                >
                  <VamisIcon name="minus" />
                </a>
                <a
                  v-if="showEdit(row.item)"
                  class="vamis-tree__icon-btn"
                  :aria-label="editTip"
                  @click="emit('edit', row.item)"
                >
                  <VamisIcon name="new-edit" />
                </a>
                <div
                  v-if="itemActionSchemas.length"
                  class="vamis-tree__item-actions"
                >
                  <SchemaRenderer
                    v-for="(action, actionIndex) in itemActionSchemas"
                    :key="actionIndex"
                    :schema="action"
                    :extra-data="actionData(row.item, index)"
                  />
                </div>
              </div>
            </div>
          </div>
        </li>
        <li
          v-if="isAddingChild(row.item)"
          class="vamis-tree__item is-child"
          :style="{ '--tree-depth': row.depth + 1 }"
        >
          <div class="vamis-tree__label">
            <span class="vamis-tree__arrow-placeholder" aria-hidden="true" />
            <div class="vamis-tree__item-input">
              <input
                ref="inputEl"
                class="vamis-tree__native"
                :value="draftLabel"
                placeholder="请输入"
                @input="onDraft"
                @keydown.enter.prevent="emit('confirm')"
                @keydown.esc.prevent="emit('cancel')"
              >
              <a class="vamis-tree__input-action" aria-label="取消" @click="emit('cancel')">
                <VamisIcon name="close" />
              </a>
              <a class="vamis-tree__input-action" aria-label="确认" @click="emit('confirm')">
                <VamisIcon name="check" />
              </a>
            </div>
          </div>
        </li>
      </template>
      <li
        v-if="virtualPadBottom > 0"
        class="vamis-tree__virtual-pad"
        :style="{ height: virtualPadBottom + 'px' }"
        aria-hidden="true"
      />
    </ul>
  </div>
</template>
