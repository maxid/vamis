<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Input } from '@vamis/ui'
import type { SideGroup } from '../docs/sidebar'

const props = defineProps<{
  groups: SideGroup[]
}>()

const route = useRoute()
const filter = ref('')
const open = ref<Record<string, boolean>>({})

watch(
  () => [props.groups, route.path] as const,
  ([groups]) => {
    const next: Record<string, boolean> = {}
    for (const group of groups) {
      const hasActive = group.items.some(
        (item) => route.path === item.link || route.path.startsWith(`${item.link}/`),
      )
      next[group.text] = hasActive
    }
    open.value = next
  },
  { immediate: true },
)

const visible = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return props.groups
  return props.groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => `${item.text} ${item.link}`.toLowerCase().includes(q)),
    }))
    .filter((group) => group.items.length)
})

function isOpen(name: string) {
  if (filter.value.trim()) return true
  return open.value[name] !== false
}

function isActive(link: string) {
  if (link === '/docs') return route.path === '/docs'
  return route.path === link || route.path === `${link}/`
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-3">
    <Input v-model="filter" class="h-8" placeholder="筛选文档 / 组件" />
    <nav class="min-h-0 flex-1 overflow-auto pr-1 text-sm">
      <div v-for="group in visible" :key="group.text" class="mb-3">
        <button
          class="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase"
          type="button"
          @click="open[group.text] = !isOpen(group.text)"
        >
          {{ group.text }}
          <span>{{ isOpen(group.text) ? '–' : '+' }}</span>
        </button>
        <ul v-show="isOpen(group.text)" class="mt-1 space-y-0.5">
          <li v-for="item in group.items" :key="item.link">
            <RouterLink
              :to="item.link"
              class="block rounded-md px-2 py-1 text-foreground/80 hover:bg-accent"
              :class="isActive(item.link) ? 'bg-primary text-primary-foreground hover:bg-primary' : ''"
            >
              {{ item.text }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>
