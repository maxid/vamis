<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  dialogActions,
  dialogBody,
  dialogSizeClass,
  dialogTitle,
  overlayFrameStyle,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const title = computed(() => dialogTitle(props.schema))
const body = computed(() => dialogBody(props.schema))
const actions = computed(() => dialogActions(props.schema))
</script>

<template>
  <div
    data-vamis-dialog-inline
    class="rounded-lg border bg-card p-5 shadow-sm"
    :class="dialogSizeClass(schema)"
    :style="overlayFrameStyle(schema, 'dialog')"
  >
    <div v-if="title" class="mb-3 font-medium">{{ title }}</div>
    <div class="space-y-3">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
    <div v-if="actions.length" class="mt-4 flex flex-wrap justify-end gap-2">
      <SchemaRenderer v-for="(node, i) in actions" :key="i" :schema="node" />
    </div>
  </div>
</template>
