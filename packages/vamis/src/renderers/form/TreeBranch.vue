<script setup lang="ts">
import type { OptionItem } from '../../options'

defineProps<{
  nodes: OptionItem[]
  checked: (item: OptionItem) => boolean
  disabled?: boolean
  depth?: number
}>()

const emit = defineEmits<{
  pick: [item: OptionItem]
}>()
</script>

<template>
  <ul>
    <li v-for="node in nodes" :key="String(node.value)">
      <button
        type="button"
        class="w-full rounded px-2 py-1 text-left text-sm"
        :class="checked(node) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
        :style="{ paddingLeft: `${8 + (depth || 0) * 12}px` }"
        :disabled="disabled || node.disabled"
        @click="emit('pick', node)"
      >
        {{ node.label }}
      </button>
      <TreeBranch
        v-if="node.children?.length"
        :nodes="node.children"
        :checked="checked"
        :disabled="disabled"
        :depth="(depth || 0) + 1"
        @pick="emit('pick', $event)"
      />
    </li>
  </ul>
</template>
