import {
  componentNav,
  conceptNav,
  extendNav,
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
  items: SideLink[]
}

function mapItems(items: { text: string; link: string }[]): SideLink[] {
  return items.map((item) => ({ text: item.text, link: playgroundHref(item.link) }))
}

export const docsGroups: SideGroup[] = [
  { text: '开始', items: mapItems(startNav) },
  { text: '概念', collapsed: true, items: mapItems(conceptNav) },
  { text: '样式', collapsed: true, items: mapItems(styleNav) },
  { text: '类型', collapsed: true, items: mapItems(typeNav) },
  { text: '扩展', collapsed: true, items: mapItems(extendNav) },
]

export const componentGroups: SideGroup[] = componentNav.map((group) => ({
  text: group.text,
  collapsed: true,
  items: mapItems(group.items),
}))

export function groupsForPath(path: string): SideGroup[] {
  return path === '/components' || path.startsWith('/components/') ? componentGroups : docsGroups
}
