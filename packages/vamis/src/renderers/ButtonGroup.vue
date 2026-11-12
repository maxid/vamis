<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  buttonGroupButtons,
  buttonGroupTiled,
  buttonGroupVertical,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const buttons = computed(() => buttonGroupButtons(props.schema))
const vertical = computed(() => buttonGroupVertical(props.schema))
const tiled = computed(() => buttonGroupTiled(props.schema))
</script>

<template>
  <div
    data-vamis-button-group
    class="inline-flex flex-wrap align-middle"
    :class="{
      'flex-col items-stretch': vertical,
      'flex w-full': tiled,
    }"
  >
    <div
      v-for="(node, i) in buttons"
      :key="i"
      :class="tiled ? 'min-w-0 flex-1' : vertical ? 'w-full' : ''"
    >
      <SchemaRenderer :schema="node" />
    </div>
  </div>
</template>

<style scoped>
[data-vamis-button-group] > div:not(:first-child) :deep(button) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: -1px;
}
[data-vamis-button-group] > div:not(:last-child) :deep(button) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[data-vamis-button-group].flex-col > div:not(:first-child) :deep(button) {
  border-radius: 0 0 var(--radius) var(--radius);
  margin-left: 0;
  margin-top: -1px;
}
[data-vamis-button-group].flex-col > div:not(:last-child) :deep(button) {
  border-radius: var(--radius) var(--radius) 0 0;
}
</style>
