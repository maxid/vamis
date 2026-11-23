<script setup lang="ts">
import { toRef } from 'vue'
import type { SchemaObject } from '@vamis/core'
import FormItem from '../FormItem.vue'
import TreeBranch from './TreeBranch.vue'
import TreeSearchBox from './TreeSearchBox.vue'
import { useTreeField } from './useTreeField'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const tree = useTreeField(toRef(props, 'schema'), toRef(props, 'disabled'))
</script>

<template>
  <FormItem :schema="schema">
    <div
      class="vamis-input-tree__control"
      :class="{ 'is-sticky': tree.searchable.value && tree.searchSticky.value }"
    >
      <TreeSearchBox
        v-if="tree.searchable.value"
        v-model="tree.query.value"
        :placeholder="tree.searchPlaceholder.value"
        :disabled="!!disabled"
        :sticky="tree.searchSticky.value"
        :search-immediately="tree.searchImmediately.value"
      />
      <TreeBranch
        :nodes="tree.filteredOptions.value"
        :checked="(item) => tree.checked(item)"
        :partial="(item) => tree.partial(item)"
        :check-disabled="(item) => tree.checkDisabled(item)"
        :disabled="!!disabled"
        :expanded="tree.isExpanded"
        :deferring="tree.isDeferring"
        :defer-field="tree.deferField.value"
        :loading-config="schema.loadingConfig"
        :outline="tree.showOutline.value"
        :show-icon="tree.showIcon.value"
        :multiple="tree.multiple.value"
        :show-radio="tree.showRadio.value"
        :query="tree.query.value"
        :virtual-threshold="tree.virtualThreshold.value"
        :hide-root="tree.hideRoot.value"
        :root-label="tree.rootLabel.value"
        :root-checked="tree.selected.value.length === 0"
        :placeholder="tree.placeholder.value"
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
        :item-actions="schema.itemActions"
        :menu-tpl="schema.menuTpl"
        :icon-field="schema.iconField"
        :enable-default-icon="schema.enableDefaultIcon"
        :node-behavior="schema.nodeBehavior"
        @pick="tree.toggle"
        @item-click="tree.emitItemClick"
        @root-pick="tree.writeRootValue"
        @expand="tree.toggleExpand"
        @add="tree.startAdd"
        @edit="tree.startEdit"
        @remove="tree.removeItem"
        @confirm="tree.confirmEdit"
        @cancel="tree.cancelEdit"
        @update:draft-label="tree.draftLabel.value = $event"
      />
    </div>
  </FormItem>
</template>
