<script setup lang="ts">
import { computed, ref } from 'vue'
import { SchemaRenderer, asArray, filterTpl, useEnv, type SchemaObject } from '@vamis/core'

interface NavItem {
  key: string
  label: string
  schema?: SchemaObject
  link?: string
  isDefault?: boolean
  children: NavItem[]
}

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()

function toNav(pages: unknown[], prefix = ''): NavItem[] {
  return asArray(pages as SchemaObject[]).flatMap((raw, i) => {
    const page = (raw && typeof raw === 'object' ? raw : {}) as SchemaObject
    if (page.visible === false) return []
    const key = String(page.url || page.label || `${prefix}${i}`)
    const children = Array.isArray(page.children) ? toNav(page.children, `${key}-`) : []
    const schema = page.schema
      ? (page.schema as SchemaObject)
      : page.body != null
        ? { type: 'wrapper', body: page.body }
        : undefined
    return [
      {
        key,
        label: filterTpl(page.label || page.title || `页面 ${i + 1}`, props.data),
        schema,
        link: typeof page.link === 'string' ? page.link : undefined,
        isDefault: page.isDefaultPage === true,
        children,
      },
    ]
  })
}

const nav = computed(() => toNav(asArray(props.schema.pages)))

const flat = computed(() => {
  const out: { item: NavItem; depth: number; group: boolean }[] = []
  const walk = (items: NavItem[], depth: number) => {
    for (const item of items) {
      const selectable = !!(item.schema || item.link)
      if (item.children.length && !selectable) {
        out.push({ item, depth, group: true })
      } else if (selectable) {
        out.push({ item, depth, group: false })
      }
      if (item.children.length) walk(item.children, depth + 1)
    }
  }
  walk(nav.value, 0)
  return out
})

function findNav(items: NavItem[], pred: (item: NavItem) => boolean): NavItem | null {
  for (const item of items) {
    if (pred(item)) return item
    const child = findNav(item.children, pred)
    if (child) return child
  }
  return null
}

function firstLeaf(items: NavItem[]): NavItem | null {
  return findNav(items, (item) => !!(item.isDefault && item.schema)) || findNav(items, (item) => !!item.schema)
}

const currentKey = ref('')
const current = computed(() => {
  const key = currentKey.value
  const found = flat.value.find((row) => !row.group && row.item.key === key)?.item
  return found || firstLeaf(nav.value)
})

function select(item: NavItem) {
  if (item.link) {
    env.jumpTo(item.link)
    return
  }
  if (item.schema) currentKey.value = item.key
}
</script>

<template>
  <section class="overflow-hidden rounded-lg border bg-card">
    <header v-if="schema.brandName || schema.logo" class="flex items-center gap-2 border-b px-4 py-3">
      <img v-if="schema.logo" :src="schema.logo" alt="" class="h-6 w-6 rounded object-cover" />
      <h2 class="text-sm font-semibold">{{ schema.brandName }}</h2>
    </header>
    <div class="grid gap-0 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <aside class="space-y-1 border-b p-2 lg:border-r lg:border-b-0">
        <template v-for="row in flat" :key="row.item.key">
          <p
            v-if="row.group"
            class="px-2 pt-2 pb-1 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase"
            :style="{ paddingLeft: `${0.5 + row.depth}rem` }"
          >
            {{ row.item.label }}
          </p>
          <button
            v-else
            type="button"
            class="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            :class="current?.key === row.item.key ? 'bg-primary text-primary-foreground hover:bg-primary' : ''"
            :style="{ paddingLeft: `${0.5 + row.depth}rem` }"
            @click="select(row.item)"
          >
            {{ row.item.label }}
          </button>
        </template>
      </aside>
      <div class="min-w-0 space-y-3 p-4">
        <SchemaRenderer v-if="current?.schema" :key="current.key" :schema="current.schema" />
        <p v-else class="text-sm text-muted-foreground">页面不存在</p>
      </div>
    </div>
  </section>
</template>
