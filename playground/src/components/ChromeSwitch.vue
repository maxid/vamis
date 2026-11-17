<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  onText: string
  offText: string
  ariaLabel?: string
  'aria-label'?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label class="vamis-switch doc-chrome-switch" :class="{ 'is-checked': modelValue }">
    <input
      class="vamis-switch__input"
      type="checkbox"
      :checked="modelValue"
      :aria-label="props.ariaLabel || props['aria-label']"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="vamis-switch__text">{{ modelValue ? onText : offText }}</span>
    <span class="vamis-switch__slider" aria-hidden="true"></span>
  </label>
</template>
