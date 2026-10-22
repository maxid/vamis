<script setup lang="ts">
import { computed } from 'vue'
import { Code, LazyComponent } from 'vamis'

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
    <LazyComponent placeholder="加载代码…">
      <Code :schema="schema" :data="{}" />
    </LazyComponent>
  </div>
</template>
