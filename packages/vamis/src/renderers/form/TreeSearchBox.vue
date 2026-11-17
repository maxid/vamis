<script setup lang="ts">
import { ref, watch } from 'vue'
import { VamisClear, VamisIcon } from '@vamis/ui'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  sticky?: boolean
  searchImmediately?: boolean
}>(), {
  placeholder: '请输入',
  searchImmediately: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const draft = ref(props.modelValue ?? '')
const focused = ref(false)

watch(
  () => props.modelValue,
  (value) => {
    draft.value = value ?? ''
  },
)

function commit(value: string) {
  draft.value = value
  emit('update:modelValue', value)
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  draft.value = value
  if (props.searchImmediately) emit('update:modelValue', value)
}

function onClear() {
  commit('')
}

function onSearch() {
  emit('update:modelValue', draft.value)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    onSearch()
  }
}
</script>

<template>
  <div
    class="vamis-search-box is-active"
    :class="{ 'is-sticky': sticky, 'is-disabled': disabled, 'is-focused': focused }"
  >
    <input
      :value="draft"
      class="vamis-search-box__input"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      autocomplete="off"
      @focus="focused = true"
      @blur="focused = false"
      @input="onInput"
      @keydown="onKeydown"
    >
    <button
      v-if="draft && !disabled"
      type="button"
      class="vamis-select__clear vamis-search-box__clear"
      aria-label="清除"
      @mousedown.prevent
      @click="onClear"
    >
      <VamisClear />
    </button>
    <a
      class="vamis-search-box__btn"
      role="button"
      tabindex="0"
      aria-label="搜索"
      @click="onSearch"
      @keydown.enter.prevent="onSearch"
    >
      <VamisIcon name="search" />
    </a>
  </div>
</template>
