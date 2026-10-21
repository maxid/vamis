import { evaluate, registerFilter } from '@vamis/formula'
import type { PlainObject } from './types'

export {
  evaluate,
  evaluateForAsync,
  parse,
  lexer,
  Evaluator,
  AsyncEvaluator,
  filters,
  getFilters,
  registerFilter,
  registerFunction,
  registerFormula,
  extendsFilters,
} from '@vamis/formula'

/** Amis 表达式里 `this.xxx` 指向当前数据域。 */
function formulaData(data: PlainObject = {}): PlainObject {
  if (!data || typeof data !== 'object') return { this: data }
  return { ...data, this: data }
}

registerFilter('json', (input: unknown) => {
  try {
    return JSON.stringify(input ?? null)
  } catch {
    return ''
  }
})

registerFilter('default', (input: unknown, fallback = '') => {
  if (input == null || input === '') return fallback
  return input
})

registerFilter('first', (input: unknown) => {
  if (Array.isArray(input)) return input[0]
  return input
})

export function evalFormula(expression: string, data: PlainObject = {}): unknown {
  try {
    return evaluate(expression, formulaData(data), { evalMode: true, defaultFilter: 'raw' })
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

export function filterTpl(tpl: unknown, data: PlainObject = {}): string {
  if (tpl == null) return ''
  if (typeof tpl !== 'string') return String(tpl)
  if (!tpl.includes('${')) return tpl
  try {
    const value = evaluate(tpl, formulaData(data), { evalMode: false, defaultFilter: 'raw' })
    return value == null ? '' : String(value)
  } catch {
    return tpl
  }
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

export function resolveValue(expr: unknown, data: PlainObject = {}): unknown {
  if (expr == null || typeof expr !== 'string') return expr
  if (expr.startsWith('${') && expr.endsWith('}') && expr.indexOf('${', 1) === -1) {
    try {
      return evaluate(expr, formulaData(data), { evalMode: false, defaultFilter: 'raw' })
    } catch {
      return evalFormula(expr.slice(2, -1), data)
    }
  }
  if (expr.includes('${')) return filterTpl(expr, data)
  if (Object.prototype.hasOwnProperty.call(data, expr)) return data[expr]
  return expr
}
