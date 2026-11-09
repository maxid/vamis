<script setup lang="ts">
import { ref } from 'vue'
import { cn, Input, VamisClear } from '@vamis/ui'

const model = defineModel<string>({ default: '' })
const props = defineProps<{
  placeholder?: string
  class?: string
}>()

const wrapEl = ref<HTMLElement | null>(null)

function clear() {
  model.value = ''
  wrapEl.value?.querySelector('input')?.focus()
}
</script>

<template>
  <div ref="wrapEl" class="relative">
    <Input
      v-model="model"
      :placeholder="placeholder"
      :class="cn('pr-7', props.class)"
    />
    <button
      v-if="model"
      type="button"
      class="vamis-select__clear absolute top-1/2 right-1.5 -translate-y-1/2"
      aria-label="清除"
      @mousedown.prevent
      @click="clear"
    >
      <VamisClear />
    </button>
  </div>
</template>
