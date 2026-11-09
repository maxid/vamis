<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { VamisRoot } from 'vamis'
import {
  applyPreviewChrome,
  PREVIEW_PAINTED,
  PREVIEW_READY,
  PREVIEW_SCHEMA,
  subscribePreviewChrome,
  type PreviewChrome,
} from '../docs/preview-frame'

const schema = ref<unknown>(null)

function notifyPainted() {
  window.parent.postMessage({ type: PREVIEW_PAINTED }, window.location.origin)
}

function onMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  if (event.source !== window.parent) return
  if (event.data?.type !== PREVIEW_SCHEMA) return
  applyPreviewChrome(event.data.chrome as PreviewChrome | undefined)
  schema.value = event.data.schema
  void nextTick(notifyPainted)
}

let unsubscribeChrome: (() => void) | undefined

onMounted(() => {
  window.addEventListener('message', onMessage)
  unsubscribeChrome = subscribePreviewChrome(applyPreviewChrome)
  window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin)
})

onUnmounted(() => {
  window.removeEventListener('message', onMessage)
  unsubscribeChrome?.()
})
</script>

<template>
  <div class="min-h-full bg-background p-4">
    <VamisRoot v-if="schema" :schema="schema" :env="{ trusted: true, mobileUI: true }" />
  </div>
</template>
