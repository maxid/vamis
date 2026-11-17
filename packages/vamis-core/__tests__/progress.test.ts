import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { isProgressBgClass, progressCircleStroke, progressMapColor } from '../src/utils/progress'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('progress', () => {
  it('supports circle/dashboard/colors/actions and docs', () => {
    const vue = read('../../vamis/src/renderers/Progress.vue')
    for (const t of [
      "'circle'",
      "'dashboard'",
      'gapDegree',
      'valueTpl',
      'threshold',
      'showThresholdText',
      "action?.actionType === 'reset'",
      "'setValue'",
      'eachResolvedValue',
      'vamis-progress__line',
      'progressMapColor',
    ])
      expect(vue).toContain(t)
    const doc = read('../../../website/src/components/progress.md')
    for (const h of [
      '## 基本用法',
      '## 颜色映射',
      '## 圆形进度条',
      '## 仪表盘进度条',
      '## 设置线条宽度',
      '## 自定义格式输出内容',
      '## 阈值（刻度）',
      '## 属性表',
      '## 动作表',
    ])
      expect(doc).toContain(h)
  })

  it('getLevelColor buckets match Amis (index+1)*span, not floor', () => {
    const map = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success', 'bg-success']
    expect(progressMapColor(map, 0)).toBe('bg-danger')
    expect(progressMapColor(map, 20)).toBe('bg-danger')
    expect(progressMapColor(map, 21)).toBe('bg-warning')
    expect(progressMapColor(map, 22)).toBe('bg-warning')
    expect(progressMapColor(map, 40)).toBe('bg-warning')
    expect(progressMapColor(map, 41)).toBe('bg-info')
    expect(progressMapColor(map, 60)).toBe('bg-info')
    expect(progressMapColor(map, 61)).toBe('bg-success')
    expect(progressMapColor(map, 72)).toBe('bg-success')
    expect(progressMapColor(map, 80)).toBe('bg-success')
    expect(progressMapColor(map, 81)).toBe('bg-success')
    expect(progressMapColor(map, 85)).toBe('bg-success')
    expect(progressMapColor(map, 100)).toBe('bg-success')
    expect(progressMapColor(undefined, 50)).toBe('bg-info')
    expect(progressMapColor([], 50)).toBe('bg-primary')
    expect(progressMapColor('bg-info', 10)).toBe('bg-info')
    expect(progressMapColor([{ value: 30, color: '#f00' }, { value: 80, color: '#0f0' }], 22)).toBe('#f00')
    expect(progressMapColor([{ value: 30, color: '#f00' }, { value: 80, color: '#0f0' }], 50)).toBe('#0f0')
  })

  it('bg-* is a class on the line bar; circle uses theme stroke', () => {
    expect(isProgressBgClass('bg-warning')).toBe(true)
    expect(isProgressBgClass('#fad733')).toBe(false)
    expect(progressCircleStroke('bg-warning')).toBe('var(--warning)')
    expect(progressCircleStroke('#fad733')).toBe('#fad733')
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('.vamis-progress__bar.bg-warning')
    expect(css).toContain('background: var(--progress-map-warning)')
    expect(css).toContain('.vamis-progress__bar.bg-info')
    expect(css).toContain('.vamis-form-static > .vamis-node:has(.vamis-progress)')
    expect(css).toContain('.vamis-form-static .vamis-progress')
  })
})
