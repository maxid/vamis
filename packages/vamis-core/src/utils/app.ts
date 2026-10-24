/** App 多页。对齐 Amis：相对 url 拼父级；visible:false 不进菜单；isDefaultPage 当 404。 */

import { filterTpl } from '../formula'
import type { SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function toNodes(node: unknown): SchemaNode[] {
  if (node == null || node === false || node === '') return []
  return Array.isArray(node) ? (node as SchemaNode[]) : [node as SchemaNode]
}

export type AppNavItem = {
  key: string
  label: string
  schema?: SchemaObject
  link?: string
  isDefault: boolean
  children: AppNavItem[]
}

function joinUrl(parent: string, url: string): string {
  if (!url) return parent
  if (url.startsWith('/')) return url
  if (!parent) return `/${url}`.replace(/^\/+/, '/')
  return `${parent.replace(/\/$/, '')}/${url}`
}

function pageSchema(page: Record<string, unknown>): SchemaObject | undefined {
  if (page.schema && typeof page.schema === 'object' && !Array.isArray(page.schema)) {
    return page.schema as SchemaObject
  }
  if (page.body != null) return { type: 'wrapper', body: page.body } as SchemaObject
  return undefined
}

export function appBrandName(schema: unknown, data: Record<string, unknown> = {}): string {
  const brand = asRecord(schema).brandName
  if (brand == null || brand === false) return ''
  return filterTpl(String(brand), data)
}

export function appNav(schema: unknown, data: Record<string, unknown> = {}, parentUrl = ''): AppNavItem[] {
  const pages = asRecord(schema).pages
  const list = Array.isArray(pages) ? pages : []
  const out: AppNavItem[] = []
  list.forEach((raw, i) => {
    const page = asRecord(raw)
    if (page.visible === false) return
    const url = typeof page.url === 'string' ? page.url : ''
    const key = joinUrl(parentUrl, url) || String(page.label || `${parentUrl}${i}`)
    const children = Array.isArray(page.children)
      ? appNav({ pages: page.children }, data, url ? joinUrl(parentUrl, url) : parentUrl)
      : []
    out.push({
      key,
      label: filterTpl(String(page.label || page.title || `页面 ${i + 1}`), data),
      schema: pageSchema(page),
      link: typeof page.link === 'string' ? page.link : undefined,
      isDefault: page.isDefaultPage === true,
      children,
    })
  })
  return out
}

function walkNav(items: AppNavItem[], visit: (item: AppNavItem) => boolean): AppNavItem | undefined {
  for (const item of items) {
    if (visit(item)) return item
    const child = walkNav(item.children, visit)
    if (child) return child
  }
  return undefined
}

/** 首页：第一个带 schema 且不是 404 的叶子。 */
export function appDefaultPage(items: AppNavItem[]): AppNavItem | undefined {
  return walkNav(items, (item) => !!item.schema && !item.isDefault)
}

/** `isDefaultPage` 只当 404，不是首页。 */
export function appNotFoundPage(items: AppNavItem[]): AppNavItem | undefined {
  return walkNav(items, (item) => item.isDefault && !!item.schema)
}

export function appSlot(schema: unknown, key: 'header' | 'asideBefore' | 'asideAfter' | 'footer'): SchemaNode[] {
  return toNodes(asRecord(schema)[key])
}

export function appFlat(
  items: AppNavItem[],
  depth = 0,
): { item: AppNavItem; depth: number; group: boolean }[] {
  const out: { item: AppNavItem; depth: number; group: boolean }[] = []
  for (const item of items) {
    const selectable = !!(item.schema || item.link)
    if (item.children.length && !selectable) out.push({ item, depth, group: true })
    else if (selectable) out.push({ item, depth, group: false })
    if (item.children.length) out.push(...appFlat(item.children, depth + 1))
  }
  return out
}
