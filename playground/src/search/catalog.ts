import { exampleLeaves } from '../catalog'
import { componentGroups, docsGroups, styleGroups } from '../docs/sidebar'

export type SearchHit = {
  href: string
  title: string
  group: string
  keywords: string
}

export function buildSearchIndex(): SearchHit[] {
  const hits: SearchHit[] = [
    { href: '/', title: '介绍', group: '文档', keywords: '介绍 文档 开始 首页' },
    { href: '/components', title: '组件介绍', group: '组件', keywords: '组件介绍' },
    { href: '/style', title: '样式', group: '样式', keywords: '样式 辅助类 className helper cssVars' },
    { href: '/examples', title: '示例', group: '页面', keywords: '示例 playground 预览' },
    { href: '/editor', title: '编辑器', group: '页面', keywords: '编辑器 yaml 可视化' },
  ]
  for (const group of docsGroups) {
    for (const item of group.items ?? []) {
      hits.push({
        href: item.link,
        title: item.text,
        group: `文档 · ${group.text}`,
        keywords:
          item.link.includes('/start/sdk')
            ? `${item.text} ${item.link} ${group.text} embed sdk.js amis.embed vamis.embed`
            : item.link.includes('/concepts/schema')
              ? `${item.text} ${item.link} ${group.text} LazyComponent lazyLoad unMountOnHidden 懒加载 可视 initApi Schema`
              : `${item.text} ${item.link} ${group.text}`,
      })
    }
  }
  for (const group of styleGroups) {
    for (const item of group.items ?? []) {
      if (hits.some((hit) => hit.href === item.link)) continue
      hits.push({
        href: item.link,
        title: item.text,
        group: `样式 · ${group.text}`,
        keywords: `${item.text} ${item.link} ${group.text} className helper 辅助类`,
      })
    }
  }
  for (const group of componentGroups) {
    if (group.link && !group.items?.length) {
      if (hits.some((hit) => hit.href === group.link)) continue
      hits.push({
        href: group.link,
        title: group.text,
        group: '组件',
        keywords: `${group.text} ${group.link}`,
      })
      continue
    }
    for (const item of group.items || []) {
      if (hits.some((hit) => hit.href === item.link)) continue
      hits.push({
        href: item.link,
        title: item.text,
        group: `组件 · ${group.text}`,
        keywords: `${item.text} ${item.link} ${group.text}`,
      })
    }
  }
  for (const leaf of exampleLeaves) {
    hits.push({
      href: `/examples?example=${encodeURIComponent(leaf.id)}`,
      title: leaf.label,
      group: '示例',
      keywords: leaf.searchable,
    })
  }
  return hits
}

export function searchHits(query: string, limit = 24): SearchHit[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const index = buildSearchIndex()
  if (!tokens.length) return index.slice(0, 12)
  const scored = index
    .map((hit) => {
      const hay = `${hit.title} ${hit.group} ${hit.keywords} ${hit.href}`.toLowerCase()
      if (!tokens.every((token) => hay.includes(token))) return null
      const titleHit = tokens.every((token) => hit.title.toLowerCase().includes(token))
      return { hit, score: titleHit ? 0 : 1 }
    })
    .filter((row): row is { hit: SearchHit; score: number } => row != null)
    .sort((a, b) => a.score - b.score || a.hit.title.localeCompare(b.hit.title, 'zh'))
  return scored.slice(0, limit).map((row) => row.hit)
}
