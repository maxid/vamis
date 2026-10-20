<script setup lang="ts">
import type { SchemaObject } from '@vamis/core'
defineProps<{ schema: SchemaObject }>()
</script>

<template>
  <input type="hidden" :name="schema.name" />
</template>
