<script setup lang="ts">
import { computed } from 'vue'
import { Code } from 'vamis'

const props = defineProps<{
  language?: string
  code: string
}>()

function decode(raw: string) {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

const schema = computed(() => ({
  type: 'code',
  language: props.language || 'plaintext',
  value: decode(props.code),
}))
</script>

<template>
  <div class="doc-code">
    <Code :schema="schema" :data="{}" />
  </div>
</template>
