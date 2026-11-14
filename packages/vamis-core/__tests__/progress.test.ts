import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('progress', () => {
  it('supports circle/dashboard/colors/actions and docs', () => {
    const vue = read('../../vamis/src/renderers/Progress.vue')
    for (const t of ["'circle'", "'dashboard'", 'gapDegree', 'valueTpl', 'threshold', 'showThresholdText', "action?.actionType === 'reset'", "'setValue'", 'eachResolvedValue', 'vamis-progress__line', 'DEFAULT_MAP']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/progress.md')
    for (const h of ['## 基本用法','## 颜色映射','## 圆形进度条','## 仪表盘进度条','## 设置线条宽度','## 自定义格式输出内容','## 阈值（刻度）','## 属性表','## 动作表']) expect(doc).toContain(h)
  })
})
