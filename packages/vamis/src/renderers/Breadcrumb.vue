<script setup lang="ts">
import { computed } from 'vue'
import {
  actionIconClass,
  actionIconSrc,
  breadcrumbDisplayLabel,
  breadcrumbItems,
  breadcrumbLabelMaxLength,
  breadcrumbSeparator,
  resolveClassName,
  useData,
  useEnv,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const env = useEnv()
const items = computed(() => breadcrumbItems(props.schema, data.value))
const separator = computed(() => breadcrumbSeparator(props.schema))
const maxLength = computed(() => breadcrumbLabelMaxLength(props.schema))
const separatorClass = computed(() => resolveClassName(props.schema.separatorClassName, data.value))
const itemClass = computed(() => resolveClassName(props.schema.itemClassName, data.value))

function display(item: SchemaObject, i: number) {
  return breadcrumbDisplayLabel(item, i, items.value.length, maxLength.value)
}

function iconSrc(item: SchemaObject) {
  return actionIconSrc(item)
}

function iconClass(item: SchemaObject) {
  return actionIconClass(item)
}

function go(item: SchemaObject) {
  const href = typeof item.href === 'string' ? item.href : ''
  if (href) env.jumpTo(href)
}
</script>

<template>
  <div data-vamis-breadcrumb class="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
    <template v-for="(item, i) in items" :key="i">
      <span v-if="i" class="px-0.5" :class="separatorClass">{{ separator }}</span>
      <details v-if="Array.isArray(item.dropdown) && item.dropdown.length" class="relative">
        <summary class="cursor-pointer list-none hover:text-foreground" :class="itemClass">
          <img v-if="iconSrc(item)" :src="iconSrc(item)" alt="" class="mr-1 inline-block h-3.5 w-3.5" />
          <i v-else-if="iconClass(item)" :class="iconClass(item)" class="mr-1" />
          <span :title="display(item, i).title" :class="i === items.length - 1 ? 'text-foreground' : ''">
            {{ display(item, i).text }}
          </span>
        </summary>
        <div class="absolute z-10 mt-1 min-w-[8rem] rounded-md border bg-popover p-1 shadow-md">
          <button
            v-for="(drop, di) in item.dropdown"
            :key="di"
            type="button"
            class="block w-full rounded px-2 py-1 text-left text-sm hover:bg-accent"
            @click="go(drop)"
          >
            {{ drop.label }}
          </button>
        </div>
      </details>
      <button
        v-else-if="item.href && i !== items.length - 1"
        type="button"
        class="hover:text-foreground"
        :class="itemClass"
        :title="display(item, i).title"
        @click="go(item)"
      >
        <img v-if="iconSrc(item)" :src="iconSrc(item)" alt="" class="mr-1 inline-block h-3.5 w-3.5" />
        <i v-else-if="iconClass(item)" :class="iconClass(item)" class="mr-1" />
        {{ display(item, i).text }}
      </button>
      <span
        v-else
        :class="[itemClass, i === items.length - 1 ? 'text-foreground' : '']"
        :title="display(item, i).title"
      >
        <img v-if="iconSrc(item)" :src="iconSrc(item)" alt="" class="mr-1 inline-block h-3.5 w-3.5" />
        <i v-else-if="iconClass(item)" :class="iconClass(item)" class="mr-1" />
        {{ display(item, i).text }}
      </span>
    </template>
  </div>
</template>
