<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  runAction,
  runOnEvent,
  useEnv,
  useFormApi,
  useOverlay,
  useScoped,
  type SchemaObject,
} from '@varmis/core'
import { Button } from '@varmis/ui'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
  disabled?: boolean
}>()

const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const form = useFormApi()
const loading = ref(false)

const label = computed(() => props.schema.label || props.schema.title || '按钮')
const actionType = computed(
  () =>
    props.schema.actionType ||
    (props.schema.type === 'submit' ? 'submit' : props.schema.type === 'reset' ? 'reset' : 'button'),
)
const variant = computed(() =>
  props.schema.level === 'primary' || actionType.value === 'submit'
    ? 'default'
    : props.schema.level === 'danger'
      ? 'destructive'
      : 'outline',
)

async function onClick() {
  loading.value = true
  const ctx = { env, data: props.data, scoped, overlay, form }
  try {
    await runAction({ ...props.schema, actionType: actionType.value }, ctx)
    await runOnEvent(props.schema, 'click', ctx)
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Button :variant="variant as any" :disabled="disabled || loading" type="button" @click="onClick">
    {{ loading ? '处理中…' : label }}
  </Button>
</template>
