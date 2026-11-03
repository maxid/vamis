<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import moment, { type Moment } from 'moment'
import { cn } from '@vamis/ui'
import {
  CALENDAR_WEEKDAYS,
  createVamisEvent,
  displayInputDateValue,
  eventEvalData,
  filterTpl,
  formItemStatic,
  formItemStaticSchema,
  INPUT_DATE_MONTHS,
  inputDateCellIso,
  inputDateClearable,
  inputDateCloseOnSelect,
  inputDateHours,
  inputDateMinutes,
  inputDateMonthCells,
  inputDatePlaceholder,
  inputDateResetValue,
  inputDateSetDataValue,
  inputDateShowsTime,
  inputDateTimeFormat,
  inputDateViewMode,
  isInputDateDisabled,
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
  type SchemaObject,
} from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

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
const cursor = ref(moment())
const pristine = ref<unknown>(undefined)

const name = computed(() => (props.schema.name ? String(props.schema.name) : ''))
const data = computed(() => viewData.value || {})
const current = computed(() => (name.value ? form?.getValue(name.value) : props.schema.value))
const parsed = computed(() => parseInputDateValue(current.value, props.schema, data.value))
const displayText = computed(() => displayInputDateValue(current.value, props.schema, data.value))
const isStatic = computed(() => formItemStatic(props.schema, data.value, form?.isStatic?.() === true))
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
const yearLabel = computed(() => `${cursor.value.year()}年`)
const monthLabel = computed(() => `${cursor.value.month() + 1}月`)
const decade = computed(() => {
  const from = Math.floor(cursor.value.year() / 10) * 10
  const years: number[] = []
  for (let y = from - 1; y <= from + 10; y++) years.push(y)
  return { from, to: from + 9, years }
})
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

function syncCursor(date?: Moment) {
  cursor.value = (date?.isValid() ? date.clone() : moment()).startOf('day')
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

function cellDisabled(iso: string, date: Date) {
  const m = moment(date)
  return isInputDateDisabled(m, props.schema, data.value, env.trusted === true)
}

async function pickDay(date: Date, iso: string) {
  if (locked.value || cellDisabled(iso, date)) return
  const next = pickInputDateValue(moment(date), props.schema, parsed.value)
  syncCursor(moment(date))
  await commit(next, true)
}

async function pickShortcut(date: Moment) {
  if (locked.value) return
  const next = pickInputDateValue(date, props.schema, parsed.value)
  syncCursor(date)
  await commit(next, true)
}

async function pickTime(part: 'hour' | 'minute' | 'second', raw: string) {
  if (locked.value) return
  const base = parsed.value?.clone() || cursor.value.clone()
  if (part === 'hour') base.hour(Number(raw))
  if (part === 'minute') base.minute(Number(raw))
  if (part === 'second') base.second(Number(raw))
  await commit(storeInputDateValue(base, props.schema), false)
}

function shiftMonth(delta: number) {
  cursor.value = cursor.value.clone().add(delta, 'month')
}
function shiftYear(delta: number) {
  cursor.value = cursor.value.clone().add(delta, 'year')
}
function pickYear(year: number) {
  cursor.value = cursor.value.clone().year(year)
  panelView.value = 'months'
}
function pickMonth(month: number) {
  cursor.value = cursor.value.clone().month(month)
  panelView.value = 'days'
}

function openPanel() {
  if (locked.value || embed.value) return
  open.value = true
  syncCursor(parsed.value)
  panelView.value = 'days'
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

function onDocumentPointer(event: MouseEvent) {
  if (!open.value || embed.value) return
  const target = event.target as Node | null
  if (target && rootEl.value?.contains(target)) return
  open.value = false
}

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
  document.addEventListener('mousedown', onDocumentPointer)
})
onBeforeUnmount(() => {
  for (const api of apis) scoped?.unregister(api)
  document.removeEventListener('mousedown', onDocumentPointer)
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
          :readonly="inputForbid"
          :class="nativeClass"
          autocomplete="off"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
        >
        <button
          v-if="showClear"
          type="button"
          class="vamis-text-control__clear"
          aria-label="清除"
          @mousedown.prevent
          @click.stop="clearValue"
        >
          ×
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

      <div
        v-if="embed || open"
        class="vamis-date-picker__popover"
        :class="{ 'is-embed': embed }"
      >
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

        <div v-if="!timeOnly" class="vamis-date-cal">
          <div v-if="panelView === 'days'" class="vamis-date-cal__header">
            <button type="button" class="vamis-date-cal__nav" aria-label="上一年" @mousedown.prevent @click="shiftYear(-1)">«</button>
            <button type="button" class="vamis-date-cal__nav" aria-label="上一月" @mousedown.prevent @click="shiftMonth(-1)">‹</button>
            <div class="vamis-date-cal__center">
              <button type="button" class="vamis-date-cal__switch" @mousedown.prevent @click="panelView = 'years'">{{ yearLabel }}</button>
              <button type="button" class="vamis-date-cal__switch" @mousedown.prevent @click="panelView = 'months'">{{ monthLabel }}</button>
            </div>
            <button type="button" class="vamis-date-cal__nav" aria-label="下一月" @mousedown.prevent @click="shiftMonth(1)">›</button>
            <button type="button" class="vamis-date-cal__nav" aria-label="下一年" @mousedown.prevent @click="shiftYear(1)">»</button>
          </div>
          <div v-else-if="panelView === 'months'" class="vamis-date-cal__header is-span">
            <button type="button" class="vamis-date-cal__nav" aria-label="上一年" @mousedown.prevent @click="shiftYear(-1)">«</button>
            <button type="button" class="vamis-date-cal__switch" @mousedown.prevent @click="panelView = 'years'">{{ yearLabel }}</button>
            <button type="button" class="vamis-date-cal__nav" aria-label="下一年" @mousedown.prevent @click="shiftYear(1)">»</button>
          </div>
          <div v-else class="vamis-date-cal__header is-span">
            <button type="button" class="vamis-date-cal__nav" aria-label="上十年" @mousedown.prevent @click="shiftYear(-10)">«</button>
            <span class="vamis-date-cal__switch">{{ decade.from }}年 - {{ decade.to }}年</span>
            <button type="button" class="vamis-date-cal__nav" aria-label="下十年" @mousedown.prevent @click="shiftYear(10)">»</button>
          </div>

          <table v-if="panelView === 'days'" class="vamis-date-cal__table">
            <thead>
              <tr>
                <th v-for="w in CALENDAR_WEEKDAYS" :key="w">{{ w }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(week, wi) in weeks" :key="wi">
                <td
                  v-for="cell in week"
                  :key="inputDateCellIso(cell)"
                  :class="{
                    'is-other': !cell.current,
                    'is-today': cell.today,
                    'is-active': inputDateCellIso(cell) === selectedIso,
                    'is-disabled': cellDisabled(inputDateCellIso(cell), cell.date),
                  }"
                  @mousedown.prevent
                  @click="pickDay(cell.date, inputDateCellIso(cell))"
                >
                  <span>{{ cell.day }}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else-if="panelView === 'months'" class="vamis-date-cal__grid">
            <button
              v-for="(label, index) in INPUT_DATE_MONTHS"
              :key="label"
              type="button"
              class="vamis-date-cal__pick"
              :class="{ 'is-active': cursor.month() === index }"
              @mousedown.prevent
              @click="pickMonth(index)"
            >
              {{ label }}
            </button>
          </div>
          <div v-else class="vamis-date-cal__grid">
            <button
              v-for="year in decade.years"
              :key="year"
              type="button"
              class="vamis-date-cal__pick"
              :class="{ 'is-active': cursor.year() === year, 'is-other': year < decade.from || year > decade.to }"
              @mousedown.prevent
              @click="pickYear(year)"
            >
              {{ year }}
            </button>
          </div>
        </div>

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
    </div>
  </FormItem>
</template>
