<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@vamis/ui/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <th
    data-slot="table-head"
    :class="cn('h-[var(--table-row-h)] px-[var(--table-cell-px)] text-left align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0', props.class)"
  >
    <slot />
  </th>
</template>
