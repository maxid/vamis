import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
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
    expect(sidebar).toContain('showDocProgress')
    expect(pref).toContain("DOC_PROGRESS_KEY = 'vamis-doc-progress'")
  })
})
