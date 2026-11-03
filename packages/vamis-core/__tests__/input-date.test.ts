import { describe, expect, it } from 'vitest'
import { dayjs } from '../src/utils/dayjs'
import {
  displayInputDateValue,
  filterDate,
  formatInputDate,
  inputDateClearable,
  inputDateCloseOnSelect,
  inputDateDefaultStored,
  inputDateDisplayFormat,
  inputDateMinMax,
  inputDatePlaceholder,
  inputDateResetValue,
  inputDateSetDataValue,
  inputDateShowsTime,
  inputDateTimeFormat,
  inputDateValueFormat,
  inputDateViewMode,
  isInputDateDisabled,
  parseInputDateValue,
  resolveInputDateShortcuts,
  storeInputDateValue,
} from '../src/utils/input-date'

const NOW = new Date('2020-06-11T16:06:58+08:00')
const TS = '1591862818'

describe('input-date formats', () => {
  it('defaults value format to X and display to YYYY-MM-DD', () => {
    expect(inputDateValueFormat({ type: 'input-date' })).toBe('X')
    expect(inputDateDisplayFormat({ type: 'input-date' })).toBe('YYYY-MM-DD')
    expect(inputDateValueFormat({ type: 'input-date', valueFormat: 'YYYY-MM-DD' })).toBe('YYYY-MM-DD')
    expect(inputDateDisplayFormat({ type: 'input-date', inputFormat: 'YYYY年MM月DD日' })).toBe('YYYY年MM月DD日')
    expect(inputDateDisplayFormat({ type: 'input-datetime' })).toBe('YYYY-MM-DD HH:mm:ss')
    expect(inputDateValueFormat({ type: 'input-time' })).toBe('X')
    expect(inputDateDisplayFormat({ type: 'input-time' })).toBe('HH:mm')
    expect(inputDateViewMode({ type: 'input-time' })).toBe('time')
    expect(inputDateShowsTime({ type: 'input-datetime' })).toBe(true)
    expect(inputDateTimeFormat({ type: 'input-datetime' })).toBe('HH:mm:ss')
    expect(inputDatePlaceholder({ type: 'input-date' })).toBe('请选择日期')
    expect(inputDateClearable({})).toBe(true)
    expect(inputDateClearable({ clearable: false })).toBe(false)
    expect(inputDateCloseOnSelect({})).toBe(true)
  })
})

describe('filterDate', () => {
  it('parses unix seconds with format X', () => {
    const date = filterDate(TS, {}, 'X', false, NOW)
    expect(date?.format('YYYY-MM-DD')).toBe('2020-06-11')
  })

  it('parses relative +1days / today / -1days from start of day', () => {
    expect(filterDate('+1days', {}, 'X', false, NOW)?.format('YYYY-MM-DD')).toBe('2020-06-12')
    expect(filterDate('-1days', {}, 'X', false, NOW)?.format('YYYY-MM-DD')).toBe('2020-06-10')
    expect(filterDate('today', {}, 'X', false, NOW)?.format('YYYY-MM-DD')).toBe('2020-06-11')
    expect(filterDate('now', {}, 'X', false, NOW)?.format('YYYY-MM-DD HH:mm')).toBe(
      dayjs(NOW).format('YYYY-MM-DD HH:mm'),
    )
  })

  it('resolves $end / $start from data', () => {
    const end = filterDate('$end', { end: TS }, 'X', false, NOW)
    expect(end?.format('YYYY-MM-DD')).toBe('2020-06-11')
    expect(filterDate('$end', { end: '' }, 'X', false, NOW)).toBeUndefined()
  })

  it('stores default relative value as format X', () => {
    const stored = inputDateDefaultStored({ type: 'input-date', value: '+1days' }, {}, '+1days', NOW)
    expect(stored).toBe(dayjs(NOW).startOf('day').add(1, 'day').format('X'))
  })
})

describe('minDate / maxDate / disabledDate', () => {
  it('disables days before minDate and after maxDate', () => {
    const schema = { type: 'input-date', minDate: '-1days', maxDate: '+1days' }
    const yesterday = dayjs(NOW).startOf('day').add(-1, 'day')
    const today = dayjs(NOW).startOf('day')
    const twoAgo = dayjs(NOW).startOf('day').add(-2, 'day')
    const twoLater = dayjs(NOW).startOf('day').add(2, 'day')
    expect(isInputDateDisabled(twoAgo, schema, {}, false, NOW)).toBe(true)
    expect(isInputDateDisabled(yesterday, schema, {}, false, NOW)).toBe(false)
    expect(isInputDateDisabled(today, schema, {}, false, NOW)).toBe(false)
    expect(isInputDateDisabled(twoLater, schema, {}, false, NOW)).toBe(true)
  })

  it('links start/end with $ templates', () => {
    const { max } = inputDateMinMax({ type: 'input-date', maxDate: '$end' }, { end: TS }, NOW)
    expect(max?.format('YYYY-MM-DD')).toBe('2020-06-11')
    const { min } = inputDateMinMax({ type: 'input-date', minDate: '$start' }, { start: TS }, NOW)
    expect(min?.format('YYYY-MM-DD')).toBe('2020-06-11')
  })

  it('runs disabledDate only when trusted', () => {
    const schema = {
      type: 'input-date',
      disabledDate: 'return currentDate.day() == 1 || currentDate.day() == 0 || currentDate.day() == 6',
    }
    const monday = dayjs('2020-06-08')
    const tuesday = dayjs('2020-06-09')
    expect(isInputDateDisabled(monday, schema, {}, false)).toBe(false)
    expect(isInputDateDisabled(monday, schema, {}, true)).toBe(true)
    expect(isInputDateDisabled(tuesday, schema, {}, true)).toBe(false)
  })
})

describe('shortcuts', () => {
  it('resolves yesterday / today / tomorrow and Ndaysago', () => {
    const items = resolveInputDateShortcuts(['yesterday', 'today', 'tomorrow', '2daysago'], {}, NOW)
    expect(items.map((item) => item.label)).toEqual(['昨天', '今天', '明天', '2天前'])
    expect(items[0].date.format('YYYY-MM-DD')).toBe('2020-06-10')
    expect(items[1].date.format('YYYY-MM-DD')).toBe('2020-06-11')
    expect(items[2].date.format('YYYY-MM-DD')).toBe('2020-06-12')
    expect(items[3].date.format('YYYY-MM-DD')).toBe('2020-06-09')
  })

  it('accepts comma string and expression objects', () => {
    const fromString = resolveInputDateShortcuts('today,yesterday', {}, NOW)
    expect(fromString).toHaveLength(2)
    const custom = resolveInputDateShortcuts(
      [{ label: '前天', date: "${STARTOF(DATEMODIFY(NOW(), -2, 'day'))}" }],
      {},
      NOW,
    )
    expect(custom[0]?.label).toBe('前天')
    expect(custom[0]?.date.isValid()).toBe(true)
  })
})

describe('store / display / actions helpers', () => {
  it('stores X and displays YYYY-MM-DD', () => {
    const schema = { type: 'input-date' }
    const date = parseInputDateValue(TS, schema, {})
    expect(storeInputDateValue(date, schema)).toBe(TS)
    expect(displayInputDateValue(TS, { type: 'input-date', inputFormat: 'YYYY年MM月DD日' })).toBe('2020年06月11日')
    expect(displayInputDateValue(TS, { type: 'input-date', format: 'YYYY-MM-DD' })).toBe('2020-06-11')
  })

  it('formats utc YYYY-MM-DD from a local midnight that crosses the date line', () => {
    const local = dayjs('2020-06-11T00:00:00')
    const utcText = formatInputDate(local, 'YYYY-MM-DD', true)
    expect(utcText).toBe(dayjs.utc(local).format('YYYY-MM-DD'))
  })

  it('reads setData payload and reset fallback', () => {
    expect(inputDateSetDataValue({ value: TS })).toBe(TS)
    expect(inputDateSetDataValue({ date: '1' }, 'date')).toBe('1')
    expect(inputDateResetValue({ resetValue: '0' }, TS)).toBe(TS)
    expect(inputDateResetValue({ resetValue: '0' }, undefined)).toBe('0')
    expect(inputDateResetValue({}, undefined)).toBe('')
  })
})
