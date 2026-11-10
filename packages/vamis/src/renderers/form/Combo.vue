<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  comboChildSchema,
  comboItemMode,
  type SchemaObject,
} from '@vamis/core'
import { Button } from '@vamis/ui'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import NestedFormScope from '../../NestedFormScope.vue'
import FormRow from './FormRow.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const multiple = computed(() => props.schema.multiple === true)
const multiLine = computed(() => props.schema.multiLine === true)
const itemMode = computed(() => comboItemMode(props.schema))
const fields = computed(() => asArray(props.schema.items || props.schema.columns))
const rowNodes = computed(() => fields.value.map((node) => comboChildSchema(node, itemMode.value)))

const rows = computed<Record<string, any>[]>(() => {
  const value = props.schema.name ? form?.getValue(props.schema.name) : undefined
  if (multiple.value) {
    return Array.isArray(value) && value.length ? (value as Record<string, any>[]) : [{}]
  }
  return [value && typeof value === 'object' ? (value as Record<string, any>) : {}]
})

function persist(next: Record<string, any>[]) {
  if (!props.schema.name) return
  form?.setValue(props.schema.name, multiple.value ? next : next[0] || {})
}

function add() {
  persist([...rows.value.map((row) => ({ ...row })), {}])
}

function remove(index: number) {
  const next = rows.value.filter((_, i) => i !== index)
  persist(next.length ? next : [{}])
}

function persistCurrent() {
  persist(rows.value.map((row) => ({ ...row })))
}
</script>

<template>
  <FormItem :schema="schema">
    <div
      class="vamis-combo"
      :class="multiLine ? 'vamis-combo--ver' : 'vamis-combo--hor'"
    >
      <div class="vamis-combo-items">
        <div
          v-for="(row, i) in rows"
          :key="i"
          class="vamis-combo-item"
        >
          <div class="vamis-combo-item-inner">
            <NestedFormScope :row="row" :persist="persistCurrent" :mode="itemMode">
              <FormRow
                v-if="itemMode === 'row'"
                :nodes="rowNodes"
                :extra-data="row"
              />
              <template v-else>
                <SchemaRenderer
                  v-for="(node, fi) in rowNodes"
                  :key="fi"
                  :schema="node"
                  :extra-data="row"
                />
              </template>
            </NestedFormScope>
          </div>
          <button
            v-if="multiple && rows.length > 1"
            type="button"
            class="vamis-combo-del"
            :disabled="disabled"
            @click="remove(i)"
          >
            删除
          </button>
        </div>
      </div>
      <Button
        v-if="multiple"
        type="button"
        size="sm"
        variant="outline"
        :disabled="disabled"
        @click="add"
      >
        新增一项
      </Button>
    </div>
  </FormItem>
</template>
