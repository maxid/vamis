<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  SchemaRenderer,
  resolveClassName,
  resolveInlineStyle,
  tooltipBody,
  tooltipContent,
  tooltipDisabled,
  tooltipEnterable,
  tooltipInline,
  tooltipMouseEnterDelay,
  tooltipMouseLeaveDelay,
  tooltipOffset,
  tooltipPlacement,
  tooltipRootClose,
  tooltipShowArrow,
  tooltipTheme,
  tooltipTitle,
  tooltipTriggers,
  tooltipWrapperTag,
  useData,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const data = useData()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const body = computed(() => tooltipBody(props.schema))
const title = computed(() => tooltipTitle(props.schema, data.value))
const content = computed(() => tooltipContent(props.schema, data.value))
const triggers = computed(() => tooltipTriggers(props.schema))
const placement = computed(() => tooltipPlacement(props.schema))
const dark = computed(() => tooltipTheme(props.schema) === 'dark')
const inline = computed(() => tooltipInline(props.schema))
const tag = computed(() => tooltipWrapperTag(props.schema))
const offset = computed(() => tooltipOffset(props.schema))
const showArrow = computed(() => tooltipShowArrow(props.schema))
const enterable = computed(() => tooltipEnterable(props.schema))
const blocked = computed(() => props.disabled || tooltipDisabled(props.schema))
const layerStyle = computed(() => {
  const extra = resolveInlineStyle(props.schema.tooltipStyle, data.value)
  const [x, y] = offset.value
  return {
    ...extra,
    ...(x ? { marginLeft: `${x}px` } : {}),
    ...(y ? { marginTop: `${y}px` } : {}),
  }
})
const canFocus = computed(() => triggers.value.includes('focus'))
const layerClass = computed(() => resolveClassName(props.schema.tooltipClassName, data.value))

const placeClass = computed(() => {
  const map: Record<string, string> = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  }
  return map[placement.value] || map.top
})

const arrowClass = computed(() => {
  const map: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-b-[5px]',
    left: 'left-full top-1/2 -translate-y-1/2 border-y-[5px] border-y-transparent border-l-[5px]',
    right: 'right-full top-1/2 -translate-y-1/2 border-y-[5px] border-y-transparent border-r-[5px]',
  }
  return map[placement.value] || map.top
})

function clearTimers() {
  if (enterTimer.value) clearTimeout(enterTimer.value)
  if (leaveTimer.value) clearTimeout(leaveTimer.value)
  enterTimer.value = null
  leaveTimer.value = null
}

function setOpen(next: boolean) {
  if (blocked.value && next) return
  if (!title.value && !content.value) return
  open.value = next
}

function show() {
  clearTimers()
  const wait = tooltipMouseEnterDelay(props.schema)
  if (!wait) {
    setOpen(true)
    return
  }
  enterTimer.value = setTimeout(() => setOpen(true), wait)
}

function hide() {
  clearTimers()
  const wait = tooltipMouseLeaveDelay(props.schema)
  if (!wait) {
    setOpen(false)
    return
  }
  leaveTimer.value = setTimeout(() => setOpen(false), wait)
}

function onEnter() {
  if (triggers.value.includes('hover')) show()
}

function onLeave() {
  if (triggers.value.includes('hover')) hide()
}

function onLayerEnter() {
  if (!enterable.value) return
  clearTimers()
  setOpen(true)
}

function onLayerLeave() {
  if (!enterable.value) return
  if (triggers.value.includes('hover')) hide()
}

function onClick() {
  if (!triggers.value.includes('click')) return
  if (open.value) hide()
  else show()
}

function onFocus() {
  if (triggers.value.includes('focus')) show()
}

function onBlur() {
  if (triggers.value.includes('focus')) hide()
}

function onDocPointer(event: PointerEvent) {
  if (!tooltipRootClose(props.schema) || !open.value) return
  const target = event.target as Node | null
  if (target && root.value?.contains(target)) return
  setOpen(false)
}

onMounted(() => document.addEventListener('pointerdown', onDocPointer, true))
onBeforeUnmount(() => {
  clearTimers()
  document.removeEventListener('pointerdown', onDocPointer, true)
})
</script>

<template>
  <component
    :is="tag"
    ref="root"
    data-vamis-tooltip-wrapper
    class="relative"
    :class="inline ? 'inline-flex' : 'block'"
    :tabindex="canFocus ? 0 : undefined"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @click="onClick"
    @focusin="onFocus"
    @focusout="onBlur"
  >
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    <div
      v-if="open"
      role="tooltip"
      class="absolute z-50 w-max max-w-xs rounded-md px-2.5 py-1.5 text-xs shadow-md"
      :class="[
        placeClass,
        layerClass,
        enterable ? '' : 'pointer-events-none',
        dark ? 'bg-foreground text-background' : 'border bg-popover text-popover-foreground',
      ]"
      :style="layerStyle"
      @mouseenter="onLayerEnter"
      @mouseleave="onLayerLeave"
    >
      <p v-if="title" class="mb-0.5 font-medium">{{ title }}</p>
      <p v-if="content">{{ content }}</p>
      <span
        v-if="showArrow"
        aria-hidden="true"
        class="absolute size-0"
        :class="[
          arrowClass,
          dark
            ? placement === 'top'
              ? 'border-t-foreground'
              : placement === 'bottom'
                ? 'border-b-foreground'
                : placement === 'left'
                  ? 'border-l-foreground'
                  : 'border-r-foreground'
            : placement === 'top'
              ? 'border-t-border'
              : placement === 'bottom'
                ? 'border-b-border'
                : placement === 'left'
                  ? 'border-l-border'
                  : 'border-r-border',
        ]"
      />
    </div>
  </component>
</template>
