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
    class="vamis-fieldset"
    :open="open"
    @toggle="open = ($event.target as HTMLDetailsElement).open"
  >
    <summary class="vamis-fieldset__title">{{ title }}</summary>
    <div class="vamis-fieldset__body space-y-1">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
  </details>
  <fieldset v-else class="vamis-fieldset vamis-fieldset--legend">
    <legend class="vamis-fieldset__legend">{{ title }}</legend>
    <div class="space-y-1">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
  </fieldset>
</template>
