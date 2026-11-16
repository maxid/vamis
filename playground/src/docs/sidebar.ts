import {
  componentNav,
  conceptNav,
  extendNav,
  isCompGroup,
  startNav,
  styleNav,
  typeNav,
} from '../../../website/nav.mjs'
import { minPriority, typeFromNavItem } from './component-priority'
import { priorityForType, rankForType } from './priority-catalog'
import { averageProgress } from './doc-progress'
import { playgroundHref } from './pages'
import { progressForLink } from './progress-catalog'

export interface SideLink {
  text: string
  link: string
  progress?: number
  /** 侧栏档 0/1/2 = P0/P1/P2。文档 / 样式页没有。 */
  priority?: number
  /** 全量顺序 `#N`，越小越先做。 */
  rank?: number
}

export interface SideGroup {
  text: string
  collapsed?: boolean
  items?: SideLink[]
  /** Ungrouped top-level link (e.g. 组件介绍). */
  link?: string
  progress?: number
  priority?: number
  rank?: number
}

function mapLink(item: { text: string; link: string; type?: string }): SideLink {
  const link = playgroundHref(item.link)
  const type = typeFromNavItem(item)
  return {
    text: item.text,
    link,
    progress: progressForLink(link),
    priority: priorityForType(type),
    rank: rankForType(type),
  }
}

function mapItems(items: { text: string; link: string; type?: string }[]): SideLink[] {
  return items.map(mapLink)
}

function groupRank(items: SideLink[], stage: number | undefined): number | undefined {
  if (stage == null) return undefined
  return minPriority(items.filter((item) => item.priority === stage).map((item) => item.rank))
}

function withGroupProgress(group: SideGroup): SideGroup {
  if (group.link && !group.items?.length) {
    return { ...group, progress: progressForLink(group.link), priority: group.priority, rank: group.rank }
  }
  const items = group.items || []
  const priority = minPriority(items.map((item) => item.priority))
  return {
    ...group,
    progress: averageProgress(items.map((item) => item.progress)),
    priority,
    rank: groupRank(items, priority),
  }
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
