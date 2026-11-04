<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import FormItem from './FormItem.vue'

const props = defineProps<{ schema: SchemaObject }>()
const buttons = computed(() => asArray(props.schema.buttons || props.schema.body))
</script>

<template>
  <FormItem :schema="schema">
    <div
      data-vamis-button-toolbar
      class="-ml-1 -mt-1 [&>*]:ml-1 [&>*]:mt-1"
    >
      <SchemaRenderer v-for="(node, i) in buttons" :key="i" :schema="node" />
    </div>
  </FormItem>
</template>
