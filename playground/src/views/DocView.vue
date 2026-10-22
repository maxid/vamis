<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SchemaPreview from '../components/SchemaPreview.vue'
import DocSidebar from '../components/DocSidebar.vue'
import DocToc from '../components/DocToc.vue'
import { resolveDoc } from '../docs/pages'
import { parseDoc } from '../docs/render'
import { groupsForPath } from '../docs/sidebar'

const route = useRoute()
const router = useRouter()
const articleEl = ref<HTMLElement | null>(null)
const tocEl = ref<HTMLElement | null>(null)
const activeId = ref('')

const page = computed(() => resolveDoc(route.path))
const parsed = computed(() => (page.value ? parseDoc(page.value.raw) : null))
const groups = computed(() => groupsForPath(route.path))
const toc = computed(() => parsed.value?.toc ?? [])

let lockActive = false
let lockTimer = 0
let watchGen = 0
let stopScroll: (() => void) | undefined

function decodeHash(hash: string): string {
  const raw = hash.replace(/^#/, '')
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function headingEl(id: string): HTMLElement | null {
  const root = articleEl.value
  if (!root) return null
  try {
    return root.querySelector(`#${CSS.escape(id)}`)
  } catch {
    return null
  }
}

function headingOffset(el: HTMLElement, root: HTMLElement): number {
  return el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
}

function syncActiveFromScroll() {
  if (lockActive) return
  const root = articleEl.value
  const items = toc.value
  if (!root || !items.length) return
  const threshold = root.scrollTop + 88
  let current = items[0].id
  for (const item of items) {
    const el = headingEl(item.id)
    if (!el) continue
    if (headingOffset(el, root) <= threshold) current = item.id
    else break
  }
  activeId.value = current
  const active = tocEl.value?.querySelector(`[data-toc-id="${current}"]`)
  active?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

function scrollToId(id: string, smooth = true) {
  const el = headingEl(id)
  if (!el) return
  activeId.value = id
  lockActive = true
  window.clearTimeout(lockTimer)
  el.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' })
  const url = `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`
  history.replaceState(history.state, '', url)
  lockTimer = window.setTimeout(() => {
    lockActive = false
    syncActiveFromScroll()
  }, smooth ? 450 : 0)
}

function bindArticleScroll() {
  stopScroll?.()
  const root = articleEl.value
  if (!root) return
  const onScroll = () => syncActiveFromScroll()
  root.addEventListener('scroll', onScroll, { passive: true })
  const observer = new ResizeObserver(onScroll)
  observer.observe(root)
  stopScroll = () => {
    root.removeEventListener('scroll', onScroll)
    observer.disconnect()
  }
}

onBeforeUnmount(() => {
  window.clearTimeout(lockTimer)
  stopScroll?.()
})

// 切页先把正文滚回顶，再挂新的 LazyComponent；否则会沿用上一页 scrollTop，
// 把还没进视口的 Play 当成可见，立刻打 initApi（Amis 每页新建 root，没有这个问题）。
watch(
  () => route.path,
  () => {
    articleEl.value?.scrollTo({ top: 0 })
  },
  { flush: 'pre' },
)

watch(
  () => [route.path, parsed.value, articleEl.value] as const,
  async () => {
    const n = ++watchGen
    await nextTick()
    if (n !== watchGen) return
    bindArticleScroll()
    const hash = decodeHash(route.hash || window.location.hash)
    if (hash && headingEl(hash)) {
      scrollToId(hash, false)
      return
    }
    articleEl.value?.scrollTo({ top: 0 })
    activeId.value = toc.value[0]?.id ?? ''
  },
  { flush: 'post' },
)

function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const anchor = target?.closest('a')
  if (!anchor || anchor.target === '_blank') return
  const href = anchor.getAttribute('href')
  if (!href) return
  if (href.startsWith('#')) {
    event.preventDefault()
    const id = decodeHash(href)
    if (id) scrollToId(id)
    return
  }
  if (href.startsWith('http') || href.startsWith('mailto:')) return
  event.preventDefault()
  router.push(href)
}
</script>

<template>
  <div
    class="grid min-h-0 flex-1 grid-cols-[16rem_minmax(0,1fr)] overflow-hidden rounded-lg border bg-card"
    :class="toc.length ? 'lg:grid-cols-[16rem_minmax(0,1fr)_13rem]' : ''"
  >
    <aside class="min-h-0 overflow-hidden border-r p-3">
      <DocSidebar :groups="groups" />
    </aside>
    <article
      ref="articleEl"
      v-auto-hide-scroll
      class="min-h-0 min-w-0 overflow-auto px-8 py-6"
      @click="onClick"
    >
      <p v-if="!parsed" class="text-sm text-muted-foreground">没有这份文档：{{ route.path }}</p>
      <template v-else>
        <template v-for="(block, i) in parsed.blocks" :key="`${route.path}:${i}`">
          <SchemaPreview
            v-if="block.kind === 'schema'"
            :yaml="block.yaml"
            :scope="block.scope"
            :height="block.height"
          />
          <div v-else class="doc-prose" v-html="block.html" />
        </template>
      </template>
    </article>
    <aside v-if="toc.length" ref="tocEl" class="hidden min-h-0 overflow-hidden lg:block">
      <DocToc :items="toc" :active-id="activeId" @select="scrollToId" />
    </aside>
  </div>
</template>
