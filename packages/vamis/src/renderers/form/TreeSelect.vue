<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from 'vue'
import {
  overlayContainerFrom,
  overlayIsMobile,
  POPUP_DEFAULT_HEIGHT,
  treeNodeLabel,
  useEnv,
  type SchemaObject,
} from '@vamis/core'
import { VamisCaret, VamisClear, VamisClose } from '@vamis/ui'
import FormItem from '../FormItem.vue'
import TreeBranch from './TreeBranch.vue'
import TreeSearchBox from './TreeSearchBox.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'
import VamisPopUp from '../../overlay/VamisPopUp.vue'
import { useTreeField } from './useTreeField'
import { optionValuesEqual, type OptionItem } from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const env = useEnv()
const tree = useTreeField(toRef(props, 'schema'), toRef(props, 'disabled'))
const open = ref(false)
const draft = ref<unknown[]>([])
const triggerEl = ref<HTMLElement | null>(null)
const triggerWidth = ref(0)
const isMobile = computed(() => overlayIsMobile(props.schema, env))
const overlayContainer = computed(() =>
  overlayContainerFrom({ popOverContainerSelector: props.schema.popOverContainerSelector }, env),
)
const locked = computed(() => !!props.disabled)
const workingValues = computed(() => (isMobile.value && open.value ? draft.value : tree.selected.value))
const selectedItems = computed(() =>
  workingValues.value.map((value) => ({
    value,
    label: treeNodeLabel(tree.options.value, value, {
      hideNodePathLabel: tree.hideNodePathLabel.value,
      pathSeparator: tree.pathSeparator.value,
      valueField: tree.valueField.value,
    }),
  })),
)
const placeholder = computed(() =>
  props.schema.placeholder != null ? String(props.schema.placeholder) : '请选择',
)
const popoverStyle = computed(() =>
  triggerWidth.value ? { minWidth: `${triggerWidth.value}px` } : undefined,
)

function measureTrigger() {
  triggerWidth.value = triggerEl.value?.offsetWidth ?? 0
}

function toggleOpen() {
  if (locked.value) return
  if (!open.value && isMobile.value) draft.value = [...tree.selected.value]
  open.value = !open.value
}

function closeMenu() {
  open.value = false
}

function confirmMobile() {
  tree.selected.value = [...draft.value]
  open.value = false
}

function onPick(item: OptionItem) {
  const next = tree.applyToggle(item, workingValues.value)
  if (!next) return
  if (isMobile.value && open.value) {
    draft.value = next
    return
  }
  tree.selected.value = next
  if (!tree.multiple.value) open.value = false
}

function removeTag(item: { value: unknown }, event: Event) {
  event.stopPropagation()
  if (locked.value) return
  const next = workingValues.value.filter((value) => !optionValuesEqual(value, item.value))
  if (isMobile.value && open.value) draft.value = next
  else tree.selected.value = next
}

function clearAll(event: Event) {
  event.stopPropagation()
  if (locked.value) return
  tree.selected.value = []
  draft.value = []
}

watch(open, (show) => {
  if (show) void nextTick(measureTrigger)
})
</script>

<template>
  <FormItem :schema="schema">
    <div
      class="vamis-select vamis-tree-select"
      :class="{
        'is-opened': open,
        'is-disabled': locked,
        'is-multiple': tree.multiple.value,
        'is-mobile': isMobile,
      }"
    >
      <div
        ref="triggerEl"
        class="vamis-select__input"
        :class="{ 'is-focused': open }"
        @click="toggleOpen"
      >
        <div class="vamis-select__value">
          <template v-if="tree.multiple.value && selectedItems.length">
            <span
              v-for="(item, index) in selectedItems"
              :key="`${String(item.value)}-${index}`"
              class="vamis-select__chip"
            >
              <span class="vamis-select__chip-label">{{ item.label }}</span>
              <button
                v-if="!locked"
                type="button"
                class="vamis-select__chip-close"
                aria-label="移除"
                @mousedown.prevent
                @click="removeTag(item, $event)"
              ><VamisClose /></button>
            </span>
          </template>
          <span v-else-if="selectedItems[0]" class="vamis-select__single">{{ selectedItems[0].label }}</span>
          <span v-else class="vamis-select__placeholder">{{ placeholder }}</span>
        </div>
        <span class="vamis-select__suffix">
          <button
            v-if="schema.clearable && selectedItems.length && !locked"
            type="button"
            class="vamis-select__clear"
            aria-label="清除"
            @mousedown.prevent
            @click.stop="clearAll"
          >
            <VamisClear />
          </button>
          <VamisCaret class="vamis-select__caret" :open="!isMobile && open" />
        </span>
      </div>
      <VamisPopUp
        v-if="isMobile"
        :show="open"
        :height="POPUP_DEFAULT_HEIGHT"
        :container="overlayContainer"
        @cancel="closeMenu"
        @confirm="confirmMobile"
      >
        <TreeSearchBox
          v-if="tree.searchable.value"
          v-model="tree.query.value"
          :placeholder="tree.searchPlaceholder.value"
          :disabled="locked"
          :search-immediately="tree.searchImmediately.value"
        />
        <TreeBranch
          :nodes="tree.filteredOptions.value"
          :checked="(item) => tree.checked(item, workingValues)"
          :partial="(item) => tree.partial(item, workingValues)"
          :check-disabled="(item) => tree.checkDisabled(item, workingValues)"
          :disabled="locked"
          :expanded="tree.isExpanded"
          :deferring="tree.isDeferring"
          :defer-field="tree.deferField.value"
          :outline="tree.showOutline.value"
          :show-icon="tree.showIcon.value"
          :multiple="tree.multiple.value"
          :show-radio="tree.showRadio.value"
          :query="tree.query.value"
          :creatable="tree.creatable.value"
          :editable="tree.editable.value"
          :removable="tree.removable.value"
          :root-creatable="tree.rootCreatable.value"
          :is-adding="tree.isAdding.value"
          :adding-parent="tree.addingParent.value"
          :editing-item="tree.editingItem.value"
          :draft-label="tree.draftLabel.value"
          :create-tip="tree.createTip.value"
          :edit-tip="tree.editTip.value"
          :remove-tip="tree.removeTip.value"
          :root-create-tip="tree.rootCreateTip.value"
          @pick="onPick"
          @expand="tree.toggleExpand"
          @add="tree.startAdd"
          @edit="tree.startEdit"
          @remove="tree.removeItem"
          @confirm="tree.confirmEdit"
          @cancel="tree.cancelEdit"
          @update:draft-label="tree.draftLabel.value = $event"
        />
      </VamisPopUp>
      <VamisOverlay
        v-else
        :show="open"
        :target="triggerEl"
        :container="overlayContainer"
        :gap="4"
        placement="auto"
        @outside="closeMenu"
      >
        <div class="vamis-select__popover vamis-tree-select__popover" :style="popoverStyle">
          <div v-if="tree.searchable.value" class="vamis-tree-select__search" @mousedown.stop>
            <TreeSearchBox
              v-model="tree.query.value"
              :placeholder="tree.searchPlaceholder.value"
              :disabled="locked"
              :search-immediately="tree.searchImmediately.value"
            />
          </div>
          <TreeBranch
            :nodes="tree.filteredOptions.value"
            :checked="(item) => tree.checked(item, workingValues)"
            :partial="(item) => tree.partial(item, workingValues)"
            :check-disabled="(item) => tree.checkDisabled(item, workingValues)"
            :disabled="locked"
            :expanded="tree.isExpanded"
            :deferring="tree.isDeferring"
            :defer-field="tree.deferField.value"
            :outline="tree.showOutline.value"
            :show-icon="tree.showIcon.value"
            :multiple="tree.multiple.value"
            :show-radio="tree.showRadio.value"
            :query="tree.query.value"
            :creatable="tree.creatable.value"
            :editable="tree.editable.value"
            :removable="tree.removable.value"
            :root-creatable="tree.rootCreatable.value"
            :is-adding="tree.isAdding.value"
            :adding-parent="tree.addingParent.value"
            :editing-item="tree.editingItem.value"
            :draft-label="tree.draftLabel.value"
            :create-tip="tree.createTip.value"
            :edit-tip="tree.editTip.value"
            :remove-tip="tree.removeTip.value"
            :root-create-tip="tree.rootCreateTip.value"
            @pick="onPick"
            @expand="tree.toggleExpand"
            @add="tree.startAdd"
            @edit="tree.startEdit"
            @remove="tree.removeItem"
            @confirm="tree.confirmEdit"
            @cancel="tree.cancelEdit"
            @update:draft-label="tree.draftLabel.value = $event"
          />
        </div>
      </VamisOverlay>
    </div>
  </FormItem>
</template>
