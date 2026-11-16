import {
  componentNav,
  conceptNav,
  extendNav,
  isCompGroup,
  startNav,
  styleNav,
  typeNav,
} from '../../../website/nav.mjs'
import { averageProgress } from './doc-progress'
import { playgroundHref } from './pages'
import { progressForLink } from './progress-catalog'

export interface SideLink {
  text: string
  link: string
  progress?: number
}

export interface SideGroup {
  text: string
  collapsed?: boolean
  items?: SideLink[]
  /** Ungrouped top-level link (e.g. 组件介绍). */
  link?: string
  progress?: number
}

function mapLink(item: { text: string; link: string }): SideLink {
  const link = playgroundHref(item.link)
  return { text: item.text, link, progress: progressForLink(link) }
}

function mapItems(items: { text: string; link: string }[]): SideLink[] {
  return items.map(mapLink)
}

function withGroupProgress(group: SideGroup): SideGroup {
  if (group.link && !group.items?.length) {
    return { ...group, progress: progressForLink(group.link) }
  }
  return { ...group, progress: averageProgress((group.items || []).map((item) => item.progress)) }
}

export const docsGroups: SideGroup[] = [
  withGroupProgress({ text: '开始', items: mapItems(startNav) }),
  withGroupProgress({ text: '概念', collapsed: true, items: mapItems(conceptNav) }),
  withGroupProgress({ text: '类型', collapsed: true, items: mapItems(typeNav) }),
  withGroupProgress({ text: '扩展', collapsed: true, items: mapItems(extendNav) }),
]

export const componentGroups: SideGroup[] = componentNav.map((entry) =>
  withGroupProgress(
    isCompGroup(entry)
      ? { text: entry.text, collapsed: true, items: mapItems(entry.items) }
      : { text: entry.text, link: playgroundHref(entry.link) },
  ),
)

export const styleGroups: SideGroup[] = styleNav.map((entry) =>
  withGroupProgress(
    isCompGroup(entry)
      ? { text: entry.text, collapsed: entry.collapsed, items: mapItems(entry.items) }
      : { text: entry.text, link: playgroundHref(entry.link) },
  ),
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
