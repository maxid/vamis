<script setup lang="ts">
import Radios from './Radios.vue'
import type { SchemaObject } from '@vamis/core'

defineProps<{ schema: SchemaObject; disabled?: boolean }>()
</script>

<template>
  <Radios :schema="schema" :disabled="disabled" />
</template>
