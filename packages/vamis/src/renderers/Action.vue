<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  runAction,
  runOnEvent,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { Button, levelToVariant, sizeToButtonSize } from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
  disabled?: boolean
}>()

const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const form = useFormApi()
const loading = ref(false)

const label = computed(() => props.schema.label || props.schema.title || '按钮')
const actionType = computed(
  () =>
    props.schema.actionType ||
    (props.schema.type === 'submit' ? 'submit' : props.schema.type === 'reset' ? 'reset' : 'button'),
)
const variant = computed(() => levelToVariant(props.schema.level, actionType.value))
const size = computed(() => sizeToButtonSize(props.schema.size))

async function onClick() {
  loading.value = true
  const event = createVamisEvent('click', props.data, { type: 'click' })
  const ctx = {
    env,
    data: eventEvalData(props.data, event),
    scoped,
    overlay,
    form,
    scope: scope.value,
    event,
  }
  try {
    await runOnEvent(props.schema, 'click', ctx)
    if (!event.prevented) {
      await runAction({ ...props.schema, actionType: actionType.value }, ctx)
    }
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Button :variant="variant" :size="size" :disabled="disabled || loading" type="button" @click="onClick">
    {{ loading ? '处理中…' : label }}
  </Button>
</template>
