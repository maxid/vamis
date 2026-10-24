/** PaginationWrapper。对齐 Amis PaginationStore：inputName 切片到 outputName。 */

import type { SchemaObject } from '../types'
import { paginationEllipsisGap, paginationMode, paginationPerPage } from './pagination'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function readPath(data: unknown, path: string): unknown {
  if (!path) return undefined
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
  let cur: unknown = data
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return cur
}

export type PaginationWrapperPosition = 'top' | 'bottom' | 'none'

export function paginationWrapperInputName(schema: unknown): string {
  const name = asRecord(schema).inputName
  return typeof name === 'string' && name ? name : 'items'
}

export function paginationWrapperOutputName(schema: unknown): string {
  const name = asRecord(schema).outputName
  return typeof name === 'string' && name ? name : 'items'
}

export function paginationWrapperPerPage(schema: unknown): number {
  return paginationPerPage(schema)
}

export function paginationWrapperPosition(schema: unknown): PaginationWrapperPosition {
  const pos = asRecord(schema).position
  return pos === 'bottom' || pos === 'none' ? pos : 'top'
}

export function paginationWrapperItems(data: unknown, inputName: string): unknown[] {
  const value = readPath(data, inputName || 'items')
  return Array.isArray(value) ? value : []
}

export function paginationWrapperLastPage(itemCount: number, perPage: number): number {
  const size = perPage > 0 ? perPage : 10
  return Math.ceil(itemCount / size)
}

export function paginationWrapperSlice(items: unknown[], page: number, perPage: number): unknown[] {
  const size = perPage > 0 ? perPage : 10
  const current = !Number.isFinite(page) || page < 1 ? 1 : Math.floor(page)
  const skip = (current - 1) * size
  return items.slice(skip, skip + size)
}

export function paginationWrapperLocals(opts: {
  page: number
  lastPage: number
  outputName: string
  items: unknown[]
}): Record<string, unknown> {
  return {
    currentPage: opts.page,
    lastPage: opts.lastPage,
    [opts.outputName || 'items']: opts.items,
  }
}

export function paginationWrapperPagerSchema(
  schema: unknown,
  opts: { page: number; lastPage: number; perPage: number },
): SchemaObject {
  const rec = asRecord(schema)
  const pager: SchemaObject = {
    type: 'pagination',
    activePage: opts.page,
    lastPage: opts.lastPage,
    perPage: opts.perPage,
    mode: paginationMode(schema),
    ellipsisPageGap: paginationEllipsisGap(schema),
  }
  if (rec.maxButtons != null) pager.maxButtons = rec.maxButtons
  if (rec.showPageInput) pager.showPageInput = true
  return pager
}
