<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, Input, ScrollArea } from '@vamis/ui'
import { cn } from '@vamis/ui/lib/utils'
import type { CatalogGroup, CatalogLeaf } from '../catalog'

const props = defineProps<{
  groups: CatalogGroup[]
  selectedId?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  select: [leaf: CatalogLeaf]
}>()

const query = ref('')
const collapsed = ref<Set<string>>(new Set(props.groups.slice(1).map((group) => group.id)))

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.groups
  return props.groups
    .map((group) => ({
      ...group,
      children: group.children.filter(
        (leaf) =>
          leaf.searchable.includes(q) ||
          leaf.label.toLowerCase().includes(q) ||
          (leaf.type || '').toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.children.length > 0)
})

function isOpen(id: string) {
  if (query.value.trim()) return true
  return !collapsed.value.has(id)
}

function toggle(id: string) {
  const next = new Set(collapsed.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  collapsed.value = next
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="shrink-0 px-3 pb-2 pt-2">
      <Input v-model="query" :placeholder="placeholder || '筛选…'" class="text-sm" />
    </div>
    <ScrollArea class="min-h-0 flex-1">
      <div class="space-y-1 px-2 pb-3">
        <div v-for="group in filtered" :key="group.id">
          <button
            type="button"
            class="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            @click="toggle(group.id)"
          >
            <span
              class="inline-block size-0 border-y-4 border-y-transparent border-l-[6px] border-l-current transition-transform"
              :class="isOpen(group.id) ? 'translate-y-px rotate-90' : ''"
            />
            <span class="min-w-0 flex-1 truncate">{{ group.label }}</span>
            <span class="font-mono text-[10px] tabular-nums">{{ group.children.length }}</span>
          </button>
          <div v-show="isOpen(group.id)" class="pb-1 pl-2">
            <Button
              v-for="leaf in group.children"
              :key="leaf.id"
              size="sm"
              :variant="selectedId === leaf.id ? 'default' : 'ghost'"
              :class="cn('h-auto w-full justify-start gap-2 px-2 py-1.5 text-left font-normal whitespace-normal')"
              @click="emit('select', leaf)"
            >
              <span class="min-w-0 flex-1 text-xs leading-4">{{ leaf.label }}</span>
              <span
                v-if="leaf.type"
                class="shrink-0 font-mono text-[10px] opacity-70"
              >
                {{ leaf.type }}
              </span>
            </Button>
          </div>
        </div>
        <p v-if="!filtered.length" class="px-2 py-6 text-center text-xs text-muted-foreground">
          没有匹配项
        </p>
      </div>
    </ScrollArea>
  </div>
</template>
