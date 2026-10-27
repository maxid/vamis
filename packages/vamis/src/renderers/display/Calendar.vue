<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  CALENDAR_MONTHS,
  CALENDAR_PICKER_ITEM_HEIGHT,
  CALENDAR_PICKER_VISIBLE,
  CALENDAR_WEEKDAYS,
  calendarDecade,
  calendarLaneMore,
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
  calendarStyleEntries,
  calendarWeekLanes,
  calendarWeeks,
  calendarYearLabel,
  runAction,
  useData,
  useEnv,
  useOverlay,
  useScoped,
  type ActionSchema,
  type CalendarCell,
  type SchemaObject,
} from '@vamis/core'
import CalendarWheel from './CalendarWheel.vue'

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

type CalView = 'days' | 'months' | 'years' | 'picker-year' | 'picker-month'
const view = ref<CalView>('days')
const mobile = ref(false)
const tempYear = ref(cursor.value.getFullYear())
const tempMonth = ref(cursor.value.getMonth())
const pickerYears = computed(() =>
  calendarPickerYearOptions(cursor.value, 100, view.value !== 'picker-year'),
)
const pickerMonths = computed(() => calendarPickerMonthOptions())
const pickerHeight = CALENDAR_PICKER_ITEM_HEIGHT * CALENDAR_PICKER_VISIBLE
const pickerMaskSize = (pickerHeight - CALENDAR_PICKER_ITEM_HEIGHT) / 2

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

function applyTodayStyle(el: Element | null) {
  if (!el) return
  const style = (el as HTMLElement).style
  for (const { key, value, important } of calendarStyleEntries(props.schema.todayActiveStyle)) {
    style.setProperty(key, value, important ? 'important' : undefined)
  }
}
</script>

<template>
  <div class="vamis-cal" data-slot="calendar" :class="{ 'is-large': large }">
    <div v-if="view === 'picker-year' || view === 'picker-month'" class="vamis-cal-picker">
      <div class="vamis-cal-picker-bar">
        <a class="vamis-cal-picker-cancel" @click.prevent="view = 'days'">取消</a>
        <div class="vamis-cal-picker-title">{{ view === 'picker-year' ? '选择年' : '选择年月' }}</div>
        <a class="vamis-cal-picker-ok" @click.prevent="confirmPicker">确认</a>
      </div>
      <div class="vamis-cal-picker-columns" :style="{ height: `${pickerHeight}px` }">
        <CalendarWheel v-model="tempYear" :options="pickerYears" />
        <CalendarWheel v-if="view === 'picker-month'" v-model="tempMonth" :options="pickerMonths" />
        <div
          class="vamis-cal-picker-mask"
          :style="{ backgroundSize: `100% ${pickerMaskSize}px` }"
        />
        <div class="vamis-cal-picker-frame" :style="{ height: `${CALENDAR_PICKER_ITEM_HEIGHT}px` }" />
      </div>
    </div>

    <table v-else>
      <thead>
        <tr>
          <th :colspan="view === 'days' ? 7 : 3">
            <div v-if="view === 'days'" class="vamis-cal-header">
              <a class="vamis-cal-nav" aria-label="上一年" @click.prevent="shiftYear(-1)">
                <svg class="vamis-cal-arrow is-double is-left" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="m.713.001 4.95 4.95-.003.003.003.003-4.95 4.95L0 9.194l4.24-4.24L0 .714.713.001Zm3.997 0 4.95 4.948-.004.004.004.003-4.95 4.95-.713-.714 4.24-4.239-4.24-4.24L4.71 0Z" fill="currentColor" fill-rule="evenodd" />
                </svg>
              </a>
              <a class="vamis-cal-nav" aria-label="上一月" @click.prevent="shiftMonth(-1)">
                <svg class="vamis-cal-arrow is-left" viewBox="0 0 16 16" aria-hidden="true">
                  <path stroke="currentColor" fill="none" stroke-linejoin="round" d="m5.497 13.664 5.657-5.657L5.497 2.35" />
                </svg>
              </a>
              <div class="vamis-cal-center">
                <a class="vamis-cal-switch" @click.prevent="openYear">{{ yearLabel }}</a>
                <a class="vamis-cal-switch" @click.prevent="openMonth">{{ monthLabel }}</a>
              </div>
              <a class="vamis-cal-nav" aria-label="下一月" @click.prevent="shiftMonth(1)">
                <svg class="vamis-cal-arrow" viewBox="0 0 16 16" aria-hidden="true">
                  <path stroke="currentColor" fill="none" stroke-linejoin="round" d="m5.497 13.664 5.657-5.657L5.497 2.35" />
                </svg>
              </a>
              <a class="vamis-cal-nav" aria-label="下一年" @click.prevent="shiftYear(1)">
                <svg class="vamis-cal-arrow is-double" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="m.713.001 4.95 4.95-.003.003.003.003-4.95 4.95L0 9.194l4.24-4.24L0 .714.713.001Zm3.997 0 4.95 4.948-.004.004.004.003-4.95 4.95-.713-.714 4.24-4.239-4.24-4.24L4.71 0Z" fill="currentColor" fill-rule="evenodd" />
                </svg>
              </a>
            </div>
            <div v-else-if="view === 'months'" class="vamis-cal-header is-span">
              <a class="vamis-cal-nav" aria-label="上一年" @click.prevent="shiftYear(-1)">
                <svg class="vamis-cal-arrow is-double is-left" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="m.713.001 4.95 4.95-.003.003.003.003-4.95 4.95L0 9.194l4.24-4.24L0 .714.713.001Zm3.997 0 4.95 4.948-.004.004.004.003-4.95 4.95-.713-.714 4.24-4.239-4.24-4.24L4.71 0Z" fill="currentColor" fill-rule="evenodd" />
                </svg>
              </a>
              <a class="vamis-cal-switch" @click.prevent="openYear">{{ yearLabel }}</a>
              <a class="vamis-cal-nav" aria-label="下一年" @click.prevent="shiftYear(1)">
                <svg class="vamis-cal-arrow is-double" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="m.713.001 4.95 4.95-.003.003.003.003-4.95 4.95L0 9.194l4.24-4.24L0 .714.713.001Zm3.997 0 4.95 4.948-.004.004.004.003-4.95 4.95-.713-.714 4.24-4.239-4.24-4.24L4.71 0Z" fill="currentColor" fill-rule="evenodd" />
                </svg>
              </a>
            </div>
            <div v-else class="vamis-cal-header is-span">
              <a class="vamis-cal-nav" aria-label="上十年" @click.prevent="shiftYear(-10)">
                <svg class="vamis-cal-arrow is-double is-left" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="m.713.001 4.95 4.95-.003.003.003.003-4.95 4.95L0 9.194l4.24-4.24L0 .714.713.001Zm3.997 0 4.95 4.948-.004.004.004.003-4.95 4.95-.713-.714 4.24-4.239-4.24-4.24L4.71 0Z" fill="currentColor" fill-rule="evenodd" />
                </svg>
              </a>
              <span class="vamis-cal-switch">{{ decade.from }}年 - {{ decade.to }}年</span>
              <a class="vamis-cal-nav" aria-label="下十年" @click.prevent="shiftYear(10)">
                <svg class="vamis-cal-arrow is-double" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="m.713.001 4.95 4.95-.003.003.003.003-4.95 4.95L0 9.194l4.24-4.24L0 .714.713.001Zm3.997 0 4.95 4.948-.004.004.004.003-4.95 4.95-.713-.714 4.24-4.239-4.24-4.24L4.71 0Z" fill="currentColor" fill-rule="evenodd" />
                </svg>
              </a>
            </div>
            <div class="vamis-cal-line" />
          </th>
        </tr>
        <tr v-if="view === 'days'">
          <th v-for="w in CALENDAR_WEEKDAYS" :key="w" class="vamis-cal-dow">{{ w }}</th>
        </tr>
      </thead>
      <tbody v-if="view === 'days'">
        <tr v-for="(week, wi) in weeks" :key="wi">
          <td
            v-for="(cell, di) in week"
            :key="cell.iso"
            :class="{
              'is-other': !cell.current,
              'is-today': cell.today,
            }"
          >
            <div v-if="large" class="vamis-cal-wrap">
              <div class="vamis-cal-head">
                <span :ref="(el) => cell.today && applyTodayStyle(el as Element | null)">{{ cell.day }}</span>
              </div>
              <div
                v-for="(lane, li) in weekLanes[wi][di]"
                :key="li"
                class="vamis-cal-chip"
                :class="[lane.className, { 'is-ph': lane.placeholder }]"
                :style="{ width: `${lane.width}00%` }"
                @click="!lane.placeholder && openSchedule(cell, $event)"
              >{{ lane.content }}</div>
              <div v-if="calendarLaneMore(cell)" class="vamis-cal-more" @click="openSchedule(cell, $event)">
                {{ calendarLaneMore(cell) }} 更多
              </div>
            </div>
            <template v-else>
              <span
                class="vamis-cal-day"
                :ref="(el) => cell.today && applyTodayStyle(el as Element | null)"
              >
                {{ cell.day }}
                <button
                  v-if="cell.events.length"
                  type="button"
                  class="vamis-cal-dot-hit"
                  aria-label="查看日程"
                  @click="openSchedule(cell, $event)"
                >
                  <span class="vamis-cal-dot" :class="cell.events[0].className" />
                </button>
              </span>
            </template>
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="view === 'months'">
        <tr v-for="row in 4" :key="row">
          <td
            v-for="col in 3"
            :key="col"
            class="vamis-cal-pick"
            :class="{ 'is-active': (row - 1) * 3 + col - 1 === cursor.getMonth() }"
            @click="pickMonth((row - 1) * 3 + col - 1)"
          >
            <span>{{ CALENDAR_MONTHS[(row - 1) * 3 + col - 1] }}月</span>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="row in 4" :key="row">
          <td
            v-for="col in 3"
            :key="col"
            class="vamis-cal-pick"
            :class="{
              'is-other': decade.years[(row - 1) * 3 + col - 1]?.muted,
              'is-active': decade.years[(row - 1) * 3 + col - 1]?.year === cursor.getFullYear(),
            }"
            @click="pickYear(decade.years[(row - 1) * 3 + col - 1].year)"
          >
            <span>{{ decade.years[(row - 1) * 3 + col - 1].year }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* 对齐 Amis DateCalendar + rdtPicker。不用 helper grid-cols-7（那是 6 列）。 */
.vamis-cal {
  position: relative;
  box-sizing: border-box;
  display: inline-block;
  width: 240px;
  max-width: 100%;
  overflow: visible;
  border: 1px solid #e8e9eb;
  border-radius: var(--radius);
  background: #fff;
  font-size: 12px;
  color: var(--foreground);
  user-select: none;
}
.vamis-cal.is-large {
  display: block;
  width: 100%;
  overflow: visible;
}
.vamis-cal table {
  width: 100%;
  margin: 0;
  padding: 0 12px;
  border-collapse: separate;
  border-spacing: 0 8px;
  table-layout: fixed;
}
.vamis-cal.is-large table {
  border-collapse: collapse;
  border-spacing: 0;
}
.vamis-cal-header {
  display: flex;
  align-items: center;
  height: 40px;
  margin-top: -8px;
}
.vamis-cal.is-large .vamis-cal-header {
  margin-top: 0;
}
.vamis-cal-header.is-span {
  justify-content: space-between;
}
.vamis-cal-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vamis-cal-switch {
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  color: inherit;
  cursor: pointer;
  text-decoration: none;
}
.vamis-cal-switch + .vamis-cal-switch {
  margin-left: 4px;
}
.vamis-cal-switch:hover {
  color: var(--primary);
  text-decoration: none;
}
.vamis-cal-nav {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 24px;
  color: inherit;
  cursor: pointer;
  text-decoration: none;
}
.vamis-cal-nav:hover {
  color: var(--primary);
  text-decoration: none;
}
.vamis-cal-arrow {
  display: block;
  width: 12px;
  height: 12px;
}
.vamis-cal-arrow.is-double {
  width: 10px;
  height: 10px;
}
.vamis-cal-arrow.is-left {
  transform: rotate(180deg);
}
.vamis-cal-line {
  position: absolute;
  top: 40px;
  right: 0;
  left: 0;
  height: 1px;
  background: #e8e9eb;
}
.vamis-cal-dow {
  width: 14.2857%;
  height: 24px;
  line-height: 24px;
  font-weight: 400;
  color: var(--muted-foreground);
  text-align: center;
}
.vamis-cal.is-large .vamis-cal-dow {
  height: 40px;
}
.vamis-cal td {
  position: relative;
  text-align: center;
  vertical-align: top;
  height: 24px;
  cursor: pointer;
}
.vamis-cal.is-large td {
  overflow: visible;
  height: 110px;
  padding: 1px;
  border: 1px solid #e8e9eb;
  background: #fff;
}
.vamis-cal-day {
  position: relative;
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: var(--radius);
}
.vamis-cal td.is-other .vamis-cal-day,
.vamis-cal td.is-other.vamis-cal-pick,
.vamis-cal.is-large td.is-other .vamis-cal-head {
  /* Amis rdtOld/rdtNew：--inputDate-disabled-option-color = #b8babf */
  color: #b8babf;
}
.vamis-cal td.is-today .vamis-cal-day,
.vamis-cal.is-large td.is-today .vamis-cal-head span {
  border: 1px solid var(--primary);
}
.vamis-cal td.is-active.vamis-cal-pick span {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius);
}
.vamis-cal td:hover .vamis-cal-day,
.vamis-cal td.vamis-cal-pick:hover span,
.vamis-cal.is-large td:hover .vamis-cal-head span {
  background: #f7f8fa;
  color: #151b26;
}
.vamis-cal-pick {
  height: 40px;
  vertical-align: middle;
}
.vamis-cal-pick span {
  display: inline-block;
  min-width: 40px;
  line-height: 24px;
  padding: 0 6px;
}
.vamis-cal-dot-hit {
  position: absolute;
  left: 50%;
  bottom: -4px;
  z-index: 10;
  width: 10px;
  height: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  transform: translateX(-50%);
  cursor: pointer;
}
.vamis-cal-dot-hit::after {
  content: "";
  position: absolute;
  top: 0;
  right: -8px;
  bottom: -8px;
  left: -8px;
}
.vamis-cal-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
}
/* Amis --secondary 是 #5c5f66；shadcn --secondary 太浅，白字看不见。只盖日历条/点。 */
.vamis-cal-chip.bg-secondary,
.vamis-cal-dot.bg-secondary {
  background-color: #5c5f66;
}
.vamis-cal-wrap {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100%;
  height: 100%;
  overflow: visible;
  text-align: center;
}
.vamis-cal-head {
  height: 24px;
  line-height: 24px;
}
.vamis-cal-head span {
  display: inline-block;
  min-width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: var(--radius);
}
.vamis-cal-chip {
  position: relative;
  z-index: 10;
  box-sizing: border-box;
  height: 20px;
  margin: 1px 0;
  padding: 0 4px;
  border-radius: var(--radius);
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
.vamis-cal-chip.is-ph {
  visibility: hidden;
  cursor: default;
}
.vamis-cal-more {
  padding: 0 4px;
  font-size: 12px;
  line-height: 20px;
  color: var(--muted-foreground);
  cursor: pointer;
}
.vamis-cal-picker {
  overflow: hidden;
  background: #fff;
}
.vamis-cal-picker-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
}
.vamis-cal-picker-cancel,
.vamis-cal-picker-ok {
  height: 100%;
  padding: 0 16px;
  line-height: 50px;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  color: #666;
}
.vamis-cal-picker-ok {
  color: var(--primary);
}
.vamis-cal-picker-title {
  max-width: 50%;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  color: #222;
  text-align: center;
}
.vamis-cal-picker-columns {
  position: relative;
  display: flex;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
}
.vamis-cal-picker-mask {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: linear-gradient(180deg, hsla(0, 0%, 100%, 0.9), hsla(0, 0%, 100%, 0.4)),
    linear-gradient(0deg, hsla(0, 0%, 100%, 0.9), hsla(0, 0%, 100%, 0.4));
  background-repeat: no-repeat;
  background-position: top, bottom;
}
.vamis-cal-picker-frame {
  position: absolute;
  top: 50%;
  right: 16px;
  left: 16px;
  z-index: 2;
  pointer-events: none;
  transform: translateY(-50%);
}
.vamis-cal-picker-frame::after {
  position: absolute;
  inset: -50%;
  content: "";
  border-top: 1px solid #e8e9eb;
  border-bottom: 1px solid #e8e9eb;
  transform: scale(0.5);
}
</style>
