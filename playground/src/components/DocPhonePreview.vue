<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  allocPreviewId,
  claimPreview,
  releasePreview,
  setPreviewRatio,
  updatePreviewSchema,
} from '../docs/preview-frame-host'

const props = withDefaults(
  defineProps<{
    schema: unknown
    active: boolean
    ratio?: number
  }>(),
  { ratio: 1 },
)

const screenEl = ref<HTMLElement | null>(null)
const previewId = allocPreviewId()

async function syncClaim() {
  if (!props.active) {
    releasePreview(previewId)
    return
  }
  await nextTick()
  const screen = screenEl.value
  if (!screen) return
  claimPreview(previewId, screen, props.schema, props.ratio)
}

watch(() => props.active, syncClaim, { immediate: true })
watch(
  () => props.schema,
  () => {
    if (props.active) updatePreviewSchema(previewId, props.schema)
  },
  { deep: true },
)
watch(
  () => props.ratio,
  (ratio) => {
    if (props.active) setPreviewRatio(previewId, ratio)
  },
)

onMounted(() => {
  void syncClaim()
})
onUnmounted(() => releasePreview(previewId))
</script>

<template>
  <div v-if="active" class="doc-play__phone">
    <div class="doc-play__phone-notch" aria-hidden="true" />
    <div ref="screenEl" class="doc-play__phone-screen" />
    <div class="doc-play__phone-home" aria-hidden="true" />
  </div>
</template>
