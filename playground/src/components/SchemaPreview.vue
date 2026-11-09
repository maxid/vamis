<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { VamisRoot, LazyComponent, parseSchemaText } from 'vamis'
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle } from '@vamis/ui'
import { applySchemaScope } from '../docs/schema-scope'
import { withBase } from '../docs/base'
import { docViewport } from '../docs/doc-viewport'
import { PREVIEW_FRAME_PATH } from '../docs/preview-frame'
import DocPhonePreview from './DocPhonePreview.vue'
import SchemaSourceEditor from './SchemaSourceEditor.vue'

const props = withDefaults(
  defineProps<{
    yaml: string
    scope?: string
    height?: number
  }>(),
  { height: 200 },
)

const draft = ref(props.yaml.trim())
const editing = ref(false)
const lastGood = ref<unknown>({})
const editError = ref('')
const rootEl = ref<HTMLElement | null>(null)
const inView = ref(false)

watch(
  () => props.yaml,
  (value) => {
    draft.value = value.trim()
  },
)

const parsed = computed(() => {
  try {
    const value = applySchemaScope(parseSchemaText(draft.value), props.scope)
    lastGood.value = value
    return { ok: true as const, value, error: '' }
  } catch (err) {
    return {
      ok: false as const,
      value: lastGood.value,
      error: err instanceof Error ? err.message : String(err),
    }
  }
})

const minHeight = computed(() => Math.max(160, Number(props.height) || 200))
const isMobile = computed(() => docViewport.value === 'mobile')
const phoneActive = computed(() => isMobile.value && inView.value)
const banner = computed(() => editError.value || (!parsed.value.ok ? parsed.value.error : ''))

function prefetchFrame() {
  const href = withBase(PREVIEW_FRAME_PATH)
  if (document.querySelector('link[data-vamis-preview-frame]')) return
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'document'
  link.href = href
  link.dataset.vamisPreviewFrame = '1'
  document.head.appendChild(link)
}

let io: IntersectionObserver | undefined

onMounted(() => {
  const node = rootEl.value
  io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) inView.value = true
    },
    { rootMargin: '160px 0px' },
  )
  if (node) io.observe(node)
  window.setTimeout(prefetchFrame, 200)
})

onUnmounted(() => io?.disconnect())
</script>

<template>
  <div ref="rootEl" class="doc-play my-5">
    <div class="mb-2 flex items-center justify-end gap-2">
      <Button type="button" size="xs" variant="outline" @click="editing = true">
        编辑 Schema
      </Button>
    </div>
    <div class="overflow-hidden rounded-lg border bg-card" data-density="compact">
      <div v-if="banner && !editing" class="border-b bg-destructive/10 px-4 py-2 font-mono text-xs text-destructive">
        {{ banner }}
      </div>
      <div
        class="doc-play__stage"
        :class="isMobile ? 'doc-play__canvas--mobile' : 'p-5'"
        :style="isMobile ? undefined : { minHeight: `${minHeight}px` }"
      >
        <div v-show="!isMobile">
          <LazyComponent placeholder="加载中，请稍后。。。">
            <VamisRoot :schema="parsed.value" :env="{ trusted: true }" />
          </LazyComponent>
        </div>
        <DocPhonePreview :schema="parsed.value" :active="phoneActive" />
      </div>
    </div>
    <Sheet :open="editing" @update:open="editing = $event">
      <SheetContent side="right" class="flex h-full w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>编辑 Schema（改完即时预览）</SheetTitle>
        </SheetHeader>
        <div v-if="banner" class="mx-4 rounded-md bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
          {{ banner }}
        </div>
        <div class="mx-4 mb-4 flex min-h-0 flex-1 flex-col">
          <SchemaSourceEditor
            :source="draft"
            @update:source="draft = $event"
            @error="editError = $event"
          />
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
