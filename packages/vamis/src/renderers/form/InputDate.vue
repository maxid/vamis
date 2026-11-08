<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { cn, VamisClear } from '@vamis/ui'
import {
  calendarDecade,
  calendarMonthLabel,
  calendarYearLabel,
  createVamisEvent,
  dayjs,
  displayInputDateValue,
  eventEvalData,
  filterTpl,
  formItemStatic,
  formItemStaticSchema,
  statusStaticOf,
  inputDateClearable,
  inputDateCloseOnSelect,
  inputDateFromPickerValues,
  inputDateHours,
  inputDateIsMobile,
  inputDateMinutes,
  inputDateMonthCells,
  inputDatePlaceholder,
  inputDatePickerColumns,
  inputDatePickerTypes,
  inputDateResetValue,
  inputDateSetDataValue,
  inputDateShowsTime,
  inputDateTimeFormat,
  inputDateViewMode,
  isInputDateDisabled,
  isInputDateMonthDisabled,
  isInputDateYearDisabled,
  overlayContainerFrom,
  parseInputDateValue,
  parseTypedInputDate,
  pickInputDateValue,
  resolveClassName,
  resolveInputDateShortcuts,
  runOnEvent,
  storeInputDateValue,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type CalendarCell,
  type Dayjs,
  type SchemaObject,
} from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import DateCalendarPanel from '../calendar/DateCalendarPanel.vue'
import DatePickerSheet from '../calendar/DatePickerSheet.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()

const form = useForm()
const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const formApi = useFormApi()
const viewData = useData()

const rootEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const open = ref(false)
const focused = ref(false)
const draft = ref('')
const editing = ref(false)
const panelView = ref<'days' | 'months' | 'years'>(inputDateViewMode(props.schema) === 'time' ? 'days' : 'days')
const cursor = ref(dayjs())
const pristine = ref<unknown>(undefined)
const viewportTick = ref(0)
const pickerDraft = ref(dayjs())

let media: MediaQueryList | undefined
let onMedia: (() => void) | undefined

const name = computed(() => (props.schema.name ? String(props.schema.name) : ''))
const data = computed(() => viewData.value || {})
const current = computed(() => (name.value ? form?.getValue(name.value) : props.schema.value))
const parsed = computed(() => parseInputDateValue(current.value, props.schema, data.value))
const displayText = computed(() => displayInputDateValue(current.value, props.schema, data.value))
const isStatic = computed(() =>
  formItemStatic(props.schema, data.value, form?.isStatic?.() === true, statusStaticOf(props.schema)),
)
const locked = computed(() => props.disabled || isStatic.value || props.schema.readOnly === true)
const embed = computed(() => props.schema.embed === true)
const clearable = computed(() => inputDateClearable(props.schema))
const closeOnSelect = computed(() => inputDateCloseOnSelect(props.schema))
const showsTime = computed(() => inputDateShowsTime(props.schema))
const timeOnly = computed(() => inputDateViewMode(props.schema) === 'time' || props.schema.type === 'input-time')
const timeFormat = computed(() => inputDateTimeFormat(props.schema))
const showSeconds = computed(() => /s/i.test(timeFormat.value))
const inputForbid = computed(() => props.schema.inputForbid === true)
const placeholder = computed(() => filterTpl(inputDatePlaceholder(props.schema), data.value))
const borderMode = computed(() => {
  const raw = String(props.schema.borderMode || 'full')
  return raw === 'half' || raw === 'none' ? raw : 'full'
})
const shortcuts = computed(() => resolveInputDateShortcuts(props.schema.shortcuts, data.value))
const weeks = computed(() => inputDateMonthCells(cursor.value.toDate(), new Date()))
const yearLabel = computed(() => calendarYearLabel(cursor.value.toDate()))
const monthLabel = computed(() => calendarMonthLabel(cursor.value.toDate()))
const decade = computed(() => calendarDecade(cursor.value.toDate()))
const overlayContainer = computed(() => overlayContainerFrom(props.schema, env))
const isMobile = computed(() => {
  viewportTick.value
  return inputDateIsMobile(props.schema, env)
})
const pickerPack = computed(() => inputDatePickerColumns(pickerDraft.value, props.schema, data.value))
const panelCursor = computed(() => cursor.value.toDate())
const selectedIso = computed(() => (parsed.value ? parsed.value.format('YYYY-MM-DD') : ''))
const hour = computed(() => (parsed.value ? parsed.value.format('HH') : '00'))
const minute = computed(() => (parsed.value ? parsed.value.format('mm') : '00'))
const second = computed(() => (parsed.value ? parsed.value.format('ss') : '00'))
const hours = inputDateHours()
const minutes = inputDateMinutes()
const inputValue = computed(() => (editing.value ? draft.value : displayText.value))
const showClear = computed(() => clearable.value && !locked.value && current.value != null && current.value !== '')
const formItemSchema = computed(() => {
  if (isStatic.value && formItemStaticSchema(props.schema)) return props.schema
  return { ...props.schema, static: false }
})
const inputControlClass = computed(() =>
  cn(
    'vamis-text-control__input',
    `vamis-text-control__input--${borderMode.value}`,
    resolveClassName(props.schema.inputControlClassName, data.value),
  ),
)
const nativeClass = computed(() =>
  cn('vamis-text-control__native', resolveClassName(props.schema.nativeInputClassName, data.value)),
)

function write(next: unknown) {
  if (name.value) form?.setValue(name.value, next)
}

function syncCursor(date?: Dayjs) {
  cursor.value = (date?.isValid() ? date.clone() : dayjs()).startOf('day')
}

async function emitEvent(type: string, value: unknown, native?: Event) {
  const payload = {
    ...data.value,
    value,
    ...(name.value ? { [name.value]: value } : {}),
  }
  const event = createVamisEvent(type, payload, native)
  await runOnEvent(props.schema, type, {
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

async function commit(next: string, close = false) {
  if (!(await emitEvent('change', next))) return false
  write(next)
  if (close && closeOnSelect.value && !embed.value) open.value = false
  return true
}

function cellDisabled(cell: CalendarCell) {
  return isInputDateDisabled(dayjs(cell.date), props.schema, data.value, env.trusted === true)
}

function monthDisabled(year: number, month: number) {
  return isInputDateMonthDisabled(year, month, props.schema, data.value, env.trusted === true)
}

function yearDisabled(year: number) {
  return isInputDateYearDisabled(year, props.schema, data.value, env.trusted === true)
}

async function pickDay(cell: CalendarCell) {
  if (locked.value || cellDisabled(cell)) return
  const next = pickInputDateValue(dayjs(cell.date), props.schema, parsed.value)
  syncCursor(dayjs(cell.date))
  await commit(next, true)
}

async function pickShortcut(date: Dayjs) {
  if (locked.value) return
  const next = pickInputDateValue(date, props.schema, parsed.value)
  syncCursor(date)
  await commit(next, true)
}

async function pickTime(part: 'hour' | 'minute' | 'second', raw: string) {
  if (locked.value) return
  let base = parsed.value?.clone() || cursor.value.clone()
  if (part === 'hour') base = base.hour(Number(raw))
  if (part === 'minute') base = base.minute(Number(raw))
  if (part === 'second') base = base.second(Number(raw))
  await commit(storeInputDateValue(base, props.schema), false)
}

function shiftMonth(delta: number) {
  cursor.value = cursor.value.clone().add(delta, 'month')
}
function shiftYear(delta: number) {
  cursor.value = cursor.value.clone().add(delta, 'year')
}
function pickYear(year: number) {
  if (yearDisabled(year)) return
  cursor.value = cursor.value.clone().year(year)
  panelView.value = 'months'
}
function pickMonth(month: number) {
  if (monthDisabled(cursor.value.year(), month)) return
  cursor.value = cursor.value.clone().month(month)
  panelView.value = 'days'
}

function seedPicker() {
  pickerDraft.value = parsed.value?.clone() || dayjs()
}

function onPickerValues(next: number[]) {
  const types = inputDatePickerTypes(props.schema)
  const date = inputDateFromPickerValues(next, types, pickerDraft.value)
  const pack = inputDatePickerColumns(date, props.schema, data.value)
  pickerDraft.value = inputDateFromPickerValues(pack.values, pack.types, date)
}

async function confirmPicker() {
  if (locked.value) return
  const { values, types } = pickerPack.value
  const date = inputDateFromPickerValues(values, types, pickerDraft.value)
  const next = pickInputDateValue(date, props.schema, parsed.value)
  if (await commit(next, true)) open.value = false
}

function openPanel() {
  if (locked.value || embed.value) return
  open.value = true
  syncCursor(parsed.value)
  panelView.value = 'days'
  seedPicker()
}

function toggleOpen() {
  if (locked.value || embed.value) return
  if (open.value) {
    open.value = false
    return
  }
  openPanel()
}

async function onFocus(event: FocusEvent) {
  focused.value = true
  if (!embed.value && !locked.value) openPanel()
  await emitEvent('focus', current.value, event)
}

async function onBlur(event: FocusEvent) {
  focused.value = false
  if (editing.value) {
    editing.value = false
    const typed = parseTypedInputDate(draft.value, props.schema, data.value)
    if (typed) await commit(storeInputDateValue(typed, props.schema))
    else if (!draft.value.trim() && clearable.value) await commit('')
    draft.value = ''
  }
  await emitEvent('blur', current.value, event)
}

function onInput(event: Event) {
  if (inputForbid.value || locked.value) return
  editing.value = true
  draft.value = (event.target as HTMLInputElement).value
}

async function clearValue() {
  if (locked.value) return
  if (!(await emitEvent('change', ''))) return
  write('')
  open.value = false
}

async function resetValue() {
  const raw = inputDateResetValue(props.schema, pristine.value)
  const date = parseInputDateValue(raw, props.schema, data.value)
  const next = date ? storeInputDateValue(date, props.schema) : raw ?? ''
  if (!(await emitEvent('change', next))) return
  write(next)
}

function focus() {
  inputEl.value?.focus()
}

function setData(values: Record<string, unknown>, _replace?: boolean) {
  const raw = inputDateSetDataValue(values, name.value)
  if (raw === undefined) return
  const date = parseInputDateValue(raw, props.schema, data.value)
  write(date ? storeInputDateValue(date, props.schema) : raw == null ? '' : raw)
}

async function doAction(action: { actionType?: string; value?: unknown; args?: { value?: unknown } }) {
  const type = action?.actionType
  if (type === 'clear') {
    write('')
    return
  }
  if (type === 'reset') {
    const raw = inputDateResetValue(props.schema, pristine.value)
    const date = parseInputDateValue(raw, props.schema, data.value)
    write(date ? storeInputDateValue(date, props.schema) : raw ?? '')
    return
  }
  if (type === 'setValue') {
    setData({ value: action.args?.value ?? action.value })
    return
  }
  if (type === 'focus') await nextTick(focus)
}

function makeApi(apiName: string) {
  return {
    name: apiName,
    setData,
    doAction,
    getValue: () => current.value,
    getData: () => (name.value ? { value: current.value, [name.value]: current.value } : { value: current.value }),
  }
}

const apis = [
  props.schema.id ? makeApi(String(props.schema.id)) : null,
  name.value && name.value !== String(props.schema.id || '') ? makeApi(name.value) : null,
].filter(Boolean) as ReturnType<typeof makeApi>[]
for (const api of apis) scoped?.register(api)

function normalizeInitial() {
  const raw = current.value ?? props.schema.value
  if (raw == null || raw === '') return
  const date = parseInputDateValue(raw, props.schema, data.value)
  if (!date) return
  const stored = storeInputDateValue(date, props.schema)
  if (stored !== '' && String(raw) !== stored) write(stored)
}

onMounted(() => {
  normalizeInitial()
  pristine.value = name.value ? form?.getValue(name.value) : props.schema.value
  syncCursor(parsed.value)
  if (typeof window === 'undefined' || !window.matchMedia) return
  media = window.matchMedia('(max-width: 768px)')
  onMedia = () => {
    viewportTick.value += 1
  }
  media.addEventListener('change', onMedia)
})
onBeforeUnmount(() => {
  for (const api of apis) scoped?.unregister(api)
  if (media && onMedia) media.removeEventListener('change', onMedia)
})

watch(
  () => parsed.value?.format('YYYY-MM'),
  () => {
    if (!open.value && !embed.value) syncCursor(parsed.value)
  },
)
</script>

<template>
  <FormItem :schema="formItemSchema">
    <span v-if="isStatic" class="vamis-form-static">{{ displayText || '-' }}</span>
    <div
      v-else
      ref="rootEl"
      class="vamis-date-picker vamis-text-control"
      :class="{
        'is-focused': focused || open,
        'is-disabled': locked,
        'is-embed': embed,
        'is-mobile': isMobile,
      }"
      data-slot="input-date"
    >
      <div
        v-if="!embed"
        :class="inputControlClass"
        @click="openPanel"
      >
        <input
          ref="inputEl"
          :value="inputValue"
          type="text"
          :name="schema.name"
          :placeholder="placeholder"
          :disabled="locked"
          :readonly="isMobile || inputForbid"
          :class="nativeClass"
          autocomplete="off"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
        >
        <button
          v-if="showClear"
          type="button"
          class="vamis-select__clear"
          aria-label="清除"
          @mousedown.prevent
          @click.stop="clearValue"
        >
          <VamisClear />
        </button>
        <span class="vamis-date-picker__icon" aria-hidden="true" @click.stop="toggleOpen">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path
              fill="currentColor"
              d="M3.5 1.5A.5.5 0 0 1 4 2v.5h8V2a.5.5 0 0 1 1 0v.5h.5A1.5 1.5 0 0 1 15 4v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13V4A1.5 1.5 0 0 1 2.5 2.5H3V2a.5.5 0 0 1 .5-.5ZM2 6v7a.5.5 0 0 0 .5.5h11A.5.5 0 0 0 14 13V6H2Zm0-1h12V4a.5.5 0 0 0-.5-.5h-11A.5.5 0 0 0 2 4v1Z"
            />
          </svg>
        </span>
      </div>

      <div v-if="embed" class="vamis-date-picker__popover is-embed">
        <div v-if="shortcuts.length" class="vamis-date-picker__shortcuts">
          <button
            v-for="item in shortcuts"
            :key="item.key || item.label"
            type="button"
            class="vamis-date-picker__shortcut"
            @mousedown.prevent
            @click="pickShortcut(item.date)"
          >
            {{ item.label }}
          </button>
        </div>
        <DateCalendarPanel
          v-if="!timeOnly"
          :cursor="panelCursor"
          :view="panelView"
          :weeks="weeks"
          :year-label="yearLabel"
          :month-label="monthLabel"
          :decade="decade"
          :selected-iso="selectedIso"
          :disabled-iso="cellDisabled"
          :disabled-month="monthDisabled"
          :disabled-year="yearDisabled"
          @shift-month="shiftMonth"
          @shift-year="shiftYear"
          @pick-year="pickYear"
          @pick-month="pickMonth"
          @pick-day="pickDay"
          @open-year="panelView = 'years'"
          @open-month="panelView = 'months'"
        />
        <div v-if="showsTime" class="vamis-date-picker__time">
          <select :value="hour" :disabled="locked" @change="pickTime('hour', ($event.target as HTMLSelectElement).value)">
            <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
          </select>
          <span>:</span>
          <select :value="minute" :disabled="locked" @change="pickTime('minute', ($event.target as HTMLSelectElement).value)">
            <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
          </select>
          <template v-if="showSeconds">
            <span>:</span>
            <select :value="second" :disabled="locked" @change="pickTime('second', ($event.target as HTMLSelectElement).value)">
              <option v-for="s in minutes" :key="s" :value="s">{{ s }}</option>
            </select>
          </template>
        </div>
      </div>
      <DatePickerSheet
        v-else-if="isMobile"
        :show="open"
        :title="pickerPack.title"
        :columns="pickerPack.columns"
        :values="pickerPack.values"
        :container="overlayContainer"
        @cancel="open = false"
        @confirm="confirmPicker"
        @update:values="onPickerValues"
      />
      <VamisOverlay
        v-else
        :show="open"
        :target="rootEl"
        :container="overlayContainer"
        :gap="4"
        @outside="open = false"
      >
        <div class="vamis-date-picker__popover">
          <div v-if="shortcuts.length" class="vamis-date-picker__shortcuts">
            <button
              v-for="item in shortcuts"
              :key="item.key || item.label"
              type="button"
              class="vamis-date-picker__shortcut"
              @mousedown.prevent
              @click="pickShortcut(item.date)"
            >
              {{ item.label }}
            </button>
          </div>
          <DateCalendarPanel
            v-if="!timeOnly"
            :framed="false"
            :cursor="panelCursor"
            :view="panelView"
            :weeks="weeks"
            :year-label="yearLabel"
            :month-label="monthLabel"
            :decade="decade"
            :selected-iso="selectedIso"
            :disabled-iso="cellDisabled"
            :disabled-month="monthDisabled"
            :disabled-year="yearDisabled"
            @shift-month="shiftMonth"
            @shift-year="shiftYear"
            @pick-year="pickYear"
            @pick-month="pickMonth"
            @pick-day="pickDay"
            @open-year="panelView = 'years'"
            @open-month="panelView = 'months'"
          />
          <div v-if="showsTime" class="vamis-date-picker__time">
            <select :value="hour" :disabled="locked" @change="pickTime('hour', ($event.target as HTMLSelectElement).value)">
              <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
            </select>
            <span>:</span>
            <select :value="minute" :disabled="locked" @change="pickTime('minute', ($event.target as HTMLSelectElement).value)">
              <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
            </select>
            <template v-if="showSeconds">
              <span>:</span>
              <select :value="second" :disabled="locked" @change="pickTime('second', ($event.target as HTMLSelectElement).value)">
                <option v-for="s in minutes" :key="s" :value="s">{{ s }}</option>
              </select>
            </template>
          </div>
        </div>
      </VamisOverlay>
    </div>
  </FormItem>
</template>
