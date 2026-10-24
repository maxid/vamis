<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  actionIconClass,
  actionIconSrc,
  actionKind,
  actionLabel,
  actionLevel,
  actionShowLabel,
  actionTooltip,
  createVamisEvent,
  eventEvalData,
  runAction,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { Button, levelToVariant, sizeToButtonSize } from '@vamis/ui'
import BadgeHost from './BadgeHost.vue'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
  disabled?: boolean
}>()

const data = useData()
const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const form = useFormApi()
const loading = ref(false)

const kind = computed(() => actionKind(props.schema))
const label = computed(() => actionLabel(props.schema, data.value))
const showLabel = computed(() => actionShowLabel(props.schema))
const variant = computed(() => levelToVariant(actionLevel(props.schema), kind.value))
const size = computed(() => sizeToButtonSize(props.schema.size))
const iconSrc = computed(() => actionIconSrc(props.schema))
const iconClass = computed(() => actionIconClass(props.schema))
const rightSrc = computed(() => actionIconSrc(props.schema, 'rightIcon'))
const rightClass = computed(() => actionIconClass(props.schema, 'rightIcon'))
const tooltip = computed(() => actionTooltip(props.schema, data.value))
const block = computed(() => props.schema.block === true)

async function onClick() {
  loading.value = true
  const event = createVamisEvent('click', data.value, { type: 'click' })
  const ctx = {
    env,
    data: eventEvalData(data.value, event),
    scoped,
    overlay,
    form,
    scope: scope.value,
    event,
  }
  try {
    await runOnEvent(props.schema, 'click', ctx)
    if (!event.prevented) {
      await runAction({ ...props.schema, actionType: kind.value }, ctx)
    }
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BadgeHost :schema="schema" :data="data">
    <Button
      :variant="variant"
      :size="size"
      :disabled="disabled || loading"
      type="button"
      :title="tooltip || undefined"
      :class="block ? 'w-full' : undefined"
      @click="onClick"
    >
      <img v-if="iconSrc" :src="iconSrc" alt="" class="size-4" />
      <span v-else-if="iconClass" :class="iconClass" aria-hidden="true" />
      <template v-if="showLabel">{{ loading ? '处理中…' : label }}</template>
      <img v-if="rightSrc" :src="rightSrc" alt="" class="size-4" />
      <span v-else-if="rightClass" :class="rightClass" aria-hidden="true" />
    </Button>
  </BadgeHost>
</template>
