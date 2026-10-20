<script setup lang="ts">
import { computed } from 'vue'
import {
  CONDITION_OPERATORS,
  emptyConditionRule,
  normalizeConditionValue,
  type ConditionRule,
  type SchemaObject,
} from '@vamis/core'
import { Button, Input } from '@vamis/ui'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()

const fields = computed(() =>
  (Array.isArray(props.schema.fields) ? props.schema.fields : []).map((item: any) => ({
    name: String(item.name || item.field || ''),
    label: String(item.label || item.name || ''),
    type: String(item.type || 'text'),
    operators: Array.isArray(item.operators) ? item.operators.map(String) : CONDITION_OPERATORS.map((op) => op.value),
    options: Array.isArray(item.options) ? item.options : [],
  })),
)

const value = computed({
  get: () => normalizeConditionValue(props.schema.name ? form?.getValue(props.schema.name) : undefined),
  set: (next) => props.schema.name && form?.setValue(props.schema.name, next),
})

function opsFor(fieldName: string) {
  const field = fields.value.find((item) => item.name === fieldName)
  const allowed = new Set(field?.operators || CONDITION_OPERATORS.map((op) => op.value))
  return CONDITION_OPERATORS.filter((op) => allowed.has(op.value))
}

function fieldOptions(fieldName: string) {
  return fields.value.find((item) => item.name === fieldName)?.options || []
}

function needsValue(op: string) {
  return op !== 'is_empty' && op !== 'is_not_empty'
}

function patchRule(index: number, patch: Partial<ConditionRule>) {
  const children = value.value.children.map((rule, i) => (i === index ? { ...rule, ...patch } : { ...rule }))
  value.value = { ...value.value, children }
}

function addRule() {
  value.value = { ...value.value, children: [...value.value.children, emptyConditionRule()] }
}

function removeRule(index: number) {
  const children = value.value.children.filter((_, i) => i !== index)
  value.value = { ...value.value, children: children.length ? children : [emptyConditionRule()] }
}

function setConjunction(conjunction: 'and' | 'or') {
  value.value = { ...value.value, conjunction }
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="space-y-2 rounded-md border p-3">
      <div class="flex items-center gap-2 text-xs">
        <span class="text-muted-foreground">组合</span>
        <Button type="button" size="sm" :variant="value.conjunction === 'and' ? 'default' : 'outline'" :disabled="disabled" @click="setConjunction('and')">且</Button>
        <Button type="button" size="sm" :variant="value.conjunction === 'or' ? 'default' : 'outline'" :disabled="disabled" @click="setConjunction('or')">或</Button>
      </div>
      <div v-for="(rule, i) in value.children" :key="i" class="flex flex-wrap items-center gap-2">
        <select
          class="h-9 rounded-md border bg-transparent px-2 text-sm"
          :value="rule.field"
          :disabled="disabled"
          @change="patchRule(i, { field: ($event.target as HTMLSelectElement).value, value: '' })"
        >
          <option value="">字段</option>
          <option v-for="field in fields" :key="field.name" :value="field.name">{{ field.label }}</option>
        </select>
        <select
          class="h-9 rounded-md border bg-transparent px-2 text-sm"
          :value="rule.op"
          :disabled="disabled"
          @change="patchRule(i, { op: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="op in opsFor(rule.field)" :key="op.value" :value="op.value">{{ op.label }}</option>
        </select>
        <select
          v-if="needsValue(rule.op) && fieldOptions(rule.field).length"
          class="h-9 min-w-28 rounded-md border bg-transparent px-2 text-sm"
          :value="String(rule.value ?? '')"
          :disabled="disabled"
          @change="patchRule(i, { value: ($event.target as HTMLSelectElement).value })"
        >
          <option value="">值</option>
          <option
            v-for="opt in fieldOptions(rule.field)"
            :key="String(opt.value ?? opt)"
            :value="String(opt.value ?? opt)"
          >
            {{ opt.label ?? opt }}
          </option>
        </select>
        <Input
          v-else-if="needsValue(rule.op)"
          :model-value="rule.value == null ? '' : String(rule.value)"
          class="min-w-28 flex-1"
          placeholder="值"
          :disabled="disabled"
          @update:model-value="patchRule(i, { value: $event })"
        />
        <Button type="button" size="sm" variant="ghost" :disabled="disabled" @click="removeRule(i)">删</Button>
      </div>
      <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="addRule">添加条件</Button>
    </div>
  </FormItem>
</template>
