<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, toRef } from 'vue'
import { filterTpl, useData, useScoped, type SchemaObject } from '@vamis/core'
import FormItem from '../FormItem.vue'
import TreeBranch from './TreeBranch.vue'
import TreeSearchBox from './TreeSearchBox.vue'
import { useTreeField } from './useTreeField'
import { useFieldValue } from '../../formContext'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const scoped = useScoped()
const fieldApi = useFieldValue()
const data = useData()
const tree = useTreeField(toRef(props, 'schema'), toRef(props, 'disabled'))
const initialValue = props.schema.name
  ? fieldApi.getValue(String(props.schema.name))
  : props.schema.value
const highlightQuery = computed(() =>
  tree.query.value ||
  (props.schema.highlightTxt != null
    ? filterTpl(String(props.schema.highlightTxt), data.value)
    : ''),
)

const scopedApi = {
  id: String(props.schema.id || props.schema.name || ''),
  name: String(props.schema.name || props.schema.id || ''),
  type: 'input-tree',
  schema: props.schema,
  reload: () => tree.reloadOptions(),
  getData: () => ({
    value: props.schema.name ? fieldApi.getValue(String(props.schema.name)) : props.schema.value,
  }),
  setData(values: Record<string, unknown>) {
    const name = String(props.schema.name || '')
    const next = Object.prototype.hasOwnProperty.call(values, 'value')
      ? values.value
      : name
        ? values[name]
        : undefined
    if (next !== undefined) void tree.commitRawValue(next)
  },
  async doAction(action: unknown) {
    const rec =
      action && typeof action === 'object' && !Array.isArray(action)
        ? (action as {
            actionType?: string
            value?: unknown
            args?: {
              keyword?: string
              openLevel?: number
              closeLevel?: number
              item?: unknown
              originValue?: unknown
              parentValue?: unknown
              value?: unknown
            }
          })
        : {}
    const type = String(rec.actionType || '')
    if (type === 'clear') await tree.commitRawValue('')
    else if (type === 'reset') {
      await tree.commitRawValue(initialValue !== undefined ? initialValue : props.schema.resetValue)
    } else if (type === 'setValue') {
      await tree.commitRawValue(rec.args?.value ?? rec.value)
    } else if (type === 'reload') {
      await tree.reloadOptions()
    } else if (type === 'search') {
      tree.query.value = String(rec.args?.keyword ?? '')
    } else if (type === 'expand') {
      tree.setExpandedLevel(Number(rec.args?.openLevel), false)
    } else if (type === 'collapse') {
      tree.setExpandedLevel(Number(rec.args?.closeLevel || 0), true)
    } else if (type === 'add') {
      await tree.addOptionFromAction(rec.args?.item, rec.args?.parentValue)
    } else if (type === 'edit') {
      await tree.editOptionFromAction(rec.args?.item, rec.args?.originValue)
    } else if (type === 'delete') {
      await tree.deleteOptionFromAction(rec.args?.value)
    }
  },
}

onMounted(() => scoped?.register(scopedApi))
onBeforeUnmount(() => scoped?.unregister(scopedApi))
</script>

<template>
  <FormItem :schema="schema">
    <div
      class="vamis-input-tree__control"
      :class="[
        String(schema.treeContainerClassName || ''),
        {
          'is-sticky': tree.searchable.value && tree.searchSticky.value,
          'is-height-auto': schema.heightAuto === true,
        },
      ]"
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
        :query="highlightQuery"
        :virtual-threshold="schema.heightAuto ? 0 : tree.virtualThreshold.value"
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
        :tree-class="String(schema.treeClassName || '')"
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
