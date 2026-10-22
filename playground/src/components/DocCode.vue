<script setup lang="ts">
import { computed } from 'vue'
import { Code, LazyComponent } from 'vamis'

const props = defineProps<{
  language?: string
  value: string
}>()

const schema = computed(() => ({
  type: 'code',
  language: props.language || 'plaintext',
  value: props.value,
}))
</script>

<template>
  <div class="doc-code my-5">
    <LazyComponent placeholder="加载代码…">
      <Code :schema="schema" :data="{}" />
    </LazyComponent>
  </div>
</template>
