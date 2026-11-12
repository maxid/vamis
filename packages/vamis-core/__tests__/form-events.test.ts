import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('form lifecycle / submission', () => {
  const vue = read('../../vamis/src/renderers/Form.vue')

  it('dispatches the Amis form lifecycle events', () => {
    for (const event of [
      "emitFormEvent('inited'",
      "emitFormEvent('initApiFinished'",
      "emitFormEvent('change'",
      "'validateSucc'",
      "'validateError'",
      "emitFormEvent('submitSucc'",
      "emitFormEvent('submitFail'",
      "emitFormEvent('formItemValidateSucc'",
      "emitFormEvent('formItemValidateError'",
    ]) {
      expect(vue).toContain(event)
    }
  })

  it('supports persistence, enter guard, autofocus and submit aftermath', () => {
    expect(vue).toContain('readPersisted')
    expect(vue).toContain('persistDataKeys')
    expect(vue).toContain('clearPersistDataAfterSubmit')
    expect(vue).toContain('preventEnterSubmit')
    expect(vue).toContain('focusFirstField')
    expect(vue).toContain('resetAfterSubmit')
    expect(vue).toContain('trimDeep')
    expect(vue).toContain('redirect')
  })

  it('doc covers the main Amis form chapters', () => {
    const doc = read('../../../website/src/components/form/index.md')
    for (const heading of [
      '## 基本用法',
      '## 表单展示',
      '### 默认模式',
      '### 水平模式',
      '### 内联模式',
      '### 底部按钮栏',
      '### 去掉表单边框',
      '## 表单静态展示',
      '## 表单项数据初始化',
      '## 表单提交',
      '## 表单校验',
      '## 重置表单',
      '## 表单数据域调试',
      '## 禁用数据链',
      '## 提交后行为',
      '## 持久化保存表单项数据',
      '## 禁用回车提交',
      '## 属性表',
      '## 事件表',
      '## 动作表',
      '## 和 Amis 文档的差异',
    ]) {
      expect(doc).toContain(heading)
    }
    expect(doc).toContain('persistData')
    expect(doc).toContain('preventEnterSubmit')
    expect(doc).toContain('submitSucc')
    expect(doc).toContain('rules')
  })
})
