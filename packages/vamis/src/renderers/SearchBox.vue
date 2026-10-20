<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, Input } from '@vamis/ui'
import { useEnv, useScoped, type SchemaObject } from '@vamis/core'
import { useForm } from '../formContext'
import { useCrudHost } from './data/crudHost'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const env = useEnv()
const scoped = useScoped()
const crudHost = useCrudHost()
const local = ref(props.schema.value ?? '')
const value = computed({
  get: () => (props.schema.name && form ? form.getValue(props.schema.name) : local.value) ?? '',
  set: (next) => {
    if (props.schema.name && form) form.setValue(props.schema.name, next)
    else local.value = next
  },
})

async function search() {
  if (form) {
    form.submit()
    return
  }
  const key = props.schema.name || 'keywords'
  const extra = { [key]: value.value }
  if (props.schema.target) {
    await scoped?.reload(String(props.schema.target), extra)
    return
  }
  if (crudHost?.reload) {
    await crudHost.reload(extra)
    return
  }
  env.notify('info', `搜索：${value.value || ''}`)
}
</script>

<template>
  <div class="flex gap-2">
    <Input v-model="value" :placeholder="schema.placeholder || '搜索'" :disabled="disabled" class="flex-1" />
    <Button type="button" size="sm" :disabled="disabled" @click="search">搜索</Button>
  </div>
</template>
