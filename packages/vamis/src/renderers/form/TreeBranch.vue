<script setup lang="ts">
import { computed } from 'vue'
import { VamisIcon } from '@vamis/ui'
import { flattenVisibleOptions, type OptionItem } from '../../options'
import Spinner from '../Spinner.vue'

const props = withDefaults(defineProps<{
  nodes: OptionItem[]
  checked: (item: OptionItem) => boolean
  expanded: (item: OptionItem) => boolean
  deferring: (item: OptionItem) => boolean
  deferField?: string
  disabled?: boolean
  outline?: boolean
  showIcon?: boolean
}>(), {
  deferField: 'defer',
  showIcon: true,
})

const emit = defineEmits<{
  pick: [item: OptionItem]
  expand: [item: OptionItem]
}>()

const rows = computed(() => flattenVisibleOptions(props.nodes, props.expanded))

function canExpand(node: OptionItem) {
  return !!node.children?.length || !!node[props.deferField]
}
</script>

<template>
  <div class="vamis-tree" :class="{ 'is-outline': outline }">
    <ul class="vamis-tree__list">
      <li
        v-for="(row, index) in rows"
        :key="`${index}:${String(row.item.value)}`"
        class="vamis-tree__item"
        :class="{ 'is-child': row.depth > 0, 'is-leaf': !canExpand(row.item) }"
        :style="{ '--tree-depth': row.depth }"
      >
        <div
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
            <span class="vamis-tree__text" :title="row.item.label">{{ row.item.label }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
