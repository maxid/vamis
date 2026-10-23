<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@vamis/ui'
import { SchemaRenderer, type SchemaObject } from '@vamis/core'
import { controlInputValue, useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{
  schema: SchemaObject
  disabled?: boolean
}>()
const form = useForm()
const value = computed({
  get: () => controlInputValue(props.schema.name ? form?.getValue(props.schema.name) : undefined),
  set: (v) => props.schema.name && form?.setValue(props.schema.name, v),
})
const inputType = computed(() => {
  const type = props.schema.type
  if (type === 'input-email') return 'email'
  if (type === 'input-password') return 'password'
  if (type === 'input-url') return 'url'
  if (type === 'native-number' || type === 'input-number') return 'number'
  if (type === 'native-date') return 'date'
  if (type === 'native-time') return 'time'
  return 'text'
})
const addOn = computed(() => props.schema.addOn as SchemaObject | undefined)
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex items-stretch gap-2">
      <span v-if="schema.prefix" class="inline-flex items-center rounded-md border bg-muted px-2 text-xs text-muted-foreground">
        {{ schema.prefix }}
      </span>
      <Input
        v-model="value"
        :type="inputType"
        :placeholder="schema.placeholder"
        :disabled="disabled"
        class="w-full"
      />
      <span v-if="schema.suffix" class="inline-flex items-center rounded-md border bg-muted px-2 text-xs text-muted-foreground">
        {{ schema.suffix }}
      </span>
      <SchemaRenderer v-if="addOn" :schema="addOn.type ? addOn : { type: 'button', ...addOn }" />
    </div>
  </FormItem>
</template>
