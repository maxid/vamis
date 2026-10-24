<script setup lang="ts">
import { computed } from 'vue'
import { evalTemplate, type SchemaObject } from '@vamis/core'
import PopOverHost from './PopOverHost.vue'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const tag = computed(() => {
  const wrap = props.schema.wrapperComponent
  if (wrap === 'div' || wrap === 'span') return wrap
  return props.schema.inline === false ? 'div' : 'span'
})

const rendered = computed(() => {
  if (props.schema.raw != null && props.schema.raw !== '') {
    const raw = String(props.schema.raw)
    return { text: raw, html: raw, usedFilters: [] as string[] }
  }
  const source = props.schema.html ?? props.schema.tpl ?? props.schema.text ?? ''
  const textOnly =
    props.schema.html == null && props.schema.tpl == null && props.schema.text != null
  return evalTemplate(source, props.data, { asHtml: !textOnly })
})
</script>

<template>
  <PopOverHost :schema="schema" :data="data">
    <component :is="tag" v-if="rendered.html != null" class="vamis-html" v-html="rendered.html" />
    <component :is="tag" v-else class="vamis-html">{{ rendered.text }}</component>
  </PopOverHost>
</template>
