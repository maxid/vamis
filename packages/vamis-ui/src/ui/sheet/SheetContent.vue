<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { X } from "@lucide/vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@vamis/ui/lib/utils"
import SheetOverlay from "./SheetOverlay.vue"

interface SheetContentProps extends DialogContentProps {
  class?: HTMLAttributes["class"]
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  overlay?: boolean
}

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SheetContentProps>(), {
  side: "right",
  showCloseButton: true,
  overlay: true,
})
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class", "side", "showCloseButton", "overlay")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <SheetOverlay v-if="overlay" />
    <DialogContent
      data-slot="sheet-content"
      :class="cn(
        'bg-card text-card-foreground data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 overscroll-contain shadow-lg transition-[transform,opacity] ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
        side === 'right'
          && 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
        side === 'left'
          && 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
        side === 'top'
          && 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b',
        side === 'bottom'
          && 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t',
        props.class)"
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />

      <DialogClose
        v-if="showCloseButton"
        data-slot="sheet-close"
        data-tooltip="关闭"
        data-position="left"
        class="ring-offset-background focus-visible:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
        aria-label="关闭"
      >
        <X class="size-4" />
        <span class="sr-only">关闭</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
