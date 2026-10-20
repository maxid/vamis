<script setup lang="ts">
import { computed, ref } from 'vue'
import { SchemaRenderer, asArray, filterTpl, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const open = ref(false)
const body = computed(() => asArray(props.schema.body))
const title = computed(() => filterTpl(props.schema.title || '', props.data))
const content = computed(() => filterTpl(props.schema.content || props.schema.tooltip || '', props.data))
const disabled = computed(() => props.schema.disabled === true)
const inline = computed(() => props.schema.inline === true)
const wrapperTag = computed(() => String(props.schema.wrapperComponent || (inline.value ? 'span' : 'div')))
const triggers = computed(() => {
  const value = props.schema.trigger ?? 'hover'
  return (Array.isArray(value) ? value : [value]).map(String)
})
const placement = computed(() => String(props.schema.placement || 'top'))
const dark = computed(() => props.schema.tooltipTheme === 'dark')

const placeClass = computed(() => {
  const map: Record<string, string> = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  }
  return map[placement.value] || map.top
})

function show() {
  if (!disabled.value && (title.value || content.value)) open.value = true
}
function hide() {
  open.value = false
}
function onEnter() {
  if (triggers.value.includes('hover')) show()
}
function onLeave() {
  if (triggers.value.includes('hover')) hide()
}
function onClick() {
  if (!triggers.value.includes('click')) return
  if (open.value) hide()
  else show()
}
</script>

<template>
  <component
    :is="wrapperTag"
    class="relative"
    :class="[schema.className, inline ? 'inline-flex' : 'block']"
    :style="schema.style"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @click="onClick"
  >
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    <div
      v-if="open"
      role="tooltip"
      class="pointer-events-none absolute z-50 w-max max-w-xs rounded-md px-2.5 py-1.5 text-xs shadow-md"
      :class="[
        placeClass,
        dark ? 'bg-foreground text-background' : 'border bg-popover text-popover-foreground',
      ]"
      :style="schema.tooltipStyle"
    >
      <p v-if="title" class="mb-0.5 font-medium">{{ title }}</p>
      <p v-if="content">{{ content }}</p>
    </div>
  </component>
</template>
