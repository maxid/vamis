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
  name: '__doc',
}))
</script>

<template>
  <div class="doc-code my-5">
    <LazyComponent placeholder="加载代码…">
      <!-- 走 name + data，避免文档围栏里的 `${}` 被 Code 当模板求值 -->
      <Code :schema="schema" :data="{ __doc: props.value }" />
    </LazyComponent>
  </div>
</template>
