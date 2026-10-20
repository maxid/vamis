<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { layoutNodes } from './utils'

const props = defineProps<{ schema: SchemaObject }>()
const rows = computed(() => asArray(props.schema.rows || props.schema.body) as SchemaObject[])
</script>

<template>
  <div class="flex flex-col gap-3" :class="schema.className">
    <div v-for="(row, i) in rows" :key="i" :class="row.rowClassName">
      <div :class="row.cellClassName">
        <SchemaRenderer v-for="(node, j) in layoutNodes(row)" :key="j" :schema="node" />
      </div>
    </div>
  </div>
</template>
