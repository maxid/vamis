<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  SchemaRenderer,
  anchorNavActive,
  anchorNavHorizontal,
  anchorNavSections,
  resolveClassName,
  useData,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const root = ref<HTMLElement | null>(null)
const sections = computed(() => anchorNavSections(props.schema, data.value))
const chosen = ref('')
const current = computed(() => chosen.value || anchorNavActive(props.schema, sections.value))
const horizontal = computed(() => anchorNavHorizontal(props.schema))
const linkClass = computed(() => resolveClassName(props.schema.linkClassName, data.value))
const sectionClass = computed(() => resolveClassName(props.schema.sectionClassName, data.value))

watch(
  () => [props.schema.active, sections.value.map((row) => row.key).join('|')] as const,
  () => {
    chosen.value = ''
  },
)

function go(key: string) {
  chosen.value = key
  root.value?.querySelector(`[data-anchor="${CSS.escape(key)}"]`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}
</script>

<template>
  <div
    ref="root"
    data-vamis-anchor-nav
    class="grid w-full min-w-0 gap-4"
    :class="horizontal ? '' : 'lg:grid-cols-[12rem_minmax(0,1fr)]'"
  >
    <div :class="[linkClass, horizontal ? 'flex flex-wrap gap-2' : 'flex flex-col gap-1']">
      <button
        v-for="row in sections"
        :key="row.key"
        type="button"
        class="rounded-md px-3 py-1.5 text-left text-sm hover:bg-accent"
        :class="current === row.key ? 'bg-primary text-primary-foreground hover:bg-primary' : ''"
        @click="go(row.key)"
      >
        {{ row.title }}
      </button>
    </div>
    <div class="max-h-[28rem] space-y-6 overflow-auto" :class="sectionClass">
      <div v-for="row in sections" :key="'s' + row.key" :data-anchor="row.key" class="scroll-mt-3 space-y-2">
        <h3 class="text-sm font-medium">{{ row.title }}</h3>
        <SchemaRenderer v-for="(node, j) in row.body" :key="j" :schema="node" />
      </div>
    </div>
  </div>
</template>
