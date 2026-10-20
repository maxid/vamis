<script setup lang="ts">
import { computed } from 'vue'
import { Input, Switch } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const fields = computed(() => {
  const json = (props.schema.schema || props.schema.jsonSchema || {}) as Record<string, any>
  const properties = json.properties || {}
  return Object.entries(properties).map(([name, def]: [string, any]) => ({
    name,
    label: def.title || name,
    kind: def.type === 'boolean' ? 'boolean' : def.type === 'number' ? 'number' : 'string',
  }))
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="space-y-2">
      <div v-for="field in fields" :key="field.name" class="grid gap-1">
        <span class="text-xs text-muted-foreground">{{ field.label }}</span>
        <Switch
          v-if="field.kind === 'boolean'"
          :model-value="!!(schema.name ? (form?.getValue(schema.name) as any)?.[field.name] : false)"
          :disabled="disabled"
          @update:model-value="schema.name && form?.setValue(schema.name, { ...((form?.getValue(schema.name) as object) || {}), [field.name]: $event })"
        />
        <Input
          v-else
          :type="field.kind === 'number' ? 'number' : 'text'"
          :model-value="schema.name ? String((form?.getValue(schema.name) as any)?.[field.name] ?? '') : ''"
          :disabled="disabled"
          @update:model-value="schema.name && form?.setValue(schema.name, { ...((form?.getValue(schema.name) as object) || {}), [field.name]: $event })"
        />
      </div>
    </div>
  </FormItem>
</template>
