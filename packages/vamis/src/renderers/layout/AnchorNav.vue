<script setup lang="ts">
import { computed, ref } from 'vue'
import { SchemaRenderer, asArray, filterTpl, isVisible, type SchemaObject } from '@vamis/core'
import { tabKey } from './utils'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const root = ref<HTMLElement | null>(null)

function flatten(links: SchemaObject[], prefix = ''): { link: SchemaObject; key: string }[] {
  const out: { link: SchemaObject; key: string }[] = []
  asArray(links).forEach((raw, i) => {
    const link = (raw && typeof raw === 'object' ? raw : { title: String(raw) }) as SchemaObject
    if (!isVisible(link, props.data)) return
    const key = String(link.href || tabKey(link, Number(`${prefix}${i}`) || i))
    out.push({ link, key })
    if (Array.isArray(link.children)) out.push(...flatten(link.children as SchemaObject[], `${key}-`))
  })
  return out
}

const sections = computed(() => flatten(asArray(props.schema.links) as SchemaObject[]))
const active = ref('')
const current = computed(() => active.value || String(props.schema.active ?? sections.value[0]?.key ?? ''))
const horizontal = computed(() => props.schema.direction === 'horizontal')

function go(key: string) {
  active.value = key
  root.value?.querySelector(`[data-anchor="${CSS.escape(key)}"]`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}
</script>

<template>
  <div
    ref="root"
    class="grid gap-4"
    :class="[schema.className, horizontal ? '' : 'lg:grid-cols-[12rem_minmax(0,1fr)]']"
  >
    <nav
      :class="[
        schema.linkClassName,
        horizontal ? 'flex flex-wrap gap-2' : 'flex flex-col gap-1',
      ]"
    >
      <button
        v-for="row in sections"
        :key="row.key"
        type="button"
        class="rounded-md px-3 py-1.5 text-left text-sm hover:bg-accent"
        :class="current === row.key ? 'bg-primary text-primary-foreground hover:bg-primary' : ''"
        @click="go(row.key)"
      >
        {{ filterTpl(row.link.title || row.link.label || row.key, data) }}
      </button>
    </nav>
    <div class="max-h-[28rem] space-y-6 overflow-auto" :class="schema.sectionClassName">
      <section v-for="row in sections" :key="'s' + row.key" :data-anchor="row.key" class="scroll-mt-3 space-y-2">
        <h3 class="text-sm font-medium">{{ filterTpl(row.link.title || row.link.label || row.key, data) }}</h3>
        <SchemaRenderer v-for="(node, j) in asArray(row.link.body)" :key="j" :schema="node" />
      </section>
    </div>
  </div>
</template>
