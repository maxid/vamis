<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@vamis/ui/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <td
    data-slot="table-cell"
    :class="
      cn(
        'h-[var(--table-row-h)] px-3 py-0 align-middle text-sm whitespace-nowrap tabular-nums [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
        props.class,
      )
    "
  >
    <slot />
  </td>
</template>
