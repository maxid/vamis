<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  filterNumberProp,
  filterTpl,
  formatKilobitTyping,
  formatNumberValue,
  NUMBER_STEP_DELAY,
  NUMBER_STEP_INTERVAL,
  numberAttachUnit,
  numberDisplayRaw,
  numberFormatter,
  numberIsNumeric,
  numberStepValue,
  numberStripUnit,
  numberUnitFromValue,
  numberUnitOptions,
  normalizeNumberPrecision,
  normalizeNumberValue,
  overlayContainerFrom,
  overlayIsMobile,
  parseNumberInput,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { VamisCaret } from '@vamis/ui'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()

const form = useForm()
const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const formApi = useFormApi()
const viewData = useData()

const inputEl = ref<HTMLInputElement | null>(null)
const unitEl = ref<HTMLElement | null>(null)
const focused = ref(false)
const unitOpen = ref(false)
const draft = ref('')
const unit = ref('')
const pristine = ref<unknown>(undefined)

const name = computed(() => (props.schema.name ? String(props.schema.name) : ''))
const big = computed(() => props.schema.big === true)
const step = computed(() => {
  const n = Number(props.schema.step)
  return Number.isFinite(n) && n !== 0 ? n : 1
})
const precision = computed(() =>
  normalizeNumberPrecision(filterNumberProp(props.schema.precision, viewData.value), step.value),
)
const min = computed(() => filterNumberProp(props.schema.min, viewData.value, big.value))
const max = computed(() => filterNumberProp(props.schema.max, viewData.value, big.value))
const showSteps = computed(() => props.schema.showSteps !== false)
const keyboard = computed(() => props.schema.keyboard !== false)
const displayMode = computed(() => (props.schema.displayMode === 'enhance' ? 'enhance' : 'base'))
const borderMode = computed(() => {
  const raw = String(props.schema.borderMode || 'full')
  return raw === 'half' || raw === 'none' ? raw : 'full'
})
const prefix = computed(() =>
  props.schema.prefix != null && props.schema.prefix !== ''
    ? filterTpl(String(props.schema.prefix), viewData.value)
    : '',
)
const suffix = computed(() =>
  props.schema.suffix != null && props.schema.suffix !== ''
    ? filterTpl(String(props.schema.suffix), viewData.value)
    : '',
)
const kilobit = computed(() => props.schema.kilobitSeparator === true)
const showAsPercent = computed(() => props.schema.showAsPercent === true && suffix.value === '%')
const resetValue = computed(() => (props.schema.resetValue !== undefined ? props.schema.resetValue : ''))
const clearValueOnEmpty = computed(() => props.schema.clearValueOnEmpty === true)
const readOnly = computed(() => props.schema.readOnly === true)
const locked = computed(() => props.disabled || readOnly.value)
const placeholder = computed(() =>
  props.schema.placeholder != null ? filterTpl(String(props.schema.placeholder), viewData.value) : '',
)
const units = computed(() => numberUnitOptions(props.schema.unitOptions))
const hasUnits = computed(() => units.value.length > 0)
const singleUnit = computed(() => units.value.length === 1)
const mobile = computed(() => overlayIsMobile(props.schema, env))
const overlayContainer = computed(() => overlayContainerFrom(props.schema, env))
const showHandlers = computed(() => showSteps.value && !readOnly.value && displayMode.value !== 'enhance')

function currentFormValue(): unknown {
  return name.value ? form?.getValue(name.value) : props.schema.value
}

function numericPart(raw: unknown): unknown {
  const stripped = numberStripUnit(raw, unit.value)
  if (stripped === '' || stripped == null) return stripped
  if (typeof stripped === 'string' && stripped !== '' && Number.isNaN(Number(stripped)) && !big.value) {
    return undefined
  }
  return stripped
}

function percentView(raw: unknown): unknown {
  if (!showAsPercent.value || raw == null || raw === '' || !numberIsNumeric(raw)) return raw
  const n = Number(raw) * 100
  const p = typeof props.schema.precision === 'number' ? props.schema.precision : precision.value
  return Number(n.toFixed(p))
}

function percentStore(raw: unknown): unknown {
  if (!showAsPercent.value || raw == null || raw === '' || !numberIsNumeric(raw)) return raw
  return Number(raw) / 100
}

function displayPrecision(): number {
  if (showAsPercent.value) return typeof props.schema.precision === 'number' ? props.schema.precision : 0
  return precision.value
}

function formatDisplay(raw: unknown, typing: boolean): string {
  let value = numericPart(raw)
  value = percentView(value)
  let text = numberDisplayRaw(value)
  if (!text) return ''
  if (kilobit.value && text) {
    text = typing ? formatKilobitTyping(text.replace(/,/g, '')) : numberFormatter(text, displayPrecision())
  } else if (!typing && !hasUnits.value && !big.value && numberIsNumeric(value)) {
    const p = displayPrecision()
    if (p > 0) text = Number(value).toFixed(p)
  }
  if (typing) return `${prefix.value}${text}`
  return `${prefix.value}${text}${suffix.value}`
}

const inputText = computed(() => (focused.value ? draft.value : formatDisplay(currentFormValue(), false)))

function syncUnitFromValue(raw: unknown) {
  if (!hasUnits.value) {
    unit.value = ''
    return
  }
  unit.value = numberUnitFromValue(raw, units.value) || String(units.value[0]?.value ?? '')
}

function emitPayload(value: unknown) {
  const key = name.value || 'value'
  return { ...viewData.value, value, [key]: value }
}

async function emitEvent(eventName: string, value: unknown): Promise<boolean> {
  const payload = emitPayload(value)
  const event = createVamisEvent(eventName, payload)
  await runOnEvent(props.schema, eventName, {
    env,
    data: eventEvalData(payload, event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  return !event.prevented
}

function write(next: unknown) {
  if (!name.value || !form) return
  form.setValue(name.value, next)
}

function finalize(raw: unknown): unknown {
  let next: unknown = raw
  if (showAsPercent.value && numberIsNumeric(next)) next = percentStore(next)
  const storePrecision = showAsPercent.value ? precision.value + 2 : precision.value
  next = normalizeNumberValue(
    next,
    min.value,
    max.value,
    storePrecision,
    resetValue.value,
    clearValueOnEmpty.value,
    big.value,
  )
  if (!hasUnits.value && !big.value) next = formatNumberValue(next, storePrecision, false)
  if (hasUnits.value && next != null && next !== '') next = numberAttachUnit(next, unit.value)
  if (clearValueOnEmpty.value && (next === '' || next == null)) return undefined
  return next
}

async function commit(raw: unknown) {
  const next = finalize(raw)
  if (!(await emitEvent('change', next))) return
  write(next)
}

function parseDraft(text: string): string {
  return parseNumberInput(text, prefix.value, suffix.value, kilobit.value)
}

async function onInput(event: Event) {
  const el = event.target as HTMLInputElement
  let typed = parseDraft(el.value)
  if (kilobit.value) {
    const shown = `${prefix.value}${formatKilobitTyping(typed)}`
    draft.value = shown
    if (el.value !== shown) el.value = shown
  } else {
    draft.value = `${prefix.value}${typed}`
  }
  if (typed === '' || typed === '-' || typed === '.' || typed === '-.' || typed.endsWith('.')) return
  if (!numberIsNumeric(typed) && !(big.value && /^-?\d+(\.\d+)?$/.test(typed))) return
  await commit(big.value ? typed : Number(typed))
}

async function onFocus() {
  focused.value = true
  const raw = numericPart(currentFormValue())
  const view = percentView(raw)
  let text = numberDisplayRaw(view)
  if (kilobit.value && text) text = formatKilobitTyping(String(text).replace(/,/g, ''))
  draft.value = `${prefix.value}${text}`
  await emitEvent('focus', currentFormValue())
}

async function onBlur() {
  focused.value = false
  const typed = parseDraft(draft.value)
  if (typed === '' || typed === '-' || typed === '.' || typed === '-.' || !numberIsNumeric(typed) && !/^-?\d+(\.\d+)?$/.test(typed)) {
    await commit(typed === '' ? '' : typed)
  } else {
    await commit(big.value ? typed : Number(typed))
  }
  draft.value = formatDisplay(currentFormValue(), false)
  await emitEvent('blur', currentFormValue())
}

let holdTimer = 0
let holdLoop = 0

function stopHold() {
  if (holdTimer) {
    window.clearTimeout(holdTimer)
    holdTimer = 0
  }
  if (holdLoop) {
    window.clearTimeout(holdLoop)
    holdLoop = 0
  }
}

function startHold(direction: 1 | -1, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (event.button !== 0 || locked.value) return
  stopHold()
  void stepBy(direction)
  const loop = () => {
    void stepBy(direction)
    holdLoop = window.setTimeout(loop, NUMBER_STEP_INTERVAL)
  }
  holdTimer = window.setTimeout(loop, NUMBER_STEP_DELAY)
}

async function stepBy(direction: 1 | -1, event?: Event) {
  event?.preventDefault()
  event?.stopPropagation()
  if (locked.value) return
  if (direction === 1 && atMax()) {
    stopHold()
    return
  }
  if (direction === -1 && atMin()) {
    stopHold()
    return
  }
  const raw = numericPart(currentFormValue())
  const view = percentView(raw)
  const nextView = numberStepValue(view, step.value, direction, displayPrecision(), big.value)
  const lo = showAsPercent.value && min.value != null ? Number(min.value) * 100 : min.value
  const hi = showAsPercent.value && max.value != null ? Number(max.value) * 100 : max.value
  let clamped: unknown = nextView
  if (lo != null && decimalOutOfMin(clamped, lo)) clamped = lo
  if (hi != null && decimalOutOfMax(clamped, hi)) clamped = hi
  await commit(clamped)
  draft.value = formatDisplay(currentFormValue(), focused.value)
}

function decimalOutOfMin(value: unknown, bound: unknown): boolean {
  if (!numberIsNumeric(value) || bound == null) return false
  return Number(value) < Number(bound)
}

function decimalOutOfMax(value: unknown, bound: unknown): boolean {
  if (!numberIsNumeric(value) || bound == null) return false
  return Number(value) > Number(bound)
}

function atMin(): boolean {
  const raw = percentView(numericPart(currentFormValue()))
  const lo = showAsPercent.value && min.value != null ? Number(min.value) * 100 : min.value
  return lo != null && numberIsNumeric(raw) && Number(raw) <= Number(lo)
}

function atMax(): boolean {
  const raw = percentView(numericPart(currentFormValue()))
  const hi = showAsPercent.value && max.value != null ? Number(max.value) * 100 : max.value
  return hi != null && numberIsNumeric(raw) && Number(raw) >= Number(hi)
}

function onKeydown(event: KeyboardEvent) {
  if (!keyboard.value || locked.value) return
  if (event.key === 'ArrowUp') void stepBy(1, event)
  else if (event.key === 'ArrowDown') void stepBy(-1, event)
}

async function pickUnit(next: string) {
  unitOpen.value = false
  if (next === unit.value) return
  const prev = unit.value
  unit.value = next
  const raw = currentFormValue()
  if (raw == null || raw === '') return
  const stripped = numberStripUnit(raw, prev)
  await commit(stripped)
}

function setData(values: Record<string, unknown>) {
  const next =
    name.value && Object.prototype.hasOwnProperty.call(values, name.value) ? values[name.value] : values.value
  if (next === undefined) return
  syncUnitFromValue(next)
  write(next)
}

async function doAction(action: { actionType?: string; value?: unknown; args?: { value?: unknown } }) {
  const type = action?.actionType
  if (type === 'clear') {
    const next = clearValueOnEmpty.value ? undefined : ''
    if (!(await emitEvent('change', next))) return
    write(next)
    return
  }
  if (type === 'reset') {
    const pristineVal = pristine.value ?? resetValue.value
    const next = finalize(numberStripUnit(pristineVal, unit.value))
    if (!(await emitEvent('change', next))) return
    write(next)
    return
  }
  if (type === 'setValue') {
    const next = action.args?.value ?? action.value
    syncUnitFromValue(next)
    write(next)
  }
}

function makeApi(apiName: string) {
  return {
    name: apiName,
    setData,
    doAction,
    getValue: () => currentFormValue(),
    getData: () =>
      name.value ? { value: currentFormValue(), [name.value]: currentFormValue() } : { value: currentFormValue() },
  }
}

const scopedId = String(props.schema.id || '')
const apis = [
  scopedId ? makeApi(scopedId) : null,
  name.value && name.value !== scopedId ? makeApi(name.value) : null,
].filter(Boolean) as ReturnType<typeof makeApi>[]
for (const api of apis) scoped?.register(api)
onBeforeUnmount(() => {
  stopHold()
  for (const api of apis) scoped?.unregister(api)
})

onMounted(() => {
  const raw = currentFormValue()
  pristine.value = raw
  syncUnitFromValue(raw)
  if (!hasUnits.value && raw != null && raw !== '' && !big.value) {
    const next = formatNumberValue(raw, precision.value, false)
    if (next !== raw && name.value) form?.setValue(name.value, next)
  }
})

watch(
  () => currentFormValue(),
  (raw) => {
    syncUnitFromValue(raw)
    if (!focused.value) draft.value = formatDisplay(raw, false)
  },
)

watch(
  () => props.schema.unitOptions,
  () => syncUnitFromValue(currentFormValue()),
)

const numberClass = computed(() => [
  'vamis-number',
  `vamis-number--${displayMode.value}`,
  `vamis-number--border-${borderMode.value}`,
  {
    'is-focused': focused.value,
    'is-disabled': props.disabled,
    'is-readonly': readOnly.value,
    'is-mobile': mobile.value,
    'no-steps': !showHandlers.value && displayMode.value !== 'enhance',
    'is-enhance': displayMode.value === 'enhance',
  },
])
</script>

<template>
  <FormItem :schema="schema">
    <div
      class="vamis-number-control"
      :class="{ 'is-with-unit': hasUnits }"
    >
      <div :class="numberClass">
        <button
          v-if="displayMode === 'enhance' && showSteps && !readOnly"
          type="button"
          class="vamis-number__enhance-btn vamis-number__enhance-btn--minus"
          :class="{ 'is-disabled': locked || atMin() }"
          :disabled="locked || atMin()"
          tabindex="-1"
          aria-label="减少"
          @mousedown.prevent="stepBy(-1, $event)"
        >
          <svg viewBox="0 0 12 2" class="vamis-number__enhance-icon" aria-hidden="true">
            <polygon points="0 1.6 0 0.4 12 0.4 12 1.6" fill="currentColor" />
          </svg>
        </button>
        <div class="vamis-number__input-wrap">
          <input
            ref="inputEl"
            class="vamis-number__native"
            type="text"
            inputmode="decimal"
            :name="schema.name"
            :value="inputText"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readOnly"
            autocomplete="off"
            @input="onInput"
            @focus="onFocus"
            @blur="onBlur"
            @keydown="onKeydown"
            @click.stop
          >
        </div>
        <div
          v-if="showHandlers"
          class="vamis-number__handlers"
        >
          <button
            type="button"
            class="vamis-number__handler vamis-number__handler--up"
            :class="{ 'is-disabled': locked || atMax() }"
            :disabled="locked || atMax()"
            tabindex="-1"
            aria-label="增加"
            @mousedown.prevent="startHold(1, $event)"
            @mouseup="stopHold"
            @mouseleave="stopHold"
          >
            <svg viewBox="0 0 12 8" class="vamis-number__caret" aria-hidden="true">
              <path d="M1.5 6.2 L6 1.8 L10.5 6.2" fill="none" stroke="currentColor" stroke-width="1.2" />
            </svg>
          </button>
          <button
            type="button"
            class="vamis-number__handler vamis-number__handler--down"
            :class="{ 'is-disabled': locked || atMin() }"
            :disabled="locked || atMin()"
            tabindex="-1"
            aria-label="减少"
            @mousedown.prevent="startHold(-1, $event)"
            @mouseup="stopHold"
            @mouseleave="stopHold"
          >
            <svg viewBox="0 0 12 8" class="vamis-number__caret" aria-hidden="true">
              <path d="M1.5 1.8 L6 6.2 L10.5 1.8" fill="none" stroke="currentColor" stroke-width="1.2" />
            </svg>
          </button>
        </div>
        <button
          v-if="displayMode === 'enhance' && showSteps && !readOnly"
          type="button"
          class="vamis-number__enhance-btn vamis-number__enhance-btn--plus"
          :class="{ 'is-disabled': locked || atMax() }"
          :disabled="locked || atMax()"
          tabindex="-1"
          aria-label="增加"
          @mousedown.prevent="stepBy(1, $event)"
        >
          <svg viewBox="0 0 12 12" class="vamis-number__enhance-icon" aria-hidden="true">
            <path d="M6.6 6.6V12H5.4V6.6H0V5.4h5.4V0h1.2v5.4H12v1.2z" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div
        v-if="singleUnit"
        class="vamis-number__unit is-single"
      >
        {{ units[0]?.label ?? units[0]?.value }}
      </div>
      <button
        v-else-if="hasUnits"
        ref="unitEl"
        type="button"
        class="vamis-number__unit"
        :disabled="disabled"
        @mousedown.stop
        @click.stop="unitOpen = !unitOpen"
      >
        <span>{{ units.find((item) => String(item.value) === unit)?.label ?? unit }}</span>
        <VamisCaret :open="unitOpen" />
      </button>
      <VamisOverlay
        :show="unitOpen"
        :target="unitEl"
        :container="overlayContainer"
        @outside="unitOpen = false"
      >
        <div class="vamis-select__popover" style="min-width: 80px">
          <div
            v-for="item in units"
            :key="String(item.value)"
            class="vamis-select__item"
            :class="{ 'is-active': String(item.value) === unit }"
            @mousedown.prevent="pickUnit(String(item.value))"
          >
            <span class="vamis-select__item-label">{{ item.label }}</span>
          </div>
        </div>
      </VamisOverlay>
    </div>
  </FormItem>
</template>
