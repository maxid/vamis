<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const inner = computed(() => (props.schema.schema || props.schema.body) as SchemaObject)
</script>

<template>
  <SchemaRenderer v-if="inner" :schema="inner" />
</template>
