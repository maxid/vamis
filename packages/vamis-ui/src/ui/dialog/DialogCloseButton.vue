<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { X } from "@lucide/vue"
import { cn } from "@vamis/ui/lib/utils"
import { DialogClose } from "reka-ui"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <DialogClose
    data-slot="dialog-close"
    data-tooltip="关闭"
    data-position="left"
    :class="cn('ring-offset-background focus-visible:ring-ring absolute rounded-xs opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4', props.class)"
    aria-label="关闭"
  >
    <X />
    <span class="sr-only">关闭</span>
  </DialogClose>
</template>
