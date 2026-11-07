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
const pickerMaskSize = (pickerHeight - CALENDAR_PICKER_ITEM_HEIGHT) / 2
const rootClass = computed(() => ({
  'is-large': props.large,
  'is-framed': props.framed !== false,
}))

function cellDisabled(cell: CalendarCell) {
  return props.disabledIso?.(cell) === true
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
        <div class="vamis-cal-picker-mask" :style="{ backgroundSize: `100% ${pickerMaskSize}px` }" />
        <div class="vamis-cal-picker-frame" :style="{ height: `${CALENDAR_PICKER_ITEM_HEIGHT}px` }" />
      </div>
    </div>

    <table v-else>
      <thead>
        <tr>
          <th :colspan="view === 'days' ? 7 : 3">
            <div v-if="view === 'days'" class="vamis-cal-header">
              <a class="vamis-cal-nav" aria-label="上一年" @click.prevent="emit('shift-year', -1)">
                <VamisDateArrow icon="right-double-arrow" left />
              </a>
              <a class="vamis-cal-nav" aria-label="上一月" @click.prevent="emit('shift-month', -1)">
                <VamisDateArrow left />
              </a>
              <div class="vamis-cal-center">
                <a class="vamis-cal-switch" @click.prevent="emit('open-year')">{{ yearLabel }}</a>
                <a class="vamis-cal-switch" @click.prevent="emit('open-month')">{{ monthLabel }}</a>
              </div>
              <a class="vamis-cal-nav" aria-label="下一月" @click.prevent="emit('shift-month', 1)">
                <VamisDateArrow />
              </a>
              <a class="vamis-cal-nav" aria-label="下一年" @click.prevent="emit('shift-year', 1)">
                <VamisDateArrow icon="right-double-arrow" />
              </a>
            </div>
            <div v-else-if="view === 'months'" class="vamis-cal-header is-span">
              <a class="vamis-cal-nav" aria-label="上一年" @click.prevent="emit('shift-year', -1)">
                <VamisDateArrow icon="right-double-arrow" left />
              </a>
              <a class="vamis-cal-switch" @click.prevent="emit('open-year')">{{ yearLabel }}</a>
              <a class="vamis-cal-nav" aria-label="下一年" @click.prevent="emit('shift-year', 1)">
                <VamisDateArrow icon="right-double-arrow" />
              </a>
            </div>
            <div v-else class="vamis-cal-header is-span">
              <a class="vamis-cal-nav" aria-label="上十年" @click.prevent="emit('shift-year', -10)">
                <VamisDateArrow icon="right-double-arrow" left />
              </a>
              <span class="vamis-cal-switch">{{ decade.from }}年 - {{ decade.to }}年</span>
              <a class="vamis-cal-nav" aria-label="下十年" @click.prevent="emit('shift-year', 10)">
                <VamisDateArrow icon="right-double-arrow" />
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
              'is-active': !!selectedIso && cell.iso === selectedIso,
              'is-disabled': cellDisabled(cell),
            }"
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

<style scoped>
/* 对齐 Amis DateCalendar + rdtPicker。不用 helper grid-cols-7（那是 6 列）。 */
.vamis-cal {
  position: relative;
  box-sizing: border-box;
  display: block;
  width: 240px;
  max-width: 100%;
  overflow: visible;
  /* 对齐 Amis `_date.scss` `.rdt .rdtPicker { padding: 0 }`，弹层内日历 240×290。 */
  padding: 0;
  border: 0;
  background: var(--cal-bg);
  font-size: 12px;
  color: var(--cal-fg);
  user-select: none;
}
.vamis-cal.is-framed {
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.vamis-cal.is-large {
  display: block;
  width: 100%;
  padding: 0;
  overflow: visible;
}
.vamis-cal table {
  width: 100%;
  margin: 0;
  padding: 0 12px;
  border-collapse: separate;
  border-spacing: 0 8px;
  table-layout: auto;
}
.vamis-cal.is-large table {
  border-collapse: collapse;
  border-spacing: 0;
  table-layout: fixed;
}
/* Tailwind preflight 把 td/th padding 清成 0；Amis 吃 UA `padding: 1px` + content-box，格子才是 26px。 */
.vamis-cal:not(.is-large) th,
.vamis-cal:not(.is-large) td {
  box-sizing: content-box;
  padding: 1px;
}
/* 对齐 Amis `.rdtHeader`：table + table-cell middle。不要 flex 对 24px 行盒居中，汉字实际只有 ~16.5px。 */
.vamis-cal-header {
  display: table;
  table-layout: fixed;
  border-collapse: separate;
  width: 100%;
  height: 40px;
  margin-top: -8px;
}
.vamis-cal-header > * {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
.vamis-cal.is-large .vamis-cal-header {
  margin-top: 0;
}
.vamis-cal-switch {
  font-weight: 400;
  font-size: 14px;
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
  width: 16px;
  padding: 0;
  color: var(--select-caret-color);
  cursor: pointer;
  text-decoration: none;
  font-size: 18px;
  font-family: auto;
  font-weight: 400;
}
.vamis-cal-nav:hover {
  color: var(--primary);
  text-decoration: none;
}
.vamis-cal-line {
  position: absolute;
  top: 40px;
  right: 0;
  left: 0;
  height: 1px;
  background: var(--border);
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
  border: 1px solid var(--border);
  background: var(--cal-bg);
}
.vamis-cal-day {
  position: relative;
  display: inline-block;
  box-sizing: content-box;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: var(--radius);
}
.vamis-cal td.is-other .vamis-cal-day,
.vamis-cal td.is-other.vamis-cal-pick,
.vamis-cal.is-large td.is-other .vamis-cal-head {
  /* Amis rdtOld/rdtNew：--inputDate-disabled-option-color */
  color: var(--cal-other);
}
.vamis-cal td.is-today .vamis-cal-day,
.vamis-cal.is-large td.is-today .vamis-cal-head span {
  border: 1px solid var(--primary);
}
.vamis-cal td.is-active .vamis-cal-day,
.vamis-cal td.is-active.vamis-cal-pick span,
.vamis-cal.is-large td.is-active .vamis-cal-head span {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
.vamis-cal td:not(.is-disabled):hover .vamis-cal-day,
.vamis-cal td.vamis-cal-pick:not(.is-disabled):hover span,
.vamis-cal.is-large td:not(.is-disabled):hover .vamis-cal-head span {
  background: var(--cal-cell-hover-bg);
  color: var(--cal-cell-hover-fg);
}
.vamis-cal td.is-active:not(.is-disabled):hover .vamis-cal-day,
.vamis-cal td.is-active.vamis-cal-pick:not(.is-disabled):hover span,
.vamis-cal.is-large td.is-active:not(.is-disabled):hover .vamis-cal-head span {
  background: var(--primary);
  color: var(--primary-foreground);
}
.vamis-cal td.is-disabled {
  cursor: not-allowed;
}
.vamis-cal td.is-disabled .vamis-cal-day,
.vamis-cal td.is-disabled:hover .vamis-cal-day,
.vamis-cal td.is-disabled.vamis-cal-pick span,
.vamis-cal td.is-disabled.vamis-cal-pick:hover span {
  color: var(--cal-other);
  background: transparent;
  opacity: 0.55;
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
/* Amis --secondary 是 text-5；shadcn --secondary 太浅，白字看不见。只盖日历条/点，走 --cal-bar。 */
.vamis-cal-chip.bg-secondary,
.vamis-cal-dot.bg-secondary {
  background-color: var(--cal-bar);
}
.vamis-cal-wrap {
  position: absolute;
  z-index: 1;
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
  color: var(--cal-chip-fg);
  text-align: left;
  cursor: pointer;
}
/* 对齐 Amis .ScheduleCalendar-text-overflow：绝对定位抽出文字，父级宽度才钉在格子上，ellipsis 才会出现。 */
.vamis-cal-chip-text {
  position: absolute;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 对齐 Amis 占位：bg-transparent，不能 visibility:hidden，否则点到后一天会点中前一天溢出的条。 */
.vamis-cal-chip.is-ph {
  z-index: 11;
  background-color: transparent;
  cursor: pointer;
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
  background: var(--cal-bg);
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
  color: var(--cal-picker-cancel);
}
.vamis-cal-picker-ok {
  color: var(--primary);
}
.vamis-cal-picker-title {
  max-width: 50%;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--cal-picker-title);
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
  background-image: linear-gradient(
      180deg,
      color-mix(in srgb, var(--cal-bg) 90%, transparent),
      color-mix(in srgb, var(--cal-bg) 40%, transparent)
    ),
    linear-gradient(
      0deg,
      color-mix(in srgb, var(--cal-bg) 90%, transparent),
      color-mix(in srgb, var(--cal-bg) 40%, transparent)
    );
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
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  transform: scale(0.5);
}
</style>
