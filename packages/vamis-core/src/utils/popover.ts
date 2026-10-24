/** 属性 popOver。对齐 Amis：挂在 table 列 / list 字段 / static / cards，不是独立 type。 */

import { evalExpression, filterTpl } from '../formula'
import type { PlainObject, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type PopOverTrigger = 'click' | 'hover'
export type PopOverMode = 'popOver' | 'dialog' | 'drawer'

const MODES = new Set(['popOver', 'dialog', 'drawer'])
const POSITIONS = new Set([
  'center',
  'left-top',
  'right-top',
  'left-bottom',
  'right-bottom',
  'left-top-right-bottom',
  'left-center-right-center',
  'left-bottom-right-top',
  'right-top-left-bottom',
  'right-center-left-center',
  'right-bottom-left-top',
  'center-center-center-center',
  'fixed-center',
  'fixed-left-top',
  'fixed-right-top',
  'fixed-left-bottom',
  'fixed-right-bottom',
])

function popOverRaw(schema: unknown): unknown {
  return asRecord(schema).popOver
}

function popOverObject(schema: unknown): Record<string, unknown> | null {
  const raw = popOverRaw(schema)
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  return null
}

export function popOverEnabled(schema: unknown, data: PlainObject = {}): boolean {
  const rec = asRecord(schema)
  const raw = rec.popOver
  if (raw == null || raw === false || raw === '') return false
  if (rec.popOverEnable === false || rec.popOverEnabled === false) return false
  if (typeof rec.popOverEnableOn === 'string' && rec.popOverEnableOn) {
    return evalExpression(rec.popOverEnableOn, data)
  }
  return true
}

export function popOverTrigger(schema: unknown): PopOverTrigger {
  const trigger = String(popOverObject(schema)?.trigger || '')
  return trigger === 'hover' ? 'hover' : 'click'
}

export function popOverShowIcon(schema: unknown): boolean {
  const rec = popOverObject(schema)
  if (rec && rec.showIcon === false) return false
  return true
}

export function popOverMode(schema: unknown): PopOverMode {
  const mode = String(popOverObject(schema)?.mode || '')
  return MODES.has(mode) ? (mode as PopOverMode) : 'popOver'
}

export function popOverPosition(schema: unknown): string {
  const value = String(popOverObject(schema)?.position || '')
  return POSITIONS.has(value) ? value : 'center'
}

export function popOverOffset(schema: unknown): { x: number; y: number } {
  const offset = popOverObject(schema)?.offset
  const rec = asRecord(offset)
  const x = Number(rec.left ?? rec.x ?? 0)
  const y = Number(rec.top ?? rec.y ?? 0)
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
  }
}

export function popOverTitle(schema: unknown, data: PlainObject = {}): string {
  const rec = popOverObject(schema)
  if (!rec || rec.title == null || rec.title === false) return ''
  return filterTpl(rec.title, data)
}

function asTpl(tpl: unknown): SchemaObject {
  return { type: 'tpl', tpl: tpl == null ? '' : String(tpl) }
}

export function popOverBodyNode(schema: unknown): SchemaObject {
  const rec = asRecord(schema)
  const raw = rec.popOver
  if (raw === true) {
    const name = rec.name
    return asTpl(typeof name === 'string' && name ? `\${${name}}` : '')
  }
  if (typeof raw === 'string') return asTpl(raw)
  const obj = popOverObject(schema)
  if (!obj) return asTpl('')
  const body = obj.body
  if (typeof body === 'string' || typeof body === 'number' || typeof body === 'boolean') return asTpl(body)
  if (body && typeof body === 'object' && !Array.isArray(body)) return body as SchemaObject
  if (Array.isArray(body)) return { type: 'container', body }
  if (typeof obj.tpl === 'string') return asTpl(obj.tpl)
  return asTpl('')
}

export function popOverOverlaySchema(schema: unknown, data: PlainObject = {}): SchemaObject {
  const mode = popOverMode(schema)
  const obj = popOverObject(schema) || {}
  const title = popOverTitle(schema, data)
  const body = popOverBodyNode(schema)
  return {
    actions: [{ label: '关闭', type: 'button', actionType: 'cancel' }],
    ...obj,
    type: mode,
    title: title || obj.title,
    body,
  }
}

export function popOverFieldSchema(schema: unknown): SchemaObject {
  if (schema == null || schema === false) return { type: 'tpl', tpl: '' }
  if (typeof schema !== 'object' || Array.isArray(schema)) {
    return { type: 'tpl', tpl: String(schema) }
  }
  const rec = schema as Record<string, unknown>
  if (typeof rec.type === 'string' && rec.type) return rec as SchemaObject
  return { type: 'field', ...rec }
}

let lastClose: (() => void) | null = null

export function popOverExclusiveOpen(close: () => void) {
  if (lastClose && lastClose !== close) lastClose()
  lastClose = close
}

export function popOverExclusiveClear(close: () => void) {
  if (lastClose === close) lastClose = null
}
