<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const tag = computed(() => String(props.schema.tag || 'div'))
</script>

<template>
  <component :is="tag" v-bind="schema.props || {}" />
</template>
