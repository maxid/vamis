<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@varmis/core'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const html = computed(() =>
  filterTpl(props.schema.tpl ?? props.schema.html ?? props.schema.text ?? '', props.data),
)
</script>

<template>
  <div class="leading-relaxed" v-html="html" />
</template>
