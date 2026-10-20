<script setup lang="ts">
import { VamisRoot } from '@vamis/core'
import OverlayHost from './OverlayHost.vue'
import type { PlainObject, RendererEnv } from '@vamis/core'

defineProps<{
  schema: unknown
  data?: PlainObject
  env?: Partial<RendererEnv>
}>()
</script>

<template>
  <VamisRoot :schema="schema" :data="data" :env="env">
    <OverlayHost />
  </VamisRoot>
</template>
