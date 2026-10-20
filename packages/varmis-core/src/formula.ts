import { evaluate } from 'amis-formula'
import type { PlainObject } from './types'

export function evalFormula(expression: string, data: PlainObject = {}): unknown {
  try {
    return evaluate(expression, data, { evalMode: true, defaultFilter: 'raw' })
  } catch {
    return undefined
  }
}

export function evalExpression(expression: string | undefined, data: PlainObject = {}): boolean {
  if (!expression || typeof expression !== 'string') return false
  try {
    if (expression.startsWith('${') && expression.endsWith('}')) {
      return !!evalFormula(expression.slice(2, -1), data)
    }
    return !!evalFormula(expression, data)
  } catch {
    return false
  }
}

const TPL_RE = /\$\{([^}]+)\}/g

export function filterTpl(tpl: unknown, data: PlainObject = {}): string {
  if (tpl == null) return ''
  if (typeof tpl !== 'string') return String(tpl)
  if (!tpl.includes('${')) return tpl
  return tpl.replace(TPL_RE, (_, expr: string) => {
    const value = evalFormula(expr, data)
    return value == null ? '' : String(value)
  })
}

export function isVisible(schema: PlainObject, data: PlainObject = {}): boolean {
  if (schema.hidden === true) return false
  if (schema.visible === false) return false
  if (typeof schema.hiddenOn === 'string' && evalExpression(schema.hiddenOn, data)) {
    return false
  }
  if (typeof schema.visibleOn === 'string') {
    return evalExpression(schema.visibleOn, data)
  }
  return true
}

export function isDisabled(schema: PlainObject, data: PlainObject = {}): boolean {
  if (schema.disabled === true) return true
  if (typeof schema.disabledOn === 'string') {
    return evalExpression(schema.disabledOn, data)
  }
  return false
}
