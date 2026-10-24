<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  drawerActions,
  drawerBody,
  drawerSizeClass,
  drawerTitle,
  overlayFrameStyle,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const title = computed(() => drawerTitle(props.schema))
const body = computed(() => drawerBody(props.schema))
const actions = computed(() => drawerActions(props.schema))
</script>

<template>
  <div
    data-vamis-drawer-inline
    class="rounded-lg border bg-card p-5 shadow-sm"
    :class="drawerSizeClass(schema)"
    :style="overlayFrameStyle(schema, 'drawer')"
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
