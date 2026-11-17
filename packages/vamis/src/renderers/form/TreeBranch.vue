<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { VamisIcon } from '@vamis/ui'
import { flattenVisibleOptions, hasTreeAbility, highlightTextMatches, optionValuesEqual, type OptionItem } from '@vamis/core'
import Spinner from '../Spinner.vue'

const props = withDefaults(defineProps<{
  nodes: OptionItem[]
  checked: (item: OptionItem) => boolean
  partial?: (item: OptionItem) => boolean
  expanded: (item: OptionItem) => boolean
  deferring: (item: OptionItem) => boolean
  deferField?: string
  disabled?: boolean
  outline?: boolean
  showIcon?: boolean
  multiple?: boolean
  showRadio?: boolean
  query?: string
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
}>(), {
  deferField: 'defer',
  showIcon: true,
  partial: () => false,
  query: '',
  createTip: '添加子节点',
  editTip: '编辑该节点',
  removeTip: '移除该节点',
  rootCreateTip: '添加一级节点',
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

const inputEl = ref<HTMLInputElement | null>(null)
const rows = computed(() => flattenVisibleOptions(props.nodes, props.expanded))
const showCheck = computed(() => props.multiple || props.showRadio)
const addingRoot = computed(() => props.isAdding && props.addingParent == null)
const busy = computed(() => props.isAdding || !!props.editingItem)

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

function markClass(item: OptionItem) {
  const mixed = props.partial(item)
  const on = props.checked(item)
  return {
    'is-checked': on && !mixed,
    'is-partial': mixed,
    'is-disabled': props.disabled || item.disabled,
  }
}

function onDraft(event: Event) {
  emit('update:draftLabel', (event.target as HTMLInputElement).value)
}

watch(
  () => [props.isAdding, props.editingItem],
  () => {
    void nextTick(() => inputEl.value?.focus())
  },
)
</script>

<template>
  <div class="vamis-tree" :class="{ 'is-outline': outline }">
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
      <template v-for="(row, index) in rows" :key="`${index}:${String(row.item.value)}`">
        <li
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
            :class="{ 'is-disabled': disabled || row.item.disabled }"
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
              <Spinner v-if="deferring(row.item)" :schema="{ type: 'spinner', show: true, size: 'sm' }" />
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
              :aria-disabled="disabled || row.item.disabled ? 'true' : undefined"
              @click.stop="emit('pick', row.item)"
            >
              <VamisIcon name="checkbox-check" class="vamis-checkbox__icon vamis-checkbox__icon--check" />
              <VamisIcon name="checkbox-partial" class="vamis-checkbox__icon vamis-checkbox__icon--partial" />
            </i>
            <div
              class="vamis-tree__content"
              :class="{ 'is-checked': checked(row.item) }"
              role="button"
              :tabindex="disabled || row.item.disabled ? -1 : 0"
              @click="emit('pick', row.item)"
              @keydown.enter.prevent="emit('pick', row.item)"
              @keydown.space.prevent="emit('pick', row.item)"
            >
              <span v-if="showIcon" class="vamis-tree__node-icon" aria-hidden="true">
                <VamisIcon :name="canExpand(row.item) ? 'folder' : 'file'" />
              </span>
              <span class="vamis-tree__text" :title="row.item.label">
                <template v-if="query">
                  <span
                    v-for="(part, partIndex) in highlightTextMatches(row.item.label, query)"
                    :key="partIndex"
                    :class="{ 'is-matched': part.matched }"
                  >{{ part.text }}</span>
                </template>
                <template v-else>{{ row.item.label }}</template>
              </span>
              <div
                v-if="!disabled && (showAdd(row.item) || showEdit(row.item) || showRemove(row.item))"
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
    </ul>
  </div>
</template>
