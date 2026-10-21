<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog, DialogClose, DialogContent, DialogTitle, Input } from '@vamis/ui'
import { searchHits, type SearchHit } from '../search/catalog'

const open = ref(false)
const query = ref('')
const active = ref(0)
const panel = ref<HTMLElement | null>(null)
const router = useRouter()

const hits = computed(() => searchHits(query.value))

watch(open, async (value) => {
  if (!value) return
  query.value = ''
  active.value = 0
  await nextTick()
  panel.value?.querySelector('input')?.focus()
})

watch(hits, () => {
  active.value = 0
})

function go(hit: SearchHit) {
  open.value = false
  void router.push(hit.href)
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    active.value = Math.min(active.value + 1, Math.max(hits.value.length - 1, 0))
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = Math.max(active.value - 1, 0)
  } else if (event.key === 'Enter') {
    const hit = hits.value[active.value]
    if (hit) go(hit)
  }
}

function onGlobalKey(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open.value = !open.value
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKey))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <button
    type="button"
    class="inline-flex h-[var(--control-h-sm)] items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:min-w-48 sm:justify-between"
    aria-label="全站搜索"
    @click="open = true"
  >
    <span class="inline-flex items-center gap-2">
      <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span class="hidden sm:inline">搜索文档 / 组件 / 示例</span>
    </span>
    <kbd class="pointer-events-none hidden rounded border bg-muted px-1 font-mono text-[10px] sm:inline">⌘K</kbd>
  </button>
  <Dialog :open="open" @update:open="open = $event">
    <DialogContent class="gap-0 overflow-hidden p-0 sm:max-w-lg" :show-close-button="false">
      <DialogTitle class="sr-only">全站搜索</DialogTitle>
      <div ref="panel" class="border-b p-2">
        <Input
          v-model="query"
          class="h-9 border-0 shadow-none focus-visible:ring-0"
          placeholder="搜索文档、组件、示例…"
          @keydown="onKey"
        />
      </div>
      <ul class="max-h-80 overflow-auto p-1 text-sm">
        <li v-if="!hits.length" class="px-3 py-6 text-center text-muted-foreground">没有匹配</li>
        <li v-for="(hit, i) in hits" :key="hit.href + hit.title">
          <DialogClose as-child>
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left hover:bg-accent"
              :class="i === active ? 'bg-accent' : ''"
              @mouseenter="active = i"
              @click="go(hit)"
            >
              <span class="truncate">{{ hit.title }}</span>
              <span class="shrink-0 text-[11px] text-muted-foreground">{{ hit.group }}</span>
            </button>
          </DialogClose>
        </li>
      </ul>
    </DialogContent>
  </Dialog>
</template>
