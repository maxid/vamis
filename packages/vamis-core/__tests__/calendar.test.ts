import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CALENDAR_SCHEDULE_CLASS_NAMES,
  CALENDAR_WEEKDAYS,
  calendarDecade,
  calendarDefaultScheduleAction,
  calendarLaneMore,
  calendarLargeMode,
  calendarMonthCells,
  calendarMonthLabel,
  calendarMonthTitle,
  calendarParseDate,
  calendarPickerIndexFromClick,
  calendarPickerMonthOptions,
  calendarPickerYearOptions,
  calendarScheduleAction,
  calendarSchedulePayload,
  calendarSchedules,
  calendarWeekLanes,
  calendarWeeks,
  calendarYearLabel,
  calendarStyleEntries,
  eventsOnDay,
  isoDay,
} from '../src/utils/calendar'

describe('calendar value and schedules', () => {
  it('parses unix seconds, date strings, and NOW()', () => {
    expect(calendarParseDate('1638288000').getTime()).toBe(1638288000 * 1000)
    const fromText = calendarParseDate('2021-12-11 05:14:00')
    expect(isoDay(fromText)).toBe('2021-12-11')
    const now = calendarParseDate('NOW()')
    expect(Math.abs(now.getTime() - Date.now()) < 2000).toBe(true)
    expect(calendarMonthTitle(new Date(2021, 11, 1))).toBe('2021年12月')
  })

  it('builds a Monday-first 7×6 grid including adjacent months', () => {
    expect(CALENDAR_WEEKDAYS).toEqual(['一', '二', '三', '四', '五', '六', '日'])
    const cells = calendarMonthCells(new Date(2021, 11, 1))
    expect(cells).toHaveLength(42)
    expect(isoDay(cells[0].date)).toBe('2021-11-29')
    expect(cells[0].current).toBe(false)
    expect(isoDay(cells[2].date)).toBe('2021-12-01')
    expect(cells[2].current).toBe(true)
    expect(cells[2].day).toBe(1)
    expect(isoDay(cells[41].date)).toBe('2022-01-09')
    expect(cells[41].current).toBe(false)
  })

  it('resolves schedules from array or ${} and cycles default classNames', () => {
    expect(CALENDAR_SCHEDULE_CLASS_NAMES).toEqual([
      'bg-warning',
      'bg-danger',
      'bg-success',
      'bg-info',
      'bg-secondary',
    ])
    const listed = calendarSchedules({
      schedules: [
        { startTime: '2021-12-11 05:14:00', endTime: '2021-12-11 06:14:00', content: '这是一个日程1' },
        {
          startTime: '2021-12-21 05:14:00',
          endTime: '2021-12-22 05:14:00',
          content: '这是一个日程2',
          className: 'bg-success',
        },
      ],
    })
    expect(listed[0].className).toBe('bg-warning')
    expect(listed[1].className).toBe('bg-success')
    const fromData = calendarSchedules(
      { schedules: '${schedules}' },
      {
        schedules: [
          { startTime: '2021-12-11 05:14:00', endTime: '2021-12-11 06:14:00', content: '这是一个日程1' },
        ],
      },
    )
    expect(fromData).toHaveLength(1)
    expect(fromData[0].content).toBe('这是一个日程1')
    expect(calendarLargeMode({})).toBe(false)
    expect(calendarLargeMode({ largeMode: true })).toBe(true)
  })

  it('matches multi-day schedules on each day and parses todayActiveStyle !important', () => {
    const items = calendarSchedules({
      schedules: [
        { startTime: '2021-12-21 05:14:00', endTime: '2021-12-22 05:14:00', content: '这是一个日程2' },
      ],
    })
    expect(eventsOnDay(items, '2021-12-21')).toHaveLength(1)
    expect(eventsOnDay(items, '2021-12-22')).toHaveLength(1)
    expect(eventsOnDay(items, '2021-12-20')).toHaveLength(0)
    const entries = calendarStyleEntries({
      backgroundColor: '#ef4444 !important',
      color: '#f8f9fa',
      border: 'none',
      borderRadius: '15px',
    })
    expect(entries).toEqual([
      { key: 'background-color', value: '#ef4444', important: true },
      { key: 'color', value: '#f8f9fa', important: false },
      { key: 'border', value: 'none', important: false },
      { key: 'border-radius', value: '15px', important: false },
    ])
  })

  it('largeMode draws a spanning bar on the start day and placeholders on the rest of the week', () => {
    const items = calendarSchedules({
      schedules: [
        { startTime: '2021-12-10 23:59:59', endTime: '2021-12-11 00:00:00', content: '这是一个日程1' },
        { startTime: '2021-12-12 00:00:00', endTime: '2021-12-13 00:00:01', content: '这是一个日程2' },
      ],
    })
    const weeks = calendarWeeks(calendarMonthCells(new Date(2021, 11, 1), items))
    const weekOf10 = calendarWeekLanes(weeks[1], items)
    expect(isoDay(weeks[1][4].date)).toBe('2021-12-10')
    expect(weekOf10[4][0]).toMatchObject({ content: '这是一个日程1', width: 2, placeholder: false })
    expect(weekOf10[5][0]).toMatchObject({ placeholder: true, width: 1 })
    expect(weekOf10[6][0]).toMatchObject({ content: '这是一个日程2', width: 1, placeholder: false })

    const weekOf13 = calendarWeekLanes(weeks[2], items)
    expect(isoDay(weeks[2][0].date)).toBe('2021-12-13')
    expect(weekOf13[0][0]).toMatchObject({ content: '这是一个日程2', width: 1, placeholder: false })
  })

  it('largeMode keeps overlapping events on stable lanes and shows leftover as 更多', () => {
    const items = calendarSchedules({
      schedules: [
        { startTime: '2021-12-20 05:14:00', endTime: '2021-12-21 05:14:00', content: '这是一个日程3' },
        { startTime: '2021-12-21 05:14:00', endTime: '2021-12-22 05:14:00', content: '这是一个日程4' },
        { startTime: '2021-12-22 02:14:00', endTime: '2021-12-23 05:14:00', content: '这是一个日程5' },
        { startTime: '2021-12-22 02:14:00', endTime: '2021-12-22 05:14:00', content: '这是一个日程6' },
        { startTime: '2021-12-22 02:14:00', endTime: '2021-12-22 05:14:00', content: '这是一个日程7' },
      ],
    })
    const weeks = calendarWeeks(calendarMonthCells(new Date(2021, 11, 1), items))
    const week = calendarWeekLanes(weeks[3], items)
    expect(isoDay(weeks[3][0].date)).toBe('2021-12-20')
    expect(week[0][0]).toMatchObject({ content: '这是一个日程3', width: 2, placeholder: false })
    expect(week[1][0]).toMatchObject({ placeholder: true })
    expect(week[1][1]).toMatchObject({ content: '这是一个日程4', width: 2, placeholder: false })
    expect(week[2][0]).toMatchObject({ content: '这是一个日程5', width: 2, placeholder: false })
    expect(week[2][1]).toMatchObject({ placeholder: true })
    expect(week[2][2]).toMatchObject({ content: '这是一个日程6', width: 1, placeholder: false })
    expect(week[3][0]).toMatchObject({ placeholder: true })
    expect(calendarLaneMore(weeks[3][2])).toBe(1)
    expect(eventsOnDay(items, '2021-12-22').map((item) => item.content)).toEqual([
      '这是一个日程4',
      '这是一个日程5',
      '这是一个日程6',
      '这是一个日程7',
    ])
    expect(eventsOnDay(items, '2021-12-23').map((item) => item.content)).toEqual(['这是一个日程5'])
    expect(
      calendarSchedulePayload(eventsOnDay(items, '2021-12-23'), new Date(2021, 11, 23)).scheduleData,
    ).toEqual([
      expect.objectContaining({
        content: '这是一个日程5',
        time: '2021-12-22 02:14:00 - 2021-12-23 05:14:00',
      }),
    ])
  })

  it('splits header into year/month labels and a 12-cell decade', () => {
    const cursor = new Date(2021, 11, 1)
    expect(calendarYearLabel(cursor)).toBe('2021年')
    expect(calendarMonthLabel(cursor)).toBe('12月')
    const decade = calendarDecade(cursor)
    expect(decade.from).toBe(2020)
    expect(decade.to).toBe(2029)
    expect(decade.years).toHaveLength(12)
    expect(decade.years[0]).toEqual({ year: 2019, muted: true })
    expect(decade.years[11]).toEqual({ year: 2030, muted: true })
    expect(decade.years[1]).toEqual({ year: 2020, muted: false })
  })

  it('builds schedule dialog payload and default/custom scheduleAction', () => {
    const items = calendarSchedules({
      schedules: [
        { startTime: '2021-12-11 05:14:00', endTime: '2021-12-11 06:14:00', content: '这是一个日程1' },
      ],
    })
    const payload = calendarSchedulePayload(items, new Date(2021, 11, 11))
    expect(payload.scheduleData[0]).toMatchObject({
      content: '这是一个日程1',
      time: '2021-12-11 05:14:00 - 2021-12-11 06:14:00',
    })
    const fallback = calendarDefaultScheduleAction()
    expect(fallback.actionType).toBe('dialog')
    expect((fallback.dialog as { title: string }).title).toBe('日程')
    expect(calendarScheduleAction({}).actionType).toBe('dialog')
    expect(calendarScheduleAction({ scheduleAction: { actionType: 'drawer' } }).actionType).toBe('drawer')
  })

  it('maps a wheel click to the visible row like Amis PickerColumn', () => {
    expect(calendarPickerIndexFromClick(10, 100, 201)).toBe(98)
    expect(calendarPickerIndexFromClick(96, 100, 201)).toBe(100)
    expect(calendarPickerIndexFromClick(144, 100, 201)).toBe(101)
    expect(calendarPickerIndexFromClick(10, 0, 201)).toBe(0)
    expect(calendarPickerIndexFromClick(200, 200, 201)).toBe(200)
  })

  it('builds wheel picker options with 年/月 suffixes like Amis', () => {
    const cursor = new Date(2021, 11, 1)
    const years = calendarPickerYearOptions(cursor)
    expect(years[100]).toEqual({ value: 2021, text: '2021年' })
    expect(calendarPickerYearOptions(cursor, 100, false)[100]).toEqual({
      value: 2021,
      text: '2021',
    })
    const months = calendarPickerMonthOptions()
    expect(months).toHaveLength(12)
    expect(months[7]).toEqual({ value: 7, text: '08月' })
    expect(months[11]).toEqual({ value: 11, text: '12月' })
  })

  it('clips largeMode chip text with Amis inner ellipsis', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const vue = readFileSync(resolve(here, '../../vamis/src/renderers/display/Calendar.vue'), 'utf8')
    expect(vue).toContain('class="vamis-cal-chip-text"')
    expect(vue).toContain('.vamis-cal-chip-text {')
    expect(vue).toContain('position: absolute')
    expect(vue).toContain('text-overflow: ellipsis')
    expect(vue).toContain('@click="openSchedule(cell, $event)"')
    expect(vue).not.toContain('!lane.placeholder && openSchedule')
    expect(vue).not.toContain('visibility: hidden')
  })
})
