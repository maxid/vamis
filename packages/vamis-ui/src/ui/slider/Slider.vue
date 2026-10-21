<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@vamis/ui/lib/utils"

const props = defineProps<{
  defaultValue?: number
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  class?: HTMLAttributes["class"]
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue ?? props.min ?? 0,
})

function onInput(event: Event) {
  modelValue.value = Number((event.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    data-slot="range"
    type="range"
    :min="min ?? 0"
    :max="max ?? 100"
    :step="step ?? 1"
    :disabled="disabled"
    :value="modelValue"
    :class="cn('w-full', props.class)"
    @input="onInput"
  >
</template>
