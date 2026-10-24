/** Tasks。对齐 Amis：status 0–5、statusTextMap 未开始/就绪/进行中/出错/已完成/出错、列名任务名称/状态/备注说明。 */

import { filterTpl } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type TaskItem = {
  label?: unknown
  key?: unknown
  remark?: unknown
  status?: unknown
}

const DEFAULT_STATUS_TEXT = ['未开始', '就绪', '进行中', '出错', '已完成', '出错']

export function taskItems(schema: unknown, data: PlainObject = {}): TaskItem[] {
  const rec = asRecord(schema)
  const fromSchema = rec.items
  if (Array.isArray(fromSchema)) return fromSchema as TaskItem[]
  const name = typeof rec.name === 'string' ? rec.name : ''
  if (name && Array.isArray(data[name])) return data[name] as TaskItem[]
  return []
}

export function taskStatus(item: unknown): number {
  const raw = asRecord(item).status
  const value = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(value) || value < 0 || value > 5) return 0
  return value
}

export function taskStatusText(schema: unknown, item: unknown): string {
  const map = asRecord(schema).statusTextMap
  const list = Array.isArray(map) ? map.map((row) => String(row ?? '')) : DEFAULT_STATUS_TEXT
  return list[taskStatus(item)] || DEFAULT_STATUS_TEXT[taskStatus(item)] || ''
}

export function taskCanOperate(item: unknown): boolean {
  return taskStatus(item) === 1
}

export function taskCanRetry(item: unknown): boolean {
  return taskStatus(item) === 5
}

function labelField(schema: unknown, key: string, fallback: string): string {
  const value = asRecord(schema)[key]
  if (typeof value === 'string' && value) return value
  return fallback
}

export function taskNameLabel(schema: unknown): string {
  return labelField(schema, 'taskNameLabel', '任务名称')
}

export function taskStatusLabel(schema: unknown): string {
  return labelField(schema, 'statusLabel', '状态')
}

export function taskRemarkLabel(schema: unknown): string {
  return labelField(schema, 'remarkLabel', '备注说明')
}

export function taskOperationLabel(schema: unknown): string {
  return labelField(schema, 'operationLabel', '操作')
}

export function taskBtnText(schema: unknown): string {
  return labelField(schema, 'btnText', '上线')
}

export function taskRetryBtnText(schema: unknown): string {
  return labelField(schema, 'retryBtnText', '重试')
}

export function taskLabel(item: unknown, data: PlainObject = {}): string {
  const rec = asRecord(item)
  const raw = rec.label ?? rec.title ?? rec.name
  if (raw == null || raw === false) return ''
  return filterTpl(raw, data)
}

export function taskRemark(item: unknown, data: PlainObject = {}): string {
  const remark = asRecord(item).remark
  if (remark == null || remark === false) return ''
  return filterTpl(remark, data)
}
