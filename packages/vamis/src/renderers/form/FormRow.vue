<script setup lang="ts">
import { SchemaRenderer, formLayoutSkipCol, type SchemaObject } from '@vamis/core'

const props = defineProps<{
  nodes: SchemaObject[]
  extraData?: Record<string, any>
}>()
</script>

<template>
  <div class="vamis-form-row">
    <template v-for="(node, i) in nodes" :key="i">
      <SchemaRenderer
        v-if="formLayoutSkipCol(node)"
        :schema="node"
        :extra-data="extraData"
      />
      <div v-else class="vamis-form-col">
        <SchemaRenderer :schema="node" :extra-data="extraData" />
      </div>
    </template>
  </div>
</template>
