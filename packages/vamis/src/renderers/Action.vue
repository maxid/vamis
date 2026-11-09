<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  SchemaRenderer,
  actionActive,
  actionActiveClassName,
  actionActiveLevel,
  actionBody,
  actionCountDown,
  actionCountDownTpl,
  actionHotKey,
  actionIsContainer,
  actionKind,
  actionLabel,
  actionLevel,
  actionSchemaLoading,
  actionIconOnly,
  actionShowLabel,
  actionTooltipConfig,
  actionTooltipRootClose,
  actionTooltipTriggers,
  countdownRemaining,
  countdownStorageKey,
  createVamisEvent,
  eventEvalData,
  filterTpl,
  iconVendor,
  matchHotKey,
  overlayContainerFrom,
  readCountdownEnd,
  useDropdownMenuItem,
  resolveIcon,
  runAction,
  runOnEvent,
  tooltipEnterable,
  tooltipMouseEnterDelay,
  tooltipMouseLeaveDelay,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  writeCountdownEnd,
  type SchemaObject,
} from '@vamis/core'
import { Button, cn, levelToVariant, sizeToButtonSize } from '@vamis/ui'
import VamisTooltipLayer from '../overlay/VamisTooltipLayer.vue'
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
const isMenuItem = useDropdownMenuItem()
const tipOpen = ref(false)
const triggerEl = ref<HTMLElement | null>(null)
const inCountDown = ref(false)
const timeLeft = ref(0)
const countDownEnd = ref(0)
const instanceKey = `${props.schema.name || ''}${props.schema.id || ''}` || `anon-${Math.random().toString(36).slice(2)}`
let countTimer: ReturnType<typeof setTimeout> | null = null
let tipEnterTimer: ReturnType<typeof setTimeout> | null = null
let tipLeaveTimer: ReturnType<typeof setTimeout> | null = null

const kind = computed(() => actionKind(props.schema))
const isContainer = computed(() => actionIsContainer(props.schema))
const body = computed(() => actionBody(props.schema))
const label = computed(() => actionLabel(props.schema, data.value))
const showLabel = computed(() => actionShowLabel(props.schema) || inCountDown.value)
const isActive = computed(() => actionActive(props.schema))
const activeLevel = computed(() => actionActiveLevel(props.schema))
const variant = computed(() => {
  const level = isActive.value && activeLevel.value ? activeLevel.value : actionLevel(props.schema)
  return levelToVariant(level, kind.value)
})
const size = computed(() => sizeToButtonSize(props.schema.size, !inCountDown.value && actionIconOnly(props.schema)))
function resolveSchemaIcon(raw: unknown) {
  const value = typeof raw === 'string' ? filterTpl(raw, data.value) : raw
  return resolveIcon(value, { vendor: iconVendor(props.schema) })
}
const icon = computed(() => resolveSchemaIcon(props.schema.icon))
const rightIcon = computed(() => resolveSchemaIcon(props.schema.rightIcon))
const schemaLoading = computed(() => actionSchemaLoading(props.schema, data.value))
const isLoading = computed(() => schemaLoading.value)
const overlayContainer = computed(() => overlayContainerFrom(props.schema, env))
const isDisabled = computed(() => props.disabled === true || inCountDown.value || isLoading.value)
const tipConfig = computed(() => actionTooltipConfig(props.schema, data.value, isDisabled.value))
const hasTip = computed(() => !!tipConfig.value)
const tipTriggers = computed(() => actionTooltipTriggers(tipConfig.value))
const tipEnterable = computed(() => (tipConfig.value ? tooltipEnterable(tipConfig.value) : false))
const block = computed(() => props.schema.block === true)
const displayLabel = computed(() => {
  if (inCountDown.value) {
    return filterTpl(actionCountDownTpl(props.schema), { ...data.value, timeLeft: timeLeft.value })
  }
  return label.value
})
const buttonClass = computed(() =>
  cn(
    block.value ? 'w-full' : undefined,
    isActive.value ? actionActiveClassName(props.schema) : undefined,
  ),
)

function clearCountTimer() {
  if (countTimer) clearTimeout(countTimer)
  countTimer = null
}

function tickCountDown() {
  const left = countdownRemaining(countDownEnd.value)
  if (left <= 0) {
    inCountDown.value = false
    timeLeft.value = 0
    writeCountdownEnd(countdownStorageKey(props.schema, instanceKey), 0)
    return
  }
  timeLeft.value = left
  countTimer = setTimeout(tickCountDown, 1000)
}

function startCountDown() {
  const seconds = actionCountDown(props.schema)
  if (!seconds) return
  const end = Date.now() + seconds * 1000
  countDownEnd.value = end
  timeLeft.value = seconds
  inCountDown.value = true
  writeCountdownEnd(countdownStorageKey(props.schema, instanceKey), end)
  clearCountTimer()
  countTimer = setTimeout(tickCountDown, 1000)
}

function restoreCountDown() {
  const seconds = actionCountDown(props.schema)
  if (!seconds) return
  const end = readCountdownEnd(countdownStorageKey(props.schema, instanceKey))
  if (!end || Date.now() >= end) return
  countDownEnd.value = end
  timeLeft.value = countdownRemaining(end)
  inCountDown.value = true
  tickCountDown()
}

function makeCtx(native?: Event, type = 'click') {
  const event = createVamisEvent(type, data.value, native || { type })
  return {
    env,
    data: eventEvalData(data.value, event),
    scoped,
    overlay,
    form,
    scope: scope.value,
    event,
  }
}

async function runSchemaOnClick(native: Event): Promise<boolean> {
  const raw = props.schema.onClick
  if (typeof raw !== 'string' || !raw || !env.trusted) return true
  try {
    const fn = new Function('event', 'props', raw)
    const ctx = makeCtx(native)
    const result = await fn(native, {
      ...props.schema,
      data: data.value,
      onAction: (_e: unknown, action: SchemaObject) =>
        runAction({ ...action, actionType: action.actionType || actionKind(action) }, ctx),
      formStore: form ? { setValues: (values: Record<string, unknown>) => form.setData?.(values) } : undefined,
    })
    return result !== false
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '操作失败')
    return false
  }
}

async function onClick(native?: Event) {
  if (tipTriggers.value.includes('click') && hasTip.value) {
    if (tipOpen.value) hideTip(true)
    else showTip()
  }
  if (isDisabled.value || inCountDown.value) return
  if (native && !(await runSchemaOnClick(native))) return
  const ctx = makeCtx(native)
  try {
    await runOnEvent(props.schema, 'click', ctx)
    if (!ctx.event.prevented) {
      const ran = await runAction({ ...props.schema, actionType: kind.value }, ctx)
      if (ran) startCountDown()
    }
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '操作失败')
  }
}

function onHotKey(event: KeyboardEvent) {
  const hotKey = actionHotKey(props.schema)
  if (!hotKey || !matchHotKey(hotKey, event)) return
  event.preventDefault()
  void onClick(event)
}

function clearTipTimers() {
  if (tipEnterTimer) clearTimeout(tipEnterTimer)
  if (tipLeaveTimer) clearTimeout(tipLeaveTimer)
  tipEnterTimer = null
  tipLeaveTimer = null
}

function showTip() {
  if (!hasTip.value) return
  clearTipTimers()
  const wait = tooltipMouseEnterDelay(tipConfig.value)
  if (!wait) {
    tipOpen.value = true
    return
  }
  tipEnterTimer = setTimeout(() => {
    tipOpen.value = true
  }, wait)
}

function hideTip(immediate = false) {
  clearTipTimers()
  const wait = immediate ? 0 : tooltipMouseLeaveDelay(tipConfig.value)
  if (!wait) {
    tipOpen.value = false
    return
  }
  tipLeaveTimer = setTimeout(() => {
    tipOpen.value = false
  }, wait)
}

async function runPointerEvent(name: 'mouseenter' | 'mouseleave', native: Event) {
  const ctx = makeCtx(native, name)
  await runOnEvent(props.schema, name, ctx)
}

function onEnter(native: MouseEvent) {
  if (tipTriggers.value.includes('hover')) showTip()
  if (!isDisabled.value) void runPointerEvent('mouseenter', native)
}

function onLeave(native: MouseEvent) {
  if (tipTriggers.value.includes('hover')) hideTip()
  if (!isDisabled.value) void runPointerEvent('mouseleave', native)
}

function onFocusIn() {
  if (tipTriggers.value.includes('focus')) showTip()
}

function onFocusOut() {
  if (tipTriggers.value.includes('focus')) hideTip()
}

function onTipOutside() {
  if (actionTooltipRootClose(tipConfig.value)) hideTip(true)
}

function onTipLayerEnter() {
  if (!tipEnterable.value) return
  clearTipTimers()
  tipOpen.value = true
}

function onTipLayerLeave() {
  if (!tipEnterable.value) return
  if (tipTriggers.value.includes('hover')) hideTip()
}

onMounted(() => {
  restoreCountDown()
  if (actionHotKey(props.schema)) {
    window.addEventListener('keydown', onHotKey)
  }
})

onBeforeUnmount(() => {
  clearCountTimer()
  clearTipTimers()
  window.removeEventListener('keydown', onHotKey)
})
</script>

<template>
  <BadgeHost :schema="schema" :data="data">
    <span
      v-if="isContainer"
      ref="triggerEl"
      data-vamis-action
      class="inline-block cursor-pointer"
      @click="onClick($event)"
      @mouseenter="onEnter($event)"
      @mouseleave="onLeave($event)"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
    >
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </span>
    <a
      v-else-if="isMenuItem"
      ref="triggerEl"
      data-vamis-action
      class="vamis-dropdown-action"
      :class="{ 'is-disabled': isDisabled, 'is-active': isActive }"
      role="menuitem"
      :aria-disabled="isDisabled || undefined"
      @click="onClick($event)"
      @mouseenter="onEnter($event)"
      @mouseleave="onLeave($event)"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
    >
      <IconMark v-if="icon.kind !== 'empty'" :icon="icon" img-class="size-4" />
      <span v-if="showLabel">{{ displayLabel }}</span>
      <IconMark v-if="rightIcon.kind !== 'empty'" :icon="rightIcon" img-class="size-4" />
    </a>
    <span
      v-else
      ref="triggerEl"
      data-vamis-action
      class="inline-block"
      :class="block ? 'w-full' : undefined"
      @mouseenter="onEnter($event)"
      @mouseleave="onLeave($event)"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
    >
      <Button
        :variant="variant"
        :size="size"
        :disabled="isDisabled"
        type="button"
        :class="buttonClass"
        @click="onClick($event)"
      >
        <span
          v-if="isLoading"
          class="inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
        <IconMark v-else-if="icon.kind !== 'empty'" :icon="icon" img-class="size-4" />
        <template v-if="showLabel">{{ displayLabel }}</template>
        <IconMark v-if="rightIcon.kind !== 'empty'" :icon="rightIcon" img-class="size-4" />
      </Button>
    </span>
    <VamisTooltipLayer
      v-if="tipConfig"
      :show="hasTip && tipOpen"
      :target="triggerEl"
      :container="overlayContainer"
      :tooltip="tipConfig"
      :data="data"
      @outside="onTipOutside"
      @enter="onTipLayerEnter"
      @leave="onTipLayerLeave"
    />
  </BadgeHost>
</template>
