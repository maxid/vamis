<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  OVERLAY_POPOVER_GAP,
  overlayContainerFrom,
  popOverBodyNode,
  popOverEnabled,
  popOverExclusiveClear,
  popOverExclusiveOpen,
  popOverMode,
  popOverOffset,
  popOverOverlaySchema,
  popOverPosition,
  popOverPositionTarget,
  popOverShowIcon,
  popOverTextOverflow,
  popOverTitle,
  popOverTrigger,
  resolveClassName,
  useData,
  useEnv,
  useOverlay,
  SchemaRenderer,
  type SchemaObject,
} from '@vamis/core'
import { VamisGalleryToolIcon } from '@vamis/ui'
import VamisOverlay from '../overlay/VamisOverlay.vue'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
  /** Amis HOC `config.position`。表单 static 是 `right`，其余默认 `center`。 */
  defaultPosition?: string
}>()

const injected = useData()
const env = useEnv()
const overlay = useOverlay()
const data = computed(() => ({ ...injected.value, ...(props.data || {}) }))
const enabled = computed(() => popOverEnabled(props.schema, data.value))
const trigger = computed(() => popOverTrigger(props.schema))
const showIcon = computed(() => popOverShowIcon(props.schema))
const mode = computed(() => popOverMode(props.schema))
const position = computed(() => popOverPosition(props.schema, props.defaultPosition || 'center'))
const title = computed(() => popOverTitle(props.schema, data.value))
const body = computed(() => popOverBodyNode(props.schema))
const overflow = computed(() => popOverTextOverflow(props.schema))
const offset = computed(() => popOverOffset(props.schema))
const layerClass = computed(() =>
  resolveClassName(popOverObjectClass(props.schema), data.value),
)
const container = computed(() => overlayContainerFrom(props.schema, env))
const isFixed = computed(() => position.value.startsWith('fixed-'))
const overlayGap = computed(() => {
  if (position.value === 'center' || isFixed.value) return 0
  if (position.value === 'auto' || position.value.split('-').length > 2) return OVERLAY_POPOVER_GAP
  return 0
})
const overlayOffset = computed<[number, number]>(() => [offset.value.x, offset.value.y])

function popOverObjectClass(schema: SchemaObject): unknown {
  const raw = schema.popOver
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return (raw as Record<string, unknown>).popOverClassName ?? (raw as Record<string, unknown>).className
  }
  return undefined
}

const hostEl = ref<HTMLElement | null>(null)
const wrap = ref<HTMLElement | null>(null)
const btn = ref<HTMLElement | null>(null)
const anchor = computed(() =>
  popOverPositionTarget(hostEl.value, {
    showIcon: showIcon.value,
    btn: btn.value,
    wrap: wrap.value,
  }),
)
const open = ref(false)
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const localOpen = computed(() => open.value && mode.value === 'popOver')

function clearTimer() {
  if (leaveTimer.value) clearTimeout(leaveTimer.value)
  leaveTimer.value = null
}

function close() {
  clearTimer()
  open.value = false
  popOverExclusiveClear(close)
}

function contentFits(): boolean {
  const el = wrap.value
  if (!el || overflow.value !== 'ellipsis') return false
  return el.clientHeight >= el.scrollHeight && el.clientWidth >= el.scrollWidth
}

function openLocal() {
  if (overflow.value === 'noWrap') return
  if (overflow.value === 'ellipsis' && contentFits()) return
  popOverExclusiveOpen(close)
  open.value = true
}

function openOverlay() {
  const schema = popOverOverlaySchema(props.schema, data.value)
  if (mode.value === 'drawer') overlay?.openDrawer(schema, data.value)
  else overlay?.openDialog(schema, data.value)
}

function show(event?: Event) {
  event?.preventDefault()
  event?.stopPropagation()
  if (!enabled.value) return
  if (mode.value === 'dialog' || mode.value === 'drawer') {
    openOverlay()
    return
  }
  openLocal()
}

function hideLater() {
  clearTimer()
  leaveTimer.value = setTimeout(close, 500)
}

function onClick(event: Event) {
  if (trigger.value !== 'click') return
  if (open.value && mode.value === 'popOver') {
    event.preventDefault()
    event.stopPropagation()
    close()
    return
  }
  show(event)
}

function onWrapClick(event: Event) {
  if (showIcon.value) return
  onClick(event)
}

function onEnter() {
  if (trigger.value !== 'hover') return
  clearTimer()
  show()
}

function onLeave() {
  if (trigger.value !== 'hover') return
  hideLater()
}

function onFixedOutside(event: MouseEvent) {
  if (!localOpen.value || !isFixed.value) return
  const node = event.target as Node | null
  const layer = document.querySelector('[data-vamis-popover-layer]')
  if (node && (anchor.value?.contains(node) || layer?.contains(node))) return
  close()
}

watch(enabled, (ok) => {
  if (!ok) close()
})

if (typeof document !== 'undefined') {
  document.addEventListener('mousedown', onFixedOutside, true)
}

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('mousedown', onFixedOutside, true)
  }
  close()
})
</script>

<template>
  <slot v-if="!enabled" />
  <span
    v-else
    ref="hostEl"
    data-vamis-popover
    class="vamis-popover-host"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <span
      ref="wrap"
      class="vamis-popover-wrap"
      :class="{
        'vamis-popover-wrap--ellipsis': overflow === 'ellipsis',
        'vamis-popover-wrap--nowrap': overflow === 'noWrap',
      }"
      @click.stop="onWrapClick"
    >
      <slot />
    </span>
    <span
      v-if="showIcon"
      ref="btn"
      class="vamis-popover-btn"
      role="button"
      tabindex="0"
      aria-label="查看详情"
      @click.stop="onClick"
    >
      <VamisGalleryToolIcon name="zoom-in" />
    </span>
    <VamisOverlay
      v-if="!isFixed"
      :show="localOpen"
      :target="anchor"
      :container="container"
      :placement="position"
      :gap="overlayGap"
      :offset="overlayOffset"
      layer-class="vamis-overlay--popover"
      @outside="close"
    >
      <div
        class="vamis-popover-layer"
        :class="layerClass"
        role="dialog"
        data-vamis-popover-layer
        @mouseenter="onEnter"
        @mouseleave="onLeave"
        @click.stop
      >
        <div v-if="title" class="vamis-popover-layer__title">{{ title }}</div>
        <div class="vamis-popover-layer__body">
          <SchemaRenderer :schema="body" :extra-data="data" />
        </div>
      </div>
    </VamisOverlay>
    <Teleport v-else-if="localOpen" to="body">
      <div
        class="vamis-popover-fixed"
        :class="`vamis-popover-fixed--${position}`"
        role="dialog"
        data-vamis-popover-layer
        @mouseenter="onEnter"
        @mouseleave="onLeave"
        @click.stop
      >
        <div class="vamis-popover-layer" :class="layerClass">
          <div v-if="title" class="vamis-popover-layer__title">{{ title }}</div>
          <div class="vamis-popover-layer__body">
            <SchemaRenderer :schema="body" :extra-data="data" />
          </div>
        </div>
      </div>
    </Teleport>
  </span>
</template>
