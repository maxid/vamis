<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Button, VamisClear } from '@vamis/ui'
import {
  addDateDuration,
  applyDateRangePart,
  calendarDecade,
  calendarMonthLabel,
  calendarYearLabel,
  createVamisEvent,
  dayjs,
  eventEvalData,
  filterDate,
  formItemStatic,
  formItemStaticSchema,
  inputDateMinMax,
  inputDateMonthCells,
  isInputDateDisabled,
  parseDateDuration,
  resolveClassName,
  runOnEvent,
  statusStaticOf,
  subtractDateDuration,
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
import DateCalendarPanel, { type DateCalendarView } from '../calendar/DateCalendarPanel.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()

const form = useForm()
const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const formApi = useFormApi()
const data = useData()

const rootEl = ref<HTMLElement | null>(null)
const open = ref(false)
const focused = ref(false)
const editState = ref<'start' | 'end'>('start')
const startText = ref('')
const endText = ref('')
const cursorStart = ref(dayjs())
const cursorEnd = ref(dayjs().add(1, 'month'))
const startView = ref<DateCalendarView>('days')
const endView = ref<DateCalendarView>('days')
const pristine = ref<unknown>(undefined)
const draftStart = ref<Dayjs | undefined>(undefined)
const draftEnd = ref<Dayjs | undefined>(undefined)

const name = computed(() => (props.schema.name ? String(props.schema.name) : ''))
const extraName = computed(() => (props.schema.extraName ? String(props.schema.extraName) : ''))
const isStatic = computed(() =>
  formItemStatic(props.schema, data.value, form?.isStatic?.() === true, statusStaticOf(props.schema)),
)
const locked = computed(() => props.disabled || isStatic.value || props.schema.readOnly === true)
const embed = computed(() => props.schema.embed === true)
const clearable = computed(() => props.schema.clearable !== false)
const closeOnSelect = computed(() => props.schema.closeOnSelect !== false)
const trusted = computed(() => env.trusted === true)
const startPlaceholder = computed(() => String(props.schema.startPlaceholder || '开始时间'))
const endPlaceholder = computed(() => String(props.schema.endPlaceholder || '结束时间'))
const displayFormat = computed(() => {
  const raw = String(props.schema.displayFormat || props.schema.inputFormat || '')
  if (raw) return raw
  return props.schema.type === 'input-datetime-range' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
})
const valueFormat = computed(() => String(props.schema.valueFormat || props.schema.format || 'X'))
const delimiter = computed(() => String(props.schema.delimiter ?? ','))
const utc = computed(() => props.schema.utc === true)
const joinValues = computed(() => props.schema.joinValues !== false)

const rawValue = computed(() => {
  if (name.value) return form?.getValue(name.value)
  return props.schema.value
})

function parsePart(raw: unknown): Dayjs | undefined {
  if (raw == null || raw === '') return undefined
  const parsed = filterDate(raw, data.value, valueFormat.value, utc.value)
  return parsed && parsed.isValid() ? parsed : undefined
}

const range = computed<{ start?: Dayjs; end?: Dayjs }>(() => {
  let start: unknown
  let end: unknown
  const raw = rawValue.value
  if (Array.isArray(raw)) [start, end] = raw
  else if (raw && typeof raw === 'object') {
    const object = raw as Record<string, unknown>
    start = object.start ?? object.from
    end = object.end ?? object.to
  } else if (typeof raw === 'string' && raw) {
    ;[start, end] = raw.split(delimiter.value)
  }
  if (extraName.value) {
    start = form?.getValue(name.value)
    end = form?.getValue(extraName.value)
  }
  return { start: parsePart(start), end: parsePart(end) }
})

const displayStart = computed(() => (range.value.start ? range.value.start.format(displayFormat.value) : ''))
const displayEnd = computed(() => (range.value.end ? range.value.end.format(displayFormat.value) : ''))
const showClear = computed(() => clearable.value && !locked.value && (!!displayStart.value || !!displayEnd.value))
const selectedIso = computed(() => {
  const start = draftStart.value || range.value.start
  return start ? start.format('YYYY-MM-DD') : ''
})
const rangeStartIso = computed(() => {
  const start = draftStart.value || range.value.start
  return start ? start.format('YYYY-MM-DD') : ''
})
const rangeEndIso = computed(() => {
  const end = draftEnd.value || range.value.end
  return end ? end.format('YYYY-MM-DD') : ''
})
const startWeeks = computed(() => inputDateMonthCells(cursorStart.value.toDate(), new Date()))
const endWeeks = computed(() => inputDateMonthCells(cursorEnd.value.toDate(), new Date()))
const startYearLabel = computed(() => calendarYearLabel(cursorStart.value.toDate()))
const startMonthLabel = computed(() => calendarMonthLabel(cursorStart.value.toDate()))
const startDecade = computed(() => calendarDecade(cursorStart.value.toDate()))
const endYearLabel = computed(() => calendarYearLabel(cursorEnd.value.toDate()))
const endMonthLabel = computed(() => calendarMonthLabel(cursorEnd.value.toDate()))
const endDecade = computed(() => calendarDecade(cursorEnd.value.toDate()))
const canConfirm = computed(() => {
  const start = draftStart.value
  const end = draftEnd.value
  return !!(start?.isValid() && end?.isValid() && !start.isAfter(end, 'second'))
})
const minDuration = computed(() => parseDateDuration(props.schema.minDuration))
const maxDuration = computed(() => parseDateDuration(props.schema.maxDuration))

type Shortcut = { key?: string; label: string; start: Dayjs; end: Dayjs }

function presetRange(key: string): { start: Dayjs; end: Dayjs } | undefined {
  const now = dayjs()
  const presets: Record<string, () => { start: Dayjs; end: Dayjs }> = {
    today: () => ({ start: now.startOf('day'), end: now.endOf('day') }),
    yesterday: () => ({ start: now.subtract(1, 'day').startOf('day'), end: now.subtract(1, 'day').endOf('day') }),
    tomorrow: () => ({ start: now.add(1, 'day').startOf('day'), end: now.add(1, 'day').endOf('day') }),
    prevweek: () => ({ start: now.startOf('week').subtract(1, 'week'), end: now.startOf('week').subtract(1, 'day').endOf('day') }),
    thisweek: () => ({ start: now.startOf('week'), end: now.endOf('week') }),
    thismonth: () => ({ start: now.startOf('month'), end: now.endOf('month') }),
    prevmonth: () => ({ start: now.subtract(1, 'month').startOf('month'), end: now.subtract(1, 'month').endOf('month') }),
    thisquarter: () => ({ start: now.startOf('quarter'), end: now.endOf('quarter') }),
    prevquarter: () => ({ start: now.subtract(1, 'quarter').startOf('quarter'), end: now.subtract(1, 'quarter').endOf('quarter') }),
    thisyear: () => ({ start: now.startOf('year'), end: now.endOf('year') }),
    lastYear: () => ({ start: now.subtract(1, 'year').startOf('year'), end: now.subtract(1, 'year').endOf('year') }),
  }
  const preset = presets[key]
  if (preset) return preset()
  const match = key.match(/^(\d+)(days|weeks|months|quarters|years)(ago|later)$/i)
  if (match) {
    const n = Number(match[1])
    const unit = match[2].replace(/s$/i, '').replace(/^day$/i, 'day').replace(/^week$/i, 'week').replace(/^month$/i, 'month').replace(/^quarter$/i, 'quarter').replace(/^year$/i, 'year') as 'day' | 'week' | 'month' | 'quarter' | 'year'
    return match[3].toLowerCase() === 'ago'
      ? { start: now.subtract(n as number, unit as never).startOf('day'), end: now.endOf('day') }
      : { start: now.startOf('day'), end: now.add(n as number, unit as never).endOf('day') }
  }
  return undefined
}

const shortcutLabels: Record<string, string> = {
  today: '今天',
  yesterday: '昨天',
  tomorrow: '明天',
  prevweek: '上周',
  thisweek: '这个周',
  thismonth: '这个月',
  prevmonth: '上个月',
  thisquarter: '这个季度',
  prevquarter: '上个季度',
  thisyear: '今年',
  lastYear: '去年',
}

function shortcutLabel(key: string): string {
  if (shortcutLabels[key]) return shortcutLabels[key]
  const match = key.match(/^(\d+)(days|weeks|months|quarters|years)(ago|later)$/i)
  if (!match) return key
  const n = match[1]
  const unit = match[2].toLowerCase()
  const suffix = unit.startsWith('day') ? '天' : unit.startsWith('week') ? '周' : unit.startsWith('month') ? '月' : unit.startsWith('quarter') ? '季度' : '年'
  return match[3].toLowerCase() === 'ago' ? `最近${n}${suffix}` : `${n}${suffix}内`
}

const shortcuts = computed<Shortcut[]>(() => {
  const raw = props.schema.shortcuts
  const list: unknown[] =
    raw === false ? [] : raw == null ? ['yesterday', '7daysago', 'prevweek', 'thismonth', 'prevmonth', 'prevquarter'] : typeof raw === 'string' ? raw.split(',') : Array.isArray(raw) ? raw : [raw]
  const out: Shortcut[] = []
  for (const item of list) {
    if (typeof item === 'string') {
      const key = item.trim()
      const preset = presetRange(key)
      if (preset) out.push({ key, label: shortcutLabel(key), ...preset })
      continue
    }
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const conf = item as Record<string, unknown>
    const label = conf.label != null ? String(conf.label) : ''
    const start = filterDate(conf.startDate, data.value, valueFormat.value, utc.value)
    const end = filterDate(conf.endDate, data.value, valueFormat.value, utc.value)
    if (start?.isValid() && end?.isValid()) out.push({ label: label || `${start.format(displayFormat.value)} ~ ${end.format(displayFormat.value)}`, start, end })
  }
  return out
})

function eventPayload(value: unknown) {
  return { ...data.value, value, ...(name.value ? { [name.value]: value } : {}) }
}

async function emitEvent(eventName: string, value: unknown, native?: Event) {
  const event = createVamisEvent(eventName, eventPayload(value), native)
  await runOnEvent(props.schema, eventName, {
    env,
    data: eventEvalData(eventPayload(value), event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  return !event.prevented
}

function storedValue(date: Dayjs | undefined, isEnd: boolean): string {
  if (!date || !date.isValid()) return ''
  return date.format(valueFormat.value)
}

function boundPart(date: Dayjs, type: 'start' | 'end', origin?: Dayjs): Dayjs {
  return applyDateRangePart(date, type, props.schema, data.value, origin, trusted.value)
}

function clampEnd(value: Dayjs, start?: Dayjs): Dayjs {
  let next = value
  if (!start) return next
  if (minDuration.value && next.isBefore(addDateDuration(start, minDuration.value))) {
    next = addDateDuration(start, minDuration.value)
  }
  if (maxDuration.value && next.isAfter(addDateDuration(start, maxDuration.value))) {
    next = addDateDuration(start, maxDuration.value)
  }
  const { max } = inputDateMinMax(props.schema, data.value)
  if (max && next.isAfter(max, 'second')) next = max
  return next
}

function payloadOf(start?: Dayjs, end?: Dayjs): unknown {
  const startRaw = storedValue(start, false)
  const endRaw = storedValue(end, true)
  if (!joinValues.value) return [startRaw, endRaw]
  return `${startRaw}${delimiter.value}${endRaw}`
}

async function commit(start?: Dayjs, end?: Dayjs) {
  const value = payloadOf(start, end)
  if (!(await emitEvent('change', value))) return
  if (!name.value || !form) return
  if (extraName.value) {
    form.setValue(name.value, storedValue(start, false))
    form.setValue(extraName.value, storedValue(end, true))
  } else {
    form.setValue(name.value, value)
  }
}

function onTextInput(side: 'start' | 'end', event: Event) {
  const text = (event.target as HTMLInputElement).value
  if (side === 'start') startText.value = text
  else endText.value = text
  commitTyped()
}

function commitTyped() {
  const parseText = (text: string) => (text.trim() ? dayjs(text.trim(), displayFormat.value) : undefined)
  const start = parseText(startText.value)
  const end = parseText(endText.value)
  if (start && !start.isValid()) return
  if (end && !end.isValid()) return
  void commit(start, end)
}

function syncText() {
  startText.value = displayStart.value
  endText.value = displayEnd.value
}

function syncDraftText() {
  startText.value = draftStart.value ? draftStart.value.format(displayFormat.value) : ''
  endText.value = draftEnd.value ? draftEnd.value.format(displayFormat.value) : ''
}

function monthIndex(date: Dayjs) {
  return date.year() * 12 + date.month()
}

function clampApart(preferred: 'start' | 'end' = 'end') {
  const start = cursorStart.value.startOf('month')
  const end = cursorEnd.value.startOf('month')
  if (monthIndex(start) < monthIndex(end)) {
    cursorStart.value = start
    cursorEnd.value = end
    return
  }
  if (preferred === 'start') {
    cursorStart.value = start
    cursorEnd.value = start.add(1, 'month')
    return
  }
  cursorEnd.value = end
  cursorStart.value = end.subtract(1, 'month')
}

function setCursors(start?: Dayjs) {
  const base = (start || dayjs()).startOf('month')
  cursorStart.value = base
  cursorEnd.value = base.add(1, 'month')
  startView.value = 'days'
  endView.value = 'days'
}

function openPanel(side: 'start' | 'end' = 'start') {
  if (locked.value) return
  draftStart.value = range.value.start
  draftEnd.value = range.value.end
  editState.value = side
  setCursors(range.value.start)
  syncDraftText()
  open.value = true
}

function pickStartYear(year: number) {
  cursorStart.value = cursorStart.value.year(year)
  startView.value = 'months'
  clampApart('start')
}

function pickStartMonth(month: number) {
  cursorStart.value = cursorStart.value.month(month)
  startView.value = 'days'
  clampApart('start')
}

function pickEndYear(year: number) {
  cursorEnd.value = cursorEnd.value.year(year)
  endView.value = 'months'
  clampApart('end')
}

function pickEndMonth(month: number) {
  cursorEnd.value = cursorEnd.value.month(month)
  endView.value = 'days'
  clampApart('end')
}

function toggleOpen(event: Event) {
  event.stopPropagation()
  if (open.value) cancelPanel()
  else openPanel()
}

function cancelPanel() {
  open.value = false
  draftStart.value = range.value.start
  draftEnd.value = range.value.end
  syncText()
}

function checkStart(date: Dayjs): boolean {
  const { min, max } = inputDateMinMax(props.schema, data.value)
  const end = draftEnd.value
  const cap = max && end ? (max.isBefore(end) ? max : end) : max || end
  if (min && date.isBefore(min, 'day')) return false
  if (cap && date.isAfter(cap, 'day')) return false
  if (end && minDuration.value && date.isAfter(subtractDateDuration(end, minDuration.value), 'second')) return false
  if (end && maxDuration.value && date.isBefore(subtractDateDuration(end, maxDuration.value), 'second')) return false
  return true
}

function checkEnd(date: Dayjs): boolean {
  const { min, max } = inputDateMinMax(props.schema, data.value)
  const start = draftStart.value
  const floor = min && start ? (min.isAfter(start) ? min : start) : min || start
  if (floor && date.startOf('day').isBefore(floor.clone().startOf('day'), 'day')) return false
  if (max && date.isAfter(max, 'day')) return false
  if (start && minDuration.value && date.isBefore(addDateDuration(start, minDuration.value), 'second')) return false
  if (start && maxDuration.value && date.isAfter(addDateDuration(start, maxDuration.value), 'second')) return false
  return true
}

function disabledStart(cell: CalendarCell) {
  const date = dayjs(cell.date)
  return isInputDateDisabled(date, props.schema, data.value, trusted.value) || !checkStart(date)
}

function disabledEnd(cell: CalendarCell) {
  const date = dayjs(cell.date)
  return isInputDateDisabled(date, props.schema, data.value, trusted.value) || !checkEnd(date)
}

async function confirmPanel() {
  const start = draftStart.value
  const end = draftEnd.value
  if (!start && !end) return
  if (start && end && start.isAfter(end)) return
  await commit(start, end)
  if (start && !end) {
    editState.value = 'end'
    return
  }
  open.value = false
}

async function pickDay(cell: CalendarCell) {
  const picked = dayjs(cell.date).startOf('day')
  if (editState.value === 'start') {
    draftStart.value = boundPart(picked, 'start', draftStart.value)
    editState.value = 'end'
    syncDraftText()
    return
  }
  const clamped = clampEnd(picked, draftStart.value)
  draftEnd.value = boundPart(clamped, 'end', draftEnd.value)
  syncDraftText()
  if (embed.value) await confirmPanel()
}

async function pickShortcut(shortcut: Shortcut) {
  const { min, max } = inputDateMinMax(props.schema, data.value)
  let start = shortcut.start
  let end = shortcut.end
  if (min?.isValid()) start = start.isBefore(min) ? min : start
  if (max?.isValid()) end = end.isAfter(max) ? max : end
  draftStart.value = boundPart(start, 'start', draftStart.value)
  draftEnd.value = boundPart(end, 'end', draftEnd.value)
  setCursors(draftStart.value)
  syncDraftText()
  if (embed.value || closeOnSelect.value) await confirmPanel()
}

async function clearValue() {
  startText.value = ''
  endText.value = ''
  draftStart.value = undefined
  draftEnd.value = undefined
  await commit(undefined, undefined)
}

async function resetValue() {
  const next = pristine.value ?? props.schema.resetValue
  await commitFromRaw(next)
}

function focus() {
  const input = rootEl.value?.querySelector('input')
  input?.focus()
}

async function onFocus(native: Event, side: 'start' | 'end') {
  focused.value = true
  editState.value = side
  await emitEvent('focus', payloadOf(range.value.start, range.value.end), native)
}

async function onBlur(native: Event) {
  focused.value = false
  await emitEvent('blur', payloadOf(range.value.start, range.value.end), native)
}

const rangeApi = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id ? String(props.schema.id) : undefined,
  getValue: () => rawValue.value,
  getData: () => (name.value ? { value: rawValue.value, [name.value]: rawValue.value } : { value: rawValue.value }),
  setData(values: Record<string, unknown>) {
    if (!values || typeof values !== 'object') return
    if ('value' in values) void commitFromRaw(values.value)
    else if (name.value && name.value in values) void commitFromRaw(values[name.value])
  },
  async doAction(action: { actionType?: string; value?: unknown; args?: { value?: unknown } }) {
    const type = action?.actionType
    if (type === 'clear') await clearValue()
    else if (type === 'reset') await resetValue()
    else if (type === 'focus') await nextTick(focus)
    else if (type === 'setValue') await commitFromRaw(action.args?.value ?? action.value)
  },
}

async function commitFromRaw(raw: unknown) {
  if (raw == null || raw === '') {
    await commit(undefined, undefined)
    return
  }
  if (Array.isArray(raw)) {
    await commit(parsePart(raw[0]), parsePart(raw[1]))
    return
  }
  if (typeof raw === 'string' && raw.includes(delimiter.value)) {
    const [start, end] = raw.split(delimiter.value)
    await commit(parsePart(start), parsePart(end))
  }
}

function shiftCursor(side: 'start' | 'end', unit: 'month' | 'year', delta: number) {
  if (side === 'start') cursorStart.value = cursorStart.value.add(delta, unit)
  else cursorEnd.value = cursorEnd.value.add(delta, unit)
  clampApart(side)
}

scoped?.register(rangeApi as never)
onBeforeUnmount(() => scoped?.unregister(rangeApi as never))

watch(displayStart, () => {
  if (!open.value) syncText()
}, { immediate: true })
watch(displayEnd, () => {
  if (!open.value) syncText()
})
watch(range, () => {
  pristine.value ??= rawValue.value
})
pristine.value = rawValue.value

const isStaticOutside = computed(() => formItemStaticSchema(props.schema))
const formItemSchema = computed(() => (isStaticOutside.value ? props.schema : { ...props.schema, static: false }))
</script>

<template>
  <FormItem :schema="formItemSchema">
    <span v-if="isStatic" class="vamis-form-static">{{ [displayStart, displayEnd].filter(Boolean).join(' ~ ') || '-' }}</span>
    <div v-else-if="embed" class="vamis-date-picker is-embed">
      <ul v-if="shortcuts.length" class="vamis-date-range__rangers">
        <li v-for="item in shortcuts" :key="item.key || item.label" class="vamis-date-range__ranger">
          <a @mousedown.prevent @click="pickShortcut(item)">{{ item.label }}</a>
        </li>
      </ul>
      <div class="vamis-date-range__calendars is-vertical">
        <div class="vamis-date-range__cal is-start">
          <DateCalendarPanel
            :framed="false"
            :cursor="cursorStart.toDate()"
            :view="startView"
            :weeks="startWeeks"
            :year-label="startYearLabel"
            :month-label="startMonthLabel"
            :decade="startDecade"
            :selected-iso="selectedIso"
            :range-start-iso="rangeStartIso"
            :range-end-iso="rangeEndIso"
            :disabled-iso="disabledStart"
            hide-next-nav
            @shift-month="shiftCursor('start', 'month', $event)"
            @shift-year="shiftCursor('start', 'year', $event)"
            @pick-year="pickStartYear"
            @pick-month="pickStartMonth"
            @pick-day="pickDay"
            @open-year="startView = 'years'"
            @open-month="startView = 'months'"
          />
        </div>
        <div class="vamis-date-range__cal is-end">
          <DateCalendarPanel
            :framed="false"
            :cursor="cursorEnd.toDate()"
            :view="endView"
            :weeks="endWeeks"
            :year-label="endYearLabel"
            :month-label="endMonthLabel"
            :decade="endDecade"
            :selected-iso="selectedIso"
            :range-start-iso="rangeStartIso"
            :range-end-iso="rangeEndIso"
            :disabled-iso="disabledEnd"
            hide-prev-nav
            @shift-month="shiftCursor('end', 'month', $event)"
            @shift-year="shiftCursor('end', 'year', $event)"
            @pick-year="pickEndYear"
            @pick-month="pickEndMonth"
            @pick-day="pickDay"
            @open-year="endView = 'years'"
            @open-month="endView = 'months'"
          />
        </div>
      </div>
    </div>
    <div
      v-else
      ref="rootEl"
      class="vamis-date-range"
      :class="{
        'is-focused': open || focused,
        'is-disabled': locked,
        [String(resolveClassName(schema.className, data) || '')]: !!schema.className,
      }"
      data-slot="input-date-range"
      @click="openPanel()"
    >
      <input
        :value="startText"
        type="text"
        class="vamis-date-range__input"
        :class="{ 'is-active': open && editState === 'start' }"
        :placeholder="startPlaceholder"
        :disabled="locked"
        autocomplete="off"
        @click.stop="openPanel('start')"
        @input="onTextInput('start', $event)"
        @focus="onFocus($event, 'start')"
        @blur="onBlur($event)"
      >
      <span class="vamis-date-range__separator" aria-hidden="true"><span class="vamis-date-range__separator-line" /></span>
      <input
        :value="endText"
        type="text"
        class="vamis-date-range__input"
        :class="{ 'is-active': open && editState === 'end' }"
        :placeholder="endPlaceholder"
        :disabled="locked"
        autocomplete="off"
        @click.stop="openPanel('end')"
        @input="onTextInput('end', $event)"
        @focus="onFocus($event, 'end')"
        @blur="onBlur($event)"
      >
      <button v-if="showClear" type="button" class="vamis-select__clear" aria-label="清除" @mousedown.prevent @click.stop="clearValue">
        <VamisClear />
      </button>
      <span class="vamis-date-picker__icon" aria-hidden="true" @click.stop="toggleOpen">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path fill="currentColor" d="M3.5 1.5A.5.5 0 0 1 4 2v.5h8V2a.5.5 0 0 1 1 0v.5h.5A1.5 1.5 0 0 1 15 4v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13V4a1.5 1.5 0 0 1 1.5-1.5H3V2a.5.5 0 0 1 .5-.5ZM2 6v7a.5.5 0 0 0 .5.5h11A.5.5 0 0 0 14 13V6H2Zm0-1h12V4a.5.5 0 0 0-.5-.5h-11A.5.5 0 0 0 2 4v1Z" />
        </svg>
      </span>
      <VamisOverlay :show="open" :target="rootEl" :gap="4" @outside="cancelPanel">
        <div class="vamis-date-picker__popover vamis-date-range__popover">
          <ul v-if="shortcuts.length" class="vamis-date-range__rangers">
            <li v-for="item in shortcuts" :key="item.key || item.label" class="vamis-date-range__ranger">
              <a @mousedown.prevent @click="pickShortcut(item)">{{ item.label }}</a>
            </li>
          </ul>
          <div class="vamis-date-range__calendars">
            <div class="vamis-date-range__cal is-start">
              <DateCalendarPanel
                :framed="false"
                :cursor="cursorStart.toDate()"
                :view="startView"
                :weeks="startWeeks"
                :year-label="startYearLabel"
                :month-label="startMonthLabel"
                :decade="startDecade"
                :selected-iso="selectedIso"
                :range-start-iso="rangeStartIso"
                :range-end-iso="rangeEndIso"
                :disabled-iso="disabledStart"
                hide-next-nav
                @shift-month="shiftCursor('start', 'month', $event)"
                @shift-year="shiftCursor('start', 'year', $event)"
                @pick-year="pickStartYear"
                @pick-month="pickStartMonth"
                @pick-day="pickDay"
                @open-year="startView = 'years'"
                @open-month="startView = 'months'"
              />
            </div>
            <div class="vamis-date-range__cal is-end">
              <DateCalendarPanel
                :framed="false"
                :cursor="cursorEnd.toDate()"
                :view="endView"
                :weeks="endWeeks"
                :year-label="endYearLabel"
                :month-label="endMonthLabel"
                :decade="endDecade"
                :selected-iso="selectedIso"
                :range-start-iso="rangeStartIso"
                :range-end-iso="rangeEndIso"
                :disabled-iso="disabledEnd"
                hide-prev-nav
                @shift-month="shiftCursor('end', 'month', $event)"
                @shift-year="shiftCursor('end', 'year', $event)"
                @pick-year="pickEndYear"
                @pick-month="pickEndMonth"
                @pick-day="pickDay"
                @open-year="endView = 'years'"
                @open-month="endView = 'months'"
              />
            </div>
          </div>
          <div class="vamis-date-range__actions">
            <Button size="sm" variant="outline" type="button" @click="cancelPanel">取消</Button>
            <Button size="sm" class="vamis-date-range__confirm" type="button" :disabled="!canConfirm" @click="confirmPanel">确认</Button>
          </div>
        </div>
      </VamisOverlay>
    </div>
  </FormItem>
</template>
