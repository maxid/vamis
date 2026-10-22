import { evaluate } from '@vamis/formula'
import type { PlainObject } from './types'
import './filters'

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

export interface TemplateResult {
  text: string
  html?: string
  usedFilters: string[]
}

/** Amis 表达式里 `this.xxx` 指向当前数据域。 */
function formulaData(data: PlainObject = {}): PlainObject {
  if (!data || typeof data !== 'object') return { this: data }
  return { ...data, this: data }
}

function collectTplFilters(tpl: string): string[] {
  const names: string[] = []
  const chunks = tpl.match(/\$\{[\s\S]*?\}/g) || []
  for (const chunk of chunks) {
    const re = /\|([A-Za-z_]\w*)/g
    let match: RegExpExecArray | null
    while ((match = re.exec(chunk))) names.push(match[1])
  }
  return names
}

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

export function filterTpl(tpl: unknown, data: PlainObject = {}, defaultFilter = 'raw'): string {
  if (tpl == null) return ''
  if (typeof tpl !== 'string') return String(tpl)
  if (!tpl.includes('${')) return tpl
  try {
    const value = evaluate(tpl, formulaData(data), { evalMode: false, defaultFilter })
    return value == null ? '' : String(value)
  } catch {
    return tpl
  }
}

/** D2：插值默认 `|html` 转义；`asHtml` 时保留模板里的静态标签（对齐 Amis Tpl innerHTML）。 */
export function evalTemplate(tpl: unknown, data: PlainObject = {}, options?: { asHtml?: boolean }): TemplateResult {
  if (tpl == null) return { text: '', usedFilters: [] }
  const source = typeof tpl === 'string' ? tpl : String(tpl)
  const usedFilters = collectTplFilters(source)
  const asHtml = Boolean(options?.asHtml) || usedFilters.includes('raw')
  const text = filterTpl(source, data, asHtml ? 'html' : 'raw')
  return asHtml ? { text, html: text, usedFilters } : { text, usedFilters }
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
