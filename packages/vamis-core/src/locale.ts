import type { PlainObject } from './types'

export type LocaleConfig = Record<string, string>
export type TranslateFn = (str: string, data?: PlainObject) => string

const locales: Record<string, LocaleConfig> = {}
let defaultLocale = 'zh-CN'

export function normalizeLocale(locale?: string): string {
  const raw = locale || defaultLocale
  if (raw === 'en') return 'en-US'
  if (raw === 'zh' || raw === 'cn') return 'zh-CN'
  return raw.replace('_', '-')
}

export function localeFormatter(str: string, data: PlainObject = {}): string {
  if (!str.includes('{{')) return str
  return str.replace(/(\\)?\{\{([^{}]+?)\}\}/g, (whole, escape: string | undefined, rawKey: string) => {
    if (escape) return whole.slice(1)
    const key = rawKey.trim()
    const value = key.split('.').reduce<unknown>((current, part) => {
      if (!current || typeof current !== 'object') return undefined
      return (current as PlainObject)[part]
    }, data)
    return value == null ? '' : String(value)
  })
}

export function registerLocale(name: string, config: LocaleConfig): void {
  extendLocale(name, config)
}

export function extendLocale(name: string, config: LocaleConfig, cover = true): void {
  const locale = normalizeLocale(name)
  locales[locale] = cover
    ? { ...(locales[locale] || {}), ...config }
    : { ...config, ...(locales[locale] || {}) }
}

export function removeLocaleData(name: string, key: string[] | string): void {
  if (Array.isArray(key)) {
    for (const item of key) removeLocaleData(name, item)
    return
  }
  delete locales[normalizeLocale(name)]?.[key]
}

export function getDefaultLocale(): string {
  return defaultLocale
}

export function setDefaultLocale(locale: string): void {
  defaultLocale = normalizeLocale(locale)
}

export function makeTranslator(locale?: string): TranslateFn {
  const normalized = normalizeLocale(locale)
  return (str, data) => {
    if (!str || typeof str !== 'string') return str
    const value =
      locales[normalized]?.[str] ??
      locales[defaultLocale]?.[str] ??
      locales['zh-CN']?.[str] ??
      str
    return localeFormatter(value, data)
  }
}

registerLocale('zh-CN', {
  'Alert.info': '系统消息',
  'Calendar.year': 'YYYY年',
  'Calendar.month': '{{month}}月',
  'Date.placeholder': '请选择日期',
  'DateTime.placeholder': '请选择日期以及时间',
  'Time.placeholder': '请选择时间',
  'Date.titleYear': '选择年',
  'Date.titleMonth': '选择年月',
  'Date.weekday.1': '一',
  'Date.weekday.2': '二',
  'Date.weekday.3': '三',
  'Date.weekday.4': '四',
  'Date.weekday.5': '五',
  'Date.weekday.6': '六',
  'Date.weekday.7': '日',
  'Dialog.title': '弹框',
  'Form.submit': '提交',
  'Form.submitting': '提交中…',
  'Form.title': '表单',
  'Form.validateFailed': '依赖的部分字段没有通过验证',
  'Form.saveSuccess': '保存成功',
  'Form.saveFailed': '保存失败',
  'Form.submitWithoutApi': '已提交（未配置 api）',
  'Pagination.select': '{{count}}条/页',
  'Pagination.goto': '跳转至',
  'Pagination.go': '前往',
  'Pagination.prev': '上一页',
  'Pagination.next': '下一页',
  'Pagination.totalCount': '共 {{total}} 条',
  'Pagination.totalPage': '共 {{lastPage}} 页',
  'Select.placeholder': '请选择',
  cancel: '取消',
  confirm: '确认',
  'placeholder.enter': '请输入',
  'placeholder.noData': '暂无数据',
  reset: '重置',
  save: '保存',
  saveSuccess: '保存成功',
  saveFailed: '保存失败',
})

registerLocale('en-US', {
  'Alert.info': 'System Info',
  'Calendar.year': 'YYYY',
  'Calendar.month': '{{month}}',
  'Date.placeholder': 'Select Date',
  'DateTime.placeholder': 'Select Datetime',
  'Time.placeholder': 'Select Time',
  'Date.titleYear': 'Select year',
  'Date.titleMonth': 'Select month and year',
  'Date.weekday.1': 'Mo',
  'Date.weekday.2': 'Tu',
  'Date.weekday.3': 'We',
  'Date.weekday.4': 'Th',
  'Date.weekday.5': 'Fr',
  'Date.weekday.6': 'Sa',
  'Date.weekday.7': 'Su',
  'Dialog.title': 'Title',
  'Form.submit': 'Submit',
  'Form.submitting': 'Submitting…',
  'Form.title': 'Form',
  'Form.validateFailed': 'Form input validation failed',
  'Form.saveSuccess': 'Saved successfully',
  'Form.saveFailed': 'Save failed',
  'Form.submitWithoutApi': 'Submitted (no api configured)',
  'Pagination.select': '{{count}} items/page',
  'Pagination.goto': 'Go to',
  'Pagination.go': 'GO',
  'Pagination.prev': 'Previous page',
  'Pagination.next': 'Next page',
  'Pagination.totalCount': 'total {{total}} items',
  'Pagination.totalPage': 'total {{lastPage}} pages',
  'Select.placeholder': 'Select',
  cancel: 'Cancel',
  confirm: 'Confirm',
  'placeholder.enter': 'Enter',
  'placeholder.noData': 'No data',
  reset: 'Reset',
  save: 'Save',
  saveSuccess: 'Saved successfully',
  saveFailed: 'Save failed',
  'validate.equals': 'value must be $1',
  'validate.equalsField': 'value must be $1',
  'validate.gt': 'Please enter a value greater than $1',
  'validate.isAlpha': 'Please enter letters',
  'validate.isAlphanumeric': 'Please enter letters or numbers',
  'validate.isEmail': 'Email format is incorrect',
  'validate.isFloat': 'Please enter a floating point value',
  'validate.isId': 'Invalid ID card number',
  'validate.isInt': 'Please enter an integer number',
  'validate.isJson': 'Invalid JSON format.',
  'validate.isLength': 'Please make sure the length of contents is $1',
  'validate.isNumeric': 'Please enter a number',
  'validate.isPhoneNumber': 'Invalid phone number',
  'validate.isRequired': 'This is required',
  'validate.isTelNumber': 'Invalid telephone number',
  'validate.isUrl': 'Incorrect URL format',
  'validate.isUrlPath': 'You can only enter letters, numbers, `-` and `_`.',
  'validate.isWords': 'Please enter a word',
  'validate.isZipcode': 'Invalid postal address',
  'validate.lt': 'Please enter a value less than $1',
  'validate.matchRegexp': 'The format is not correct. Please enter content matching `${1|raw}`.',
  'validate.maximum': 'The input value exceeds the maximum value of $1',
  'validate.maxLength': 'Please do not enter more than $1 characters',
  'validate.array.maxLength': 'The number of members cannot exceed $1',
  'validate.minimum': 'The input value is lower than the minimum value of $1',
  'validate.minLength': 'Please enter more, at least $1 characters.',
  'validate.array.minLength': 'Please add more members, at least $1 members',
  'validate.notEmptyString': 'Please do not enter only blank characters',
  'validate.isDateTimeSame': 'Please enter the same date value as $1',
  'validate.isDateTimeBefore': 'Please enter a date value before $1',
  'validate.isDateTimeAfter': 'Please enter a date value after $1',
  'validate.isDateTimeSameOrBefore': 'Please enter a date value that is the same as or before $1',
  'validate.isDateTimeSameOrAfter': 'Please enter a date value that is the same as or after $1',
  'validate.isDateTimeBetween': 'Please enter a date value between $1 and $2',
  'validate.isTimeSame': 'Please enter the same time value as $1',
  'validate.isTimeBefore': 'Please enter a time value before $1',
  'validate.isTimeAfter': 'Please enter a time value after $1',
  'validate.isTimeSameOrBefore': 'Please enter a time value that is the same as or before $1',
  'validate.isTimeSameOrAfter': 'Please enter a time value that is the same as or after $1',
  'validate.isTimeBetween': 'Please enter a time value between $1 and $2',
  'validate.isVariableName': 'Please enter a valid variable name',
})
