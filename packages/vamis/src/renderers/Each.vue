<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  eachItemNodes,
  eachList,
  eachPlaceholder,
  eachRowData,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const list = computed(() => eachList(props.schema, props.data))
const placeholder = computed(() => eachPlaceholder(props.schema))

function nodesFor(item: unknown, index: number) {
  return eachItemNodes(props.schema, item, index)
}

function rowData(item: unknown, index: number) {
  return eachRowData(props.schema, item, index)
}
</script>

<template>
  <div data-vamis-each class="vamis-each">
    <template v-if="list.length">
      <template v-for="(item, i) in list" :key="i">
        <SchemaRenderer
          v-for="(node, j) in nodesFor(item, i)"
          :key="`${i}-${j}`"
          :schema="node"
          :extra-data="rowData(item, i)"
        />
      </template>
    </template>
    <div v-else class="vamis-each__placeholder">{{ placeholder }}</div>
  </div>
</template>
