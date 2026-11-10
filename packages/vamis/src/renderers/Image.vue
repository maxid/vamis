<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  filterTpl,
  imageAlt,
  imageBoxSize,
  imageCaption,
  imageDefaultSrc,
  imageEnlargeAble,
  imageFillsParent,
  imageHref,
  imageMode,
  imageOriginalSrc,
  imagePlaceholderText,
  imageScaleNumber,
  imageShowToolbar,
  imageSrc,
  imageThumbMode,
  imageThumbRatio,
  imageTitle,
  imageToolbarActions,
  imageZoomNext,
  resolveClassName,
  runAction,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type ActionSchema,
  type SchemaObject,
} from '@vamis/core'
import ImageGallery from '../overlay/ImageGallery.vue'

const props = defineProps<{ schema: SchemaObject; data?: Record<string, any> }>()

const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const formApi = useFormApi()
const viewData = useData()
const data = computed(() => props.data || viewData.value || {})

const src = computed(() => imageSrc(props.schema, data.value))
const placeholder = computed(() => imagePlaceholderText(props.schema, data.value))
const showPlaceholder = computed(() => !src.value && !!placeholder.value)
const displaySrc = computed(() => src.value || imageDefaultSrc(props.schema, data.value))
const isPlaceholder = computed(() => !src.value)
const originalSrc = computed(() => imageOriginalSrc(props.schema, data.value, displaySrc.value))
const href = computed(() => imageHref(props.schema, data.value))
const title = computed(() => imageTitle(props.schema, data.value))
const caption = computed(() => imageCaption(props.schema, data.value))
const alt = computed(() => imageAlt(props.schema, data.value))
const width = computed(() => imageBoxSize(props.schema.width, data.value))
const height = computed(() => imageBoxSize(props.schema.height, data.value))
const thumbMode = computed(() => imageThumbMode(props.schema, data.value))
const thumbRatio = computed(() => imageThumbRatio(props.schema, data.value))
const mode = computed(() => imageMode(props.schema))
const fillParent = computed(() => imageFillsParent(thumbMode.value) || mode.value === 'original')
const enlargeAble = computed(() => imageEnlargeAble(props.schema) && !isPlaceholder.value && !href.value)
const showToolbar = computed(() => imageShowToolbar(props.schema))
const toolbarActions = computed(() => imageToolbarActions(props.schema))
const enlargeTitle = computed(() => {
  const raw = props.schema.enlargeTitle
  return raw != null && raw !== '' ? filterTpl(String(raw), data.value) : title.value
})
const enlargeCaption = computed(() => {
  const raw = props.schema.enlargeCaption
  return raw != null && raw !== '' ? filterTpl(String(raw), data.value) : caption.value
})
const innerClass = computed(() => resolveClassName(props.schema.innerClassName, data.value))
const imageClass = computed(() => resolveClassName(props.schema.imageClassName, data.value))
const thumbClass = computed(() => resolveClassName(props.schema.thumbClassName, data.value))
const htmlTarget = computed(() => {
  if (typeof props.schema.htmlTarget === 'string' && props.schema.htmlTarget) return props.schema.htmlTarget
  return props.schema.blank === false ? '_self' : '_blank'
})
const boxStyle = computed(() => {
  const style: Record<string, string> = {}
  if (width.value) style.width = width.value
  else if (fillParent.value) style.width = '100%'
  if (height.value) style.height = height.value
  return Object.keys(style).length ? style : undefined
})
const ratioClass = computed(() => `is-ratio-${thumbRatio.value.replace(':', '-')}`)
const scale = ref(1)
const galleryOpen = ref(false)
const zoomStyle = computed(() => (scale.value !== 1 ? { transform: `scale(${scale.value})` } : undefined))
const galleryItems = computed(() => [
  {
    src: displaySrc.value,
    originalSrc: originalSrc.value || displaySrc.value,
    title: enlargeTitle.value,
    caption: enlargeCaption.value,
  },
])

function openGallery() {
  if (!displaySrc.value || isPlaceholder.value) return
  galleryOpen.value = true
}

async function onClick(event: MouseEvent) {
  const vamiss = createVamisEvent('click', data.value, event)
  await runOnEvent(props.schema, 'click', {
    env,
    data: eventEvalData(data.value, vamiss),
    scoped,
    overlay,
    form: formApi,
    scope,
    event: vamiss,
  })
  if (vamiss.prevented) {
    event.preventDefault()
    return
  }
  const action = props.schema.clickAction
  if (action && typeof action === 'object') {
    await runAction(action as ActionSchema, {
      env,
      data: data.value,
      scoped,
      overlay,
      form: formApi,
      scope,
      event: vamiss,
    })
  }
}

async function doAction(action: { actionType?: string; args?: { scale?: unknown } }) {
  if (action?.actionType === 'preview') {
    openGallery()
    return
  }
  if (action?.actionType === 'zoom') {
    const min = imageScaleNumber(props.schema.minScale, data.value, 50)
    const max = imageScaleNumber(props.schema.maxScale, data.value, 200)
    const delta = imageScaleNumber(action.args?.scale, data.value, 50)
    scale.value = imageZoomNext(scale.value, delta, min, max)
  }
}

const api = props.schema.id ? { name: String(props.schema.id), doAction } : null
if (api) scoped?.register(api)
onBeforeUnmount(() => {
  if (api) scoped?.unregister(api)
})
</script>

<template>
  <div
    v-if="showPlaceholder"
    class="vamis-image-field"
    :style="zoomStyle"
    @click="onClick"
  >
    <span class="vamis-image-empty">{{ placeholder }}</span>
  </div>
  <div
    v-else
    class="vamis-image-field"
    :class="{ 'is-original': mode === 'original', 'is-fill': fillParent }"
    :style="zoomStyle"
    @click="onClick"
  >
    <component
      :is="href ? 'a' : 'div'"
      :href="href || undefined"
      :target="href ? htmlTarget : undefined"
      :class="href ? 'vamis-image-link' : undefined"
    >
      <span
        class="vamis-image"
        :class="[innerClass, mode === 'original' ? 'is-original' : 'is-thumb', { 'is-fill': fillParent }]"
      >
        <span class="vamis-image-thumbWrap">
          <span
            class="vamis-image-thumb"
            :class="['is-' + thumbMode, ratioClass, thumbClass]"
            :style="boxStyle"
          >
            <img :src="displaySrc" :alt="alt" :class="imageClass" />
          </span>
          <span v-if="enlargeAble" class="vamis-image-overlay">
            <button type="button" class="vamis-image-overlay__view" aria-label="查看大图" @click.stop="openGallery">
              <svg class="vamis-image-view" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M8 3c3.989 0 7 3.873 7 5 0 .883-3.011 5-7 5-4.04 0-7-4.117-7-5 0-1.127 2.96-5 7-5Zm0 1C4.733 4 2.218 7.086 2.009 7.973 2.275 8.771 4.719 12 7.999 12c3.21 0 5.735-3.269 5.994-4.037C13.807 7.126 11.27 4 8 4Zm-.025 1.88a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 1a1.001 1.001 0 0 0 0 2 1.001 1.001 0 0 0 0-2Z"
                />
              </svg>
            </button>
          </span>
        </span>
        <span v-if="title || caption" class="vamis-image-info">
          <span v-if="title" class="vamis-image-title">{{ title }}</span>
          <span v-if="caption" class="vamis-image-caption">{{ caption }}</span>
        </span>
      </span>
    </component>
  </div>
  <ImageGallery
    v-if="galleryOpen"
    :items="galleryItems"
    :show-toolbar="showToolbar"
    :toolbar-actions="toolbarActions"
    @close="galleryOpen = false"
  />
</template>
