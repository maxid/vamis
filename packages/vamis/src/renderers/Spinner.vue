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
let timer: ReturnType<typeof setTimeout> | null = null

const body = computed(() => spinnerBody(props.schema))
const tip = computed(() => spinnerTip(props.schema, data.value))
const overlay = computed(() => spinnerOverlay(props.schema))
const place = computed(() => spinnerTipPlacement(props.schema))
const icon = computed(() => spinnerIcon(props.schema))
const asContainer = computed(() => body.value.length > 0)
const iconClass = computed(() => resolveClassName(props.schema.spinnerClassName, data.value))
const wrapClass = computed(() => resolveClassName(props.schema.spinnerWrapClassName, data.value))
const size = computed(() => spinnerSize(props.schema))
const portalTo = computed(() => spinnerLoadingConfig(props.schema).root || '')
const wantedShow = computed(() => spinnerShow(props.schema, data.value))

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

onMounted(() => {
  void nextTick(() => {
    captureParent()
    if (wantedShow.value) startShow()
  })
})

const stopSub = subscribeSpinnerParents(() => syncVisible())
onBeforeUnmount(() => {
  clearTimer()
  stopSub()
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
    <Teleport :to="portalTo || 'body'" :disabled="!portalTo">
      <template v-if="visible">
        <div v-if="overlay" class="vamis-spinner__overlay" />
        <div
          class="vamis-spinner vamis-spinner--overlay"
          :class="placeClass"
        >
          <div class="vamis-spinner__icon" :class="[sizeClass, iconKindClass, iconClass]">
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
    <Teleport :to="portalTo || 'body'" :disabled="!portalTo">
      <template v-if="visible">
        <div v-if="overlay" class="vamis-spinner__overlay" />
        <div
          data-vamis-spinner
          class="vamis-spinner"
          :class="[placeClass, overlay && 'vamis-spinner--overlay']"
        >
          <div class="vamis-spinner__icon" :class="[sizeClass, iconKindClass, iconClass]">
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
