<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, type SchemaObject } from '@vamis/core'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject }>()
const child = computed(() => (props.schema.body as SchemaObject) || props.schema.control)
</script>

<template>
  <FormItem :schema="schema">
    <SchemaRenderer v-if="child" :schema="child" />
  </FormItem>
</template>
