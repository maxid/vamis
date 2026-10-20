<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { SchemaRenderer, type SchemaObject } from '@vamis/core'
import { Button } from '@vamis/ui'
import { cssSize, readList } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const items = computed(() => readList(props.schema, props.data))
const index = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const width = computed(() => cssSize(props.schema.width, '100%'))
const height = computed(() => cssSize(props.schema.height, '240px'))
const controls = computed(() => {
  const raw = props.schema.controls
  return Array.isArray(raw) && raw.length ? raw : ['dots', 'arrows']
})
const current = computed(() => items.value[index.value] ?? null)

function itemImage(item: unknown) {
  if (typeof item === 'string') return item
  if (item && typeof item === 'object') {
    const rec = item as Record<string, unknown>
    return String(rec.image || rec.src || rec.url || '')
  }
  return ''
}
function itemHtml(item: unknown) {
  if (item && typeof item === 'object' && 'html' in (item as object)) return String((item as any).html || '')
  return ''
}
function itemTitle(item: unknown) {
  if (item && typeof item === 'object') return String((item as any).title || (item as any).label || '')
  return ''
}
function extraOf(item: unknown) {
  if (item && typeof item === 'object' && !Array.isArray(item)) return item as Record<string, unknown>
  return { item }
}

function go(next: number) {
  const total = items.value.length
  if (!total) return
  const loop = props.schema.loop !== false
  if (loop) index.value = (next + total) % total
  else index.value = Math.min(total - 1, Math.max(0, next))
}

function start() {
  stop()
  if (props.schema.auto === false || items.value.length < 2) return
  const interval = Number(props.schema.interval) || 5000
  timer = setInterval(() => {
    if (!paused.value) go(index.value + 1)
  }, interval)
}
function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
}

onMounted(start)
onBeforeUnmount(stop)
</script>

<template>
  <div
    data-slot="carousel"
    class="relative overflow-hidden rounded-md border bg-muted"
    :style="{ width, height }"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <div v-if="!items.length" class="flex h-full items-center justify-center text-sm text-muted-foreground">
      {{ schema.placeholder || '暂无轮播内容' }}
    </div>
    <template v-else>
      <div class="h-full w-full">
        <SchemaRenderer v-if="schema.itemSchema" :schema="schema.itemSchema" :extra-data="extraOf(current)" />
        <div v-else-if="itemHtml(current)" class="h-full w-full" v-html="itemHtml(current)" />
        <img
          v-else-if="itemImage(current)"
          :src="itemImage(current)"
          :alt="itemTitle(current)"
          class="h-full w-full"
          :class="schema.thumbMode === 'contain' ? 'object-contain' : 'object-cover'"
        />
        <div v-else class="flex h-full items-center justify-center text-sm">{{ itemTitle(current) || current }}</div>
      </div>
      <p
        v-if="itemTitle(current) && !schema.itemSchema"
        class="pointer-events-none absolute inset-x-0 bottom-8 px-3 text-center text-sm text-white drop-shadow"
      >
        {{ itemTitle(current) }}
      </p>
      <Button
        v-if="controls.includes('arrows') && items.length > 1"
        size="icon-sm"
        variant="secondary"
        class="absolute left-2 top-1/2 -translate-y-1/2"
        @click="go(index - 1)"
      >
        ‹
      </Button>
      <Button
        v-if="controls.includes('arrows') && items.length > 1"
        size="icon-sm"
        variant="secondary"
        class="absolute right-2 top-1/2 -translate-y-1/2"
        @click="go(index + 1)"
      >
        ›
      </Button>
      <div v-if="controls.includes('dots')" class="absolute inset-x-0 bottom-2 flex justify-center gap-1">
        <button
          v-for="(_, i) in items"
          :key="i"
          type="button"
          class="h-2 w-2 rounded-full"
          :class="i === index ? 'bg-primary' : 'bg-white/70'"
          @click="go(i)"
        />
      </div>
    </template>
  </div>
</template>
