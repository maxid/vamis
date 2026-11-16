<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import FilterInput from './FilterInput.vue'
import { averageProgress, progressTone } from '../docs/doc-progress'
import { showDocProgress } from '../docs/doc-progress-pref'
import type { SideGroup, SideLink } from '../docs/sidebar'

const props = defineProps<{
  groups: SideGroup[]
}>()

const route = useRoute()
const filter = ref('')
const open = ref<Record<string, boolean>>({})

function isFlat(group: SideGroup) {
  return Boolean(group.link) && !group.items?.length
}

function linkMatches(link: string, path: string, allowPrefix: boolean) {
  if (path === link || path === `${link}/`) return true
  if (!allowPrefix) return false
  if (link === '/' || link === '/components' || link === '/style') return false
  return path.startsWith(`${link}/`)
}

function itemHaystack(item: SideLink) {
  return `${item.text} ${item.link} ${item.progress ?? ''}`.toLowerCase()
}

watch(
  () => [props.groups, route.path] as const,
  ([groups]) => {
    const next: Record<string, boolean> = {}
    for (const group of groups) {
      if (isFlat(group) || !group.items) continue
      next[group.text] = group.items.some((item) => linkMatches(item.link, route.path, true))
    }
    open.value = next
  },
  { immediate: true },
)

const visible = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return props.groups
  return props.groups
    .map((group) => {
      if (isFlat(group)) {
        return `${group.text} ${group.link} ${group.progress ?? ''}`.toLowerCase().includes(q) ? group : null
      }
      const items = (group.items || []).filter((item) => itemHaystack(item).includes(q))
      if (!items.length) return null
      return { ...group, items, progress: averageProgress(items.map((item) => item.progress)) }
    })
    .filter((group): group is SideGroup => group != null)
})

function isOpen(name: string) {
  if (filter.value.trim()) return true
  return open.value[name] !== false
}

function isActive(link: string) {
  if (link === '/' || link === '/docs') return route.path === '/' || route.path === '/docs'
  return linkMatches(link, route.path, false)
}

function pctClass(percent: number) {
  return `doc-side-pct doc-side-pct--${progressTone(percent)}`
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-3">
    <FilterInput v-model="filter" class="h-8" placeholder="筛选文档 / 组件" />
    <nav v-auto-hide-scroll class="min-h-0 flex-1 overflow-auto pr-1 text-sm">
      <template v-for="group in visible" :key="group.link || group.text">
        <div v-if="isFlat(group) && group.link" class="mb-1">
          <RouterLink
            :to="group.link"
            class="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-foreground/80 hover:bg-accent"
            :class="isActive(group.link) ? 'bg-primary text-primary-foreground hover:bg-primary' : ''"
          >
            <span class="min-w-0 flex-1">{{ group.text }}</span>
            <span v-if="showDocProgress && group.progress != null" :class="pctClass(group.progress)">
              {{ group.progress }}%
            </span>
          </RouterLink>
        </div>
        <div v-else class="mb-3">
          <button
            class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase"
            type="button"
            @click="open[group.text] = !isOpen(group.text)"
          >
            <span class="min-w-0 flex-1 truncate text-left">{{ group.text }}</span>
            <span class="flex shrink-0 items-center gap-1.5">
              <span v-if="showDocProgress && group.progress != null" :class="pctClass(group.progress)">
                {{ group.progress }}%
              </span>
              <span>{{ isOpen(group.text) ? '–' : '+' }}</span>
            </span>
          </button>
          <ul v-show="isOpen(group.text)" class="mt-1 space-y-0.5">
            <li v-for="item in group.items" :key="item.link">
              <RouterLink
                :to="item.link"
                class="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-foreground/80 hover:bg-accent"
                :class="isActive(item.link) ? 'bg-primary text-primary-foreground hover:bg-primary' : ''"
              >
                <span class="min-w-0 flex-1">{{ item.text }}</span>
                <span v-if="showDocProgress && item.progress != null" :class="pctClass(item.progress)">
                  {{ item.progress }}%
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </template>
    </nav>
  </div>
</template>
