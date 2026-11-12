import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('card docs', () => {
  it('covers tag/button/text/cell chapters', () => {
    const doc = read('../../../website/src/components/card.md')
    for (const h of ['## 设置标签卡片','## 设置按钮卡片','## 设置文本卡片','## 设置单元格卡片','## 常用属性']) expect(doc).toContain(h)
  })
})
