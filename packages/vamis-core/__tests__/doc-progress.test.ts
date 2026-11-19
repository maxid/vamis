import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  lookupPriority,
  parsePriorityStages,
  parsePriorityTable,
  parseSidebarFilter,
  stageFromRank,
} from '../../../playground/src/docs/component-priority'
import {
  averageProgress,
  mdRelToPaths,
  parseDocProgress,
  progressTone,
} from '../../../playground/src/docs/doc-progress'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '../../..')

describe('doc progress parser', () => {
  it('reads the banner percent', () => {
    expect(parseDocProgress('::: tip 实现进度 95% · 已完成\nok\n:::')).toBe(95)
    expect(parseDocProgress('::: warning 实现进度 40% · 进行中\n:::')).toBe(40)
    expect(parseDocProgress('# 介绍\n\n没有 banner')).toBeUndefined()
    expect(parseDocProgress('::: info 实现进度 — · 进行中\n:::')).toBeUndefined()
  })

  it('colors by completion like the page banner', () => {
    expect(progressTone(100)).toBe('success')
    expect(progressTone(92)).toBe('info')
    expect(progressTone(80)).toBe('info')
    expect(progressTone(79)).toBe('warning')
    expect(progressTone(40)).toBe('warning')
    expect(progressTone(39)).toBe('danger')
    expect(progressTone(0)).toBe('danger')
  })

  it('maps markdown rels onto playground sidebar links', () => {
    expect(mdRelToPaths('/start/getting-started.md')).toEqual([
      '/start/getting-started',
      '/docs/start/getting-started',
    ])
    expect(mdRelToPaths('/components/page.md')).toEqual(['/components/page'])
    expect(mdRelToPaths('/components/form/index.md')).toEqual(['/components/form'])
    expect(mdRelToPaths('/style/layout/display.md')).toEqual(['/style/layout/display'])
    expect(mdRelToPaths('/index.md')).toEqual(['/', '/docs', '/index'])
  })

  it('averages only items that have a number', () => {
    expect(averageProgress([90, 100, undefined])).toBe(95)
    expect(averageProgress([undefined])).toBeUndefined()
  })

  it('parses a real getting-started page', () => {
    const raw = readFileSync(resolve(repo, 'website/src/start/getting-started.md'), 'utf8')
    expect(parseDocProgress(raw)).toBe(95)
  })
})

describe('doc progress chrome', () => {
  it('wires the top-bar switch and sidebar percent class', () => {
    const app = readFileSync(resolve(repo, 'playground/src/App.vue'), 'utf8')
    const sidebar = readFileSync(resolve(repo, 'playground/src/components/DocSidebar.vue'), 'utf8')
    const pref = readFileSync(resolve(repo, 'playground/src/docs/doc-progress-pref.ts'), 'utf8')
    expect(app).toContain('aria-label="侧栏进度"')
    expect(app).toContain('on-text="进度"')
    expect(app).toContain('off-text="隐藏"')
    expect(app).toContain('setShowDocProgress')
    expect(sidebar).toContain('doc-side-pct')
    expect(sidebar).toContain('doc-side-rank')
    expect(sidebar).toContain('showDocProgress')
    expect(sidebar).toContain('parseSidebarFilter')
    expect(sidebar).toContain('筛选名称、P0、P1')
    expect(pref).toContain("DOC_PROGRESS_KEY = 'vamis-doc-progress'")
  })
})

describe('component priority', () => {
  const todo = readFileSync(
    resolve(repo, 'docs/superpowers/specs/2026-10-20-vamis-component-todo.md'),
    'utf8',
  )
  const table = parsePriorityTable(todo)

  it('reads the 全量顺序 ranks', () => {
    expect(table.get('icon')).toBe(1)
    expect(table.get('formitem')).toBe(6)
    expect(table.get('toast')).toBe(7)
    expect(table.get('action')).toBe(8)
    expect(table.get('popover')).toBe(17)
    expect(table.get('collapse-group')).toBe(95)
    expect(table.get('datetime')).toBe(70)
    expect(table.get('office-viewer-excel')).toBe(77)
    expect(table.get('app')).toBe(154)
    expect(table.size).toBeGreaterThanOrEqual(154)
  })

  it('looks up nav types case-insensitively', () => {
    expect(lookupPriority(table, 'popOver')).toBe(17)
    expect(lookupPriority(table, 'FormItem')).toBe(6)
  })

  it('maps 全量顺序 ranks onto P0/P1/P2 速览 buckets', () => {
    expect(stageFromRank(1)).toBe(0)
    expect(stageFromRank(10)).toBe(0)
    expect(stageFromRank(11)).toBe(1)
    expect(stageFromRank(65)).toBe(1)
    expect(stageFromRank(66)).toBe(2)
    expect(stageFromRank(154)).toBe(2)
  })

  it('keeps the 侧栏 column in sync with the site P0/P1/P2 buckets', () => {
    const stages = parsePriorityStages(todo)
    expect(stages.size).toBe(table.size)
    for (const [key, rank] of table) {
      expect(stages.get(key), key).toBe(stageFromRank(rank))
    }
  })

  it('parses P0/P1 and leftover #N ranges out of the filter box', () => {
    expect(parseSidebarFilter('P0')).toEqual({ text: '', stage: { min: 0, max: 0 } })
    expect(parseSidebarFilter('p1')).toEqual({ text: '', stage: { min: 1, max: 1 } })
    expect(parseSidebarFilter('P0-P1')).toEqual({ text: '', stage: { min: 0, max: 1 } })
    expect(parseSidebarFilter('form P0')).toEqual({
      text: 'form',
      stage: { min: 0, max: 0 },
    })
    expect(parseSidebarFilter('#8')).toEqual({ text: '', rank: { min: 8, max: 8 } })
    expect(parseSidebarFilter('#1-10')).toEqual({ text: '', rank: { min: 1, max: 10 } })
    expect(parseSidebarFilter('#1–#10')).toEqual({ text: '', rank: { min: 1, max: 10 } })
    expect(parseSidebarFilter('#<=10')).toEqual({ text: '', rank: { min: 1, max: 10 } })
    expect(parseSidebarFilter('form #27')).toEqual({
      text: 'form',
      rank: { min: 27, max: 27 },
    })
    expect(parseSidebarFilter('icon')).toEqual({ text: 'icon' })
  })
})
