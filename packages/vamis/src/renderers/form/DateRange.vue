<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { VamisClear } from '@vamis/ui'
import {
  calendarDecade,
  calendarMonthLabel,
  calendarYearLabel,
  createVamisEvent,
  dayjs,
  eventEvalData,
  filterDate,
  filterTpl,
  formItemStatic,
  formItemStaticSchema,
  inputDateMonthCells,
  resolveClassName,
  runOnEvent,
  statusStaticOf,
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
const startText = ref('')
const endText = ref('')
const cursor = ref(dayjs())
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
const placeholder = computed(() => String(props.schema.placeholder || '请选择日期范围'))
const displayFormat = computed(() => {
  const raw = String(props.schema.displayFormat || props.schema.inputFormat || '')
  if (raw) return raw
  return props.schema.type === 'input-datetime-range' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
})
const valueFormat = computed(() => String(props.schema.valueFormat || props.schema.format || 'X'))
const delimiter = computed(() => String(props.schema.delimiter ?? ','))
const utc = computed(() => props.schema.utc === true)

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
const selectedIso = computed(() => (range.value.start ? range.value.start.format('YYYY-MM-DD') : ''))
const weeks = computed(() => inputDateMonthCells(cursor.value.toDate(), new Date()))
const yearLabel = computed(() => calendarYearLabel(cursor.value.toDate()))
const monthLabel = computed(() => calendarMonthLabel(cursor.value.toDate()))
const decade = computed(() => calendarDecade(cursor.value.toDate()))

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
  thisweek: '本周',
  thismonth: '本月',
  prevmonth: '上月',
  thisquarter: '本季度',
  prevquarter: '上季度',
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
  const next = isEnd && /^(day|X|YYYY-MM-DD)$/i.test(valueFormat.value) ? date.endOf('day') : date
  return next.format(valueFormat.value)
}

async function commit(start?: Dayjs, end?: Dayjs) {
  const value = `${storedValue(start, false)}${delimiter.value}${storedValue(end, true)}`
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

function openPanel() {
  if (locked.value) return
  draftStart.value = range.value.start
  draftEnd.value = range.value.end
  if (range.value.start) cursor.value = range.value.start.clone()
  open.value = true
}

function toggleOpen(event: Event) {
  event.stopPropagation()
  if (open.value) open.value = false
  else openPanel()
}

async function pickDay(cell: CalendarCell) {
  const picked = dayjs(cell.date).startOf('day')
  if (!draftStart.value || draftEnd.value) {
    draftStart.value = picked
    draftEnd.value = undefined
    return
  }
  draftEnd.value = picked.endOf('day')
  await commit(draftStart.value, draftEnd.value)
  open.value = false
}

async function pickShortcut(shortcut: Shortcut) {
  await commit(shortcut.start, shortcut.end)
  open.value = false
}

async function clearValue() {
  startText.value = ''
  endText.value = ''
  await commit(undefined, undefined)
}

async function resetValue() {
  const next = pristine.value
  const parsed = parsePart(next)
  await commit(parsed, undefined)
}

function focus() {
  const input = rootEl.value?.querySelector('input')
  input?.focus()
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
  if (Array.isArray(raw)) {
    await commit(parsePart(raw[0]), parsePart(raw[1]))
    return
  }
  if (typeof raw === 'string' && raw.includes(delimiter.value)) {
    const [start, end] = raw.split(delimiter.value)
    await commit(parsePart(start), parsePart(end))
  }
}

scoped?.register(rangeApi as never)
onBeforeUnmount(() => scoped?.unregister(rangeApi as never))

watch(displayStart, syncText, { immediate: true })
watch(displayEnd, syncText)
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
      <div v-if="shortcuts.length" class="vamis-date-picker__shortcuts">
        <button
          v-for="item in shortcuts"
          :key="item.key || item.label"
          type="button"
          class="vamis-date-picker__shortcut"
          @mousedown.prevent
          @click="pickShortcut(item)"
        >
          {{ item.label }}
        </button>
      </div>
      <DateCalendarPanel
        :cursor="cursor.toDate()"
        view="days"
        :weeks="weeks"
        :year-label="yearLabel"
        :month-label="monthLabel"
        :decade="decade"
        :selected-iso="draftStart ? draftStart.format('YYYY-MM-DD') : selectedIso"
        @shift-month="cursor = cursor.add($event, 'month')"
        @shift-year="cursor = cursor.add($event, 'year')"
        @pick-year="(year) => (cursor = cursor.year(year))"
        @pick-month="(month) => (cursor = cursor.month(month))"
        @pick-day="pickDay"
        @open-year="() => {}"
        @open-month="() => {}"
      />
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
      @click="openPanel"
    >
      <input
        :value="startText"
        type="text"
        class="vamis-date-range__input"
        :placeholder="placeholder"
        :disabled="locked"
        autocomplete="off"
        @input="onTextInput('start', $event)"
        @focus="focused = true"
        @blur="focused = false"
      >
      <span class="vamis-date-range__separator">~</span>
      <input
        :value="endText"
        type="text"
        class="vamis-date-range__input"
        :placeholder="placeholder"
        :disabled="locked"
        autocomplete="off"
        @input="onTextInput('end', $event)"
        @focus="focused = true"
        @blur="focused = false"
      >
      <button v-if="showClear" type="button" class="vamis-select__clear" aria-label="清除" @mousedown.prevent @click.stop="clearValue">
        <VamisClear />
      </button>
      <span class="vamis-date-picker__icon" aria-hidden="true" @click.stop="toggleOpen">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path fill="currentColor" d="M3.5 1.5A.5.5 0 0 1 4 2v.5h8V2a.5.5 0 0 1 1 0v.5h.5A1.5 1.5 0 0 1 15 4v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13V4a1.5 1.5 0 0 1 1.5-1.5H3V2a.5.5 0 0 1 .5-.5ZM2 6v7a.5.5 0 0 0 .5.5h11A.5.5 0 0 0 14 13V6H2Zm0-1h12V4a.5.5 0 0 0-.5-.5h-11A.5.5 0 0 0 2 4v1Z" />
        </svg>
      </span>
      <VamisOverlay :show="open" :target="rootEl" :gap="4" @outside="open = false">
        <div class="vamis-date-picker__popover">
          <div v-if="shortcuts.length" class="vamis-date-picker__shortcuts">
            <button
              v-for="item in shortcuts"
              :key="item.key || item.label"
              type="button"
              class="vamis-date-picker__shortcut"
              @mousedown.prevent
              @click="pickShortcut(item)"
            >
              {{ item.label }}
            </button>
          </div>
          <DateCalendarPanel
            :framed="false"
            :cursor="cursor.toDate()"
            view="days"
            :weeks="weeks"
            :year-label="yearLabel"
            :month-label="monthLabel"
            :decade="decade"
            :selected-iso="draftStart ? draftStart.format('YYYY-MM-DD') : selectedIso"
            @shift-month="cursor = cursor.add($event, 'month')"
            @shift-year="cursor = cursor.add($event, 'year')"
            @pick-year="(year) => (cursor = cursor.year(year))"
            @pick-month="(month) => (cursor = cursor.month(month))"
            @pick-day="pickDay"
            @open-year="() => {}"
            @open-month="() => {}"
          />
        </div>
      </VamisOverlay>
    </div>
  </FormItem>
</template>
