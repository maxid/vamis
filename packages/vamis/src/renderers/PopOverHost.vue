<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  popOverBodyNode,
  popOverEnabled,
  popOverExclusiveClear,
  popOverExclusiveOpen,
  popOverMode,
  popOverOffset,
  popOverOverlaySchema,
  popOverPosition,
  popOverShowIcon,
  popOverTitle,
  popOverTrigger,
  resolveClassName,
  useData,
  useOverlay,
  SchemaRenderer,
  type SchemaObject,
} from '@vamis/core'
import { ZoomInIcon } from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
}>()

const injected = useData()
const overlay = useOverlay()
const data = computed(() => ({ ...injected.value, ...(props.data || {}) }))
const enabled = computed(() => popOverEnabled(props.schema, data.value))
const trigger = computed(() => popOverTrigger(props.schema))
const showIcon = computed(() => popOverShowIcon(props.schema))
const mode = computed(() => popOverMode(props.schema))
const position = computed(() => popOverPosition(props.schema))
const title = computed(() => popOverTitle(props.schema, data.value))
const body = computed(() => popOverBodyNode(props.schema))
const offset = computed(() => popOverOffset(props.schema))
const layerClass = computed(() =>
  resolveClassName(popOverObjectClass(props.schema), data.value),
)

const root = ref<HTMLElement | null>(null)
const layerEl = ref<HTMLElement | null>(null)
const open = ref(false)
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const coords = ref({ top: 0, left: 0, transform: 'translateX(-50%)' })

function popOverObjectClass(schema: SchemaObject): unknown {
  const raw = schema.popOver
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return (raw as Record<string, unknown>).popOverClassName ?? (raw as Record<string, unknown>).className
  }
  return undefined
}

const localOpen = computed(() => open.value && mode.value === 'popOver')

function placeLayer() {
  const el = root.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const { x, y } = offset.value
  const pos = position.value
  if (pos.startsWith('fixed-')) {
    const map: Record<string, { top: number; left: number; transform: string }> = {
      'fixed-center': { top: window.innerHeight / 2, left: window.innerWidth / 2, transform: 'translate(-50%, -50%)' },
      'fixed-left-top': { top: 16, left: 16, transform: 'none' },
      'fixed-right-top': { top: 16, left: window.innerWidth - 16, transform: 'translateX(-100%)' },
      'fixed-left-bottom': { top: window.innerHeight - 16, left: 16, transform: 'translateY(-100%)' },
      'fixed-right-bottom': {
        top: window.innerHeight - 16,
        left: window.innerWidth - 16,
        transform: 'translate(-100%, -100%)',
      },
    }
    coords.value = map[pos] || map['fixed-center']
    return
  }
  const map: Record<string, { top: number; left: number; transform: string }> = {
    center: { top: r.bottom + 4, left: r.left + r.width / 2, transform: 'translateX(-50%)' },
    'left-top': { top: r.top, left: r.left, transform: 'translate(-100%, -100%)' },
    'right-top': { top: r.top, left: r.right, transform: 'translateY(-100%)' },
    'left-bottom': { top: r.bottom, left: r.left, transform: 'translateX(-100%)' },
    'right-bottom': { top: r.bottom, left: r.right, transform: 'none' },
    'left-top-right-bottom': { top: r.top, left: r.left, transform: 'translate(-100%, -100%)' },
    'left-center-right-center': { top: r.top + r.height / 2, left: r.left, transform: 'translate(-100%, -50%)' },
    'left-bottom-right-top': { top: r.bottom, left: r.left, transform: 'translateX(-100%)' },
    'right-top-left-bottom': { top: r.top, left: r.right, transform: 'translateY(-100%)' },
    'right-center-left-center': { top: r.top + r.height / 2, left: r.right, transform: 'translateY(-50%)' },
    'right-bottom-left-top': { top: r.bottom, left: r.right, transform: 'none' },
    'center-center-center-center': {
      top: r.top + r.height / 2,
      left: r.left + r.width / 2,
      transform: 'translate(-50%, -50%)',
    },
  }
  const next = map[pos] || map.center
  coords.value = { top: next.top + y, left: next.left + x, transform: next.transform }
}

function clearTimer() {
  if (leaveTimer.value) clearTimeout(leaveTimer.value)
  leaveTimer.value = null
}

function unbindDoc() {
  document.removeEventListener('pointerdown', onDocPointer, true)
}

function close() {
  clearTimer()
  unbindDoc()
  open.value = false
  popOverExclusiveClear(close)
}

function openLocal() {
  popOverExclusiveOpen(close)
  open.value = true
  nextTick(() => {
    placeLayer()
    unbindDoc()
    document.addEventListener('pointerdown', onDocPointer, true)
  })
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

function onEnter() {
  if (trigger.value !== 'hover') return
  clearTimer()
  show()
}

function onLeave() {
  if (trigger.value !== 'hover') return
  hideLater()
}

function onLayerEnter() {
  if (trigger.value !== 'hover') return
  clearTimer()
}

function onLayerLeave() {
  if (trigger.value !== 'hover') return
  hideLater()
}

function onDocPointer(event: PointerEvent) {
  if (!localOpen.value) return
  const target = event.target as Node | null
  if (target && (root.value?.contains(target) || layerEl.value?.contains(target))) return
  close()
}

watch(enabled, (ok) => {
  if (!ok) close()
})

onBeforeUnmount(() => {
  close()
})
</script>

<template>
  <slot v-if="!enabled" />
  <span
    v-else
    ref="root"
    data-vamis-popover
    class="relative inline-flex items-center gap-1"
  >
    <span
      v-if="!showIcon"
      class="inline-flex min-w-0 cursor-pointer"
      @click.stop="onClick"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
    >
      <slot />
    </span>
    <slot v-else />
    <button
      v-if="showIcon"
      type="button"
      class="inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
      aria-label="查看详情"
      @click.stop="onClick"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
    >
      <ZoomInIcon class="size-3.5" />
    </button>
    <Teleport to="body">
      <div
        v-if="localOpen"
        ref="layerEl"
        role="dialog"
        data-vamis-popover-layer
        class="fixed z-50 w-max min-w-40 max-w-sm rounded border bg-popover p-3 text-sm text-popover-foreground shadow-md"
        :class="layerClass"
        :style="{
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          transform: coords.transform,
        }"
        @mouseenter="onLayerEnter"
        @mouseleave="onLayerLeave"
        @click.stop
      >
        <p v-if="title" class="mb-2 font-medium">{{ title }}</p>
        <SchemaRenderer :schema="body" :extra-data="data" />
      </div>
    </Teleport>
  </span>
</template>
