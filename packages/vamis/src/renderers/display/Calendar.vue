<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  calendarDecade,
  calendarLargeMode,
  calendarMonthCells,
  calendarMonthLabel,
  calendarParseDate,
  calendarPickerMonthOptions,
  calendarPickerYearOptions,
  calendarRawValue,
  calendarScheduleAction,
  calendarSchedulePayload,
  calendarSchedules,
  calendarWeekLanes,
  calendarWeeks,
  calendarYearLabel,
  isoDay,
  runAction,
  useData,
  useEnv,
  useOverlay,
  useScoped,
  type ActionSchema,
  type CalendarCell,
  type SchemaObject,
} from '@vamis/core'
import DateCalendarPanel, { type DateCalendarView } from '../calendar/DateCalendarPanel.vue'

const props = defineProps<{ schema: SchemaObject; data: Record<string, unknown> }>()

const env = useEnv()
const overlay = useOverlay()
const scoped = useScoped()
const pageData = useData()

const cursor = ref(calendarParseDate(calendarRawValue(props.schema, props.data)))
const large = computed(() => calendarLargeMode(props.schema))
const schedules = computed(() => calendarSchedules(props.schema, props.data))
const yearLabel = computed(() => calendarYearLabel(cursor.value))
const monthLabel = computed(() => calendarMonthLabel(cursor.value))
const weeks = computed(() => calendarWeeks(calendarMonthCells(cursor.value, schedules.value)))
const weekLanes = computed(() => weeks.value.map((week) => calendarWeekLanes(week, schedules.value)))
const decade = computed(() => calendarDecade(cursor.value))
const selectedIso = computed(() => {
  const raw = calendarRawValue(props.schema, props.data)
  if (raw == null || raw === '') return ''
  return isoDay(calendarParseDate(raw))
})

const view = ref<DateCalendarView>('days')
const mobile = ref(false)
const tempYear = ref(cursor.value.getFullYear())
const tempMonth = ref(cursor.value.getMonth())
const pickerYears = computed(() =>
  calendarPickerYearOptions(cursor.value, 100, view.value !== 'picker-year'),
)
const pickerMonths = computed(() => calendarPickerMonthOptions())

let media: MediaQueryList | undefined
let onMedia: (() => void) | undefined

onMounted(() => {
  if (typeof window === 'undefined' || !window.matchMedia) return
  media = window.matchMedia('(max-width: 768px)')
  onMedia = () => {
    mobile.value = media?.matches === true
  }
  onMedia()
  media.addEventListener('change', onMedia)
})

onUnmounted(() => {
  if (media && onMedia) media.removeEventListener('change', onMedia)
})

watch(
  () => calendarRawValue(props.schema, props.data),
  (value) => {
    cursor.value = calendarParseDate(value)
  },
)

function shiftMonth(delta: number) {
  const next = new Date(cursor.value)
  next.setMonth(next.getMonth() + delta)
  cursor.value = next
}

function shiftYear(delta: number) {
  const next = new Date(cursor.value)
  next.setFullYear(next.getFullYear() + delta)
  cursor.value = next
}

function setYear(year: number) {
  const next = new Date(cursor.value)
  next.setFullYear(year)
  cursor.value = next
}

function setMonth(month: number) {
  const next = new Date(cursor.value)
  next.setMonth(month)
  cursor.value = next
}

function openYear() {
  if (mobile.value) {
    tempYear.value = cursor.value.getFullYear()
    view.value = 'picker-year'
    return
  }
  view.value = 'years'
}

function openMonth() {
  if (mobile.value) {
    tempYear.value = cursor.value.getFullYear()
    tempMonth.value = cursor.value.getMonth()
    view.value = 'picker-month'
    return
  }
  view.value = 'months'
}

function confirmPicker() {
  if (view.value === 'picker-year') setYear(tempYear.value)
  if (view.value === 'picker-month') {
    setYear(tempYear.value)
    setMonth(tempMonth.value)
  }
  view.value = 'days'
}

function pickYear(year: number) {
  setYear(year)
  view.value = 'months'
}

function pickMonth(month: number) {
  setMonth(month)
  view.value = 'days'
}

async function openSchedule(cell: CalendarCell, event?: Event) {
  event?.stopPropagation()
  if (!cell.events.length) return
  const payload = calendarSchedulePayload(cell.events, cell.date)
  await runAction(calendarScheduleAction(props.schema) as ActionSchema, {
    env,
    data: { ...pageData.value, ...payload },
    overlay,
    scoped,
  })
}
</script>

<template>
  <DateCalendarPanel
    data-slot="calendar"
    :cursor="cursor"
    :view="view"
    :weeks="weeks"
    :week-lanes="weekLanes"
    :year-label="yearLabel"
    :month-label="monthLabel"
    :decade="decade"
    :large="large"
    :selected-iso="selectedIso"
    :today-active-style="schema.todayActiveStyle"
    :picker-years="pickerYears"
    :picker-months="pickerMonths"
    :temp-year="tempYear"
    :temp-month="tempMonth"
    @shift-month="shiftMonth"
    @shift-year="shiftYear"
    @pick-year="pickYear"
    @pick-month="pickMonth"
    @open-year="openYear"
    @open-month="openMonth"
    @cancel-picker="view = 'days'"
    @confirm-picker="confirmPicker"
    @update:temp-year="tempYear = $event"
    @update:temp-month="tempMonth = $event"
    @open-schedule="openSchedule"
  />
</template>
