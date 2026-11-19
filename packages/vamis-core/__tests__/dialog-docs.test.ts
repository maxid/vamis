import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('dialog docs', () => {
  it('covers mapping / drag / form / feedback / event-action chapters', () => {
    const doc = read('../../../website/src/components/dialog.md')
    for (const h of [
      '## 弹框与数据映射',
      '## 动作后关闭弹框',
      '## 拖拽弹框',
      '## 弹框中配置表单',
      '### 提交表单 或 ajax 请求',
      '### 提交表单 或 ajax 请求后不关闭弹框',
      '## feedback 反馈弹框',
      '### 根据条件显示 feedback',
      '## 配置 Esc 键和点击外部关闭弹框',
      '## 属性表',
      '## 事件表',
      '## 动作表',
    ]) expect(doc).toContain(h)
    expect(doc).toContain('实现进度 100% · 已完成')
    expect(doc).toContain('| `draggable` | `boolean` | `false`')
  })
})
