import {
  componentNav,
  conceptNav,
  extendNav,
  isCompGroup,
  startNav,
  styleNav,
  typeNav,
} from '../../../website/nav.mjs'
import { playgroundHref } from './pages'

export interface SideLink {
  text: string
  link: string
}

export interface SideGroup {
  text: string
  collapsed?: boolean
  items?: SideLink[]
  /** Ungrouped top-level link (e.g. 组件介绍). */
  link?: string
}

function mapItems(items: { text: string; link: string }[]): SideLink[] {
  return items.map((item) => ({ text: item.text, link: playgroundHref(item.link) }))
}

export const docsGroups: SideGroup[] = [
  { text: '开始', items: mapItems(startNav) },
  { text: '概念', collapsed: true, items: mapItems(conceptNav) },
  { text: '类型', collapsed: true, items: mapItems(typeNav) },
  { text: '扩展', collapsed: true, items: mapItems(extendNav) },
]

export const componentGroups: SideGroup[] = componentNav.map((entry) =>
  isCompGroup(entry)
    ? { text: entry.text, collapsed: true, items: mapItems(entry.items) }
    : { text: entry.text, link: playgroundHref(entry.link) },
)

export const styleGroups: SideGroup[] = styleNav.map((entry) =>
  isCompGroup(entry)
    ? { text: entry.text, collapsed: entry.collapsed, items: mapItems(entry.items) }
    : { text: entry.text, link: playgroundHref(entry.link) },
)

export function groupsForPath(path: string): SideGroup[] {
  if (path === '/components' || path.startsWith('/components/')) return componentGroups
  if (
    path === '/style' ||
    path.startsWith('/style/') ||
    path === '/docs/style' ||
    path.startsWith('/docs/style/')
  ) {
    return styleGroups
  }
  return docsGroups
}
