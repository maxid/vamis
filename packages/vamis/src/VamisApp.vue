<script setup lang="ts">
import { ref } from 'vue'
import { VamisRoot } from '@vamis/core'
import OverlayHost from './OverlayHost.vue'
import type { PlainObject, RendererEnv, ScopedContext } from '@vamis/core'

defineProps<{
  schema: unknown
  data?: PlainObject
  env?: Partial<RendererEnv>
}>()

const rootRef = ref<{ scoped?: ScopedContext } | null>(null)
defineExpose({
  get scoped() {
    return rootRef.value?.scoped
  },
})
</script>

<template>
  <VamisRoot ref="rootRef" :schema="schema" :data="data" :env="env">
    <OverlayHost />
  </VamisRoot>
</template>
