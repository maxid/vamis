<script setup lang="ts">
import { SchemaRenderer, formLayoutSkipCol, resolveClassName, type SchemaObject } from '@vamis/core'

const props = defineProps<{
  nodes: SchemaObject[]
  extraData?: Record<string, any>
}>()

function colClass(node: SchemaObject) {
  return resolveClassName(node.columnClassName, props.extraData || {})
}
</script>

<template>
  <div class="vamis-form-row">
    <template v-for="(node, i) in nodes" :key="i">
      <SchemaRenderer
        v-if="formLayoutSkipCol(node)"
        :schema="node"
        :extra-data="extraData"
      />
      <div v-else class="vamis-form-col" :class="colClass(node)">
        <SchemaRenderer :schema="node" :extra-data="extraData" />
      </div>
    </template>
  </div>
</template>
