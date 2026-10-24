<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  actionIconClass,
  actionIconSrc,
  navLinks,
  navStacked,
  useData,
  useEnv,
  type NavLink,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const env = useEnv()
const links = computed(() => navLinks(props.schema, data.value))
const stacked = computed(() => navStacked(props.schema))
const opened = ref<Record<string, boolean>>({})

function keyOf(link: NavLink, index: string) {
  return link.to || link.label || index
}

function isOpen(link: NavLink, index: string) {
  const key = keyOf(link, index)
  if (opened.value[key] != null) return opened.value[key]
  return link.unfolded
}

const rows = computed(() => {
  const out: { link: NavLink; depth: number; index: string }[] = []
  const walk = (items: NavLink[], depth: number, prefix: string) => {
    items.forEach((link, i) => {
      const index = `${prefix}${i}`
      out.push({ link, depth, index })
      if (link.children.length && isOpen(link, index)) walk(link.children, depth + 1, `${index}-`)
    })
  }
  walk(links.value, 0, '')
  return out
})

function onClick(link: NavLink, index: string) {
  if (link.disabled) return
  if (link.children.length) {
    const key = keyOf(link, index)
    opened.value = { ...opened.value, [key]: !isOpen(link, index) }
    return
  }
  if (link.to) env.jumpTo(link.to)
}

function iconSrc(link: NavLink) {
  return actionIconSrc(link.schema)
}

function iconClass(link: NavLink) {
  return actionIconClass(link.schema)
}
</script>

<template>
  <nav data-vamis-nav :class="stacked ? 'flex flex-col gap-1' : 'flex flex-wrap gap-2'">
    <button
      v-for="row in rows"
      :key="row.index"
      type="button"
      class="rounded-md px-3 py-1.5 text-left text-sm hover:bg-accent"
      :class="row.link.active ? 'bg-primary text-primary-foreground hover:bg-primary' : ''"
      :disabled="row.link.disabled"
      :style="stacked ? { paddingLeft: `${0.75 + row.depth * 0.75}rem` } : undefined"
      @click="onClick(row.link, row.index)"
    >
      <img v-if="iconSrc(row.link)" :src="iconSrc(row.link)" alt="" class="mr-1 inline-block h-3.5 w-3.5" />
      <i v-else-if="iconClass(row.link)" :class="iconClass(row.link)" class="mr-1" />
      {{ row.link.label }}
    </button>
  </nav>
</template>
