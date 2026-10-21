<script setup lang="ts">
import type { TocItem } from '../docs/render'

defineProps<{
  items: TocItem[]
  activeId: string
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

function padClass(level: number) {
  if (level <= 2) return 'pl-3'
  if (level === 3) return 'pl-6'
  return 'pl-9'
}
</script>

<template>
  <nav class="flex h-full min-h-0 flex-col py-6 pr-3 pl-4" aria-label="本页内容">
    <p class="mb-3 text-xs font-medium tracking-wide text-muted-foreground">内容</p>
    <ul v-auto-hide-scroll class="min-h-0 flex-1 overflow-auto border-l border-border text-xs">
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${encodeURIComponent(item.id)}`"
          :data-toc-id="item.id"
          :aria-current="activeId === item.id ? 'location' : undefined"
          class="-ml-px block border-l-2 py-1 pr-2 leading-5 transition-colors"
          :class="[
            padClass(item.level),
            activeId === item.id
              ? 'border-primary font-medium text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          ]"
          @click.prevent="emit('select', item.id)"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
