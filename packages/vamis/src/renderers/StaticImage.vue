<script setup lang="ts">
import type { SchemaObject } from '@vamis/core'
import FormItem from './FormItem.vue'
import Image from './Image.vue'

defineProps<{ schema: SchemaObject; data?: Record<string, any> }>()
</script>

<template>
  <FormItem :schema="schema">
    <Image :schema="schema" :data="data" />
  </FormItem>
</template>
