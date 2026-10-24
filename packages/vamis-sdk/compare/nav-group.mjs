/** 对照用例按 Amis 文档侧栏分：文档 / 组件 / 样式。Vamis 可以比 Amis 多（extra）。 */

import {
  startNav,
  conceptNav,
  typeNav,
  extendNav,
  styleNav,
  componentNav,
  isCompGroup,
} from '../../../website/nav.mjs'

export const BUCKETS = [
  { id: 'docs', label: '文档' },
  { id: 'components', label: '组件' },
  { id: 'style', label: '样式' },
]

const STYLE_SECTIONS = {
  layout: 'Layout',
  flex: 'Flexbox',
  grid: 'Grid',
  'box-alignment': 'Box Alignment',
  spacing: 'Spacing',
  sizing: 'Sizing',
  typography: 'Typography',
  background: 'Backgrounds',
  border: 'BORDERS',
  effect: 'Effect',
}

function normalize(link) {
  let next = String(link || '').replace(/\\/g, '/')
  if (next.endsWith('/index')) next = next.slice(0, -6)
  next = next.replace(/\/+$/, '')
  return next || '/'
}

function flatten(bucket, entries, sectionFallback, startOrder) {
  const out = []
  let order = startOrder
  for (const entry of entries) {
    if (isCompGroup(entry) || Array.isArray(entry.items)) {
      for (const item of entry.items || []) {
        out.push({
          bucket,
          section: entry.text,
          page: item.text,
          link: normalize(item.link),
          order: order++,
          extra: false,
        })
      }
    } else if (entry.link) {
      out.push({
        bucket,
        section: sectionFallback,
        page: entry.text,
        link: normalize(entry.link),
        order: order++,
        extra: false,
      })
    }
  }
  return out
}

const INDEX = [
  ...flatten('docs', startNav, '开始', 0),
  ...flatten('docs', conceptNav, '概念', 100),
  ...flatten('docs', typeNav, '类型', 200),
  ...flatten('docs', extendNav, '扩展', 300),
  ...flatten('components', componentNav, '组件', 400),
  ...flatten('style', styleNav, '开始', 800),
]

const BY_LINK = new Map(INDEX.map((item) => [item.link, item]))

export function bucketLabel(id) {
  return BUCKETS.find((item) => item.id === id)?.label || id
}

function infer(link) {
  if (link.startsWith('/style/')) {
    const part = link.split('/')[2] || '开始'
    return {
      bucket: 'style',
      section: STYLE_SECTIONS[part] || part,
      page: link.split('/').filter(Boolean).slice(-1)[0],
      order: 9000,
      extra: true,
    }
  }
  if (link.startsWith('/components/form')) {
    return { bucket: 'components', section: '数据输入', page: link.split('/').pop(), order: 9000, extra: true }
  }
  if (link.startsWith('/components/')) {
    return { bucket: 'components', section: '其他', page: link.split('/').pop(), order: 9100, extra: true }
  }
  if (link.startsWith('/concepts/')) {
    return { bucket: 'docs', section: '概念', page: link.split('/').pop(), order: 9200, extra: true }
  }
  if (link.startsWith('/start/') || link === '/') {
    return { bucket: 'docs', section: '开始', page: link.split('/').pop() || '介绍', order: 9300, extra: true }
  }
  if (link.startsWith('/types/')) {
    return { bucket: 'docs', section: '类型', page: link.split('/').pop(), order: 9400, extra: true }
  }
  if (link.startsWith('/extend/')) {
    return { bucket: 'docs', section: '扩展', page: link.split('/').pop(), order: 9500, extra: true }
  }
  return { bucket: 'docs', section: '其他', page: link, order: 9900, extra: true }
}

export function pathToLink(rel) {
  let link = String(rel || '').replace(/\\/g, '/')
  link = link.replace(/^(?:\.\.\/)+amis\/docs\/zh-CN/, '')
  link = link.replace(/^website\/src/, '')
  link = link.replace(/\.md$/i, '')
  if (!link.startsWith('/')) link = `/${link}`
  return normalize(link)
}

export function groupFromPath(rel) {
  const link = pathToLink(rel)
  const hit = BY_LINK.get(link)
  const nav = hit ? { ...hit } : infer(link)
  return {
    ...nav,
    group: `${bucketLabel(nav.bucket)} / ${nav.section}`,
  }
}

function atLink(link) {
  const nav = groupFromPath(link)
  return { ...nav, extra: false }
}

export function groupP0(id) {
  if (id === 'form-default') return atLink('/components/form')
  if (id === 'button-level-primary' || id === 'style-two-buttons') return atLink('/components/button')
  if (id === 'helper-space-x-6') return atLink('/style/spacing/space-between')
  if (String(id).startsWith('helper-') || id === 'style-two-buttons-ml') return atLink('/style/spacing/margin')
  return atLink('/style/')
}

export function decorateCase(row) {
  const nav = row.source ? groupFromPath(row.source) : groupP0(row.id)
  const hash = row.layer === 'p0' ? '' : (String(row.title || '').match(/#\d+/) || [''])[0]
  const title = row.layer === 'p0' ? row.title : `${nav.page}${hash ? ` ${hash}` : ''}`
  const measure =
    nav.bucket === 'components' && (!row.measure || row.measure.type === 'smoke')
      ? { type: 'tree' }
      : row.measure
  return {
    ...row,
    bucket: nav.bucket,
    section: nav.section,
    page: nav.page,
    extra: Boolean(nav.extra),
    group: nav.group,
    order: nav.order,
    title: title || row.title,
    measure,
  }
}

export function compareNav(a, b) {
  const bucket = { docs: 0, components: 1, style: 2 }
  const da = (bucket[a.bucket] ?? 9) - (bucket[b.bucket] ?? 9)
  if (da) return da
  const oa = (a.order ?? 9999) - (b.order ?? 9999)
  if (oa) return oa
  const pa = String(a.page || '').localeCompare(String(b.page || ''))
  if (pa) return pa
  const ia = (a.index ?? 0) - (b.index ?? 0)
  if (ia) return ia
  return String(a.id || '').localeCompare(String(b.id || ''))
}

export function numberPageTitles(cases) {
  const n = new Map()
  return cases.map((row) => {
    if (row.layer === 'p0') return row
    const key = `${row.bucket}\0${row.page}`
    const i = (n.get(key) || 0) + 1
    n.set(key, i)
    return { ...row, title: `${row.page} #${i}` }
  })
}

export function parseBucketArg(value) {
  const raw = String(value || '').trim()
  if (raw === '文档' || raw === 'docs') return 'docs'
  if (raw === '组件' || raw === 'components') return 'components'
  if (raw === '样式' || raw === 'style') return 'style'
  return raw
}
