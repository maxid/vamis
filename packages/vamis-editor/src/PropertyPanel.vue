<script setup lang="ts">
import { computed } from 'vue'
import { Button, Input, Label, Textarea } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { fieldsForType, type EventActionType, type PropField } from './panels'

const props = defineProps<{
  schema?: SchemaObject | null
}>()

const emit = defineEmits<{
  patch: [field: string, value: unknown]
  addAction: [actionType: EventActionType]
}>()

const fields = computed(() => fieldsForType(props.schema?.type, props.schema))
const hasDedicated = computed(() => fields.value.length > 0)
const actionCount = computed(() => props.schema?.onEvent?.click?.actions?.length || 0)

function read(field: PropField): string | boolean | number {
  const value = props.schema?.[field.key]
  if (field.control === 'boolean') return !!value
  if (field.control === 'number') return value == null || value === '' ? '' : Number(value)
  if (value == null) return ''
  return String(value)
}

function write(field: PropField, raw: unknown) {
  if (field.control === 'boolean') {
    emit('patch', field.key, !!raw)
    return
  }
  if (field.control === 'number') {
    const num = Number(raw)
    emit('patch', field.key, Number.isFinite(num) ? num : undefined)
    return
  }
  emit('patch', field.key, raw === '' ? undefined : raw)
}
</script>

<template>
  <div class="space-y-3">
    <p v-if="hasDedicated" class="font-mono text-[10px] tracking-wider text-muted-foreground">
      {{ schema?.type || 'column' }} 专用
    </p>
    <p v-else class="text-xs text-muted-foreground">该 type 暂无专用面板，使用通用字段。</p>
    <div v-for="field in fields" :key="field.key" class="grid gap-1.5">
      <Label>{{ field.label }}</Label>
      <select
        v-if="field.control === 'select'"
        class="h-8 rounded-md border bg-background px-2 text-sm"
        :value="String(read(field) ?? '')"
        @change="write(field, ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <label v-else-if="field.control === 'boolean'" class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          :checked="!!read(field)"
          @change="write(field, ($event.target as HTMLInputElement).checked)"
        />
        {{ field.label }}
      </label>
      <Textarea
        v-else-if="field.control === 'textarea'"
        class="h-16 font-mono text-xs"
        :model-value="String(read(field) ?? '')"
        @update:model-value="write(field, $event)"
      />
      <Input
        v-else
        :type="field.control === 'number' ? 'number' : 'text'"
        :model-value="read(field) as any"
        @update:model-value="write(field, $event)"
      />
    </div>
    <div class="space-y-1.5 border-t pt-3">
      <Label>onEvent.click</Label>
      <p class="text-xs text-muted-foreground">当前 {{ actionCount }} 个动作</p>
      <div class="flex flex-wrap gap-1">
        <Button size="sm" variant="outline" @click="emit('addAction', 'toast')">+ toast</Button>
        <Button size="sm" variant="outline" @click="emit('addAction', 'ajax')">+ ajax</Button>
        <Button size="sm" variant="outline" @click="emit('addAction', 'dialog')">+ dialog</Button>
        <Button size="sm" variant="outline" @click="emit('addAction', 'drawer')">+ drawer</Button>
        <Button size="sm" variant="outline" @click="emit('addAction', 'setValue')">+ setValue</Button>
        <Button size="sm" variant="outline" @click="emit('addAction', 'reload')">+ reload</Button>
      </div>
    </div>
  </div>
</template>
