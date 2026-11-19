<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@vamis/ui/lib/utils"
import DialogOverlay from "./DialogOverlay.vue"
import DialogCloseButton from "./DialogCloseButton.vue"

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DialogContentProps & { class?: HTMLAttributes["class"], showCloseButton?: boolean, overlayClass?: HTMLAttributes["class"] }>(), {
  showCloseButton: true,
})
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class", "showCloseButton", "overlayClass")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <DialogOverlay :class="props.overlayClass" />
    <DialogContent
      data-slot="dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-card text-card-foreground fixed top-[60px] left-[50%] z-50 flex w-full translate-x-[-50%] flex-col gap-0 overflow-visible rounded-[6px] border p-0 shadow-none',
          props.class,
        )"
    >
      <slot />

      <DialogCloseButton
        v-if="showCloseButton"
        class="top-4 right-4"
      />
    </DialogContent>
  </DialogPortal>
</template>
