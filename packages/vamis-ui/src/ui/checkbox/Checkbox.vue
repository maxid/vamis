<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
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
    data-slot="checkbox"
    v-bind="forwarded"
    :class="cn('vamis-checkbox', props.class)"
  >
    <CheckboxIndicator class="vamis-checkbox__indicator">
      <slot>
        <svg class="vamis-checkbox__icon vamis-checkbox__icon--check" viewBox="0 0 1024 1024" aria-hidden="true">
          <path
            d="M806.784 295.744l45.248 45.184-362.112 362.048-45.184 45.312-226.24-226.24 45.184-45.184 180.992 180.928z"
            fill="currentColor"
          />
        </svg>
        <svg class="vamis-checkbox__icon vamis-checkbox__icon--partial" viewBox="0 0 12 12" aria-hidden="true">
          <rect x="2" y="5" width="8" height="2" fill="currentColor" />
        </svg>
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
