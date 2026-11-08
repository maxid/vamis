<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@vamis/ui/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <tr
    data-slot="table-row"
    :class="cn('hover:bg-muted/50 transition-colors', props.class)"
  >
    <slot />
  </tr>
</template>
