import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('drawer docs', () => {
  it('covers close/actions/resizable chapters', () => {
    const doc = read('../../../website/src/components/drawer.md')
    for (const h of ['## 动作后关闭抽屉','## 配置抽屉的按钮','## 可拖拽抽屉大小','## 属性表']) expect(doc).toContain(h)
  })
})
