<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import {
  dumpJoined,
  flattenOptions,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
  type OptionItem,
} from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const open = ref(false)
const keyword = ref('')
const draft = ref<unknown[]>([])

const multiple = computed(() => !!props.schema.multiple)
const joinValues = computed(() => props.schema.joinValues !== false)
const labelField = computed(() => String(props.schema.labelField || 'label'))
const valueField = computed(() => String(props.schema.valueField || 'value'))

const options = computed(() => {
  const raw = normalizeOptions(props.schema.options)
  return flattenOptions(raw).map((item) => ({
    ...item,
    label: String((item as any)[labelField.value] ?? item.label),
    value: (item as any)[valueField.value] ?? item.value,
  }))
})

const selected = computed({
  get: () =>
    parseJoined(props.schema.name ? form?.getValue(props.schema.name) : '', multiple.value, joinValues.value),
  set: (values: unknown[]) => {
    if (!props.schema.name) return
    form?.setValue(props.schema.name, dumpJoined(values, multiple.value, joinValues.value))
  },
})

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return options.value
  return options.value.filter((item) => item.label.toLowerCase().includes(q) || String(item.value).toLowerCase().includes(q))
})

const selectedLabels = computed(() =>
  selected.value.map((value) => options.value.find((item) => optionValuesEqual(item.value, value))?.label || String(value)),
)

function isChecked(option: OptionItem) {
  return draft.value.some((item) => optionValuesEqual(item, option.value))
}

function toggle(option: OptionItem, checked: boolean) {
  if (!multiple.value) {
    draft.value = checked ? [option.value] : []
    return
  }
  const next = draft.value.filter((item) => !optionValuesEqual(item, option.value))
  draft.value = checked ? [...next, option.value] : next
}

function openPicker() {
  draft.value = [...selected.value]
  keyword.value = ''
  open.value = true
}

function confirm() {
  selected.value = [...draft.value]
  open.value = false
}

function clear() {
  selected.value = []
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex flex-wrap items-center gap-2">
      <Badge v-for="(label, i) in selectedLabels" :key="i" variant="secondary">{{ label }}</Badge>
      <span v-if="!selectedLabels.length" class="text-sm text-muted-foreground">{{ schema.placeholder || '请选择' }}</span>
      <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="openPicker">选择</Button>
      <Button v-if="selectedLabels.length && schema.clearable !== false" type="button" size="sm" variant="ghost" :disabled="disabled" @click="clear">清除</Button>
    </div>
    <Dialog :open="open" @update:open="open = $event">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ schema.modalTitle || schema.label || '请选择' }}</DialogTitle>
        </DialogHeader>
        <Input v-model="keyword" placeholder="筛选" class="mb-2" />
        <ul class="max-h-64 space-y-1 overflow-auto rounded-md border p-2">
          <li v-for="opt in filtered" :key="String(opt.value)">
            <label class="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent">
              <Checkbox :model-value="isChecked(opt)" @update:model-value="toggle(opt, $event === true)" />
              <span>{{ opt.label }}</span>
            </label>
          </li>
          <li v-if="!filtered.length" class="px-2 py-6 text-center text-xs text-muted-foreground">暂无选项</li>
        </ul>
        <DialogFooter>
          <Button type="button" variant="outline" @click="open = false">取消</Button>
          <Button type="button" @click="confirm">确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </FormItem>
</template>
