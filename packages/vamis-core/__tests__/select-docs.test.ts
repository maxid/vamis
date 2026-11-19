import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('select docs', () => {
  it('keeps the Amis section order and difference section at the bottom', () => {
    const doc = read('../../../website/src/components/form/select.md')
    const headings = [...doc.matchAll(/^## (.+)$/gm)].map((match) => match[1])
    const deferIndex = headings.indexOf('延时加载')
    expect(headings.slice(deferIndex, deferIndex + 3)).toEqual([
      '延时加载',
      '关联选择模式',
      '限制标签最大展示数量',
    ])
    expect(headings).not.toContain('关联选择 / 人员点选')
    expect(headings.filter((title) => title === '与 Amis 的差异')).toHaveLength(1)
    expect(headings[headings.length - 1]).toBe('与 Amis 的差异')
  })
})
