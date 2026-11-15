<script setup lang="ts">
import { computed } from 'vue'
import {
  CALENDAR_MONTHS,
  CALENDAR_PICKER_ITEM_HEIGHT,
  CALENDAR_PICKER_VISIBLE,
  CALENDAR_WEEKDAYS,
  calendarLaneMore,
  calendarStyleEntries,
  type CalendarCell,
  type CalendarLane,
  type CalendarPickerOption,
} from '@vamis/core'
import { VamisDateArrow } from '@vamis/ui'
import CalendarWheel from '../display/CalendarWheel.vue'
import PickerFade from './PickerFade.vue'

export type DateCalendarView = 'days' | 'months' | 'years' | 'picker-year' | 'picker-month'

const props = withDefaults(
  defineProps<{
    cursor: Date
    view: DateCalendarView
    weeks: CalendarCell[][]
    weekLanes?: CalendarLane[][][]
    yearLabel: string
    monthLabel: string
    decade: { from: number; to: number; years: Array<{ year: number; muted: boolean }> }
    large?: boolean
    framed?: boolean
    selectedIso?: string
    rangeStartIso?: string
    rangeEndIso?: string
    hidePrevNav?: boolean
    hideNextNav?: boolean
    disabledIso?: (cell: CalendarCell) => boolean
    disabledMonth?: (year: number, month: number) => boolean
    disabledYear?: (year: number) => boolean
    todayActiveStyle?: unknown
    pickerYears?: CalendarPickerOption[]
    pickerMonths?: CalendarPickerOption[]
    tempYear?: number
    tempMonth?: number
  }>(),
  {
    framed: true,
    large: false,
    hidePrevNav: false,
    hideNextNav: false,
    weekLanes: () => [],
    pickerYears: () => [],
    pickerMonths: () => [],
    tempYear: 0,
    tempMonth: 0,
  },
)

const emit = defineEmits<{
  'shift-month': [delta: number]
  'shift-year': [delta: number]
  'pick-year': [year: number]
  'pick-month': [month: number]
  'pick-day': [cell: CalendarCell]
  'open-year': []
  'open-month': []
  'cancel-picker': []
  'confirm-picker': []
  'update:tempYear': [value: number]
  'update:tempMonth': [value: number]
  'open-schedule': [cell: CalendarCell, event: Event]
}>()

const pickerHeight = CALENDAR_PICKER_ITEM_HEIGHT * CALENDAR_PICKER_VISIBLE
const rootClass = computed(() => ({
  'is-large': props.large,
  'is-framed': props.framed !== false,
}))

function cellDisabled(cell: CalendarCell) {
  return props.disabledIso?.(cell) === true
}

function cellDayClass(cell: CalendarCell) {
  const iso = cell.iso
  const start = props.rangeStartIso || ''
  const end = props.rangeEndIso || ''
  const selected = props.selectedIso || ''
  const inMonth = cell.current
  const isStart = inMonth && !!start && iso === start
  const isEnd = inMonth && !!end && iso === end
  const spanning = inMonth && !!start && !!end && start !== end && iso >= start && iso <= end
  return {
    'is-other': !cell.current,
    'is-today': cell.today,
    'is-active': isStart || isEnd || (inMonth && !end && (iso === start || iso === selected)),
    'is-range': spanning,
    'is-range-start': spanning && isStart,
    'is-range-end': spanning && isEnd,
    'is-disabled': cellDisabled(cell),
  }
}

function monthDisabled(month: number) {
  return props.disabledMonth?.(props.cursor.getFullYear(), month) === true
}

function yearDisabled(year: number | undefined) {
  return year != null && props.disabledYear?.(year) === true
}

function onDayClick(cell: CalendarCell) {
  if (cellDisabled(cell)) return
  emit('pick-day', cell)
}

function onPickMonth(month: number) {
  if (monthDisabled(month)) return
  emit('pick-month', month)
}

function onPickYear(year: number | undefined) {
  if (year == null || yearDisabled(year)) return
  emit('pick-year', year)
}

function openSchedule(cell: CalendarCell, event: Event) {
  event.stopPropagation()
  emit('open-schedule', cell, event)
}

function applyTodayStyle(el: Element | null) {
  if (!el) return
  const style = (el as HTMLElement).style
  for (const { key, value, important } of calendarStyleEntries(props.todayActiveStyle)) {
    style.setProperty(key, value, important ? 'important' : undefined)
  }
}
</script>

<template>
  <div class="vamis-cal" :class="rootClass" @mousedown.prevent>
    <div v-if="view === 'picker-year' || view === 'picker-month'" class="vamis-cal-picker">
      <div class="vamis-cal-picker-bar">
        <a class="vamis-cal-picker-cancel" @click.prevent="emit('cancel-picker')">取消</a>
        <div class="vamis-cal-picker-title">{{ view === 'picker-year' ? '选择年' : '选择年月' }}</div>
        <a class="vamis-cal-picker-ok" @click.prevent="emit('confirm-picker')">确认</a>
      </div>
      <div class="vamis-cal-picker-columns" :style="{ height: `${pickerHeight}px` }">
        <CalendarWheel :model-value="tempYear" :options="pickerYears" @update:model-value="emit('update:tempYear', $event)" />
        <CalendarWheel
          v-if="view === 'picker-month'"
          :model-value="tempMonth"
          :options="pickerMonths"
          @update:model-value="emit('update:tempMonth', $event)"
        />
        <PickerFade class="vamis-cal-picker-mask" />
        <div class="vamis-cal-picker-frame" :style="{ height: `${CALENDAR_PICKER_ITEM_HEIGHT}px` }" />
      </div>
    </div>

    <table v-else>
      <thead>
        <tr>
          <th :colspan="view === 'days' ? 7 : 3">
            <div v-if="view === 'days'" class="vamis-cal-header">
              <a v-if="!hidePrevNav" class="vamis-cal-nav" aria-label="上一年" @click.prevent="emit('shift-year', -1)">
                <VamisDateArrow icon="right-double-arrow" left />
              </a>
              <span v-else class="vamis-cal-nav" aria-hidden="true" />
              <a v-if="!hidePrevNav" class="vamis-cal-nav" aria-label="上一月" @click.prevent="emit('shift-month', -1)">
                <VamisDateArrow left />
              </a>
              <span v-else class="vamis-cal-nav" aria-hidden="true" />
              <div class="vamis-cal-center">
                <a class="vamis-cal-switch" @click.prevent="emit('open-year')">{{ yearLabel }}</a>
                <a class="vamis-cal-switch" @click.prevent="emit('open-month')">{{ monthLabel }}</a>
              </div>
              <a v-if="!hideNextNav" class="vamis-cal-nav" aria-label="下一月" @click.prevent="emit('shift-month', 1)">
                <VamisDateArrow />
              </a>
              <span v-else class="vamis-cal-nav" aria-hidden="true" />
              <a v-if="!hideNextNav" class="vamis-cal-nav" aria-label="下一年" @click.prevent="emit('shift-year', 1)">
                <VamisDateArrow icon="right-double-arrow" />
              </a>
              <span v-else class="vamis-cal-nav" aria-hidden="true" />
            </div>
            <div v-else-if="view === 'months'" class="vamis-cal-header is-span">
              <a v-if="!hidePrevNav" class="vamis-cal-nav" aria-label="上一年" @click.prevent="emit('shift-year', -1)">
                <VamisDateArrow icon="right-double-arrow" left />
              </a>
              <span v-else class="vamis-cal-nav" aria-hidden="true" />
              <a class="vamis-cal-switch" @click.prevent="emit('open-year')">{{ yearLabel }}</a>
              <a v-if="!hideNextNav" class="vamis-cal-nav" aria-label="下一年" @click.prevent="emit('shift-year', 1)">
                <VamisDateArrow icon="right-double-arrow" />
              </a>
              <span v-else class="vamis-cal-nav" aria-hidden="true" />
            </div>
            <div v-else class="vamis-cal-header is-span">
              <a v-if="!hidePrevNav" class="vamis-cal-nav" aria-label="上十年" @click.prevent="emit('shift-year', -10)">
                <VamisDateArrow icon="right-double-arrow" left />
              </a>
              <span v-else class="vamis-cal-nav" aria-hidden="true" />
              <span class="vamis-cal-switch">{{ decade.from }}年 - {{ decade.to }}年</span>
              <a v-if="!hideNextNav" class="vamis-cal-nav" aria-label="下十年" @click.prevent="emit('shift-year', 10)">
                <VamisDateArrow icon="right-double-arrow" />
              </a>
              <span v-else class="vamis-cal-nav" aria-hidden="true" />
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
            :class="cellDayClass(cell)"
            @click="onDayClick(cell)"
          >
            <div v-if="large" class="vamis-cal-wrap">
              <div class="vamis-cal-head">
                <span :ref="(el) => cell.today && applyTodayStyle(el as Element | null)">{{ cell.day }}</span>
              </div>
              <div
                v-for="(lane, li) in weekLanes[wi]?.[di] || []"
                :key="li"
                class="vamis-cal-chip"
                :class="[lane.className, { 'is-ph': lane.placeholder }]"
                :style="{ width: `${lane.width}00%` }"
                @click="openSchedule(cell, $event)"
              >
                <div class="vamis-cal-chip-text">{{ lane.content }}</div>
              </div>
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
            :class="{
              'is-active': (row - 1) * 3 + col - 1 === cursor.getMonth(),
              'is-disabled': monthDisabled((row - 1) * 3 + col - 1),
            }"
            @click="onPickMonth((row - 1) * 3 + col - 1)"
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
              'is-disabled': yearDisabled(decade.years[(row - 1) * 3 + col - 1]?.year),
            }"
            @click="onPickYear(decade.years[(row - 1) * 3 + col - 1]?.year)"
          >
            <span>{{ decade.years[(row - 1) * 3 + col - 1].year }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
