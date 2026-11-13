<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  buttonGroupButtons,
  buttonGroupTiled,
  buttonGroupVertical,
  type SchemaObject,
} from '@vamis/core'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const buttons = computed(() => buttonGroupButtons(props.schema))
const vertical = computed(() => buttonGroupVertical(props.schema))
const tiled = computed(() => buttonGroupTiled(props.schema))
</script>

<template>
  <div
    data-vamis-button-group
    :class="{
      'is-vertical': vertical,
      'is-tiled': tiled,
    }"
  >
    <SchemaRenderer v-for="(node, i) in buttons" :key="i" :schema="node" />
  </div>
</template>
