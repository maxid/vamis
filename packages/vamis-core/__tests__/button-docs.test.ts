import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('button docs', () => {
  it('covers disabled/tooltip/icon chapters', () => {
    const doc = read('../../../website/src/components/button.md')
    for (const h of ['## 禁用与提示','## 图标按钮','## 属性表']) expect(doc).toContain(h)
    expect(doc).toContain('rightIcon')
  })
})
