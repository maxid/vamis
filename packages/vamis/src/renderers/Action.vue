<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  actionKind,
  actionLabel,
  actionLevel,
  actionShowLabel,
  actionTooltip,
  filterTpl,
  iconVendor,
  resolveIcon,
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
import IconMark from './IconMark.vue'

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
function resolveSchemaIcon(raw: unknown) {
  const value = typeof raw === 'string' ? filterTpl(raw, data.value) : raw
  return resolveIcon(value, { vendor: iconVendor(props.schema) })
}
const icon = computed(() => resolveSchemaIcon(props.schema.icon))
const rightIcon = computed(() => resolveSchemaIcon(props.schema.rightIcon))
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
      <IconMark v-if="icon.kind !== 'empty'" :icon="icon" img-class="size-4" />
      <template v-if="showLabel">{{ loading ? '处理中…' : label }}</template>
      <IconMark v-if="rightIcon.kind !== 'empty'" :icon="rightIcon" img-class="size-4" />
    </Button>
  </BadgeHost>
</template>
