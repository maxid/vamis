<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { withBase } from '../docs/base'
import {
  MOBILE_PREVIEW_HEIGHT,
  MOBILE_PREVIEW_WIDTH,
  PREVIEW_FRAME_PATH,
  PREVIEW_PAINTED,
  PREVIEW_READY,
  PREVIEW_SCHEMA,
  previewFrameSrc,
  readPreviewChrome,
} from '../docs/preview-frame'

const props = defineProps<{
  schema: unknown
  active: boolean
}>()

const opened = ref(false)
const frameEl = ref<HTMLIFrameElement | null>(null)
const framePainted = ref(false)
/** 打开时钉死，不要随主题改 src，否则整框重载会闪。 */
const frameSrc = ref('')
let pendingReady = false

function postSchema() {
  const win = frameEl.value?.contentWindow
  if (!win) return
  win.postMessage(
    { type: PREVIEW_SCHEMA, schema: props.schema, chrome: readPreviewChrome() },
    window.location.origin,
  )
}

function onWindowMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  const win = frameEl.value?.contentWindow
  if (!win) {
    if (event.data?.type === PREVIEW_READY) {
      pendingReady = true
      void nextTick(() => {
        if (pendingReady && frameEl.value?.contentWindow) {
          pendingReady = false
          postSchema()
        }
      })
    }
    return
  }
  if (event.source !== win) return
  if (event.data?.type === PREVIEW_READY) postSchema()
  if (event.data?.type === PREVIEW_PAINTED) framePainted.value = true
}

watch(
  () => props.active,
  (active) => {
    if (!active) return
    opened.value = true
    if (!frameSrc.value) frameSrc.value = previewFrameSrc(withBase(PREVIEW_FRAME_PATH))
    void nextTick(() => {
      if (pendingReady) {
        pendingReady = false
        postSchema()
      }
    })
  },
  { immediate: true },
)

watch(
  () => props.schema,
  () => {
    if (opened.value) postSchema()
  },
  { deep: true },
)

onMounted(() => window.addEventListener('message', onWindowMessage))
onUnmounted(() => window.removeEventListener('message', onWindowMessage))
</script>

<template>
  <div v-if="opened && frameSrc" class="doc-play__phone" :class="{ 'is-parked': !active }">
    <div class="doc-play__phone-notch" aria-hidden="true" />
    <div class="doc-play__phone-screen">
      <iframe
        ref="frameEl"
        class="doc-play__mobile-frame"
        :class="{ 'is-ready': framePainted }"
        title="移动端预览"
        :src="frameSrc"
        :width="MOBILE_PREVIEW_WIDTH"
        :height="MOBILE_PREVIEW_HEIGHT"
        @load="postSchema"
      />
    </div>
    <div class="doc-play__phone-home" aria-hidden="true" />
  </div>
</template>
