/** Action 按钮外观。对齐 Amis：未写 label 不补「按钮」；空 label 只留图标；primary 当 level；icon 走 resolveIcon。 */

import { filterTpl } from '../formula'
import { resolveIcon } from './icon'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function tplField(value: unknown, data: Record<string, unknown>): string {
  if (value == null || value === false || typeof value === 'object') return ''
  return filterTpl(String(value), data)
}

export function actionKind(schema: unknown): string {
  const rec = asRecord(schema)
  if (typeof rec.actionType === 'string' && rec.actionType) return rec.actionType
  if (rec.type === 'submit') return 'submit'
  if (rec.type === 'reset') return 'reset'
  return 'button'
}

export function actionLevel(schema: unknown): string {
  const rec = asRecord(schema)
  if (typeof rec.level === 'string' && rec.level) return rec.level
  if (rec.primary === true) return 'primary'
  return ''
}

export function actionLabel(schema: unknown, data: Record<string, unknown> = {}): string {
  const rec = asRecord(schema)
  if (rec.label === false || rec.label === '') return ''
  if (typeof rec.label === 'string') return filterTpl(rec.label, data)
  if (typeof rec.title === 'string' && rec.title) return filterTpl(rec.title, data)
  return ''
}

export function actionShowLabel(schema: unknown): boolean {
  const rec = asRecord(schema)
  if (rec.label === false || rec.label === '') return false
  if (typeof rec.label === 'string') return true
  return typeof rec.title === 'string' && !!rec.title
}

export function actionIconSrc(schema: unknown, key = 'icon'): string {
  const resolved = resolveIcon(asRecord(schema)[key])
  return resolved.kind === 'url' ? resolved.src : ''
}

export function actionIconClass(schema: unknown, key = 'icon'): string {
  const resolved = resolveIcon(asRecord(schema)[key])
  return resolved.kind === 'class' ? resolved.className : ''
}

export function actionTooltip(schema: unknown, data: Record<string, unknown> = {}): string {
  const rec = asRecord(schema)
  if (typeof rec.tooltip === 'string') return filterTpl(rec.tooltip, data)
  const obj = rec.tooltip && typeof rec.tooltip === 'object' && !Array.isArray(rec.tooltip)
    ? (rec.tooltip as Record<string, unknown>)
    : null
  if (!obj) return typeof rec.title === 'string' ? filterTpl(rec.title, data) : ''
  return tplField(obj.content ?? obj.title, data)
}

export function actionMailto(schema: unknown, data: Record<string, unknown> = {}): string {
  const rec = asRecord(schema)
  const to = tplField(rec.to, data)
  const params = new URLSearchParams()
  const cc = tplField(rec.cc, data)
  const bcc = tplField(rec.bcc, data)
  const subject = tplField(rec.subject, data)
  const body = tplField(rec.body, data)
  if (cc) params.set('cc', cc)
  if (bcc) params.set('bcc', bcc)
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString()
  return query ? `mailto:${to}?${query}` : `mailto:${to}`
}
