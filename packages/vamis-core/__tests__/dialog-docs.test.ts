import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('dialog docs', () => {
  it('covers mapping/close/form chapters', () => {
    const doc = read('../../../website/src/components/dialog.md')
    for (const h of ['## 弹框与数据映射','## 动作后关闭弹框','## 弹框中配置表单','## feedback 反馈弹框','## 属性表']) expect(doc).toContain(h)
  })
})
