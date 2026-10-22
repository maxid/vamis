<script setup lang="ts">
import { computed } from 'vue'
import { Label } from '@vamis/ui'
import { isControlSize, type SchemaObject } from '@vamis/core'
import { useForm } from '../formContext'

const props = defineProps<{
  schema: SchemaObject
}>()

const form = useForm()
const error = computed(() =>
  props.schema.name ? form?.store.errors[props.schema.name] : '',
)
const required = computed(() => !!props.schema.required)
const layout = computed(() => props.schema.mode || form?.mode || 'normal')
const inline = computed(() => layout.value === 'inline')
const horizontal = computed(() => layout.value === 'horizontal')
const itemLayoutClass = computed(() => {
  if (inline.value) return 'vamis-form-item--inline'
  if (horizontal.value) return 'vamis-form-item--horizontal'
  return 'vamis-form-item--normal'
})
const sizeName = computed(() => (isControlSize(props.schema.size) ? props.schema.size : ''))
</script>

<template>
  <div
    class="vamis-form-item"
    :class="itemLayoutClass"
    :data-name="schema.name"
  >
    <Label
      v-if="schema.label !== false && schema.label != null"
      class="vamis-form-item__label"
      :class="horizontal || inline ? 'font-normal text-muted-foreground' : 'text-foreground'"
    >
      <span v-if="required" class="mr-0.5 text-destructive">*</span>
      {{ schema.label }}
    </Label>
    <div class="vamis-form-item__value min-w-0">
      <div
        class="min-w-0"
        :class="sizeName ? `vamis-control--${sizeName}` : 'vamis-control--fluid'"
      >
        <slot />
      </div>
      <p v-if="error" class="m-t-xs text-xs text-destructive">{{ error }}</p>
      <p v-else-if="schema.description" class="m-t-xs text-xs text-muted-foreground">
        {{ schema.description }}
      </p>
    </div>
  </div>
</template>
