<script setup lang="ts">
import { computed } from 'vue'
import { Label } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
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
const horizontal = computed(() => layout.value === 'horizontal' || layout.value === 'inline')
</script>

<template>
  <div
    class="grid"
    :class="horizontal
      ? 'mb-[var(--form-item-gap)] last:mb-0 sm:grid-cols-[var(--form-label-width)_minmax(0,1fr)] sm:items-start sm:gap-x-3'
      : 'mb-[var(--form-item-gap)] last:mb-0 gap-1.5'"
    :data-name="schema.name"
  >
    <Label
      v-if="schema.label !== false && schema.label != null"
      :class="horizontal
        ? 'justify-end pt-[calc((var(--control-h)-1rem)/2)] text-right font-normal text-muted-foreground'
        : 'text-foreground'"
    >
      <span v-if="required" class="mr-0.5 text-destructive">*</span>
      {{ schema.label }}
    </Label>
    <div class="min-w-0">
      <slot />
      <p v-if="error" class="mt-1 text-xs text-destructive">{{ error }}</p>
      <p v-else-if="schema.description" class="mt-1 text-xs text-muted-foreground">
        {{ schema.description }}
      </p>
    </div>
  </div>
</template>
