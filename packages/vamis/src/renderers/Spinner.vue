<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  SchemaRenderer,
  resolveClassName,
  spinnerBody,
  spinnerCheckLoading,
  spinnerDelay,
  spinnerIcon,
  spinnerLoadingConfig,
  spinnerOverlay,
  spinnerPushParent,
  spinnerRemoveParent,
  spinnerShow,
  spinnerSize,
  spinnerTip,
  spinnerTipPlacement,
  subscribeSpinnerParents,
  useData,
  type SchemaObject,
} from '@vamis/core'
import { VamisSpinnerMark, VamisIcon } from '@vamis/ui'
import IconMark from './IconMark.vue'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, unknown>
  disabled?: boolean
}>()
const data = useData()
const markRef = ref<HTMLElement | null>(null)
const parentEl = ref<HTMLElement | null>(null)
const showMarker = ref(true)
const loadingTriggered = ref(false)
const delayReady = ref(false)
const visible = ref(false)
const darkBg = ref(false)
const portalDisabled = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null
let portalObserver: MutationObserver | null = null
let portalPoll: ReturnType<typeof setInterval> | null = null
let portalPollCount = 0

const body = computed(() => spinnerBody(props.schema))
const tip = computed(() => spinnerTip(props.schema, data.value))
const overlay = computed(() => spinnerOverlay(props.schema))
const place = computed(() => spinnerTipPlacement(props.schema))
const icon = computed(() => spinnerIcon(props.schema))
const asContainer = computed(() => body.value.length > 0)
const iconClass = computed(() => resolveClassName(props.schema.spinnerClassName, data.value))
const wrapClass = computed(() => resolveClassName(props.schema.spinnerWrapClassName, data.value))
const size = computed(() => spinnerSize(props.schema))
const portalRoot = computed(() => spinnerLoadingConfig(props.schema).root || '')
const portalTo = computed(() => portalRoot.value || 'body')
const wantedShow = computed(() => spinnerShow(props.schema, data.value))
const rootClass = computed(() => resolveClassName(props.schema.className, data.value))

const sizeClass = computed(() => {
  if (size.value === 'sm') return 'vamis-spinner__icon--sm'
  if (size.value === 'lg') return 'vamis-spinner__icon--lg'
  return ''
})
const placeClass = computed(() => {
  const map: Record<string, string> = {
    top: 'vamis-spinner--top',
    right: 'vamis-spinner--right',
    bottom: 'vamis-spinner--bottom',
    left: 'vamis-spinner--left',
  }
  return map[place.value] || map.bottom
})
const iconKindClass = computed(() =>
  icon.value.kind === 'default' ? 'vamis-spinner__icon--default' : 'vamis-spinner__icon--simple',
)

function clearTimer() {
  if (timer) clearTimeout(timer)
  timer = null
}

function syncVisible() {
  visible.value = delayReady.value && loadingTriggered.value && spinnerCheckLoading(parentEl.value)
}

function captureParent() {
  parentEl.value = markRef.value?.parentElement ?? null
  showMarker.value = false
  syncDarkBg()
}

function syncDarkBg() {
  const el = parentEl.value
  if (!el || typeof getComputedStyle === 'undefined') {
    darkBg.value = false
    return
  }
  const color = getComputedStyle(el).backgroundColor.trim()
  const hex = color.match(/^#([0-9a-f]{6})$/i)?.[1]
  const rgba = hex
    ? [
        Number.parseInt(hex.slice(0, 2), 16),
        Number.parseInt(hex.slice(2, 4), 16),
        Number.parseInt(hex.slice(4, 6), 16),
        1,
      ]
    : color.match(/[\d.]+/g)?.map(Number) || []
  const brightness = ((rgba[0] || 0) * 299 + (rgba[1] || 0) * 587 + (rgba[2] || 0) * 114) / 1000
  const alpha = rgba[3] ?? 1
  darkBg.value = brightness < 200 && alpha > 0.4
}

function syncPortalTarget() {
  if (!portalRoot.value || typeof document === 'undefined') {
    portalDisabled.value = true
    if (portalPoll) clearInterval(portalPoll)
    portalPoll = null
    return
  }
  try {
    portalDisabled.value = !document.querySelector(portalRoot.value)
  } catch {
    portalDisabled.value = true
    if (portalPoll) clearInterval(portalPoll)
    portalPoll = null
    return
  }
  if (!portalDisabled.value) {
    if (portalPoll) clearInterval(portalPoll)
    portalPoll = null
    portalPollCount = 0
  } else if (!portalPoll && portalRoot.value) {
    portalPollCount = 0
    portalPoll = setInterval(() => {
      portalPollCount += 1
      if (portalPollCount > 100) {
        if (portalPoll) clearInterval(portalPoll)
        portalPoll = null
        return
      }
      syncPortalTarget()
    }, 100)
  }
}

function observePortalTarget() {
  portalObserver?.disconnect()
  portalObserver = null
  if (!portalRoot.value || typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
    return
  }
  portalObserver = new MutationObserver(syncPortalTarget)
  portalObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['id', 'class'],
  })
}

function startShow() {
  loadingTriggered.value = true
  spinnerPushParent(parentEl.value)
  const delay = spinnerDelay(props.schema)
  if (delay <= 0) {
    delayReady.value = true
    syncVisible()
    return
  }
  delayReady.value = false
  visible.value = false
  timer = setTimeout(() => {
    delayReady.value = true
    syncVisible()
  }, delay)
}

function stopShow() {
  clearTimer()
  if (loadingTriggered.value) {
    loadingTriggered.value = false
    spinnerRemoveParent(parentEl.value)
  }
  delayReady.value = false
  visible.value = false
}

watch(wantedShow, (show, was) => {
  if (show === was) return
  if (show) startShow()
  else stopShow()
})
watch(parentEl, (el, prev) => {
  if (prev) spinnerRemoveParent(prev)
  if (loadingTriggered.value && el) spinnerPushParent(el)
  syncVisible()
})
watch(
  portalRoot,
  () => {
    syncPortalTarget()
    observePortalTarget()
  },
  { immediate: true },
)

onMounted(() => {
  void nextTick(() => {
    syncPortalTarget()
    observePortalTarget()
    captureParent()
    if (wantedShow.value) startShow()
  })
})

const stopSub = subscribeSpinnerParents(() => syncVisible())
onBeforeUnmount(() => {
  clearTimer()
  stopSub()
  portalObserver?.disconnect()
  if (portalPoll) clearInterval(portalPoll)
  spinnerRemoveParent(parentEl.value)
})
</script>

<template>
  <div
    v-if="asContainer"
    data-vamis-spinner
    class="vamis-spinner-wrap"
    :class="wrapClass"
  >
    <span v-if="showMarker" ref="markRef" class="vamis-spinner-mark" />
    <Teleport :key="portalDisabled ? 'inline' : 'portal'" :to="portalTo" :disabled="portalDisabled">
      <template v-if="visible">
        <div v-if="overlay" class="vamis-spinner__overlay" />
        <div
          class="vamis-spinner vamis-spinner--overlay"
          :class="[placeClass, rootClass]"
        >
          <div
            class="vamis-spinner__icon"
            :class="[
              sizeClass,
              iconKindClass,
              iconClass,
              {
                'vamis-spinner__icon--disabled': props.disabled,
                'vamis-spinner__icon--dark-bg': darkBg,
              },
            ]"
          >
            <VamisSpinnerMark v-if="icon.kind === 'default'" />
            <VamisIcon name="reload" v-else-if="icon.kind === 'builtin' && icon.name === 'reload'" class="icon" />
            <IconMark
              v-else-if="icon.kind === 'url' || icon.kind === 'class' || icon.kind === 'svg'"
              :icon="icon"
              img-class="vamis-spinner__img"
            />
          </div>
          <span v-if="tip" class="vamis-spinner__tip">{{ tip }}</span>
        </div>
      </template>
    </Teleport>
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </div>
  <template v-else>
    <span v-if="showMarker" ref="markRef" class="vamis-spinner-mark" />
    <Teleport :key="portalDisabled ? 'inline' : 'portal'" :to="portalTo" :disabled="portalDisabled">
      <template v-if="visible">
        <div v-if="overlay" class="vamis-spinner__overlay" />
        <div
          data-vamis-spinner
          class="vamis-spinner"
          :class="[placeClass, overlay && 'vamis-spinner--overlay', rootClass]"
        >
          <div
            class="vamis-spinner__icon"
            :class="[
              sizeClass,
              iconKindClass,
              iconClass,
              {
                'vamis-spinner__icon--disabled': props.disabled,
                'vamis-spinner__icon--dark-bg': darkBg,
              },
            ]"
          >
            <VamisSpinnerMark v-if="icon.kind === 'default'" />
            <VamisIcon name="reload" v-else-if="icon.kind === 'builtin' && icon.name === 'reload'" class="icon" />
            <IconMark
              v-else-if="icon.kind === 'url' || icon.kind === 'class' || icon.kind === 'svg'"
              :icon="icon"
              img-class="vamis-spinner__img"
            />
          </div>
          <span v-if="tip" class="vamis-spinner__tip">{{ tip }}</span>
        </div>
      </template>
    </Teleport>
  </template>
</template>
