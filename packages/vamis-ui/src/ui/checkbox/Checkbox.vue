<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { Check, Minus } from "@lucide/vue"
import { reactiveOmit } from "@vueuse/core"
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@vamis/ui/lib/utils"

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CheckboxRoot
    v-slot="slotProps"
    data-slot="checkbox"
    v-bind="forwarded"
    :class="
      cn('vamis-checkbox peer group cursor-pointer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary hover:enabled:data-[state=unchecked]:border-primary hover:enabled:data-[state=checked]:bg-[color-mix(in_oklch,var(--primary)_80%,white)] hover:enabled:data-[state=checked]:border-[color-mix(in_oklch,var(--primary)_80%,white)] hover:enabled:data-[state=indeterminate]:bg-[color-mix(in_oklch,var(--primary)_80%,white)] hover:enabled:data-[state=indeterminate]:border-[color-mix(in_oklch,var(--primary)_80%,white)] focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs outline-none transition-[border-color,background-color,box-shadow] duration-200 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
         props.class)"
  >
    <CheckboxIndicator
      data-slot="checkbox-indicator"
      class="grid place-content-center text-current transition-none"
    >
      <slot v-bind="slotProps">
        <Minus class="size-3.5 hidden group-data-[state=indeterminate]:block" />
        <Check class="size-3.5 group-data-[state=indeterminate]:hidden" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>

<style>
.vamis-checkbox [data-slot='checkbox-indicator'] svg {
  transform-origin: center;
  animation: vamis-check-pop 0.2s ease;
}
@keyframes vamis-check-pop {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>
