<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SchemaRenderer,
  appBrandName,
  appDefaultPage,
  appFlat,
  appNav,
  appNotFoundPage,
  appSlot,
  useData,
  useEnv,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const env = useEnv()

const nav = computed(() => appNav(props.schema, data.value))
const flat = computed(() => appFlat(nav.value))
const brand = computed(() => appBrandName(props.schema, data.value))
const header = computed(() => appSlot(props.schema, 'header'))
const asideBefore = computed(() => appSlot(props.schema, 'asideBefore'))
const asideAfter = computed(() => appSlot(props.schema, 'asideAfter'))
const footer = computed(() => appSlot(props.schema, 'footer'))
const logoSrc = computed(() => {
  const logo = props.schema.logo
  return typeof logo === 'string' && (logo.startsWith('http') || logo.includes('/')) ? logo : ''
})

const currentKey = ref('')
const current = computed(() => {
  const key = currentKey.value
  if (key) {
    const found = flat.value.find((row) => !row.group && row.item.key === key)?.item
    if (found?.schema) return found
    return appNotFoundPage(nav.value)
  }
  return appDefaultPage(nav.value)
})

function select(item: (typeof flat.value)[number]['item']) {
  if (item.link) {
    env.jumpTo(item.link)
    return
  }
  if (item.schema) currentKey.value = item.key
}
</script>

<template>
  <div data-vamis-app class="w-full min-w-0 overflow-hidden rounded-lg border bg-card">
    <div
      v-if="brand || logoSrc || header.length"
      class="flex items-center gap-2 border-b px-4 py-3"
    >
      <img v-if="logoSrc" :src="logoSrc" alt="" class="h-6 w-6 rounded object-cover" />
      <h1 v-if="brand" class="text-sm font-semibold">{{ brand }}</h1>
      <SchemaRenderer v-for="(node, i) in header" :key="i" :schema="node" />
    </div>
    <div class="grid gap-0 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <div class="space-y-1 border-b p-2 lg:border-r lg:border-b-0">
        <SchemaRenderer v-for="(node, i) in asideBefore" :key="`before-${i}`" :schema="node" />
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
        <SchemaRenderer v-for="(node, i) in asideAfter" :key="`after-${i}`" :schema="node" />
      </div>
      <div class="min-w-0 space-y-3 p-4">
        <SchemaRenderer v-if="current?.schema" :key="current.key" :schema="current.schema" />
        <p v-else class="text-sm text-muted-foreground">页面不存在</p>
      </div>
    </div>
    <div v-if="footer.length" class="border-t px-4 py-3">
      <SchemaRenderer v-for="(node, i) in footer" :key="i" :schema="node" />
    </div>
  </div>
</template>
