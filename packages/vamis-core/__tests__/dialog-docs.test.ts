import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('dialog docs', () => {
  it('covers the Amis mapping / form / feedback / event-action chapter order', () => {
    const doc = read('../../../website/src/components/dialog.md')
    for (const h of [
      '## 弹框与数据映射',
      '## 动作后关闭弹框',
      '## 弹框中配置表单',
      '### 提交表单 或 ajax 请求',
      '### 提交表单 或 ajax 请求后不关闭弹框',
      '## feedback 反馈弹框',
      '### feedback 基本使用',
      '#### 关闭 feedback 弹框时，同时关闭上层弹框',
      '#### 取消 feedback 弹框时，不同时关闭上层弹框',
      '#### 确认 feedback 弹框时，不同时关闭上层弹框',
      '### 根据条件显示 feedback',
      '## 配置 Esc 键和点击外部关闭弹框',
      '## 属性表',
      '## 事件表',
      '## 动作表',
    ]) expect(doc).toContain(h)
    expect(doc).not.toContain('## 拖拽弹框')
    expect(doc).toContain('"tooltip": "点击我后会发送一个请求，请求回来后，弹出一个框。"')
    expect(doc).toContain('"label": "提交表单 Feedback"')
    expect(doc).toContain('"label": "ajax请求 Feedback"')
    expect(doc).toContain('实现进度 100% · 已完成')
    expect(doc).toContain('| `draggable` | `boolean` | `false`')
  })
})
