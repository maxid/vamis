<script setup lang="ts">
import { computed } from 'vue'
import { evalTemplate, type SchemaObject } from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const rendered = computed(() => {
  const source = props.schema.tpl ?? props.schema.html ?? props.schema.text ?? ''
  const forceHtml =
    props.schema.type === 'html' || (!props.schema.tpl && props.schema.html != null)
  return evalTemplate(source, props.data, { asHtml: forceHtml })
})
</script>

<template>
  <div v-if="rendered.html != null" class="leading-relaxed" v-html="rendered.html" />
  <div v-else class="leading-relaxed">{{ rendered.text }}</div>
</template>
