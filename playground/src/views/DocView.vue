<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SchemaPreview from '../components/SchemaPreview.vue'
import DocSidebar from '../components/DocSidebar.vue'
import { resolveDoc } from '../docs/pages'
import { parseDoc } from '../docs/render'
import { groupsForPath } from '../docs/sidebar'

const route = useRoute()
const router = useRouter()

const page = computed(() => resolveDoc(route.path))
const parsed = computed(() => (page.value ? parseDoc(page.value.raw) : null))
const groups = computed(() => groupsForPath(route.path))

function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const anchor = target?.closest('a')
  if (!anchor || anchor.target === '_blank') return
  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return
  event.preventDefault()
  router.push(href)
}
</script>

<template>
  <div class="grid h-[calc(100vh-5.75rem)] min-h-0 grid-cols-[16rem_minmax(0,1fr)] gap-0 overflow-hidden rounded-lg border bg-card">
    <aside class="min-h-0 overflow-hidden border-r p-3">
      <DocSidebar :groups="groups" />
    </aside>
    <article class="min-h-0 overflow-auto px-8 py-6" @click="onClick">
      <p v-if="!parsed" class="text-sm text-muted-foreground">没有这份文档：{{ route.path }}</p>
      <template v-else>
        <template v-for="(block, i) in parsed.blocks" :key="i">
          <SchemaPreview
            v-if="block.kind === 'schema'"
            class="max-w-5xl"
            :yaml="block.yaml"
            :scope="block.scope"
            :height="block.height"
          />
          <div v-else class="doc-prose max-w-3xl" v-html="block.html" />
        </template>
      </template>
    </article>
  </div>
</template>
