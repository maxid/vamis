<script setup lang="ts">
import { toRef } from 'vue'
import { VamisIcon } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import FormItem from '../FormItem.vue'
import TreeBranch from './TreeBranch.vue'
import { useTreeField } from './useTreeField'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const tree = useTreeField(toRef(props, 'schema'), toRef(props, 'disabled'))
</script>

<template>
  <FormItem :schema="schema">
    <div
      v-if="tree.searchable.value"
      class="vamis-input-tree__search"
    >
      <VamisIcon name="search" class="vamis-input-tree__search-icon" />
      <input
        v-model="tree.query.value"
        class="vamis-input-tree__search-input"
        type="text"
        placeholder="搜索"
      >
    </div>
    <div class="vamis-input-tree__control">
      <TreeBranch
        :nodes="tree.filteredOptions.value"
        :checked="(item) => tree.checked(item)"
        :disabled="!!disabled"
        :expanded="tree.isExpanded"
        :deferring="tree.isDeferring"
        :defer-field="tree.deferField.value"
        :outline="tree.showOutline.value"
        :show-icon="tree.showIcon.value"
        @pick="tree.toggle"
        @expand="tree.toggleExpand"
      />
    </div>
  </FormItem>
</template>
