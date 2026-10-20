<script setup lang="ts">
import { VarmisRoot } from '@varmis/core'
import OverlayHost from './OverlayHost.vue'
import type { PlainObject, RendererEnv } from '@varmis/core'

defineProps<{
  schema: unknown
  data?: PlainObject
  env?: Partial<RendererEnv>
}>()
</script>

<template>
  <VarmisRoot :schema="schema" :data="data" :env="env">
    <OverlayHost />
  </VarmisRoot>
</template>
