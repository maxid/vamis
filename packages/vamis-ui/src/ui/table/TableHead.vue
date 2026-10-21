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
    :class="cn('bg-muted/50 text-muted-foreground h-[var(--table-row-h)] px-[var(--table-cell-px)] text-left align-middle text-xs font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5', props.class)"
  >
    <slot />
  </th>
</template>
