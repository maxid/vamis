import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { harvestMarkdown } from './harvest.mjs'
import { p0Cases } from './p0-cases.mjs'
import { compareNav, decorateCase, numberPageTitles, parseBucketArg, pathToLink } from './nav-group.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '../../..')

function exists(dir) {
  return fs.existsSync(dir)
}

export function loadCatalog(options = {}) {
  const docs = options.docs !== false
  const amisDocs = options.amisDocs === true
  const bucket = parseBucketArg(options.bucket)
  const section = options.section ? String(options.section).trim() : ''
  const cases = p0Cases.map((row) => decorateCase({ ...row, origin: 'p0', index: 0 }))
  const sources = [
    { dir: path.join(repo, 'website/src/start'), origin: 'vamis' },
    { dir: path.join(repo, 'website/src/concepts'), origin: 'vamis' },
    { dir: path.join(repo, 'website/src/types'), origin: 'vamis' },
    { dir: path.join(repo, 'website/src/extend'), origin: 'vamis' },
  ]
  if (docs) {
    sources.push(
      { dir: path.join(repo, 'website/src/style'), origin: 'vamis' },
      { dir: path.join(repo, 'website/src/components'), origin: 'vamis' },
    )
  }
  if (amisDocs) {
    sources.push(
      { dir: path.join(repo, '../amis/docs/zh-CN/start'), origin: 'amis' },
      { dir: path.join(repo, '../amis/docs/zh-CN/concepts'), origin: 'amis' },
      { dir: path.join(repo, '../amis/docs/zh-CN/components'), origin: 'amis' },
    )
  }
  const seen = new Set(cases.map((row) => JSON.stringify(row.schema)))
  const seenLinks = new Set()
  for (const source of sources) {
    if (!exists(source.dir)) continue
    for (const row of harvestMarkdown(source.dir, { relFrom: repo })) {
      const link = pathToLink(row.source)
      if (source.origin === 'amis' && seenLinks.has(link)) continue
      const key = JSON.stringify(row.schema)
      if (seen.has(key)) continue
      seen.add(key)
      seenLinks.add(link)
      cases.push(decorateCase({ ...row, origin: source.origin }))
    }
  }
  cases.sort(compareNav)
  return numberPageTitles(cases).filter((row) =>
    matchCatalog(row, { bucket, section, page: options.page, id: options.id, type: options.type }),
  )
}

/** Amis `media-breakpoint-down(sm)` 是 <768px。对照桌面钉 ≥768，移动钉 375。 */
export const VIEWPORT = {
  desktop: { width: 1100, height: 800, layout: 768 },
  mobile: { width: 375, height: 812, layout: 375 },
}

export function parseViewportArg(value) {
  const raw = String(value || '').trim().toLowerCase()
  if (raw === 'mobile' || raw === 'm' || raw === '1' || raw === 'true') return 'mobile'
  return 'desktop'
}

export function iframeLayoutWidth(mode, paneW) {
  if (mode === 'mobile') return VIEWPORT.mobile.layout
  return Math.max(VIEWPORT.desktop.layout, paneW || VIEWPORT.desktop.layout)
}

export function iframeScale(mode, paneW, layoutW) {
  if (!paneW || !layoutW) return 1
  if (mode === 'mobile') return paneW < layoutW ? paneW / layoutW : 1
  return paneW / layoutW
}

/** 组件「自身」：page 名 / 文件名 / 完整 id，不误伤 dropdown-button 这类邻居。 */
export function matchSelf(row, query) {
  const raw = String(query || '').trim()
  if (!raw) return true
  if (String(row.id) === raw) return true
  const q = raw.toLowerCase()
  const page = String(row.page || '').toLowerCase()
  if (page === q || page.startsWith(`${q} `)) return true
  const source = String(row.source || '').replace(/\\/g, '/')
  const base = (source.split('/').pop() || '').replace(/\.md$/i, '').toLowerCase()
  if (base === q) return true
  const path = source.replace(/^website\/src/i, '').replace(/\.md$/i, '').toLowerCase()
  if (path.endsWith(`/${q}`) || path.endsWith(`/${q}/index`)) return true
  return String(row.id).toLowerCase() === q
}

function schemaHasType(node, type) {
  if (!node || typeof node !== 'object') return false
  if (Array.isArray(node)) return node.some((item) => schemaHasType(item, type))
  if (String(node.type || '').toLowerCase() === type) return true
  return ['body', 'columns', 'items', 'controls', 'buttons', 'actions'].some((key) => schemaHasType(node[key], type))
}

export function matchCatalog(row, options = {}) {
  const bucket = parseBucketArg(options.bucket)
  const section = options.section
  const page = options.page
  const id = options.id
  const type = options.type ? String(options.type).trim().toLowerCase() : ''
  if (bucket && row.bucket !== bucket) return false
  if (section && row.section !== section) return false
  if (id && String(row.id) !== String(id)) return false
  if (page && !matchSelf(row, page)) return false
  if (type && !schemaHasType(row.schema, type) && !matchSelf(row, type)) return false
  return true
}

/** 全局修完全量；组件/ helper 修完只跑自身。 */
export function rerunCommands(rows = [], options = {}) {
  const suffix = options.mobile ? ' --mobile' : ''
  const failed = rows.filter((row) => !row.parity?.pass)
  const scopes = new Set()
  for (const row of failed) {
    for (const issue of row.findings || []) {
      if (issue.scope) scopes.add(issue.scope)
    }
  }
  const commands = []
  if (scopes.has('global')) {
    commands.push({
      scope: 'global',
      cmd: `pnpm compare${suffix}`,
      note: options.mobile ? '全局修完必须重跑全部移动端用例' : '全局修完必须重跑全部用例',
    })
  }
  const seen = new Set()
  for (const row of failed) {
    const issues = row.findings || []
    const local = issues.some((issue) => issue.scope === 'component' || issue.scope === 'helper')
    if (!local) continue
    const key = row.page || row.id
    if (seen.has(key)) continue
    seen.add(key)
    const arg = row.page || row.id
    commands.push({
      scope: issues.some((issue) => issue.scope === 'component') ? 'component' : 'helper',
      cmd: `pnpm compare --page ${JSON.stringify(String(arg).split(' ')[0].toLowerCase())}${suffix}`,
      note: `只重跑「${row.page || row.id}」自身`,
    })
  }
  return commands
}

export function toBrowserScript(cases) {
  const payload = cases.map((row) => ({
    id: row.id,
    group: row.group,
    bucket: row.bucket,
    section: row.section,
    page: row.page,
    extra: row.extra,
    origin: row.origin,
    layer: row.layer || 'docs',
    title: row.title,
    expect: row.expect || '',
    schema: row.schema,
    measure: row.measure,
    labels: row.measure?.labels,
  }))
  return `/** Generated by compare/build-cases.mjs. Do not edit. */\nwindow.VAMIS_COMPARE_CASES = ${JSON.stringify(payload, null, 2)}\n`
}
