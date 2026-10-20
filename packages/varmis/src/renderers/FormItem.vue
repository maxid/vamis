<script setup lang="ts">
import { computed } from 'vue'
import { Label } from '@varmis/ui'
import type { SchemaObject } from '@varmis/core'
import { useForm } from '../formContext'

const props = defineProps<{
  schema: SchemaObject
}>()

const form = useForm()
const error = computed(() =>
  props.schema.name ? form?.store.errors[props.schema.name] : '',
)
const required = computed(() => !!props.schema.required)
</script>

<template>
  <div
    class="grid gap-1.5 py-1.5"
    :class="schema.mode === 'inline' ? 'sm:grid-cols-[9rem_1fr] sm:items-center' : ''"
    :data-name="schema.name"
  >
    <Label v-if="schema.label !== false && schema.label != null" class="text-foreground">
      <span v-if="required" class="mr-0.5 text-destructive">*</span>
      {{ schema.label }}
    </Label>
    <div>
      <slot />
      <p v-if="error" class="mt-1 text-xs text-destructive">{{ error }}</p>
      <p v-else-if="schema.description" class="mt-1 text-xs text-muted-foreground">
        {{ schema.description }}
      </p>
    </div>
  </div>
</template>
