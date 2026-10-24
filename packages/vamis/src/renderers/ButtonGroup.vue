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
