import type { SchemaObject } from './types'
import type { PlainObject } from './types'
import { formItemRequired } from './utils/form-item'

export type ValidationRules = Record<string, unknown>

function parseScalar(raw: string): unknown {
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return raw
}

export function parseValidations(schema: SchemaObject): ValidationRules {
  const rules: ValidationRules = {}
  if (schema.required === true) rules.required = true
  if (schema.minLength != null) rules.minLength = schema.minLength
  if (schema.maxLength != null) rules.maxLength = schema.maxLength
  if (schema.maximum != null) rules.maximum = schema.maximum
  if (schema.minimum != null) rules.minimum = schema.minimum
  if (schema.matchRegexp) rules.matchRegexp = schema.matchRegexp

  const type = String(schema.type || '')
  if (type === 'input-email') rules.isEmail = true
  if (type === 'input-url') rules.isUrl = true

  const raw = schema.validations
  if (typeof raw === 'string' && raw.trim()) {
    for (const part of raw.split(',')) {
      const trimmed = part.trim()
      if (!trimmed) continue
      const colon = trimmed.indexOf(':')
      if (colon < 0) rules[trimmed] = true
      else rules[trimmed.slice(0, colon)] = parseScalar(trimmed.slice(colon + 1))
    }
  } else if (raw && typeof raw === 'object') {
    Object.assign(rules, raw as ValidationRules)
  }
  return rules
}

function isEmpty(value: unknown): boolean {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0)
}

function asRegexp(raw: unknown): RegExp | null {
  if (raw instanceof RegExp) return raw
  if (typeof raw !== 'string' || !raw) return null
  const match = raw.match(/^\/(.+)\/([a-z]*)$/i)
  try {
    return match ? new RegExp(match[1], match[2]) : new RegExp(raw)
  } catch {
    return null
  }
}

function messageOf(schema: SchemaObject, key: string, fallback: string): string {
  const custom = schema.validationErrors
  if (custom && typeof custom === 'object' && custom[key]) return String(custom[key])
  return fallback
}

export function validateValue(schema: SchemaObject, value: unknown, data: PlainObject = {}): string | null {
  const rules = parseValidations(schema)
  const label = String(schema.label || schema.name || '字段')
  const required = formItemRequired(schema, data) || !!rules.required

  if (required && isEmpty(value)) {
    return messageOf(schema, 'required', `${label} 不能为空`)
  }
  if (isEmpty(value)) return null

  const text = String(value)
  const minLength = Number(rules.minLength)
  if (Number.isFinite(minLength) && text.length < minLength) {
    return messageOf(schema, 'minLength', `${label} 长度不能少于 ${minLength}`)
  }
  const maxLength = Number(rules.maxLength)
  if (Number.isFinite(maxLength) && text.length > maxLength) {
    return messageOf(schema, 'maxLength', `${label} 长度不能超过 ${maxLength}`)
  }
  const maximum = Number(rules.maximum)
  if (Number.isFinite(maximum) && Number(value) > maximum) {
    return messageOf(schema, 'maximum', `${label} 不能大于 ${maximum}`)
  }
  const minimum = Number(rules.minimum)
  if (Number.isFinite(minimum) && Number(value) < minimum) {
    return messageOf(schema, 'minimum', `${label} 不能小于 ${minimum}`)
  }
  if (rules.matchRegexp) {
    const regexp = asRegexp(rules.matchRegexp)
    if (regexp && !regexp.test(text)) {
      return messageOf(schema, 'matchRegexp', `${label} 格式不正确`)
    }
  }
  if (rules.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return messageOf(schema, 'isEmail', `${label} 不是有效邮箱`)
  }
  if (rules.isUrl && !/^https?:\/\//i.test(text)) {
    return messageOf(schema, 'isUrl', `${label} 不是有效 URL`)
  }
  if (rules.isNumeric && !/^-?\d+(\.\d+)?$/.test(text)) {
    return messageOf(schema, 'isNumeric', `${label} 必须是数字`)
  }
  if (rules.isInt && !/^-?\d+$/.test(text)) {
    return messageOf(schema, 'isInt', `${label} 必须是整数`)
  }
  if (rules.isAlphanumeric && !/^[0-9A-Za-z]+$/.test(text)) {
    return messageOf(schema, 'isAlphanumeric', `${label} 只能包含字母或数字`)
  }
  return null
}
