<script setup lang="ts">
import { computed, ref } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const collapsable = computed(() => props.schema.collapsable !== false)
const open = ref(props.schema.collapsed !== true)
const body = computed(() => asArray(props.schema.body || props.schema.controls))
const title = computed(() => props.schema.title || props.schema.label || '分组')
</script>

<template>
  <details
    v-if="collapsable"
    class="rounded-md border bg-card"
    :open="open"
    @toggle="open = ($event.target as HTMLDetailsElement).open"
  >
    <summary class="cursor-pointer px-3 py-2 text-sm font-medium">{{ title }}</summary>
    <div class="space-y-1 border-t px-3 py-3">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
  </details>
  <fieldset v-else class="rounded-md border px-3 py-3">
    <legend class="px-1 text-sm font-medium">{{ title }}</legend>
    <div class="space-y-1">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
  </fieldset>
</template>
